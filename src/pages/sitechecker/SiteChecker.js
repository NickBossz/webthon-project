import React, { useState } from 'react';
import axios from 'axios';
import styles from './SiteChecker.module.css';

export default function SiteChecker() {
  const [url, setUrl] = useState('');
  const [isSafe, setIsSafe] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkSite = async () => {
    setLoading(true);
    setIsSafe(null);

    try {
      const response = await new Promise((resolve) =>
        setTimeout(() => {
          const safe = url.toLowerCase().includes('safe');
          resolve({ data: { isSafe: safe } });
        }, 1000)
      );

      setIsSafe(response.data.isSafe);
    } catch (error) {
      setIsSafe(false);
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Calculador de Risco de Site</h2>
        <input
          className={styles.input}
          type="text"
          placeholder="Digite a URL do site"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          className={styles.button}
          onClick={checkSite}
          disabled={loading || !url}
        >
          Verificar
        </button>

        {loading && <p className={styles.text}>Verificando...</p>}
        {isSafe === true && (
          <p className={`${styles.text} ${styles.safe}`}>É confiável</p>
        )}
        {isSafe === false && (
          <p className={`${styles.text} ${styles.unsafe}`}>Não é confiável</p>
        )}
      </div>
    </div>
  );
}
