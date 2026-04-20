import axios from 'axios';
import type { ApiResponse, League, Match, TotoCurrentResponse, Prediction } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const client = axios.create({ baseURL: BASE_URL });

export const api = {
  leagues: {
    list: (params?: { type?: string }) =>
      client.get<ApiResponse<League[]>>('/leagues', { params }).then((r) => r.data),
    get: (id: number) => client.get<ApiResponse<League>>(`/leagues/${id}`).then((r) => r.data),
  },
  matches: {
    list: (params?: { leagueId?: number; status?: string; page?: number; limit?: number }) =>
      client.get<ApiResponse<Match[]>>('/matches', { params }).then((r) => r.data),
    get: (id: number) => client.get<ApiResponse<Match>>(`/matches/${id}`).then((r) => r.data),
    prediction: (id: number) =>
      client.get<ApiResponse<Prediction>>(`/matches/${id}/prediction`).then((r) => r.data),
  },
  toto: {
    current: () => client.get<ApiResponse<TotoCurrentResponse | null>>('/toto/current').then((r) => r.data),
    round: (id: number) => client.get<ApiResponse<any>>(`/toto/${id}`).then((r) => r.data),
  },
  predictions: {
    generate: () => client.post<ApiResponse<{ generated: number }>>('/predictions/generate').then((r) => r.data),
  },
};
