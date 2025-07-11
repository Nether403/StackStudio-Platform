# GitHub Integration

This document describes the GitHub integration feature that allows users to create GitHub repositories directly from their saved blueprints.

## Overview

The GitHub integration enables users to:
- Create GitHub repositories from saved blueprints
- Automatically populate repositories with starter files based on the tech stack
- View and access created repositories from the blueprint UI
- Track which blueprints have associated GitHub repositories

## Features

### 1. Repository Creation
- **One-click repository creation** from any saved blueprint
- **Automatic naming** based on the project name (sanitized for GitHub)
- **Starter files generation** based on the recommended tech stack:
  - `README.md` with project overview, tech stack, and setup instructions
  - `package.json` for Node.js/JavaScript projects
  - `requirements.txt` for Python projects
  - `STACKFAST.md` with complete blueprint documentation
  - Appropriate `.gitignore` template
  - MIT license

### 2. Smart UI Integration
- **Create GitHub Repo button** appears on hover for blueprints without repositories
- **View Repository button** for blueprints that already have GitHub repositories
- **GitHub badge** indicator on blueprint cards
- **Loading states** during repository creation
- **Error handling** with user-friendly messages

### 3. Repository Management
- **Automatic repository tracking** - blueprint is updated with GitHub repository information
- **Direct links** to view repositories on GitHub
- **Clone URLs** available for development setup

## Technical Implementation

### API Endpoint
- **Route**: `/api/github/create-repo`
- **Method**: POST
- **Authentication**: Required (NextAuth.js session + GitHub OAuth token)
- **SDK**: Uses @octokit/rest for reliable GitHub API interactions

### Enhanced Features
- **OAuth Token Usage**: Uses user's GitHub OAuth token instead of server-side personal access token
- **Improved Error Handling**: Specific error messages for common scenarios
- **Octokit Integration**: Official GitHub SDK for better reliability
- **Automatic Permissions**: Leverages user's existing GitHub permissions

### Request Format
```json
{
  "blueprintId": "string",
  "repoName": "string",
  "isPrivate": false
}
```

### Response Format
```json
{
  "success": true,
  "repository": {
    "name": "project-name",
    "url": "https://github.com/username/project-name",
    "cloneUrl": "https://github.com/username/project-name.git",
    "filesCreated": 4
  },
  "message": "GitHub repository created successfully!"
}
```

## Setup Instructions

### 1. GitHub OAuth Application
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - Homepage URL: `http://localhost:3000` (or your domain)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Note the Client ID and Client Secret
4. Ensure the OAuth app has access to the `repo` scope

### 2. Environment Variables
Add to your `.env.local` file:
```bash
# GitHub OAuth (handles both authentication and API access)
GITHUB_ID=your-github-oauth-app-client-id
GITHUB_SECRET=your-github-oauth-app-client-secret
```

**Note**: No personal access token is required. The integration uses OAuth tokens from user authentication.

### 3. Database Schema
The blueprint documents are extended with GitHub repository information:
```typescript
interface Blueprint {
  // ... existing fields
  githubRepo?: {
    id: number;
    name: string;
    fullName: string;
    htmlUrl: string;
    cloneUrl: string;
    sshUrl: string;
    createdAt: string;
  };
}
```

## User Experience

### Creating a Repository
1. User hovers over a saved blueprint
2. "Create GitHub Repo" button appears (green cloud icon)
3. User clicks the button
4. Repository is created with loading indicator
5. Success message shows with repository URL
6. New repository opens in a new tab
7. Blueprint UI updates to show GitHub badge and view button

### Viewing a Repository
1. User hovers over a blueprint with an existing repository
2. "View Repository" button appears (blue GitHub icon)
3. User clicks to open the repository on GitHub

## Generated Files

### README.md
- Project overview and description
- Tech stack breakdown with reasoning
- Cost estimates
- Setup instructions
- Next steps checklist

### package.json (Node.js projects)
- Detected dependencies based on tech stack
- Appropriate scripts for development/build
- Project metadata

### requirements.txt (Python projects)
- Python dependencies based on detected frameworks
- Common utilities (python-dotenv, requests)

### STACKFAST.md
- Complete blueprint documentation
- Original project prompt and requirements
- Full tech stack recommendations
- Generated timestamp

### .gitignore
- Appropriate template based on detected tech stack
- Node.js template for JavaScript/TypeScript projects
- Python template for Python projects

## Error Handling

### Common Errors
- **Repository name already exists**: Suggests alternative names
- **GitHub API rate limit**: Displays retry message
- **Authentication issues**: Prompts for proper setup
- **Network errors**: Displays connection error message

### User-Friendly Messages
- Success notifications with repository details
- Clear error messages with suggested solutions
- Loading states during repository creation
- Confirmation dialogs for important actions

## Security Considerations

### Authentication
- User GitHub OAuth token is used for API access
- No server-side personal access token required
- User authentication required via NextAuth.js
- Blueprint ownership verification
- Automatic permission inheritance from user's GitHub account

### Data Privacy
- No sensitive data stored in generated files
- GitHub repository creation is logged for debugging
- User control over repository visibility (public/private)

## Future Enhancements

### Planned Features
- **Repository templates** based on specific tech stacks
- **Automatic CI/CD setup** with GitHub Actions
- **Deployment configuration** for various platforms
- **Code scaffolding** with basic project structure
- **Dependency installation** scripts
- **Environment setup** automation

### Advanced Integration
- **GitHub OAuth** for repository creation using user tokens
- **Organization repositories** for team accounts
- **Repository updates** when blueprints are modified
- **Branch protection** and workflow templates
- **Issue templates** based on project type

## Troubleshooting

### Common Issues
1. **"GitHub integration not configured"**
   - Check `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable
   - Verify token has correct scopes

2. **"Repository already exists"**
   - Try a different repository name
   - Check your GitHub account for existing repositories

3. **"Failed to create repository"**
   - Check GitHub API rate limits
   - Verify internet connection
   - Check GitHub service status

### Debug Information
- Check browser console for API errors
- Verify environment variables are loaded
- Test API endpoint directly if needed

---

## Related Documentation
- [Authentication Setup](./SETUP_AUTHENTICATION.md)
- [Blueprint API](./BLUEPRINT_API.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [README](./README.md)
