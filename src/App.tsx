import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import SpecificGame from './pages/SpecificGame';
import './App.css';

function AppShell() {
  const location = useLocation();
  const isHomeRoute = location.pathname === '/';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return (
    <>
      {/* <Header key={location.pathname} /> */}
      <main className={`app-shell ${isHomeRoute ? 'app-shell--home' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:id" element={<SpecificGame />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <AppShell />
      </div>
    </Router>
  );
}

export default App;
