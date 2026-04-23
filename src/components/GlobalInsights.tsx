import { Globe, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function GlobalInsights({ data }: { data: any }) {
  if (!data) return null;

  const isRiskOn = data.riskEnvironment?.includes('ON');

  return (
    <div className="glass-panel rounded-2xl p-6 border border-gray-800/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe className="text-blue-400" />
          Global Macro View
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isRiskOn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {data.riskEnvironment || 'Unknown Risk'}
        </div>
      </div>

      <div className="bg-[#151A22] rounded-xl p-5 border border-gray-800 mb-6">
        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Latest Intelligence Summary</h4>
        <p className="text-gray-200 text-sm leading-relaxed">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.globalSignals?.map((signal: any, idx: number) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="p-4 rounded-xl bg-gradient-to-br from-[#151A22] to-[#0B0E14] border border-gray-800 relative overflow-hidden"
          >
            {idx === 0 && <div className="absolute top-0 right-0 bg-gold-500 text-obsidian-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg">🔥 TOP SIGNAL</div>}
            
            <div className="flex justify-between items-center mb-1">
              <div className="text-xl font-bold text-white">{signal.asset}</div>
              <div className="text-[10px] uppercase text-gray-500 font-bold">{signal.assetType}</div>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${signal.signal === 'BULLISH' ? 'bg-green-500/20 text-green-400' : signal.signal === 'BEARISH' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {signal.signal}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-bold text-cyan-400">{signal.action}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-bold text-gold-400">{signal.successPercentage}% Success</span>
            </div>

            <p className="text-gray-400 text-xs line-clamp-2">{signal.reasoning}</p>
          </motion.div>
        ))}
      </div>
      
      {data.didYouKnow && (
        <div className="mt-6 p-4 rounded-xl bg-cyan-900/10 border border-cyan-500/20 flex gap-3">
          <AlertTriangle className="text-cyan-400 shrink-0" size={18} />
          <p className="text-xs text-cyan-100">{data.didYouKnow}</p>
        </div>
      )}
    </div>
  );
}
