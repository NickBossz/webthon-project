import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Copy, ExternalLink, Upload, FileText, Globe, File } from 'lucide-react';
import { useNotifications } from '../NotificationManager.js';
import axios from 'axios';
import styles from './CheckerApp.module.css';

const CheckerApp = () => {
    const [activeTab, setActiveTab] = useState('url');
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileResult, setFileResult] = useState(null);
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const { addNotification } = useNotifications();

    const tabs = [
        { id: 'url', label: 'Verificar URL', icon: Globe },
        { id: 'file', label: 'Verificar Arquivo', icon: File }
    ];

    const checkUrl = useCallback(async () => {
        if (!url.trim()) {
            addNotification('Por favor, insira uma URL válida', 'error');
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const response = await axios.post('http://localhost:8080/check-site', {
                url: url.trim()
            });

            const data = response.data;
            
            // Calcula o score baseado no risco previsto
            const score = Math.max(0, 100 - data.risco_previsto);
            const isSecure = score >= 70;
            
            // Gera ameaças baseadas nos dados
            const threats = [];
            if (data.malicious > 0) threats.push(`${data.malicious} detecções maliciosas`);
            if (data.suspicious > 0) threats.push(`${data.suspicious} detecções suspeitas`);
            if (data.redirecionamentos > 5) threats.push(`${data.redirecionamentos} redirecionamentos (suspeito)`);
            if (data.idade_dias < 30) threats.push('Domínio muito recente (suspeito)');

            setResult({
                url: url,
                isSecure,
                score: Math.round(score),
                threats,
                timestamp: new Date().toLocaleString(),
                details: {
                    malicious: data.malicious,
                    suspicious: data.suspicious,
                    harmless: data.harmless,
                    undetected: data.undetected,
                    age: data.idade_dias,
                    redirects: data.redirecionamentos,
                    riskScore: data.risco_previsto
                }
            });

            addNotification(
                isSecure ? 'URL verificada com sucesso!' : 'Atenção: Ameaças detectadas!',
                isSecure ? 'success' : 'error'
            );
        } catch (error) {
            console.error('Erro ao verificar URL:', error);
            addNotification('Erro ao verificar URL. Tente novamente.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [url, addNotification]);

    const checkFile = useCallback(async () => {
        if (!selectedFile) {
            addNotification('Por favor, selecione um arquivo', 'error');
            return;
        }

        setIsFileLoading(true);
        setFileResult(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await axios.post('http://localhost:8080/check-file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 120000 // 2 minutos
            });

            const data = response.data;
            
            // Sistema de score mais realista
            let score, isSecure;
            const detectionRate = data.positives / data.total;
            
            if (data.positives === 0) {
                // Nenhuma detecção - arquivo seguro
                score = 100;
                isSecure = true;
            } else if (data.positives === 1 && data.total >= 50) {
                // Apenas 1 detecção em muitos scanners - provável falso positivo
                score = 85;
                isSecure = true;
            } else if (data.positives === 1 && data.total < 50) {
                // 1 detecção em poucos scanners - suspeito
                score = 70;
                isSecure = false;
            } else if (detectionRate <= 0.05) {
                // Menos de 5% de detecções - provavelmente seguro
                score = Math.max(70, 100 - (detectionRate * 200));
                isSecure = score >= 75;
            } else if (detectionRate <= 0.15) {
                // Entre 5% e 15% - suspeito
                score = Math.max(40, 70 - (detectionRate * 200));
                isSecure = false;
            } else {
                // Mais de 15% - claramente malicioso
                score = Math.max(0, 40 - (detectionRate * 100));
                isSecure = false;
            }

            setFileResult({
                filename: data.filename,
                isSecure,
                score: Math.round(score),
                positives: data.positives,
                total: data.total,
                permalink: data.permalink,
                timestamp: new Date().toLocaleString()
            });

            addNotification(
                isSecure ? 'Arquivo verificado com sucesso!' : 'Atenção: Ameaças detectadas no arquivo!',
                isSecure ? 'success' : 'error'
            );
        } catch (error) {
            console.error('Erro ao verificar arquivo:', error);
            addNotification('Erro ao verificar arquivo. Tente novamente.', 'error');
        } finally {
            setIsFileLoading(false);
        }
    }, [selectedFile, addNotification]);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) { // 50MB
                addNotification('Arquivo muito grande. Máximo 50MB.', 'error');
                return;
            }
            setSelectedFile(file);
        }
    }, [addNotification]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.size > 50 * 1024 * 1024) {
                addNotification('Arquivo muito grande. Máximo 50MB.', 'error');
                return;
            }
            setSelectedFile(file);
        }
    }, [addNotification]);

    const copyToClipboard = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            addNotification('Copiado para a área de transferência!', 'success');
        } catch (error) {
            addNotification('Erro ao copiar', 'error');
        }
    }, [addNotification]);

    const openUrl = useCallback(() => {
        if (result?.url) {
            window.open(result.url, '_blank');
        }
    }, [result]);

    const openFileReport = useCallback(() => {
        if (fileResult?.permalink) {
            window.open(fileResult.permalink, '_blank');
        }
    }, [fileResult]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            className={styles.container}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className={styles.header} variants={itemVariants}>
                <div className={styles.titleSection}>
                    <Shield className={styles.icon} />
                    <h1>CHECKER APP</h1>
                </div>
                <p>Verifique a segurança de URLs e arquivos em tempo real</p>
            </motion.div>

            <div className={styles.mainContent}>
                {/* Sidebar Navigation */}
                <motion.div className={styles.sidebar} variants={itemVariants}>
                    <div className={styles.tabList}>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Icon size={20} />
                                    <span>{tab.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Content Area */}
                <motion.div className={styles.contentArea} variants={itemVariants}>
                    {/* URL Checker */}
                    {activeTab === 'url' && (
                        <motion.div
                            className={styles.tabContent}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={styles.checkerSection}>
                                <h2>Verificar URL</h2>
                                <p className={styles.sectionDescription}>
                                    Analise a segurança de qualquer site usando VirusTotal e inteligência artificial
                                </p>
                                
                                <div className={styles.searchContainer}>
                                    <Search className={styles.searchIcon} />
                                    <input
                                        type="url"
                                        placeholder="Digite a URL para verificar (ex: https://exemplo.com)"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && checkUrl()}
                                        className={styles.urlInput}
                                        disabled={isLoading}
                                    />
                                    <motion.button
                                        className={styles.checkButton}
                                        onClick={checkUrl}
                                        disabled={isLoading || !url.trim()}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isLoading ? (
                                            <Loader2 className={styles.spinner} />
                                        ) : (
                                            'VERIFICAR'
                                        )}
                                    </motion.button>
                                </div>
                            </div>

                            {isLoading && (
                                <motion.div
                                    className={styles.loadingSection}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <Loader2 className={styles.loadingSpinner} />
                                    <p>Analisando segurança da URL...</p>
                                </motion.div>
                            )}

                            {result && (
                                <motion.div
                                    className={styles.resultSection}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className={styles.resultHeader}>
                                        <div className={styles.resultStatus}>
                                            {result.isSecure ? (
                                                <CheckCircle className={styles.secureIcon} />
                                            ) : (
                                                <XCircle className={styles.insecureIcon} />
                                            )}
                                            <h2>{result.isSecure ? 'URL SEGURA' : 'URL INSEGURA'}</h2>
                                        </div>
                                        <div className={styles.resultScore}>
                                            <span className={styles.scoreLabel}>Score de Segurança</span>
                                            <span className={`${styles.scoreValue} ${result.isSecure ? styles.secure : styles.insecure}`}>
                                                {result.score}/100
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.resultDetails}>
                                        <div className={styles.urlDisplay}>
                                            <span className={styles.urlLabel}>URL Verificada:</span>
                                            <div className={styles.urlContainer}>
                                                <span className={styles.urlText}>{result.url}</span>
                                                <div className={styles.urlActions}>
                                                    <motion.button
                                                        className={styles.actionButton}
                                                        onClick={() => copyToClipboard(result.url)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        title="Copiar URL"
                                                    >
                                                        <Copy size={16} />
                                                    </motion.button>
                                                    <motion.button
                                                        className={styles.actionButton}
                                                        onClick={openUrl}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        title="Abrir URL"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>

                                        {result.threats.length > 0 && (
                                            <div className={styles.threatsSection}>
                                                <h3>Ameaças Detectadas:</h3>
                                                <ul className={styles.threatsList}>
                                                    {result.threats.map((threat, index) => (
                                                        <motion.li
                                                            key={index}
                                                            className={styles.threatItem}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            <AlertTriangle className={styles.threatIcon} />
                                                            {threat}
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className={styles.detailsSection}>
                                            <h3>Detalhes Técnicos:</h3>
                                            <div className={styles.detailsGrid}>
                                                <div className={styles.detailItem}>
                                                    <span>Detecções Maliciosas:</span>
                                                    <span className={styles.detailValue}>{result.details.malicious}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span>Detecções Suspeitas:</span>
                                                    <span className={styles.detailValue}>{result.details.suspicious}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span>Detecções Seguras:</span>
                                                    <span className={styles.detailValue}>{result.details.harmless}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span>Idade do Domínio:</span>
                                                    <span className={styles.detailValue}>{result.details.age} dias</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span>Redirecionamentos:</span>
                                                    <span className={styles.detailValue}>{result.details.redirects}</span>
                                                </div>
                                                <div className={styles.detailItem}>
                                                    <span>Score de Risco:</span>
                                                    <span className={styles.detailValue}>{Math.round(result.details.riskScore)}/100</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.timestamp}>
                                            Verificado em: {result.timestamp}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* File Checker */}
                    {activeTab === 'file' && (
                        <motion.div
                            className={styles.tabContent}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={styles.checkerSection}>
                                <h2>Verificar Arquivo</h2>
                                <p className={styles.sectionDescription}>
                                    Analise arquivos suspeitos usando o VirusTotal para detectar malware
                                </p>
                                
                                <div className={styles.fileUploadArea}>
                                    <div
                                        className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''} ${selectedFile ? styles.hasFile : ''}`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className={styles.fileInput}
                                            id="fileInput"
                                        />
                                        <label htmlFor="fileInput" className={styles.dropZoneContent}>
                                            {selectedFile ? (
                                                <>
                                                    <FileText className={styles.fileIcon} />
                                                    <div className={styles.fileInfo}>
                                                        <span className={styles.fileName}>{selectedFile.name}</span>
                                                        <span className={styles.fileSize}>
                                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className={styles.uploadIcon} />
                                                    <div className={styles.uploadText}>
                                                        <span className={styles.uploadTitle}>Arraste e solte um arquivo aqui</span>
                                                        <span className={styles.uploadSubtitle}>ou clique para selecionar</span>
                                                        <span className={styles.uploadLimit}>Máximo: 50MB</span>
                                                    </div>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    
                                    <motion.button
                                        className={styles.checkButton}
                                        onClick={checkFile}
                                        disabled={isFileLoading || !selectedFile}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isFileLoading ? (
                                            <Loader2 className={styles.spinner} />
                                        ) : (
                                            'VERIFICAR ARQUIVO'
                                        )}
                                    </motion.button>
                                </div>
                            </div>

                            {isFileLoading && (
                                <motion.div
                                    className={styles.loadingSection}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <Loader2 className={styles.loadingSpinner} />
                                    <p>Analisando arquivo no VirusTotal...</p>
                                </motion.div>
                            )}

                            {fileResult && (
                                <motion.div
                                    className={styles.resultSection}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className={styles.resultHeader}>
                                        <div className={styles.resultStatus}>
                                            {fileResult.isSecure ? (
                                                <CheckCircle className={styles.secureIcon} />
                                            ) : (
                                                <XCircle className={styles.insecureIcon} />
                                            )}
                                            <h2>{fileResult.isSecure ? 'ARQUIVO SEGURO' : 'ARQUIVO INSEGURO'}</h2>
                                        </div>
                                        <div className={styles.resultScore}>
                                            <span className={styles.scoreLabel}>Score de Segurança</span>
                                            <span className={`${styles.scoreValue} ${fileResult.isSecure ? styles.secure : styles.insecure}`}>
                                                {fileResult.score}/100
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.resultDetails}>
                                        <div className={styles.fileDisplay}>
                                            <span className={styles.fileLabel}>Arquivo Verificado:</span>
                                            <div className={styles.fileContainer}>
                                                <FileText className={styles.fileIcon} />
                                                <span className={styles.fileText}>{fileResult.filename}</span>
                                                <div className={styles.fileActions}>
                                                    <motion.button
                                                        className={styles.actionButton}
                                                        onClick={openFileReport}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        title="Ver relatório completo"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.fileStats}>
                                            <div className={styles.statItem}>
                                                <span>Detecções Positivas:</span>
                                                <span className={styles.statValue}>{fileResult.positives}</span>
                                            </div>
                                            <div className={styles.statItem}>
                                                <span>Total de Análises:</span>
                                                <span className={styles.statValue}>{fileResult.total}</span>
                                            </div>
                                            <div className={styles.statItem}>
                                                <span>Taxa de Detecção:</span>
                                                <span className={styles.statValue}>
                                                    {((fileResult.positives / fileResult.total) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.scoreExplanation}>
                                            <h4>Como interpretar o score:</h4>
                                            <ul>
                                                {fileResult.positives === 0 && (
                                                    <li>✅ <strong>100/100:</strong> Nenhuma ameaça detectada - arquivo seguro</li>
                                                )}
                                                {fileResult.positives === 1 && fileResult.total >= 50 && (
                                                    <li>⚠️ <strong>85/100:</strong> 1 detecção em {fileResult.total} scanners - provável falso positivo</li>
                                                )}
                                                {fileResult.positives === 1 && fileResult.total < 50 && (
                                                    <li>⚠️ <strong>70/100:</strong> 1 detecção em {fileResult.total} scanners - suspeito, recomenda-se cautela</li>
                                                )}
                                                {fileResult.positives > 1 && (fileResult.positives / fileResult.total) <= 0.05 && (
                                                    <li>⚠️ <strong>{fileResult.score}/100:</strong> Baixa taxa de detecção - provavelmente seguro</li>
                                                )}
                                                {fileResult.positives > 1 && (fileResult.positives / fileResult.total) > 0.05 && (fileResult.positives / fileResult.total) <= 0.15 && (
                                                    <li>❌ <strong>{fileResult.score}/100:</strong> Taxa de detecção moderada - arquivo suspeito</li>
                                                )}
                                                {fileResult.positives > 1 && (fileResult.positives / fileResult.total) > 0.15 && (
                                                    <li>🚨 <strong>{fileResult.score}/100:</strong> Alta taxa de detecção - arquivo malicioso</li>
                                                )}
                                            </ul>
                                        </div>

                                        <div className={styles.timestamp}>
                                            Verificado em: {fileResult.timestamp}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            </div>

            <motion.div className={styles.infoSection} variants={itemVariants}>
                <h3>Como funciona?</h3>
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoNumber}>1</div>
                        <h4>Insira URL ou Arquivo</h4>
                        <p>Cole uma URL ou selecione um arquivo para verificar</p>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoNumber}>2</div>
                        <h4>Análise Automática</h4>
                        <p>Nosso sistema analisa usando VirusTotal e IA</p>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoNumber}>3</div>
                        <h4>Resultado Detalhado</h4>
                        <p>Receba um relatório completo sobre a segurança</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CheckerApp;
