/*
 * API Route: /api/organizer/create-from-blueprint.ts
 *
 * This powerful endpoint takes a blueprintId and automatically generates a complete
 * Kanban board in the StackStudio Organizer, pre-populated with actionable tasks
 * based on the recommended technology stack.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
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

// Helper to generate a unique ID for tasks and columns
const generateId = (prefix = 'task') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to create default tasks based on tool category
const generateTasksForTool = (tool: any) => {
  const tasks = [];
  const baseContent = `Set up and configure ${tool.name}`;

  switch (tool.category) {
    case 'Database':
      tasks.push({ 
        content: `${baseContent}: Define initial data schema and security rules.`,
        priority: 'High',
        estimatedHours: 4,
        dependencies: []
      });
      break;
    case 'Deployment Platform':
      tasks.push({ 
        content: `${baseContent}: Connect to GitHub repository and configure build settings.`,
        priority: 'High',
        estimatedHours: 3,
        dependencies: []
      });
      break;
    case 'Language Model':
      tasks.push({ 
        content: `${baseContent}: Create API wrapper and handle key management.`,
        priority: 'Medium',
        estimatedHours: 6,
        dependencies: []
      });
      break;
    case 'Frontend':
      tasks.push({ 
        content: `${baseContent}: Initialize project structure and configure routing.`,
        priority: 'High',
        estimatedHours: 8,
        dependencies: []
      });
      break;
    case 'Backend':
      tasks.push({ 
        content: `${baseContent}: Set up API endpoints and middleware.`,
        priority: 'High',
        estimatedHours: 12,
        dependencies: []
      });
      break;
    case 'Testing':
      tasks.push({ 
        content: `${baseContent}: Write unit tests and integration tests.`,
        priority: 'Medium',
        estimatedHours: 10,
        dependencies: []
      });
      break;
    case 'Monitoring':
      tasks.push({ 
        content: `${baseContent}: Set up logging, metrics, and alerting.`,
        priority: 'Low',
        estimatedHours: 4,
        dependencies: []
      });
      break;
    default:
      tasks.push({ 
        content: baseContent,
        priority: 'Medium',
        estimatedHours: 2,
        dependencies: []
      });
  }
  return tasks.map(task => ({ ...task, category: tool.category, toolName: tool.name }));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Authenticate the user and the request method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  
  const userId = session.user.email || 'anonymous';
  const { blueprintId, blueprintData, projectName } = req.body;

  if (!blueprintId && !blueprintData) {
    return res.status(400).json({ error: "blueprintId or blueprintData is required." });
  }

  try {
    let blueprint: any;
    
    // 2. Fetch the blueprint if blueprintId is provided
    if (blueprintId) {
      const blueprintRef = db.collection('blueprints').doc(blueprintId);
      const blueprintDoc = await blueprintRef.get();

      if (!blueprintDoc.exists || blueprintDoc.data()?.userId !== userId) {
        return res.status(404).json({ error: "Blueprint not found or access denied." });
      }
      blueprint = blueprintDoc.data();
    } else {
      // Use blueprintData directly for inline creation
      blueprint = { blueprintData, projectName };
    }

    // 3. Use a Firestore Batch Write for an atomic operation
    const batch = db.batch();

    // 4. Define the new Board, Columns, and Tasks
    const boardId = blueprintId || `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Check if board already exists
    const existingBoardRef = db.collection('organizer_boards').doc(boardId);
    const existingBoard = await existingBoardRef.get();
    
    if (existingBoard.exists) {
      return res.status(409).json({ 
        error: "Board already exists for this blueprint",
        boardId: boardId
      });
    }

    // Create Columns
    const todoColId = generateId('col');
    const inProgressColId = generateId('col');
    const reviewColId = generateId('col');
    const doneColId = generateId('col');

    // Generate Tasks from the blueprint's recommended stack
    const recommendedStack = blueprint?.blueprintData?.recommendedStack || [];
    const initialTasks = recommendedStack.flatMap(generateTasksForTool);
    const taskIds = [];
    
    // Create task documents
    for (const taskData of initialTasks) {
      const taskId = generateId('task');
      taskIds.push(taskId);
      const taskRef = db.collection('organizer_tasks').doc(taskId);
      batch.set(taskRef, {
        taskId,
        boardId,
        columnId: todoColId,
        content: taskData.content,
        category: taskData.category,
        priority: taskData.priority,
        estimatedHours: taskData.estimatedHours,
        toolName: taskData.toolName,
        dependencies: taskData.dependencies,
        tags: [taskData.category.toLowerCase()],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // Set Column Documents
    const todoColRef = db.collection('organizer_columns').doc(todoColId);
    batch.set(todoColRef, { 
      columnId: todoColId, 
      boardId, 
      title: "To Do", 
      taskIds,
      color: "#3B82F6",
      position: 0,
      createdAt: FieldValue.serverTimestamp()
    });

    const inProgressColRef = db.collection('organizer_columns').doc(inProgressColId);
    batch.set(inProgressColRef, { 
      columnId: inProgressColId, 
      boardId, 
      title: "In Progress", 
      taskIds: [],
      color: "#F59E0B",
      position: 1,
      createdAt: FieldValue.serverTimestamp()
    });
    
    const reviewColRef = db.collection('organizer_columns').doc(reviewColId);
    batch.set(reviewColRef, { 
      columnId: reviewColId, 
      boardId, 
      title: "Review", 
      taskIds: [],
      color: "#8B5CF6",
      position: 2,
      createdAt: FieldValue.serverTimestamp()
    });
    
    const doneColRef = db.collection('organizer_columns').doc(doneColId);
    batch.set(doneColRef, { 
      columnId: doneColId, 
      boardId, 
      title: "Done", 
      taskIds: [],
      color: "#10B981",
      position: 3,
      createdAt: FieldValue.serverTimestamp()
    });

    // Set the main Board Document
    const boardRef = db.collection('organizer_boards').doc(boardId);
    batch.set(boardRef, {
      boardId,
      userId,
      projectName: blueprint?.projectName || projectName,
      title: blueprint?.projectName || projectName,
      description: blueprint?.projectIdea || "Generated from StackStudio blueprint",
      columnOrder: [todoColId, inProgressColId, reviewColId, doneColId],
      isActive: true,
      blueprint_id: blueprintId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 5. Commit the batch to the database
    await batch.commit();

    // 6. Send success response
    res.status(201).json({ 
      message: "Organizer board created successfully!", 
      boardId: boardId,
      summary: {
        tasksCreated: initialTasks.length,
        columnsCreated: 4,
        toolsProcessed: recommendedStack.length
      }
    });

  } catch (error) {
    console.error("Organizer creation failed:", error);
    res.status(500).json({ error: "Failed to create Organizer board." });
  }
}
