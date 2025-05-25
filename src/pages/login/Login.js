import React, { useState } from 'react'
import styles from '../Auth.module.css'
import axios from 'axios'
import { useUserType } from '../../UserTypeContext'
import { useNotification } from '../NotificationManager'

function Login({ closeModal, onRegisterClick }) {
    const [usuario, setUsuario] = useState('')
    const [senha, setSenha] = useState('')
    const { setUserType } = useUserType()
    const notify = useNotification()

    async function handleLogin() {
        if (!checarInputs()) return

        try {
            const response = await axios.get("http://localhost:8080/usuario/" + usuario)
            if (response.data.dados.password === senha) {
                setUserType(response.data.dados)
                window.history.pushState({}, '', '/')
                window.location.reload()
                notify("Logado com sucesso!", "#0080ff")
            } else {
                notify("A senha está incorreta!", "#cc0000")
            }
        } catch (e) {
            notify("Este usuário não existe!", "#cc0000")
        }
    }

    function onChangeUsuario(event) {
        setUsuario(event.target.value)
    }

    function onChangeSenha(event) {
        setSenha(event.target.value)
    }

    function checarInputs() {
        return usuario && senha
    }

    return (
        <>
            <div className={styles.overlay}>
            <div className={styles.modalContainer}>
                <button className={styles.closeButton} onClick={closeModal}>✕</button>
                <div className={styles.tabContainer}>
                    <button className={styles.activeTab}>ENTRAR</button>
                    <button onClick={onRegisterClick}>CADASTRE-SE</button>
                </div>
                <p className={styles.divider}>Insira seus dados abaixo</p>
                <div className={styles.inputGroup}>
                    <input type="text" placeholder="Usuário" onChange={onChangeUsuario} />
                    <input type="password" placeholder="Senha" onChange={onChangeSenha} />
                </div>
                <button className={styles.loginButton} onClick={handleLogin}>Login</button>
            </div>
        </div>
        </>
    )
}

export default Login