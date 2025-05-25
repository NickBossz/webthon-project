import React from 'react';
import styles from './Dicas.module.css';

const modulesData = [
  {
    title: 'Senhas Seguras',
    content: `
• Use senhas longas e únicas para cada serviço.
• Combine letras maiúsculas, minúsculas, números e símbolos.
• Prefira gerenciadores de senhas para armazenar e gerar senhas fortes.
`,
  },
  {
    title: 'Reconhecimento de Phishing',
    content: `
• Desconfie de e-mails e links suspeitos.
• Verifique o remetente e evite clicar em links desconhecidos.
• Nunca compartilhe dados sensíveis por formulários não verificados.
`,
  },
  {
    title: 'Quando Usar VPN',
    content: `
• Em redes Wi-Fi públicas para proteger seus dados.
• Para acessar conteúdos restritos geograficamente.
• Ao precisar de privacidade extra e anonimato online.
`,
  },
  
];

export default function Dicas() {
  return (
    <div className={styles.container}>
      <div className={styles.moduleWrapper}>
{modulesData.map((mod, idx) => (
  <div
    key={idx}
    className={styles.module}
    style={{ animationDelay: `${idx * 0.2}s` }}
  >
    <h2 className={styles.title}>{mod.title}</h2>
    <p className={styles.text}>{mod.content}</p>
  </div>
))}


      </div>
    </div>
  );
}
