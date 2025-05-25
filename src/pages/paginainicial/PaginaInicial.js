import React, { useEffect, useRef, useState } from 'react';
import styles from './PaginaInicial.module.css';

function PaginaInicial() {
  const containerRef = useRef();
  const fullText = 'CONSCIENTIZAÇÃO DIGITAL';
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingNow, setIsTypingNow] = useState(false); // <- controle do cursor

  useEffect(() => {
    const container = containerRef.current;
    const binary = ['0', '1'];
    const columns = 40;
    const drops = [];

    for (let i = 0; i < columns; i++) {
      const column = document.createElement('div');
      column.className = styles.column;

      const depth = Math.random();
      const fontSize = 14 + depth * 20;
      const opacity = 0.3 + depth * 0.7;
      const speed = 8 - depth * 2;

      column.style.left = `${(i / columns) * 100 * 2.5}vw`;
      column.style.fontSize = `${fontSize}px`;
      column.style.opacity = opacity;
      column.style.animationDuration = `${speed}s`;

      const length = Math.floor(Math.random() * 15 + 10);
      for (let j = 0; j < length; j++) {
        const span = document.createElement('span');
        span.className = styles.char;
        span.textContent = binary[Math.floor(Math.random() * 2)];
        span.style.animationDelay = `${Math.random() * 2}s`;
        column.appendChild(span);
      }

      container.appendChild(column);
      drops.push(column);
    }

    return () => {
      drops.forEach(column => column.remove());
    };
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    let isTyping = true;
    let timeoutId;

    const step = () => {
      if (isTyping) {
        setIsTypingNow(true); // começou a digitar
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;

        if (currentIndex === fullText.length) {
          isTyping = false;
          setIsTypingNow(false); // terminou de digitar
          timeoutId = setTimeout(step, 3000); // pausa maior antes de apagar
        } else {
          timeoutId = setTimeout(step, 120);
        }
      } else {
        setIsTypingNow(false); // apagando, piscar ativado
        setDisplayedText(fullText.slice(0, currentIndex - 1));
        currentIndex--;

        if (currentIndex === 0) {
          isTyping = true;
          timeoutId = setTimeout(step, 1000); // pausa antes de recomeçar a digitar
        } else {
          timeoutId = setTimeout(step, 80);
        }
      }
    };

    step();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <div className={styles.container} ref={containerRef}></div>
      <div className={styles.centeredText}>
        {displayedText}
        <span className={`${styles.cursor} ${isTypingNow ? styles.staticCursor : ''}`}>|</span>
      </div>
    </>
  );
}

export default PaginaInicial;
