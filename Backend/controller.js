import express from 'express';
import dotenv from 'dotenv';

// Ensure environment variables are loaded before importing modules that read them
dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
    const { prompt, sid } = req.body;
    if (!prompt || !sid) return res.status(400).json({ error: "missing prompt or sid" });

    try {
        // Dynamically import the model after dotenv.config() so the model reads env vars correctly
        const { main: getBotResponse } = await import('./model.js');
        const botResponse = await getBotResponse(prompt, sid);
        res.json({ reply: botResponse });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "failed to get bot response" });
    }
});

export default router;