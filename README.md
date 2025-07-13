# StackStudio

> AI-powered tech stack recommendation platform with comprehensive database and analytics

## 🚀 Features

- **63+ Tools Database**: Comprehensive collection of coding tools, AI platforms, no-code/low-code solutions, deployment platforms, and databases
- **AI-Powered Recommendations**: Hybrid recommendation engine using OpenAI and Gemini APIs
- **Analytics Dashboard**: Real-time insights into tool popularity, cost projections, and usage patterns
- **Authentication**: Secure NextAuth-based authentication with GitHub integration
- **SSR-Safe Architecture**: Client-side rendering for optimal performance and compatibility

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Firebase Firestore
- **Authentication**: NextAuth.js with GitHub provider
- **AI Integration**: OpenAI GPT-4, Google Gemini
- **Deployment**: Vercel
- **Analytics**: Custom analytics service with Chart.js

## 📊 Database

The platform includes a comprehensive database of 63 tools across categories:
- **Coding Tools** (20): Frontend frameworks, backend tools, development environments
- **AI Models & APIs** (23): AI coding assistants, ML frameworks, no-code platforms
- **Deployment Platforms** (11): Cloud providers, containerization, hosting
- **Databases** (9): SQL/NoSQL databases with performance characteristics

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd stackstudio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys and configuration

# Run development server
npm run dev
```

## 📝 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# AI APIs (Optional)
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
```

## 🏗️ Architecture

### SSR-Safe Design
All authentication-dependent components use client-side rendering to prevent server-side rendering issues:

```typescript
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
  // Client-side only code here
}, []);

if (!isClient) {
  return <SkeletonLoader />; // SSR-safe fallback
}
```

### Component Structure
- `components/` - Reusable UI components with SSR-safe patterns
- `pages/` - Next.js pages with SSR disabled for auth-dependent pages
- `contexts/` - React contexts for authentication and state management
- `Engine/` - AI recommendation and analytics engines
- `Database/` - Tool database JSON files

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build

# Integration tests
npm run test-github
```

## 🚀 Deployment

The platform is configured for Vercel deployment with:
- Automatic builds on push to master
- Environment variable management
- SSR-safe component architecture
- Optimized build process with timeouts

### Deploy to Vercel

1. Fork this repository
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

## 🔧 Development

### Key Scripts
- `npm run dev` - Development server with environment validation
- `npm run build` - Production build with SSR optimizations
- `npm run type-check` - TypeScript validation
- `npm run update-db` - Update database files

### Adding New Tools
1. Update the appropriate database file in `Database/`
2. Follow the existing schema with pricing, compatibility, and feature information
3. Run database sync scripts to update the application

### Database Schema
```typescript
interface ToolProfile {
  id: string;
  name: string;
  category: string;
  skills: { setup: number; daily: number };
  pricing_model: string;
  baseline_cost: number;
  compatible_with: string[];
  popularity_score: number;
  community_sentiment: string;
}
```

## 📈 Analytics

The platform includes comprehensive analytics:
- Tool popularity tracking
- Cost projection modeling
- User engagement metrics
- Performance monitoring

## 🎯 Project Goals

StackStudio aims to:
1. **Simplify tech stack selection** for developers and teams
2. **Provide data-driven recommendations** based on real tool metrics
3. **Reduce decision fatigue** with AI-powered suggestions
4. **Track costs accurately** with real pricing models
5. **Build community** around tool experiences and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and type checking (`npm run type-check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow SSR-safe patterns for auth-dependent components
- Add proper TypeScript types for all new code
- Include tests for new functionality
- Update documentation for new features

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: See `docs/` directory
- **Issue Tracker**: GitHub Issues
- **Changelog**: See `CHANGELOG.md`

---

**Status**: Production-ready with comprehensive SSR fixes, optimized CI/CD pipeline, and clean codebase ready for deployment.