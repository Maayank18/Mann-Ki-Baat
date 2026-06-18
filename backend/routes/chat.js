import express from 'express';
import Groq from 'groq-sdk';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Memory from '../models/Memory.js';
import User from '../models/User.js';
import { executeGroqWithFallback } from '../utils/groqFallback.js';

const router = express.Router();

const SYSTEM_PROMPT = `You are a warm, emotionally supportive, and patient voice companion for senior citizens called "MANN KI BAAT" (Aapki baat sunne wala dost). 
Your target users are 50+ years old. 

Rules:
1. Speak warmly and respectfully. Use simple language. Avoid complex English or slang.
2. CRITICAL: NEVER mix languages or provide translations in brackets. If the user speaks Hindi, reply ONLY in Hindi. If English, reply ONLY in English. If Hinglish, reply ONLY in Hinglish. Do NOT output bilingual responses.
3. VERY IMPORTANT GUARDRAIL: If the user's spoken language heavily conflicts with their explicitly configured "User Language Setting" (e.g., setting is English but user speaks Hindi), you MUST reply exactly and ONLY with the string: "[LANGUAGE_MISMATCH]". Do NOT answer their prompt.
4. Keep responses SHORT (1-2 sentences). Do not give long answers.
5. Ask ONE simple follow-up question at a time to keep the conversation going gently.
6. NEVER act as a doctor, therapist, or lawyer. No medical diagnosis.
7. Use light humor if appropriate, but never be harsh or judgmental.
8. Always validate their feelings.
9. Use their memory to personalize the conversation.
`;

router.post('/send', async (req, res) => {
  try {
    const { userId, sessionId, text, language } = req.body;
    if (!userId || !sessionId || !text) return res.status(400).json({ error: 'userId, sessionId, and text are required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch memory
    const memories = await Memory.find({ userId });
    const memoryString = memories.length > 0 
      ? `User Memories:\n${memories.map(m => `- ${m.key}: ${m.value}`).join('\n')}` 
      : 'No previous memory context.';

    // Fetch last 5 conversation turns
    // Fetch last 10 conversation turns for this specific session
    const history = await Conversation.find({ userId, sessionId }).sort({ createdAt: -1 }).limit(10).lean();
    history.reverse(); // chronological

    const messages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\nUser Language Setting: ${language}\n\n${memoryString}\n\nUser Name: ${user.name}` }
    ];

    history.forEach(msg => {
      messages.push({ role: msg.role, content: msg.messageText });
    });

    messages.push({ role: 'user', content: text });

    // Save user message
    const userMsg = new Conversation({ userId, sessionId, role: 'user', messageText: text, transcriptLanguage: language });
    await userMsg.save();

    // Call Groq using fallback
    const assistantText = await executeGroqWithFallback(async (groq) => {
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        max_tokens: 150,
      });
      return chatCompletion.choices[0]?.message?.content || "Mujhe aawaz nahi aayi, kya aap fir se bolenge?";
    });

    if (assistantText.includes('[LANGUAGE_MISMATCH]')) {
      return res.json({ languageMismatch: true });
    }

    // Save assistant message
    const assistantMsg = new Conversation({ userId, sessionId, role: 'assistant', messageText: assistantText });
    await assistantMsg.save();

    // Simple memory extraction (async, don't block response)
    extractMemory(userId, text);

    res.json({
      assistantText,
      emotionTag: "warm",
      conversationId: assistantMsg._id,
      language: user.preferredLanguage
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

router.get('/history/:userId/:sessionId', async (req, res) => {
  try {
    const history = await Conversation.find({ userId: req.params.userId, sessionId: req.params.sessionId }).sort({ createdAt: 1 });
    res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.get('/sessions/:userId', async (req, res) => {
  try {
    const sessions = await Conversation.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.params.userId) } },
      { $sort: { createdAt: 1 } },
      { $group: {
          _id: "$sessionId",
          firstMessage: { $first: "$messageText" },
          createdAt: { $first: "$createdAt" }
      }},
      { $sort: { createdAt: -1 } }
    ]);
    res.json(sessions);
  } catch (error) {
    console.error('Sessions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

async function extractMemory(userId, userText) {
  try {
    const prompt = `Extract any stable personal details from the following user message. Return ONLY a JSON array of objects with 'key' and 'value'. If none, return []. Example: [{"key": "city", "value": "Delhi"}]. Message: "${userText}"`;
    
    await executeGroqWithFallback(async (groq) => {
      const extraction = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      const content = extraction.choices[0]?.message?.content;
      if (content) {
        let data = JSON.parse(content);
        let arr = Array.isArray(data) ? data : Object.values(data)[0];
        if (Array.isArray(arr)) {
          for (const item of arr) {
            if (item.key && item.value) {
              const existing = await Memory.findOne({ userId, key: item.key });
              if (existing) {
                existing.value = item.value;
                await existing.save();
              } else {
                const mem = new Memory({ userId, key: item.key, value: item.value });
                await mem.save();
              }
            }
          }
        }
      }
    });
  } catch (err) {
    console.error("Memory extraction failed silently:", err);
  }
}

export default router;
