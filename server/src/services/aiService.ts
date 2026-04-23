import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export interface AnalysisResult {
  summary: string;
  category: string;
  urgency: string;
  sentiment: string;
  riskEnvironment: string;
  topGlobalAsset: string;
  topCountryAsset: string;
  globalSignals: AssetSignal[];
  countrySignals: AssetSignal[];
  explanation: string;
  didYouKnow: string;
}

export interface AssetSignal {
  asset: string;
  assetType: 'Stock' | 'Metal' | 'Oil' | 'Currency' | 'Other';
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  action: 'BUY' | 'HOLD' | 'WAIT' | 'AVOID' | 'SELL';
  successPercentage: number;
  risk: 'Low' | 'Medium' | 'High';
  reasoning: string;
}

const SYSTEM_PROMPT = `
You are "MarketPulse Pro — Autonomous Intelligence Mode", an elite AI agent system.
Analyze the provided news.

CRITICAL INSTRUCTION FOR COUNTRY SIGNALS:
For the requested TARGET COUNTRY, you MUST explicitly provide investment success percentages for local assets across these specific categories:
1. Local Stocks/Indices (e.g., Nifty for India, ASX for Australia, etc.)
2. Metals (e.g., Gold, Silver, Copper)
3. Oil (e.g., Crude, Brent)
Provide a signal and success percentage for each of these in the "countrySignals" array.

You must output a strictly valid JSON object matching the requested schema. No markdown wrapping, just raw JSON.

Output Schema:
{
  "summary": "One sentence summary of the news",
  "category": "Macroeconomic | Geopolitical | Corporate etc",
  "urgency": "BREAKING | DEVELOPING | BACKGROUND",
  "sentiment": "POSITIVE | NEGATIVE | MIXED | NEUTRAL",
  "riskEnvironment": "Risk-ON | Risk-OFF | Neutral",
  "topGlobalAsset": "Asset name (e.g. Gold)",
  "topCountryAsset": "Asset name specific to the requested country",
  "globalSignals": [
    { "asset": "Asset name", "assetType": "Stock|Metal|Oil|Currency|Other", "signal": "BULLISH|BEARISH|NEUTRAL", "action": "BUY|HOLD|WAIT|AVOID|SELL", "successPercentage": 85, "risk": "Low|Medium|High", "reasoning": "Simple explanation" }
  ],
  "countrySignals": [
    { "asset": "Asset name specific to country", "assetType": "Stock|Metal|Oil|Currency|Other", "signal": "BULLISH|BEARISH|NEUTRAL", "action": "BUY|HOLD|WAIT|AVOID|SELL", "successPercentage": 75, "risk": "Low|Medium|High", "reasoning": "Simple explanation" }
  ],
  "explanation": "Beginner-friendly explanation of why this matters",
  "didYouKnow": "Interesting educational fact related to the event"
}
`;

export async function analyzeNewsWithAI(newsHeadline: string, newsSummary: string, country: string = 'India'): Promise<AnalysisResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.log('Using DEMO MODE for AI Analysis (No API Key)');
    return getMockAnalysis(newsHeadline, country);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `${SYSTEM_PROMPT}\n\nNEWS:\nTitle: ${newsHeadline}\nSummary: ${newsSummary}\n\nTARGET COUNTRY: ${country}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    return null;
  } catch (error) {
    console.error('AI Analysis failed, falling back to Demo Mode:', error);
    return getMockAnalysis(newsHeadline, country);
  }
}

function getMockAnalysis(headline: string, country: string): AnalysisResult {
  const isNegative = headline.toLowerCase().includes('conflict') || headline.toLowerCase().includes('drop') || headline.toLowerCase().includes('inflation');
  
  return {
    summary: `Demo Mode Summary: ${headline}`,
    category: isNegative ? 'Geopolitical / Risk' : 'Macroeconomic',
    urgency: 'BREAKING',
    sentiment: isNegative ? 'NEGATIVE' : 'POSITIVE',
    riskEnvironment: isNegative ? 'Risk-OFF' : 'Risk-ON',
    topGlobalAsset: isNegative ? 'Gold' : 'S&P 500',
    topCountryAsset: country === 'India' && isNegative ? 'USD/INR' : 'Local Equities',
    globalSignals: [
      {
        asset: 'Gold',
        assetType: 'Metal',
        signal: isNegative ? 'BULLISH' : 'NEUTRAL',
        action: isNegative ? 'BUY' : 'HOLD',
        successPercentage: 85,
        risk: 'Low',
        reasoning: 'Safe haven asset during uncertainty.'
      },
      {
        asset: 'US Dollar',
        assetType: 'Currency',
        signal: isNegative ? 'BULLISH' : 'BEARISH',
        action: isNegative ? 'BUY' : 'WAIT',
        successPercentage: 80,
        risk: 'Medium',
        reasoning: 'Global reserve currency demand.'
      }
    ],
    countrySignals: [
      {
        asset: country === 'India' ? 'Nifty 50' : `${country} Index`,
        assetType: 'Stock',
        signal: isNegative ? 'BEARISH' : 'BULLISH',
        action: isNegative ? 'AVOID' : 'BUY',
        successPercentage: 75,
        risk: 'High',
        reasoning: 'Local equities react to global macro flows.'
      },
      {
        asset: 'Silver',
        assetType: 'Metal',
        signal: isNegative ? 'BULLISH' : 'NEUTRAL',
        action: isNegative ? 'BUY' : 'HOLD',
        successPercentage: 82,
        risk: 'Medium',
        reasoning: 'Industrial and precious metal demand shifts.'
      },
      {
        asset: 'Crude Oil',
        assetType: 'Oil',
        signal: 'NEUTRAL',
        action: 'HOLD',
        successPercentage: 65,
        risk: 'High',
        reasoning: 'Supply chain impacts vs demand destruction.'
      }
    ],
    explanation: 'This is a demo mode response. To see real AI reasoning, please add your Gemini API key to the backend .env file.',
    didYouKnow: 'The MarketPulse Pro agent can analyze millions of data points if given a valid API key!'
  };
}