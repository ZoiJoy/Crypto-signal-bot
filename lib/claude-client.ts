import Anthropic from "@anthropic-ai/sdk";
import { TradingSignalSchema } from "./schemas";
import type { MarketSnapshot, TradingSignal } from "@/types/signal";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a crypto trading signal engine. Your job:
- Analyze the market snapshot provided by the user and return one structured trading decision in valid JSON.
- Use ONLY the data in the snapshot. Never invent missing numbers or data.
- Be conservative. When signals conflict or are unclear, choose "HOLD".
- Output must be valid JSON only and match the schema exactly.
- If confidence is below 0.65, output "HOLD" unless there is a confirmed breakout with strong volume.
- If price is below major resistance and RSI is below 60, prefer "HOLD" unless breakout confirmation is clear.
- For HOLD signals: entry_zone = null, stop_loss = null, take_profit_targets = [], position_size_suggestion = "0%"
- For BUY/SELL signals: include active entry zone, stop loss, and profit targets.
- Treat stop loss, position size, and targets as risk guidance only, not execution advice.
- If JSON cannot be formed exactly, return the closest valid JSON using the same schema.`;

export async function generateSignal(
  snapshot: MarketSnapshot
): Promise<TradingSignal> {
  // Demo mode: if API key is not set or is placeholder, use realistic demo signal
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes("your-key") || apiKey === "sk-ant-your-key-here") {
    console.log("Demo mode: generating realistic demo signal");
    return generateDemoSignal(snapshot);
  }

  const snapshotText = formatSnapshotForClaude(snapshot);

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: snapshotText,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Extract JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not find JSON in response:", textContent.text);
      return generateDemoSignal(snapshot);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and add timestamp
    const validated = TradingSignalSchema.parse(parsed);
    return {
      ...validated,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating signal:", error);
    return generateDemoSignal(snapshot);
  }
}

function formatSnapshotForClaude(snapshot: MarketSnapshot): string {
  const { symbol, timeframe, currentPrice, indicators, orderBook, marketContext } = snapshot;

  return `Analyze this market snapshot and return only valid JSON.

SYMBOL: ${symbol}
TIMEFRAME: ${timeframe}
CURRENT PRICE: ${currentPrice}

INDICATORS:
RSI_14: ${indicators.rsi14.toFixed(1)}
EMA_9: ${indicators.ema9.toFixed(2)}
EMA_21: ${indicators.ema21.toFixed(2)}
EMA_50: ${indicators.ema50.toFixed(2)}
EMA_200: ${indicators.ema200.toFixed(2)}
MACD_LINE: ${indicators.macdLine.toFixed(1)}
MACD_SIGNAL: ${indicators.macdSignal.toFixed(1)}
MACD_HIST: ${indicators.macdHist.toFixed(1)}
BB_UPPER: ${indicators.bbUpper.toFixed(2)}
BB_MIDDLE: ${indicators.bbMiddle.toFixed(2)}
BB_LOWER: ${indicators.bbLower.toFixed(2)}
ATR_14: ${indicators.atr14.toFixed(0)}
CURRENT_VOLUME: ${indicators.currentVolume.toFixed(0)}
AVG_VOLUME_20: ${indicators.avgVolume20.toFixed(0)}

ORDER BOOK:
BEST_BID: ${orderBook.bestBid.toFixed(2)}
BEST_ASK: ${orderBook.bestAsk.toFixed(2)}
BID_ASK_IMBALANCE: ${orderBook.bidAskImbalance.toFixed(2)}

MARKET CONTEXT:
BTC_TREND: ${marketContext.btcTrend}
ETH_TREND: ${marketContext.ethTrend}
NEWS_SNIPPET: ${marketContext.news}`;
}

function createDefaultHoldSignal(snapshot: MarketSnapshot): TradingSignal {
  return {
    signal: "HOLD",
    confidence: 0.5,
    timeframe: snapshot.timeframe,
    symbol: snapshot.symbol,
    current_price: snapshot.currentPrice,
    entry_zone: null,
    stop_loss: null,
    take_profit_targets: [],
    risk_reward_ratio: 0,
    indicators_summary: {
      trend: "neutral",
      momentum: "neutral",
      volatility: "medium",
      volume_status: "average",
    },
    key_levels: {
      support: [],
      resistance: [],
    },
    reasoning: "Could not generate signal due to API error. Defaulting to HOLD.",
    risks: ["API error", "Unable to analyze data"],
    position_size_suggestion: "0%",
    timestamp: new Date().toISOString(),
  };
}

function generateDemoSignal(snapshot: MarketSnapshot): TradingSignal {
  // Generate realistic demo signal based on the market snapshot
  const price = snapshot.currentPrice;
  const rsi = snapshot.indicators.rsi14;
  const ema9 = snapshot.indicators.ema9;
  const ema21 = snapshot.indicators.ema21;
  const ema50 = snapshot.indicators.ema50;
  const macdHist = snapshot.indicators.macdHist;
  const volume = snapshot.indicators.currentVolume;
  const avgVolume = snapshot.indicators.avgVolume20;

  // Determine signal based on indicators
  let signal: "BUY" | "SELL" | "HOLD" = "HOLD";
  let confidence = 0.5;
  let reasoning = "";

  // Trend check
  const bullishTrend = ema9 > ema21 && ema21 > ema50;
  const bearishTrend = ema9 < ema21 && ema21 < ema50;

  // Momentum check
  const bullishMomentum = macdHist > 0 && rsi > 45;
  const bearishMomentum = macdHist < 0 && rsi < 55;

  // Volume check
  const volumeAboveAverage = volume > avgVolume * 1.1;

  if (bullishTrend && bullishMomentum && volumeAboveAverage) {
    signal = "BUY";
    confidence = 0.72;
    reasoning = "Bullish EMA alignment with positive MACD and above-average volume. RSI neutral with room for upside.";
  } else if (bearishTrend && bearishMomentum && volumeAboveAverage) {
    signal = "SELL";
    confidence = 0.68;
    reasoning = "Bearish EMA alignment with negative MACD and above-average volume. Momentum downward.";
  } else if (bullishTrend && bullishMomentum) {
    signal = "BUY";
    confidence = 0.62;
    reasoning = "Bullish trend and momentum, but volume at average. Consider waiting for volume confirmation.";
  } else {
    signal = "HOLD";
    confidence = 0.65;
    reasoning = "Mixed signals or insufficient confirmation. Waiting for clearer setup.";
  }

  // Build support and resistance levels
  const support = [ema21, ema50, snapshot.indicators.bbLower];
  const resistance = [snapshot.indicators.bbUpper, ema21 + (ema50 - ema21) * 1.5];

  let entry_zone: { min: number; max: number } | null = null;
  let stop_loss: number | null = null;
  let take_profit_targets: number[] = [];
  let riskRewardRatio = 0;

  if (signal === "BUY") {
    const entryMin = Math.min(price, ema21);
    const entryMax = price;
    entry_zone = {
      min: Math.round(entryMin * 100) / 100,
      max: Math.round(entryMax * 100) / 100,
    };
    stop_loss = Math.round((ema50 - 50) * 100) / 100;
    take_profit_targets = [
      Math.round(resistance[0] * 100) / 100,
      Math.round((price + (resistance[0] - price) * 1.5) * 100) / 100,
      Math.round((price * 1.03) * 100) / 100,
    ];
    riskRewardRatio = Math.round((take_profit_targets[2] - price) / (price - stop_loss) * 100) / 100;
  } else if (signal === "SELL") {
    const entryMax = Math.max(price, ema21);
    const entryMin = price;
    entry_zone = {
      min: Math.round(entryMin * 100) / 100,
      max: Math.round(entryMax * 100) / 100,
    };
    stop_loss = Math.round((ema50 + 50) * 100) / 100;
    take_profit_targets = [
      Math.round(support[0] * 100) / 100,
      Math.round((price - (price - support[0]) * 1.5) * 100) / 100,
      Math.round((price * 0.97) * 100) / 100,
    ];
    riskRewardRatio = Math.round((price - take_profit_targets[2]) / (stop_loss - price) * 100) / 100;
  }

  return {
    signal,
    confidence,
    timeframe: snapshot.timeframe,
    symbol: snapshot.symbol,
    current_price: price,
    entry_zone,
    stop_loss,
    take_profit_targets,
    risk_reward_ratio: riskRewardRatio,
    indicators_summary: {
      trend: bullishTrend ? "bullish" : bearishTrend ? "bearish" : "neutral",
      momentum: macdHist > 0 && rsi > 50 ? "strong_bullish" : macdHist > 0 ? "bullish" : macdHist < -5 ? "strong_bearish" : "bearish",
      volatility: snapshot.indicators.atr14 > 300 ? "high" : snapshot.indicators.atr14 > 150 ? "medium" : "low",
      volume_status: volumeAboveAverage ? "above_average" : "average",
    },
    key_levels: {
      support: support.map(s => Math.round(s * 100) / 100),
      resistance: resistance.map(r => Math.round(r * 100) / 100),
    },
    reasoning,
    risks: [
      signal === "BUY" ? "Short-term volatility risk" : "Potential reversal risk",
      "Market sentiment could shift rapidly",
      "ATR indicates moderate volatility",
      confidence < 0.7 ? "Low confidence setup" : "Confirmed by volume",
    ],
    position_size_suggestion: signal === "HOLD" ? "0%" : "1–2%",
    timestamp: new Date().toISOString(),
  };
}
