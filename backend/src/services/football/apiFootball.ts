import axios from 'axios';
import logger from '../../utils/logger';

// api-football.com 直接契約版 (v3.football.api-sports.io)
const BASE_URL = 'https://v3.football.api-sports.io';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-apisports-key': process.env.RAPIDAPI_KEY ?? '',
  },
});

let requestCount = 0;

client.interceptors.response.use((response) => {
  requestCount++;
  const remaining = response.headers['x-ratelimit-requests-remaining'];
  logger.info(`API-Football request #${requestCount}, remaining: ${remaining}`);
  return response;
});

export async function fetchLeagues(season: number) {
  const res = await client.get('/leagues', { params: { season } });
  return res.data.response;
}

export async function fetchFixtures(leagueId: number, season: number) {
  const res = await client.get('/fixtures', {
    params: { league: leagueId, season },
  });
  return res.data.response;
}

export async function fetchTeamStatistics(
  leagueId: number,
  season: number,
  teamId: number
) {
  const res = await client.get('/teams/statistics', {
    params: { league: leagueId, season, team: teamId },
  });
  return res.data.response;
}

export async function fetchHeadToHead(team1: number, team2: number) {
  const res = await client.get('/fixtures/headtohead', {
    params: { h2h: `${team1}-${team2}`, last: 5 },
  });
  return res.data.response;
}

export async function fetchStandings(leagueId: number, season: number) {
  const res = await client.get('/standings', {
    params: { league: leagueId, season },
  });
  return res.data.response;
}
