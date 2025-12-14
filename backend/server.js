const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup (SQLite)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false, // Set to console.log to see SQL queries
});

// Models
const Staff = sequelize.define('Staff', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    name: DataTypes.STRING,
    department: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    avatar: DataTypes.STRING,
    status: {
        type: DataTypes.ENUM('present', 'absent', 'working', 'idle', 'not_working'),
        defaultValue: 'not_working',
    },
    lastNFCScan: DataTypes.STRING, // Storing as string for simplicity ("2s ago") or ISO timestamp
    motionActivity: DataTypes.BOOLEAN,
    totalWorkingTime: DataTypes.STRING,
});

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    time: DataTypes.STRING,
    type: DataTypes.ENUM('NFC', 'MOTION'),
    staffId: DataTypes.STRING,
    staffName: DataTypes.STRING,
    description: DataTypes.STRING,
    location: DataTypes.STRING,
});

const Bot = sequelize.define('Bot', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    name: DataTypes.STRING,
    department: DataTypes.STRING,
    nfc: DataTypes.BOOLEAN,
    motion: DataTypes.BOOLEAN,
    avatar: DataTypes.STRING,
});

// Routes

// Get Bots
app.get('/api/bots', async (req, res) => {
    try {
        const bots = await Bot.findAll();
        res.json(bots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update or Create Bot
app.post('/api/bots', async (req, res) => {
    try {
        const { id, ...data } = req.body;
        const [bot, created] = await Bot.findOrCreate({
            where: { id },
            defaults: data,
        });

        if (!created) {
            await bot.update(data);
        }

        res.json(bot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Bot
app.delete('/api/bots/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Bot.destroy({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all staff
app.get('/api/staff', async (req, res) => {
    try {
        const staff = await Staff.findAll();
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sync/Update Staff Status
app.post('/api/staff/sync', async (req, res) => {
    try {
        const { id, ...data } = req.body;
        const [staff, created] = await Staff.findOrCreate({
            where: { id },
            defaults: data,
        });

        if (!created) {
            await staff.update(data);
        }

        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Logs
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await ActivityLog.findAll({
            order: [['createdAt', 'DESC']],
            limit: 100,
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Log
app.post('/api/logs', async (req, res) => {
    try {
        const log = await ActivityLog.create(req.body);
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Initialize Database and Start Server
const init = async () => {
    try {
        await sequelize.sync({ alter: true }); // Creates tables if they don't exist
        console.log('Database connected and synced.');

        // Seed initial data if empty
        const count = await Staff.count();
        if (count === 0) {
            await Staff.create({
                id: 'DEVICE-1',
                name: 'ESP32 Pad',
                department: 'IoT',
                email: 'esp32@local',
                phone: 'N/A',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ESP32',
                status: 'not_working',
                motionActivity: false,
                totalWorkingTime: 'inactive',
            });
            console.log('Seeded initial staff data.');
        }

        // Seed Bots if empty
        const botCount = await Bot.count();
        if (botCount === 0) {
            const initialBots = [
                { id: 'BOT-1', name: 'Bot 1', department: 'Simulation', nfc: false, motion: false, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BOT-1' },
                { id: 'BOT-2', name: 'Bot 2', department: 'Simulation', nfc: false, motion: false, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BOT-2' },
                { id: 'BOT-3', name: 'Bot 3', department: 'Simulation', nfc: false, motion: false, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BOT-3' },
                { id: 'BOT-4', name: 'Bot 4', department: 'Simulation', nfc: false, motion: false, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BOT-4' },
                { id: 'BOT-5', name: 'Bot 5', department: 'Simulation', nfc: false, motion: false, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BOT-5' },
            ];
            await Bot.bulkCreate(initialBots);
            console.log('Seeded initial bots.');
        }

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
    }
};

init();
