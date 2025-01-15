import { User } from '../db/models.js';
import {Sequelize} from "sequelize";

class UserService {
    static async createUser(telegramId, username, start_param) {
        return await User.create({ telegramId, username, start_param });
    }

    static async getUserById(userId) {
        return await User.findByPk(userId);
    }

    static async getAllUsers() {
        return await User.findAll();
    }


    static async getUsersByTotalScore(limit = 10) {
        return await User.findAll({
            attributes: [
                'telegramId',
                'username',
                [
                    Sequelize.literal(`(
            COALESCE((SELECT SUM(score) FROM "GameResults" WHERE "GameResults"."telegramId" = "User"."telegramId"), 0) +
            COALESCE((SELECT SUM(amount) FROM "DailyRewards" WHERE "DailyRewards"."telegramId" = "User"."telegramId"), 0) +
            COALESCE((SELECT SUM("amount") FROM "SingleRewards" WHERE "SingleRewards" ."telegramId" = "User"."telegramId"), 0)
          )`),
                    'score',
                ],
            ],
            order: [[Sequelize.literal('score'), 'DESC']],
            limit,
        });
    }

}

export default UserService;