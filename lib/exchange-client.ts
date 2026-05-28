import { Candle, MarketSnapshot, OrderBook, Indicators } from "@/types/signal";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function fetchMarketSnapshot(
  symbol: string = "BTCUSDT",
  interval: string = "15m",
  limit: number = 50
): Promise<MarketSnapshot> {
  try {
    // Map symbol to CoinGecko ID
    const coinId = getCoinGeckoId(symbol);

    // Fetch current price and market data
    const coinRes = await fetch(`${COINGECKO_API}/coins/${coinId}`);
    const coinData = await coinRes.json();

    const currentPrice = coinData.market_data.current_price.usd;
    const currentVolume = coinData.market_data.total_volume.usd || currentPrice * 1e6;

    console.log(`CoinGecko: Fetched ${coinId} at $${currentPrice}`);

    // Fetch historical price data for candles
    const days = Math.ceil(limit * 15 / 1440); // Convert 15m candles to days needed
    const historyRes = await fetch(
      `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${Math.max(days, 1)}&interval=daily`
    );
    const historyData = await historyRes.json();

    // Generate candles from price history
    const candles = generateCandlesFromPrices(historyData.prices, limit);

    // Calculate indicators
    const indicators = calculateIndicators(candles);

    // Order book simulation (CoinGecko doesn't provide this)
    const orderBook: OrderBook = {
      bestBid: currentPrice - (currentPrice * 0.001),
      bestAsk: currentPrice + (currentPrice * 0.001),
      bidAskImbalance: 0.55,
    };

    return {
      symbol,
      timeframe: interval,
      currentPrice,
      candles,
      indicators: { ...indicators, currentVolume, avgVolume20: calculateAvgVolume(candles) },
      orderBook,
      marketContext: {
        btcTrend: "bullish",
        ethTrend: "bullish",
        news: "none",
      },
    };
  } catch (error) {
    console.error("Error fetching market snapshot:", error);
    throw error;
  }
}

function calculateIndicators(candles: Candle[]): Indicators {
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);

  return {
    rsi14: calculateRSI(closes, 14),
    ema9: calculateEMA(closes, 9),
    ema21: calculateEMA(closes, 21),
    ema50: calculateEMA(closes, 50),
    ema200: calculateEMA(closes, 200),
    macdLine: calculateMACD(closes).line,
    macdSignal: calculateMACD(closes).signal,
    macdHist: calculateMACD(closes).histogram,
    bbUpper: calculateBollingerBands(closes).upper,
    bbMiddle: calculateBollingerBands(closes).middle,
    bbLower: calculateBollingerBands(closes).lower,
    atr14: calculateATR(candles, 14),
    currentVolume: volumes[volumes.length - 1],
    avgVolume20: calculateAvgVolume(candles),
  };
}

function calculateRSI(closes: number[], period: number): number {
  if (closes.length < period) return 50;

  let gains = 0, losses = 0;
  for (let i = 1; i < period + 1; i++) {
    const diff = closes[closes.length - i] - closes[closes.length - i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateEMA(closes: number[], period: number): number {
  if (closes.length < period) return closes[closes.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b) / period;

  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * multiplier + ema * (1 - multiplier);
  }

  return ema;
}

function calculateMACD(
  closes: number[]
): { line: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = ema12 - ema26;

  const macdValues: number[] = [];
  for (let i = Math.max(26, 26); i < closes.length; i++) {
    const e12 = calculateEMA(closes.slice(0, i + 1), 12);
    const e26 = calculateEMA(closes.slice(0, i + 1), 26);
    macdValues.push(e12 - e26);
  }

  const signal = calculateEMA(macdValues, 9);
  const histogram = macdLine - signal;

  return { line: macdLine, signal, histogram };
}

function calculateBollingerBands(
  closes: number[],
  period: number = 20
): { upper: number; middle: number; lower: number } {
  const sma = closes.slice(-period).reduce((a, b) => a + b) / period;
  const variance =
    closes
      .slice(-period)
      .reduce((sum, c) => sum + Math.pow(c - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: sma + 2 * stdDev,
    middle: sma,
    lower: sma - 2 * stdDev,
  };
}

function calculateATR(candles: Candle[], period: number): number {
  let trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  return trueRanges.slice(-period).reduce((a, b) => a + b) / period;
}

function calculateAvgVolume(candles: Candle[]): number {
  const volumes = candles.slice(-20).map((c) => c.volume);
  return volumes.reduce((a, b) => a + b) / volumes.length;
}

function calculateBidAskImbalance(bids: any[], asks: any[]): number {
  const bidVolume = bids.reduce((sum, [_, vol]) => sum + parseFloat(vol), 0);
  const askVolume = asks.reduce((sum, [_, vol]) => sum + parseFloat(vol), 0);
  return bidVolume / (bidVolume + askVolume);
}

function generateMockCandles(count: number): any[][] {
  const candles: any[][] = [];
  let basePrice = 68450;
  const now = Date.now();

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * 15 * 60 * 1000; // 15m intervals
    const change = (Math.random() - 0.5) * 200;
    const open = basePrice + change;
    const close = open + (Math.random() - 0.5) * 150;
    const high = Math.max(open, close) + Math.random() * 100;
    const low = Math.min(open, close) - Math.random() * 100;
    const volume = 1000000 + Math.random() * 2000000;

    candles.push([
      time,
      open.toString(),
      high.toString(),
      low.toString(),
      close.toString(),
      "10000", // quote asset volume
      time + 15 * 60 * 1000, // close time
      volume.toString(), // quote asset volume
    ]);

    basePrice = close;
  }

  return candles;
}

function getCoinGeckoId(symbol: string): string {
  const symbolMap: { [key: string]: string } = {
    BTCUSDT: "bitcoin",
    BTC: "bitcoin",
    ETHUSDT: "ethereum",
    ETH: "ethereum",
    BNBUSDT: "binancecoin",
    BNB: "binancecoin",
    XRPUSDT: "ripple",
    XRP: "ripple",
    ADAUSDT: "cardano",
    ADA: "cardano",
    DOGEUSDT: "dogecoin",
    DOGE: "dogecoin",
    SOLUSDT: "solana",
    SOL: "solana",
  };

  return symbolMap[symbol.toUpperCase()] || "bitcoin";
}

function generateCandlesFromPrices(prices: [number, number][], limit: number): Candle[] {
  if (prices.length === 0) {
    throw new Error("No price data available");
  }

  // Take the last `limit` prices
  const recentPrices = prices.slice(-limit);

  // Generate candles from price points
  const candles: Candle[] = recentPrices.map((price, index) => {
    const basePrice = price[1];
    const variation = basePrice * 0.005; // 0.5% variation
    const open = basePrice + (Math.random() - 0.5) * variation;
    const close = basePrice + (Math.random() - 0.5) * variation;
    const high = Math.max(open, close) + Math.random() * (variation / 2);
    const low = Math.min(open, close) - Math.random() * (variation / 2);
    const volume = 1000000 + Math.random() * 2000000;

    return {
      time: price[0],
      open,
      high,
      low,
      close,
      volume,
    };
  });

  return candles;
}
