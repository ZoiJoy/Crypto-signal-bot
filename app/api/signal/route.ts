import { fetchMarketSnapshot } from "@/lib/exchange-client";
import { generateSignal } from "@/lib/claude-client";
import { saveSignal } from "@/lib/signal-store";
import { TradingSignalSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const timeframe = searchParams.get("timeframe") || "15m";

  try {
    // Fetch market data
    const snapshot = await fetchMarketSnapshot(symbol, timeframe);

    // Generate signal
    const signal = await generateSignal(snapshot);

    // Validate
    const validated = TradingSignalSchema.parse(signal);

    // Try to save to KV (graceful failure if not configured)
    try {
      await saveSignal(validated);
    } catch (kvError) {
      console.warn("KV storage not available (this is OK for local testing):", kvError);
    }

    return Response.json(validated);
  } catch (error) {
    console.error("Signal generation failed:", error);
    return Response.json(
      { error: "Failed to generate signal", details: String(error) },
      { status: 500 }
    );
  }
}
