# FamilyRoam — Project Roadmap

## Priority map

| Priority | Issue title | Goal |
|---|---|---|
| P0 | Seed live city data and compute family score | Get real cities and rankings on screen |
| P0 | Wire auth, billing, and paywall enforcement | Make free vs PRO actually work |
| P0 | Connect city directory and city detail pages to live data | Replace placeholder UI with production data |
| P0 | Close schema gaps for family-specific data | Add homeschool and family fields |
| P1 | Build reviews, saved cities, and member contributions | Create member value and retention |
| P1 | Add worldschool hub submission and moderation flow | Start proprietary data moat |
| P1 | Build planner MVP | Add sticky repeat-use feature |
| P1 | Improve mobile UX, empty states, and onboarding | Make the app usable |
| P2 | Launch SEO content engine and static landing pages | Create acquisition |
| P2 | Build admin ops dashboard and data freshness tools | Keep quality high |

---

## P0 — Seed live city data and compute family score

**Goal:** Get real cities and rankings on screen.

### Scope
- [ ] Run `ingest-teleport.ts` and verify cities are inserted
- [ ] Run `ingest-numbeo.ts` and map safety/cost fields correctly
- [ ] Run `ingest-iqair.ts` and map AQI fields correctly
- [ ] Run `ingest-osm.ts` and populate playground/park/school counts
- [ ] Create `lib/scoring.ts`
- [ ] Define v1 weighting for safety, AQI, cost, internet, parks, schools
- [ ] Backfill `familyScore` for all existing cities
- [ ] Add validation logs and failure handling for partial imports
- [ ] Document required env vars and command order in README

### Acceptance criteria
- [ ] At least 50 real cities exist in the database
- [ ] Every seeded city has a non-null slug, name, country, and `familyScore`
- [ ] Scripts can be rerun safely without duplicate rows

---

## P0 — Wire auth, billing, and paywall enforcement

**Goal:** Make free vs PRO actually work.

### Scope
- [ ] Test sign up, sign in, sign out, and session persistence
- [ ] Confirm protected routes work in middleware
- [ ] Finish checkout session creation
- [ ] Finish Stripe webhook handler
- [ ] Update `User.plan` on subscription create/update/cancel events
- [ ] Add downgrade handling
- [ ] Enforce paywall server-side for gated tabs and API routes
- [ ] Add pricing CTA states for anonymous, FREE, and PRO users
- [ ] Add billing portal link

### Acceptance criteria
- [ ] A test user can upgrade to PRO
- [ ] PRO access appears without manual DB edits
- [ ] Cancelling subscription removes gated access correctly

---

## P0 — Connect city directory and city detail pages to live data

**Goal:** Replace placeholder UI with production data.

### Scope
- [ ] Connect `/cities` to Prisma queries
- [ ] Add pagination or infinite scroll
- [ ] Wire filters to live query params
- [ ] Add sorting by family score, cost, AQI, and safety
- [ ] Connect `/cities/[slug]` to live city data
- [ ] Show cost, AQI, family score, hubs, visa info, and reviews
- [ ] Add loading, empty, and error states
- [ ] Add fallback city images
- [ ] Add proper metadata per city page

### Acceptance criteria
- [ ] Users can browse and filter live cities
- [ ] Each city page renders without placeholder content
- [ ] Invalid slugs show a proper 404 or empty state

---

## P0 — Close schema gaps for family-specific data

**Goal:** Add homeschool and family fields.

### Scope
- [ ] Add `homeschoolLegal` boolean
- [ ] Add `homeschoolNotes` text
- [ ] Add `familyVisaAvailable` boolean if needed
- [ ] Add `familySize` to reviews
- [ ] Add `kidsAges` to reviews
- [ ] Add migration files
- [ ] Backfill null-safe defaults
- [ ] Update Prisma types and API validators
- [ ] Update forms and UI to use new fields

### Acceptance criteria
- [ ] Schema supports family-specific data end to end
- [ ] Review form can capture family context
- [ ] City legal section can display homeschool info

---

## P1 — Build reviews, saved cities, and member contributions

**Goal:** Create member value and retention.

### Scope
- [ ] Finish review create/read flow
- [ ] Add validation and rate limiting
- [ ] Show review author, date, rating, and family context
- [ ] Finish saved cities flow
- [ ] Add dashboard section for saved cities
- [ ] Add member-only contribution prompts on city pages
- [ ] Add review empty states

### Acceptance criteria
- [ ] PRO users can leave reviews
- [ ] Logged-in users can save cities
- [ ] Saved cities appear in dashboard

---

## P1 — Add worldschool hub submission and moderation flow

**Goal:** Start proprietary data moat.

### Scope
- [ ] Build submit hub form
- [ ] Add schema support if more submission fields are needed
- [ ] Save new submissions as unverified
- [ ] Add admin approve/reject actions
- [ ] Show verified badge on approved hubs
- [ ] Add duplicate detection by URL/name/city

### Acceptance criteria
- [ ] Users can submit hubs
- [ ] Admin can approve or reject submissions
- [ ] Approved hubs appear on city pages

---

## P1 — Build planner MVP

**Goal:** Add sticky repeat-use feature.

### Scope
- [ ] Create planner data model
- [ ] Let users add city stops with dates
- [ ] Show estimated cost by stop
- [ ] Warn when stay exceeds visa duration where data exists
- [ ] Save and edit plans
- [ ] Show simple trip summary

### Acceptance criteria
- [ ] A logged-in user can create and save a multi-city plan
- [ ] Planner uses live city data
- [ ] Costs update when cities or dates change

---

## P1 — Improve mobile UX, empty states, and onboarding

**Goal:** Make the app usable.

### Scope
- [ ] Audit all main routes on mobile widths
- [ ] Improve nav for mobile
- [ ] Add skeleton states for cards and detail views
- [ ] Add meaningful empty states across dashboard, planner, reviews, and saves
- [ ] Add first-run onboarding for new users
- [ ] Add upgrade prompts that explain value clearly

### Acceptance criteria
- [ ] Main flows work well on mobile
- [ ] No blank screens or confusing dead ends remain
- [ ] New users know what to do next after signup

---

## P2 — Launch SEO content engine and static landing pages

**Goal:** Create acquisition.

### Scope
- [ ] Add 5 seed MDX articles
- [ ] Create static landing page templates by region/budget/theme
- [ ] Create homeschool legality pages by country
- [ ] Create worldschool hub landing pages by city
- [ ] Add internal linking from blog to city pages
- [ ] Verify sitemap and robots outputs

### Acceptance criteria
- [ ] Blog contains at least 5 strong launch articles
- [ ] Programmatic pages build successfully
- [ ] City pages and content pages are indexable

---

## P2 — Build admin ops dashboard and data freshness tools

**Goal:** Keep quality high.

### Scope
- [ ] Show data freshness per source
- [ ] Flag stale city records
- [ ] Add review moderation
- [ ] Add hub moderation queue
- [ ] Add simple revenue snapshot from Stripe
- [ ] Add failed ingestion logs
- [ ] Add manual city re-sync action

### Acceptance criteria
- [ ] Admin can spot stale or broken data quickly
- [ ] Admin can moderate user content
- [ ] Admin can monitor basic business health
