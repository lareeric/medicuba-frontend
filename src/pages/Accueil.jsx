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
  const isAdmin = utilisateur?.is_admin === true;

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

  const navItems = [
    { label: 'Accueil',   icon: '🏠', path: '/' },
    { label: 'Cours',     icon: '📚', path: '/cours' },
    { label: 'Quiz',      icon: '🧠', path: '/quiz' },
    { label: 'Glossaire', icon: '📖', path: '/glossaire' },
    { label: 'Notes',     icon: '✏️', path: '/notes' },
    { label: 'Planning',  icon: '📅', path: '/planning' },
  ];

  if (loading) return (
    <div style={styles.loadingPage}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={styles.loadingSpinner} />
      <p style={{ color: '#6b7280', marginTop: 12 }}>Chargement...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .nav-item:hover  { background: rgba(255,255,255,0.12) !important; color: #fff !important; }
        .cours-card:hover{ border-color: #534AB7 !important; transform: translateY(-2px) !important; box-shadow: 0 4px 20px rgba(83,74,183,0.1) !important; }
        .cours-card      { transition: all 0.2s ease !important; }
        .quick-btn:hover { background: rgba(255,255,255,0.25) !important; }
        .quick-btn       { transition: background 0.2s ease !important; }

        /* ══════════════════════════════════
           RESPONSIVE MOBILE
        ══════════════════════════════════ */
        @media (max-width: 768px) {

          /* Sidebar cachée */
          .sidebar-desktop { display: none !important; }

          /* Main sans marge gauche */
          .main-content { margin-left: 0 !important; }

          /* Padding bas pour la navbar bottom */
          .page-layout  { padding-bottom: 70px !important; }

          /* Hero header compact */
          .hero-header  { padding: 1.25rem 1rem !important; }
          .hero-content { flex-direction: column !important; gap: 12px !important; align-items: flex-start !important; }
          .hero-title   { font-size: 20px !important; }
          .hero-date    { font-size: 12px !important; margin-bottom: 8px !important; }
          .quick-actions{ flex-wrap: wrap !important; }
          .quick-btn    { font-size: 12px !important; padding: 6px 12px !important; }

          /* Content grid en colonne */
          .content-grid { grid-template-columns: 1fr !important; padding: 1rem !important; gap: 1rem !important; }

          /* Stats 3 colonnes → 3 colonnes mais plus compact */
          .stats-grid   { gap: 6px !important; }
          .stat-num     { font-size: 20px !important; }
          .stat-label   { font-size: 10px !important; }
          .stat-card    { padding: 0.75rem 0.5rem !important; }

          /* Cards */
          .card-pad     { padding: 1rem !important; border-radius: 12px !important; }

          /* Navbar bottom visible */
          .bottom-nav   { display: flex !important; }
        }

        /* Bottom nav cachée par défaut (desktop) */
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(180deg,#1a1a2e,#2d1b69);
          height: 64px;
          z-index: 200;
          align-items: center;
          justify-content: space-around;
          padding: 0 4px;
          border-top: 0.5px solid rgba(255,255,255,0.1);
        }
        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 6px 10px;
          border-radius: 10px;
          cursor: pointer;
          flex: 1;
          transition: background 0.15s ease;
        }
        .bottom-nav-item:hover { background: rgba(255,255,255,0.1); }
        .bottom-nav-item.actif { background: rgba(255,255,255,0.12); }
        .bottom-nav-icon  { font-size: 18px; line-height: 1; }
        .bottom-nav-label { font-size: 9px; color: rgba(255,255,255,0.6); font-weight: 500; }
        .bottom-nav-item.actif .bottom-nav-label { color: #fff; }

        /* Header mobile */
        .mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          height: 56px;
          background: linear-gradient(180deg,#1a1a2e,#2d1b69);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
        }
      `}</style>

      {/* ── Header mobile (visible uniquement sur mobile) ── */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={styles.logoIcon}>M</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>MediCuba ES</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={styles.userAvatar}>{utilisateur?.prenom?.[0]}</div>
          <button style={{ ...styles.logoutBtn, padding: '5px 10px', fontSize: 11 }} onClick={handleLogout}>
            Quitter
          </button>
        </div>
      </div>

      <div className="page-layout" style={styles.layout}>

        {/* ── Sidebar desktop ── */}
        <aside className="sidebar-desktop" style={styles.sidebar}>
          <div style={styles.sidebarTop}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>M</div>
              <span style={styles.logoText}>MediCuba ES</span>
            </div>
            <nav style={styles.nav}>
              {navItems.map(item => (
                <div key={item.label} className="nav-item"
                  style={{ ...styles.navItem, ...(item.label === 'Accueil' ? styles.navItemActif : {}) }}
                  onClick={() => item.label === 'Accueil' ? null : handleNav(item.label)}>
                  <span style={styles.navIcon}>{item.icon}</span>
                  {item.label}
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
            {isAdmin && (
              <button style={{ ...styles.logoutBtn, background: 'rgba(249,115,22,0.15)', color: '#F97316', marginTop: 6, border: '0.5px solid rgba(249,115,22,0.3)' }}
                onClick={() => navigate('/admin')}>Panel Admin</button>
            )}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main-content" style={styles.main}>

          {/* Hero header */}
          <div className="hero-header" style={styles.heroHeader}>
            <div style={styles.heroBg} />
            <div className="hero-content" style={styles.heroContent}>
              <div>
                <h1 className="hero-title" style={styles.heroTitle}>Bonjour {utilisateur?.prenom} 👋</h1>
                <p className="hero-date" style={styles.heroDate}>
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div style={styles.heroBadges}>
                  <span style={styles.heroBadge}>{cours.length} cours disponibles</span>
                  <span style={styles.heroBadge}>{matieres.length} matières</span>
                </div>
              </div>
              <div className="quick-actions" style={styles.quickActions}>
                <button className="quick-btn" style={styles.quickBtn} onClick={() => navigate('/cours')}>📚 Voir les cours</button>
                <button className="quick-btn" style={styles.quickBtn} onClick={() => navigate('/planning')}>📅 Mon planning</button>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="content-grid" style={styles.contentGrid}>

            {/* Colonne gauche */}
            <div style={styles.colLeft}>

              {/* Verset */}
              {verset && (
                <div className="card-pad" style={{ ...styles.card, ...styles.versetCard, animation: 'fadeUp 0.5s ease forwards' }}>
                  <div style={styles.versetHeader}>
                    <span style={styles.versetIcon}>✝️</span>
                    <span style={styles.versetLabel}>Verset du jour</span>
                  </div>
                  <p style={styles.versetTexte}>"{verset.texte_fr}"</p>
                  <p style={styles.versetRef}>{verset.reference}</p>
                  {verset.texte_es && <p style={styles.versetEs}>"{verset.texte_es}"</p>}
                </div>
              )}

              {/* Stats */}
              <div className="stats-grid" style={styles.statsGrid}>
                {[
                  { n: cours.length,    l: 'Cours disponibles', c: '#534AB7' },
                  { n: matieres.length, l: 'Matières',          c: '#1D9E75' },
                  { n: '0',             l: 'Cours terminés',    c: '#F97316' },
                ].map(s => (
                  <div key={s.l} className="stat-card" style={{ ...styles.statCard, borderTop: `3px solid ${s.c}` }}>
                    <div className="stat-num" style={{ ...styles.statNum, color: s.c }}>{s.n}</div>
                    <div className="stat-label" style={styles.statLabel}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Matières */}
              <div className="card-pad" style={{ ...styles.card, animation: 'fadeUp 0.6s ease 0.1s forwards', opacity: 0 }}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Matières de {utilisateur?.annee_etudes}e année</h3>
                </div>
                <div style={styles.matiereGrid}>
                  {matieres.map((m, i) => (
                    <div key={m}
                      style={{ ...styles.matierePill, borderLeft: `3px solid ${i % 2 === 0 ? '#534AB7' : '#F97316'}` }}
                      onClick={() => navigate('/cours')}>
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div style={styles.colRight}>
              <div className="card-pad" style={{ ...styles.card, animation: 'fadeUp 0.5s ease 0.15s forwards', opacity: 0 }}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Cours de {utilisateur?.annee_etudes}e année</h3>
                  <button style={styles.voirTout} onClick={() => navigate('/cours')}>Voir tout →</button>
                </div>
                <div style={styles.coursList}>
                  {cours.slice(0, 6).map((c, i) => (
                    <div key={c.id} className="cours-card"
                      style={{ ...styles.coursCard, animationDelay: `${i * 0.05}s` }}
                      onClick={() => navigate(`/cours/${c.id}`)}>
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

      {/* ── Barre de navigation bottom (mobile uniquement) ── */}
      <div className="bottom-nav">
        {navItems.map(item => (
          <div key={item.label}
            className={`bottom-nav-item ${item.label === 'Accueil' ? 'actif' : ''}`}
            onClick={() => item.label === 'Accueil' ? null : navigate(item.path)}>
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </div>
        ))}
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
  userAvatar:      { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#534AB7,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 },
  userName:        { fontSize: 13, fontWeight: 600, color: '#fff' },
  userAnnee:       { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  logoutBtn:       { width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontWeight: 500 },
  main:            { flex: 1, overflow: 'auto' },
  heroHeader:      { position: 'relative', overflow: 'hidden', padding: '2.5rem 2rem 2rem' },
  heroBg:          { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#534AB7,#7C3AED,#F97316)', backgroundSize: '200% 200%', animation: 'gradShift 8s ease infinite', opacity: 0.92 },
  heroContent:     { position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  heroTitle:       { fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px' },
  heroDate:        { fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: '0 0 12px', textTransform: 'capitalize' },
  heroBadges:      { display: 'flex', gap: 8, flexWrap: 'wrap' },
  heroBadge:       { fontSize: 12, background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 20, padding: '4px 12px', fontWeight: 500, border: '1px solid rgba(255,255,255,0.25)' },
  quickActions:    { display: 'flex', gap: 8, flexWrap: 'wrap' },
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
  coursCardRight:  { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  coursBadge:      { fontSize: 11, background: '#EEEDFE', color: '#3C3489', borderRadius: 20, padding: '2px 10px', fontWeight: 500 },
  coursArrow:      { fontSize: 18, color: '#d1d5db', fontWeight: 300 },
  voirPlusBtnFull: { width: '100%', marginTop: '1rem', padding: '10px', background: 'transparent', border: '1px dashed #d1d5db', borderRadius: 10, fontSize: 13, color: '#6b7280', cursor: 'pointer', fontWeight: 500 },
};

export default Accueil;