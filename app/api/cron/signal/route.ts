import { fetchMarketSnapshot } from "@/lib/exchange-client";
import { generateSignal } from "@/lib/claude-client";
import { saveSignal } from "@/lib/signal-store";

export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Cron: Generating signal for BTC/USDT 15m");

    const snapshot = await fetchMarketSnapshot("BTCUSDT", "15m");
    const signal = await generateSignal(snapshot);
    await saveSignal(signal);

    console.log(
      `Cron: Signal generated - ${signal.signal} (confidence: ${signal.confidence})`
    );

    return Response.json({ success: true, signal });
  } catch (error) {
    console.error("Cron job failed:", error);
    return Response.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}
