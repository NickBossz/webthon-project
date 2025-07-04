import React, { useState, useEffect } from 'react'
import axios from 'axios'
import styles from './Perfil.module.css'
import { Buffer } from 'buffer'
import { useNotifications } from '../NotificationManager.js'
import { useParams } from 'react-router-dom'
import { useUserType } from '../../UserTypeContext.js'

function Perfil() {
  const { username } = useParams()
  const [role, setRole] = useState('')
  const [profilePicture, setProfilePicture] = useState()
  const [posts, setPosts] = useState([])
  const { userType } = useUserType()
  const { addNotification } = useNotifications()

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

          addNotification(response.data.mensagem, 'success')
        } catch (error) {
          addNotification('Erro ao enviar a nova foto de perfil.', 'error')
          console.error('Erro ao enviar a nova foto de perfil:', error)
        }
      }

      reader.onerror = () => {
        console.error('Erro ao ler o arquivo.')
        addNotification('Erro ao ler arquivo.', 'error')
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

    async function getUserPosts() {
      try {
        const response = await axios.get(`http://localhost:8080/forum/posts/${username}`)
        setPosts(response.data.posts || [])
      } catch (error) {
        console.error('Erro ao buscar publicações do usuário:', error)
      }
    }

    getPictureAndRoleSaved()
    getUserPosts()
  }, [username])

  return (
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

      <div className={styles.forumSection}>
        <h2 className={styles.forumTitle}>Posts de {username}</h2>
        {posts.length === 0 && <p className={styles.noPosts}>Nenhuma publicação encontrada.</p>}

        {posts.map((post) => (
          <div key={post.id} className={styles.forumPost}>
            <div className={styles.forumHeader}>
              <span className={styles.forumUsername}>{post.authorUsername}</span>
              <span className={styles.forumDate}>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <div className={styles.forumContent}>{post.description}</div>
            <div className={styles.forumVotes}>
              <span>👍 {post.likes}</span>
              <span>👎 {post.dislikes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Perfil
