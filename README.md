## LaunchBio

Minimal SaaS: a link-in-bio page with a big launch countdown and buttons.

### Stack
- Next.js 15 (App Router, TS, server components + server actions)
- Tailwind CSS + shadcn-style UI
- Prisma + SQLite
- Stripe Checkout (test)

### Quick start
1. Install deps: `npm install`
2. Create `.env`:
   - `DATABASE_URL="file:./dev.db"`
   - `STRIPE_SECRET_KEY="sk_test_..."` (optional for payments)
   - `STRIPE_WEBHOOK_SECRET=""` (reserved)
3. Apply DB schema: `npx prisma db push`
4. Run dev server: `npm run dev`

### Routes
- `/` — marketing
- `/create` — create page, returns public + secret edit URLs
- `/edit/[editToken]` — editor by secret token, Stripe upgrade
- `/u/[slug]` — public launch page with countdown and buttons

### Stripe
Test Checkout. After payment redirects to `/edit/success?editToken=...` and enables Pro (removes branding, unlocks extras).
