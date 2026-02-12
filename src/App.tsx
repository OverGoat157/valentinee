/** @jsxImportSource react */
import React, { useState, useEffect } from "react";
import confetti from 'canvas-confetti';
import FallingHearts from './components/FallingHearts';

const NO_PHRASES = [
  "Нет 💔",
  "Ну пожалуйста? 🥺",
  "Мы бы так мило смотрелись вместе! 💕",
  "Ещё один шанс, солнышко?",
  "Не разбивай мне сердце :(",
  "А может быть?",
  "Пожалуйста, не делай этого со мной, я хрупкий",
];

const App: React.FC = () => {
  const [noClicks, setNoClicks] = useState<number>(0);
  const [isValentine, setIsValentine] = useState<boolean>(false);
  const [fadeIn, setFadeIn] = useState<boolean>(false);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });

  // Генерируем уникальный ID для пользователя
  useEffect(() => {
    if (!localStorage.getItem('valentine_visitor_id')) {
      const visitorId = 'visitor_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('valentine_visitor_id', visitorId);
    }
    // Запускаем fade-in анимацию при загрузке
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // Функция для запуска конфетти из сердечек
  const fireHeartConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      shapes: ['circle'] as any,
      colors: ['#ff0000', '#ff1493', '#ff69b4', '#ffb6c1', '#ffc0cb'],
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  // Ограничиваем рост кнопки "Да" на мобилках
  const yesButtonSize = Math.min((noClicks * 20) + 16, window.innerWidth * 0.12);

  const firstImg = "https://media.tenor.com/VIChDQ6ejRQAAAAj/jumping-bear-hearts-no-png.gif";
  const secondImg = "https://media.tenor.com/f1xnRxTRxLAAAAAj/bears-with-kisses-bg.gif";

  const handleNo = () => {
    setNoClicks(prev => prev + 1);

    const buttonWidth = 200;
    const buttonHeight = 80;
    const maxX = (window.innerWidth - buttonWidth) / 2 - 20;
    const maxY = (window.innerHeight - buttonHeight) / 2 - 80;

    const randomX = (Math.random() - 0.5) * 2 * maxX;
    const randomY = (Math.random() - 0.5) * 2 * maxY;

    setNoButtonPosition({ x: randomX, y: randomY });
  };

  const handleYes = async () => {
    const visitorId = localStorage.getItem('valentine_visitor_id') || 'unknown';

    fireHeartConfetti();

    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
    const deviceType = isMobile ? '📱 Мобильный' : '💻 Десктоп';

    let browser = '🌐 Неизвестный';
    if (ua.includes('Chrome')) browser = '🌐 Chrome';
    else if (ua.includes('Firefox')) browser = '🌐 Firefox';
    else if (ua.includes('Safari')) browser = '🌐 Safari';
    else if (ua.includes('Edge')) browser = '🌐 Edge';

    const hour = new Date().getHours();
    let timeOfDay = '🌙 Ночь';
    if (hour >= 6 && hour < 12) timeOfDay = '🌅 Утро';
    else if (hour >= 12 && hour < 18) timeOfDay = '☀️ День';
    else if (hour >= 18 && hour < 22) timeOfDay = '🌆 Вечер';

    try {
      await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          noClicks,
          totalClicks: noClicks + 1,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          deviceType,
          browser,
          timeOfDay,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language
        })
      });
    } catch (error) {
      console.log('Не удалось отправить:', error);
    }

    setFadeIn(false);
    setTimeout(() => {
      setIsValentine(true);
      setTimeout(() => setFadeIn(true), 100);
    }, 300);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: "center",
        background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
        position: "relative",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      <FallingHearts />

      <div
        style={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'scale(1)' : 'scale(0.9)',
          transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
          zIndex: 10,
          position: 'relative',
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
      {!isValentine ? (
        <>
          <img
            src={firstImg}
            alt="Мишки с сердечками"
            style={{
              width: "60%",
              maxWidth: "300px",
              minWidth: "150px",
              marginBottom: "clamp(10px, 3vw, 20px)",
            }}
          />
          <h1 style={{
            color: "#e91e63",
            margin: "clamp(10px, 2vw, 20px) 0",
            fontSize: "clamp(1.3em, 5vw, 2.5em)",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            padding: "0 10px",
            lineHeight: 1.3,
          }}>
            Будешь моей половинкой на 14 февраля? 💘
          </h1>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
          }}>
            <button
              onClick={handleYes}
              style={{
                fontSize: `${yesButtonSize}px`,
                padding: "clamp(10px, 2vw, 15px) clamp(20px, 4vw, 30px)",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
                fontWeight: "bold",
                maxWidth: "90vw",
                wordBreak: "break-word",
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#45a049"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4caf50"}
            >
              Да! 😍💕
            </button>
            <button
              onClick={handleNo}
              style={{
                fontSize: "clamp(14px, 3vw, 18px)",
                padding: "clamp(10px, 2vw, 15px) clamp(20px, 4vw, 30px)",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
                fontWeight: "bold",
                transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px)`,
                transition: `transform ${Math.max(0.1, 0.3 - noClicks * 0.02)}s ease-out`,
                whiteSpace: "nowrap",
              }}
            >
              {noClicks === 0 ? "Нет" : NO_PHRASES[Math.min(noClicks - 1, NO_PHRASES.length - 1)]}
            </button>
          </div>
        </>
      ) : (
        <>
          <img
            src={secondImg}
            alt="Мишки целуются"
            style={{
              width: "70%",
              maxWidth: "400px",
              minWidth: "180px",
              marginBottom: "clamp(10px, 3vw, 20px)",
            }}
          />
          <div
            style={{
              fontSize: "clamp(2em, 8vw, 4em)",
              color: "#e91e63",
              fontWeight: "bold",
              textShadow: "3px 3px 6px rgba(0,0,0,0.3)",
              animation: "pulse 1s infinite",
              marginBottom: "20px",
              lineHeight: 1.3,
            }}
          >
            Урааа!!! 💖🎉🥰
          </div>
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.08); }
              100% { transform: scale(1); }
            }
          `}</style>
        </>
      )}
      </div>
    </div>
  );
};

export default App;
