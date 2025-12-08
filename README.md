## LaunchBio

Minimal SaaS: a link-in-bio page with a big launch countdown and buttons.

### Stack
- Next.js 15 (App Router, TS, server components + server actions)
- Tailwind CSS + shadcn-style UI
- Prisma + PostgreSQL
- Stripe Checkout with webhook verification
- Simple email/password auth (sessions stored in DB)

### Quick start
1. Install deps: `npm install`
2. Copy `.env.example` to `.env` and configure:
   - `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/launchbio`)
   - `STRIPE_SECRET_KEY` - Your Stripe secret key (required for payments)
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (required for production)
3. Apply DB schema: `npx prisma db push` or `npx prisma migrate dev`
4. Run dev server: `npm run dev`

### Routes
- `/` — marketing
- `/create` — create page, returns public + secret edit URLs
- `/auth/register`, `/auth/login` — email/password auth
- `/dashboard` — list and manage your pages (requires login)
- `/edit/[editToken]` — editor by secret token, Stripe upgrade
- `/u/[slug]` — public launch page with countdown and buttons

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
