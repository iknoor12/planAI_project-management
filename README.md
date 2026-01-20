# 🎯 PlanAI - AI-Powered Project Management Tool

A modern, full-stack project management application with AI capabilities, built with React, Node.js, Express, and MongoDB.

## ✨ Features

- **User Authentication**: JWT-based secure registration and login
- **Project Management**: Create, update, and delete projects
- **Kanban Board**: Drag-and-drop task management with three columns (To Do, In Progress, Done)
- **Task CRUD**: Full task lifecycle with title, description, status, priority, and due dates
- **Dashboard Statistics**: Real-time project metrics and task analytics
- **AI Assistant**:
  - Generate tasks from project descriptions
  - Break down tasks into subtasks
  - Analyze task delays and get improvement suggestions
  - General project management advice via chat

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express**: Server framework
- **MongoDB** & **Mongoose**: Database and ODM
- **JWT**: Authentication
- **OpenAI API**: AI-powered features
- **bcryptjs**: Password hashing

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **React Beautiful DnD**: Drag and drop
- **Axios**: HTTP client
- **date-fns**: Date formatting

## 📁 Project Structure

```
planAI/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── openai.js          # OpenAI configuration
│   │   ├── controllers/
│   │   │   ├── authController.js   # Authentication logic
│   │   │   ├── projectController.js # Project CRUD
│   │   │   ├── taskController.js   # Task CRUD
│   │   │   └── aiController.js     # AI features
│   │   ├── middleware/
│   │   │   └── authMiddleware.js   # JWT verification
│   │   ├── models/
│   │   │   ├── User.js             # User schema
│   │   │   ├── Project.js          # Project schema
│   │   │   └── Task.js             # Task schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # Auth endpoints
│   │   │   ├── projectRoutes.js    # Project endpoints
│   │   │   ├── taskRoutes.js       # Task endpoints
│   │   │   └── aiRoutes.js         # AI endpoints
│   │   ├── services/
│   │   │   └── aiService.js        # AI business logic
│   │   ├── app.js                  # Express app setup
│   │   └── server.js               # Server entry point
│   ├── .env.example                # Environment variables template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── api.js              # Axios configuration
    │   │   ├── authApi.js          # Auth API calls
    │   │   ├── projectApi.js       # Project API calls
    │   │   ├── taskApi.js          # Task API calls
    │   │   └── aiApi.js            # AI API calls
    │   ├── components/
    │   │   ├── KanbanBoard.jsx     # Drag-drop board
    │   │   ├── TaskCard.jsx        # Individual task card
    │   │   ├── AIChat.jsx          # AI assistant chat
    │   │   └── DashboardStats.jsx  # Statistics display
    │   ├── context/
    │   │   └── AuthContext.jsx     # Authentication state
    │   ├── pages/
    │   │   ├── Login.jsx           # Login page
    │   │   ├── Register.jsx        # Registration page
    │   │   ├── Dashboard.jsx       # Projects dashboard
    │   │   └── ProjectBoard.jsx    # Project board view
    │   ├── styles/                 # CSS files
    │   ├── App.jsx                 # Main app component
    │   └── main.jsx                # React entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher) - Running locally or MongoDB Atlas
- **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com)

### Installation

#### 1. Clone or navigate to the project directory

```bash
cd planAI_project-management/planAI
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your credentials
# Required variables:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string
# - OPENAI_API_KEY: Your OpenAI API key
```

**Example .env file:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/planai
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
OPENAI_API_KEY=sk-your-openai-api-key-here
FRONTEND_URL=http://localhost:5173
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install dependencies
npm install
```

### Running the Application

#### Start MongoDB (if running locally)

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services app
```

#### Start Backend Server

```bash
# From backend directory
cd backend
npm run dev

# Server will start on http://localhost:5000
```

#### Start Frontend Development Server

```bash
# From frontend directory (in a new terminal)
cd frontend
npm run dev

# Frontend will start on http://localhost:5173
```

#### Access the Application

Open your browser and navigate to: **http://localhost:5173**

## 📖 Usage Guide

### 1. Register/Login
- Create a new account or login with existing credentials
- Credentials are stored securely with bcrypt hashing

### 2. Create a Project
- Click "New Project" on the dashboard
- Enter project name, description, and choose a color
- Projects are immediately accessible

### 3. Manage Tasks
- Click on a project to open the board view
- Use "New Task" to create tasks
- Drag tasks between columns (To Do → In Progress → Done)
- Edit or delete tasks using the menu (⋮) button

### 4. Use AI Assistant
- Click "AI Assistant" button in project board
- Ask for help:
  - "Generate tasks for building a mobile app"
  - "Break down 'Setup CI/CD pipeline' into subtasks"
  - "How should I prioritize my tasks?"
- AI can generate tasks directly into your project

### 5. Monitor Progress
- View statistics at the top of project board
- Track total, in-progress, completed, and overdue tasks

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Projects
- `GET /api/projects` - Get all user projects (protected)
- `GET /api/projects/:id` - Get single project (protected)
- `POST /api/projects` - Create project (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)

### Tasks
- `GET /api/tasks/project/:projectId` - Get project tasks (protected)
- `GET /api/tasks/:id` - Get single task (protected)
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)
- `GET /api/tasks/stats/:projectId` - Get task statistics (protected)

### AI
- `POST /api/ai/generate-tasks` - Generate tasks from description (protected)
- `POST /api/ai/generate-subtasks` - Generate subtasks (protected)
- `POST /api/ai/analyze-delays` - Analyze overdue tasks (protected)
- `POST /api/ai/chat` - Chat with AI assistant (protected)

## 🎨 Key Features Explained

### MVC Architecture
- **Models**: Data schemas and business logic (User, Project, Task)
- **Views**: React components for UI
- **Controllers**: Request handling and response logic

### JWT Authentication
- Tokens stored in localStorage
- Automatic token inclusion in requests via Axios interceptors
- Protected routes redirect to login if unauthorized

### Drag & Drop
- Powered by `react-beautiful-dnd`
- Real-time status updates when tasks are moved
- Smooth animations and visual feedback

### AI Integration
- Uses OpenAI GPT-3.5-turbo model
- Structured prompts for consistent outputs
- Error handling for API failures

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Verify connection string in .env
MONGO_URI=mongodb://localhost:27017/planai
```

### OpenAI API Errors
- Verify API key is valid and has credits
- Check rate limits on OpenAI dashboard
- Ensure API key is correctly set in .env

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=5001

# Or kill process using port 5000
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### CORS Issues
- Ensure `FRONTEND_URL` in backend .env matches frontend URL
- Check CORS configuration in backend/src/app.js

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/planai
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
OPENAI_API_KEY=sk-your-key-here
FRONTEND_URL=http://localhost:5173
```

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Store secrets in environment variables
4. Use process managers like PM2
5. Enable HTTPS

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to hosting service
```

## 🤝 Contributing

This is a learning project. Feel free to:
- Fork the repository
- Add new features
- Improve existing functionality
- Submit pull requests

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 🙏 Acknowledgments

- OpenAI for GPT API
- MongoDB for database
- React community for amazing tools
- All open-source contributors

---

**Built with ❤️ using React, Node.js, and AI**
