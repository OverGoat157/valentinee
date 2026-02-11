// src/api/valentine-yes.ts
// @ts-nocheck  // Отключаем TS ошибки для API
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.json();
  const { visitorId, noClicks, totalClicks, timestamp, userAgent } = body;

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    return new Response('Missing env vars', { status: 500 });
  }

  const message = `💕 НОВЫЙ ДА! 💕
👤 Посетитель: ${visitorId}
🔢 Попыток "нет": ${noClicks}
📊 Всего кликов: ${totalClicks}
⏰ ${new Date(timestamp).toLocaleString('ru-RU')}
🌐 ${userAgent?.slice(0, 100)}...`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    console.log('✅ Telegram отправлено');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Ошибка:', error);
    return new Response('Telegram failed', { status: 500 });
  }
}
