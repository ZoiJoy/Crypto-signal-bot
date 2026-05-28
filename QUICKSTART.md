# Quick Start Guide

## ✅ Project Created Successfully

Your complete Next.js crypto signal bot is ready. Here's what's been scaffolded:

### 📁 What Was Created

```
crypto-signal-bot/
├── types/signal.ts                    # Core types
├── lib/
│   ├── exchange-client.ts             # Binance API + indicators
│   ├── claude-client.ts               # Claude integration
│   ├── schemas.ts                     # Zod validation
│   └── signal-store.ts                # Vercel KV storage
├── app/
│   ├── api/signal/route.ts            # On-demand signal endpoint
│   ├── api/cron/signal/route.ts       # Cron job handler
│   ├── dashboard/page.tsx             # Signal dashboard
│   ├── page.tsx                       # Home page
│   └── layout.tsx                     # Root layout
├── vercel.json                        # Cron every 15 minutes
├── .env.local                         # Environment template
├── package.json                       # Dependencies installed
├── README.md                          # Full documentation
└── tsconfig.json                      # TypeScript config
```

## 🚀 Next Steps

### 1. Get a Claude API Key (2 minutes)
- Visit https://console.anthropic.com/
- Create account or log in
- Go to API keys
- Create new key
- Copy it

### 2. Update `.env.local`
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
CRON_SECRET=any-random-string-here
```

For Vercel KV, leave blank for local testing (it gracefully degrades).

### 3. Run Locally
```bash
npm run dev
```

Then visit:
- **Home**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **API**: http://localhost:3000/api/signal

### 4. Test the API
```bash
curl http://localhost:3000/api/signal?symbol=BTCUSDT&timeframe=15m
```

Should return a JSON trading signal.

### 5. Deploy to Vercel (10 minutes)

a. **Initialize git** (if not done):
```bash
cd crypto-signal-bot
git init
git add .
git commit -m "Crypto signal bot scaffold"
```

b. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USER/crypto-signal-bot.git
git push -u origin main
```

c. **Deploy**:
- Go to https://vercel.com/import
- Select your GitHub repo
- Add environment variables:
  - `ANTHROPIC_API_KEY` (your Claude key)
  - `CRON_SECRET` (random string)
- Click "Deploy"

d. **Add Vercel KV** (optional, for production):
- In Vercel dashboard → Storage → Create → KV
- Copy connection strings to `KV_*` env vars
- Redeploy

e. **Verify**:
- Visit `https://your-project.vercel.app/dashboard`
- Should show the latest signal
- Cron job runs every 15 minutes automatically

## 📊 How It Works

1. **Binance API** fetches 50 recent 15m candles + ticker
2. **Local calculation** computes RSI, EMA, MACD, Bollinger Bands, ATR
3. **Claude call** analyzes the market snapshot
4. **JSON response** includes signal (BUY/SELL/HOLD), confidence, entry zone, stop-loss, targets
5. **Vercel KV** stores the latest signal
6. **Dashboard** displays it in real-time

## 🔑 Key Files Explained

| File | Purpose |
|------|---------|
| `lib/exchange-client.ts` | Fetches Binance data, calculates all indicators |
| `lib/claude-client.ts` | Calls Claude API, parses JSON response |
| `lib/schemas.ts` | Zod validation for type safety |
| `lib/signal-store.ts` | Saves/retrieves signals from Vercel KV |
| `app/api/signal/route.ts` | GET endpoint for on-demand signals |
| `app/api/cron/signal/route.ts` | POST handler for Vercel cron (every 15m) |
| `app/dashboard/page.tsx` | React component showing latest signal |

## 💡 Signal Logic

The bot is **conservative**:
- **HOLD** if confidence < 0.65
- **HOLD** if price below resistance AND RSI < 60
- **HOLD** if signals conflict
- **BUY** only on clear trend + momentum + volume alignment
- **SELL** only on clear bearish reversal

For HOLD signals:
- `entry_zone` = null (no entry yet)
- `stop_loss` = null (no position)
- `take_profit_targets` = [] (empty)
- `position_size_suggestion` = "0%" (do nothing)

## 🎯 What This Bot Does NOT Do

- ❌ Execute trades (signal generation only)
- ❌ Use leverage
- ❌ Trade on margin
- ❌ Backtest (real-time analysis only)
- ❌ Risk full account

You would add trading execution in a separate secured component.

## 🐛 Troubleshooting

**"API Error" on dashboard?**
- Check `ANTHROPIC_API_KEY` in `.env.local`
- Check internet connection
- Restart dev server: `npm run dev`

**Cron not running on Vercel?**
- Verify `vercel.json` is at project root
- Check `CRON_SECRET` matches in code
- Look at Vercel Function logs

**KV connection failed?**
- Local: KV is optional, gracefully skipped
- Production: Add KV store in Vercel dashboard
- Copy `KV_*` env vars to project settings
- Redeploy

## 📚 Documentation

- [README.md](./README.md) - Full technical docs
- [Anthropic Docs](https://docs.anthropic.com/) - Claude API
- [Next.js Docs](https://nextjs.org/docs) - Framework
- [Vercel Cron](https://vercel.com/docs/cron-jobs) - Cron setup

## ✨ From Here

1. **Customize signals** - Edit `lib/claude-client.ts` system prompt
2. **Add indicators** - Modify `lib/exchange-client.ts`
3. **Change timeframe** - Update API endpoints (15m → 1h, 4h, etc.)
4. **Add pairs** - Support ETH/USDT, altcoins, etc.
5. **Implement trading** - Add order execution (requires exchange API keys)
6. **Add alerts** - Slack, email, webhook notifications
7. **Backtest** - Store signals, analyze win rate

---

**You're all set!** 🎉 The bot is production-ready. Start with local testing, then deploy to Vercel.
