const { Sequelize, DataTypes, Op } = require('sequelize');
const conexaoComBancoDeDados = new Sequelize({
  dialect: 'sqlite',
  storage: 'Database.sqlite',
});

const TabelaPosts = conexaoComBancoDeDados.define('Posts', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  siteName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Positiva', 'Negativa', 'Aviso'),
    allowNull: false,
  },
  authorUsername: { // autor da publicação
    type: DataTypes.STRING(26),
    allowNull: false,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  dislikes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  likedUsers: { // JSON array de usernames que deram like
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('likedUsers');
      return JSON.parse(raw || '[]');
    },
    set(val) {
      this.setDataValue('likedUsers', JSON.stringify(val));
    },
  },
  dislikedUsers: { // JSON array de usernames que deram dislike
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('dislikedUsers');
      return JSON.parse(raw || '[]');
    },
    set(val) {
      this.setDataValue('dislikedUsers', JSON.stringify(val));
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
}, {
  timestamps: false,
  tableName: 'Posts',
});

async function sincronizarBancoDeDados() {
  try {
    await conexaoComBancoDeDados.sync();
    console.log('Banco sincronizado.');
  } catch (e) {
    console.error('Erro ao sincronizar banco: ', e);
  }
}
sincronizarBancoDeDados();

async function criarPost(dados) {
  try {
    // Validação authorUsername
    if (typeof dados.authorUsername !== 'string') {
      throw new Error('authorUsername precisa ser uma string simples');
    }

    const novoPost = await TabelaPosts.create(dados);
    return { dados: novoPost, mensagem: 'Post criado com sucesso!' };
  } catch (err) {
    console.error('Erro ao criar post:', err);
    return { dados: err, mensagem: 'Erro ao criar post.' };
  }
}

async function atualizarPost(id, dados, usuarioAtual) {
  try {
    if (typeof usuarioAtual !== 'string') {
      throw new Error('authorUsername precisa ser uma string simples');
    }

    const post = await TabelaPosts.findByPk(id);
    if (!post) throw new Error('Post não encontrado');
    if (post.authorUsername !== usuarioAtual) throw new Error('Não autorizado');

    // Atualiza apenas siteName, description, category
    await post.update({
      siteName: dados.siteName,
      description: dados.description,
      category: dados.category,
    });
    return { dados: post, mensagem: 'Post atualizado com sucesso!' };
  } catch (err) {
    console.error('Erro ao atualizar post:', err);
    return { dados: err, mensagem: 'Erro ao atualizar post.' };
  }
}

async function excluirPost(id, usuarioAtual) {
  try {
    if (typeof usuarioAtual !== 'string') {
      throw new Error('authorUsername precisa ser uma string simples');
    }

    const post = await TabelaPosts.findByPk(id);
    if (!post) throw new Error('Post não encontrado');
    if (post.authorUsername !== usuarioAtual) throw new Error('Não autorizado');

    await post.destroy();

    return { dados: null, mensagem: 'Post excluído com sucesso!' };
  } catch (err) {
    console.error('Erro ao excluir post:', err);
    return { dados: err, mensagem: 'Erro ao excluir post.' };
  }
}

async function votarPost(id, usuarioAtual, tipo) {
  try {
    if (typeof usuarioAtual !== 'string') {
      throw new Error('authorUsername precisa ser uma string simples');
    }

    const post = await TabelaPosts.findByPk(id);
    if (!post) throw new Error('Post não encontrado');

    let likedUsers = post.likedUsers;
    let dislikedUsers = post.dislikedUsers;

    const jaDeuLike = likedUsers.includes(usuarioAtual);
    const jaDeuDislike = dislikedUsers.includes(usuarioAtual);

    if (tipo === 'like') {
      if (jaDeuLike) {
        likedUsers = likedUsers.filter(u => u !== usuarioAtual);
        post.likes--;
      } else {
        likedUsers.push(usuarioAtual);
        post.likes++;
        if (jaDeuDislike) {
          dislikedUsers = dislikedUsers.filter(u => u !== usuarioAtual);
          post.dislikes--;
        }
      }
    } else if (tipo === 'dislike') {
      if (jaDeuDislike) {
        dislikedUsers = dislikedUsers.filter(u => u !== usuarioAtual);
        post.dislikes--;
      } else {
        dislikedUsers.push(usuarioAtual);
        post.dislikes++;
        if (jaDeuLike) {
          likedUsers = likedUsers.filter(u => u !== usuarioAtual);
          post.likes--;
        }
      }
    } else {
      throw new Error('Tipo inválido');
    }

    post.likedUsers = likedUsers;
    post.dislikedUsers = dislikedUsers;

    await post.save();

    return { dados: post, mensagem: 'Voto registrado com sucesso!' };
  } catch (err) {
    console.error('Erro ao votar post:', err);
    return { dados: err, mensagem: 'Erro ao votar post.' };
  }
}

async function listarPosts(filtroSite = '') {
  try {
    const where = filtroSite
      ? { siteName: { [Op.like]: `%${filtroSite}%` } }
      : {};
    const posts = await TabelaPosts.findAll({ where, order: [['createdAt', 'DESC']] });
    return { dados: posts, mensagem: 'Posts listados com sucesso!' };
  } catch (err) {
    console.error('Erro ao listar posts:', err);
    return { dados: err, mensagem: 'Erro ao listar posts.' };
  }
}

module.exports = {
  criarPost,
  listarPosts,
  atualizarPost,
  excluirPost,
  votarPost,
};
