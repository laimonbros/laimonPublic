import express from 'express';
import bodyParser from 'body-parser';
import sequelize from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';



const app = express();

app.use(bodyParser.json());



// Routes Connection 
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/invites', inviteRoutes);

// Log of requests 
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Sync database 
sequelize.sync({ alter: true }).then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('------------------------------------------');
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log('------------------------------------------');
        console.log(`🗄️  Database synced successfully`);
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        console.log('------------------------------------------');
    });
}).catch((err) => {
    console.error('❌ Error syncing database:', err.message);
});
