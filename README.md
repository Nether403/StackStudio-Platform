# StackFast MVP

> Turn any idea into a battle-tested tech stack and crystal-clear build roadmap—before your coffee cools.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase account
- Git

### Installation

1. **Clone and install**
   ```bash
   git clone <your-repo>
   cd "StackFast powered by StackStudio"
   npm install
   ```

2. **Set up Firebase**
   ```bash
   # Create Firebase project at https://console.firebase.google.com
   # Enable Firestore Database
   # Generate service account key
   cp .env.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

3. **Sync database**
   ```bash
   npm run sync-db
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see StackFast in action!

## 🏗️ Architecture

```
📁 StackFast/
├── 📁 API/                 # Serverless functions
│   └── Generate-Blueprints.ts
├── 📁 Database/            # Tool profiles (JSON)
│   ├── ai_models_and_apis.json
│   ├── coding_tools.json
│   ├── databases.json
│   └── deployment_platforms.json
├── 📁 Engine/              # Recommendation logic
│   └── stack-recommendation-engine.ts
├── 📁 Frontend/            # React components
│   └── Frontend.jsx
├── 📁 Scripts/             # Database sync
│   └── sync-firestore.js
└── 📁 .github/workflows/   # CI/CD
    └── sync-firestore.yaml
```

## 🛠️ Core Features

### ✅ Implemented
- [x] **3-step wizard UI** - Idea input, skill level, tool preferences
- [x] **Smart recommendation engine** - Analyzes requirements and scores tools
- [x] **Multi-collection database** - Organized tool profiles
- [x] **Cost estimation** - Basic pricing model integration
- [x] **Compatibility scoring** - Prevents tool conflicts
- [x] **Project prompt generation** - Ready for AI coding tools

### 🚧 In Progress  
- [ ] **Authentication** - Firebase Auth integration
- [ ] **User dashboard** - Project history and management
- [ ] **Enhanced tool database** - 100+ tools across all categories
- [ ] **Real-time cost tracking** - Live API integrations

### 🔮 Planned
- [ ] **StackStudio Organizer** - Kanban boards and team features
- [ ] **Community intelligence** - GitHub/Reddit trend analysis
- [ ] **Template library** - Pre-built project configurations

## 🗄️ Database Schema

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

### Collections
- `ai_models_and_apis` - LLM services, AI APIs
- `coding_tools` - IDEs, code generators
- `databases` - SQL, NoSQL, vector databases  
- `deployment_platforms` - Hosting, CDN services
- `frontend_frameworks` - React, Vue, Angular
- `backend_frameworks` - Node.js, Python, etc.
- `authentication_services` - Auth0, Firebase Auth

## 🎯 API Usage

### Generate Blueprint
```javascript
POST /api/generate-blueprint
{
  "projectIdea": "A real-time chat app with AI moderation",
  "skillProfile": { "setup": 2, "daily": 2 },
  "preferredToolIds": ["react", "supabase"]
}
```

### Response
```javascript
{
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
```

## 🧪 Development

### Adding New Tools
1. Add tool profile to appropriate `Database/*.json` file
2. Run `npm run sync-db` to update Firestore
3. Test with development server

### Local Testing
```bash
npm run type-check  # TypeScript validation
npm run lint        # Code quality
npm run build       # Production build test
```

### Deployment
- **Frontend**: Deploy to Vercel/Netlify  
- **API**: Serverless functions auto-deploy
- **Database**: Firestore (Google Cloud)

## 🔧 Configuration

### Environment Variables
```bash
# Firebase
FIREBASE_API_KEY=your-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account"...}'

# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Firebase Setup
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Generate service account key
4. Update `.env.local` with credentials

## 📊 Current Status

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

## 🎨 Brand Voice

**Confident-Guide**: Senior architect tone, decisive but not bossy  
**Casual-Clever**: Plain English over buzzwords, occasional wit  
**Empathetic-Encouraging**: Supports all skill levels  
**Data-Grounded**: Evidence-based recommendations  
**Momentum-Obsessed**: Action-oriented language  
**Inclusive-Optimistic**: No gatekeeping, tech as playground

## 🚧 Known Issues

1. **File corruption** in original `Stackfast(powered by StackStudio).md` - use `Stackfast-CLEAN.md` instead
2. **Limited tool database** - needs expansion to 100+ tools
3. **No authentication** - Firebase Auth integration pending
4. **Basic cost estimation** - needs live API integrations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Add tools to appropriate JSON files
4. Test with `npm run sync-db && npm run dev`
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

**StackFast.tech** - because ideas sprint, and your tech stack should keep up. 🚀
