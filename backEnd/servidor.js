const express = require('express')
const cors = require('cors')
const { spawn } = require('child_process');
const { URL } = require('url');

const servidorBackend = express()
const portaServidorBackend = 8080

const {criarUsuario, coletarUsuarioPeloNome, excluirUsuario, uploadPerfilImage, coletarUsuarios} = require("./CRUDS/CrudUsuarios.js")


function extrairDominio(urlString) {
  try {
    // Adiciona protocolo padrão se não tiver
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = 'http://' + urlString;
    }

    const url = new URL(urlString);
    return url.hostname; // retorna só o domínio, ex: sitechecker.pro
  } catch {
    return null;
  }
}


async function checkSite(url) {
    return new Promise((resolve, reject) => {
        const process = spawn('python', ['SiteChecker.py', url]);

        let resultado = '';
        let erro = '';

        process.stdout.on('data', (data) => {
            resultado += data.toString();
            console.log(resultado)
        });

        process.stderr.on('data', (data) => {
            erro += data.toString();
        });

        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Erro no Python: ${erro}`));
                return;
            }

            try {
                const json = JSON.parse(resultado);
                resolve(json);
            } catch (e) {
                reject(new Error('Falha ao parsear JSON: ' + e.message));
            }
        });
    });
}


servidorBackend.use(express.json({ limit: '50mb' }))
servidorBackend.use(express.urlencoded({ extended: true, limit: '50mb' }))
servidorBackend.use(cors({
    origin: '*',
    allowedHeaders: '*'
}))


servidorBackend.listen(portaServidorBackend,() => console.log(`servidor backend rodando em http://localhost:${portaServidorBackend}`))

// --------------- CALCULADORA DE RISCOS DE SITE ---------------
servidorBackend.post('/check-site', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL não fornecida' });
    }

    const dominio = extrairDominio(url);
    if (!dominio) {
        return res.status(400).json({ error: 'URL inválida' });
    }

    try {
        const resultado = await checkSite(dominio);

        if (resultado && typeof resultado.risco_previsto === 'number') {
            // Arredonda para inteiro e converte para string com '%' se quiser
            resultado.risco_previsto = Math.round(resultado.risco_previsto);
        }

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});



// -------------- USUARIOS --------------
servidorBackend.post('/criarUsuario', async (req, res) => {
    const dados = req.body
    const usuario = await criarUsuario(dados)
    res.status(200).json(usuario)
})

servidorBackend.get('/usuario/:username', async (req, res) => {
    const { username } = req.params
    const usuario = await coletarUsuarioPeloNome(username)
    res.status(200).json(usuario)
})

servidorBackend.get('/usuarios', async (req, res) => {
    const usuarios = await coletarUsuarios()
    res.status(200).json(usuarios)
})


servidorBackend.delete('/excluirUsuario/:username', async (req, res) => {
    const { username } = req.params
    const deletar = await excluirUsuario(username) 
    res.status(200).json(deletar)
})

servidorBackend.post('/uploadperfilimage', async (req, res) => {
    const novosDados = req.body
    console.log(novosDados)
    const resultado = await uploadPerfilImage(novosDados)
    res.json(resultado)
})