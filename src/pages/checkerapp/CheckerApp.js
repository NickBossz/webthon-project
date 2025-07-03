import React, { useState } from 'react';
import axios from 'axios';
import styles from './CheckerApp.module.css';

function FileChecker() {
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
        timeout: 60000,
      });
      setResultado(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Falha na verificação do arquivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.fileContainer}>
      <h2 className={styles.fileTitle}>Verificar Arquivo</h2>

      <form onSubmit={handleSubmit} className={styles.fileForm}>
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setError(null);
          }}
          className={styles.fileInput}
          disabled={loading}
        />

        <button type="submit" className={styles.fileButton} disabled={loading || !file}>
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
      </form>

      {error && <p className={styles.fileError}>{error}</p>}
      {loading && <p className={styles.fileLoading}>Analisando...</p>}

      {resultado && !resultado.error && (
        <div className={styles.resultCard}>
          <div className={styles.scoreSection}>
            <div className={styles.circle}>
              <div className={styles.score}>
                {resultado.positives || 0}
                <br />
                <span className={styles.outOf}>/ {resultado.total}</span>
              </div>
              <p className={styles.label}>Detecções</p>
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.headerRow}>
              <span className={styles.success}>✔ Arquivo verificado</span>
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={() => {
                    setResultado(null);
                    setError(null);
                    setFile(null);
                  }}
                >
                  🔄 Reanalisar
                </button>
              </div>
            </div>

            <p className={styles.hash}>{resultado.hash || 'HASH NÃO DISPONÍVEL'}</p>
            <p className={styles.filename}>{file?.name}</p>

            <div className={styles.tags}>
              <span>trusted</span>
              <span>attachment</span>
              <span>known-distributor</span>
            </div>

            <div className={styles.metaInfo}>
              <p>
                <strong>Tamanho:</strong> {file?.size} bytes
              </p>
              <p>
                <strong>Analisado há:</strong> alguns segundos
              </p>
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

function SiteChecker() {
  const [url, setUrl] = useState('');
  const [dangerPercentage, setDangerPercentage] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [statusClass, setStatusClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Mock forum posts data
  const mockForumPosts = [
    {
      id: 1,
      username: 'User 123',
      date: '2025-07-01 14:30',
      content: 'This site seems suspicious. I got a weird pop-up when visiting.',
      rating: 'Negative',
    },
    {
      id: 2,
      username: 'SafeSurfer',
      date: '2025-07-01 10:15',
      content: 'Checked this site, looks legit to me. No issues found.',
      rating: 'Positive',
    },
    {
      id: 3,
      username: 'TechGuru',
      date: '2025-06-30 09:45',
      content: 'Be cautious, some links redirect to unsecure pages.',
      rating: 'Warning',
    },
  ];

  const checkSite = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setStatusText('');
    setStatusClass('');
    setDangerPercentage(null);

    try {
      const response = await axios.post('http://localhost:8080/check-site', { url });

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
        setStatusClass('potentiallyDangerous');
      } else {
        setStatusText('🛑 Perigoso');
        setStatusClass('dangerous');
      }
    } catch (error) {
      setStatusText('❌ Erro ao verificar o site.');
      setStatusClass('dangerous');
    }
    setLoading(false);
  };

  return (
    <div className={styles.siteContainer}>
      <h2 className={styles.siteTitle}>Verificador de Sites</h2>

      <form className={styles.siteForm}>
        <input
          type="text"
          placeholder="Digite a URL do site"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={styles.siteInput}
          disabled={loading}
        />

        <button
          onClick={checkSite}
          disabled={loading || !url.trim()}
          className={styles.siteButton}
          type="button"
        >
          {loading ? 'Verificando...' : 'Verificar'}
        </button>

        <button
          onClick={() => setModalOpen(true)}
          className={styles.siteButton}
          type="button"
          style={{ marginTop: '0.5rem' }}
        >
          Como funciona?
        </button>
      </form>

      {loading && <p className={styles.siteLoading}>Analisando...</p>}

      {statusText && (
        <div className={styles.resultCard}>
          <div className={styles.scoreSection}>
            <div className={styles.circle}>
              <div className={styles.score}>
                {dangerPercentage !== null ? `${dangerPercentage}%` : '--'}
                <br />
                <span className={styles.outOf}>Risco</span>
              </div>
              <p className={styles.label}>Nível de Risco</p>
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.headerRow}>
              <span className={styles[statusClass]}>{statusText}</span>
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={() => {
                    setStatusText('');
                    setStatusClass('');
                    setDangerPercentage(null);
                    setUrl('');
                  }}
                >
                  🔄 Reanalisar
                </button>
              </div>
            </div>

            <p className={styles.filename}>{url || 'URL NÃO DISPONÍVEL'}</p>

            <div className={styles.tags}>
              <span>{statusClass}</span>
              <span>web</span>
              <span>scanned</span>
            </div>

            <div className={styles.metaInfo}>
              <p>
                <strong>Analisado há:</strong> alguns segundos
              </p>
            </div>

            <a
              href={`https://www.virustotal.com/gui/url?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Ver detalhes no VirusTotal
            </a>
          </div>
        </div>
      )}

      {statusText && (
        <div className={styles.forumSection}>
          <h3 className={styles.forumTitle}>Comentários do Fórum</h3>
          {mockForumPosts.length > 0 ? (
            mockForumPosts.map((post) => (
              <div key={post.id} className={styles.forumPost}>
                <div className={styles.forumHeader}>
                  <span className={styles.forumUsername}>{post.username}</span>
                  <span className={styles.forumDate}>{post.date}</span>
                </div>
                <p className={styles.forumContent}>{post.content}</p>
                <div className={styles.forumRating}>
                  <span className={styles[`rating${post.rating}`]}>{post.rating}</span>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noPosts}>Nenhum comentário encontrado para este site.</p>
          )}
        </div>
      )}

      {modalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setModalOpen(false)}
          role="presentation"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>Como funciona o Site Checker?</h3>
            <p>
              Nosso sistema analisa diversos parâmetros de segurança para prever o risco de um site.
              A partir da URL fornecida, realizamos uma avaliação automatizada que retorna uma porcentagem
              indicando a probabilidade do site ser seguro, suspeito ou perigoso.
            </p>
            <p>
              <span className={styles.safe}>- Risco até 10%: Site seguro.</span>
              <br />
              <span className={styles.suspicious}>- Risco até 30%: Site suspeito, cuidado.</span>
              <br />
              <span className={styles.potentiallyDangerous}>
                - Risco até 50%: Site potencialmente perigoso.
              </span>
              <br />
              <span className={styles.dangerous}>- Acima de 50%: Site perigoso, evite acessá-lo.</span>
            </p>
            <button
              onClick={() => setModalOpen(false)}
              className={styles.siteButton}
              type="button"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckerApp() {
  const [activeTab, setActiveTab] = useState('file'); // 'file' ou 'site'

  return (
    <div className={styles.container}>
      <nav className={styles.navTabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'file' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('file')}
          type="button"
        >
          Verificador de Arquivos
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'site' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('site')}
          type="button"
        >
          Verificador de Sites
        </button>
      </nav>

      {activeTab === 'file' && <FileChecker />}
      {activeTab === 'site' && <SiteChecker />}
    </div>
  );
}
