import axios from 'axios';
import logger from '../../utils/logger';

const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY ?? '',
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
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
