import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../services/dbService.js';

export const userRouter = Router();

userRouter.get('/user/profile', async (req, res) => {
  try {
    const profile = await getUserProfile();
    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get profile' });
  }
});

userRouter.put('/user/profile', async (req, res) => {
  try {
    const updated = await updateUserProfile(req.body);
    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});
