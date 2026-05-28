export interface MarketSnapshot {
  symbol: string;
  timeframe: string;
  currentPrice: number;
  candles: Candle[];
  indicators: Indicators;
  orderBook: OrderBook;
  marketContext: MarketContext;
}

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
}

export interface Indicators {
  rsi14: number;
  ema9: number;
  ema21: number;
  ema50: number;
  ema200: number;
  macdLine: number;
  macdSignal: number;
  macdHist: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  atr14: number;
  currentVolume: number;
  avgVolume20: number;
}

export interface OrderBook {
  bestBid: number;
  bestAsk: number;
  bidAskImbalance: number;
}

export interface MarketContext {
  btcTrend: string;
  ethTrend: string;
  news: string;
}

export interface TradingSignal {
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  timeframe: string;
  symbol: string;
  current_price: number;
  entry_zone: { min: number; max: number } | null;
  stop_loss: number | null;
  take_profit_targets: number[];
  risk_reward_ratio: number;
  indicators_summary: {
    trend: "bullish" | "bearish" | "neutral";
    momentum: "strong_bullish" | "bullish" | "neutral" | "bearish" | "strong_bearish";
    volatility: "low" | "medium" | "high";
    volume_status: "above_average" | "average" | "below_average";
  };
  key_levels: {
    support: number[];
    resistance: number[];
  };
  reasoning: string;
  risks: string[];
  position_size_suggestion: string;
  timestamp: string;
}
