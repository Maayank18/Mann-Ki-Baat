# Mann Ki Baat
A warm, mobile-first AI companion for senior citizens. 

## Features
- **Voice First:** Tap to speak, listens to Hindi, English, and Hinglish.
- **Supportive Persona:** Responds warmly using Groq (Llama-3).
- **Audio Output:** Reads out responses in clear audio.
- **Memory System:** Remembers user details for personalized conversations.
- **Senior Friendly UI:** Large buttons, high contrast, warm colors, simple passwordless login.

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- AI: Groq (Whisper for STT, Llama-3 for completions) + Google TTS (for speech generation)

## Setup Instructions

### 1. Backend Setup
1. Open terminal and `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `backend` folder and add your Groq API key and MongoDB URI:
```
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=mongodb://127.0.0.1:27017/mannkibaat
PORT=5000
```
4. Start the backend server: `npx nodemon server.js`

### 2. Frontend Setup
1. Open a new terminal and `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open the displayed local URL in your browser (preferably on a mobile device or responsive mode in DevTools).
