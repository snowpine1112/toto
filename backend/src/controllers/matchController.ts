import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middlewares/errorHandler';

export async function getMatches(req: Request, res: Response, next: NextFunction) {
  try {
    const { leagueId, status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (leagueId) where.leagueId = parseInt(leagueId as string);
    if (status) where.status = status;

    const [total, matches] = await Promise.all([
      prisma.match.count({ where }),
      prisma.match.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { matchDate: 'asc' },
        include: { homeTeam: true, awayTeam: true, league: true, prediction: true },
      }),
    ]);

    res.json({
      data: matches,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function getMatchById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: { include: { stats: true } },
        awayTeam: { include: { stats: true } },
        league: true,
        prediction: true,
      },
    });
    if (!match) throw new AppError(404, 'Match not found');
    res.json({ data: match });
  } catch (e) {
    next(e);
  }
}

export async function getMatchPrediction(req: Request, res: Response, next: NextFunction) {
  try {
    const matchId = parseInt(req.params.id);
    const prediction = await prisma.prediction.findUnique({ where: { matchId } });
    if (!prediction) throw new AppError(404, 'Prediction not found');
    res.json({ data: prediction });
  } catch (e) {
    next(e);
  }
}
