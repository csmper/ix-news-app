const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');

const cors = require('cors');
const app = express();
const PORT = 3001;
const parser = new xml2js.Parser();

// Allow a specific origin
app.use(cors({
  origin: 'http://localhost:4200'
}));

// API endpoint to fetch Google News RSS
app.get('/api/news', async (req, res) => {
  try {
    const response = await axios.get('https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en');
    const jsonData = await parser.parseStringPromise(response.data);
    res.json(jsonData);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`News API available at http://localhost:${PORT}/api/news`);
});
