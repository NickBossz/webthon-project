import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserTypeProvider } from './UserTypeContext.js';
import {NotificationProvider} from './pages/NotificationManager.js';
import PaginaInicial from './pages/paginainicial/PaginaInicial.js';
import Menu from './pages/menu/Menu.js'
import Dicas from './pages/dicas/Dicas.js'
import SiteChecker from './pages/sitechecker/SiteChecker.js';
import FileChecker from './pages/filechecker/FileChecker.js';
import Perfil from './pages/perfil/Perfil.js';
import CheckerApp from './pages/checkerapp/CheckerApp.js';

function App() {
  return (


    <Router>
      <Menu/>
      <NotificationProvider>
      <div className="App">
        <Routes>
          <Route path='/' element={<PaginaInicial />}></Route>
          <Route path='/dicas' element={<Dicas />}></Route>
          <Route path='/siteChecker' element={<SiteChecker />}></Route>
          <Route path='/perfil/:username' element={<Perfil />}></Route>
          <Route path='/fileChecker' element={<FileChecker />}></Route>
          <Route path='/checkerApp' element={<CheckerApp />}></Route>

        </Routes>
      </div>
      </NotificationProvider>
    </Router>

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