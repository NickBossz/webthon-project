import React, { useState, useEffect } from 'react'
import axios from 'axios'
import styles from './Perfil.module.css'
import { Buffer } from 'buffer'
import { useNotification } from '../NotificationManager.js'
import { useParams } from 'react-router-dom'
import { useUserType } from '../../UserTypeContext.js'

const HackerBackground = () => {
    const columns = new Array(50).fill(0)

    const getRandomChar = () => {
        const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        return chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return (
        <div className={styles.container}>
            {columns.map((_, index) => (
                <div
                    key={index}
                    className={styles.column}
                    style={{
                        left: `${index * 2}vw`,
                        animationDuration: `${Math.random() * 5 + 5}s`,
                    }}
                >
                    {Array.from({ length: 40 }).map((__, i) => (
                        <span key={i} className={styles.char}>
                            {getRandomChar()}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    )
}


function Perfil() {
    const { username } = useParams()
    const [role, setRole] = useState('')
    const [profilePicture, setProfilePicture] = useState()
    const { userType } = useUserType()
    const notify = useNotification()

    const handleChangePicture = async (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()

            reader.onload = async (e) => {
                const base64String = e.target.result
                setProfilePicture(base64String)

                try {
                    const response = await axios.post('http://localhost:8080/uploadperfilimage', {
                        username: username,
                        base64String: base64String,
                    })

                    notify(response.data.mensagem, '#0080ff')
                } catch (error) {
                    notify('Erro ao enviar a nova foto de perfil.', '#cc0000')
                    console.error('Erro ao enviar a nova foto de perfil:', error)
                }
            }

            reader.onerror = () => {
                console.error('Erro ao ler o arquivo.')
                notify('Erro ao ler arquivo.', '#cc0000')
            }

            reader.readAsDataURL(file)
        }
    }

    useEffect(() => {
        async function getPictureAndRoleSaved() {
            try {
                const response = await axios.get(`http://localhost:8080/usuario/${username}`)

                const { header_image, bytes_image } = response.data.dados
                const { role } = response.data.dados

                if (bytes_image && bytes_image.type === 'Buffer' && Array.isArray(bytes_image.data)) {
                    const buffer = Buffer.from(bytes_image.data)
                    const base64Image = buffer.toString('base64')

                    setProfilePicture(`${header_image},${base64Image}`)
                } else {
                    console.error('Formato inválido de bytes_image:', bytes_image)
                }

                if (role) {
                    setRole(role)
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error)
            }
        }

        getPictureAndRoleSaved()
    }, [username])

  return (
    <>
        <HackerBackground />
        <div className={styles.perfilContainer}>
            <div className={styles.header}>
                <div className={styles.profilePictureWrapper}>
                    <img className={styles.profilePicture} alt="Foto de perfil" src={profilePicture} />
                    {userType != null && userType.username === username && (
                        <>
                            <label htmlFor="changePicture" className={styles.changePictureButton}>
                                Alterar Foto
                            </label>
                            <input
                                id="changePicture"
                                type="file"
                                accept="image/*"
                                className={styles.fileInput}
                                onChange={handleChangePicture}
                            />
                        </>
                    )}
                </div>
                <div className={styles.userInfo}>
                    <h1 className={styles.username}>{username}</h1>
                    <p className={styles.userRole}>{role}</p>
                </div>
            </div>
        </div>
    </>
)

}

export default Perfil
