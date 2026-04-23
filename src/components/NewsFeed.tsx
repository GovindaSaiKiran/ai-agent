import { useEffect, useState } from 'react';
import { Newspaper, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  pubDate: string;
}

export function NewsFeed({ onSelectArticle }: { onSelectArticle: (id: string) => void }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/news');
        const data = await res.json();
        setNews(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch news feed', error);
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4 p-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-700 rounded w-3/4"></div></div></div>;
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-gray-800/50 h-full flex flex-col">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 pb-4 border-b border-gray-800/50">
        <Newspaper className="text-cyan-400" />
        Live Market Feed
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        <AnimatePresence>
          {news.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={item.id}
              onClick={() => onSelectArticle(item.id)}
              className="group cursor-pointer p-4 rounded-xl bg-[#151A22] border border-gray-800/50 hover:border-cyan-500/30 hover:bg-gray-800/50 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
              <div className="text-xs text-gold-400 font-semibold mb-1 uppercase tracking-wider">{item.source}</div>
              <h4 className="text-gray-200 text-sm font-medium leading-tight mb-3 group-hover:text-white transition-colors">{item.title}</h4>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Clock size={12} />
                {new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {news.length === 0 && <p className="text-gray-500 text-center py-8">Waiting for autonomous data stream...</p>}
      </div>
    </div>
  );
}
