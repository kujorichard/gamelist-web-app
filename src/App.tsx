import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import PickAGame from './pages/PickAGame';
import SpecificGame from './pages/SpecificGame';
import './App.css';

function AppShell() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pick-a-game" element={<PickAGame />} />
      <Route path="/game/:id" element={<SpecificGame />} />
    </Routes>
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
