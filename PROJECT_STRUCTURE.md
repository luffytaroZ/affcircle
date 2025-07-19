# Project Structure Documentation

## 📁 Architecture Overview

This application follows a modern full-stack architecture with clear separation of concerns:

```
/app/
├── node-backend/              # Node.js Express.js Backend
├── frontend/                  # React Frontend Application
├── .emergent/                 # Platform Configuration
├── package.json              # Root project configuration
├── README.md                 # Main documentation
├── PROJECT_STRUCTURE.md      # This file
├── FIXES_SUMMARY.md          # Technical implementation notes
└── test_result.md            # Testing and validation records
```

## 🎯 Backend Architecture (`/app/node-backend/`)

### Core Structure
```
node-backend/
├── src/
│   ├── server.js             # Main Express server
│   ├── routes/               # API route handlers
│   └── lib/                  # Utilities and services
├── videos/                   # Generated video storage
├── build/                    # Remotion build artifacts
├── package.json              # Backend dependencies
├── .env                      # Environment configuration
└── remotion.config.ts        # Video processing configuration
```

### Key Components

**Server Configuration:**
- **Framework**: Express.js with modern async/await patterns
- **Port**: 8001 (internal), mapped externally via supervisor
- **Database**: Supabase PostgreSQL with real-time capabilities
- **Authentication**: Supabase Auth integration
- **AI Services**: OpenAI GPT-4 integration for content generation

**Database Tables:**
- `videos` - Slideshow video records with metadata
- `threads` - AI-generated thread content and status
- `funnels` - Future funnel builder data (prepared)

**API Endpoints:**
- Authentication routes (`/api/auth/*`)
- Slideshow routes (`/api/generate-slideshow`, `/api/videos`, `/api/video-status`)  
- Thread maker routes (`/api/generate-thread`, `/api/threads`, `/api/thread-status`)
- Health monitoring (`/health`, `/api/health`)

## 🎨 Frontend Architecture (`/app/frontend/`)

### Core Structure
```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Auth/            # Authentication components
│   │   ├── Dashboard/       # Dashboard-specific components  
│   │   ├── Slideshow/       # Video generation components
│   │   └── Thread/          # Thread maker components
│   ├── pages/               # Main page components
│   │   ├── Login.js         # Authentication page
│   │   ├── Dashboard.js     # Main dashboard
│   │   └── Demo.js          # Feature demonstration
│   ├── lib/
│   │   └── supabase.js      # Supabase client configuration
│   └── App.js               # Root application component
├── public/                  # Static assets
├── package.json             # Frontend dependencies
└── .env                     # Environment configuration
```

### Technology Stack

**Core Framework:**
- **React 18**: Latest React with hooks and concurrent features
- **React Router**: Client-side routing and navigation
- **Tailwind CSS**: Utility-first styling framework

**UI Components:**
- **Custom Components**: Handcrafted for specific use cases  
- **Responsive Design**: Mobile-first approach
- **Modern Aesthetics**: Glassmorphism and gradient designs
- **Smooth Animations**: Micro-interactions and transitions

**State Management:**
- **React Context**: Authentication state management
- **Local State**: Component-level state with hooks
- **Supabase Real-time**: Live data synchronization

## 🔧 Configuration & Environment

### Backend Environment (`/app/node-backend/.env`)
```bash
# Database & Authentication
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# AI Integration
OPENAI_API_KEY=sk-proj-your-key
OPENAI_ORG_ID=org-your-org-id

# Server Configuration  
PORT=8001
NODE_ENV=production
VIDEO_OUTPUT_DIR=./videos
```

### Frontend Environment (`/app/frontend/.env`)
```bash
REACT_APP_BACKEND_URL=https://your-backend-url
WDS_SOCKET_PORT=443
```

## 📊 Data Flow Architecture

### User Authentication Flow
1. **Frontend**: User submits credentials via React form
2. **Supabase**: Authenticates user and returns session token
3. **Backend**: Validates session for protected routes
4. **Database**: Row Level Security enforces data access

### Content Generation Flow  
1. **Frontend**: User submits content request
2. **Backend**: Validates input and queues processing
3. **AI Service**: OpenAI generates intelligent content
4. **Database**: Stores results and progress status
5. **Real-time**: Updates pushed to frontend via Supabase

### Video Processing Flow
1. **Backend**: Receives slideshow generation request
2. **Remotion**: Processes video with themes and content
3. **Storage**: Saves MP4 files to local directory
4. **Database**: Updates video record with completion status
5. **Frontend**: Displays generated video to user

## 🗄️ Database Schema

### Videos Table (Supabase PostgreSQL)
```sql
videos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  theme VARCHAR(50),
  duration INTEGER,
  status VARCHAR(20),
  progress INTEGER,
  video_url TEXT,
  created_at TIMESTAMP,
  metadata JSONB
)
```

### Threads Table (Supabase PostgreSQL)  
```sql
threads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  topic TEXT NOT NULL,
  platform VARCHAR(20),
  style VARCHAR(20), 
  thread_length INTEGER,
  status VARCHAR(20),
  progress INTEGER,
  content JSONB,
  created_at TIMESTAMP
)
```

## 🚀 Deployment Architecture

### Process Management
- **Supervisor**: Manages both frontend and backend services
- **Backend Process**: Node.js server on port 8001
- **Frontend Process**: React development server on port 3000
- **Health Monitoring**: Automatic restart on failures

### Service Communication
- **Internal**: Backend runs on `0.0.0.0:8001`
- **External**: Kubernetes ingress handles routing
- **API Routes**: All backend APIs prefixed with `/api`
- **Static Assets**: Frontend serves from port 3000

### File System Layout
```
/app/
├── node-backend/videos/      # Generated video files
├── frontend/build/           # Production React build
└── .emergent/               # Platform configuration
```

## 🔍 Development Workflow

### Code Organization
- **Modular Design**: Clear separation between components
- **API-First**: Backend designed as RESTful API service
- **Component Reusability**: Shared UI components across pages
- **Error Boundaries**: Comprehensive error handling

### Quality Assurance  
- **ESLint**: Code style and quality enforcement
- **Testing**: Comprehensive API and UI testing framework
- **Documentation**: Inline JSDoc comments
- **Version Control**: Git-based development workflow

## Recent Changes
- ✅ Migrated from MongoDB to Supabase PostgreSQL
- ✅ Node.js backend implementation  
- ✅ Supabase authentication integration
- ✅ OpenAI GPT-4 content generation
- ✅ Remotion video processing
- ✅ Modern React 18 frontend
- ✅ Cloud-ready deployment configuration

## 🎯 Performance Optimizations

### Backend Performance
- **Express.js**: Lightweight and fast HTTP server
- **Connection Pooling**: Efficient database connections
- **Async/Await**: Non-blocking request handling
- **Error Handling**: Graceful failure management

### Frontend Performance  
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo for expensive components
- **Bundle Optimization**: Webpack optimization
- **Asset Compression**: Optimized images and styles

### Database Performance
- **Indexed Queries**: Optimized database indexes
- **RLS Policies**: Efficient row-level security
- **JSONB Fields**: Flexible schema with fast queries
- **Real-time Updates**: Efficient change notifications

---

This structure supports scalable development and deployment with clear boundaries between services and responsibilities.