import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middlewares/errorHandler';

export async function getCurrentToto(_req: Request, res: Response, next: NextFunction) {
  try {
    const round = await prisma.totoRound.findFirst({
      where: { status: 'open' },
      orderBy: { deadline: 'asc' },
      include: {
        matches: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
                league: true,
                prediction: true,
              },
            },
          },
        },
      },
    });

    if (!round) {
      res.json({ data: null });
      return;
    }

    const matches = round.matches.map((rm) => rm.match);
    res.json({
      data: {
        round: {
          id: round.id,
          name: round.roundName,
          deadline: round.deadline,
          status: round.status,
        },
        matches,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function getTotoRound(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.roundId);
    const round = await prisma.totoRound.findUnique({
      where: { id },
      include: {
        matches: {
          include: {
            match: {
              include: {
                homeTeam: true,
                awayTeam: true,
                league: true,
                prediction: true,
              },
            },
          },
        },
      },
    });
    if (!round) throw new AppError(404, 'TotoRound not found');
    res.json({ data: round });
  } catch (e) {
    next(e);
  }
}
