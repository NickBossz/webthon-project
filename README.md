# 🛡️ BE SAFE - Plataforma de Segurança Digital

[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.0.0-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)

Uma plataforma completa de segurança digital com tema hacker, oferecendo verificação de URLs, análise de arquivos, fórum de discussão e dicas de segurança.

## 🚀 Funcionalidades

### 🔍 **Checker App**
- **Verificação de URLs**: Análise de segurança usando VirusTotal e IA
- **Verificação de Arquivos**: Detecção de malware com sistema de score inteligente
- **Interface Moderna**: Drag & drop para upload de arquivos
- **Resultados Detalhados**: Relatórios completos com explicações

### 💬 **Fórum de Segurança**
- **Avaliação de Sites**: Sistema de categorias (Positiva, Negativa, Aviso)
- **Filtros Avançados**: Busca por site, categoria e ordenação
- **Sistema de Votos**: Like/Dislike nas publicações
- **Interface Responsiva**: Funciona perfeitamente em mobile

### 💡 **Dicas de Segurança**
- **Conteúdo Educativo**: Dicas práticas de segurança digital
- **Interface Interativa**: Design moderno e intuitivo
- **Categorização**: Organização por temas de segurança

### 👤 **Sistema de Usuários**
- **Registro e Login**: Sistema completo de autenticação
- **Perfis Personalizados**: Upload de foto de perfil
- **Histórico de Atividades**: Posts e interações do usuário

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18** - Framework principal
- **Framer Motion** - Animações suaves
- **React Router** - Navegação
- **React Hot Toast** - Notificações
- **Lucide React** - Ícones modernos
- **CSS Modules** - Estilização modular

### **Backend**
- **Node.js** - Servidor JavaScript
- **Express.js** - Framework web
- **SQLite** - Banco de dados
- **Sequelize** - ORM
- **Python** - Scripts de análise
- **VirusTotal API** - Verificação de segurança

### **APIs Externas**
- **VirusTotal** - Análise de URLs e arquivos
- **Machine Learning** - Predição de risco

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ 
- Python 3.8+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/be-safe.git
cd be-safe
```

### 2. Instale as dependências do Frontend
```bash
npm install
```

### 3. Instale as dependências do Backend
```bash
cd backEnd
npm install
```

### 4. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
VIRUSTOTAL_API_KEY=sua_chave_api_aqui
```

### 5. Execute o projeto

**Terminal 1 - Backend:**
```bash
cd backEnd
node servidor.js
```

**Terminal 2 - Frontend:**
```bash
npm start
```

O projeto estará disponível em `http://localhost:3000`

## 🎨 Características do Design

### **Tema Hacker**
- **Cores Neon**: Verde (#00ff00), Ciano (#00ffff), Magenta (#ff00ff)
- **Tipografia**: Courier New para efeito terminal
- **Efeitos Visuais**: Scanlines, partículas, gradientes
- **Animações**: Transições suaves e responsivas

### **Interface Responsiva**
- **Desktop**: Layout completo com sidebar
- **Tablet**: Adaptação automática
- **Mobile**: Menu hambúrguer e layout otimizado

## 🔧 Estrutura do Projeto

```
webthon/
├── src/                          # Frontend React
│   ├── pages/                    # Componentes de páginas
│   │   ├── checkerapp/           # Verificador de URLs/Arquivos
│   │   ├── forum/                # Fórum de discussão
│   │   ├── dicas/                # Dicas de segurança
│   │   ├── perfil/               # Perfil do usuário
│   │   ├── login/                # Sistema de login
│   │   └── menu/                 # Menu de navegação
│   ├── App.js                    # Componente principal
│   └── UserTypeContext.js        # Contexto de usuário
├── backEnd/                      # Backend Node.js
│   ├── CRUDS/                    # Operações de banco
│   │   ├── CrudPosts.js          # CRUD de posts
│   │   └── CrudUsuarios.js       # CRUD de usuários
│   ├── servidor.js               # Servidor principal
│   └── SiteChecker.py            # Script Python
├── public/                       # Arquivos estáticos
└── README.md                     # Este arquivo
```

## 🚀 Como Usar

### **Verificação de URLs**
1. Acesse o "Checker App"
2. Selecione "Verificar URL"
3. Cole a URL suspeita
4. Aguarde a análise
5. Veja o relatório detalhado

### **Verificação de Arquivos**
1. Acesse o "Checker App"
2. Selecione "Verificar Arquivo"
3. Arraste e solte o arquivo (máx. 50MB)
4. Aguarde a análise no VirusTotal
5. Veja o score de segurança

### **Fórum**
1. Acesse o "Fórum"
2. Use os filtros para encontrar posts
3. Crie uma nova publicação
4. Vote nas publicações dos outros

## 🔒 Segurança

- **Validação de Entrada**: Todos os dados são validados
- **Sanitização**: Proteção contra XSS e injeção
- **Rate Limiting**: Proteção contra spam
- **HTTPS**: Recomendado para produção

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)

## 🙏 Agradecimentos

- **VirusTotal** pela API de análise de segurança
- **React Team** pelo framework incrível
- **Comunidade Open Source** por todas as bibliotecas utilizadas

## 📊 Status do Projeto

![GitHub last commit](https://img.shields.io/github/last-commit/seu-usuario/be-safe)
![GitHub issues](https://img.shields.io/github/issues/seu-usuario/be-safe)
![GitHub pull requests](https://img.shields.io/github/issues-pr/seu-usuario/be-safe)
![GitHub stars](https://img.shields.io/github/stars/seu-usuario/be-safe)

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!**
