const {Sequelize, DataTypes} = require('sequelize')
const fs = require('fs')
const path = require('path')
const conexaoComBancoDeDados = new Sequelize({
    dialect: 'sqlite',
    storage: 'Database.sqlite'
})

const TabelaUsuarios = conexaoComBancoDeDados.define('Users', {
    username: {
        type: DataTypes.STRING(26),
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    header_image: {
        type: DataTypes.STRING
    },
    bytes_image: {
        type: DataTypes.BLOB
    }
})


function getBase64FromFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err)
            }
            const base64String = data.toString('base64')

            const mimeType = getMimeType(filePath)

            const base64WithHeader = `data:${mimeType};base64,${base64String}`

            resolve(base64WithHeader)
        })
    })
}

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase()
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg'
        case '.png':
            return 'image/png'
        case '.gif':
            return 'image/gif'
        case '.txt':
            return 'text/plain'
        case '.pdf':
            return 'application/pdf'
        default:
            return 'application/octet-stream'
    }
}

async function sincronizarBancoDeDados() {
    try { 
        await conexaoComBancoDeDados.sync()
    } catch(e) {
        console.log('Ocorreu um erro ao sincronizar o banco de dados ' + e)
    }
}
sincronizarBancoDeDados()

async function criarUsuario(dados){

    try {
        const base64DefaultImage = await getBase64FromFile("./fotoPerfil.png")

        dados.role = "User"
        dados.header_image = base64DefaultImage.split(',')[0]
        dados.bytes_image = Buffer.from(base64DefaultImage.split(',')[1], 'base64')
        

        const usuarioCadastrado = await TabelaUsuarios.create(dados)

        

        return {
            dados: usuarioCadastrado,
            mensagem: "Usuário criado com sucesso!"
        }
        
    } catch (err) {

        console.log("Erro ao criar usuário: " + err)
        return {
            dados: err,
            mensagem: "Erro ao criar usuário."
        }

    }

}

async function coletarUsuarioPeloNome(nomeDeUsuario){

    try {
        const usuario = await TabelaUsuarios.findByPk(nomeDeUsuario)

        console.log("Usuário coletado com sucesso!")

        return {
            dados: usuario,
            mensagem: "Usuário coletado com sucesso!"
        }
    } catch (err) {
        
        console.error('Erro ao coletar usuário:', err)
        return {
            dados: err,
            mensagem: "Erro ao coletar usuário."
        }
    }
}

async function excluirUsuario(id) {
    try {
        const deletar = TabelaUsuarios.destroy({
            where: {id: id}
        })

        console.log('Usuário removido com sucesso.')

        return {
            dados: deletar,
            mensagem: "Usuário removido com sucesso."
        }
    } catch (err) {
        console.log("Erro ao remover avaliação: " + err)
        return {
            dados: err,
            mensagem: "Erro ao remover avaliação."
        }
    }
}

async function uploadPerfilImage(dados) {
    try {
        const usuario = await TabelaUsuarios.findByPk(dados.username)

        if (!usuario) {
            throw new Error("Usuário não encontrado")
        }

        const bytes_image = Buffer.from(dados.base64String.split(',')[1], 'base64')
        const header_image = dados.base64String.split(',')[0]

        await usuario.update({
            bytes_image: bytes_image,
            header_image: header_image
        })

        return {
            dados: usuario,
            mensagem: "Sucesso em editar usuário."
        }
    } catch (err) {
        console.error("Erro ao editar usuário: ", err)
        return {
            dados: err,
            mensagem: "Erro ao editar usuário."
        }
    }
}

async function coletarUsuarios() {

    try {
        const dados = await TabelaUsuarios.findAll()

        return {
            dados: dados,
            mensagem: "Sucesso em coletar usuarios."
        }
    } catch(err){
        console.error('Erro ao coletar usuarios:', err)
        return {
            dados: err,
            mensagem: "Erro ao coletar usuarios."
        }
    }

}

module.exports = {
    criarUsuario,
    coletarUsuarioPeloNome,
    excluirUsuario,
    uploadPerfilImage,
    coletarUsuarios
}