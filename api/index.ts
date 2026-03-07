import express, { Request, Response } from 'express';
import axios from 'axios';
import xml2js from 'xml2js';
import cors from 'cors';

const app = express();
const parser = new xml2js.Parser();

// Allow a specific origin
app.use(cors({
  origin: 'http://localhost:4200'
}));

// API endpoint to fetch Google News RSS
app.get('/api/news', async (req: Request, res: Response) => {
  try {
    const newsType: string = (req.query.newsType as string) || 'Top Stories';
    const response = await axios.get(`https://news.google.com/rss?q=${newsType}&hl=en-IN&gl=IN&ceid=IN:en`);
    const jsonData = await parser.parseStringPromise(response.data);
    res.json(jsonData);
  } catch (error: any) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({
      error: 'Failed to fetch news',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

const PORT: number = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`News API available at http://localhost:${PORT}/api/news`);
});

// IMPORTANT: Export for Vercel, do not use app.listen()
export default app;