// API endpoints for StackStudio Organizer tasks
// Handles CRUD operations for individual tasks

import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const auth = getAuth();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    switch (req.method) {
      case 'GET':
        return await handleGetTasks(req, res, userId);
      case 'POST':
        return await handleCreateTask(req, res, userId);
      case 'PUT':
        return await handleUpdateTask(req, res, userId);
      case 'DELETE':
        return await handleDeleteTask(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Organizer tasks API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get tasks for a board
async function handleGetTasks(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { boardId } = req.query;
    
    if (!boardId || typeof boardId !== 'string') {
      return res.status(400).json({ error: 'boardId is required' });
    }

    // Verify user owns the board
    const boardDoc = await db.collection('organizer_boards').doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to access this board' });
    }

    const tasksRef = db.collection('organizer_tasks');
    const snapshot = await tasksRef.where('boardId', '==', boardId).get();
    
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

// Create a new task
async function handleCreateTask(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { 
      boardId, 
      columnId, 
      content, 
      category, 
      priority, 
      estimatedHours, 
      toolName, 
      dependencies, 
      tags 
    } = req.body;
    
    if (!boardId || !columnId || !content) {
      return res.status(400).json({ error: 'boardId, columnId, and content are required' });
    }

    // Verify user owns the board
    const boardDoc = await db.collection('organizer_boards').doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to create task on this board' });
    }

    const now = new Date();
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const taskDoc = {
      taskId,
      boardId,
      columnId,
      content,
      category: category || 'General',
      priority: priority || 'Medium',
      estimatedHours: estimatedHours || 4,
      toolName: toolName || 'General',
      dependencies: dependencies || [],
      tags: tags || [],
      createdAt: now,
      updatedAt: now
    };

    const taskRef = await db.collection('organizer_tasks').add(taskDoc);

    // Update column with new task
    await updateColumnTasks(columnId, boardId, taskId, 'add');

    return res.status(201).json({ 
      message: 'Task created successfully', 
      taskId,
      task: { id: taskRef.id, ...taskDoc }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
}

// Update an existing task
async function handleUpdateTask(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { taskId, columnId, content, category, priority, estimatedHours, toolName, dependencies, tags, completedAt } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }

    // Find the task
    const tasksSnapshot = await db.collection('organizer_tasks')
      .where('taskId', '==', taskId)
      .limit(1)
      .get();

    if (tasksSnapshot.empty) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskDoc = tasksSnapshot.docs[0];
    const taskData = taskDoc.data();
    const boardId = taskData.boardId;

    // Verify user owns the board
    const boardDoc = await db.collection('organizer_boards').doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this task' });
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    // Handle column change (drag and drop)
    if (columnId !== undefined && columnId !== taskData.columnId) {
      const oldColumnId = taskData.columnId;
      
      // Remove from old column
      await updateColumnTasks(oldColumnId, boardId, taskId, 'remove');
      
      // Add to new column
      await updateColumnTasks(columnId, boardId, taskId, 'add');
      
      updateData.columnId = columnId;
    }

    // Update other fields
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (toolName !== undefined) updateData.toolName = toolName;
    if (dependencies !== undefined) updateData.dependencies = dependencies;
    if (tags !== undefined) updateData.tags = tags;
    if (completedAt !== undefined) updateData.completedAt = completedAt;

    await taskDoc.ref.update(updateData);

    return res.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
}

// Delete a task
async function handleDeleteTask(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { taskId } = req.query;
    
    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({ error: 'taskId is required' });
    }

    // Find the task
    const tasksSnapshot = await db.collection('organizer_tasks')
      .where('taskId', '==', taskId)
      .limit(1)
      .get();

    if (tasksSnapshot.empty) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const taskDoc = tasksSnapshot.docs[0];
    const taskData = taskDoc.data();
    const boardId = taskData.boardId;

    // Verify user owns the board
    const boardDoc = await db.collection('organizer_boards').doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this task' });
    }

    // Remove from column
    await updateColumnTasks(taskData.columnId, boardId, taskId, 'remove');

    // Delete the task
    await taskDoc.ref.delete();

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
}

// Helper function to update column task lists
async function updateColumnTasks(columnId: string, boardId: string, taskId: string, action: 'add' | 'remove') {
  try {
    const columnsSnapshot = await db.collection('organizer_columns')
      .where('columnId', '==', columnId)
      .where('boardId', '==', boardId)
      .limit(1)
      .get();

    if (!columnsSnapshot.empty) {
      const columnDoc = columnsSnapshot.docs[0];
      const columnData = columnDoc.data();
      const currentTaskIds = columnData.taskIds || [];

      let updatedTaskIds;
      if (action === 'add') {
        if (!currentTaskIds.includes(taskId)) {
          updatedTaskIds = [...currentTaskIds, taskId];
        } else {
          updatedTaskIds = currentTaskIds;
        }
      } else {
        updatedTaskIds = currentTaskIds.filter((id: string) => id !== taskId);
      }

      await columnDoc.ref.update({
        taskIds: updatedTaskIds
      });
    }
  } catch (error) {
    console.error('Error updating column tasks:', error);
    throw error;
  }
}

// Bulk update tasks (for reordering)
export async function handleBulkUpdateTasks(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { boardId, updates } = req.body;
    
    if (!boardId || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'boardId and updates array are required' });
    }

    // Verify user owns the board
    const boardDoc = await db.collection('organizer_boards').doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update tasks on this board' });
    }

    const batch = db.batch();
    const now = new Date();

    for (const update of updates) {
      const { taskId, columnId, position } = update;
      
      // Find the task
      const tasksSnapshot = await db.collection('organizer_tasks')
        .where('taskId', '==', taskId)
        .limit(1)
        .get();

      if (!tasksSnapshot.empty) {
        const taskDoc = tasksSnapshot.docs[0];
        batch.update(taskDoc.ref, {
          columnId,
          position: position || 0,
          updatedAt: now
        });
      }
    }

    await batch.commit();

    return res.status(200).json({ message: 'Tasks updated successfully' });
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    return res.status(500).json({ error: 'Failed to update tasks' });
  }
}
