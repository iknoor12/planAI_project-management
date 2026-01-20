# 🚀 Quick Start Guide

## Steps to Run PlanAI

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and OpenAI API key
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Start MongoDB
```bash
# Make sure MongoDB is running on localhost:27017
# Or use MongoDB Atlas connection string in .env
```

### 5. Start Backend Server
```bash
cd backend
npm run dev
# Backend will run on http://localhost:5000
```

### 6. Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

### 7. Open Browser
Navigate to: **http://localhost:5173**

## Default Test Account (optional)
You can create a new account through the register page.

## Important Notes
- ✅ Make sure MongoDB is running before starting the backend
- ✅ Add your OpenAI API key to backend/.env for AI features
- ✅ JWT_SECRET should be a long random string
- ✅ Both backend and frontend must be running simultaneously

## Troubleshooting
- If port 5000 is in use, change PORT in backend/.env
- If MongoDB connection fails, check MONGO_URI in backend/.env
- For AI features to work, OPENAI_API_KEY must be valid

## Project Features to Test
1. ✅ Register/Login
2. ✅ Create a project
3. ✅ Create tasks in the project
4. ✅ Drag and drop tasks between columns
5. ✅ Click "AI Assistant" and ask it to generate tasks
6. ✅ View dashboard statistics
7. ✅ Edit/delete tasks

Enjoy using PlanAI! 🎯
