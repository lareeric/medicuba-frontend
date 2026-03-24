import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlanning, genererPlanning, marquerEffectue, annulerEffectue } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Planning() {
  const { utilisateur }             = useAuth();
  const [planning, setPlanning]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [generation, setGeneration] = useState(false);
  const [jours, setJours]           = useState(7);
  const navigate                    = useNavigate();
  const isAdmin = utilisateur?.is_admin === true;

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await getPlanning();
      setPlanning(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerer = async () => {
    setGeneration(true);
    try {
      const res = await genererPlanning({ jours });
      setPlanning(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneration(false);
    }
  };

  const handleEffectue = async (id) => {
    try {
      await marquerEffectue(id);
      setPlanning(planning.map(p => p.id === id ? { ...p, effectue: true } : p));
    } catch (err) { console.error(err); }
  };

  const handleAnnuler = async (id) => {
    try {
      await annulerEffectue(id);
      setPlanning(planning.map(p => p.id === id ? { ...p, effectue: false } : p));
    } catch (err) { console.error(err); }
  };

  const handleNav = (item) => {
    if (item === 'Accueil')   navigate('/');
    if (item === 'Cours')     navigate('/cours');
    if (item === 'Quiz')      navigate('/quiz');
    if (item === 'Glossaire') navigate('/glossaire');
    if (item === 'Notes')     navigate('/notes');
  };

  const planningParJour = planning.reduce((acc, p) => {
    const date = p.date_prevue.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(p);
    return acc;
  }, {});

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const isAujourdhui = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const totalTaches      = planning.length;
  const tachesEffectuees = planning.filter(p => p.effectue).length;
  const progression      = totalTaches > 0 ? Math.round((tachesEffectuees / totalTaches) * 100) : 0;

  const matiereColors = {
    'Anatomie':    '#534AB7',
    'Physiologie': '#1D9E75',
    'Biochimie':   '#F97316',
    'Histologie':  '#7C3AED',
    'Sémiologie':  '#DC2626',
  };

  const navItems = [
    { label: 'Accueil',   icon: '🏠', path: '/' },
    { label: 'Cours',     icon: '📚', path: '/cours' },
    { label: 'Quiz',      icon: '🧠', path: '/quiz' },
    { label: 'Glossaire', icon: '📖', path: '/glossaire' },
    { label: 'Notes',     icon: '✏️', path: '/notes' },
    { label: 'Planning',  icon: '📅', path: '/planning' },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .nav-item:hover { background: rgba(255,255,255,0.12) !important; color: #fff !important; }
        .gen-btn:hover { transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(83,74,183,0.3) !important; }
        .gen-btn { transition: all 0.2s ease !important; }
        .tache-card:hover { border-color: #534AB7 !important; }
        .tache-card { transition: all 0.15s ease !important; }

        /* ══════════════════════════════════
           RESPONSIVE MOBILE
        ══════════════════════════════════ */
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .main-content    { margin-left: 0 !important; }
          .page-layout     { padding-bottom: 70px !important; }

          .hero-header   { padding: 1.25rem 1rem !important; }
          .hero-title    { font-size: 20px !important; }
          .hero-content-row { flex-direction: column !important; gap: 10px !important; align-items: flex-start !important; }
          .hero-actions  { width: 100% !important; flex-wrap: wrap !important; }
          .hero-select   { flex: 1 !important; min-width: 0 !important; }
          .gen-btn-hero  { flex: 1 !important; text-align: center !important; }

          .content-pad   { padding: 1rem !important; }

          .stats-row     { grid-template-columns: repeat(3,1fr) !important; }
          .stat-prog     { grid-column: 1 / -1 !important; }

          .tache-card    { flex-wrap: wrap !important; gap: 8px !important; padding: 10px 12px !important; }
          .tache-actions { width: 100% !important; justify-content: flex-end !important; }
          .tache-heure   { min-width: auto !important; }

          .bottom-nav    { display: flex !important; }
        }

        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(180deg,#1a1a2e,#2d1b69);
          height: 64px; z-index: 200;
          align-items: center; justify-content: space-around;
          padding: 0 4px;
          border-top: 0.5px solid rgba(255,255,255,0.1);
        }
        .bottom-nav-item {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 2px; padding: 6px 10px;
          border-radius: 10px; cursor: pointer; flex: 1;
          transition: background 0.15s ease;
        }
        .bottom-nav-item:hover { background: rgba(255,255,255,0.1); }
        .bottom-nav-item.actif { background: rgba(255,255,255,0.12); }
        .bottom-nav-icon  { font-size: 18px; line-height: 1; }
        .bottom-nav-label { font-size: 9px; color: rgba(255,255,255,0.6); font-weight: 500; }
        .bottom-nav-item.actif .bottom-nav-label { color: #fff; }

        .mobile-header {
          display: none;
          align-items: center; justify-content: space-between;
          padding: 0 1rem; height: 56px;
          background: linear-gradient(180deg,#1a1a2e,#2d1b69);
          position: sticky; top: 0; z-index: 100;
        }
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
        }
      `}</style>

      {/* ── Header mobile ── */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={styles.logoIcon}>M</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>MediCuba ES</span>
        </div>
        <div style={styles.userAvatar}>{utilisateur?.prenom?.[0]}</div>
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
                  style={{ ...styles.navItem, ...(item.label === 'Planning' ? styles.navItemActif : {}) }}
                  onClick={() => item.label === 'Planning' ? null : handleNav(item.label)}>
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
                <div style={styles.userAnnee}>{utilisateur?.annee_etudes}e année</div>
              </div>
            </div>
            {isAdmin && (
              <button style={{ ...styles.logoutBtn, background: 'rgba(249,115,22,0.15)', color: '#F97316', marginTop: 6, border: '0.5px solid rgba(249,115,22,0.3)' }}
                onClick={() => navigate('/admin')}>Panel Admin</button>
            )}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main-content" style={styles.main}>

          {/* Hero */}
          <div className="hero-header" style={styles.heroHeader}>
            <div style={styles.heroBg} />
            <div className="hero-content-row" style={styles.heroContent}>
              <div>
                <h1 className="hero-title" style={styles.heroTitle}>📅 Planning intelligent</h1>
                <p style={styles.heroSub}>Programme de révision généré automatiquement</p>
              </div>
              <div className="hero-actions" style={styles.heroActions}>
                <select className="hero-select" style={styles.heroSelect} value={jours}
                  onChange={e => setJours(Number(e.target.value))}>
                  <option value={3}>3 jours</option>
                  <option value={7}>7 jours</option>
                  <option value={14}>14 jours</option>
                  <option value={30}>30 jours</option>
                </select>
                <button className="gen-btn gen-btn-hero" style={styles.genBtn}
                  onClick={handleGenerer} disabled={generation}>
                  {generation ? '⏳ Génération...' : '✨ Générer le planning'}
                </button>
              </div>
            </div>
          </div>

          <div className="content-pad" style={styles.content}>

            {/* Stats progression */}
            {totalTaches > 0 && (
              <div className="stats-row" style={styles.statsRow}>
                <div style={styles.statCard}>
                  <div style={styles.statNum}>{totalTaches}</div>
                  <div style={styles.statLabel}>Tâches totales</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ ...styles.statNum, color: '#1D9E75' }}>{tachesEffectuees}</div>
                  <div style={styles.statLabel}>Complétées</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ ...styles.statNum, color: '#F97316' }}>{totalTaches - tachesEffectuees}</div>
                  <div style={styles.statLabel}>Restantes</div>
                </div>
                <div className="stat-prog" style={{ ...styles.statCard, flex: 2 }}>
                  <div style={styles.progInfo}>
                    <span style={styles.progLabel}>Progression globale</span>
                    <span style={{ ...styles.progLabel, color: '#534AB7' }}>{progression}%</span>
                  </div>
                  <div style={styles.progBar}>
                    <div style={{ ...styles.progFill, width: `${progression}%` }} />
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div style={styles.loading}><div style={styles.spinner} /></div>
            ) : Object.keys(planningParJour).length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📅</div>
                <h3 style={styles.emptyTitle}>Aucun planning généré</h3>
                <p style={styles.emptyDesc}>
                  Clique sur "Générer le planning" pour créer ton programme de révision automatique sur {jours} jours.
                </p>
                <button className="gen-btn" style={styles.btnPrimary}
                  onClick={handleGenerer} disabled={generation}>
                  {generation ? 'Génération...' : '✨ Générer maintenant'}
                </button>
              </div>
            ) : (
              <div style={styles.planningListe}>
                {Object.entries(planningParJour).map(([date, taches], di) => (
                  <div key={date} style={{ ...styles.jourBlock, animation: `fadeUp 0.4s ease ${di * 0.06}s forwards`, opacity: 0 }}>
                    <div style={styles.jourHeader}>
                      <div style={styles.jourTitreWrap}>
                        <span style={styles.jourTitre}>{formatDate(date)}</span>
                        {isAujourdhui(date) && <span style={styles.todayBadge}>Aujourd'hui</span>}
                      </div>
                      <span style={styles.jourProgTxt}>
                        {taches.filter(t => t.effectue).length}/{taches.length} fait
                      </span>
                    </div>

                    <div style={styles.tachesList}>
                      {taches.map(t => (
                        <div key={t.id} className="tache-card"
                          style={{ ...styles.tacheCard, ...(t.effectue ? styles.tacheEffectuee : {}) }}>
                          <div style={{ ...styles.tacheColorBar, background: matiereColors[t.matiere] || '#534AB7' }} />
                          <div className="tache-heure" style={styles.tacheHeure}>{t.heure_debut?.slice(0,5)}</div>
                          <div style={styles.tacheInfo}>
                            <div style={styles.tacheTitre}>{t.titre_es}</div>
                            <div style={styles.tacheMeta}>
                              <span style={{
                                ...styles.tacheMatiere,
                                background: (matiereColors[t.matiere] || '#534AB7') + '18',
                                color: matiereColors[t.matiere] || '#534AB7',
                              }}>{t.matiere}</span>
                              <span style={styles.tacheDuree}>{t.duree_minutes} min</span>
                            </div>
                          </div>
                          <div className="tache-actions" style={styles.tacheActions}>
                            {!t.effectue ? (
                              <button style={styles.faitBtn} onClick={() => handleEffectue(t.id)}>
                                ✓ Fait
                              </button>
                            ) : (
                              <button style={styles.annulerBtn} onClick={() => handleAnnuler(t.id)}>
                                ↩ Annuler
                              </button>
                            )}
                            <button style={styles.lireBtn}
                              onClick={() => navigate(`/cours/${t.cours_id}`)}>
                              Lire
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Bottom nav mobile ── */}
      <div className="bottom-nav">
        {navItems.map(item => (
          <div key={item.label}
            className={`bottom-nav-item ${item.label === 'Planning' ? 'actif' : ''}`}
            onClick={() => item.label === 'Planning' ? null : navigate(item.path)}>
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page:           { minHeight: '100vh', background: '#f4f5f7', fontFamily: 'system-ui,sans-serif' },
  layout:         { display: 'flex', minHeight: '100vh' },
  sidebar:        { width: 220, background: 'linear-gradient(180deg,#1a1a2e,#2d1b69)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem 1rem', position: 'sticky', top: 0, height: '100vh' },
  sidebarTop:     { flex: 1 },
  logo:           { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '0.5px solid rgba(255,255,255,0.1)' },
  logoIcon:       { width: 34, height: 34, background: 'linear-gradient(135deg,#534AB7,#F97316)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 },
  logoText:       { fontSize: 15, fontWeight: 700, color: '#fff' },
  nav:            { display: 'flex', flexDirection: 'column', gap: 4 },
  navItem:        { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontWeight: 500 },
  navIcon:        { fontSize: 16 },
  navItemActif:   { background: 'rgba(255,255,255,0.12)', color: '#fff' },
  sidebarBottom:  { borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: '1rem' },
  userCard:       { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  userAvatar:     { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#534AB7,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 },
  userName:       { fontSize: 13, fontWeight: 600, color: '#fff' },
  userAnnee:      { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  logoutBtn:      { width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontWeight: 500 },
  main:           { flex: 1, overflow: 'auto' },
  heroHeader:     { position: 'relative', overflow: 'hidden', padding: '2rem' },
  heroBg:         { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1D9E75,#534AB7,#7C3AED)', backgroundSize: '200% 200%', animation: 'gradShift 8s ease infinite', opacity: 0.92 },
  heroContent:    { position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  heroTitle:      { fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 4px' },
  heroSub:        { fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 },
  heroActions:    { display: 'flex', gap: 10, alignItems: 'center' },
  heroSelect:     { padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  genBtn:         { padding: '10px 20px', background: '#fff', border: 'none', borderRadius: 10, color: '#534AB7', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  content:        { padding: '1.5rem 2rem' },
  statsRow:       { display: 'grid', gridTemplateColumns: 'repeat(3,1fr) 2fr', gap: 12, marginBottom: '1.5rem' },
  statCard:       { background: '#fff', borderRadius: 14, padding: '1rem', border: '0.5px solid #e5e7eb', textAlign: 'center' },
  statNum:        { fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 },
  statLabel:      { fontSize: 11, color: '#6b7280' },
  progInfo:       { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  progLabel:      { fontSize: 12, fontWeight: 600, color: '#374151' },
  progBar:        { height: 8, background: '#f3f4f6', borderRadius: 4 },
  progFill:       { height: '100%', background: 'linear-gradient(90deg,#534AB7,#F97316)', borderRadius: 4, transition: 'width 0.5s ease' },
  loading:        { display: 'flex', justifyContent: 'center', padding: '4rem' },
  spinner:        { width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #534AB7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  emptyState:     { textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 20, border: '0.5px solid #e5e7eb' },
  emptyIcon:      { fontSize: 48, marginBottom: 16 },
  emptyTitle:     { fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' },
  emptyDesc:      { fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 },
  btnPrimary:     { padding: '12px 28px', background: 'linear-gradient(135deg,#534AB7,#7C3AED)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  planningListe:  { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  jourBlock:      { background: '#fff', borderRadius: 16, border: '0.5px solid #e5e7eb', overflow: 'hidden', opacity: 0 },
  jourHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '0.5px solid #f3f4f6', background: '#fafafa' },
  jourTitreWrap:  { display: 'flex', alignItems: 'center', gap: 10 },
  jourTitre:      { fontSize: 14, fontWeight: 700, color: '#1a1a2e', textTransform: 'capitalize' },
  todayBadge:     { fontSize: 11, background: 'linear-gradient(135deg,#534AB7,#7C3AED)', color: '#fff', borderRadius: 20, padding: '3px 12px', fontWeight: 600 },
  jourProgTxt:    { fontSize: 12, color: '#6b7280', fontWeight: 500 },
  tachesList:     { display: 'flex', flexDirection: 'column' },
  tacheCard:      { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '0.5px solid #f9fafb' },
  tacheEffectuee: { opacity: 0.5, background: '#fafafa' },
  tacheColorBar:  { width: 4, height: 36, borderRadius: 2, flexShrink: 0 },
  tacheHeure:     { fontSize: 13, fontWeight: 700, color: '#534AB7', minWidth: 42 },
  tacheInfo:      { flex: 1 },
  tacheTitre:     { fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 },
  tacheMeta:      { display: 'flex', gap: 8, alignItems: 'center' },
  tacheMatiere:   { fontSize: 11, borderRadius: 20, padding: '2px 10px', fontWeight: 600 },
  tacheDuree:     { fontSize: 11, color: '#9ca3af' },
  tacheActions:   { display: 'flex', gap: 6 },
  faitBtn:        { padding: '5px 14px', background: '#E1F5EE', color: '#085041', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  annulerBtn:     { padding: '5px 14px', background: '#FFF3E0', color: '#C2410C', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  lireBtn:        { padding: '5px 12px', background: '#EEEDFE', color: '#3C3489', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer' },
};

export default Planning;