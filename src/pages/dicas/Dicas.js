import React, { useState } from 'react';
import styles from './Dicas.module.css';

const modulesData = [
  {
    id: 'senhas',
    title: 'Senhas Seguras',
    content: `
• Use senhas longas e únicas para cada serviço.
• Combine letras maiúsculas, minúsculas, números e símbolos.
• Prefira gerenciadores de senhas para armazenar e gerar senhas fortes.
`,
  },
  {
    id: 'phishing',
    title: 'Reconhecimento de Phishing',
    content: `
• Desconfie de e-mails e links suspeitos.
• Verifique o remetente e evite clicar em links desconhecidos.
• Nunca compartilhe dados sensíveis por formulários não verificados.
`,
  },
  {
    id: 'vpn',
    title: 'Quando Usar VPN',
    content: `
• Em redes Wi-Fi públicas para proteger seus dados.
• Para acessar conteúdos restritos geograficamente.
• Ao precisar de privacidade extra e anonimato online.
`,
  },
  {
    id: 'ameacas',
    title: 'Tipos de Ameaças Digitais',
    content: `
• Malware: programas maliciosos que danificam ou controlam sistemas.
• Ransomware: bloqueia acesso a arquivos e exige resgate.
• Keyloggers: capturam tudo que você digita.
• Engenharia social: manipulação psicológica para obter informações.
• Spoofing: falsificação de identidade em e-mails ou sites.
`,
  },
  {
    id: 'glossario',
    title: 'Glossário de Cibersegurança',
    content: `
• HTTPS: protocolo seguro para sites.
• 2FA: autenticação de dois fatores, adiciona uma camada de segurança.
• Firewall: barreira entre seu dispositivo e a internet para filtrar acessos.
• Criptografia: técnica de codificação de dados.
• IP Spoofing: falsificação de endereço IP para enganar sistemas.
`,
  },
];

export default function Dicas() {
  const [activeModule, setActiveModule] = useState(modulesData[0]);

  return (
    <div className={styles.containerGrid}>
      <aside className={styles.sidebar}>
        {modulesData.map((mod) => (
          <button
            key={mod.id}
            className={`${styles.sidebarButton} ${activeModule.id === mod.id ? styles.active : ''}`}
            onClick={() => setActiveModule(mod)}
          >
            {mod.title}
          </button>
        ))}
      </aside>

      <main className={styles.moduleArea}>
        <div className={styles.module}>
          <h2 className={styles.title}>{activeModule.title}</h2>
          <p className={styles.text}>{activeModule.content}</p>
        </div>
      </main>
    </div>
  );
}
