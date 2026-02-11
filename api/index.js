// API для сохранения ответа "Да"
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const data = req.body;
    console.log('📨 Получено:', data);

    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('❌ Нет токенов');
      return res.status(500).json({ error: 'No tokens configured' });
    }

    // Получаем IP адрес
    const ip = req.headers['x-forwarded-for'] ||
               req.headers['x-real-ip'] ||
               req.socket.remoteAddress ||
               'unknown';

    // Получаем геолокацию по IP
    let locationInfo = '🌍 Неизвестно';
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,timezone,isp`);
      const geoData = await geoResponse.json();
      if (geoData.status === 'success') {
        locationInfo = `🌍 ${geoData.city || 'Unknown'}, ${geoData.country || 'Unknown'}`;
      }
    } catch (err) {
      console.log('Не удалось получить геолокацию:', err);
    }

    // Формируем сообщение для Telegram
    const message = `💕 НОВЫЙ ДА! 💕

👤 Посетитель: ${data.visitorId}
🔢 Попыток "нет": ${data.noClicks}
🕐 Время: ${new Date().toLocaleString('ru-RU')}
${data.timeOfDay || ''}

📍 Устройство: ${data.deviceType || 'Неизвестно'}
${data.browser || ''}
📱 Разрешение: ${data.screenResolution || 'unknown'}
🌐 Язык: ${data.language || 'unknown'}

${locationInfo}
🌐 IP: ${ip}`;

    // Отправляем в Telegram
    const result = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message
      })
    });

    const telegramResponse = await result.json();
    console.log('✅ Telegram ответ:', telegramResponse);

    // Сохраняем данные в Vercel KV
    try {
      const entryData = {
        ...data,
        ip: ip,
        location: locationInfo,
        timestamp: new Date().toISOString()
      };

      // Получаем текущий список
      const responses = await kv.get('valentine_responses') || [];
      responses.push(entryData);

      // Сохраняем обновленный список
      await kv.set('valentine_responses', responses);
      console.log('✅ Данные сохранены в KV');
    } catch (kvError) {
      console.error('❌ Ошибка сохранения в KV:', kvError);
      // Продолжаем даже если KV не работает
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('💥 Ошибка:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
