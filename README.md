## LaunchBio

Minimal SaaS: a link-in-bio page with a big launch countdown and buttons.

### Stack
- Next.js 15 (App Router, TS, server components + server actions)
- Tailwind CSS + shadcn-style UI
- Prisma + PostgreSQL
- Stripe Checkout with webhook verification
- NextAuth.js v5 with Google OAuth + email/password auth (sessions stored in DB)

### Quick start
1. Install deps: `bun install` (or `npm install`)
2. Copy `.env.example` to `.env` and configure:
   - `LAUNCHBIO_DB_PRISMA_DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/launchbio`)
   - `STRIPE_SECRET_KEY` - Your Stripe secret key (required for payments)
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (required for production)
   - `GOOGLE_CLIENT_ID` - Google OAuth Client ID (required for Google sign-in)
   - `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret (required for Google sign-in)
   - `AUTH_SECRET` - Secret for NextAuth.js (generate with `openssl rand -base64 32`)
3. Apply DB schema: `bun run prisma migrate dev` (or `npx prisma migrate dev`)
4. Run dev server: `bun run dev` (or `npm run dev`)

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Configure consent screen if needed
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (for dev) and your production URL
7. Copy Client ID and Client Secret to `.env`

### Routes
- `/` — marketing (no navigation)
- `/create` — create page, returns public + secret edit URLs (navigation shown)
- `/auth/register`, `/auth/login` — email/password + Google OAuth (no navigation)
- `/dashboard` — list and manage your pages (requires login, navigation shown)
- `/edit/[editToken]` — editor by secret token, Stripe upgrade (navigation shown)
- `/u/[slug]` — public launch page with countdown and buttons (no navigation)

### Stripe
Stripe Checkout integration with webhook verification for secure payment processing.
- After successful payment, Stripe webhook automatically enables Pro status (removes branding, unlocks extras)
- Payment success page at `/edit/success?editToken=...` displays confirmation
- Upgrading to Pro requires a logged-in user; free pages can be created without auth
- Webhook endpoint: `/api/webhook/stripe` (configure in Stripe Dashboard)

#### Testing Webhooks Locally

📖 **Подробная инструкция:** см. [WEBHOOK_TESTING.md](./WEBHOOK_TESTING.md)

**Краткая версия:**

Для локального тестирования webhook используйте Stripe CLI:

1. **Установите Stripe CLI:**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # или скачайте с https://stripe.com/docs/stripe-cli
   ```

2. **Авторизуйтесь в Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Запустите локальный сервер:**
   ```bash
   npm run dev
   ```

4. **В отдельном терминале запустите пересылку webhook событий:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```
   
   Эта команда выведет webhook signing secret (начинается с `whsec_...`). 
   Скопируйте его и добавьте в `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Тестирование webhook:**
   
   **Вариант A: Реальное тестирование через Checkout**
   - Создайте страницу и перейдите к оплате
   - Используйте тестовую карту: `4242 4242 4242 4242`
   - После успешной оплаты webhook автоматически сработает
   
   **Вариант B: Использование тестового скрипта**
   ```bash
   # Создаст тестовую checkout session
   npx tsx scripts/test-webhook-local.ts <editToken>
   ```
   
   Затем откройте полученный URL и завершите оплату тестовой картой.
   
   **Вариант C: Триггер тестового события (требует настройки)**
   ```bash
   # Триггернит событие, но нужно вручную указать metadata
   stripe trigger checkout.session.completed
   ```

6. **Проверка логов:**
   - В терминале с `stripe listen` вы увидите все входящие события
   - В терминале с `npm run dev` вы увидите логи обработки webhook
