// API endpoints for StackStudio Organizer boards
// Handles CRUD operations for Kanban boards

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
        return await handleGetBoards(req, res, userId);
      case 'POST':
        return await handleCreateBoard(req, res, userId);
      case 'PUT':
        return await handleUpdateBoard(req, res, userId);
      case 'DELETE':
        return await handleDeleteBoard(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Organizer boards API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all boards for a user
async function handleGetBoards(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const boardsRef = db.collection('organizer_boards');
    const snapshot = await boardsRef.where('userId', '==', userId).get();
    
    const boards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return res.status(500).json({ error: 'Failed to fetch boards' });
  }
}

// Create a new board
async function handleCreateBoard(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { boardId, projectName, blueprintData } = req.body;
    
    if (!boardId || !projectName) {
      return res.status(400).json({ error: 'boardId and projectName are required' });
    }

    // Check if board already exists
    const existingBoard = await db.collection('organizer_boards').doc(boardId).get();
    if (existingBoard.exists) {
      return res.status(409).json({ error: 'Board already exists' });
    }

    // Create default columns
    const defaultColumns = [
      { id: 'col-1-todo', title: 'To Do', color: 'blue', position: 0 },
      { id: 'col-2-inprogress', title: 'In Progress', color: 'yellow', position: 1 },
      { id: 'col-3-review', title: 'Review', color: 'purple', position: 2 },
      { id: 'col-4-done', title: 'Done', color: 'green', position: 3 }
    ];

    const batch = db.batch();
    const now = new Date();

    // Create board document
    const boardDoc = {
      boardId,
      userId,
      projectName,
      columnOrder: defaultColumns.map(col => col.id),
      createdAt: now,
      updatedAt: now,
      isActive: true
    };

    batch.set(db.collection('organizer_boards').doc(boardId), boardDoc);

    // Create columns
    for (const column of defaultColumns) {
      const columnDoc = {
        columnId: column.id,
        boardId,
        title: column.title,
        taskIds: [],
        color: column.color,
        position: column.position,
        createdAt: now
      };
      batch.set(db.collection('organizer_columns').doc(), columnDoc);
    }

    // If blueprint data is provided, generate tasks
    if (blueprintData) {
      const tasks = await generateTasksFromBlueprint(blueprintData, boardId, userId);
      for (const task of tasks) {
        batch.set(db.collection('organizer_tasks').doc(), task);
      }
    }

    await batch.commit();

    return res.status(201).json({ 
      message: 'Board created successfully', 
      boardId,
      board: boardDoc
    });
  } catch (error) {
    console.error('Error creating board:', error);
    return res.status(500).json({ error: 'Failed to create board' });
  }
}

// Update an existing board
async function handleUpdateBoard(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { boardId, projectName, columnOrder, isActive } = req.body;
    
    if (!boardId) {
      return res.status(400).json({ error: 'boardId is required' });
    }

    const boardRef = db.collection('organizer_boards').doc(boardId);
    const boardDoc = await boardRef.get();
    
    if (!boardDoc.exists) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (boardDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this board' });
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (projectName !== undefined) updateData.projectName = projectName;
    if (columnOrder !== undefined) updateData.columnOrder = columnOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    await boardRef.update(updateData);

    return res.status(200).json({ message: 'Board updated successfully' });
  } catch (error) {
    console.error('Error updating board:', error);
    return res.status(500).json({ error: 'Failed to update board' });
  }
}

// Delete a board
async function handleDeleteBoard(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { boardId } = req.query;
    
    if (!boardId || typeof boardId !== 'string') {
      return res.status(400).json({ error: 'boardId is required' });
    }

    const boardRef = db.collection('organizer_boards').doc(boardId);
    const boardDoc = await boardRef.get();
    
    if (!boardDoc.exists) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (boardDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this board' });
    }

    // Delete board, columns, and tasks in a batch
    const batch = db.batch();
    
    // Delete board
    batch.delete(boardRef);
    
    // Delete columns
    const columnsSnapshot = await db.collection('organizer_columns')
      .where('boardId', '==', boardId)
      .get();
    
    columnsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete tasks
    const tasksSnapshot = await db.collection('organizer_tasks')
      .where('boardId', '==', boardId)
      .get();
    
    tasksSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return res.status(200).json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    return res.status(500).json({ error: 'Failed to delete board' });
  }
}

// Generate tasks from blueprint data
async function generateTasksFromBlueprint(blueprintData: any, boardId: string, userId: string) {
  const tasks = [];
  const now = new Date();

  // Task generation logic based on blueprint recommendations
  for (const tool of blueprintData.recommendedStack || []) {
    const taskContent = `Set up ${tool.name} for ${tool.category}`;
    const priority = tool.compatibilityScore > 0.8 ? 'High' : 
                    tool.compatibilityScore > 0.6 ? 'Medium' : 'Low';
    
    const task = {
      taskId: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      boardId,
      columnId: 'col-1-todo', // Default to "To Do" column
      content: taskContent,
      category: tool.category,
      priority,
      estimatedHours: getEstimatedHours(tool.category),
      toolName: tool.name,
      dependencies: [],
      tags: [tool.category.toLowerCase().replace(/\s+/g, '-')],
      createdAt: now,
      updatedAt: now
    };

    tasks.push(task);
  }

  // Add general setup tasks
  const generalTasks = [
    {
      taskId: `task-${Date.now()}-setup`,
      boardId,
      columnId: 'col-1-todo',
      content: 'Initialize project structure',
      category: 'Setup',
      priority: 'High' as const,
      estimatedHours: 2,
      toolName: 'General',
      dependencies: [],
      tags: ['setup', 'initialization'],
      createdAt: now,
      updatedAt: now
    },
    {
      taskId: `task-${Date.now()}-config`,
      boardId,
      columnId: 'col-1-todo',
      content: 'Configure development environment',
      category: 'Configuration',
      priority: 'High' as const,
      estimatedHours: 3,
      toolName: 'General',
      dependencies: [],
      tags: ['config', 'environment'],
      createdAt: now,
      updatedAt: now
    }
  ];

  tasks.push(...generalTasks);
  return tasks;
}

// Estimate hours based on tool category
function getEstimatedHours(category: string): number {
  const estimates: { [key: string]: number } = {
    'Frontend Framework': 8,
    'Backend Framework': 10,
    'Database': 6,
    'Authentication': 4,
    'Deployment Platform': 3,
    'AI/ML API': 5,
    'Payment Processing': 6,
    'Email Service': 2,
    'Cloud Storage': 3,
    'Monitoring': 2,
    'Testing': 4,
    'Code Generation': 1,
    'Design Tool': 2,
    'Project Management': 1,
    'Communication': 1
  };

  return estimates[category] || 4;
}
