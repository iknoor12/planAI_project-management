# 🚀 Setting Up Google Gemini API for PlanAI

## Problem: Gemini is Not Responsive

If Gemini AI features are not working, it's likely because your API key is not configured or is invalid. Follow this guide to fix it.

## Solution

### Step 1: Get Your Free Gemini API Key

1. Visit: https://ai.google.dev/tutorials/setup
2. Click **"Get API Key"** button
3. Select or create a Google Cloud project
4. Click **"Create API Key in Google Cloud Console"**
5. Copy the generated API key (it will look like: `AIzaSy...`)
6. ⚠️ **IMPORTANT**: Keep this key secret! Don't commit it to git.

### Step 2: Update Your .env File

Open `/planAI/backend/.env` and replace:

```env
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key_here
```

With your actual API key:

```env
GOOGLE_GENAI_API_KEY=AIzaSy_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart Your Backend Server

```bash
# Stop the current backend server (Ctrl+C)
# Then restart it:
cd planAI/backend
npm run dev
```

You should see output like:
```
Server running on port 4000
✅ MongoDB connected
```

### Step 4: Test Gemini Integration

Use the frontend AI Chat to test:
1. Open http://localhost:5173
2. Create or select a project
3. Click **"AI Assistant"** button
4. Send a message to Gemini

You should get a response within a few seconds.

## Troubleshooting

### Problem: "AI assistant is currently unavailable"

**Solution**: Your `GOOGLE_GENAI_API_KEY` is not configured properly.
- Check your .env file has the correct API key
- Make sure there are no extra spaces or quotes around the key
- Restart the backend server after updating .env

### Problem: Gemini responds very slowly

**Solution**: This might be due to:
- Network latency
- Gemini API load
- Try again in a few seconds

### Problem: "Error: GOOGLE_GENAI_API_KEY is not configured"

**Solution**: This error appears in the backend logs. It means the API key is missing or invalid.
- Get a new API key from: https://ai.google.dev/tutorials/setup
- Update .env file
- Restart backend

## What Changed?

The project uses the **Google Gemini API**:
- Model: `gemini-3.6-flash`
- Free tier available with generous rate limits

## Features Using Gemini

✅ AI Chat Assistant (`/api/ai/chat`)
✅ Generate Tasks (`/api/ai/generate-tasks`)
✅ Generate Subtasks (`/api/ai/generate-subtasks`)
✅ Analyze Delays (`/api/ai/analyze-delays`)

All features require a valid `GOOGLE_GENAI_API_KEY`.

## Free Tier Limits

Google Gemini free tier includes:
- **Rate Limit**: 15 requests per minute
- **Cost**: FREE for development
- **Perfect for**: PlanAI project management

No credit card required for free tier!

## Need Help?

- Gemini API Documentation: https://ai.google.dev/docs
- Get your API key: https://ai.google.dev/tutorials/setup
- Common issues: Check backend logs with `npm run dev`
