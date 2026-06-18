import mongoose from 'mongoose';

const MemorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  key: { type: String, required: true },
  value: { type: String, required: true },
  confidence: { type: Number, default: 1.0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Memory', MemorySchema);
