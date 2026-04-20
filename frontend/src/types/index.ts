export interface League {
  id: number;
  externalId: number;
  name: string;
  country: string;
  season: number;
  logo: string | null;
}

export interface Team {
  id: number;
  name: string;
  logo: string | null;
}

export interface TeamStats {
  id: number;
  teamId: number;
  leagueId: number;
  season: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  form: string | null;
  homeWins: number;
  homeLosses: number;
  awayWins: number;
  awayLosses: number;
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

export interface Prediction {
  id: number;
  matchId: number;
  predictedHome: number;
  predictedAway: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: number;
  factors: PredictionFactors;
  scoreMatrix?: number[][];
}

export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  league: League;
  matchDate: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  round: string | null;
  prediction: Prediction | null;
}

export interface TotoRound {
  id: number;
  name: string;
  deadline: string;
  status: 'open' | 'closed' | 'resulted';
}

export interface TotoCurrentResponse {
  round: TotoRound;
  matches: Match[];
}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
