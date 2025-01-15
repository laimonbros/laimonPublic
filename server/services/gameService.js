import { GameResult } from '../db/models.js';

class GameService {
    static async saveGameResult(telegramId, score) {
        return await GameResult.create({ telegramId, score });
    }

    static async getGameResultsByUser(telegramId) {
        return await GameResult.findAll({ where: { telegramId } });
    }

    static async getTotalGameScore(telegramId) {
        return await GameResult.sum('score', { where: { telegramId } });
    }
}

export default GameService;
