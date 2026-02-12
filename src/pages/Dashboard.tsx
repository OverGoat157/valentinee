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

  const ADMIN_PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || 'valentine2026';

  useEffect(() => {
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
        width: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}>
        <div style={{
          background: 'white',
          padding: 'clamp(25px, 5vw, 50px)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '420px',
        }}>
          <h1 style={{
            textAlign: 'center',
            color: '#667eea',
            marginBottom: 'clamp(15px, 3vw, 30px)',
            fontSize: 'clamp(1.4em, 4vw, 2em)',
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
                  padding: 'clamp(12px, 2vw, 15px)',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'border 0.3s',
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
                fontWeight: 'bold',
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: 'clamp(12px, 2vw, 15px)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: 'clamp(16px, 2.5vw, 18px)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Войти
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href="/" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
              ← Вернуться на главную
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', fontSize: 'clamp(18px, 3vw, 24px)',
      }}>
        Загрузка статистики...
      </div>
    );
  }

  // Статистика
  const deviceStats = data.reduce((acc: any, item) => {
    const device = item.deviceType || 'Неизвестно';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const deviceData = Object.entries(deviceStats).map(([name, value]) => ({
    name, value: value as number,
  }));

  const timeStats = data.reduce((acc: any, item) => {
    const time = item.timeOfDay || 'Неизвестно';
    acc[time] = (acc[time] || 0) + 1;
    return acc;
  }, {});

  const timeData = Object.entries(timeStats).map(([name, value]) => ({
    name, value: value as number,
  }));

  const noClicksData = data.map(item => ({
    visitor: item.visitorId.substring(0, 10),
    clicks: item.noClicks,
  })).slice(-10);

  const COLORS = ['#FF6B9D', '#C44569', '#F8B500', '#6A89CC', '#4A69BD'];

  const totalResponses = data.length;
  const avgNoClicks = data.length > 0
    ? (data.reduce((sum, item) => sum + item.noClicks, 0) / data.length).toFixed(1)
    : 0;

  const cardStyle: React.CSSProperties = {
    background: 'white',
    padding: 'clamp(15px, 3vw, 30px)',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 'clamp(15px, 3vw, 40px) clamp(10px, 2vw, 20px)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          color: 'white',
          textAlign: 'center',
          marginBottom: 'clamp(20px, 4vw, 40px)',
          fontSize: 'clamp(1.5em, 5vw, 3em)',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        }}>
          💕 Dashboard Валентинки 💕
        </h1>

        {/* Общая статистика */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: 'clamp(10px, 2vw, 20px)',
          marginBottom: 'clamp(20px, 4vw, 40px)',
        }}>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(2em, 5vw, 3em)', marginBottom: '5px' }}>💘</div>
            <div style={{ fontSize: 'clamp(1.5em, 4vw, 2em)', fontWeight: 'bold', color: '#e91e63' }}>
              {totalResponses}
            </div>
            <div style={{ color: '#666', marginTop: '5px', fontSize: 'clamp(12px, 2vw, 16px)' }}>Всего ответов "Да"</div>
          </div>

          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(2em, 5vw, 3em)', marginBottom: '5px' }}>💔</div>
            <div style={{ fontSize: 'clamp(1.5em, 4vw, 2em)', fontWeight: 'bold', color: '#f44336' }}>
              {avgNoClicks}
            </div>
            <div style={{ color: '#666', marginTop: '5px', fontSize: 'clamp(12px, 2vw, 16px)' }}>Среднее "Нет"</div>
          </div>

          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(2em, 5vw, 3em)', marginBottom: '5px' }}>📱</div>
            <div style={{ fontSize: 'clamp(1.5em, 4vw, 2em)', fontWeight: 'bold', color: '#4caf50' }}>
              {Object.keys(deviceStats).length}
            </div>
            <div style={{ color: '#666', marginTop: '5px', fontSize: 'clamp(12px, 2vw, 16px)' }}>Типов устройств</div>
          </div>
        </div>

        {/* Графики */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
          gap: 'clamp(10px, 2vw, 20px)',
          marginBottom: 'clamp(20px, 4vw, 40px)',
        }}>
          <div style={cardStyle}>
            <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '15px', fontSize: 'clamp(1em, 3vw, 1.5em)' }}>
              Устройства
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={cardStyle}>
            <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '15px', fontSize: 'clamp(1em, 3vw, 1.5em)' }}>
              Время суток
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={timeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {timeData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* График попыток "Нет" */}
        <div style={{ ...cardStyle, marginBottom: 'clamp(20px, 4vw, 40px)' }}>
          <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '15px', fontSize: 'clamp(1em, 3vw, 1.5em)' }}>
            Попытки "Нет" (последние 10)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={noClicksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="visitor" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="clicks" fill="#f44336" name="Попыток Нет" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Таблица с последними ответами */}
        <div style={{ ...cardStyle, overflowX: 'auto', marginBottom: 'clamp(20px, 4vw, 40px)' }}>
          <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '15px', fontSize: 'clamp(1em, 3vw, 1.5em)' }}>
            Последние ответы
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e91e63' }}>
                <th style={{ padding: 'clamp(8px, 1.5vw, 12px)', textAlign: 'left', fontSize: 'clamp(12px, 2vw, 14px)' }}>Время</th>
                <th style={{ padding: 'clamp(8px, 1.5vw, 12px)', textAlign: 'left', fontSize: 'clamp(12px, 2vw, 14px)' }}>Устройство</th>
                <th style={{ padding: 'clamp(8px, 1.5vw, 12px)', textAlign: 'left', fontSize: 'clamp(12px, 2vw, 14px)' }}>Время суток</th>
                <th style={{ padding: 'clamp(8px, 1.5vw, 12px)', textAlign: 'center', fontSize: 'clamp(12px, 2vw, 14px)' }}>Нет</th>
                <th style={{ padding: 'clamp(8px, 1.5vw, 12px)', textAlign: 'left', fontSize: 'clamp(12px, 2vw, 14px)' }}>Локация</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-15).reverse().map((item, index) => (
                <tr key={index} style={{
                  borderBottom: '1px solid #eee',
                  background: index % 2 === 0 ? '#fafafa' : 'white',
                }}>
                  <td style={{ padding: 'clamp(8px, 1.5vw, 12px)', fontSize: 'clamp(11px, 1.8vw, 14px)' }}>
                    {new Date(item.timestamp).toLocaleString('ru-RU')}
                  </td>
                  <td style={{ padding: 'clamp(8px, 1.5vw, 12px)', fontSize: 'clamp(11px, 1.8vw, 14px)' }}>{item.deviceType}</td>
                  <td style={{ padding: 'clamp(8px, 1.5vw, 12px)', fontSize: 'clamp(11px, 1.8vw, 14px)' }}>{item.timeOfDay}</td>
                  <td style={{ padding: 'clamp(8px, 1.5vw, 12px)', textAlign: 'center', fontWeight: 'bold', color: '#f44336', fontSize: 'clamp(11px, 1.8vw, 14px)' }}>
                    {item.noClicks}
                  </td>
                  <td style={{ padding: 'clamp(8px, 1.5vw, 12px)', fontSize: 'clamp(11px, 1.8vw, 14px)' }}>{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Кнопка возврата */}
        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: 'clamp(10px, 2vw, 15px) clamp(25px, 4vw, 40px)',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '25px',
              fontWeight: 'bold',
              fontSize: 'clamp(14px, 2.5vw, 18px)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s',
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
