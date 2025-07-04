import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Forum.module.css';
import { useUserType } from '../../UserTypeContext.js';
import { useNotifications } from '../NotificationManager.js';
import { Buffer } from 'buffer';
import { Search, Filter, SortAsc, SortDesc, Plus, ThumbsUp, ThumbsDown, Edit, Trash, Shield, AlertTriangle, XCircle } from 'lucide-react';

export default function Forum() {
  const { userType } = useUserType();
  const { addNotification } = useNotifications();

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
      const [category, setCategory] = useState('Positiva');
  const [editingPost, setEditingPost] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [authorPhotos, setAuthorPhotos] = useState({});

  const DESCRIPTION_MAX_LENGTH = 75;

  const categories = [
    { value: 'all', label: 'Todas', icon: Shield },
    { value: 'Positiva', label: 'Positivas', icon: ThumbsUp },
    { value: 'Negativa', label: 'Negativas', icon: ThumbsDown },
    { value: 'Aviso', label: 'Avisos', icon: AlertTriangle }
  ];

  const sortOptions = [
    { value: 'date', label: 'Data' },
    { value: 'likes', label: 'Curtidas' },
    { value: 'dislikes', label: 'Não Curtidas' },
    { value: 'author', label: 'Autor' },
    { value: 'siteName', label: 'Nome do Site' }
  ];

  function montarImagem(header_image, bytes_image) {
    if (
      bytes_image &&
      bytes_image.type === 'Buffer' &&
      Array.isArray(bytes_image.data)
    ) {
      const buffer = Buffer.from(bytes_image.data);
      const base64 = buffer.toString('base64');
      if (header_image && header_image.startsWith('data:image')) {
        return `${header_image},${base64}`;
      } else {
        return `data:image/png;base64,${base64}`;
      }
    }
    return null;
  }

  const fetchPosts = useCallback(async (filter = '') => {
    try {
      const res = await axios.get('http://localhost:8080/posts', {
        params: { site: filter }
      });
      setPosts(res.data);

      const uniqueAuthors = [...new Set(res.data.map(post => post.authorUsername))];
      const photos = {};

      await Promise.all(
        uniqueAuthors.map(async (username) => {
          try {
            const response = await axios.get(`http://localhost:8080/usuario/${username}`);
            const { header_image, bytes_image } = response.data.dados;
            const imgSrc = montarImagem(header_image, bytes_image);
            if (imgSrc) photos[username] = imgSrc;
            else photos[username] = null;
          } catch (err) {
            console.error(`Erro ao buscar foto do usuário ${username}:`, err);
            photos[username] = null;
          }
        })
      );

      setAuthorPhotos(photos);
    } catch (err) {
      console.error('Erro ao buscar posts:', err);
      addNotification('Erro ao buscar publicações', 'error');
    }
  }, [addNotification]);

  // Filtrar e ordenar posts
  useEffect(() => {
    let filtered = [...posts];

    // Filtrar por categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => post.category === categoryFilter);
    }

    // Filtrar por busca
    if (search.trim()) {
      filtered = filtered.filter(post => 
        post.siteName.toLowerCase().includes(search.toLowerCase()) ||
        post.description.toLowerCase().includes(search.toLowerCase()) ||
        post.authorUsername.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'likes':
          aValue = a.likes || 0;
          bValue = b.likes || 0;
          break;
        case 'dislikes':
          aValue = a.dislikes || 0;
          bValue = b.dislikes || 0;
          break;
        case 'author':
          aValue = a.authorUsername.toLowerCase();
          bValue = b.authorUsername.toLowerCase();
          break;
        case 'siteName':
          aValue = a.siteName.toLowerCase();
          bValue = b.siteName.toLowerCase();
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPosts(filtered);
  }, [posts, search, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function openModalForNew() {
    if (!userType?.username) {
      addNotification('Você precisa estar logado para criar uma publicação.', 'error');
      return;
    }
    setEditingPost(null);
    setSiteName('');
    setDescription('');
            setCategory('Positiva');
    setModalOpen(true);
  }

  function openModalForEdit(post) {
    if (!userType?.username || userType.username !== post.authorUsername) {
      addNotification('Você só pode editar suas próprias publicações.', 'error');
      return;
    }
    setEditingPost(post);
    setSiteName(post.siteName);
    setDescription(post.description);
    setCategory(post.category);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userType?.username) {
      addNotification('Você precisa estar logado para publicar.', 'error');
      return;
    }
    if (!siteName.trim() || !description.trim()) {
      addNotification('Preencha todos os campos.', 'error');
      return;
    }

    const payload = {
      siteName: siteName.trim(),
      description: description.trim(),
      category,
      authorUsername: userType.username,
    };

    try {
      if (editingPost) {
        await axios.put(`http://localhost:8080/posts/${editingPost.id}`, payload);
        addNotification('Publicação atualizada com sucesso!', 'success');
      } else {
        await axios.post('http://localhost:8080/posts', payload);
        addNotification('Publicação criada com sucesso!', 'success');
      }
      fetchPosts(search);
      setModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar post:', err);
      addNotification('Erro ao salvar publicação.', 'error');
    }
  }

  async function handleDelete(id) {
    if (!userType?.username) {
      addNotification('Você precisa estar logado para excluir publicações.', 'error');
      return;
    }
    if (!window.confirm('Confirma exclusão da publicação?')) return;
    try {
      await axios.delete(`http://localhost:8080/posts/${id}`, { data: { authorUsername: userType.username } });
      addNotification('Publicação excluída com sucesso!', 'success');
      fetchPosts(search);
    } catch (err) {
      console.error('Erro ao excluir post:', err);
      addNotification('Erro ao excluir publicação.', 'error');
    }
  }

  async function handleVote(id, tipo) {
    if (!userType?.username) {
      addNotification('Você precisa estar logado para votar.', 'error');
      return;
    }
    try {
      await axios.post(`http://localhost:8080/posts/${id}/vote`, {
        authorUsername: userType.username,
        type: tipo,
      });
      fetchPosts(search);
      addNotification(`Você ${tipo === 'like' ? 'curtiu' : 'não gostou'} a publicação.`, 'success');
    } catch (err) {
      console.error('Erro ao votar:', err);
      addNotification('Erro ao registrar voto.', 'error');
    }
  }

  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  function clearFilters() {
    setSearch('');
    setCategoryFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Positiva':
        return <ThumbsUp size={16} />;
      case 'Negativa':
        return <ThumbsDown size={16} />;
      case 'Aviso':
        return <AlertTriangle size={16} />;
      default:
        return <Shield size={16} />;
    }
  };

  const getCategoryClass = (category) => {
    switch (category) {
      case 'Positiva':
        return 'positive';
      case 'Negativa':
        return 'negative';
      case 'Aviso':
        return 'warning';
      default:
        return 'positive';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.forumTitle}>Fórum de Avaliação de Sites</h2>
        <div className={styles.stats}>
          <span>{filteredPosts.length} publicações</span>
          {categoryFilter !== 'all' && (
            <span className={styles.activeFilter}>
              Filtro: {categories.find(c => c.value === categoryFilter)?.label}
            </span>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search size={20} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Pesquisar por site, descrição ou autor..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <button 
            className={styles.filterToggle}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label>Categoria:</label>
              <div className={styles.categoryButtons}>
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      className={`${styles.categoryButton} ${categoryFilter === cat.value ? styles.active : ''}`}
                      onClick={() => setCategoryFilter(cat.value)}
                    >
                      <Icon size={16} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Ordenar por:</label>
              <div className={styles.sortControls}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  className={styles.sortOrderButton}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                </button>
              </div>
            </div>

            <button className={styles.clearFiltersButton} onClick={clearFilters}>
              <XCircle size={16} />
              Limpar Filtros
            </button>
          </div>
        )}

        <button className={styles.newPostButton} onClick={openModalForNew}>
          <Plus size={20} />
          Nova Publicação
        </button>
      </div>

      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>{editingPost ? 'Editar Publicação' : 'Nova Publicação'}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label>
                Nome do Site:
                <input
                  type="text"
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  required
                />
              </label>
              <label>
                Descrição:
                <textarea
                  value={description}
                  onChange={e => {
                    if (e.target.value.length <= DESCRIPTION_MAX_LENGTH) {
                      setDescription(e.target.value);
                    }
                  }}
                  required
                />
                <small className={styles.charCount}>
                  {description.length} / {DESCRIPTION_MAX_LENGTH} caracteres
                </small>
              </label>
              <label>
                Categoria:
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="Positiva">Positiva</option>
                  <option value="Negativa">Negativa</option>
                  <option value="Aviso">Aviso</option>
                </select>
              </label>
              <div className={styles.formButtons}>
                <button type="submit" className={styles.submitButton}>
                  {editingPost ? 'Salvar' : 'Publicar'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className={styles.noPosts}>
          <p>Nenhuma publicação encontrada.</p>
          {search || categoryFilter !== 'all' ? (
            <button onClick={clearFilters} className={styles.clearFiltersButton}>
              Limpar filtros
            </button>
          ) : null}
        </div>
      ) : (
        <div className={styles.postsGrid}>
          {filteredPosts.map(post => (
            <div key={post.id} className={styles.forumPost}>
              <div className={styles.postHeader}>
                <div className={styles.authorInfo}>
                  <img
                    src={authorPhotos[post.authorUsername] || '/default-profile.png'}
                    alt={`Foto de perfil de ${post.authorUsername}`}
                    className={styles.authorPhoto}
                  />
                  <div className={styles.authorDetails}>
                    <span className={styles.authorName}>{post.authorUsername}</span>
                    <span className={styles.postDate}>
                      {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div className={`${styles.categoryBadge} ${styles[getCategoryClass(post.category)]}`}>
                  {getCategoryIcon(post.category)}
                  <span>{post.category}</span>
                </div>
              </div>

              <div className={styles.postContent}>
                <h3 className={styles.siteName}>{post.siteName}</h3>
                <p className={styles.description}>{post.description}</p>
              </div>

              <div className={styles.postActions}>
                <div className={styles.voteButtons}>
                  <button 
                    onClick={() => handleVote(post.id, 'like')} 
                    className={styles.voteButton}
                  >
                    <ThumbsUp size={16} />
                    <span>{post.likes || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleVote(post.id, 'dislike')} 
                    className={styles.voteButton}
                  >
                    <ThumbsDown size={16} />
                    <span>{post.dislikes || 0}</span>
                  </button>
                </div>

                {userType?.username === post.authorUsername && (
                  <div className={styles.editDeleteButtons}>
                    <button 
                      onClick={() => openModalForEdit(post)} 
                      className={styles.editButton}
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)} 
                      className={styles.deleteButton}
                    >
                      <Trash size={16} />
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
