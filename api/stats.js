// API для получения статистики
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET only' });
  }

  try {
    // Получаем данные из Vercel KV
    const responses = await kv.get('valentine_responses') || [];

    console.log(`📊 Отправка ${responses.length} записей`);
    return res.status(200).json(responses);
  } catch (error) {
    console.error('💥 Ошибка:', error);
    // Если KV не настроен, возвращаем пустой массив
    return res.status(200).json([]);
  }
}
