export interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PredictionFactors {
  homeAttack: number;
  homeDefense: number;
  awayAttack: number;
  awayDefense: number;
  homeAdvantage: number;
  formDiff: number;
  h2hRecord: string;
}

export interface H2HRecord {
  homeWins: number;
  draws: number;
  awayWins: number;
  matches: Array<{
    date: string;
    homeScore: number;
    awayScore: number;
  }>;
}
