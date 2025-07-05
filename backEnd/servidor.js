// Carregar variáveis de ambiente
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const { URL } = require('url');
const { IncomingForm } = require('formidable');
const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');
const fs = require('fs').promises;

const servidorBackend = express();
const PORT = process.env.PORT || 8080;
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const VIRUSTOTAL_BASE_URL = 'https://www.virustotal.com/api/v3';

// Validar se a API key está configurada
if (!VIRUSTOTAL_API_KEY) {
  console.error('❌ ERRO: VIRUSTOTAL_API_KEY não está configurada no arquivo .env');
  console.error('Por favor, configure a variável VIRUSTOTAL_API_KEY no arquivo .env');
  process.exit(1);
}

const AXIOS_CONFIG = {
  headers: { 'x-apikey': VIRUSTOTAL_API_KEY },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  timeout: 15000
};

const {
  criarUsuario,
  coletarUsuarioPeloNome,
  excluirUsuario,
  uploadPerfilImage,
  coletarUsuarios
} = require("./CRUDS/CrudUsuarios.js");

const { criarPost, listarPosts, atualizarPost, excluirPost, votarPost } = require('./CRUDS/CrudPosts.js');


// Função auxiliar para extrair domínio de URL
function extrairDominio(urlString) {
  try {
    if (!urlString.match(/^https?:\/\//)) urlString = 'http://' + urlString;
    return new URL(urlString).hostname;
  } catch {
    return null;
  }
}

// Função auxiliar para executar script Python
async function checkSite(url) {
  return new Promise((resolve, reject) => {
    const process = spawn('python', ['SiteChecker.py', url]);
    let resultado = '', erro = '';

    process.stdout.on('data', data => resultado += data.toString());
    process.stderr.on('data', data => erro += data.toString());
    process.on('close', code => {
      if (code !== 0) return reject(new Error(`Erro no Python: ${erro}`));
      try {
        const json = JSON.parse(resultado);
        if (json && typeof json.risco_previsto === 'number') {
          json.risco_previsto = Math.round(json.risco_previsto);
        }
        resolve(json);
      } catch (e) {
        reject(new Error(`Falha ao parsear JSON: ${e.message}`));
      }
    });
  });
}

// Função auxiliar para parsear formulário
async function parseForm(req) {
  const form = new IncomingForm({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024
  });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Erro no parsing do formulário:', err);
        reject(new Error(`Erro no parsing do formulário: ${err.message}`));
      } else {
        resolve({ fields, files });
      }
    });
  });
}

// Função auxiliar para tratar erros
function handleError(error, defaultMessage) {
  console.error(defaultMessage, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    code: error.code
  });
  return error.response?.data?.error?.message || error.message || defaultMessage;
}

// Middleware
servidorBackend.use(express.json({ limit: '50mb' }));
servidorBackend.use(express.urlencoded({ extended: true, limit: '50mb' }));
servidorBackend.use(cors({ origin: '*', allowedHeaders: '*' }));

servidorBackend.listen(PORT, () => {
  console.log('🚀 Servidor backend iniciado com sucesso!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔑 VirusTotal API: ${VIRUSTOTAL_API_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log('📁 Variáveis de ambiente carregadas do arquivo .env');
});

// -------- CHECK-SITE ----------
servidorBackend.post('/check-site', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL não fornecida' });

  const dominio = extrairDominio(url);
  if (!dominio) return res.status(400).json({ error: 'URL inválida' });

  try {
    const resultado = await checkSite(dominio);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: handleError(error, 'Erro ao verificar o site') });
  }
});

// -------- CHECK-FILE ----------
servidorBackend.post("/check-file", async (req, res) => {
  try {
    const { files } = await parseForm(req);
    if (!files.file) {
      console.error('Nenhum arquivo encontrado na requisição');
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    console.log('Arquivo recebido:', {
      originalFilename: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
      filepath: file.filepath
    });

    // Lê o arquivo do caminho temporário
    let fileBuffer;
    try {
      if (!file.filepath) throw new Error('Caminho do arquivo temporário não disponível.');
      fileBuffer = await fs.readFile(file.filepath);
      if (!Buffer.isBuffer(fileBuffer)) throw new Error('Arquivo inválido: buffer de dados não disponível.');
    } catch (err) {
      console.error('Erro ao ler o arquivo temporário:', err);
      throw new Error(`Erro ao ler o arquivo: ${err.message}`);
    }

    // Calcula o hash SHA256
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    try {
      // Envia o arquivo para o VirusTotal
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: file.originalFilename,
        contentType: file.mimetype
      });

      console.log('Enviando arquivo para o VirusTotal...');
      const uploadResponse = await axios.post(
        `${VIRUSTOTAL_BASE_URL}/files`,
        formData,
        { ...AXIOS_CONFIG, headers: { ...AXIOS_CONFIG.headers, ...formData.getHeaders() }, timeout: 60000 }
      );

      const analysisId = uploadResponse.data.data?.id;
      if (!analysisId) {
        console.error('ID de análise não encontrado na resposta:', JSON.stringify(uploadResponse.data, null, 2));
        throw new Error('Resposta inválida do VirusTotal: ID de análise não encontrado');
      }
      console.log('Arquivo enviado, ID da análise:', analysisId);

      // Forçar reanálise
      console.log('Solicitando reanálise do arquivo...');
      await axios.post(
        `${VIRUSTOTAL_BASE_URL}/files/${fileHash}/analyse`,
        {},
        AXIOS_CONFIG
      ).catch(err => {
        console.warn('Aviso: Reanálise pode não ser necessária ou falhou:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
      });

      // Aguarda a análise
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = 5000;
      let analysisResult;

      do {
        if (attempts >= maxAttempts) {
          console.error('Tempo limite excedido para análise do VirusTotal');
          throw new Error('Tempo limite excedido para análise do VirusTotal');
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
        console.log(`Verificando status da análise (tentativa ${attempts + 1})...`);
        analysisResult = await axios.get(`${VIRUSTOTAL_BASE_URL}/analyses/${analysisId}`, AXIOS_CONFIG);

        const status = analysisResult.data.data?.attributes?.status;
        console.log(`Status da análise: ${status}`);
        attempts++;
      } while (analysisResult.data.data?.attributes?.status !== 'completed');


      const resultData = analysisResult.data.data;
      const stats = resultData.attributes?.stats;
      if (!stats) {
        console.error('Estatísticas não encontradas na resposta:', JSON.stringify(analysisResult.data, null, 2));
        throw new Error('Resposta inválida do VirusTotal: estatísticas não disponíveis');
      }

      const sha256 = analysisResult.data.meta?.file_info?.sha256;
      if (!sha256) {
        console.error('SHA256 não encontrado na resposta:', JSON.stringify(analysisResult.data, null, 2));
        throw new Error('Informações do arquivo não disponíveis na resposta do VirusTotal');
      }

      if (sha256 !== fileHash) {
        console.error('Hash retornado pelo VirusTotal não corresponde ao enviado:', { expected: fileHash, received: sha256 });
        throw new Error('O arquivo analisado pelo VirusTotal não corresponde ao arquivo enviado');
      }

      res.json({
        positives: stats.malicious || 0,
        total: Object.values(stats).reduce((a, b) => a + b, 0),
        permalink: `https://www.virustotal.com/gui/file/${sha256}/detection`,
        filename: file.originalFilename
      });
    } catch (error) {
      res.status(500).json({ error: handleError(error, 'Erro ao verificar o arquivo no VirusTotal') });
    } finally {
      if (file.filepath) {
        await fs.unlink(file.filepath).catch(err => console.error('Erro ao remover arquivo temporário:', err));
      }
    }
  } catch (error) {
    res.status(500).json({ error: handleError(error, 'Erro ao processar o arquivo') });
  }
});

// -------- USUÁRIOS ----------
servidorBackend.post('/criarUsuario', async (req, res) => {
  try {
    const usuario = await criarUsuario(req.body);
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: handleError(error, 'Erro ao criar usuário') });
  }
});

servidorBackend.get('/usuario/:username', async (req, res) => {
  try {
    const usuario = await coletarUsuarioPeloNome(req.params.username);
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: handleError(error, 'Erro ao coletar usuário') });
  }
});

servidorBackend.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await coletarUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: handleError(error, 'Erro ao coletar usuários') });
  }
});

servidorBackend.delete('/excluirUsuario/:username', async (req, res) => {
  try {
    const resultado = await excluirUsuario(req.params.username);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: handleError(error, 'Erro ao excluir usuário') });
  }
});

servidorBackend.post('/uploadperfilimage', async (req, res) => {
  try {
    const resultado = await uploadPerfilImage(req.body);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: handleError(error, 'Erro ao fazer upload da imagem de perfil') });
  }
});

servidorBackend.get('/posts', async (req, res) => {
  const filtro = req.query.site || '';
  const resultado = await listarPosts(filtro);
  if (resultado.dados instanceof Error) return res.status(500).json({ error: resultado.mensagem });
  res.json(resultado.dados);
});

servidorBackend.post('/posts', async (req, res) => {
  const dados = req.body;
  // Verifica se usuario enviou username autor
  if (!dados.authorUsername) return res.status(400).json({ error: 'Usuário não autenticado' });
  const resultado = await criarPost(dados);
  if (resultado.dados instanceof Error) return res.status(500).json({ error: resultado.mensagem });
  res.status(201).json(resultado.dados);
});

servidorBackend.put('/posts/:id', async (req, res) => {
  const id = req.params.id;
  const dados = req.body;
  const usuarioAtual = req.body.authorUsername;
  if (!usuarioAtual) return res.status(400).json({ error: 'Usuário não autenticado' });

  const resultado = await atualizarPost(id, dados, usuarioAtual);
  if (resultado.dados instanceof Error) return res.status(403).json({ error: resultado.mensagem });
  res.json(resultado.dados);
});

servidorBackend.delete('/posts/:id', async (req, res) => {
  const id = req.params.id;
  const usuarioAtual = req.body.authorUsername;
  if (!usuarioAtual) return res.status(400).json({ error: 'Usuário não autenticado' });

  const resultado = await excluirPost(id, usuarioAtual);
  if (resultado.dados instanceof Error) return res.status(403).json({ error: resultado.mensagem });
  res.json({ mensagem: resultado.mensagem });
});

servidorBackend.post('/posts/:id/vote', async (req, res) => {
  const id = req.params.id;
  const { authorUsername, type } = req.body; // type = 'like' ou 'dislike'
  if (!authorUsername) return res.status(400).json({ error: 'Usuário não autenticado' });
  if (!['like', 'dislike'].includes(type)) return res.status(400).json({ error: 'Tipo inválido' });

  const resultado = await votarPost(id, authorUsername, type);
  if (resultado.dados instanceof Error) return res.status(400).json({ error: resultado.mensagem });
  res.json(resultado.dados);
});

// Retorna posts do usuário pelo username autor
servidorBackend.get('/forum/posts/:username', async (req, res) => {
  const username = req.params.username;
  if (!username) return res.status(400).json({ error: 'Usuário não fornecido' });

  try {
    const resultado = await listarPosts(); // busca todos
    if (resultado.dados instanceof Error) {
      return res.status(500).json({ error: resultado.mensagem });
    }
    // Filtra somente posts do usuário
    const userPosts = resultado.dados.filter(post => post.authorUsername === username);

    res.json({ posts: userPosts });
  } catch (error) {
    console.error('Erro ao buscar posts do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar posts do usuário' });
  }
});
