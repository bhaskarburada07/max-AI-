import { Router } from 'express';
import { getReportsSummary } from '../services/dbService.js';

export const reportsRouter = Router();

reportsRouter.get('/reports', async (req, res) => {
  try {
    const summary = await getReportsSummary();
    res.json({ success: true, ...summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate reports' });
  }
});
