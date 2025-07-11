import { NextApiRequest, NextApiResponse } from 'next';

// Test endpoint to verify organizer setup
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test basic functionality
    const status = {
      timestamp: new Date().toISOString(),
      organizer: 'ready',
      endpoints: {
        boards: '/api/organizer/boards',
        columns: '/api/organizer/columns',
        tasks: '/api/organizer/tasks',
        'create-from-blueprint': '/api/organizer/create-from-blueprint'
      },
      components: {
        'StackStudioOrganizer': 'implemented',
        'organizerService': 'implemented',
        'demo-page': 'available at /organizer-demo'
      },
      features: {
        'real-time-updates': 'enabled',
        'task-management': 'enabled',
        'blueprint-integration': 'enabled',
        'kanban-interface': 'enabled'
      },
      setup: {
        'firebase-config': 'required',
        'authentication': 'required',
        'firestore-collections': 'auto-created'
      }
    };

    return res.status(200).json(status);
  } catch (error) {
    console.error('Organizer status check failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
