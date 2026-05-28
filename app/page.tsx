import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">Crypto Signal Bot</h1>
        <p className="text-xl text-gray-300 mb-8">
          Real-time cryptocurrency trading signals powered by Claude AI and Anthropic's latest models.
        </p>

        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <ul className="text-left space-y-3 text-gray-300">
            <li>✓ Live market data from Binance (BTC/USDT, 15m)</li>
            <li>✓ Technical indicators: RSI, EMA, MACD, Bollinger Bands, ATR</li>
            <li>✓ Claude-powered signal analysis (BUY/SELL/HOLD)</li>
            <li>✓ Risk management guidance (entry, stop-loss, take-profit)</li>
            <li>✓ Automated cron jobs (every 15 minutes on Vercel)</li>
            <li>✓ Signal persistence with Vercel KV</li>
            <li>✓ Real-time dashboard with signal updates</li>
          </ul>
        </div>

        <Link
          href="/dashboard"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg mb-6 transition"
        >
          View Dashboard
        </Link>

        <div className="text-gray-400 text-sm">
          <p>📊 API Endpoint: <code className="bg-gray-800 px-2 py-1 rounded">/api/signal</code></p>
          <p>⏰ Cron Job: <code className="bg-gray-800 px-2 py-1 rounded">/api/cron/signal</code> (every 15 min)</p>
          <p>📈 Dashboard: <code className="bg-gray-800 px-2 py-1 rounded">/dashboard</code></p>
        </div>
      </div>
    </div>
  );
}
