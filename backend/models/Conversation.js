import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  messageText: { type: String, required: true },
  transcriptLanguage: { type: String },
  emotionTag: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Conversation', ConversationSchema);
