/**
 * Скрипт для локального тестирования Stripe webhook
 * 
 * Использование:
 * 1. Запустите сервер: npm run dev
 * 2. В другом терминале: stripe listen --forward-to localhost:3000/api/webhook/stripe
 * 3. Скопируйте webhook secret в .env
 * 4. Запустите этот скрипт: npx tsx scripts/test-webhook-local.ts <editToken>
 */

import Stripe from "stripe";

const editToken = process.argv[2];

if (!editToken) {
  console.error("❌ Укажите editToken: npx tsx scripts/test-webhook-local.ts <editToken>");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

async function testWebhook() {
  try {
    console.log(`🧪 Создание тестовой checkout session для editToken: ${editToken}`);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 900,
            product_data: { name: "Launch Pack (one-time)" },
          },
        },
      ],
      metadata: { editToken },
      success_url: `http://localhost:3000/edit/success?editToken=${editToken}`,
      cancel_url: `http://localhost:3000/edit/${editToken}`,
    });

    console.log(`✅ Checkout session создана: ${session.id}`);
    console.log(`📋 URL для оплаты: ${session.url}`);
    console.log("");
    console.log("📝 Следующие шаги:");
    console.log("1. Откройте URL выше и завершите оплату (используйте тестовую карту 4242 4242 4242 4242)");
    console.log("2. Webhook автоматически обработает событие через stripe listen");
    console.log("3. Проверьте логи в терминале с 'npm run dev'");
  } catch (error: any) {
    console.error("❌ Ошибка:", error.message);
    process.exit(1);
  }
}

testWebhook();

