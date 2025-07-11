// StackStudio Organizer Service - Firebase operations
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  DocumentData,
  QuerySnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Types
export interface Task {
  id: string;
  taskId: string;
  boardId: string;
  columnId: string;
  content: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  toolName: string;
  dependencies: string[];
  tags: string[];
  createdAt: any;
  updatedAt: any;
  completedAt?: any;
}

export interface Column {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  taskIds: string[];
  color: string;
  position: number;
  createdAt: any;
}

export interface Board {
  id: string;
  boardId: string;
  userId: string;
  projectName: string;
  title: string;
  description: string;
  columnOrder: string[];
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
}

export class OrganizerService {
  // Collections
  private boardsCollection = collection(db, 'organizer_boards');
  private columnsCollection = collection(db, 'organizer_columns');
  private tasksCollection = collection(db, 'organizer_tasks');

  // Get all boards for a user
  async getBoards(userId: string): Promise<Board[]> {
    const q = query(
      this.boardsCollection,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Board));
  }

  // Get columns for a board
  async getColumns(boardId: string): Promise<Column[]> {
    const q = query(
      this.columnsCollection,
      where('boardId', '==', boardId),
      orderBy('position', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Column));
  }

  // Get tasks for a board
  async getTasks(boardId: string): Promise<Task[]> {
    const q = query(
      this.tasksCollection,
      where('boardId', '==', boardId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  }

  // Real-time listeners
  subscribeToBoard(boardId: string, callback: (board: Board | null) => void): Unsubscribe {
    const q = query(this.boardsCollection, where('boardId', '==', boardId));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        callback({ id: doc.id, ...doc.data() } as Board);
      } else {
        callback(null);
      }
    });
  }

  subscribeToColumns(boardId: string, callback: (columns: Column[]) => void): Unsubscribe {
    const q = query(
      this.columnsCollection,
      where('boardId', '==', boardId),
      orderBy('position', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const columns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Column));
      callback(columns);
    });
  }

  subscribeToTasks(boardId: string, callback: (tasks: Task[]) => void): Unsubscribe {
    const q = query(
      this.tasksCollection,
      where('boardId', '==', boardId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      callback(tasks);
    });
  }

  // Create operations
  async createBoard(boardData: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.boardsCollection, {
      ...boardData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async createColumn(columnData: Omit<Column, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(this.columnsCollection, {
      ...columnData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.tasksCollection, {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  // Update operations
  async updateBoard(boardId: string, updates: Partial<Board>): Promise<void> {
    const q = query(this.boardsCollection, where('boardId', '==', boardId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docRef = doc(this.boardsCollection, snapshot.docs[0].id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    }
  }

  async updateColumn(columnId: string, updates: Partial<Column>): Promise<void> {
    const q = query(this.columnsCollection, where('columnId', '==', columnId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docRef = doc(this.columnsCollection, snapshot.docs[0].id);
      await updateDoc(docRef, updates);
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const q = query(this.tasksCollection, where('taskId', '==', taskId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docRef = doc(this.tasksCollection, snapshot.docs[0].id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    }
  }

  // Move task between columns
  async moveTask(taskId: string, fromColumnId: string, toColumnId: string, newPosition?: number): Promise<void> {
    const batch = writeBatch(db);

    // Update task's column
    const taskQuery = query(this.tasksCollection, where('taskId', '==', taskId));
    const taskSnapshot = await getDocs(taskQuery);
    if (!taskSnapshot.empty) {
      const taskDoc = taskSnapshot.docs[0];
      batch.update(taskDoc.ref, {
        columnId: toColumnId,
        updatedAt: serverTimestamp()
      });
    }

    // Update source column - remove task
    const fromColumnQuery = query(this.columnsCollection, where('columnId', '==', fromColumnId));
    const fromColumnSnapshot = await getDocs(fromColumnQuery);
    if (!fromColumnSnapshot.empty) {
      const fromColumnDoc = fromColumnSnapshot.docs[0];
      const fromColumnData = fromColumnDoc.data() as Column;
      const updatedFromTaskIds = fromColumnData.taskIds.filter(id => id !== taskId);
      batch.update(fromColumnDoc.ref, { taskIds: updatedFromTaskIds });
    }

    // Update destination column - add task
    const toColumnQuery = query(this.columnsCollection, where('columnId', '==', toColumnId));
    const toColumnSnapshot = await getDocs(toColumnQuery);
    if (!toColumnSnapshot.empty) {
      const toColumnDoc = toColumnSnapshot.docs[0];
      const toColumnData = toColumnDoc.data() as Column;
      const updatedToTaskIds = [...toColumnData.taskIds];
      
      if (newPosition !== undefined) {
        updatedToTaskIds.splice(newPosition, 0, taskId);
      } else {
        updatedToTaskIds.push(taskId);
      }
      
      batch.update(toColumnDoc.ref, { taskIds: updatedToTaskIds });
    }

    await batch.commit();
  }

  // Delete operations
  async deleteBoard(boardId: string): Promise<void> {
    const batch = writeBatch(db);

    // Delete board
    const boardQuery = query(this.boardsCollection, where('boardId', '==', boardId));
    const boardSnapshot = await getDocs(boardQuery);
    if (!boardSnapshot.empty) {
      batch.delete(boardSnapshot.docs[0].ref);
    }

    // Delete columns
    const columnsQuery = query(this.columnsCollection, where('boardId', '==', boardId));
    const columnsSnapshot = await getDocs(columnsQuery);
    columnsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete tasks
    const tasksQuery = query(this.tasksCollection, where('boardId', '==', boardId));
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }

  async deleteColumn(columnId: string): Promise<void> {
    const q = query(this.columnsCollection, where('columnId', '==', columnId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await deleteDoc(snapshot.docs[0].ref);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    const q = query(this.tasksCollection, where('taskId', '==', taskId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await deleteDoc(snapshot.docs[0].ref);
    }
  }

  // Batch operations for reordering
  async reorderColumns(boardId: string, newColumnOrder: string[]): Promise<void> {
    const batch = writeBatch(db);

    // Update board's column order
    const boardQuery = query(this.boardsCollection, where('boardId', '==', boardId));
    const boardSnapshot = await getDocs(boardQuery);
    if (!boardSnapshot.empty) {
      batch.update(boardSnapshot.docs[0].ref, {
        columnOrder: newColumnOrder,
        updatedAt: serverTimestamp()
      });
    }

    // Update each column's position
    for (let i = 0; i < newColumnOrder.length; i++) {
      const columnQuery = query(this.columnsCollection, where('columnId', '==', newColumnOrder[i]));
      const columnSnapshot = await getDocs(columnQuery);
      if (!columnSnapshot.empty) {
        batch.update(columnSnapshot.docs[0].ref, { position: i });
      }
    }

    await batch.commit();
  }

  async reorderTasks(columnId: string, newTaskOrder: string[]): Promise<void> {
    const q = query(this.columnsCollection, where('columnId', '==', columnId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, {
        taskIds: newTaskOrder
      });
    }
  }
}

// Export singleton instance
export const organizerService = new OrganizerService();
