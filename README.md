# FamilyRoam

**Find your family's perfect home base.**

FamilyRoam helps families living abroad discover the best cities worldwide, ranked by safety, cost of living, schools, air quality, and more.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) + Prisma ORM |
| Auth | Supabase Auth |
| Payments | Stripe |
| Data | Teleport API, Numbeo, IQAir, OpenStreetMap/Nominatim |

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

Populate the database with real-world data from external APIs:

```bash
# Quality-of-life scores (Teleport — free, no key required)
npm run ingest:teleport

# Cost of living (requires NUMBEO_API_KEY)
npm run ingest:numbeo

# Air quality / AQI (requires IQAIR_API_KEY)
npm run ingest:iqair

# Geocoding & country codes (OpenStreetMap — free, no key required)
npm run ingest:osm
```

Run scripts in the order above for best results. Teleport and OSM scripts are free; Numbeo and IQAir require API keys (see `.env.example`).

---

## Stripe Setup

1. Create products and prices in the [Stripe Dashboard](https://dashboard.stripe.com).
2. Copy the price IDs into `.env.local` (`STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_ANNUAL_PRICE_ID`).
3. Set up a webhook endpoint pointing to `/api/webhooks/stripe` and copy the signing secret to `STRIPE_WEBHOOK_SECRET`.

---

## Contributing

PRs welcome! Please open an issue first to discuss significant changes.

---

## License

MIT