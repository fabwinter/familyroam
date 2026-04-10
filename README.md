# FamilyRoam

**Find your family's perfect home base.**

FamilyRoam helps families living abroad discover the best cities worldwide, ranked by safety, cost of living, schools, air quality, and more.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) + Prisma ORM |
| Auth | Supabase Auth |
| Payments | Stripe |
| Data | Teleport API, WhereNext, IQAir, CostMaps, OpenStreetMap/Nominatim |

---

## Project Structure

```
familyroam/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.scripts.json      ← tsconfig for standalone ingestion scripts
├── .env.example               ← all required env vars documented
├── prisma/
│   └── schema.prisma          ← DB schema: cities, hubs, reviews, users, visa_info
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx               ← homepage
│   ├── (marketing)/
│   │   ├── pricing/page.tsx
│   │   └── blog/page.tsx
│   ├── (app)/
│   │   ├── dashboard/page.tsx
│   │   └── planner/page.tsx
│   └── cities/
│       ├── page.tsx           ← city directory with filters
│       └── [slug]/page.tsx    ← city detail page
├── components/
│   ├── ui/                    ← shadcn/ui components (Button, Card, Input, Badge)
│   ├── CityCard.tsx
│   ├── FilterSidebar.tsx
│   └── Nav.tsx
├── lib/
│   ├── supabase.ts            ← Supabase browser client
│   ├── stripe.ts              ← Stripe server client
│   └── utils.ts               ← cn(), formatCurrency(), slugify()
└── scripts/
    ├── ingest-teleport.ts     ← quality-of-life scores from Teleport API
    ├── ingest-numbeo.ts       ← cost-of-living data from Numbeo API
    ├── ingest-iqair.ts        ← air quality (AQI) from IQAir API
    └── ingest-osm.ts          ← geocoding from OpenStreetMap/Nominatim
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/fabwinter/familyroam.git
cd familyroam
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see `.env.example` for documentation).

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to your Supabase database
npm run db:push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Data Ingestion

Run scripts in this order after initial setup:

1. `npx ts-node --project tsconfig.scripts.json scripts/seed-cities.ts` (base city records)
2. `npx ts-node --project tsconfig.scripts.json scripts/ingest-teleport.ts` (scores — no key needed)
3. `npx ts-node --project tsconfig.scripts.json scripts/ingest-wherenext.ts` (cost & visa — no key needed)
4. `npx ts-node --project tsconfig.scripts.json scripts/ingest-iqair.ts` (AQI — needs IQAIR_API_KEY)
5. `npx ts-node --project tsconfig.scripts.json scripts/ingest-costmaps.ts` (gap-fill — needs COSTMAPS_API_KEY)

---

## Legacy Data Ingestion (deprecated)

```bash
# 1. Quality-of-life scores from Teleport (free, no key required)
npm run ingest:teleport

# 2. Cost-of-living data from Numbeo (requires NUMBEO_API_KEY)
npm run ingest:numbeo

# 3. Air quality / AQI from IQAir (requires IQAIR_API_KEY)
npm run ingest:iqair

# 4. Geocoding, country codes, and continents from OpenStreetMap (free)
npm run ingest:osm

# 5. Compute and backfill familyScore for all seeded cities
npm run ingest:backfill
```

### Required environment variables

| Variable | Source | Required |
|---|---|---|
| `DATABASE_URL` | Supabase → Settings → Database | ✅ |
| `DIRECT_URL` | Same as `DATABASE_URL` for migrations | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | ✅ |
| `STRIPE_SECRET_KEY` | Stripe Dashboard | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | ✅ |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | Stripe → Products | ✅ |
| `IQAIR_API_KEY` | iqair.com/dashboard | Ingest only |
| `COSTMAPS_API_KEY` | costmaps.com → Account → API | Ingest only |
| `NEXT_PUBLIC_APP_URL` | Your deployment URL | ✅ |
| `ADMIN_EMAIL` | Your admin e-mail | ✅ |

Copy `.env.example` to `.env.local` and fill in all values before running the
dev server or any ingestion script.

---

## Stripe Setup

1. Create products and prices in the [Stripe Dashboard](https://dashboard.stripe.com).
2. Copy the price IDs into `.env.local` (`STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_ANNUAL_PRICE_ID`).
3. Set up a webhook endpoint pointing to `/api/webhooks/stripe` and copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
4. Configure the following webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

---

## Family Score Formula (v1)

`familyScore` is a deterministic composite score (0–100) calculated by
`lib/scoring.ts`.  When a component is missing for a city, its weight is
redistributed across the available components.

| Component | Weight | Notes |
|---|---|---|
| Safety score | 35 % | Direct 0–100 field from Teleport |
| Air quality (AQI) | 25 % | Inverted: AQI 0 → 100 pts, AQI 300+ → 0 pts |
| Cost of living | 15 % | Inverted: $500/mo → 100 pts, $10,000/mo → 0 pts |
| Internet score | 15 % | Direct 0–100 field from Teleport |
| Quality of life | 10 % | Direct 0–100 field from Teleport |

Run `npm run ingest:backfill` after any ingestion run to recompute scores.

---

## Contributing

PRs welcome! Please open an issue first to discuss significant changes.

---

## License

MIT