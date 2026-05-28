# Crypto Signal Bot

Real-time cryptocurrency trading signal generation powered by Claude AI and Next.js. Analyzes market data and generates conservative trading signals with risk management guidance.

## Features

- ✅ Live Binance market data (BTC/USDT, 15m candles)
- ✅ Technical indicators: RSI, EMA (9/21/50/200), MACD, Bollinger Bands, ATR
- ✅ Claude AI-powered signal analysis (BUY/SELL/HOLD)
- ✅ Risk management: entry zones, stop-loss, take-profit targets
- ✅ Vercel cron jobs (every 15 minutes, automatic)
- ✅ Signal persistence with Vercel KV (Redis)
- ✅ Real-time dashboard with signal updates
- ✅ JSON API for on-demand signal generation

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Claude API key

# Run dev server
npm run dev
```

Visit:
- Home: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- API: http://localhost:3000/api/signal

## Project Structure

```
lib/
├── exchange-client.ts       # Binance API + technical indicators
├── claude-client.ts         # Claude integration
├── schemas.ts               # Zod validation
└── signal-store.ts          # Vercel KV storage

app/
├── api/signal/route.ts      # On-demand endpoint
├── api/cron/signal/route.ts # Cron handler
├── dashboard/page.tsx       # Signal UI
└── page.tsx                 # Home page

types/
└── signal.ts                # TypeScript types
```

## API Endpoints

### Get Latest Signal
```bash
GET /api/signal?symbol=BTCUSDT&timeframe=15m
```

Response: TradingSignal JSON with BUY/SELL/HOLD signal, confidence, entry zone, stop-loss, targets, risks.

### Cron Job
```
POST /api/cron/signal (every 15 minutes)
```

Automatically generates and persists signals to Vercel KV.

## Configuration

Edit `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-...     # Claude API
KV_URL=redis://...               # Vercel KV
KV_REST_API_URL=https://...       # Vercel KV
KV_REST_API_TOKEN=...             # Vercel KV
CRON_SECRET=your-random-secret    # Cron auth
```

## Deployment

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Add KV store integration
5. Deploy

Cron runs automatically every 15 minutes per `vercel.json`.

## Signal Rules

- **Confidence < 0.65** → HOLD
- **Price below resistance + RSI < 60** → HOLD  
- **Conflicting signals** → HOLD
- **Conservative entry** → Only on clear setup alignment

For HOLD: no entry zone, no stop-loss, no targets.

## Technical Indicators

| Indicator | Period | Purpose |
|-----------|--------|---------|
| RSI | 14 | Momentum |
| EMA | 9/21/50/200 | Trend |
| MACD | 12/26/9 | Acceleration |
| BB | 20/2σ | Support/Resistance |
| ATR | 14 | Volatility |

## Development

```bash
npm run dev          # Dev server
npm run build        # Build for production
npm start            # Production server
npm run lint         # Lint code
```

## License

MIT
