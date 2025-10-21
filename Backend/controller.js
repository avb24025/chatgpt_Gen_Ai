import express from 'express';
import dotenv from 'dotenv';
import { main as getBotResponse } from './model.js';


const router= express.Router();
dotenv.config();

router.post('/', async (req, res) => {
    const { prompt, sid } = req.body;
    if (!prompt || !sid) return res.status(400).json({ error: "missing prompt or sid" });

    try {
        const botResponse = await getBotResponse(prompt, sid);
        res.json({ reply: botResponse });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "failed to get bot response" });
    }
});

export default router;