import express from 'express';
import GameService from '../services/gameService.js';

const router = express.Router();

// Write game result
router.post('/', async (req, res) => {
    try {
        const { telegramId, score } = req.body;
        const gameResult = await GameService.saveGameResult(telegramId, score);
        res.status(201).json(gameResult);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get game results of the user 
router.get('/:userId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const gameResults = await GameService.getGameResultsByUser(telegramId);
        res.status(200).json(gameResults);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get total sum of points for games  
router.get('/total/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;

        // Call for the service for total points count 
        const totalGameScore = await GameService.getTotalGameScore(telegramId);

        // If no data show 0 
        if (!totalGameScore) {
            return res.status(200).json({ totalGameScore: 0 });
        }

        // Success 
        res.status(200).json({ totalGameScore });
    } catch (error) {
        // Debug
        res.status(400).json({ error: error.message });
    }
});

export default router;
