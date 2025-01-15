import {DailyReward, SingleReward} from '../db/models.js';

class RewardService {
    static async claimDailyReward(telegramId, amount, rewardDate) {
        // Check if a reward added for the day 
        const existingReward = await this.getDailyReward(telegramId, rewardDate);

        if (existingReward) {
            throw new Error('Reward already claimed for this day.');
        }

        return await DailyReward.create({telegramId, amount, rewardDate});
    }

    static async claimSingleReward(telegramId, amount, type) {
        const existingReward = await SingleReward.findOne({where: {telegramId, type}});

        if (existingReward) {
            throw new Error('Reward already claimed.');
        }

        return await SingleReward.create({telegramId, amount, type});
    }

    static async getSingleReward(telegramId, type) {
        const r = await SingleReward.findOne({where: {telegramId, type}});
        return r;
    }

    static async getDailyReward(telegramId, rewardDate) {
        return await DailyReward.findOne({where: {telegramId, rewardDate}});
    }

    static async getTotalRewardScore(telegramId) {
        const totalDailyReward = await DailyReward.sum('amount', {where: {telegramId}}) || 0;
        const totalSingleReward = await SingleReward.sum('amount', {where: {telegramId}}) || 0;

        return totalDailyReward + totalSingleReward;
    }
}

export default RewardService;
