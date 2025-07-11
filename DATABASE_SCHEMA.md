# Database Schema: User Accounts & Persistence

This document outlines the new Firestore collections for managing users and their saved project blueprints.

---

## Collection: `users`

This collection stores a profile for each user who signs up for StackFast. The document ID should be the user's unique ID provided by the authentication service (e.g., their GitHub user ID).

**Document ID:** `{userId}`

**Fields:**
- **`uid`** (String): The unique user ID from the authentication provider.
- **`email`** (String): The user's primary email address.
- **`name`** (String): The user's full name or display name.
- **`avatarUrl`** (String): A URL to the user's profile picture.
- **`provider`** (String): The authentication provider used (e.g., "github").
- **`createdAt`** (Timestamp): The server timestamp when the user profile was created.
- **`lastLoginAt`** (Timestamp): The server timestamp of the user's last login.
- **`preferences`** (Object): User preferences and settings.

**Example Document (`users/12345`):**
```json
{
  "uid": "12345",
  "email": "dev@example.com",
  "name": "Alex Developer",
  "avatarUrl": "https://avatars.githubusercontent.com/u/12345?v=4",
  "provider": "github",
  "createdAt": "2025-07-11T14:30:00Z",
  "lastLoginAt": "2025-07-11T15:45:00Z",
  "preferences": {
    "theme": "light",
    "notifications": true,
    "defaultSkillLevel": "intermediate"
  }
}
```

---

## Collection: `blueprints`

This collection stores the project blueprints generated and saved by users. Each document is linked to a user via their userId.

**Document ID:** `{auto-generated-id}`

**Fields:**
- **`blueprintId`** (String): A unique ID for the blueprint document.
- **`userId`** (String): The uid of the user who owns this blueprint. This is essential for querying.
- **`projectName`** (String): A user-provided name for the project (e.g., "My AI Marketing App").
- **`projectIdea`** (String): The original project idea input from the user.
- **`blueprintData`** (Object): The complete JSON object returned by the generateBlueprint engine.
  - **`recommendedStack`** (Array): List of recommended tools
  - **`warnings`** (Array): Any warnings or considerations
  - **`summary`** (String): Summary of the blueprint
  - **`complexity`** (String): Project complexity level
  - **`features`** (Array): Detected features
  - **`estimatedTime`** (String): Estimated development time
  - **`confidenceScore`** (Number): AI confidence in recommendations
- **`createdAt`** (Timestamp): The server timestamp when the blueprint was saved.
- **`updatedAt`** (Timestamp): The server timestamp of the last modification.
- **`isPublic`** (Boolean): Whether the blueprint is publicly visible.
- **`tags`** (Array): User-defined tags for organization.

**Example Document (`blueprints/abcde12345`):**
```json
{
  "blueprintId": "abcde12345",
  "userId": "12345",
  "projectName": "My AI Marketing App",
  "projectIdea": "A web app that uses AI to generate marketing copy for social media posts.",
  "blueprintData": {
    "recommendedStack": [
      {
        "id": "next",
        "name": "Next.js",
        "category": "Frontend Framework",
        "reason": "Excellent for full-stack React apps with SEO requirements"
      },
      {
        "id": "openai",
        "name": "OpenAI GPT-4",
        "category": "AI/ML",
        "reason": "Best-in-class text generation for marketing copy"
      }
    ],
    "warnings": [
      "OpenAI API costs can scale with usage - implement rate limiting"
    ],
    "summary": "This stack is optimized for AI-powered content generation with modern web technologies.",
    "complexity": "medium",
    "features": ["authentication", "ai", "content-generation"],
    "estimatedTime": "2-3 weeks",
    "confidenceScore": 0.92
  },
  "createdAt": "2025-07-11T14:30:00Z",
  "updatedAt": "2025-07-11T14:30:00Z",
  "isPublic": false,
  "tags": ["ai", "marketing", "web-app"]
}
```

---

## Collection: `user_sessions`

This collection tracks user sessions and activity for analytics and security purposes.

**Document ID:** `{sessionId}`

**Fields:**
- **`userId`** (String): The user ID this session belongs to.
- **`sessionId`** (String): Unique session identifier.
- **`startTime`** (Timestamp): When the session started.
- **`endTime`** (Timestamp): When the session ended (null if active).
- **`lastActivity`** (Timestamp): Last recorded activity.
- **`ipAddress`** (String): User's IP address (for security).
- **`userAgent`** (String): User's browser/device information.
- **`actions`** (Array): List of actions performed during the session.

---

## Security Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own blueprints
    match /blueprints/{blueprintId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Public blueprints can be read by anyone
    match /blueprints/{blueprintId} {
      allow read: if resource.data.isPublic == true;
    }
    
    // Session tracking (admin only)
    match /user_sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## API Endpoints

### User Management
- `POST /api/auth/login` - Handle user login
- `POST /api/auth/logout` - Handle user logout
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Blueprint Management
- `GET /api/blueprints` - Get user's blueprints
- `POST /api/blueprints` - Create new blueprint
- `GET /api/blueprints/{id}` - Get specific blueprint
- `PUT /api/blueprints/{id}` - Update blueprint
- `DELETE /api/blueprints/{id}` - Delete blueprint

### Analytics
- `POST /api/analytics/track` - Track user actions
- `GET /api/analytics/dashboard` - Get user analytics

---

## Migration Strategy

1. **Phase 1**: Create collections and security rules
2. **Phase 2**: Implement authentication system
3. **Phase 3**: Add blueprint persistence
4. **Phase 4**: Migrate existing data (if any)
5. **Phase 5**: Add advanced features (sharing, collaboration, etc.)

This schema provides a solid foundation for user management and project persistence while maintaining security and scalability.
