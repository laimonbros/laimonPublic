import { UserInvite } from '../db/models.js';

class InviteService {
    static async saveUserInvite(telegramId, invitedUserId) {
        return await UserInvite.create({ telegramId, invitedUserId });
    }

    static async getInviteCountByUser(telegramId) {
        return await UserInvite.count({ where: { telegramId } });
    }

    static async getInvitesByUser(telegramId) {
        return await UserInvite.findAll({ where: { telegramId }, include: ['InvitedUser'] });
    }

    static async countInvitedUsers(invitedUserId) {
        try {
            // Count all values where  `invitedUserId` matches 
            const count = await UserInvite.count({
                where: { invitedUserId },
            });
            return count;
        } catch (error) {
            console.error('Error counting invited users:', error);
            throw new Error('Unable to count invited users.');
        }
    }

}

export default InviteService;
