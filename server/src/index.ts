import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { fetchFinancialNews, NewsItem } from './services/newsService';
import { analyzeNewsWithAI, AnalysisResult } from './services/aiService';

const app = express();
app.use(cors());
app.use(express.json());

interface AnalyzedArticle extends NewsItem {
  globalAnalysis: AnalysisResult | null;
  countryAnalysis: Record<string, AnalysisResult | null>;
}

// In-memory cache
let latestNews: AnalyzedArticle[] = [];
const SUPPORTED_COUNTRIES = [
  'India', 'USA', 'Australia', 'UK', 'Germany', 'Japan', 
  'China', 'Canada', 'France', 'Brazil', 'South Korea', 'Singapore', 'UAE'
];

// Background task to fetch and analyze news
async function runAutonomousPipeline() {
  console.log('[Scheduler] Running autonomous pipeline...');
  try {
    const rawNews = await fetchFinancialNews();
    if (rawNews.length === 0) return;

    // Process the top 3 newest articles to save API calls
    const newArticles = rawNews.slice(0, 3);
    const processed: AnalyzedArticle[] = [];

    for (const article of newArticles) {
      console.log(`[Pipeline] Analyzing: ${article.title}`);
      
      // Fetch global base analysis
      const globalAnalysis = await analyzeNewsWithAI(article.title, article.contentSnippet, 'Global');
      
      // Fetch specific country analyses
      const countryAnalysis: Record<string, AnalysisResult | null> = {};
      for (const country of SUPPORTED_COUNTRIES) {
        countryAnalysis[country] = await analyzeNewsWithAI(article.title, article.contentSnippet, country);
      }

      processed.push({
        ...article,
        globalAnalysis,
        countryAnalysis
      });
    }

    latestNews = processed;
    console.log('[Scheduler] Pipeline complete. Cache updated.');
  } catch (error) {
    console.error('[Scheduler] Pipeline error:', error);
  }
}

// Schedule every 10 minutes
cron.schedule('*/10 * * * *', () => {
  runAutonomousPipeline();
});

// Run once on startup
runAutonomousPipeline();

// REST Endpoints
app.get('/api/news', (req, res) => {
  res.json(latestNews);
});

app.get('/api/analysis/global', (req, res) => {
  if (latestNews.length === 0) {
    return res.json({ status: 'waiting_for_data' });
  }
  // Aggregate global insights from the latest top article
  const topArticle = latestNews[0];
  res.json({
    article: topArticle.title,
    analysis: topArticle.globalAnalysis
  });
});

app.get('/api/analysis/country/:country', (req, res) => {
  const { country } = req.params;
  if (latestNews.length === 0) {
    return res.json({ status: 'waiting_for_data' });
  }
  
  const topArticle = latestNews[0];
  const analysis = topArticle.countryAnalysis[country] || topArticle.globalAnalysis;
  
  res.json({
    country,
    article: topArticle.title,
    analysis: analysis
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MarketPulse Pro Backend running on port ${PORT}`);
});
