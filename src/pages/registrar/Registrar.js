import React, { useState } from 'react'
import styles from '../Auth.module.css'
import axios from 'axios'
import { useUserType } from '../../UserTypeContext.js'
import { useNotifications } from '../NotificationManager.js'

function Registrar({ closeModal, onLoginClick }) {
    const [usuario, setUsuario] = useState('')
    const [senha, setSenha] = useState('')
    const { setUserType } = useUserType()
    const { addNotification } = useNotifications()

    async function criarUsuario() {
        
     
        if (!checarInputs()) return

        try {
            const dados = {
                username: usuario,
                password: senha,
                role: "User"
            }


            const response = await axios.post("http://localhost:8080/criarUsuario", dados)
            console.log(response.data.mensagem)
            
            handleLogin()
        } catch (e) {
            console.log(e)
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

    async function handleLogin() {
        try {
            const response = await axios.get("http://localhost:8080/usuario/" + usuario)
            
            if (response.data.dados && response.data.dados.password === senha) {
                setUserType(response.data.dados)
                window.history.pushState({}, '', '/')
                window.location.reload()
                addNotification("Logado com sucesso!", "success")
            } else {
                addNotification("Erro ao buscar usuário!", "error")
            }
        } catch (e) {
            addNotification("Erro ao contatar servidor.", "error")
        }
    }

    return (
        <>
                    <div className={styles.overlay}>
            <div className={styles.modalContainer}>
                <button className={styles.closeButton} onClick={closeModal}>✕</button>
                <div className={styles.tabContainer}>
                    <button onClick={onLoginClick}>ENTRAR</button>
                    <button className={styles.activeTab}>CADASTRE-SE</button>
                </div>
                <p className={styles.divider}>Insira seus dados abaixo</p>
                <div className={styles.inputGroup}>
                    <input type="text" placeholder="Usuário" onChange={onChangeUsuario} />
                    <input type="password" placeholder="Senha" onChange={onChangeSenha} />
                </div>
                <button className={styles.loginButton} onClick={criarUsuario}>Registrar</button>
            </div>
        </div>
        </>
    )
}

export default Registrar