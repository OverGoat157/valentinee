import React from 'react';
import './FallingHearts.css';

const FallingHearts: React.FC = () => {
  // Создаем массив из 15 сердечек
  const hearts = Array.from({ length: 15 }, (_, i) => i);

  return (
    <div className="falling-hearts-container">
      {hearts.map((i) => (
        <div
          key={i}
          className="heart"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            fontSize: `${20 + Math.random() * 20}px`,
            opacity: 0.6 + Math.random() * 0.4,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

export default FallingHearts;
