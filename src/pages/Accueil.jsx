import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVersetDuJour, getCours } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Accueil() {
  const { utilisateur, logout }   = useAuth();
  const [verset, setVerset]       = useState(null);
  const [cours, setCours]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const navigate                  = useNavigate();

  useEffect(() => {
    const charger = async () => {
      try {
        const [versetRes, coursRes] = await Promise.all([
          getVersetDuJour(),
          getCours({ annee: utilisateur.annee_etudes }),
        ]);
        setVerset(versetRes.data);
        setCours(coursRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, []);

  const handleLogout = () => { logout(); navigate('/landing'); };

  const handleNav = (item) => {
    if (item === 'Cours')     navigate('/cours');
    if (item === 'Quiz')      navigate('/quiz');
    if (item === 'Glossaire') navigate('/glossaire');
    if (item === 'Notes')     navigate('/notes');
    if (item === 'Planning')  navigate('/planning');
  };

  const matieres = [...new Set(cours.map(c => c.matiere))];

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingSpinner} />
      <p style={{ color: '#6b7280', marginTop: 12 }}>Chargement...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .nav-item:hover { background: rgba(255,255,255,0.12) !important; color: #fff !important; }
        .cours-card:hover { border-color: #534AB7 !important; transform: translateY(-2px) !important; box-shadow: 0 4px 20px rgba(83,74,183,0.1) !important; }
        .cours-card { transition: all 0.2s ease !important; }
      `}</style>

      <div style={styles.layout}>

        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTop}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>M</div>
              <span style={styles.logoText}>MediCuba ES</span>
            </div>
            <nav style={styles.nav}>
              {['Accueil', 'Cours', 'Quiz', 'Glossaire', 'Notes', 'Planning'].map(item => (
                <div
                  key={item}
                  className="nav-item"
                  style={{
                    ...styles.navItem,
                    ...(item === 'Accueil' ? styles.navItemActif : {})
                  }}
                  onClick={() => handleNav(item)}
                >
                  <span style={styles.navIcon}>
                    {item === 'Accueil'   ? '🏠' :
                     item === 'Cours'     ? '📚' :
                     item === 'Quiz'      ? '🧠' :
                     item === 'Glossaire' ? '📖' :
                     item === 'Notes'     ? '✏️' : '📅'}
                  </span>
                  {item}
                </div>
              ))}
            </nav>
          </div>
          <div style={styles.sidebarBottom}>
            <div style={styles.userCard}>
              <div style={styles.userAvatar}>{utilisateur?.prenom?.[0]}</div>
              <div>
                <div style={styles.userName}>{utilisateur?.prenom}</div>
                <div style={styles.userAnnee}>{utilisateur?.annee_etudes}e année · MINSAP</div>
              </div>
            </div>
            <button style={styles.logoutBtn} onClick={handleLogout}>Déconnexion</button>
          </div>
        </aside>

        {/* Main */}
        <main style={styles.main}>

          {/* Hero header */}
          <div style={styles.heroHeader}>
            <div style={styles.heroBg} />
            <div style={styles.heroContent}>
              <div style={styles.heroLeft}>
                <h1 style={styles.heroTitle}>
                  Bonjour {utilisateur?.prenom} 👋
                </h1>
                <p style={styles.heroDate}>
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div style={styles.heroBadges}>
                  <span style={styles.heroBadge}>{cours.length} cours disponibles</span>
                  <span style={styles.heroBadge}>{matieres.length} matières</span>
                </div>
              </div>
              <div style={styles.heroRight}>
                <div style={styles.quickActions}>
                  <button style={styles.quickBtn} onClick={() => navigate('/cours')}>📚 Voir les cours</button>
                  <button style={styles.quickBtn} onClick={() => navigate('/planning')}>📅 Mon planning</button>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.contentGrid}>

            {/* Colonne gauche */}
            <div style={styles.colLeft}>

              {/* Verset du jour */}
              {verset && (
                <div style={{ ...styles.card, ...styles.versetCard, animation: 'fadeUp 0.5s ease forwards' }}>
                  <div style={styles.versetHeader}>
                    <span style={styles.versetIcon}>✝️</span>
                    <span style={styles.versetLabel}>Verset du jour</span>
                  </div>
                  <p style={styles.versetTexte}>"{verset.texte_fr}"</p>
                  <p style={styles.versetRef}>{verset.reference}</p>
                  {verset.texte_es && (
                    <p style={styles.versetEs}>"{verset.texte_es}"</p>
                  )}
                </div>
              )}

              {/* Stats */}
              <div style={styles.statsGrid}>
                {[
                  { n: cours.length, l: 'Cours disponibles', c: '#534AB7', bg: '#EEEDFE' },
                  { n: matieres.length, l: 'Matières', c: '#1D9E75', bg: '#E1F5EE' },
                  { n: '0', l: 'Cours terminés', c: '#F97316', bg: '#FFF3E0' },
                ].map(s => (
                  <div key={s.l} style={{ ...styles.statCard, borderTop: `3px solid ${s.c}` }}>
                    <div style={{ ...styles.statNum, color: s.c }}>{s.n}</div>
                    <div style={styles.statLabel}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Matières */}
              <div style={{ ...styles.card, animation: 'fadeUp 0.6s ease 0.1s forwards', opacity: 0 }}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Matières de {utilisateur?.annee_etudes}e année</h3>
                </div>
                <div style={styles.matiereGrid}>
                  {matieres.map((m, i) => (
                    <div
                      key={m}
                      style={{ ...styles.matierePill, borderLeft: `3px solid ${i % 2 === 0 ? '#534AB7' : '#F97316'}` }}
                      onClick={() => navigate('/cours')}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Colonne droite — cours récents */}
            <div style={styles.colRight}>
              <div style={{ ...styles.card, animation: 'fadeUp 0.5s ease 0.15s forwards', opacity: 0 }}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Cours de {utilisateur?.annee_etudes}e année</h3>
                  <button style={styles.voirTout} onClick={() => navigate('/cours')}>Voir tout →</button>
                </div>
                <div style={styles.coursList}>
                  {cours.slice(0, 6).map((c, i) => (
                    <div
                      key={c.id}
                      className="cours-card"
                      style={{ ...styles.coursCard, animationDelay: `${i * 0.05}s` }}
                      onClick={() => navigate(`/cours/${c.id}`)}
                    >
                      <div style={styles.coursCardLeft}>
                        <div style={styles.coursNum}>{i + 1}</div>
                        <div>
                          <div style={styles.coursTitre}>{c.titre_es}</div>
                          <div style={styles.coursMeta}>{c.titre_fr} · {c.duree_minutes} min</div>
                        </div>
                      </div>
                      <div style={styles.coursCardRight}>
                        <span style={styles.coursBadge}>{c.matiere}</span>
                        <span style={styles.coursArrow}>›</span>
                      </div>
                    </div>
                  ))}
                </div>
                {cours.length > 6 && (
                  <button style={styles.voirPlusBtnFull} onClick={() => navigate('/cours')}>
                    Voir les {cours.length - 6} autres cours →
                  </button>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page:            { minHeight: '100vh', background: '#f4f5f7', fontFamily: 'system-ui, sans-serif' },
  loadingPage:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  loadingSpinner:  { width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #534AB7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  layout:          { display: 'flex', minHeight: '100vh' },
  sidebar:         { width: 220, background: 'linear-gradient(180deg,#1a1a2e,#2d1b69)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem 1rem', position: 'sticky', top: 0, height: '100vh' },
  sidebarTop:      { flex: 1 },
  logo:            { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '0.5px solid rgba(255,255,255,0.1)' },
  logoIcon:        { width: 34, height: 34, background: 'linear-gradient(135deg,#534AB7,#F97316)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 },
  logoText:        { fontSize: 15, fontWeight: 700, color: '#fff' },
  nav:             { display: 'flex', flexDirection: 'column', gap: 4 },
  navItem:         { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontWeight: 500 },
  navIcon:         { fontSize: 16 },
  navItemActif:    { background: 'rgba(255,255,255,0.12)', color: '#fff' },
  sidebarBottom:   { borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: '1rem' },
  userCard:        { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  userAvatar:      { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#534AB7,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 },
  userName:        { fontSize: 13, fontWeight: 600, color: '#fff' },
  userAnnee:       { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  logoutBtn:       { width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontWeight: 500 },
  main:            { flex: 1, overflow: 'auto' },
  heroHeader:      { position: 'relative', overflow: 'hidden', padding: '2.5rem 2rem 2rem', marginBottom: '0' },
  heroBg:          { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#534AB7,#7C3AED,#F97316)', backgroundSize: '200% 200%', animation: 'gradShift 8s ease infinite', opacity: 0.92 },
  heroContent:     { position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  heroLeft:        { },
  heroTitle:       { fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px' },
  heroDate:        { fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: '0 0 12px', textTransform: 'capitalize' },
  heroBadges:      { display: 'flex', gap: 8 },
  heroBadge:       { fontSize: 12, background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 20, padding: '4px 12px', fontWeight: 500, border: '1px solid rgba(255,255,255,0.25)' },
  heroRight:       { },
  quickActions:    { display: 'flex', gap: 8 },
  quickBtn:        { padding: '8px 16px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)' },
  contentGrid:     { display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', padding: '1.5rem 2rem 2rem' },
  colLeft:         { display: 'flex', flexDirection: 'column', gap: '1rem' },
  colRight:        { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card:            { background: '#fff', borderRadius: 16, padding: '1.25rem', border: '0.5px solid #e5e7eb' },
  versetCard:      { background: 'linear-gradient(135deg,#EEEDFE,#E8E6FF)', border: '1px solid #AFA9EC' },
  versetHeader:    { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  versetIcon:      { fontSize: 16 },
  versetLabel:     { fontSize: 11, fontWeight: 700, color: '#534AB7', textTransform: 'uppercase', letterSpacing: '0.06em' },
  versetTexte:     { fontSize: 14, color: '#3C3489', fontStyle: 'italic', lineHeight: 1.65, margin: '0 0 6px' },
  versetRef:       { fontSize: 12, color: '#534AB7', fontWeight: 600, margin: '0 0 8px' },
  versetEs:        { fontSize: 12, color: '#7F77DD', fontStyle: 'italic', margin: 0, borderTop: '0.5px solid #AFA9EC', paddingTop: 8 },
  statsGrid:       { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  statCard:        { background: '#fff', borderRadius: 12, padding: '1rem', border: '0.5px solid #e5e7eb', textAlign: 'center' },
  statNum:         { fontSize: 26, fontWeight: 800, marginBottom: 4 },
  statLabel:       { fontSize: 11, color: '#6b7280' },
  cardHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  cardTitle:       { fontSize: 15, fontWeight: 700, color: '#1a1a2e', margin: 0 },
  voirTout:        { fontSize: 12, color: '#534AB7', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 },
  matiereGrid:     { display: 'flex', flexDirection: 'column', gap: 6 },
  matierePill:     { padding: '8px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' },
  coursList:       { display: 'flex', flexDirection: 'column', gap: 8 },
  coursCard:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '0.5px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', background: '#fafafa' },
  coursCardLeft:   { display: 'flex', alignItems: 'center', gap: 12 },
  coursNum:        { width: 28, height: 28, borderRadius: '50%', background: '#EEEDFE', color: '#534AB7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  coursTitre:      { fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 2 },
  coursMeta:       { fontSize: 11, color: '#9ca3af' },
  coursCardRight:  { display: 'flex', alignItems: 'center', gap: 8 },
  coursBadge:      { fontSize: 11, background: '#EEEDFE', color: '#3C3489', borderRadius: 20, padding: '2px 10px', fontWeight: 500 },
  coursArrow:      { fontSize: 18, color: '#d1d5db', fontWeight: 300 },
  voirPlusBtnFull: { width: '100%', marginTop: '1rem', padding: '10px', background: 'transparent', border: '1px dashed #d1d5db', borderRadius: 10, fontSize: 13, color: '#6b7280', cursor: 'pointer', fontWeight: 500 },
};

export default Accueil;