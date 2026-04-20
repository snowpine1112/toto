import { H2HRecord, PredictionFactors } from '../../types';

const HOME_ADVANTAGE = 1.15;
const MAX_GOALS = 6;

function poissonProb(lambda: number, k: number): number {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function buildScoreMatrix(lambdaHome: number, lambdaAway: number): number[][] {
  const matrix: number[][] = [];
  for (let h = 0; h <= MAX_GOALS; h++) {
    matrix[h] = [];
    for (let a = 0; a <= MAX_GOALS; a++) {
      matrix[h][a] = poissonProb(lambdaHome, h) * poissonProb(lambdaAway, a);
    }
  }
  return matrix;
}

function formAdjustment(form: string | null | undefined): number {
  if (!form) return 0;
  const recent = form.slice(-5);
  let score = 0;
  for (const ch of recent) {
    if (ch === 'W') score += 1;
    else if (ch === 'L') score -= 1;
  }
  return (score / 5) * 0.1;
}

function h2hAdjustment(h2h: H2HRecord): number {
  const total = h2h.homeWins + h2h.draws + h2h.awayWins;
  if (total === 0) return 0;
  const homeRate = h2h.homeWins / total;
  const awayRate = h2h.awayWins / total;
  return (homeRate - awayRate) * 0.05;
}

export interface TeamStatsInput {
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  form: string | null | undefined;
}

export interface PredictionResult {
  predictedHome: number;
  predictedAway: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: number;
  factors: PredictionFactors;
  scoreMatrix: number[][];
}

export function predictScore(
  homeTeam: TeamStatsInput,
  awayTeam: TeamStatsInput,
  leagueAvgGoals: number,
  h2h: H2HRecord
): PredictionResult {
  const homeAttack = homeTeam.avgGoalsFor / leagueAvgGoals;
  const homeDefense = homeTeam.avgGoalsAgainst / leagueAvgGoals;
  const awayAttack = awayTeam.avgGoalsFor / leagueAvgGoals;
  const awayDefense = awayTeam.avgGoalsAgainst / leagueAvgGoals;

  let lambdaHome = homeAttack * awayDefense * leagueAvgGoals;
  let lambdaAway = awayAttack * homeDefense * leagueAvgGoals;

  lambdaHome *= HOME_ADVANTAGE;
  lambdaHome = Math.max(0.1, lambdaHome + formAdjustment(homeTeam.form));
  lambdaAway = Math.max(0.1, lambdaAway + formAdjustment(awayTeam.form));
  lambdaHome = Math.max(0.1, lambdaHome + h2hAdjustment(h2h));

  const matrix = buildScoreMatrix(lambdaHome, lambdaAway);

  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;
  let maxProb = 0;
  let predictedHome = 0;
  let predictedAway = 0;

  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = matrix[h][a];
      if (h > a) homeWinProb += p;
      else if (h === a) drawProb += p;
      else awayWinProb += p;

      if (p > maxProb) {
        maxProb = p;
        predictedHome = h;
        predictedAway = a;
      }
    }
  }

  const h2hStr = `${h2h.homeWins}W${h2h.draws}D${h2h.awayWins}L`;

  return {
    predictedHome,
    predictedAway,
    homeWinProb,
    drawProb,
    awayWinProb,
    confidence: Math.max(homeWinProb, drawProb, awayWinProb),
    factors: {
      homeAttack,
      homeDefense,
      awayAttack,
      awayDefense,
      homeAdvantage: HOME_ADVANTAGE,
      formDiff: formAdjustment(homeTeam.form) - formAdjustment(awayTeam.form),
      h2hRecord: h2hStr,
    },
    scoreMatrix: matrix,
  };
}
