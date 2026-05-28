import { z } from "zod";

export const TradingSignalSchema = z.object({
  signal: z.enum(["BUY", "SELL", "HOLD"]),
  confidence: z.number().min(0).max(1),
  timeframe: z.string(),
  symbol: z.string(),
  current_price: z.number(),
  entry_zone: z.object({ min: z.number(), max: z.number() }).nullable(),
  stop_loss: z.number().nullable(),
  take_profit_targets: z.array(z.number()),
  risk_reward_ratio: z.number(),
  indicators_summary: z.object({
    trend: z.enum(["bullish", "bearish", "neutral"]),
    momentum: z.enum(["strong_bullish", "bullish", "neutral", "bearish", "strong_bearish"]),
    volatility: z.enum(["low", "medium", "high"]),
    volume_status: z.enum(["above_average", "average", "below_average"]),
  }),
  key_levels: z.object({
    support: z.array(z.number()),
    resistance: z.array(z.number()),
  }),
  reasoning: z.string(),
  risks: z.array(z.string()),
  position_size_suggestion: z.string(),
  timestamp: z.string(),
});

export type TradingSignal = z.infer<typeof TradingSignalSchema>;
