import prisma from '../../utils/prisma';
import { predictScore } from './poissonModel';
import { H2HRecord } from '../../types';
import logger from '../../utils/logger';

async function getLeagueAvgGoals(leagueId: number, season: number): Promise<number> {
  const stats = await prisma.teamStats.findMany({
    where: { leagueId, season },
  });
  if (stats.length === 0) return 1.3;
  const totalGoals = stats.reduce((s, t) => s + t.goalsFor, 0);
  const totalMatches = stats.reduce((s, t) => s + t.wins + t.draws + t.losses, 0);
  return totalMatches > 0 ? totalGoals / totalMatches : 1.3;
}

function buildH2H(fixtures: any[]): H2HRecord {
  let homeWins = 0, draws = 0, awayWins = 0;
  const matches = fixtures.slice(0, 5).map((f: any) => {
    const hg = f.goals.home ?? 0;
    const ag = f.goals.away ?? 0;
    if (hg > ag) homeWins++;
    else if (hg === ag) draws++;
    else awayWins++;
    return {
      date: f.fixture.date,
      homeScore: hg,
      awayScore: ag,
    };
  });
  return { homeWins, draws, awayWins, matches };
}

export async function generatePredictionForMatch(matchId: number) {
  const match = await prisma.match.findUniqueOrThrow({
    where: { id: matchId },
    include: {
      homeTeam: { include: { stats: true } },
      awayTeam: { include: { stats: true } },
      league: true,
    },
  });

  const season = match.season;
  const homeStats = match.homeTeam.stats.find(
    (s) => s.leagueId === match.leagueId && s.season === season
  );
  const awayStats = match.awayTeam.stats.find(
    (s) => s.leagueId === match.leagueId && s.season === season
  );

  if (!homeStats || !awayStats) {
    logger.warn(`Stats missing for match ${matchId}`);
    return null;
  }

  const homeGames = homeStats.wins + homeStats.draws + homeStats.losses || 1;
  const awayGames = awayStats.wins + awayStats.draws + awayStats.losses || 1;

  const leagueAvg = await getLeagueAvgGoals(match.leagueId, season);

  const h2h: H2HRecord = { homeWins: 0, draws: 0, awayWins: 0, matches: [] };

  const result = predictScore(
    {
      avgGoalsFor: homeStats.goalsFor / homeGames,
      avgGoalsAgainst: homeStats.goalsAgainst / homeGames,
      form: homeStats.form,
    },
    {
      avgGoalsFor: awayStats.goalsFor / awayGames,
      avgGoalsAgainst: awayStats.goalsAgainst / awayGames,
      form: awayStats.form,
    },
    leagueAvg,
    h2h
  );

  const prediction = await prisma.prediction.upsert({
    where: { matchId },
    update: {
      predictedHome: result.predictedHome,
      predictedAway: result.predictedAway,
      homeWinProb: result.homeWinProb,
      drawProb: result.drawProb,
      awayWinProb: result.awayWinProb,
      confidence: result.confidence,
      factors: result.factors as any,
    },
    create: {
      matchId,
      predictedHome: result.predictedHome,
      predictedAway: result.predictedAway,
      homeWinProb: result.homeWinProb,
      drawProb: result.drawProb,
      awayWinProb: result.awayWinProb,
      confidence: result.confidence,
      factors: result.factors as any,
    },
  });

  return prediction;
}

export async function generateAllPredictions() {
  const matches = await prisma.match.findMany({
    where: { status: 'SCHEDULED' },
    select: { id: true },
  });

  let count = 0;
  for (const m of matches) {
    try {
      await generatePredictionForMatch(m.id);
      count++;
    } catch (e) {
      logger.warn(`Failed prediction for match ${m.id}: ${e}`);
    }
  }
  return count;
}
