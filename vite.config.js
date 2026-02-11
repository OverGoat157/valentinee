import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Путь к файлу с данными
const DATA_FILE = path.join(process.cwd(), 'data', 'responses.json');

// Функция для чтения данных
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения данных:', error);
    return [];
  }
}

// Функция для сохранения данных
function saveData(newEntry) {
  try {
    const data = readData();
    data.push(newEntry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения данных:', error);
    return false;
  }
}

// Плагин для обработки API запросов во время разработки
function apiPlugin(env) {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // API для получения статистики
        if (req.url === '/api/stats' && req.method === 'GET') {
          try {
            const data = readData();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          } catch (error) {
            console.error('💥 Ошибка:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Server error' }));
          }
          return;
        }

        // API для сохранения ответа "Да"
        if (req.url === '/api' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              console.log('📨 Получено:', data);

              const TELEGRAM_TOKEN = env.TELEGRAM_TOKEN;
              const TELEGRAM_CHAT_ID = env.TELEGRAM_CHAT_ID;

              if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
                console.error('❌ Нет токенов в .env файле');
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No tokens configured' }));
                return;
              }

              // Получаем IP адрес пользователя
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

              // Сохраняем данные в файл
              const entryData = {
                ...data,
                ip: ip,
                location: locationInfo,
                timestamp: new Date().toISOString()
              };
              saveData(entryData);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (error) {
              console.error('💥 Ошибка:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Server error' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Загружаем переменные окружения
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), apiPlugin(env)],
  };
})
