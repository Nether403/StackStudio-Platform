# StackFast MVP

> Turn any idea into a battle-tested tech stack and crystal-clear build roadmap—before your coffee cools.

**🔥 Now with user authentication, project persistence, and GitHub OAuth!**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase account
- GitHub account (for OAuth)
- Git

### Installation

1. **Clone and install**
   ```bash
   git clone <your-repo>
   cd "StackFast powered by StackStudio"
   npm install
   ```

2. **Set up Firebase & Authentication**
   ```bash
   # Create Firebase project at https://console.firebase.google.com
   # Enable Firestore Database
   # Enable Authentication with GitHub provider
   # Generate service account key
   # GitHub OAuth app will handle repository creation permissions
   cp .env.example .env.local
   # Edit .env.local with your Firebase and GitHub OAuth credentials
   ```

3. **Sync database**
   ```bash
   npm run sync-db
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see StackFast in action! Sign in with GitHub to save your generated blueprints.

## 🏗️ Architecture

```
📁 StackFast/
├── 📁 pages/               # Next.js pages
│   ├── index.tsx          # Main app entry point
│   ├── _app.tsx           # Global app configuration
│   └── api/
│       ├── auth/          # NextAuth.js authentication
│       │   └── [...nextauth].ts
│       └── generate-blueprint.ts
├── 📁 components/         # React components
│   ├── StackFastApp.tsx   # Main app component
│   ├── Auth.tsx           # Authentication components
│   └── ...
├── 📁 contexts/           # React contexts
│   └── AuthContext.tsx    # NextAuth.js context
├── 📁 lib/                # Utility libraries
│   ├── firebase.js        # Firebase client config
│   └── firebase-admin.js  # Firebase Admin SDK
├── 📁 Database/           # Tool profiles (JSON)
│   ├── ai_models_and_apis.json
│   ├── coding_tools.json
│   ├── databases.json
│   └── deployment_platforms.json
├── 📁 Engine/             # Recommendation logic
│   └── stack-recommendation-engine.ts
├── 📁 Scripts/            # Database sync
│   └── sync-firestore.js
├── 📁 styles/             # Tailwind CSS
│   └── globals.css
└── 📁 .github/workflows/  # CI/CD
    └── sync-firestore.yaml
```

## 🛠️ Core Features

### ✅ Implemented
- [x] **User Authentication** - GitHub OAuth with NextAuth.js
- [x] **User Dashboard** - Profile management and saved blueprints
- [x] **Project Persistence** - Save and retrieve generated blueprints
- [x] **GitHub Integration** - Create repositories directly from blueprints
- [x] **3-step wizard UI** - Idea input, skill level, tool preferences
- [x] **Smart recommendation engine** - Analyzes requirements and scores tools
- [x] **Multi-collection database** - Organized tool profiles with Firestore
- [x] **Cost estimation** - Basic pricing model integration
- [x] **Compatibility scoring** - Prevents tool conflicts
- [x] **Project prompt generation** - Ready for AI coding tools
- [x] **Responsive design** - Tailwind CSS with modern UI

### 🚧 In Progress  
- [ ] **Enhanced tool database** - 100+ tools across all categories
- [ ] **Real-time cost tracking** - Live API integrations
- [ ] **Blueprint sharing** - Public/private project sharing
- [ ] **Team collaboration** - Multi-user blueprint editing

### 🔮 Planned
- [ ] **StackStudio Organizer** - Kanban boards and team features
- [ ] **Community intelligence** - GitHub/Reddit trend analysis
- [ ] **Template library** - Pre-built project configurations
- [ ] **Analytics dashboard** - Usage insights and recommendations

## 🗄️ Database Schema

### User Management
- **users** collection - User profiles with GitHub data
- **blueprints** collection - Saved project blueprints
- **sessions** collection - NextAuth.js session management

### Tool Profile Structure
```json
{
  "id": "unique-tool-id",
  "name": "Tool Name",
  "category": "Frontend Framework",
  "skills": { "setup": 2, "daily": 2 },
  "pricing_model": "free-tier",
  "baseline_cost": 0,
  "compatible_with": ["other-tool-ids"],
  "popularity_score": 0.85,
  "community_sentiment": "positive"
}
```

### Blueprint Schema
```json
{
  "id": "blueprint-id",
  "userId": "user-id",
  "title": "My Awesome App",
  "projectIdea": "A real-time chat app with AI moderation",
  "recommendedStack": [...],
  "estimatedCost": { "min": 0, "max": 75 },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

> 📖 **Detailed Schema**: See `DATABASE_SCHEMA.md` for complete Firestore schema documentation and security rules.

### Collections
- `ai_models_and_apis` - LLM services, AI APIs
- `coding_tools` - IDEs, code generators
- `databases` - SQL, NoSQL, vector databases  
- `deployment_platforms` - Hosting, CDN services
- `frontend_frameworks` - React, Vue, Angular
- `backend_frameworks` - Node.js, Python, etc.
- `authentication_services` - Auth0, Firebase Auth

## 🎯 API Usage

### Authentication
StackFast uses NextAuth.js for secure authentication:
```javascript
// Sign in with GitHub
signIn('github')

// Sign out
signOut()

// Check authentication status
const { data: session } = useSession()
```

### Generate Blueprint
```javascript
POST /api/generate-blueprint
{
  "projectIdea": "A real-time chat app with AI moderation",
  "skillProfile": { "setup": 2, "daily": 2 },
  "preferredToolIds": ["react", "supabase"],
  "userId": "user-id" // Optional, for authenticated users
}
```

### Response
```javascript
{
  "success": true,
  "data": {
    "summary": "Generated a medium web application stack...",
    "recommendedStack": [
      {
        "name": "React",
        "category": "Frontend Framework", 
        "reason": "highly popular, excellent community support",
        "compatibilityScore": 95
      }
    ],
    "warnings": [],
    "projectPrompt": "Create a real-time chat app...",
    "estimatedCost": { "min": 0, "max": 75 }
  }
}
```

### GitHub Integration
Create repositories directly from saved blueprints:
```javascript
POST /api/github/create-repo
{
  "blueprintId": "blueprint-id",
  "repoName": "my-awesome-project",
  "isPrivate": false
}
```

Response:
```javascript
{
  "success": true,
  "repository": {
    "name": "my-awesome-project",
    "url": "https://github.com/username/my-awesome-project",
    "cloneUrl": "https://github.com/username/my-awesome-project.git",
    "filesCreated": 4
  }
}
```

**Generated files include:**
- `README.md` - Project overview and setup instructions
- `package.json` / `requirements.txt` - Dependencies based on tech stack
- `STACKFAST.md` - Complete blueprint documentation
- `.gitignore` - Appropriate template for the tech stack

> 📚 **Details**: See `GITHUB_INTEGRATION.md` for comprehensive documentation.

## 🧪 Development

### Tech Stack
- **Framework**: Next.js 14 with TypeScript
- **Authentication**: NextAuth.js with GitHub OAuth
- **Database**: Firebase Firestore with Admin SDK
- **Styling**: Tailwind CSS with custom components
- **Deployment**: Vercel (frontend) + Google Cloud (backend)

### Adding New Tools
1. Add tool profile to appropriate `Database/*.json` file
2. Run `npm run sync-db` to update Firestore
3. Test with development server

### Local Development
```bash
npm run dev         # Start development server
npm run type-check  # TypeScript validation
npm run lint        # Code quality
npm run build       # Production build test
npm run sync-db     # Sync database with Firestore
```

### Environment Setup
Create `.env.local` file with:
```bash
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# GitHub OAuth (handles both auth and API access)
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret

# Firebase
FIREBASE_API_KEY=your-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account"...}
```

> 🔧 **Setup Guide**: See `SETUP_AUTHENTICATION.md` for detailed setup instructions.

## 🔧 Configuration

### Firebase Setup
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication with GitHub provider
4. Generate service account key
5. Update `.env.local` with credentials

### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
4. Add Client ID and Secret to `.env.local`

### Deployment
- **Frontend**: Deploy to Vercel (recommended)
- **API**: Serverless functions auto-deploy with Vercel
- **Database**: Firestore (Google Cloud)
- **Authentication**: NextAuth.js with GitHub OAuth

## 📊 Current Status

### Authentication & User Management
- ✅ **GitHub OAuth** - Secure authentication with NextAuth.js
- ✅ **User Profiles** - Automatic user document creation
- ✅ **Session Management** - Persistent login state
- ✅ **Protected Routes** - AuthGuard component
- ✅ **User Dashboard** - Profile and saved blueprints

### Database Coverage
- **AI/ML Models**: 2 tools (OpenAI GPT-4, Anthropic Claude)
- **Coding Tools**: 2 tools (GitHub Copilot, Replit Ghostwriter)  
- **Databases**: 1 tool (Pinecone)
- **Deployment**: 2 tools (Netlify, Vercel)
- **Frontend**: 6 tools (React, Vue, Angular, Svelte, Next.js, Tailwind)
- **Backend**: 7 tools (Node.js, Express, NestJS, Supabase, Firebase, Python, FastAPI)
- **Authentication**: 4 tools (Auth0, Firebase Auth, Supabase Auth, Clerk)

**Total**: 24 tools across 7 categories

### Recommendation Engine
- ✅ Natural language project analysis
- ✅ Skill-level compatibility scoring  
- ✅ Cost estimation (basic)
- ✅ Conflict detection
- ✅ Project prompt generation
- ✅ User-specific recommendations

## 🎨 Brand Voice

**Confident-Guide**: Senior architect tone, decisive but not bossy  
**Casual-Clever**: Plain English over buzzwords, occasional wit  
**Empathetic-Encouraging**: Supports all skill levels  
**Data-Grounded**: Evidence-based recommendations  
**Momentum-Obsessed**: Action-oriented language  
**Inclusive-Optimistic**: No gatekeeping, tech as playground

## 🚧 Known Issues

1. **Tool Database Size** - Limited to 24 tools, needs expansion to 100+ tools
2. **Cost Estimation** - Basic pricing model, needs live API integrations
3. **Blueprint Sharing** - Not yet implemented, coming in next release
4. **Mobile Optimization** - Some UI components need mobile-first improvements

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Core recommendation engine
- [x] User authentication with GitHub OAuth
- [x] Project persistence with Firestore
- [x] Modern UI with Tailwind CSS

### Phase 2: Enhancement 🚧
- [ ] Expand tool database to 100+ tools
- [ ] Real-time cost tracking with API integrations
- [ ] Blueprint sharing (public/private)
- [ ] Team collaboration features

### Phase 3: Community 🔮
- [ ] Community-driven tool ratings
- [ ] GitHub/Reddit trend analysis
- [ ] Template marketplace
- [ ] Analytics dashboard

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Set up development environment**
   ```bash
   npm install
   cp .env.example .env.local
   # Add your Firebase and GitHub OAuth credentials
   npm run dev
   ```
4. **Make your changes**
   - Add tools to appropriate `Database/*.json` files
   - Update documentation if needed
   - Follow existing code style
5. **Test your changes**
   ```bash
   npm run type-check
   npm run lint
   npm run build
   npm run sync-db  # If you added new tools
   ```
6. **Commit changes** (`git commit -m 'Add amazing feature'`)
7. **Push to branch** (`git push origin feature/amazing-feature`)
8. **Open Pull Request**

### Development Guidelines
- Use TypeScript for type safety
- Follow React best practices
- Write descriptive commit messages
- Add tests for new features
- Update documentation for significant changes

### Areas We Need Help With
- 🔧 Tool database expansion
- 🎨 UI/UX improvements
- 🚀 Performance optimizations
- 📊 Analytics implementation
- 🌐 Internationalization

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live Demo**: [stackfast.tech](https://stackfast.tech) *(coming soon)*
- **Documentation**: [docs.stackfast.tech](https://docs.stackfast.tech) *(coming soon)*
- **GitHub**: [github.com/miasamura/StackFast-By-StackStudio-MVP-](https://github.com/miasamura/StackFast-By-StackStudio-MVP-)
- **Issues**: [github.com/miasamura/StackFast-By-StackStudio-MVP-/issues](https://github.com/miasamura/StackFast-By-StackStudio-MVP-/issues)

---

**StackFast.tech** - because ideas sprint, and your tech stack should keep up. 🚀

*Built with ❤️ by [StackStudio](https://stackstudio.com)*
