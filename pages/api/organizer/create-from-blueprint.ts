// API endpoint for creating organizer boards from blueprints
// This endpoint handles the "Export to Organizer" functionality

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
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { blueprintData, projectName } = req.body;
    
    if (!blueprintData || !projectName) {
      return res.status(400).json({ error: 'blueprintData and projectName are required' });
    }

    // Generate a unique board ID
    const boardId = `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Check if board already exists for this project
    const existingBoard = await db.collection('organizer_boards')
      .where('userId', '==', userId)
      .where('projectName', '==', projectName)
      .limit(1)
      .get();

    if (!existingBoard.empty) {
      return res.status(409).json({ 
        error: 'Board already exists for this project',
        existingBoardId: existingBoard.docs[0].data().boardId
      });
    }

    // Create the board and all its components
    const result = await createBoardFromBlueprint(boardId, userId, projectName, blueprintData);

    return res.status(201).json({
      message: 'Board created successfully from blueprint',
      boardId,
      summary: result
    });

  } catch (error) {
    console.error('Create organizer from blueprint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createBoardFromBlueprint(
  boardId: string, 
  userId: string, 
  projectName: string, 
  blueprintData: any
) {
  const batch = db.batch();
  const now = new Date();

  // Create default columns with more specific categories
  const defaultColumns = [
    { id: 'col-1-planning', title: 'Planning & Research', color: 'blue', position: 0 },
    { id: 'col-2-setup', title: 'Setup & Configuration', color: 'purple', position: 1 },
    { id: 'col-3-development', title: 'Development', color: 'yellow', position: 2 },
    { id: 'col-4-testing', title: 'Testing & Review', color: 'orange', position: 3 },
    { id: 'col-5-deployment', title: 'Deployment', color: 'green', position: 4 },
    { id: 'col-6-done', title: 'Done', color: 'gray', position: 5 }
  ];

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

  // Generate tasks from blueprint
  const tasks = generateTasksFromBlueprint(blueprintData, boardId);
  
  // Add tasks to batch
  for (const task of tasks) {
    batch.set(db.collection('organizer_tasks').doc(), task);
  }

  // Commit all changes
  await batch.commit();

  const uniqueCategories = Array.from(new Set(tasks.map(t => t.category)));
  
  return {
    tasksCreated: tasks.length,
    columnsCreated: defaultColumns.length,
    categories: uniqueCategories
  };
}

function generateTasksFromBlueprint(blueprintData: any, boardId: string) {
  const tasks = [];
  const now = new Date();

  // 1. Planning & Research Tasks
  tasks.push({
    taskId: `task-${Date.now()}-research`,
    boardId,
    columnId: 'col-1-planning',
    content: 'Research project requirements and create detailed specifications',
    category: 'Planning',
    priority: 'High',
    estimatedHours: 4,
    toolName: 'General',
    dependencies: [],
    tags: ['research', 'planning'],
    createdAt: now,
    updatedAt: now
  });

  tasks.push({
    taskId: `task-${Date.now()}-architecture`,
    boardId,
    columnId: 'col-1-planning',
    content: 'Design system architecture and data flow diagrams',
    category: 'Architecture',
    priority: 'High',
    estimatedHours: 6,
    toolName: 'General',
    dependencies: [],
    tags: ['architecture', 'design'],
    createdAt: now,
    updatedAt: now
  });

  // 2. Setup & Configuration Tasks
  tasks.push({
    taskId: `task-${Date.now()}-init`,
    boardId,
    columnId: 'col-2-setup',
    content: 'Initialize project structure and version control',
    category: 'Setup',
    priority: 'High',
    estimatedHours: 2,
    toolName: 'Git',
    dependencies: [],
    tags: ['setup', 'git', 'initialization'],
    createdAt: now,
    updatedAt: now
  });

  tasks.push({
    taskId: `task-${Date.now()}-env`,
    boardId,
    columnId: 'col-2-setup',
    content: 'Configure development environment and dependencies',
    category: 'Configuration',
    priority: 'High',
    estimatedHours: 3,
    toolName: 'General',
    dependencies: [],
    tags: ['environment', 'config'],
    createdAt: now,
    updatedAt: now
  });

  // 3. Generate tasks from recommended stack
  if (blueprintData.recommendedStack) {
    for (const tool of blueprintData.recommendedStack) {
      const taskId = `task-${Date.now()}-${tool.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const category = tool.category || 'Development';
      const priority = tool.compatibilityScore > 0.8 ? 'High' : 
                      tool.compatibilityScore > 0.6 ? 'Medium' : 'Low';
      
      // Determine which column based on category
      let columnId = 'col-3-development'; // Default to development
      
      if (category.includes('Database') || category.includes('Authentication')) {
        columnId = 'col-2-setup';
      } else if (category.includes('Deployment') || category.includes('Hosting')) {
        columnId = 'col-5-deployment';
      } else if (category.includes('Testing') || category.includes('Monitor')) {
        columnId = 'col-4-testing';
      }

      const task = {
        taskId,
        boardId,
        columnId,
        content: `Implement and configure ${tool.name} for ${category}`,
        category,
        priority,
        estimatedHours: getEstimatedHours(category),
        toolName: tool.name,
        dependencies: getDependencies(tool, blueprintData.recommendedStack),
        tags: [
          tool.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          category.toLowerCase().replace(/[^a-z0-9]/g, '-')
        ],
        createdAt: now,
        updatedAt: now
      };

      tasks.push(task);
    }
  }

  // 4. Testing Tasks
  tasks.push({
    taskId: `task-${Date.now()}-unit-tests`,
    boardId,
    columnId: 'col-4-testing',
    content: 'Write unit tests for core functionality',
    category: 'Testing',
    priority: 'Medium',
    estimatedHours: 8,
    toolName: 'Testing Framework',
    dependencies: [],
    tags: ['testing', 'unit-tests'],
    createdAt: now,
    updatedAt: now
  });

  tasks.push({
    taskId: `task-${Date.now()}-integration-tests`,
    boardId,
    columnId: 'col-4-testing',
    content: 'Create integration tests for API endpoints',
    category: 'Testing',
    priority: 'Medium',
    estimatedHours: 6,
    toolName: 'Testing Framework',
    dependencies: [],
    tags: ['testing', 'integration-tests'],
    createdAt: now,
    updatedAt: now
  });

  // 5. Deployment Tasks
  tasks.push({
    taskId: `task-${Date.now()}-deployment-setup`,
    boardId,
    columnId: 'col-5-deployment',
    content: 'Set up deployment pipeline and CI/CD',
    category: 'Deployment',
    priority: 'Medium',
    estimatedHours: 4,
    toolName: 'CI/CD',
    dependencies: [],
    tags: ['deployment', 'ci-cd'],
    createdAt: now,
    updatedAt: now
  });

  tasks.push({
    taskId: `task-${Date.now()}-production-deploy`,
    boardId,
    columnId: 'col-5-deployment',
    content: 'Deploy to production environment',
    category: 'Deployment',
    priority: 'High',
    estimatedHours: 2,
    toolName: 'Deployment Platform',
    dependencies: [],
    tags: ['deployment', 'production'],
    createdAt: now,
    updatedAt: now
  });

  // 6. Add specific tasks based on blueprint warnings
  if (blueprintData.warnings && blueprintData.warnings.length > 0) {
    for (const warning of blueprintData.warnings) {
      const taskId = `task-${Date.now()}-warning-${Math.random().toString(36).substr(2, 5)}`;
      
      tasks.push({
        taskId,
        boardId,
        columnId: 'col-1-planning',
        content: `Address ${warning.type}: ${warning.message}`,
        category: 'Risk Management',
        priority: 'High',
        estimatedHours: 3,
        toolName: 'General',
        dependencies: [],
        tags: ['warning', 'risk', warning.type.toLowerCase().replace(/[^a-z0-9]/g, '-')],
        createdAt: now,
        updatedAt: now
      });
    }
  }

  return tasks;
}

function getEstimatedHours(category: string): number {
  const estimates: { [key: string]: number } = {
    'Frontend Framework': 12,
    'Backend Framework': 15,
    'Database': 8,
    'Authentication': 6,
    'Deployment Platform': 4,
    'AI/ML API': 8,
    'Payment Processing': 10,
    'Email Service': 3,
    'Cloud Storage': 4,
    'Monitoring': 3,
    'Testing': 6,
    'Code Generation': 2,
    'Design Tool': 4,
    'Project Management': 2,
    'Communication': 2,
    'Planning': 4,
    'Architecture': 6,
    'Setup': 3,
    'Configuration': 4,
    'Risk Management': 3
  };

  return estimates[category] || 5;
}

function getDependencies(tool: any, allTools: any[]): string[] {
  const dependencies = [];
  const toolName = tool.name.toLowerCase();

  // Define common dependencies
  if (toolName.includes('react') || toolName.includes('vue') || toolName.includes('angular')) {
    dependencies.push('project-structure');
  }

  if (toolName.includes('database') || toolName.includes('postgres') || toolName.includes('mongodb')) {
    dependencies.push('architecture-design');
  }

  if (toolName.includes('auth') || toolName.includes('authentication')) {
    dependencies.push('database-setup');
  }

  if (toolName.includes('deploy') || toolName.includes('hosting')) {
    dependencies.push('testing-complete');
  }

  return dependencies;
}
