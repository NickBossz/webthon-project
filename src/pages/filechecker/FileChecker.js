import React, { useState } from 'react';
import styles from './FileChecker.module.css';
import axios from 'axios';

export default function FileChecker() {
  const [file, setFile] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um arquivo.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8080/check-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });
      setResultado(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Falha na verificação do arquivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Verificar Arquivo</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setError(null);
          }}
          className={styles.input}
          disabled={loading}
        />

        <button type="submit" className={styles.button} disabled={loading || !file}>
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Analisando...</p>}

      {resultado && !resultado.error && (
        <div className={styles.resultCard}>
          <div className={styles.scoreSection}>
            <div className={styles.circle}>
              <div className={styles.score}>
                {resultado.positives || 0}<br /><span className={styles.outOf}>/ {resultado.total}</span>
              </div>
              <p className={styles.label}>Detecções</p>
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.headerRow}>
              <span className={styles.success}>✔ Arquivo verificado</span>
              <div className={styles.actions}>
                <button>🔄 Reanalisar</button>
                <button>⚖ Similar</button>
              </div>
            </div>

            <p className={styles.hash}>{resultado.hash || 'HASH NÃO DISPONÍVEL'}</p>
            <p className={styles.filename}>{file.name}</p>

            <div className={styles.tags}>
              <span>trusted</span>
              <span>attachment</span>
              <span>known-distributor</span>
            </div>

            <div className={styles.metaInfo}>
              <p><strong>Tamanho:</strong> {file.size} bytes</p>
              <p><strong>Analisado há:</strong> alguns segundos</p>
            </div>

            <a
              href={resultado.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Ver detalhes no VirusTotal
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
