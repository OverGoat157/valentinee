/** @jsxImportSource react */
import React, { useState, useEffect } from "react";

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

  // Генерируем уникальный ID для пользователя
  useEffect(() => {
    if (!localStorage.getItem('valentine_visitor_id')) {
      const visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('valentine_visitor_id', visitorId);
    }
  }, []);

  const yesButtonSize = (noClicks * 20) + 16;

  const firstImg = "https://media.tenor.com/VIChDQ6ejRQAAAAj/jumping-bear-hearts-no-png.gif";
  const secondImg = "https://media.tenor.com/f1xnRxTRxLAAAAAj/bears-with-kisses-bg.gif";

  const handleNo = () => {
    setNoClicks(prev => prev + 1);
  };

  const handleYes = async () => {
  const visitorId = localStorage.getItem('valentine_visitor_id') || 'unknown';
  
  try {
    await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        noClicks,
        totalClicks: noClicks + 1,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
    });
  } catch (error) {
    console.log('Не удалось отправить:', error);
  }
  
  setIsValentine(true);
};


  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: "center",
        background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
      }}
    >
      {!isValentine ? (
        <>
          <img src={firstImg} alt="Мишки с сердечками" style={{ maxWidth: "300px", marginBottom: "20px" }} />
          <h1 style={{ 
            color: "#e91e63", 
            margin: "20px 0", 
            fontSize: "2.5em",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)"
          }}>
            Будешь моей половинкой на 14 февраля? 💘
          </h1>
          <div style={{ fontSize: '1.2em', color: '#666', marginBottom: '20px' }}>
            Попыток "нет": {noClicks}
          </div>
          <div>
            <button
              onClick={handleYes}
              style={{
                fontSize: `${yesButtonSize}px`,
                margin: "10px",
                padding: "15px 30px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
                fontWeight: "bold",
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
                fontSize: "18px",
                margin: "10px",
                padding: "15px 30px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
                fontWeight: "bold",
              }}
            >
              {noClicks === 0 ? "Нет" : NO_PHRASES[Math.min(noClicks - 1, NO_PHRASES.length - 1)]}
            </button>
          </div>
        </>
      ) : (
        <>
          <img src={secondImg} alt="Мишки целуются" style={{ maxWidth: "400px", marginBottom: "20px" }} />
          <div
            style={{
              fontSize: "4em",
              color: "#e91e63",
              fontWeight: "bold",
              textShadow: "3px 3px 6px rgba(0,0,0,0.3)",
              animation: "pulse 1s infinite",
              marginBottom: "20px",
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
  );
};

export default App;
