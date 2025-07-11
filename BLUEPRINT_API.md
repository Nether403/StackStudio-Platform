# Blueprint API Documentation

The `/api/blueprints` endpoint provides complete CRUD operations for user blueprints.

## Authentication

All endpoints require user authentication via NextAuth.js session. Users can only access their own blueprints.

## Endpoints

### GET /api/blueprints
Retrieves all blueprints for the authenticated user.

**Response:**
```json
[
  {
    "id": "blueprint-id",
    "userId": "user-id",
    "projectName": "My Awesome Project",
    "projectIdea": "A web app that...",
    "blueprintData": {
      "summary": "Generated stack summary",
      "recommendedStack": [...],
      "warnings": [...],
      "estimatedCost": { "min": 0, "max": 100 }
    },
    "createdAt": "2025-07-11T...",
    "updatedAt": "2025-07-11T..."
  }
]
```

### POST /api/blueprints
Saves a new blueprint for the authenticated user.

**Request Body:**
```json
{
  "projectName": "My Project Name",
  "projectIdea": "Description of what I want to build",
  "blueprintData": {
    "summary": "Generated stack summary",
    "recommendedStack": [...],
    "warnings": [...],
    "estimatedCost": { "min": 0, "max": 100 }
  }
}
```

**Response:**
```json
{
  "success": true,
  "blueprintId": "new-blueprint-id",
  "userId": "user-id",
  "projectName": "My Project Name",
  "projectIdea": "Description...",
  "blueprintData": {...},
  "createdAt": "2025-07-11T...",
  "updatedAt": "2025-07-11T..."
}
```

### DELETE /api/blueprints?blueprintId={id}
Deletes a specific blueprint (only if it belongs to the authenticated user).

**Response:**
```json
{
  "success": true,
  "message": "Blueprint deleted successfully.",
  "blueprintId": "deleted-blueprint-id"
}
```

## Frontend Integration

### Saving Blueprints

In your component (e.g., after generating a blueprint):

```javascript
const handleSaveBlueprint = async () => {
  try {
    const response = await fetch('/api/blueprints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: "My Project",
        projectIdea: "What I want to build",
        blueprintData: generatedBlueprint
      })
    });

    if (!response.ok) throw new Error('Failed to save');
    
    const result = await response.json();
    console.log('Saved:', result);
  } catch (error) {
    console.error('Save failed:', error);
  }
};
```

### Loading Blueprints

```javascript
const [blueprints, setBlueprints] = useState([]);

const fetchBlueprints = async () => {
  try {
    const response = await fetch('/api/blueprints');
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    setBlueprints(data);
  } catch (error) {
    console.error('Fetch failed:', error);
  }
};

useEffect(() => {
  if (user) fetchBlueprints();
}, [user]);
```

### Deleting Blueprints

```javascript
const deleteBlueprint = async (blueprintId) => {
  try {
    const response = await fetch(`/api/blueprints?blueprintId=${blueprintId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete');
    
    // Remove from local state
    setBlueprints(prev => prev.filter(bp => bp.id !== blueprintId));
  } catch (error) {
    console.error('Delete failed:', error);
  }
};
```

## Security Features

- **Authentication Required**: All endpoints check for valid NextAuth.js session
- **User Isolation**: Users can only access their own blueprints
- **Ownership Verification**: DELETE operations verify blueprint ownership
- **Input Validation**: Required fields are validated before processing
- **Error Handling**: Comprehensive error responses for debugging

## Error Responses

```json
{
  "error": "Error message describing what went wrong"
}
```

Common error codes:
- `401`: User not authenticated
- `400`: Missing required fields
- `403`: Trying to access/modify another user's blueprint
- `404`: Blueprint not found
- `500`: Server error

## Database Schema

Blueprints are stored in Firestore with the following structure:

```json
{
  "userId": "string - links to user account",
  "projectName": "string - user-defined project name",
  "projectIdea": "string - original project description",
  "blueprintData": "object - generated recommendation data",
  "createdAt": "timestamp - when blueprint was saved",
  "updatedAt": "timestamp - last modification time"
}
```

The blueprint data contains the full output from the recommendation engine, including recommended stack, warnings, cost estimates, and project prompts.
