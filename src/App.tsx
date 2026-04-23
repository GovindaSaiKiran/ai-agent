import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { NewsFeed } from './components/NewsFeed';
import { GlobalInsights } from './components/GlobalInsights';
import { CountryInsights } from './components/CountryInsights';

function App() {
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [globalData, setGlobalData] = useState<any>(null);
  const [countryData, setCountryData] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initial fetch of the latest top article
  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      try {
        const [globalRes, countryRes] = await Promise.all([
          fetch('http://localhost:3000/api/analysis/global'),
          fetch(`http://localhost:3000/api/analysis/country/${selectedCountry}`)
        ]);
        
        const gData = await globalRes.json();
        const cData = await countryRes.json();
        
        if (gData.status !== 'waiting_for_data') {
          setGlobalData(gData.analysis);
          setCountryData(cData.analysis);
          setIsInitializing(false);
        }
      } catch (e) {
        console.error('Failed to fetch analysis', e);
      }
    };
    
    fetchLatestAnalysis();
    const interval = setInterval(fetchLatestAnalysis, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [selectedCountry]);

  // Handle clicking a specific article in the feed
  const handleSelectArticle = (id: string) => {
    // In a real app, this would fetch the specific article's analysis.
    // For this prototype, the backend currently exposes just the latest.
    console.log('Selected article:', id);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white selection:bg-cyan-500/30 overflow-hidden relative font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="glass border-b border-gray-800/50 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2 rounded-xl shadow-lg relative">
              <Activity className="text-[#0B0E14]" size={24} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">MarketPulse Pro</h1>
              <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1">
                Autonomous Intelligence Mode
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {isInitializing ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-gray-500">
             <div className="w-16 h-16 mx-auto mb-6 opacity-20 rounded-full border-4 border-dashed border-cyan-400 animate-[spin_10s_linear_infinite]" />
             <h2 className="text-xl font-bold text-white mb-2">Initializing Autonomous Pipeline...</h2>
             <p>Fetching real-time news and generating AI signals.</p>
             <p className="text-xs text-gray-600 mt-2">This may take a moment while the backend populates its cache.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-120px)]">
            
            {/* Left Column - Live News Feed */}
            <div className="lg:col-span-4 h-full pb-8">
              <NewsFeed onSelectArticle={handleSelectArticle} />
            </div>

            {/* Right Column - Analysis Dashboards */}
            <div className="lg:col-span-8 h-full overflow-y-auto pb-8 custom-scrollbar pr-2">
              <GlobalInsights data={globalData} />
              <CountryInsights 
                data={countryData} 
                country={selectedCountry} 
                onCountryChange={setSelectedCountry} 
              />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
