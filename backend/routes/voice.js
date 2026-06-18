import express from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';
import fs from 'fs';
import googleTTS from 'google-tts-api';
import { executeGroqWithFallback } from '../utils/groqFallback.js';

const router = express.Router();

// Configure multer for audio upload
const upload = multer({ dest: 'uploads/' });

// STT endpoint using Groq Whisper
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  let audioFilePath = null;
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });

    // Groq Whisper requires a valid file extension. Multer strips it.
    audioFilePath = req.file.path + '.webm';
    fs.renameSync(req.file.path, audioFilePath);

    // Get user's language preference from the form data
    const userLang = req.body.language || 'hi';
    let whisperLang = 'hi'; // default Hindi (Devanagari script)
    if (userLang === 'en') whisperLang = 'en';
    // For 'hinglish', use 'hi' so Whisper transcribes in Devanagari, not Urdu

    // We keep the file on disk and create a FRESH ReadStream per fallback attempt.
    // This avoids: 1) Node File API incompatibility  2) Stream reuse errors
    const savedPath = audioFilePath; // capture for closure
    const transcription = await executeGroqWithFallback(async (groq) => {
      return await groq.audio.transcriptions.create({
        file: fs.createReadStream(savedPath),
        model: 'whisper-large-v3',
        language: whisperLang,
        response_format: 'json',
      });
    });

    res.json({ text: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  } finally {
    // Cleanup: use setTimeout to let any lingering stream handles close on Windows
    setTimeout(() => {
      if (audioFilePath) {
        try { if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath); } catch (_) {}
      }
      if (req.file) {
        try { if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); } catch (_) {}
      }
    }, 500);
  }
});

// TTS endpoint - proxies Google TTS audio to bypass CORS
router.post('/speak', async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    let langCode = 'hi';
    if (language === 'en') langCode = 'en';
    if (language === 'hinglish') langCode = 'hi-IN';

    // google-tts-api has a hard 200 character limit per request.
    let safeText = text;
    if (safeText.length > 200) {
      safeText = safeText.substring(0, 195);
      const lastSpace = safeText.lastIndexOf(' ');
      if (lastSpace > 0) safeText = safeText.substring(0, lastSpace);
    }
    
    const ttsUrl = googleTTS.getAudioUrl(safeText, {
      lang: langCode,
      slow: false,
      host: 'https://translate.google.com',
    });

    // Fetch the audio from Google on the server (bypasses browser CORS)
    const audioResponse = await fetch(ttsUrl);
    if (!audioResponse.ok) throw new Error('Google TTS fetch failed');
    
    const arrayBuffer = await audioResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:audio/mpeg;base64,${base64}`;

    res.json({ audioUrl: dataUri });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

export default router;
