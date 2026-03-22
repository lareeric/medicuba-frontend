import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing     from './pages/Landing';
import Connexion   from './pages/Connexion';
import Inscription from './pages/Inscription';
import Accueil     from './pages/Accueil';
import Cours       from './pages/Cours';
import Glossaire   from './pages/Glossaire';
import Quiz        from './pages/Quiz';
import Notes       from './pages/Notes';
import Planning    from './pages/Planning';
import LireCours   from './pages/LireCours';

const RoutePivee = ({ children }) => {
  const { utilisateur, chargement } = useAuth();
  if (chargement) return <div>Chargement...</div>;
  return utilisateur ? children : <Navigate to="/connexion" />;
};

function App() {
  return (
    <Routes>
      <Route path="/landing"     element={<Landing />} />
      <Route path="/connexion"   element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/" element={
        <RoutePivee><Accueil /></RoutePivee>
      } />
      <Route path="/cours" element={
        <RoutePivee><Cours /></RoutePivee>
      } />
      <Route path="/cours/:id" element={
        <RoutePivee><LireCours /></RoutePivee>
      } />
      <Route path="/glossaire" element={
        <RoutePivee><Glossaire /></RoutePivee>
      } />
      <Route path="/quiz" element={
        <RoutePivee><Quiz /></RoutePivee>
      } />
      <Route path="/notes" element={
        <RoutePivee><Notes /></RoutePivee>
      } />
      <Route path="/planning" element={
        <RoutePivee><Planning /></RoutePivee>
      } />
    </Routes>
  );
}

export default App;