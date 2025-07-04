import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Shield, Lock, Eye, Zap, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './PaginaInicial.module.css';

const PaginaInicial = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const titleRef = useRef(null);
    const isTitleInView = useInView(titleRef, { once: true });

    // Parallax effects simplificados
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -25]);

    const features = [
        {
            icon: Shield,
            title: "PROTEÇÃO AVANÇADA",
            description: "Sistemas de segurança de última geração para proteger seus dados"
        },
        {
            icon: Lock,
            title: "CRIPTOGRAFIA",
            description: "Criptografia de ponta para manter suas informações seguras"
        },
        {
            icon: Eye,
            title: "MONITORAMENTO",
            description: "Monitoramento em tempo real de ameaças cibernéticas"
        },
        {
            icon: Zap,
            title: "RESPOSTA RÁPIDA",
            description: "Resposta imediata a qualquer tentativa de invasão"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const titleVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    const handleDicasClick = () => {
        navigate('/dicas');
    };

    return (
        <div className={styles.container} ref={containerRef}>
            {/* Main Content */}
            <motion.div
                className={styles.content}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Hero Section */}
                <motion.section className={styles.heroSection}>
                    <motion.div
                        ref={titleRef}
                        className={styles.heroContent}
                        variants={titleVariants}
                    >
                        <motion.h1 
                            className={styles.mainTitle}
                            animate={isTitleInView ? {
                                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                            } : {}}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            BE SAFE
                        </motion.h1>
                        
                        <motion.p 
                            className={styles.subtitle}
                            variants={itemVariants}
                        >
                            Sua segurança digital é nossa prioridade
                        </motion.p>
                        
                        <motion.div
                            className={styles.ctaSection}
                            variants={itemVariants}
                        >
                            <motion.button
                                className={styles.ctaButton}
                                onClick={handleDicasClick}
                                whileHover={{ 
                                    scale: 1.01,
                                    boxShadow: "0 0 15px rgba(0, 255, 0, 0.4)"
                                }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <BookOpen size={20} />
                                <span>VEJA ALGUMAS DICAS</span>
                                <ArrowRight size={20} />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.section>

                {/* Features Section */}
                <motion.section 
                    className={styles.featuresSection}
                    style={{ y: y1 }}
                >
                    <motion.h2 
                        className={styles.sectionTitle}
                        variants={itemVariants}
                    >
                        RECURSOS DE SEGURANÇA
                    </motion.h2>
                    
                    <motion.div 
                        className={styles.featuresGrid}
                        variants={containerVariants}
                    >
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    className={styles.featureCard}
                                    variants={itemVariants}
                                    whileHover={{ 
                                        scale: 1.01,
                                        y: -2,
                                        boxShadow: "0 3px 15px rgba(0, 255, 0, 0.15)"
                                    }}
                                >
                                    <div className={styles.featureIcon}>
                                        <Icon size={40} />
                                    </div>
                                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                                    <p className={styles.featureDescription}>{feature.description}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </motion.section>

                {/* Stats Section */}
                <motion.section 
                    className={styles.statsSection}
                    style={{ y: y2 }}
                >
                    <motion.div 
                        className={styles.statsGrid}
                        variants={containerVariants}
                    >
                        {[
                            { number: "99.9%", label: "Taxa de Proteção" },
                            { number: "24/7", label: "Monitoramento" },
                            { number: "1M+", label: "Usuários Protegidos" },
                            { number: "0", label: "Violações de Segurança" }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                className={styles.statCard}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                            >
                                <motion.div
                                    className={styles.statNumber}
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 100,
                                        delay: index * 0.02
                                    }}
                                >
                                    {stat.number}
                                </motion.div>
                                <div className={styles.statLabel}>{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>
            </motion.div>
        </div>
    );
};

export default PaginaInicial; 