# ⚡ PokéPulse

Real-time Pokémon card PSA 10 price tracker powered by [PokeData.io](https://www.pokedata.io/pro).

## Features
- 📈 Top 24h PSA 10 price movers (gainers & losers)
- 🔍 Card search with PSA 10 pricing
- 🛠 API diagnostics tab
- 🎮 Demo mode (no key needed)

---

## Deploy to Vercel (5 minutes)

### Option A — Vercel CLI (recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. From this folder:
vercel

# Follow the prompts:
#   Set up and deploy? Y
#   Which scope? (your account)
#   Link to existing project? N
#   Project name: pokepulse  (or whatever you want)
#   In which directory is your code? ./  (just press Enter)
#   Want to override settings? N

# 3. Deploy to production:
vercel --prod
```

Your app will be live at `https://pokepulse.vercel.app` (or your chosen name).

### Option B — GitHub + Vercel Dashboard

1. Push this folder to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repo
4. Framework preset: **Other**
5. Root directory: `./`
6. Click **Deploy**

### Add a Custom Domain

1. In your Vercel project → **Settings → Domains**
2. Add your domain (e.g. `pokepulse.com`)
3. Update your DNS with the CNAME/A records Vercel gives you

---

## How It Works

```
Browser  →  GET /api/proxy?path=/cards/movers  →  Vercel Serverless Function
                                                         ↓
                                               pokedata.io API (server-side)
                                                         ↓
                                               JSON response back to browser
```

The serverless proxy eliminates CORS entirely — the browser never talks directly to PokeData.io.

---

## File Structure

```
pokepulse/
├── public/
│   └── index.html       ← The entire frontend app
├── api/
│   └── proxy.js         ← Vercel serverless function (CORS proxy)
├── vercel.json          ← Routing config
├── package.json
└── .gitignore
```

---

## API Key

You need a [PokeData.io API key](https://www.pokedata.io/pro) (Gold or Platinum tier).  
Enter it in the app's connection modal — it's stored in your browser's localStorage only.
