import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { main as getBotResponse } from './model.js';

dotenv.config();
const app=express();
// Fix: use environment PORT if present, otherwise 5000
const PORT = process.env.PORT || 5000;
app.use(express.json());

app.use(cors());

app.post('/api/chat', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://axfbbots.vercel.app"); // frontend URL
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    const { prompt, sid} = req.body;
    if (!prompt && !sid) return res.status(400).json({ error: "missing prompt" });

    try {
        // Await the exported main() and return its result
        const botResponse = await getBotResponse(prompt,sid);
        res.json({ reply: botResponse });
    } catch (e) {
        res.status(500).json({ error: "failed to get bot response" });
    }
});



app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});


