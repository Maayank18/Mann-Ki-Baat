import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Update settings
router.post('/update', async (req, res) => {
  try {
    const { userId, preferredLanguage, voicePreference } = req.body;
    
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (voicePreference) user.voicePreference = voicePreference;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Fetch settings
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export default router;
