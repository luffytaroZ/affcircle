# 🏗️ Project Structure

## Overview
Full-stack application with React frontend, Node.js backend, and Supabase PostgreSQL database.

## Directory Structure

```
/app/
├── backend/ (Legacy - REMOVED)
├── node-backend/              # ✅ Node.js Backend (ACTIVE)
│   ├── src/
│   │   ├── server.js          # Main server file
│   │   └── remotion/          # Remotion video compositions
│   ├── llm_service.py         # Python LLM service for AI features
│   ├── videos/                # Video output directory
│   ├── package.json           # Node.js dependencies
│   └── .env                   # Backend environment variables
├── frontend/                  # ✅ React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── lib/               # Utility libraries
│   │   └── App.js             # Main app component
│   ├── package.json           # Frontend dependencies
│   └── .env                   # Frontend environment variables
├── tests/                     # Test files
├── scripts/                   # Utility scripts (CLEANED)
├── remotion/ (Legacy - REMOVED)
├── test_result.md             # Testing data and communication
├── supabase_migration*.sql    # Database migration files (REFERENCE ONLY)
└── README.md                  # Project documentation
```

## Architecture

### Backend (Node.js + Express)
- **Port**: 8001 (internal), mapped externally via Kubernetes
- **Database**: Supabase PostgreSQL
- **Features**: 
  - Slideshow generation with Remotion
  - Thread maker with OpenAI GPT-4
  - Authentication with Supabase
  - Video processing and analytics

### Frontend (React)
- **Port**: 3000 (internal), accessible via external URL
- **State Management**: React Context + Hooks
- **UI Framework**: Tailwind CSS
- **Features**:
  - Authentication system
  - Dashboard with analytics
  - Slideshow generator interface
  - Thread maker interface
  - User profile management

### Database (Supabase PostgreSQL)
- **Tables**: videos, threads, funnels
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for files)

## Configuration Files

### Environment Variables
- **Backend**: `/app/node-backend/.env`
- **Frontend**: `/app/frontend/.env`

### Service Configuration
- Backend runs internally on 0.0.0.0:8001 via supervisor
- This internal port is correctly mapped to REACT_APP_BACKEND_URL
- Frontend accesses backend ONLY via REACT_APP_BACKEND_URL
- Backend accesses database ONLY via Supabase connection

## API Endpoints
All backend routes are prefixed with `/api/` for proper Kubernetes ingress routing.

### Core Endpoints:
- `GET /api/health` - Health check
- `POST /api/generate-slideshow` - Video generation
- `GET /api/videos` - List videos
- `POST /api/generate-thread` - AI thread generation
- `GET /api/threads` - List threads
- `POST /api/auth/*` - Authentication endpoints

## Development Workflow
1. Backend changes: Auto-restart via nodemon/supervisor
2. Frontend changes: Hot reload via React dev server
3. Database: Managed via Supabase dashboard
4. Testing: Via dedicated testing agents

## Recent Changes
- ✅ Migrated from MongoDB to Supabase PostgreSQL
- ✅ Node.js backend implementation
- ✅ Supabase authentication integration
- ✅ Remotion video generation
- ✅ OpenAI GPT-4 integration
- ✅ Modern React UI with Tailwind