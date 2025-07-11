// API endpoints for StackStudio Organizer columns
// Handles CRUD operations for board columns

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
        return await handleGetColumns(req, res, userId);
      case 'POST':
        return await handleCreateColumn(req, res, userId);
      case 'PUT':
        return await handleUpdateColumn(req, res, userId);
      case 'DELETE':
        return await handleDeleteColumn(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Organizer columns API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get columns for a board
async function handleGetColumns(req: NextApiRequest, res: NextApiResponse, userId: string) {
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

    const columnsRef = db.collection('organizer_columns');
    const snapshot = await columnsRef
      .where('boardId', '==', boardId)
      .orderBy('position', 'asc')
      .get();
    
    const columns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ columns });
  } catch (error) {
    console.error('Error fetching columns:', error);
    return res.status(500).json({ error: 'Failed to fetch columns' });
  }
}

// Create a new column
async function handleCreateColumn(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { boardId, title, color, position } = req.body;
    
    if (!boardId || !title) {
      return res.status(400).json({ error: 'boardId and title are required' });
    }

    // Verify user owns the board
    const boardDoc = await db.collection('organizer_boards').doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to create column on this board' });
    }

    const now = new Date();
    const columnId = `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get current column count to set position
    const existingColumns = await db.collection('organizer_columns')
      .where('boardId', '==', boardId)
      .get();
    
    const columnPosition = position !== undefined ? position : existingColumns.size;

    const columnDoc = {
      columnId,
      boardId,
      title,
      taskIds: [],
      color: color || 'gray',
      position: columnPosition,
      createdAt: now
    };

    const columnRef = await db.collection('organizer_columns').add(columnDoc);

    // Update board's column order
    const boardData = boardDoc.data();
    const currentColumnOrder = boardData?.columnOrder || [];
    const newColumnOrder = [...currentColumnOrder, columnId];

    await db.collection('organizer_boards').doc(boardId).update({
      columnOrder: newColumnOrder,
      updatedAt: now
    });

    return res.status(201).json({ 
      message: 'Column created successfully', 
      columnId,
      column: { id: columnRef.id, ...columnDoc }
    });
  } catch (error) {
    console.error('Error creating column:', error);
    return res.status(500).json({ error: 'Failed to create column' });
  }
}

// Update an existing column
async function handleUpdateColumn(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { columnId, title, color, position, taskIds } = req.body;
    
    if (!columnId) {
      return res.status(400).json({ error: 'columnId is required' });
    }

    // Find the column
    const columnsSnapshot = await db.collection('organizer_columns')
      .where('columnId', '==', columnId)
      .limit(1)
      .get();

    if (columnsSnapshot.empty) {
      return res.status(404).json({ error: 'Column not found' });
    }

    const columnDoc = columnsSnapshot.docs[0];
    const columnData = columnDoc.data();
    const boardId = columnData.boardId;

    // Verify user owns the board
    const boardDoc = await db.collection('organizer_boards').doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this column' });
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (color !== undefined) updateData.color = color;
    if (position !== undefined) updateData.position = position;
    if (taskIds !== undefined) updateData.taskIds = taskIds;

    await columnDoc.ref.update(updateData);

    return res.status(200).json({ message: 'Column updated successfully' });
  } catch (error) {
    console.error('Error updating column:', error);
    return res.status(500).json({ error: 'Failed to update column' });
  }
}

// Delete a column
async function handleDeleteColumn(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { columnId } = req.query;
    
    if (!columnId || typeof columnId !== 'string') {
      return res.status(400).json({ error: 'columnId is required' });
    }

    // Find the column
    const columnsSnapshot = await db.collection('organizer_columns')
      .where('columnId', '==', columnId)
      .limit(1)
      .get();

    if (columnsSnapshot.empty) {
      return res.status(404).json({ error: 'Column not found' });
    }

    const columnDoc = columnsSnapshot.docs[0];
    const columnData = columnDoc.data();
    const boardId = columnData.boardId;

    // Verify user owns the board
    const boardDoc = await db.collection('organizer_boards').doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this column' });
    }

    // Check if column has tasks
    const tasksInColumn = columnData.taskIds || [];
    if (tasksInColumn.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete column with tasks. Please move or delete all tasks first.' 
      });
    }

    // Remove column from board's column order
    const boardData = boardDoc.data();
    const currentColumnOrder = boardData?.columnOrder || [];
    const newColumnOrder = currentColumnOrder.filter((id: string) => id !== columnId);

    const batch = db.batch();
    
    // Update board
    batch.update(db.collection('organizer_boards').doc(boardId), {
      columnOrder: newColumnOrder,
      updatedAt: new Date()
    });

    // Delete column
    batch.delete(columnDoc.ref);

    await batch.commit();

    return res.status(200).json({ message: 'Column deleted successfully' });
  } catch (error) {
    console.error('Error deleting column:', error);
    return res.status(500).json({ error: 'Failed to delete column' });
  }
}

// Reorder columns
export async function handleReorderColumns(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { boardId, columnOrder } = req.body;
    
    if (!boardId || !Array.isArray(columnOrder)) {
      return res.status(400).json({ error: 'boardId and columnOrder array are required' });
    }

    // Verify user owns the board
    const boardDoc = await db.collection('organizer_boards').doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to reorder columns on this board' });
    }

    const batch = db.batch();
    const now = new Date();

    // Update board's column order
    batch.update(db.collection('organizer_boards').doc(boardId), {
      columnOrder,
      updatedAt: now
    });

    // Update position for each column
    for (let i = 0; i < columnOrder.length; i++) {
      const columnId = columnOrder[i];
      const columnsSnapshot = await db.collection('organizer_columns')
        .where('columnId', '==', columnId)
        .where('boardId', '==', boardId)
        .limit(1)
        .get();

      if (!columnsSnapshot.empty) {
        const columnDoc = columnsSnapshot.docs[0];
        batch.update(columnDoc.ref, {
          position: i
        });
      }
    }

    await batch.commit();

    return res.status(200).json({ message: 'Columns reordered successfully' });
  } catch (error) {
    console.error('Error reordering columns:', error);
    return res.status(500).json({ error: 'Failed to reorder columns' });
  }
}
