const express = require('express');
const router = express.Router();
const brandGenerator = require('./services/brand-generator');
const db = require('./database');

// Health Check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate Brand
router.post('/generate', async (req, res) => {
    try {
        const input = req.body;

        // Basic validation
        if (!input.industry || !input.audience) {
            return res.status(400).json({ error: 'Missing required fields: industry, audience' });
        }

        const result = await brandGenerator.generate(input);
        res.json(result);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to generate brand', details: error.message });
    }
});

// List Projects
router.get('/projects', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
        const projects = stmt.all();

        // Parse JSON stored in DB
        const parsedProjects = projects.map(p => ({
            ...p,
            input: JSON.parse(p.input),
            result: JSON.parse(p.result)
        }));

        res.json(parsedProjects);
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

module.exports = router;
