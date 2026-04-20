import 'dotenv/config';
import prisma from '../utils/prisma';
import { predictScore } from '../services/prediction/poissonModel';

async function main() {
  console.log('Seeding database...');

  // League
  const jleague = await prisma.league.upsert({
    where: { externalId: 98 },
    update: { type: 'league' },
    create: {
      externalId: 98,
      name: 'J1リーグ',
      country: 'Japan',
      season: 2026,
      logo: 'https://media.api-sports.io/football/leagues/98.png',
      type: 'league',
    },
  });

  // Tournaments (大会)
  const tournamentsData = [
    { externalId: 1,   name: 'FIFAワールドカップ',   country: 'World',   season: 2026, logo: 'https://media.api-sports.io/football/leagues/1.png' },
    { externalId: 7,   name: 'AFCアジアカップ',       country: 'Asia',    season: 2027, logo: 'https://media.api-sports.io/football/leagues/7.png' },
    { externalId: 99,  name: '天皇杯',                country: 'Japan',   season: 2026, logo: 'https://media.api-sports.io/football/leagues/99.png' },
    { externalId: 97,  name: 'ルヴァンカップ',         country: 'Japan',   season: 2026, logo: 'https://media.api-sports.io/football/leagues/97.png' },
    { externalId: 2,   name: 'UEFAチャンピオンズリーグ', country: 'Europe', season: 2025, logo: 'https://media.api-sports.io/football/leagues/2.png' },
    { externalId: 9,   name: 'コパ・アメリカ',          country: 'South America', season: 2024, logo: 'https://media.api-sports.io/football/leagues/9.png' },
    { externalId: 3,   name: 'UEFAヨーロッパリーグ',   country: 'Europe', season: 2025, logo: 'https://media.api-sports.io/football/leagues/3.png' },
    { externalId: 848, name: 'UEFAカンファレンスリーグ', country: 'Europe', season: 2025, logo: 'https://media.api-sports.io/football/leagues/848.png' },
  ];
  for (const t of tournamentsData) {
    await prisma.league.upsert({
      where: { externalId: t.externalId },
      update: { type: 'cup' },
      create: { ...t, type: 'cup' },
    });
  }

  // Teams
  const teamsData = [
    { externalId: 2301, name: '浦和レッズ', logo: 'https://media.api-sports.io/football/teams/2301.png' },
    { externalId: 2302, name: '鹿島アントラーズ', logo: 'https://media.api-sports.io/football/teams/2302.png' },
    { externalId: 2303, name: 'FC東京', logo: 'https://media.api-sports.io/football/teams/2303.png' },
    { externalId: 2304, name: '横浜F・マリノス', logo: 'https://media.api-sports.io/football/teams/2304.png' },
    { externalId: 2305, name: 'ガンバ大阪', logo: 'https://media.api-sports.io/football/teams/2305.png' },
    { externalId: 2306, name: 'セレッソ大阪', logo: 'https://media.api-sports.io/football/teams/2306.png' },
    { externalId: 2307, name: '川崎フロンターレ', logo: 'https://media.api-sports.io/football/teams/2307.png' },
    { externalId: 2308, name: 'サンフレッチェ広島', logo: 'https://media.api-sports.io/football/teams/2308.png' },
  ];

  const teams = await Promise.all(
    teamsData.map((t) =>
      prisma.team.upsert({
        where: { externalId: t.externalId },
        update: { name: t.name, logo: t.logo },
        create: { ...t, leagueId: jleague.id },
      })
    )
  );

  // TeamStats
  const statsData = [
    { idx: 0, wins: 12, draws: 3, losses: 3, goalsFor: 35, goalsAgainst: 18, form: 'WWDWW', homeWins: 7, homeLosses: 1, awayWins: 5, awayLosses: 2 },
    { idx: 1, wins: 10, draws: 4, losses: 4, goalsFor: 28, goalsAgainst: 20, form: 'WLDWW', homeWins: 6, homeLosses: 2, awayWins: 4, awayLosses: 2 },
    { idx: 2, wins: 9, draws: 5, losses: 4, goalsFor: 25, goalsAgainst: 22, form: 'DWWLD', homeWins: 5, homeLosses: 2, awayWins: 4, awayLosses: 2 },
    { idx: 3, wins: 11, draws: 2, losses: 5, goalsFor: 32, goalsAgainst: 24, form: 'WWLWW', homeWins: 6, homeLosses: 2, awayWins: 5, awayLosses: 3 },
    { idx: 4, wins: 8, draws: 4, losses: 6, goalsFor: 22, goalsAgainst: 25, form: 'LWDWL', homeWins: 5, homeLosses: 3, awayWins: 3, awayLosses: 3 },
    { idx: 5, wins: 7, draws: 5, losses: 6, goalsFor: 20, goalsAgainst: 23, form: 'DDWLW', homeWins: 4, homeLosses: 2, awayWins: 3, awayLosses: 4 },
    { idx: 6, wins: 13, draws: 2, losses: 3, goalsFor: 38, goalsAgainst: 16, form: 'WWWDW', homeWins: 8, homeLosses: 1, awayWins: 5, awayLosses: 2 },
    { idx: 7, wins: 9, draws: 3, losses: 6, goalsFor: 26, goalsAgainst: 21, form: 'WDLWW', homeWins: 6, homeLosses: 2, awayWins: 3, awayLosses: 4 },
  ];

  for (const s of statsData) {
    const { idx, ...fields } = s;
    await prisma.teamStats.upsert({
      where: { teamId_leagueId_season: { teamId: teams[idx].id, leagueId: jleague.id, season: 2026 } },
      update: fields,
      create: { teamId: teams[idx].id, leagueId: jleague.id, season: 2026, ...fields },
    });
  }

  // Matches (toto第1234回 対象6試合)
  const matchPairs = [
    [0, 1], [2, 3], [4, 5], [6, 7], [1, 6], [0, 3],
  ];

  const baseDate = new Date('2026-04-26T14:00:00+09:00');
  const matches = await Promise.all(
    matchPairs.map(([h, a], i) =>
      prisma.match.upsert({
        where: { externalId: 90000 + i },
        update: {},
        create: {
          externalId: 90000 + i,
          homeTeamId: teams[h].id,
          awayTeamId: teams[a].id,
          leagueId: jleague.id,
          season: 2026,
          matchDate: new Date(baseDate.getTime() + i * 3600000),
          status: 'SCHEDULED',
          round: '第28節',
        },
      })
    )
  );

  // Predictions
  const leagueAvg = 1.5;
  const allStats = statsData;

  for (let i = 0; i < matchPairs.length; i++) {
    const [hi, ai] = matchPairs[i];
    const hs = allStats[hi];
    const as_ = allStats[ai];
    const homeGames = hs.wins + hs.draws + hs.losses || 1;
    const awayGames = as_.wins + as_.draws + as_.losses || 1;

    const result = predictScore(
      { avgGoalsFor: hs.goalsFor / homeGames, avgGoalsAgainst: hs.goalsAgainst / homeGames, form: hs.form },
      { avgGoalsFor: as_.goalsFor / awayGames, avgGoalsAgainst: as_.goalsAgainst / awayGames, form: as_.form },
      leagueAvg,
      { homeWins: 2, draws: 1, awayWins: 2, matches: [] }
    );

    await prisma.prediction.upsert({
      where: { matchId: matches[i].id },
      update: {},
      create: {
        matchId: matches[i].id,
        predictedHome: result.predictedHome,
        predictedAway: result.predictedAway,
        homeWinProb: result.homeWinProb,
        drawProb: result.drawProb,
        awayWinProb: result.awayWinProb,
        confidence: result.confidence,
        factors: { ...result.factors, scoreMatrix: result.scoreMatrix } as any,
      },
    });
  }

  // TotoRound
  const round = await prisma.totoRound.upsert({
    where: { id: 1 },
    update: {},
    create: {
      roundName: '第1234回',
      deadline: new Date('2026-04-25T12:00:00+09:00'),
      status: 'open',
    },
  });

  await Promise.all(
    matches.map((m) =>
      prisma.totoRoundMatch.upsert({
        where: { totoRoundId_matchId: { totoRoundId: round.id, matchId: m.id } },
        update: {},
        create: { totoRoundId: round.id, matchId: m.id },
      })
    )
  );

  console.log('Seed complete!');
  console.log(`  League: ${jleague.name}`);
  console.log(`  Teams: ${teams.length}`);
  console.log(`  Matches: ${matches.length}`);
  console.log(`  TotoRound: ${round.roundName}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
