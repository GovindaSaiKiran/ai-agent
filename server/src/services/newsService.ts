import Parser from 'rss-parser';

const parser = new Parser();

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
}

export async function fetchFinancialNews(): Promise<NewsItem[]> {
  try {
    // Google News RSS for Finance/Markets, including various metals
    const feed = await parser.parseURL('https://news.google.com/rss/search?q=finance+OR+markets+OR+economy+OR+oil+OR+gold+OR+silver+OR+copper+OR+metals+OR+stocks&hl=en-US&gl=US&ceid=US:en');
    
    // Get top 10 articles
    const articles = feed.items.slice(0, 10).map(item => ({
      id: item.guid || item.link || Math.random().toString(),
      title: item.title || 'Unknown Title',
      link: item.link || '',
      pubDate: item.pubDate || new Date().toISOString(),
      contentSnippet: item.contentSnippet || item.content || 'No summary available.',
      source: item.source || 'Google News RSS'
    }));
    
    return articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}
