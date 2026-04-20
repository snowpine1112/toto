import 'dotenv/config';
import prisma from '../utils/prisma';
import {
  fetchLeagues,
  fetchFixtures,
  fetchTeamStatistics,
} from '../services/football/apiFootball';
import logger from '../utils/logger';

// フリープランはシーズン2022〜2024のみ対応
// 1日100リクエスト、1分10リクエスト制限のためJ1のみ取得
const TARGET_LEAGUES = [{ id: 98, season: 2024, name: 'J1リーグ' }];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// actualSeason: 実際の大会シーズン（表示用）、dataSeason: APIから取得したデータのシーズン
const ACTUAL_SEASONS: Record<number, number> = {
  98: 2026,  // J1リーグ実際のシーズン
};

async function upsertLeague(raw: any, dataSeason: number) {
  const season = ACTUAL_SEASONS[raw.league.id] ?? dataSeason;
  return prisma.league.upsert({
    where: { externalId: raw.league.id },
    update: {
      name: raw.league.name,
      country: raw.country.name,
      season,
      logo: raw.league.logo,
    },
    create: {
      externalId: raw.league.id,
      name: raw.league.name,
      country: raw.country.name,
      season,
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

async function upsertMatch(raw: any, homeId: number, awayId: number, leagueId: number, season: number) {
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
      season,
      matchDate: new Date(raw.fixture.date),
      homeScore: raw.goals.home,
      awayScore: raw.goals.away,
      status: status as any,
      round: raw.league.round,
    },
  });
}

async function syncLeague(externalLeagueId: number, season: number) {
  logger.info(`Syncing league ${externalLeagueId} season ${season}`);
  const leaguesData = await fetchLeagues(season);
  await sleep(7000); // 1分10リクエスト制限対策

  const leagueRaw = leaguesData.find((l: any) => l.league.id === externalLeagueId);
  if (!leagueRaw) {
    logger.warn(`League ${externalLeagueId} not found in API`);
    return;
  }

  const league = await upsertLeague(leagueRaw, season);
  const fixtures = await fetchFixtures(externalLeagueId, season);
  await sleep(7000);

  const teamMap = new Map<number, number>();

  for (const fix of fixtures) {
    for (const rawTeam of [{ team: fix.teams.home }, { team: fix.teams.away }]) {
      if (!teamMap.has(rawTeam.team.id)) {
        const t = await upsertTeam({ team: rawTeam.team }, league.id);
        teamMap.set(rawTeam.team.id, t.id);
      }
    }

    const homeId = teamMap.get(fix.teams.home.id)!;
    const awayId = teamMap.get(fix.teams.away.id)!;
    await upsertMatch(fix, homeId, awayId, league.id, season);
  }

  logger.info(`Saved ${fixtures.length} fixtures and ${teamMap.size} teams`);

  let statsCount = 0;
  for (const [extId, dbId] of teamMap.entries()) {
    try {
      await sleep(7000); // 1分10リクエスト制限対策
      const stats = await fetchTeamStatistics(externalLeagueId, season, extId);
      const s = stats.fixtures;
      await prisma.teamStats.upsert({
        where: { teamId_leagueId_season: { teamId: dbId, leagueId: league.id, season } },
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
          season,
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
      statsCount++;
      logger.info(`Team stats saved: ${extId} (${statsCount}/${teamMap.size})`);
    } catch (e) {
      logger.warn(`Failed team stats for ${extId}: ${e}`);
    }
  }

  logger.info(`League ${externalLeagueId} sync complete`);
}

async function main() {
  for (const { id, season } of TARGET_LEAGUES) {
    await syncLeague(id, season);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  logger.error(e);
  process.exit(1);
});
