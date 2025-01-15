import { Sequelize } from 'sequelize';
import sqliteModule from './sqlite.js';
import postgresModule from './postgres.js';

// Look for connection type
const DB_TYPE = process.env.DB_TYPE || 'postgres';//sqlite postgres

// Choice of connection module
const dbModule = DB_TYPE === 'postgres' ? postgresModule : sqliteModule;

const sequelize = dbModule.connect(Sequelize);

export default sequelize;
