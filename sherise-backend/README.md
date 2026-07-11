# SheRise Backend API

Express.js backend API for SheRise, a career comeback platform for women. This server handles user authentication, profile management, roadmap generation, skill passport creation, opportunity matching, and progress tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon recommended)
- Clerk account (for authentication)
- Google Gemini API key

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd sherise-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your actual values:
```env
DATABASE_URL=postgresql://user:password@host:5432/sherise
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

5. Set up the database:
```bash
npx prisma migrate deploy
npx prisma db seed
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
sherise-backend/
├── src/
│   ├── server.ts                 # Express app configuration
│   ├── middleware/
│   │   └── auth.ts              # Clerk authentication middleware
│   ├── routes/
│   │   ├── profile.routes.ts     # User profile endpoints
│   │   ├── roadmap.routes.ts     # Career roadmap endpoints
│   │   ├── skillPassport.routes.ts # Skill passport endpoints
│   │   ├── opportunities.routes.ts # Opportunity matching endpoints
│   │   ├── progress.routes.ts    # Progress tracking endpoints
│   │   └── webhook.routes.ts     # Clerk webhook handler
│   └── lib/
│       └── prisma.ts            # Prisma client initialization
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Database seeding script
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔐 Authentication

All endpoints (except webhooks) require Clerk authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <clerk_session_token>
```

The `requireAuth` middleware verifies the token, syncs the user to the database, and attaches user data to the request.

## 📡 API Endpoints

### Profile Routes (`/api/profile`)
- `GET /` - Get authenticated user's profile
- `POST /` - Create/update user profile
- `GET /:userId` - Get another user's profile (public)

### Roadmap Routes (`/api/roadmap`)
- `GET /` - Get user's career roadmap
- `POST /` - Create/update roadmap
- `GET /:userId` - Get another user's roadmap
- `POST /generate` - Generate AI-powered roadmap

### Skill Passport Routes (`/api/skill-passport`)
- `GET /` - Get user's skill passport entries
- `POST /` - Save skill passport entries
- `GET /:userId` - Get another user's skill passport
- `POST /generate` - Generate skill passport from life roles

### Opportunities Routes (`/api/opportunities`)
- `GET /` - Get all opportunities
- `POST /match` - Match user with opportunities based on profile

### Progress Routes (`/api/progress`)
- `GET /` - Get comprehensive dashboard data (progress, analytics, insights)
- `GET /:userId` - Get user's progress logs
- `POST /update` - Create new progress log entry

### Webhook Routes (`/api/webhooks`)
- `POST /clerk` - Clerk webhook handler (syncs user data)

## 🗄️ Database Schema

The backend uses Prisma ORM with PostgreSQL. Key models:

- **User** - Core user account (synced from Clerk)
- **Profile** - User profile data (age, education, skills, interests, etc.)
- **Roadmap** - Career roadmap with 5-step journey
- **SkillPassportEntry** - Mapped life skills to professional skills
- **GeneratedContent** - AI-generated content (resume, bio, pitch)
- **Opportunity** - Job/scholarship opportunities
- **OpportunityMatch** - Match results between user and opportunity
- **ProgressLog** - Daily progress tracking (streak, confidence, tasks)

## 🔄 Workflow

### User Signup/Login
1. User signs up via Clerk
2. Clerk webhook syncs user to database
3. User completes onboarding (creates profile)

### Skill Passport Generation
1. User selects life roles (homemaker, caregiver, cook, etc.)
2. Backend maps roles to professional skills
3. AI generates resume summary, bio, and elevator pitch
4. Data saved to database

### Opportunity Matching
1. User triggers matching via dashboard
2. Backend fetches user profile and all opportunities
3. Matches each opportunity based on: age, education, region, skills/interests
4. Categorizes matches as: eligible, almost eligible, future
5. Returns categorized matches with missing criteria

### Progress Tracking
1. User updates daily progress on dashboard
2. Backend calculates streak, confidence trend, task completion
3. Dashboard generates personalized insights and recommendations

## 🌱 Environment Configuration

Create `.env.local` in the project root with:

```env
# Required for production
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=...

# Optional
PORT=5000
FRONTEND_URL=https://sherise.example.com
NODE_ENV=production
```

## 📦 Build & Deployment

### Development
```bash
npm run dev        # Start with hot reload
npm run build      # Compile TypeScript
npm start          # Start production server
```

### Render Deployment

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables in Render dashboard
5. Render will auto-build and deploy on `main` branch pushes

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio GUI for database

## 🛠️ Technologies

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Clerk** - Authentication
- **Google Gemini** - AI content generation
- **Zod** - Schema validation
- **Svix** - Webhook verification

## 📖 API Documentation

For detailed endpoint documentation with examples, see individual route files in `src/routes/`.

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

## 📄 License

MIT

## 🆘 Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL server is running
- Check firewall/network permissions

### Clerk Authentication Failed
- Verify `CLERK_SECRET_KEY` is valid
- Check token format in Authorization header
- Ensure Clerk webhook is properly configured

### AI Generation Failed
- Verify `GEMINI_API_KEY` is valid
- Check Google Cloud API is enabled
- Review error logs for rate limiting

## 📞 Support

For issues or questions, please create an issue on GitHub or contact the development team.
