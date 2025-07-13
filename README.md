# StackFast by StackStudio

**AI-powered project plan creator and tech stack recommendation engine.**

[![Deploy with Vercel](https://vercel.com/button)](https://stackfastbystack-studio.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**[🚀 Live Demo](https://stackfastbystack-studio.vercel.app/)**

---

*StackFast is an intelligent assistant designed to accelerate the journey from idea to execution. Describe your project, and StackFast will generate a tailored technology stack, a cost projection, an initial project plan, and even create a GitHub repository for you.*

<!-- 
🎬 GIF Creation Guide:
For the demo GIF, I recommend showing:
1. User entering project details in the wizard
2. AI generating recommendations 
3. Cost projection appearing
4. GitHub repo creation
5. Final dashboard view

Tools to create the GIF:
- LICEcap (free, cross-platform): https://www.cockos.com/licecap/
- ScreenToGif (Windows): https://www.screentogif.com/
- Kap (macOS): https://getkap.co/
- Or record with OBS and convert to GIF

Optimal specs: 800-1000px width, <3MB size, 10-15 seconds
Upload to: GitHub releases, Imgur, or your own CDN
-->
![StackFast Demo](https://via.placeholder.com/900x500/6366f1/ffffff?text=🎬+Demo+GIF+Coming+Soon)
*Demo GIF showing the complete project creation workflow*

## ✨ Features

* **🧙‍♂️ Guided 3-Step Wizard:** A conversational UI to capture your project idea, skill level, and preferred tools.
* **🤖 Intelligent Recommendation Engine:** Analyzes your requirements to score and recommend the optimal tools from our 63+ tool database.
* **💰 Dynamic Cost Projection:** Provides an estimated monthly cost breakdown for your recommended stack.
* **🔗 Automated GitHub Integration:** Creates a new GitHub repository for your project with a single click.
* **📋 StackStudio Organizer:** Exports your blueprint into a pre-populated Kanban board with actionable "To Do" tasks.
* **📊 Live Data Enrichment:** A daily cron job updates tool popularity and activity from the GitHub API.
* **🔍 Automated Tool Discovery:** The cron job also scans the ecosystem for new tools to add to our knowledge base.
* **📱 Responsive Design:** Mobile-first, fully responsive dashboard that works on all devices.
* **⚡ Server-Side Rendering:** Lightning-fast initial page loads with meaningful content, even without JavaScript.

## 🛠️ Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) with App Router
* **Language:** [TypeScript](https://www.typescriptlang.org/) for type safety
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) for responsive design
* **Database:** [Google Firestore](https://firebase.google.com/docs/firestore) with real-time sync
* **Authentication:** [NextAuth.js](https://next-auth.js.org/) with GitHub Provider
* **AI Integration:** [OpenAI GPT-4](https://openai.com/) & [Google Gemini](https://deepmind.google/technologies/gemini/)
* **Deployment:** [Vercel](https://vercel.com/) with automatic deployments
* **CI/CD:** [GitHub Actions](https://github.com/features/actions) for automated database synchronization

### 📊 Database Architecture

Our comprehensive database includes **63+ tools** across categories:
- **💻 Coding Tools** (20): React, Vue, Django, Rails, VS Code, etc.
- **🤖 AI Models & APIs** (23): OpenAI, Anthropic, Hugging Face, GitHub Copilot, etc.
- **☁️ Deployment Platforms** (11): Vercel, AWS, Heroku, DigitalOcean, etc.
- **🗄️ Databases** (9): PostgreSQL, MongoDB, Redis, Supabase, etc.

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or later)
* npm or yarn
* A Google Cloud project with Firestore enabled
* A GitHub OAuth Application

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/miasamura/StackFast-By-StackStudio-MVP-.git
    cd StackFast-By-StackStudio-MVP-
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root of the project and add the following variables:

    ```env
    # NextAuth.js Configuration
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET= # Generate: openssl rand -base64 32
    
    # GitHub OAuth App (for authentication)
    GITHUB_ID=your-github-oauth-app-client-id
    GITHUB_SECRET=your-github-oauth-app-client-secret

    # Firebase Admin SDK (for Firestore)
    FIREBASE_PROJECT_ID=your-firebase-project-id
    FIREBASE_CLIENT_EMAIL=your-service-account-email
    FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"

    # Firebase Configuration (Frontend)
    NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
    NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

    # AI API Keys (Optional - for enhanced recommendations)
    OPENAI_API_KEY=your-openai-api-key
    GEMINI_API_KEY=your-google-gemini-api-key

    # Development
    NODE_ENV=development
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎮 Demo Pages

Explore different features on dedicated demo pages:

- **`/`** - Main dashboard with project blueprints
- **`/analytics-demo`** - Analytics dashboard with interactive charts
- **`/organizer-demo`** - Kanban board project organizer
- **`/responsive-dashboard-demo`** - Mobile-first responsive dashboard

## 🗺️ Roadmap

Our core MVP is complete. Our future development is focused on three key themes:

1.  **🎨 UI/UX Polish:** Enhancing animations, loading states, and accessibility to create a premium "high-touch" feel.
2.  **🧠 Engine Intelligence:** Integrating advanced NLP (with Gemini/Grok) for deeper project analysis and incorporating new data sources like the Smithery.ai MCP database.
3.  **👥 Collaboration & Sharing:** Adding features for team-based Organizer boards and public, shareable links for blueprints.

### Upcoming Features
- [ ] **Team Collaboration**: Multi-user project workspaces
- [ ] **Advanced AI**: Natural language project analysis
- [ ] **Template Library**: Pre-built project templates
- [ ] **Performance Analytics**: Real-time project metrics
- [ ] **API Marketplace**: Third-party integrations
- [ ] **Mobile App**: Native iOS/Android applications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss a new feature or bug.

### Development Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests if applicable
4. Run the type checker: `npm run type-check`
5. Run the linter: `npm run lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a pull request

### Code Style

- We use TypeScript for type safety
- Follow the existing code formatting (Prettier/ESLint)
- Write meaningful commit messages
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the StackStudio team
- Powered by OpenAI and Google Gemini APIs
- UI inspired by modern design systems
- Database enriched by GitHub API data

---

**[⬆ Back to top](#stackfast-by-stackstudio)**