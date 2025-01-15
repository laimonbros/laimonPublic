import express from 'express';
import InviteService from '../services/inviteService.js';

const router = express.Router();

// Wtite user invite 
router.post('/', async (req, res) => {
    try {
        const { telegramId, invitedUserId } = req.body;
        const invite = await InviteService.saveUserInvite(telegramId, invitedUserId);
        res.status(201).json(invite);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all invites by the user 
router.get('/:userId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const invites = await InviteService.getInvitesByUser(telegramId);
        res.status(200).json(invites);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpont to count invited users 
router.get('/count/:invitedUserId', async (req, res) => {
    try {
        const { invitedUserId } = req.params;

        // Count for invited users 
        const count = await InviteService.countInvitedUsers(invitedUserId);

        // Send result 
        res.status(200).json({ invitedUserId, count });
    } catch (error) {
        console.error('Error in GET /invites/count/:invitedUserId:', error);
        res.status(500).json({ error: 'Failed to retrieve invite count.' });
    }
});

export default router;
