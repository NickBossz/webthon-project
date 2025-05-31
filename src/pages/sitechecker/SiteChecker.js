import React, { useState } from 'react';
import axios from 'axios';
import styles from './SiteChecker.module.css';

export default function SiteChecker() {
  const [url, setUrl] = useState('');
  const [dangerPercentage, setDangerPercentage] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [statusClass, setStatusClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAnimating, setModalAnimating] = useState(false); // para controlar animação fechamento

  // Função para abrir modal com animação
  const openModal = () => {
    setModalOpen(true);
    setModalAnimating(true);
  };

  // Função para fechar modal com animação
  const closeModal = () => {
    setModalAnimating(false);
    setTimeout(() => setModalOpen(false), 300); // duração da animação
  };

  const checkSite = async () => {
    setLoading(true);
    setStatusText('');
    setStatusClass('');
    setDangerPercentage(0);

    try {
      const response = await axios.post("http://localhost:8080/check-site", { url });

      const danger = parseFloat(response.data.risco_previsto);
      setDangerPercentage(danger);

      if (danger <= 10) {
        setStatusText('✅ Seguro');
        setStatusClass('safe');
      } else if (danger <= 30) {
        setStatusText('🟨 Suspeito');
        setStatusClass('suspicious');
      } else if (danger <= 50) {
        setStatusText('🟧 Potencialmente Perigoso');
        setStatusClass('potentially-dangerous');
      } else {
        setStatusText('🛑 Perigoso');
        setStatusClass('dangerous');
      }

    } catch (error) {
      console.error(error);
      setStatusText('❌ Erro ao verificar o site.');
      setStatusClass('error');
    }

    setLoading(false);
  };

  // Função para obter a cor da borda/texto do modal de acordo com o statusClass atual
  const getModalColorClass = () => {
    switch (statusClass) {
      case 'safe': return styles.modalSafe;
      case 'suspicious': return styles.modalSuspicious;
      case 'potentially-dangerous': return styles.modalPotentiallyDangerous;
      case 'dangerous': return styles.modalDangerous;
      case 'error': return styles.modalError;
      default: return styles.modalDefault;
    }
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
          {loading ? 'Verificando...' : 'Verificar'}
        </button>

        <button
          className={`${styles.button} ${styles.infoButton}`}
          onClick={openModal}
          style={{ marginTop: '1rem' }}
        >
          Como funciona?
        </button>

        {statusText && (
          <p className={`${styles.text} ${styles[statusClass]}`}>
            {statusText} — Risco: {dangerPercentage}%
          </p>
        )}
      </div>

      {modalOpen && (
        <div
          className={`${styles.modalBackdrop} ${modalAnimating ? styles.fadeIn : styles.fadeOut}`}
          onClick={closeModal}
        >
          <div
            className={`${styles.modalContent} ${getModalColorClass()} ${modalAnimating ? styles.slideIn : styles.slideOut}`}
            onClick={e => e.stopPropagation()}
          >
            <h3>Como funciona o Site Checker?</h3>
            <p>
              Nosso sistema analisa diversos parâmetros de segurança para prever o risco de um site.
              A partir da URL fornecida, realizamos uma avaliação automatizada que retorna uma porcentagem
              indicando a probabilidade do site ser seguro, suspeito ou perigoso.
            </p>
            <p>
              <span className={styles.safe}>- Risco até 10%: Site seguro.</span><br/>
              <span className={styles.suspicious}>- Risco até 30%: Site suspeito, cuidado.</span><br/>
              <span className={styles.potentiallyDangerous}>- Risco até 50%: Site potencialmente perigoso.</span><br/>
              <span className={styles.dangerous}>- Acima de 50%: Site perigoso, evite acessá-lo.</span>
            </p>
            <button
              className={styles.button}
              onClick={closeModal}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
