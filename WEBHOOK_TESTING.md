# Тестирование Stripe Webhook локально

## Быстрый старт

### 1. Установите Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# или скачайте с https://stripe.com/docs/stripe-cli
```

### 2. Авторизуйтесь

```bash
stripe login
```

### 3. Запустите сервер разработки

```bash
npm run dev
```

### 4. В отдельном терминале запустите пересылку webhook

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Вы увидите что-то вроде:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### 5. Добавьте webhook secret в .env

Скопируйте `whsec_...` из вывода команды выше и добавьте в `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Важно:** Перезапустите `npm run dev` после добавления переменной!

## Способы тестирования

### Способ 1: Реальное тестирование через UI

1. Создайте страницу на `/create`
2. Перейдите к редактору и нажмите "Upgrade to Launch Pack"
3. Используйте тестовую карту: `4242 4242 4242 4242`
   - Любая будущая дата для срока действия
   - Любой CVC
   - Любой почтовый индекс
4. После успешной оплаты webhook автоматически обработает событие
5. Проверьте логи в обоих терминалах

### Способ 2: Использование тестового скрипта

```bash
# Создаст тестовую checkout session
npx tsx scripts/test-webhook-local.ts <editToken>
```

Затем откройте полученный URL и завершите оплату.

### Способ 3: Ручной триггер события

```bash
# Триггернит тестовое событие (но без реального editToken)
stripe trigger checkout.session.completed
```

**Ограничение:** Этот способ не передаст ваш `editToken` в metadata, поэтому webhook не обновит страницу.

## Проверка работы

### Успешная обработка

В терминале с `npm run dev` вы увидите:
```
✅ Webhook event received: checkout.session.completed (id: evt_...)
✅ Page your-slug upgraded to Pro via webhook
```

В терминале с `stripe listen` вы увидите:
```
2024-01-01 12:00:00   --> checkout.session.completed [evt_...]
2024-01-01 12:00:00  <--  [200] POST http://localhost:3000/api/webhook/stripe [evt_...]
```

### Ошибки

**"Webhook secret not configured"**
- Убедитесь, что добавили `STRIPE_WEBHOOK_SECRET` в `.env`
- Перезапустите `npm run dev`

**"Webhook signature verification failed"**
- Убедитесь, что используете правильный secret из `stripe listen`
- Проверьте, что `stripe listen` все еще запущен

**"Page not found for editToken"**
- Убедитесь, что используете правильный `editToken`
- Проверьте, что страница существует в базе данных

## Отладка

### Включить подробные логи

В `app/api/webhook/stripe/route.ts` уже есть логирование для development режима.

### Проверить события в Stripe Dashboard

1. Откройте https://dashboard.stripe.com/test/logs
2. Найдите событие `checkout.session.completed`
3. Проверьте metadata и payment_status

### Тестовые карты Stripe

- Успешная оплата: `4242 4242 4242 4242`
- Отклонена карта: `4000 0000 0000 0002`
- Требуется аутентификация: `4000 0025 0000 3155`

Полный список: https://stripe.com/docs/testing

## Production

В production используйте реальный webhook endpoint в Stripe Dashboard:
1. Перейдите в Developers > Webhooks
2. Добавьте endpoint: `https://yourdomain.com/api/webhook/stripe`
3. Выберите событие: `checkout.session.completed`
4. Скопируйте Signing secret и добавьте в production `.env`

