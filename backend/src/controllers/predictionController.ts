import { Request, Response, NextFunction } from 'express';
import { generateAllPredictions, generatePredictionForMatch } from '../services/prediction/predictionService';

export async function generatePredictions(_req: Request, res: Response, next: NextFunction) {
  try {
    const count = await generateAllPredictions();
    res.json({ data: { generated: count } });
  } catch (e) {
    next(e);
  }
}

export async function generateMatchPrediction(req: Request, res: Response, next: NextFunction) {
  try {
    const matchId = parseInt(req.body.matchId);
    const prediction = await generatePredictionForMatch(matchId);
    res.json({ data: prediction });
  } catch (e) {
    next(e);
  }
}
