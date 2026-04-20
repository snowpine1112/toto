import { Router } from 'express';
import { getLeagues, getLeagueById } from '../controllers/leagueController';
import { getMatches, getMatchById, getMatchPrediction } from '../controllers/matchController';
import { getCurrentToto, getTotoRound } from '../controllers/totoController';
import { generatePredictions, generateMatchPrediction } from '../controllers/predictionController';

const router = Router();

router.get('/leagues', getLeagues);
router.get('/leagues/:id', getLeagueById);

router.get('/matches', getMatches);
router.get('/matches/:id', getMatchById);
router.get('/matches/:id/prediction', getMatchPrediction);

router.get('/toto/current', getCurrentToto);
router.get('/toto/:roundId', getTotoRound);

router.post('/predictions/generate', generatePredictions);
router.post('/predictions/generate/match', generateMatchPrediction);

export default router;
