"use client";

import { useEffect, useState } from "react";
import type { TradingSignal } from "@/types/signal";

export default function Dashboard() {
  const [signal, setSignal] = useState<TradingSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignal = async () => {
      try {
        const res = await fetch("/api/signal");
        if (!res.ok) throw new Error("Failed to fetch signal");
        const data = await res.json();
        setSignal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchSignal();
    const interval = setInterval(fetchSignal, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-red-600">
        <p>Error: {error}</p>
      </div>
    );

  if (!signal)
    return (
      <div className="p-8 text-gray-400">
        <p>No signal available</p>
      </div>
    );

  const signalColor =
    signal.signal === "BUY"
      ? "bg-green-900 border-green-700"
      : signal.signal === "SELL"
      ? "bg-red-900 border-red-700"
      : "bg-gray-700 border-gray-600";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Crypto Signal Bot</h1>

        {/* Signal Header */}
        <div className={`p-6 rounded-lg mb-6 border ${signalColor}`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">{signal.signal}</h2>
              <p className="text-sm text-gray-300">
                {signal.symbol} • {signal.timeframe}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl">${signal.current_price.toFixed(2)}</p>
              <p className="text-sm">
                Confidence: {(signal.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Key Levels */}
        {signal.signal !== "HOLD" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {signal.entry_zone && (
              <div className="bg-gray-800 p-4 rounded border border-gray-700">
                <p className="text-sm text-gray-400">Entry Zone</p>
                <p className="text-lg font-bold">
                  {signal.entry_zone.min.toFixed(2)} -{" "}
                  {signal.entry_zone.max.toFixed(2)}
                </p>
              </div>
            )}
            {signal.stop_loss && (
              <div className="bg-gray-800 p-4 rounded border border-gray-700">
                <p className="text-sm text-gray-400">Stop Loss</p>
                <p className="text-lg font-bold text-red-400">
                  {signal.stop_loss.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Targets */}
        {signal.take_profit_targets.length > 0 && (
          <div className="bg-gray-800 p-4 rounded mb-6 border border-gray-700">
            <p className="text-sm text-gray-400 mb-3">Take Profit Targets</p>
            <div className="space-y-2">
              {signal.take_profit_targets.map((tp, i) => (
                <p key={i} className="text-green-400">
                  TP{i + 1}: ${tp.toFixed(2)}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Indicators */}
        <div className="bg-gray-800 p-4 rounded mb-6 border border-gray-700">
          <h3 className="font-bold mb-3">Indicators</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p>
              Trend:{" "}
              <span className="font-bold capitalize">
                {signal.indicators_summary.trend}
              </span>
            </p>
            <p>
              Momentum:{" "}
              <span className="font-bold capitalize">
                {signal.indicators_summary.momentum.replace("_", " ")}
              </span>
            </p>
            <p>
              Volatility:{" "}
              <span className="font-bold capitalize">
                {signal.indicators_summary.volatility}
              </span>
            </p>
            <p>
              Volume:{" "}
              <span className="font-bold capitalize">
                {signal.indicators_summary.volume_status.replace("_", " ")}
              </span>
            </p>
          </div>
        </div>

        {/* Reasoning */}
        <div className="bg-gray-800 p-4 rounded mb-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Reasoning</p>
          <p>{signal.reasoning}</p>
        </div>

        {/* Risks */}
        {signal.risks.length > 0 && (
          <div className="bg-gray-800 p-4 rounded mb-6 border border-gray-700">
            <p className="text-sm text-gray-400 mb-3">Risks</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {signal.risks.map((risk, i) => (
                <li key={i}>{risk}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-500 text-right">
          <p>Updated: {new Date(signal.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
