#!/bin/bash
# Webhook loglarını kontrol etmek için script

echo "🔍 Webhook loglarını kontrol ediyorum..."
echo ""

# Firebase Console'dan logları görmek için:
echo "📊 Firebase Console'dan logları görmek için:"
echo "1. https://console.firebase.google.com/project/gamerlinks-844c5/functions/logs"
echo "2. Veya Google Cloud Console: https://console.cloud.google.com/logs/query?project=gamerlinks-844c5"
echo ""

# Test webhook gönder
echo "🧪 Test webhook gönderiliyor..."
RESPONSE=$(curl -s -X POST "https://us-central1-gamerlinks-844c5.cloudfunctions.net/gumroadWebhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&short_product_id=pddxf&seller_id=V_zq0t7UXf1PUVypx6Vsaw==&event_type=sale&sale_id=test_$(date +%s)")

echo "📥 Webhook Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

echo "✅ Logları görmek için yukarıdaki linklerden birini kullan!"

