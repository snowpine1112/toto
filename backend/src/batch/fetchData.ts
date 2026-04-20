import 'dotenv/config';
import prisma from '../utils/prisma';
import {
  fetchLeagues,
  fetchFixtures,
  fetchTeamStatistics,
} from '../services/football/apiFootball';
import logger from '../utils/logger';

const SEASON = 2025;
// Jリーグ (98) と主要欧州リーグ
const TARGET_LEAGUES = [98, 39, 135, 140, 78, 61];

async function upsertLeague(raw: any) {
  return prisma.league.upsert({
    where: { externalId: raw.league.id },
    update: {
      name: raw.league.name,
      country: raw.country.name,
      season: SEASON,
      logo: raw.league.logo,
    },
    create: {
      externalId: raw.league.id,
      name: raw.league.name,
      country: raw.country.name,
      season: SEASON,
      logo: raw.league.logo,
    },
  });
}

async function upsertTeam(raw: any, leagueId: number) {
  return prisma.team.upsert({
    where: { externalId: raw.team.id },
    update: { name: raw.team.name, logo: raw.team.logo, leagueId },
    create: {
      externalId: raw.team.id,
      name: raw.team.name,
      logo: raw.team.logo,
      leagueId,
    },
  });
}

async function upsertMatch(raw: any, homeId: number, awayId: number, leagueId: number) {
  const statusMap: Record<string, string> = {
    NS: 'SCHEDULED',
    '1H': 'LIVE',
    HT: 'LIVE',
    '2H': 'LIVE',
    ET: 'LIVE',
    FT: 'FINISHED',
    AET: 'FINISHED',
    PEN: 'FINISHED',
    PST: 'POSTPONED',
    CANC: 'CANCELLED',
  };

  const status = statusMap[raw.fixture.status.short] ?? 'SCHEDULED';

  return prisma.match.upsert({
    where: { externalId: raw.fixture.id },
    update: {
      homeScore: raw.goals.home,
      awayScore: raw.goals.away,
      status: status as any,
    },
    create: {
      externalId: raw.fixture.id,
      homeTeamId: homeId,
      awayTeamId: awayId,
      leagueId,
      season: SEASON,
      matchDate: new Date(raw.fixture.date),
      homeScore: raw.goals.home,
      awayScore: raw.goals.away,
      status: status as any,
      round: raw.league.round,
    },
  });
}

async function syncLeague(externalLeagueId: number) {
  logger.info(`Syncing league ${externalLeagueId}`);
  const leaguesData = await fetchLeagues(SEASON);
  const leagueRaw = leaguesData.find((l: any) => l.league.id === externalLeagueId);
  if (!leagueRaw) {
    logger.warn(`League ${externalLeagueId} not found in API`);
    return;
  }

  const league = await upsertLeague(leagueRaw);
  const fixtures = await fetchFixtures(externalLeagueId, SEASON);

  const teamMap = new Map<number, number>();

  for (const fix of fixtures) {
    for (const rawTeam of [
      { team: fix.teams.home },
      { team: fix.teams.away },
    ]) {
      if (!teamMap.has(rawTeam.team.id)) {
        const t = await upsertTeam({ team: rawTeam.team }, league.id);
        teamMap.set(rawTeam.team.id, t.id);
      }
    }

    const homeId = teamMap.get(fix.teams.home.id)!;
    const awayId = teamMap.get(fix.teams.away.id)!;
    await upsertMatch(fix, homeId, awayId, league.id);
  }

  for (const [extId, dbId] of teamMap.entries()) {
    try {
      const stats = await fetchTeamStatistics(externalLeagueId, SEASON, extId);
      const s = stats.fixtures;
      await prisma.teamStats.upsert({
        where: { teamId_leagueId_season: { teamId: dbId, leagueId: league.id, season: SEASON } },
        update: {
          wins: s.wins.total,
          draws: s.draws.total,
          losses: s.loses.total,
          goalsFor: stats.goals.for.total.total,
          goalsAgainst: stats.goals.against.total.total,
          form: stats.form?.slice(-10),
          homeWins: s.wins.home,
          homeLosses: s.loses.home,
          awayWins: s.wins.away,
          awayLosses: s.loses.away,
        },
        create: {
          teamId: dbId,
          leagueId: league.id,
          season: SEASON,
          wins: s.wins.total,
          draws: s.draws.total,
          losses: s.loses.total,
          goalsFor: stats.goals.for.total.total,
          goalsAgainst: stats.goals.against.total.total,
          form: stats.form?.slice(-10),
          homeWins: s.wins.home,
          homeLosses: s.loses.home,
          awayWins: s.wins.away,
          awayLosses: s.loses.away,
        },
      });
    } catch (e) {
      logger.warn(`Failed team stats for ${extId}: ${e}`);
    }
  }

  logger.info(`League ${externalLeagueId} sync complete`);
}

async function main() {
  for (const leagueId of TARGET_LEAGUES) {
    await syncLeague(leagueId);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  logger.error(e);
  process.exit(1);
});
