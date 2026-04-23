import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function CountryInsights({ data, country, onCountryChange }: { data: any, country: string, onCountryChange: (c: string) => void }) {
  if (!data) return null;

  const countries = [
    'India', 'USA', 'Australia', 'UK', 'Germany', 'Japan', 
    'China', 'Canada', 'France', 'Brazil', 'South Korea', 'Singapore', 'UAE'
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-gray-800/50 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MapPin className="text-gold-400" />
          Localized Intelligence
        </h3>
        
        <select 
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="bg-[#151A22] border border-gray-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2"
        >
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.countrySignals?.map((signal: any, idx: number) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="p-4 rounded-xl bg-[#151A22] border border-gray-800 relative"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-lg font-bold text-white">{signal.asset}</div>
                <div className="text-[10px] text-cyan-500 uppercase tracking-wider font-semibold">{signal.assetType}</div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${signal.action === 'BUY' ? 'bg-green-500/20 text-green-400' : signal.action === 'AVOID' || signal.action === 'SELL' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {signal.action}
                </span>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-3">{signal.reasoning}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 pt-3 mt-1">
              <div>Success Probability: <span className="text-gold-400 font-bold">{signal.successPercentage}%</span></div>
              <div>Risk: <span className={`font-bold ${signal.risk === 'High' ? 'text-red-400' : signal.risk === 'Low' ? 'text-green-400' : 'text-gray-400'}`}>{signal.risk}</span></div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 p-4 rounded-xl bg-gray-800/30 border border-gray-800/50">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Context</h4>
        <p className="text-sm text-gray-300">{data.explanation}</p>
      </div>
    </div>
  );
}
