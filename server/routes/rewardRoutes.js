import express from 'express';
import RewardService from '../services/rewardService.js';
import {SingleReward} from "../db/models.js";

const router = express.Router();

router.post('/single', async (req, res) => {
    try {
        const {telegramId, amount, type} = req.body;
        const reward = await RewardService.claimSingleReward(telegramId, amount, type);
        res.status(201).json(reward);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

router.post('/check-single', async (req, res) => {
    try {
        const {telegramId, type} = req.body;
        const reward = await RewardService.getSingleReward(telegramId, type);

        res.status(200).json(reward);

    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

// Write daily reward 
router.post('/daily', async (req, res) => {
    try {
        const {telegramId, amount, rewardDate} = req.body;
        const reward = await RewardService.claimDailyReward(telegramId, amount, rewardDate);
        res.status(201).json(reward);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

router.post('/check-daily', async (req, res) => {
    try {
        const {telegramId, amount, rewardDate} = req.body;
        const reward = await RewardService.getDailyReward(telegramId, rewardDate);

        res.status(200).json(reward);

    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

//  Get total rewards sum 
router.get('/total/:telegramId', async (req, res) => {
    try {
        const {telegramId} = req.params;

        // Call for method to find final sum 
        const totalRewardScore = await RewardService.getTotalRewardScore(telegramId);

        // If no data show empty sum 
        if (!totalRewardScore) {
            return res.status(200).json({totalRewardScore: 0});
        }

        // Success 
        res.status(200).json({totalRewardScore});
    } catch (error) {
        // Errors 
        res.status(400).json({error: error.message});
    }
});


export default router;
