# StackFast Authentication Setup Guide - NextAuth.js

This guide will help you set up the NextAuth.js authentication system for StackFast with GitHub OAuth and Firestore database integration.

## 1. GitHub OAuth App Setup

### Create GitHub OAuth Application:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the details:
   - **Application name**: StackFast Local Development
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### For Production:
- Create another OAuth app for production
- Use your production URL (e.g., `https://stackfast.vercel.app`)
- Set callback URL to: `https://stackfast.vercel.app/api/auth/callback/github`

## 2. Firebase Setup

### Create Firebase Project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Use existing project: `sunny-furnace-461114-s9` or create new
3. Enable **Firestore Database** (not Realtime Database)
4. Create a **Service Account** for NextAuth.js:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

### Firestore Database Setup:

1. Create Firestore database in production mode
2. Set up security rules (see section below)
3. Create the required collections (NextAuth.js will create them automatically)

## 3. Environment Variables

Create a `.env.local` file in your project root:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# GitHub OAuth (from your GitHub OAuth app)
GITHUB_ID=your-github-oauth-app-client-id
GITHUB_SECRET=your-github-oauth-app-client-secret

# Firebase Admin SDK (from your service account JSON)
FIREBASE_PROJECT_ID=sunny-furnace-461114-s9
FIREBASE_CLIENT_EMAIL=your-service-account-email@sunny-furnace-461114-s9.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----

# Development
NODE_ENV=development
```

**Important Notes:**
- Replace `your-super-secret-key-change-this-in-production` with a strong random string
- The `FIREBASE_PRIVATE_KEY` should include the newline characters as `\n`
- Never commit `.env.local` to version control

## 4. Firestore Security Rules

Update your Firestore security rules to work with NextAuth.js:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // NextAuth.js collections
    match /accounts/{id} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /sessions/{id} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /users/{id} {
      allow read, write: if request.auth != null && request.auth.uid == id;
    }
    
    match /verification_tokens/{id} {
      allow read, write: if request.auth != null;
    }
    
    // Custom StackFast collections
    match /blueprints/{blueprintId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Allow reading public blueprints (for future sharing features)
    match /blueprints/{blueprintId} {
      allow read: if resource.data.isPublic == true;
    }
  }
}
```

## 5. Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

The required packages are already included in package.json:
- `next-auth` - Authentication library
- `@auth/firebase-adapter` - Firestore adapter for NextAuth.js
- `firebase-admin` - Firebase Admin SDK

## 6. Database Schema

NextAuth.js will automatically create these collections in Firestore:

- **users**: User profiles and account info
- **accounts**: OAuth account connections
- **sessions**: User sessions
- **verification_tokens**: Email verification tokens

Additionally, StackFast creates:
- **blueprints**: User's saved project blueprints

## 7. Start Development

Run the development server:

```bash
npm run dev
```

Your application should now be running at `http://localhost:3000` with full authentication!

## 8. Testing the Authentication Flow

1. Open `http://localhost:3000`
2. Click "Login with GitHub" 
3. Complete the GitHub OAuth flow
4. You should be redirected back to the app as a logged-in user
5. Create a project blueprint and save it
6. Check your Firestore console to see the created documents

## 9. Database Structure

After successful authentication, you'll see these collections in Firestore:

### `users` collection:
```json
{
  "id": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "image": "https://avatar-url.com/avatar.jpg",
  "emailVerified": null
}
```

### `accounts` collection:
```json
{
  "userId": "user-id",
  "type": "oauth",
  "provider": "github",
  "providerAccountId": "github-user-id",
  "access_token": "...",
  "token_type": "bearer",
  "scope": "..."
}
```

### `blueprints` collection:
```json
{
  "blueprintId": "auto-generated-id",
  "userId": "user-id",
  "projectName": "My Project",
  "projectIdea": "Description...",
  "blueprintData": {...},
  "createdAt": "2025-07-11T...",
  "tags": ["web", "ai"]
}
```

## 10. Production Deployment

For production deployment:

1. Update `NEXTAUTH_URL` to your production URL
2. Create a production GitHub OAuth app
3. Update environment variables in your hosting platform
4. Ensure Firestore security rules are properly configured
5. Test the authentication flow thoroughly

## 11. Troubleshooting

### Common Issues:

**GitHub OAuth Error:**
- Check that your GitHub OAuth app settings are correct
- Verify the callback URL matches exactly
- Ensure `GITHUB_ID` and `GITHUB_SECRET` are correct

**Firestore Permission Errors:**
- Verify your service account has the necessary permissions
- Check that security rules are properly configured
- Ensure `FIREBASE_PROJECT_ID` matches your project

**NextAuth.js Session Issues:**
- Verify `NEXTAUTH_SECRET` is set and consistent
- Check that `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### Debug Mode:
Add this to your `.env.local` for debugging:
```bash
NEXTAUTH_DEBUG=true
```

## 12. Next Steps

Once authentication is working:

1. **Customize User Experience**: Add profile management and settings
2. **Implement Blueprint Management**: Add CRUD operations for saved blueprints
3. **Add Real AI Integration**: Replace mock recommendations with actual AI APIs
4. **Implement Sharing Features**: Allow users to share blueprints publicly
5. **Add Analytics**: Track user engagement and popular stacks

Your authentication system is now production-ready and follows industry best practices! 🚀
