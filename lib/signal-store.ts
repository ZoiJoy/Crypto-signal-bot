import { kv } from "@vercel/kv";
import type { TradingSignal } from "@/types/signal";

const SIGNAL_KEY = "crypto:latest-signal";
const SIGNAL_HISTORY_KEY = "crypto:signal-history";

export async function saveSignal(signal: TradingSignal): Promise<void> {
  try {
    // Save latest signal
    await kv.set(SIGNAL_KEY, JSON.stringify(signal), { ex: 86400 * 7 }); // 7 days TTL

    // Save to history
    await kv.lpush(SIGNAL_HISTORY_KEY, JSON.stringify(signal));
    await kv.ltrim(SIGNAL_HISTORY_KEY, 0, 99); // Keep last 100 signals
  } catch (error) {
    console.error("Error saving signal:", error);
    throw error;
  }
}

export async function getLatestSignal(): Promise<TradingSignal | null> {
  try {
    const data = await kv.get(SIGNAL_KEY);
    return data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.error("Error retrieving signal:", error);
    return null;
  }
}

export async function getSignalHistory(): Promise<TradingSignal[]> {
  try {
    const data = await kv.lrange(SIGNAL_HISTORY_KEY, 0, -1);
    return data.map((item) => JSON.parse(item as string));
  } catch (error) {
    console.error("Error retrieving signal history:", error);
    return [];
  }
}
