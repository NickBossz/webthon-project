import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserTypeProvider } from './UserTypeContext.js';
import { NotificationProvider } from './pages/NotificationManager.js';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import PaginaInicial from './pages/paginainicial/PaginaInicial.js';
import Menu from './pages/menu/Menu.js'
import Dicas from './pages/dicas/Dicas.js'
import Perfil from './pages/perfil/Perfil.js';
import CheckerApp from './pages/checkerapp/CheckerApp.js';
import Forum from './pages/forum/Forum.js';

// Componente de efeitos visuais otimizado
const VisualEffects = () => {
  return (
    <>
      {/* Scanline effect - apenas 1 */}
      <motion.div 
        className="scanline"
        animate={{ 
          y: [-100, window.innerHeight + 100],
        }}
        transition={{
          duration: 6, // Aumentado de 4
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Background particles - reduzido para 3 */}
      <div className="background-particles">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            animate={{
              y: [0, -600], // Reduzido de -800
              opacity: [0, 0.5, 0], // Reduzido opacidade
            }}
            transition={{
              duration: 20 + Math.random() * 10, // Aumentado de 15
              repeat: Infinity,
              delay: Math.random() * 5, // Aumentado de 3
            }}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </>
  );
};

// Componente de loading otimizado
const LoadingScreen = () => {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }} // Reduzido de 0.3
    >
      <motion.div
        className="loading-content"
        initial={{ scale: 0.95, opacity: 0 }} // Reduzido de 0.9
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }} // Reduzido de 0.5
      >
        <motion.div
          className="loading-logo"
          animate={{ 
            scale: [1, 1.02, 1] // Reduzido de 1.05
          }}
          transition={{ 
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" } // Aumentado de 2
          }}
        >
          <div className="logo-text">BE SAFE</div>
        </motion.div>
        
        <motion.div
          className="loading-bar"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, ease: "easeInOut" }} // Reduzido de 1.5
        />
        
        <motion.div
          className="loading-text"
          animate={{ opacity: [0.8, 1, 0.8] }} // Reduzido variação
          transition={{ duration: 3, repeat: Infinity }} // Aumentado de 2
        >
          Inicializando...
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reduzido tempo de carregamento
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Reduzido de 1500

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }} // Reduzido de 0.3
          >
            <VisualEffects />
            <Router>
              <Menu />
              <NotificationProvider>
                <motion.div 
                  className="App"
                  initial={{ y: 5, opacity: 0 }} // Reduzido de 10
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.05 }} // Reduzido de 0.4 e 0.1
                >
                  <Routes>
                    <Route path='/' element={<PaginaInicial />} />
                    <Route path='/dicas' element={<Dicas />} />
                    <Route path='/perfil/:username' element={<Perfil />} />
                    <Route path='/checkerApp' element={<CheckerApp />} />
                    <Route path='/forum' element={<Forum />} />
                  </Routes>
                </motion.div>
              </NotificationProvider>
            </Router>
            
            {/* Toast notifications */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 2500, // Reduzido de 3000
                style: {
                  background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)',
                  color: '#00ff00',
                  border: '1px solid #00ff00', // Reduzido de 2px
                  borderRadius: '8px', // Reduzido de 10px
                  fontFamily: 'Courier New, Consolas, Monaco, monospace',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px', // Reduzido de 1px
                  boxShadow: '0 0 15px rgba(0, 255, 0, 0.4)', // Reduzido intensidade
                },
                success: {
                  iconTheme: {
                    primary: '#00ff00',
                    secondary: '#000000',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ff4444',
                    secondary: '#000000',
                  },
                },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const Root = () => (
  <NotificationProvider>
    <UserTypeProvider>
      <App />
    </UserTypeProvider>
  </NotificationProvider>
);

export default Root;