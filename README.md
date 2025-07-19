# 🎬 AI Content Creator Platform

A comprehensive platform for AI-powered content creation, featuring slideshow generation and social media thread creation with modern React frontend and Node.js backend.

## 🚀 Features

### ✅ Core Features
- **🎥 AI Slideshow Generator**: Create videos with Remotion and multiple themes
- **🧵 AI Thread Maker**: Generate social media threads with OpenAI GPT-4
- **👤 Authentication System**: Secure login with Supabase Auth
- **📊 Analytics Dashboard**: Track video performance and user activity
- **👨‍💼 User Profiles**: Complete profile management system

### 🔧 Technical Stack
- **Frontend**: React 19 + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + Supabase
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT-4, Remotion for video generation
- **Authentication**: Supabase Auth

## 🏗️ Architecture

### Backend Services
```
Node.js Backend (Port 8001)
├── API Routes (/api/*)
├── Supabase Integration
├── Remotion Video Processing
├── OpenAI GPT-4 Integration
└── Authentication Management
```

### Frontend Application
```
React Frontend (Port 3000)
├── Authentication System
├── Dashboard Interface
├── Slideshow Generator
├── Thread Maker
└── User Profile Management
```

### Database Schema
```sql
-- Videos Table
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  title TEXT,
  content TEXT,
  theme VARCHAR(50),
  duration INTEGER,
  status VARCHAR(50),
  created_at TIMESTAMP
);

-- Threads Table
CREATE TABLE threads (
  id UUID PRIMARY KEY,
  topic TEXT,
  style VARCHAR(50),
  thread_length INTEGER,
  platform VARCHAR(50),
  content JSONB,
  created_at TIMESTAMP
);

-- Funnels Table (Future Enhancement)
CREATE TABLE funnels (
  id UUID PRIMARY KEY,
  name TEXT,
  config JSONB,
  analytics JSONB,
  created_at TIMESTAMP
);
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Yarn package manager
- Supabase account
- OpenAI API key

### Environment Setup

1. **Backend Configuration** (`/app/node-backend/.env`)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
PORT=8001
```

2. **Frontend Configuration** (`/app/frontend/.env`)
```env
REACT_APP_BACKEND_URL=your_backend_url
```

### Installation & Running

```bash
# Install dependencies
cd /app/node-backend && npm install
cd /app/frontend && yarn install

# Start services (managed by supervisor)
sudo supervisorctl restart all

# Check service status
sudo supervisorctl status
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Slideshow Endpoints
- `POST /api/generate-slideshow` - Create new video
- `GET /api/videos` - List all videos
- `GET /api/video-status/:id` - Get video status

### Thread Maker Endpoints
- `POST /api/generate-thread` - Create AI thread
- `GET /api/threads` - List all threads
- `GET /api/thread-status/:id` - Get thread status
- `DELETE /api/thread/:id` - Delete thread

## 🎨 Available Themes

### Slideshow Themes
1. **Minimal**: Clean, simple design
2. **Corporate**: Professional business style
3. **Storytelling**: Narrative-focused layout
4. **Modern**: Contemporary design patterns
5. **Creative**: Artistic and expressive
6. **Professional**: Business-oriented
7. **Elegant**: Sophisticated aesthetics
8. **Cinematic**: Movie-style presentation

### Thread Styles
1. **Engaging**: Interactive and conversational
2. **Educational**: Informative and structured
3. **Storytelling**: Narrative-driven content
4. **Professional**: Business-appropriate tone
5. **Viral**: Shareable and trending content

## 🔧 Development

### Project Structure
See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed architecture.

### Testing
```bash
# Backend testing
npm run test:backend

# Frontend testing
yarn test

# Full system testing (via testing agents)
# See test_result.md for testing protocols
```

### Deployment
This application is configured for Kubernetes deployment with:
- Automatic service discovery
- Health checks
- Environment-based configuration
- Horizontal scaling support

## 🏆 Recent Achievements

✅ **Migration Complete**: Successfully migrated from MongoDB to Supabase  
✅ **AI Integration**: OpenAI GPT-4 for advanced content generation  
✅ **Video Processing**: Remotion-based slideshow generation  
✅ **Modern UI**: React 19 + Tailwind CSS + Framer Motion  
✅ **Authentication**: Complete Supabase Auth integration  
✅ **Analytics**: User activity and video performance tracking  

## 🤝 Support

For technical support or feature requests, please refer to the testing protocols in `test_result.md` or contact the development team.

---

**Last Updated**: July 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅