# StackStudio Organizer - Database Schema

## Overview
The StackStudio Organizer transforms static blueprints into living, breathing project plans using a Kanban-style board system. This document outlines the three Firestore collections that power this functionality.

---

## Collection: `organizer_boards`

**Purpose**: Main Kanban board for each saved blueprint

**Document ID**: `{blueprintId}` (Direct link to blueprint)

**Fields**:
- **`boardId`** (String): The ID of the blueprint this board belongs to
- **`userId`** (String): The ID of the user who owns the board
- **`projectName`** (String): The name of the project, inherited from the blueprint
- **`columnOrder`** (Array of Strings): Ordered array of `columnId`s defining column sequence
- **`createdAt`** (Timestamp): When the board was created
- **`updatedAt`** (Timestamp): Last modification timestamp
- **`isActive`** (Boolean): Whether the board is currently active

**Example Document** (`organizer_boards/abcde12345`):
```json
{
  "boardId": "abcde12345",
  "userId": "user123",
  "projectName": "AI-Powered Marketing App",
  "columnOrder": ["col-1-todo", "col-2-inprogress", "col-3-review", "col-4-done"],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z",
  "isActive": true
}
```

---

## Collection: `organizer_columns`

**Purpose**: Columns (stages) for each Kanban board

**Document ID**: `{auto-generated-id}` (Firestore auto-ID)

**Fields**:
- **`columnId`** (String): Unique ID for the column
- **`boardId`** (String): The ID of the board this column belongs to
- **`title`** (String): Display title of the column (e.g., "To Do", "In Progress")
- **`taskIds`** (Array of Strings): Ordered array of `taskId`s defining task sequence
- **`color`** (String): Color theme for the column (e.g., "blue", "green", "yellow")
- **`position`** (Number): Position index for column ordering
- **`createdAt`** (Timestamp): When the column was created

**Example Document** (`organizer_columns/col-1-todo`):
```json
{
  "columnId": "col-1-todo",
  "boardId": "abcde12345",
  "title": "To Do",
  "taskIds": ["task-1", "task-2", "task-3"],
  "color": "blue",
  "position": 0,
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

## Collection: `organizer_tasks`

**Purpose**: Individual task cards on the Kanban board

**Document ID**: `{auto-generated-id}` (Firestore auto-ID)

**Fields**:
- **`taskId`** (String): Unique ID for the task
- **`boardId`** (String): The ID of the board this task belongs to
- **`columnId`** (String): Current column containing this task
- **`content`** (String): Main text content of the task card
- **`category`** (String): Tool category this task relates to (e.g., "Database", "Frontend")
- **`priority`** (String): Priority level ("High", "Medium", "Low")
- **`estimatedHours`** (Number): Estimated time to complete (hours)
- **`toolName`** (String): Specific tool this task relates to (e.g., "Supabase", "React")
- **`dependencies`** (Array of Strings): Task IDs this task depends on
- **`tags`** (Array of Strings): Custom tags for organization
- **`createdAt`** (Timestamp): When the task was created
- **`updatedAt`** (Timestamp): Last modification timestamp
- **`completedAt`** (Timestamp, Optional): When the task was completed

**Example Document** (`organizer_tasks/task-1`):
```json
{
  "taskId": "task-1",
  "boardId": "abcde12345",
  "columnId": "col-1-todo",
  "content": "Set up Supabase project and define initial database schema for user authentication and data storage.",
  "category": "Database",
  "priority": "High",
  "estimatedHours": 4,
  "toolName": "Supabase",
  "dependencies": [],
  "tags": ["setup", "backend", "auth"],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

---

## Security Rules

### Firestore Security Rules for Organizer Collections:

```javascript
// organizer_boards collection
match /organizer_boards/{boardId} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
}

// organizer_columns collection
match /organizer_columns/{columnId} {
  allow read, write: if request.auth != null && 
    exists(/databases/$(database)/documents/organizer_boards/$(resource.data.boardId)) &&
    get(/databases/$(database)/documents/organizer_boards/$(resource.data.boardId)).data.userId == request.auth.uid;
}

// organizer_tasks collection
match /organizer_tasks/{taskId} {
  allow read, write: if request.auth != null && 
    exists(/databases/$(database)/documents/organizer_boards/$(resource.data.boardId)) &&
    get(/databases/$(database)/documents/organizer_boards/$(resource.data.boardId)).data.userId == request.auth.uid;
}
```

---

## Task Generation Algorithm

### Automatic Task Generation from Blueprint:

When a user chooses to "Export to Organizer", the system automatically generates tasks based on:

1. **Tool-Specific Tasks**: Each recommended tool gets setup, configuration, and integration tasks
2. **Category-Based Tasks**: Tasks are grouped by tool category (Database, Frontend, etc.)
3. **Dependency Analysis**: Tasks are ordered based on logical dependencies
4. **Time Estimation**: Each task gets estimated completion time based on complexity
5. **Priority Assignment**: Critical path tasks are marked as high priority

### Task Templates by Category:

**Database Tasks**:
- Set up {tool} project and configure initial settings
- Define database schema for {project requirements}
- Implement authentication and user management
- Set up database migrations and seeding

**Frontend Tasks**:
- Initialize {tool} project with required dependencies
- Create core UI components and layouts
- Implement routing and navigation
- Integrate with backend APIs

**Deployment Tasks**:
- Configure {tool} deployment pipeline
- Set up environment variables and secrets
- Configure domain and SSL certificates
- Implement monitoring and logging

---

## API Endpoints

### Required API Endpoints:

- `POST /api/organizer/create-board` - Create new board from blueprint
- `GET /api/organizer/boards/{boardId}` - Get board data
- `PUT /api/organizer/boards/{boardId}` - Update board
- `DELETE /api/organizer/boards/{boardId}` - Delete board
- `POST /api/organizer/tasks` - Create new task
- `PUT /api/organizer/tasks/{taskId}` - Update task (move between columns)
- `DELETE /api/organizer/tasks/{taskId}` - Delete task
- `POST /api/organizer/columns` - Create new column
- `PUT /api/organizer/columns/{columnId}` - Update column
- `DELETE /api/organizer/columns/{columnId}` - Delete column

---

## Business Impact

### Value Proposition:
- **Transforms blueprints** from static recommendations to actionable project plans
- **Provides project management** capabilities within the same platform
- **Increases user engagement** with ongoing project tracking
- **Creates platform stickiness** through project data and progress tracking

### Competitive Advantage:
- **First-of-its-kind** integration of blueprint generation with project management
- **Seamless workflow** from idea to implementation to completion
- **Reduces tool switching** by providing end-to-end project lifecycle management

### Revenue Opportunities:
- **Premium Features**: Advanced project analytics, team collaboration, time tracking
- **Enterprise Features**: Multi-project portfolios, resource management, reporting
- **Integration Marketplace**: Connect with external project management tools

---

*This schema enables StackFast to become the first platform that bridges the gap between technology recommendations and actual project execution.*
