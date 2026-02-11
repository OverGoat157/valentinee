import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResponseData {
  visitorId: string;
  noClicks: number;
  timestamp: string;
  deviceType: string;
  browser: string;
  timeOfDay: string;
  location: string;
  ip: string;
  language: string;
  screenResolution: string;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Пароль из переменных окружения
  const ADMIN_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || 'valentine2026';

  useEffect(() => {
    // Проверяем, есть ли сохраненная сессия
    const savedAuth = sessionStorage.getItem('dashboard_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchStats();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('dashboard_auth', 'true');
      setError('');
      fetchStats();
    } else {
      setError('Неверный пароль!');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const jsonData = await response.json();
      setData(jsonData);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      setLoading(false);
    }
  };

  // Форма входа
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '50px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          minWidth: '400px'
        }}>
          <h1 style={{
            textAlign: 'center',
            color: '#667eea',
            marginBottom: '30px',
            fontSize: '2em'
          }}>
            🔒 Вход в Dashboard
          </h1>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'border 0.3s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              />
            </div>
            {error && (
              <div style={{
                color: '#f44336',
                marginBottom: '20px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Войти
            </button>
          </form>
          <div style={{
            marginTop: '30px',
            textAlign: 'center'
          }}>
            <a
              href="/"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              ← Вернуться на главную
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '24px' }}>Загрузка статистики...</div>
      </div>
    );
  }

  // Статистика по устройствам
  const deviceStats = data.reduce((acc: any, item) => {
    const device = item.deviceType || 'Неизвестно';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const deviceData = Object.entries(deviceStats).map(([name, value]) => ({
    name,
    value: value as number
  }));

  // Статистика по времени суток
  const timeStats = data.reduce((acc: any, item) => {
    const time = item.timeOfDay || 'Неизвестно';
    acc[time] = (acc[time] || 0) + 1;
    return acc;
  }, {});

  const timeData = Object.entries(timeStats).map(([name, value]) => ({
    name,
    value: value as number
  }));

  // Статистика по количеству попыток "Нет"
  const noClicksData = data.map(item => ({
    visitor: item.visitorId.substring(0, 10),
    clicks: item.noClicks
  })).slice(-10); // Последние 10 записей

  const COLORS = ['#FF6B9D', '#C44569', '#F8B500', '#6A89CC', '#4A69BD'];

  const totalResponses = data.length;
  const avgNoClicks = data.length > 0
    ? (data.reduce((sum, item) => sum + item.noClicks, 0) / data.length).toFixed(1)
    : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          color: 'white',
          textAlign: 'center',
          marginBottom: '40px',
          fontSize: '3em',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          💕 Dashboard Валентинки 💕
        </h1>

        {/* Общая статистика */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>💘</div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#e91e63' }}>
              {totalResponses}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Всего ответов "Да"</div>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>💔</div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#f44336' }}>
              {avgNoClicks}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Среднее "Нет"</div>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3em', marginBottom: '10px' }}>📱</div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#4caf50' }}>
              {Object.keys(deviceStats).length}
            </div>
            <div style={{ color: '#666', marginTop: '5px' }}>Типов устройств</div>
          </div>
        </div>

        {/* Графики */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* График по устройствам */}
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
              Устройства
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* График по времени суток */}
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
              Время суток
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={timeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {timeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* График попыток "Нет" */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          marginBottom: '40px'
        }}>
          <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
            Попытки "Нет" (последние 10)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={noClicksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="visitor" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="clicks" fill="#f44336" name="Попыток Нет" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Таблица с последними ответами */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          overflowX: 'auto'
        }}>
          <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
            Последние ответы
          </h2>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e91e63' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Время</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Устройство</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Время суток</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Попыток "Нет"</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Локация</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-15).reverse().map((item, index) => (
                <tr key={index} style={{
                  borderBottom: '1px solid #eee',
                  background: index % 2 === 0 ? '#fafafa' : 'white'
                }}>
                  <td style={{ padding: '12px' }}>
                    {new Date(item.timestamp).toLocaleString('ru-RU')}
                  </td>
                  <td style={{ padding: '12px' }}>{item.deviceType}</td>
                  <td style={{ padding: '12px' }}>{item.timeOfDay}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#f44336' }}>
                    {item.noClicks}
                  </td>
                  <td style={{ padding: '12px' }}>{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Кнопка возврата */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '15px 40px',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '25px',
              fontWeight: 'bold',
              fontSize: '18px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🏠 Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
