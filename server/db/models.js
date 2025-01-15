import {DataTypes} from "sequelize";
import sequelize from './db.js';

export const User = sequelize.define('User', {
    telegramId: {type: DataTypes.BIGINT, unique: true, primaryKey: true, allowNull: false},
    username: {type: DataTypes.STRING, allowNull: true},
    start_param: {type: DataTypes.STRING, allowNull: true},

});

export const GameResult = sequelize.define('GameResult', {
    telegramId: {type: DataTypes.BIGINT, allowNull: false},
    score: {type: DataTypes.INTEGER, allowNull: false},
});

export const DailyReward = sequelize.define('DailyReward', {
    amount: {type: DataTypes.INTEGER, allowNull: false},
    rewardDate: {type: DataTypes.DATEONLY, primaryKey: true, allowNull: false},
    telegramId: {type: DataTypes.BIGINT, primaryKey: true, allowNull: false},
});

export const SingleReward = sequelize.define('SingleReward', {
    amount: {type: DataTypes.INTEGER, allowNull: false},
    type: {type: DataTypes.STRING, primaryKey: true, allowNull: false},
    telegramId: {type: DataTypes.BIGINT, primaryKey: true, allowNull: false},
});

export const UserInvite = sequelize.define('UserInvite', {
    invitedUserId: {type: DataTypes.BIGINT,  primaryKey: true, allowNull: false},
    telegramId: {type: DataTypes.BIGINT,  primaryKey: true, allowNull: false},
});

// Связи между моделями

User.hasMany(SingleReward, {foreignKey: 'telegramId'});
SingleReward.belongsTo(User, {foreignKey: 'telegramId'});

User.hasMany(GameResult, {foreignKey: 'telegramId'});
GameResult.belongsTo(User, {foreignKey: 'telegramId'});

User.hasMany(DailyReward, {foreignKey: 'telegramId'});
DailyReward.belongsTo(User, {foreignKey: 'telegramId'});

User.hasMany(UserInvite, {foreignKey: 'telegramId'});
UserInvite.belongsTo(User, {foreignKey: 'telegramId'});

//UserInvite.belongsTo(User, {foreignKey: 'invitedUserId', as: 'InvitedUser'});

export default {User, GameResult, DailyReward, UserInvite};
