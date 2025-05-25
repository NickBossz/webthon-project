const express = require('express')
const cors = require('cors')
const servidorBackend = express()

const portaServidorBackend = 8080

servidorBackend.use(express.json({ limit: '50mb' }))
servidorBackend.use(express.urlencoded({ extended: true, limit: '50mb' }))
servidorBackend.use(cors({
    origin: '*',
    allowedHeaders: '*'
}))

servidorBackend.listen(portaServidorBackend,() => console.log(`servidor backend rodando em http://localhost:${portaServidorBackend}`))

// --------------- CALCULADORA DE RISCOS DE SITE ---------------
servidorBackend.get('/jogos', async (requisicao, resposta) => {

})