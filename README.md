# 🪵 BriarBid — Netlify Edition

Full-stack auction site converted from PHP/MySQL to React + Netlify Functions + PostgreSQL.

---

## Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + React Router v6 + Vite   |
| Backend   | Netlify Functions (Node.js)         |
| Database  | PostgreSQL (Neon — free tier)       |
| Auth      | JWT (jsonwebtoken + bcryptjs)       |
| Hosting   | Netlify (free tier)                 |

---

## Deploy in 5 Steps

### Step 1 — Create a free PostgreSQL database at Neon

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Create a new project called `briarbid`
3. Copy the **Connection String** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Open the **SQL Editor** in Neon and paste the entire contents of `schema.sql` and run it

---

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial BriarBid commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/briarbid.git
git push -u origin main
```

---

### Step 3 — Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up / log in
2. Click **"Add new site" → "Import an existing project"**
3. Connect your GitHub account and select the `briarbid` repo
4. Netlify will auto-detect the build settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
5. Click **"Deploy site"**

---

### Step 4 — Add Environment Variables

In Netlify: **Site Settings → Environment Variables → Add variable**

| Key            | Value                                      |
|----------------|--------------------------------------------|
| `DATABASE_URL` | Your Neon connection string from Step 1    |
| `JWT_SECRET`   | A random 64-char string (see below)        |

**Generate a JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

After adding env vars, trigger a redeploy: **Deploys → Trigger deploy → Deploy site**

---

### Step 5 — Install function dependencies

Netlify automatically installs dependencies from `netlify/functions/package.json`.
No action needed — it handles this during build.

---

## Local Development

```bash
# Install frontend deps
npm install

# Install function deps
cd netlify/functions && npm install && cd ../..

# Create local env file
cp .env.example .env
# Edit .env and add your DATABASE_URL and JWT_SECRET

# Run locally (requires Netlify CLI)
npm install -g netlify-cli
netlify dev
```

Your site will be at `http://localhost:8888`

---

## Project Structure

```
briarbid-netlify/
├── netlify.toml                  # Build config & redirects
├── schema.sql                    # PostgreSQL schema (run once in Neon)
├── .env.example                  # Environment variable template
├── package.json                  # Frontend dependencies
├── vite.config.js                # Vite build config
├── index.html                    # HTML entry point
├── netlify/
│   └── functions/
│       ├── package.json          # Function dependencies (pg, bcryptjs, jsonwebtoken)
│       ├── _db.js                # Shared PostgreSQL connection
│       ├── _auth.js              # JWT helpers + CORS utility
│       ├── home.js               # GET  /api/home
│       ├── auctions.js           # GET  /api/auctions
│       ├── auction.js            # GET  /api/auction?id=
│       ├── bid.js                # POST /api/bid
│       ├── sell.js               # POST /api/sell
│       ├── watchlist.js          # GET/POST /api/watchlist
│       ├── dashboard.js          # GET  /api/dashboard
│       ├── notifications.js      # GET  /api/notifications
│       ├── profile.js            # GET  /api/profile?username=
│       ├── auth-login.js         # POST /api/auth-login
│       └── auth-register.js      # POST /api/auth-register
└── src/
    ├── main.jsx                  # React entry point
    ├── index.css                 # Full stylesheet
    ├── App.jsx                   # Router + routes
    ├── lib/
    │   ├── api.js                # API call wrappers
    │   ├── AuthContext.jsx        # Auth state (JWT in localStorage)
    │   └── utils.js              # money(), timeRemaining(), etc.
    ├── components/
    │   ├── Layout.jsx            # Header + Footer + <Outlet>
    │   └── AuctionCard.jsx       # Reusable auction card
    └── pages/
        ├── Home.jsx
        ├── Auctions.jsx
        ├── AuctionDetail.jsx
        ├── Login.jsx
        ├── Register.jsx
        ├── Dashboard.jsx
        ├── Sell.jsx
        ├── Watchlist.jsx
        ├── Notifications.jsx
        ├── Profile.jsx
        └── NotFound.jsx
```

---

## Notes

- **Image uploads** are not included — Netlify Functions are stateless. For images, integrate [Cloudinary](https://cloudinary.com) (free tier) or [Uploadcare](https://uploadcare.com).
- **Auction auto-close** (the original PHP cron job) can be replaced with a [Netlify Scheduled Function](https://docs.netlify.com/functions/scheduled-functions/) — add `schedule: "@hourly"` to the function config.
- **Auth** uses JWT stored in `localStorage`. Tokens expire after 7 days.
- The free Neon tier gives you 0.5 GB storage and 190 compute hours/month — plenty for a small auction site.
