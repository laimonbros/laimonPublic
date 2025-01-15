import express from 'express';
import UserService from '../services/userService.js';
import InviteService from "../services/inviteService.js";

const router = express.Router();

// Get users list by result 
router.get('/leaderboard', async (req, res) => {
    try {
        const { limit } = req.query; // Users limit 
        const userLimit = limit ? parseInt(limit, 99) : 99;

        // Call for service 
        const users = await UserService.getUsersByTotalScore(userLimit);

        // Get users list 
        res.status(200).json(users);
    } catch (error) {
        // Debug
        res.status(400).json({ error: error.message });
    }
});

// New user creating 
router.post('/', async (req, res) => {
    try {
        const { telegramId, username, start_param } = req.body;

        let user = await UserService.getUserById(telegramId);

        if (user) {
            res.status(200).json(user);//return exist
        }
        else {
            user=await UserService.createUser(telegramId, username, start_param);//create new
            if (start_param)
                await InviteService.saveUserInvite(telegramId, 0+start_param);
            res.status(201).json(user);
        }

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(201).json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;