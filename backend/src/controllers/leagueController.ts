import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export async function getLeagues(_req: Request, res: Response, next: NextFunction) {
  try {
    const leagues = await prisma.league.findMany({ orderBy: { name: 'asc' } });
    res.json({ data: leagues });
  } catch (e) {
    next(e);
  }
}

export async function getLeagueById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const league = await prisma.league.findUniqueOrThrow({
      where: { id },
      include: {
        teams: true,
        matches: {
          where: { status: { in: ['SCHEDULED', 'LIVE'] } },
          orderBy: { matchDate: 'asc' },
          take: 20,
          include: { homeTeam: true, awayTeam: true, prediction: true },
        },
      },
    });
    res.json({ data: league });
  } catch (e) {
    next(e);
  }
}
