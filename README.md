# AffCircle

A comprehensive video generation and marketing funnel platform that combines AI-powered video creation with visual funnel building capabilities.

## 🚀 Features

- **AI Video Generation**: Create professional videos using Remotion with multiple themes
- **Visual Funnel Builder**: Build marketing funnels with drag-and-drop interface using GrapesJS
- **Thread Maker**: Generate social media content threads
- **Video Analytics**: Track video performance and engagement
- **User Authentication**: Secure user management with Supabase
- **Demo Mode**: Try features without registration
- **Real-time Slideshow Generation**: Dynamic content creation

## 🏗️ Architecture

### Frontend
- **React 19** with modern hooks and concurrent features
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **GrapesJS** for visual page building
- **React Router** for navigation
- **Supabase** for authentication and data

### Backend
- **Node.js** with Express server
- **Remotion** for video rendering
- **Supabase** integration
- **Video processing** with multiple composition themes

## 📋 Prerequisites

- Node.js 18+ 
- Supabase project
- **Yarn package manager** (recommended for workspace management and performance)

> **Note**: This project uses Yarn for better workspace management, faster installs, and deterministic dependency resolution - essential for video processing workflows and complex frontend dependencies.

## 🛠️ Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd affcircle

# Install root dependencies
yarn install

# Install frontend dependencies
cd frontend
yarn install
cd ..
```

### 2. Environment Setup

Create a `.env` file in the root directory:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Backend URL (backend uses dynamic port assignment)
REACT_APP_BACKEND_URL=http://localhost:PORT
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

The application will be available at:
- **Frontend**: `http://localhost:3000` (or `http://localhost:3002` if 3000 is busy)
- **Backend API**: `http://localhost:[dynamic-port]` (automatically assigned)

## 📦 Available Commands

### Root Level Commands
```bash
# Install all dependencies
yarn install

# Clear cache (if experiencing issues)
yarn cache clean
```

### Frontend Commands
```bash
cd frontend

# Start development server
yarn start

# Build for production
yarn build

# Run tests
yarn test

# Clear React cache
rm -rf node_modules/.cache && rm -rf .eslintcache
```

### Backend Commands
```bash
cd backend

# Start server
node server.js

# Install backend-specific dependencies (if needed)
yarn install
```

## 🔧 Development Workflow

### Starting Fresh Development Session
```bash
# 1. Clean slate setup
yarn cache clean

# 2. Fresh install
yarn install
cd frontend && yarn install && cd ..

# 3. Start backend (Terminal 1)
cd backend && node server.js

# 4. Start frontend (Terminal 2)
cd frontend && yarn start
```

### Cache Issues? Clear Everything
```bash
# Clear yarn cache
yarn cache clean

# Clear React build cache
cd frontend
rm -rf node_modules/.cache
rm -rf .eslintcache

# Restart development server
yarn start
```

## 🎬 Video Generation

The platform supports multiple video themes:

### Available Themes
- **Corporate**: Professional business presentations
- **Minimal**: Clean, minimalist design
- **Storytelling**: Narrative-focused layouts
- **Modern**: Contemporary design with bold visuals
- **Creative**: Artistic and dynamic layouts
- **Professional**: Formal business style
- **Elegant**: Sophisticated and refined
- **Cinematic**: Movie-like presentations

### Remotion Integration
Videos are generated using Remotion compositions located in:
- `backend/remotion/compositions/CorporateTheme.tsx`
- `backend/remotion/compositions/MinimalTheme.tsx`  
- `backend/remotion/compositions/StorytellingTheme.tsx`

## 🔧 Key Components

### Frontend Components
- **AuthModal**: User authentication interface
- **FunnelBuilder**: Visual funnel creation tool
- **VideoEditor**: Video editing interface
- **SlideshowGenerator**: Dynamic slideshow creation
- **ThreadMaker**: Social media thread generator
- **VideoAnalytics**: Performance tracking dashboard
- **UserProfile**: User account management
- **Navigation**: Main navigation component

### Pages
- **Dashboard**: Main user interface
- **DemoMode**: Feature demonstration without auth

## 🗄️ Database Integration

The application uses Supabase for:
- User authentication
- Video metadata storage
- Thread storage
- Real-time features

## 📁 Project Structure

```
affcircle/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── AuthContext.js  # Authentication context
│   │   └── supabase.js     # Supabase client
├── backend/                 # Node.js backend
│   ├── remotion/           # Video composition templates
│   │   ├── compositions/   # Theme-specific compositions
│   │   └── index.ts        # Remotion entry point
│   ├── videos/             # Generated video storage
│   └── server.js           # Express backend server
└── package.json            # Root dependencies
```

## 🚨 Troubleshooting

### "Failed to generate slideshow: Failed to fetch"
This error occurs when the backend URL is not properly configured:

**Solution:**
1. Ensure backend is running (check console output for actual port)
2. Check if `.env` file has `REACT_APP_BACKEND_URL` set
3. Clear cache and restart:
   ```bash
   yarn cache clean
   cd frontend && rm -rf node_modules/.cache && yarn start
   ```

### Port Conflicts
- **Frontend**: If port 3000 is busy, React will automatically use 3002 or next available port.
- **Backend**: Uses dynamic port assignment - if 8001 is busy, automatically finds next available port.

### Cache Issues
Clear all caches if experiencing unexpected behavior:
```bash
# Clear yarn cache
yarn cache clean

# Clear React cache
cd frontend
rm -rf node_modules/.cache
rm -rf .eslintcache

# Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Backend Connection Issues
1. Verify backend is running: check console output for port, then test health endpoint
2. Check for CORS issues in browser console
3. Ensure environment variables are set correctly

## 🚀 Deployment

### Frontend Build
```bash
cd frontend
yarn build
```

### Backend Deployment
Ensure all environment variables are set in your production environment:
```bash
cd backend
node server.js
```

## 🔍 API Endpoints

### Video Generation
- `POST /api/generate-slideshow` - Create new slideshow
- `GET /api/video-status/:id` - Check video generation status
- `GET /api/videos` - List all videos

### Thread Generation  
- `POST /api/generate-thread` - Create social media thread
- `GET /api/threads` - List all threads
- `GET /api/thread-status/:id` - Check thread status

### Funnel Management
- `GET /api/funnels` - List all funnels
- `POST /api/create-funnel` - Create new funnel
- `PUT /api/funnel/:id` - Update funnel
- `DELETE /api/funnel/:id` - Delete funnel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly with both frontend and backend
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Submit a pull request

## 📝 License

[Add your license information here]

## 🆘 Support

For support and questions, please [create an issue](link-to-issues) or contact the development team.

---

Built with ❤️ using React, Node.js, and Remotion
