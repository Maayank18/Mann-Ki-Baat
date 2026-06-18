import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  preferredLanguage: { type: String, enum: ['hi', 'en', 'hinglish'], default: 'hinglish' },
  voicePreference: { type: String, default: 'female' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
