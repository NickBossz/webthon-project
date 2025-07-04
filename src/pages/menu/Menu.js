import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Lightbulb, Search, Users, User, LogIn, LogOut, Menu as MenuIcon, X } from 'lucide-react'
import styles from './Menu.module.css'
import { Link } from 'react-router-dom'
import Login from '../login/Login.js'
import Registrar from '../registrar/Registrar.js'
import { useUserType } from '../../UserTypeContext.js'
import toast from 'react-hot-toast'

const Menu = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isRegisterMode, setIsRegisterMode] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { userType, setUserType } = useUserType()
    const navigate = useNavigate()
    const location = useLocation()

    // Detectar scroll para efeito de transparência
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50
            setScrolled(isScrolled)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Fechar menu mobile ao mudar de rota
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [location.pathname])

    // Limpar classe modal-open quando componente for desmontado
    useEffect(() => {
        return () => {
            document.body.classList.remove('modal-open')
        }
    }, [])

    const handleLoginClick = () => {
        setIsRegisterMode(false)
        setIsModalOpen(true)
        document.body.classList.add('modal-open')
        toast.success('Abrindo tela de login...')
    }

    const handleRegisterClick = () => {
        setIsRegisterMode(true)
        setIsModalOpen(true)
        document.body.classList.add('modal-open')
        toast.success('Abrindo tela de registro...')
    }

    const closeModal = () => {
        setIsModalOpen(false)
        document.body.classList.remove('modal-open')
    }

    const loggout = () => {
        setUserType(null)
        navigate('/')
        toast.success('Logout realizado com sucesso!')
        window.location.reload()
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const menuItems = [
        { path: '/', label: 'INICIO', icon: Home },
        { path: '/dicas', label: 'DICAS', icon: Lightbulb },
        { path: '/checkerApp', label: 'APP CHECKER', icon: Search },
        { path: '/forum', label: 'FORUM', icon: Users },
    ]

    const menuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    }

    return (
        <motion.div 
            className={`${styles.menuContainer} ${scrolled ? styles.scrolled : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <motion.div 
                className={styles.logoSection}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <motion.img 
                    alt="Logo" 
                    className={styles.logo} 
                    src={process.env.PUBLIC_URL + '/Logo-no-bg.png'} 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                />
                <motion.span 
                    className={styles.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    BE SAFE
                </motion.span>
            </motion.div>


            {/* Desktop Navigation */}
            <motion.nav 
                className={styles.navLinks}
                variants={menuVariants}
                initial="hidden"
                animate="visible"
            >
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    
                    return (
                        <motion.div
                            key={item.path}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link 
                                to={item.path} 
                                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                            >
                                <Icon size={16} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        className={styles.activeIndicator}
                                        layoutId="activeIndicator"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        </motion.div>
                    )
                })}
                
                {userType !== null && (
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link 
                            to={'/perfil/' + userType.username} 
                            className={`${styles.navLink} ${location.pathname.includes('/perfil') ? styles.active : ''}`}
                        >
                            <User size={16} />
                            <span>PERFIL</span>
                        </Link>
                    </motion.div>
                )}
            </motion.nav>

            {/* Mobile Menu Button */}
            <motion.button
                className={styles.mobileMenuButton}
                onClick={toggleMobileMenu}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </motion.button>

            {/* Auth Button */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {userType !== null ? (
                    <motion.button 
                        className={styles.loginButton} 
                        onClick={loggout}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogOut size={16} />
                        <span>Sair</span>
                    </motion.button>
                ) : (
                    <motion.button 
                        className={styles.loginButton} 
                        onClick={handleLoginClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogIn size={16} />
                        <span>Entrar</span>
                    </motion.button>
                )}
            </motion.div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className={styles.mobileMenu}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path
                            
                            return (
                                <motion.div
                                    key={item.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Link 
                                        to={item.path} 
                                        className={`${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </Link>
                                </motion.div>
                            )
                        })}
                        
                        {userType !== null && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Link 
                                    to={'/perfil/' + userType.username} 
                                    className={`${styles.mobileNavLink} ${location.pathname.includes('/perfil') ? styles.active : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <User size={20} />
                                    <span>PERFIL</span>
                                </Link>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Auth Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            zIndex: 9999,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px',
                            boxSizing: 'border-box'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isRegisterMode ? 
                            <Registrar closeModal={closeModal} onLoginClick={handleLoginClick} /> :
                            <Login closeModal={closeModal} onRegisterClick={handleRegisterClick} />
                        }
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Menu