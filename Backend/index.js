import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { main as getBotResponse } from './model.js';
import userRoutes from './controller.js';

dotenv.config();
const app=express();
// Fix: use environment PORT if present, otherwise 5000
const PORT = process.env.PORT || 5000;
app.use(express.json());

app.use(cors());

app.use('/api/chat',userRoutes);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});


