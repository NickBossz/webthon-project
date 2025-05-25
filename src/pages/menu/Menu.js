import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Menu.module.css'
import { Link } from 'react-router-dom'
import Login from '../login/Login.js'
import Registrar from '../registrar/Registrar.js'
import { useUserType } from '../../UserTypeContext.js'

const Menu = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isRegisterMode, setIsRegisterMode] = useState(false)
    const { userType, setUserType } = useUserType()
    const history = useNavigate()

    const handleLoginClick = () => {
        setIsRegisterMode(false)
        setIsModalOpen(true)
    }

    const handleRegisterClick = () => {
        setIsRegisterMode(true)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const loggout = () => {
        setUserType(null)
        history('/') 
        window.location.reload()
    }

    return (
        <div className={styles.menuContainer}>
            <div className={styles.logoSection}>
                <img alt="Logo" className={styles.logo} src={process.env.PUBLIC_URL + '/Logo-no-bg.png'} />
                <span className={styles.title}>BE SAFE</span>
            </div>
            <div className={styles.language}>PT</div>
            <nav className={styles.navLinks}>
                <Link to={'/'} className={styles.navLink}>INICIO</Link>
                <Link to={'/dicas'} className={styles.navLink}>DICAS</Link>
                <Link to={'/siteChecker'} className={styles.navLink}>SITE CHECKER</Link>
                {userType !== null && (
                    <Link to={'/perfil/' + userType.username} className={styles.navLink}>PERFIL</Link>
                )}
            </nav>

            {userType !== null ? (
                <button className={styles.loginButton} onClick={loggout}>Sair</button>
            ) : (
                <button className={styles.loginButton} onClick={handleLoginClick}>Entrar</button>
            )}

            {isModalOpen && (
                isRegisterMode ? 
                    <Registrar closeModal={closeModal} onLoginClick={handleLoginClick} /> :
                    <Login closeModal={closeModal} onRegisterClick={handleRegisterClick} />
            )}
        </div>
    )
}

export default Menu