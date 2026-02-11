// api/index.ts
export default async function handler(req: any) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { 
      status: 405 
    });
  }

  try {
    const body = await req.json();
    console.log('📨 Получено:', body);

    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('❌ Нет токенов');
      return new Response(JSON.stringify({ error: 'No tokens' }), { status: 500 });
    }

    const message = `💕 НОВЫЙ ДА! 💕
👤 ${body.visitorId}
🔢 Нет: ${body.noClicks}`;

    const result = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message
      })
    });

    console.log('✅ Telegram:', result.status);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('💥 Ошибка:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
