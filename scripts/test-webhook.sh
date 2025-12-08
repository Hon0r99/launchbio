#!/bin/bash

# Скрипт для тестирования Stripe webhook локально
# Использование: ./scripts/test-webhook.sh [editToken]

set -e

EDIT_TOKEN=${1:-""}
PORT=${PORT:-3000}
WEBHOOK_URL="http://localhost:${PORT}/api/webhook/stripe"

if [ -z "$EDIT_TOKEN" ]; then
  echo "❌ Ошибка: Укажите editToken страницы"
  echo "Использование: ./scripts/test-webhook.sh <editToken>"
  exit 1
fi

echo "🔍 Тестирование webhook для editToken: $EDIT_TOKEN"
echo "📡 Webhook URL: $WEBHOOK_URL"
echo ""

# Проверяем, что сервер запущен
if ! curl -s "http://localhost:${PORT}" > /dev/null; then
  echo "⚠️  Предупреждение: Сервер на порту $PORT не отвечает"
  echo "   Убедитесь, что запущен 'npm run dev'"
  echo ""
fi

# Проверяем наличие Stripe CLI
if ! command -v stripe &> /dev/null; then
  echo "❌ Stripe CLI не установлен"
  echo "   Установите: brew install stripe/stripe-cli/stripe"
  exit 1
fi

echo "📋 Инструкция:"
echo "1. Убедитесь, что запущен 'npm run dev' на порту $PORT"
echo "2. В другом терминале запустите:"
echo "   stripe listen --forward-to $WEBHOOK_URL"
echo "3. Скопируйте webhook secret (whsec_...) в .env как STRIPE_WEBHOOK_SECRET"
echo "4. Создайте тестовую checkout session с этим editToken"
echo "5. После оплаты webhook автоматически обработает событие"
echo ""
echo "💡 Для быстрого теста можно использовать:"
echo "   stripe trigger checkout.session.completed"
echo "   (но нужно будет вручную указать editToken в metadata)"
echo ""

