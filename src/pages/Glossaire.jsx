import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGlossaire } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Glossaire() {
  const { utilisateur }             = useAuth();
  const [termes, setTermes]         = useState([]);
  const [recherche, setRecherche]   = useState('');
  const [matiere, setMatiere]       = useState('');
  const [loading, setLoading]       = useState(true);
  const [termeActif, setTermeActif] = useState(null);
  const navigate                    = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => charger(), 300);
    return () => clearTimeout(timer);
  }, [recherche, matiere]);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await getGlossaire({ recherche, matiere });
      setTermes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNav = (item) => {
    if (item === 'Accueil')  navigate('/');
    if (item === 'Cours')    navigate('/cours');
    if (item === 'Quiz')     navigate('/quiz');
    if (item === 'Notes')    navigate('/notes');
    if (item === 'Planning') navigate('/planning');
  };

  const matieres = [...new Set(termes.map(t => t.matiere).filter(Boolean))];

  const matiereColors = {
    'Anatomie':    '#534AB7',
    'Physiologie': '#1D9E75',
    'Biochimie':   '#F97316',
    'Histologie':  '#7C3AED',
    'Sémiologie':  '#DC2626',
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .nav-item:hover { background: rgba(255,255,255,0.12) !important; color: #fff !important; }
        .terme-card:hover { border-color: #534AB7 !important; transform: translateY(-1px) !important; }
        .terme-card { transition: all 0.18s ease !important; }
        .search-input:focus { border-color: #534AB7 !important; box-shadow: 0 0 0 3px rgba(83,74,183,0.1) !important; outline: none; }
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
                <div key={item} className="nav-item"
                  style={{ ...styles.navItem, ...(item === 'Glossaire' ? styles.navItemActif : {}) }}
                  onClick={() => handleNav(item)}>
                  <span style={styles.navIcon}>
                    {item === 'Accueil' ? '🏠' : item === 'Cours' ? '📚' : item === 'Quiz' ? '🧠' : item === 'Glossaire' ? '📖' : item === 'Notes' ? '✏️' : '📅'}
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
                <div style={styles.userAnnee}>{utilisateur?.annee_etudes}e année</div>
              </div>
            </div>
          </div>
        </aside>

        <main style={styles.main}>
          {/* Hero */}
          <div style={styles.heroHeader}>
            <div style={styles.heroBg} />
            <div style={styles.heroContent}>
              <div>
                <h1 style={styles.heroTitle}>📖 Glossaire médical</h1>
                <p style={styles.heroSub}>Termes médicaux trilingues ES · FR · EN</p>
              </div>
              <div style={styles.heroStats}>
                <div style={styles.heroStat}>
                  <div style={styles.heroStatNum}>{termes.length}</div>
                  <div style={styles.heroStatLabel}>termes</div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.content}>
            {/* Barre de recherche */}
            <div style={styles.searchWrap}>
              <div style={styles.searchBox}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  className="search-input"
                  style={styles.searchInput}
                  type="text"
                  placeholder="Buscar término médico... (ES, FR ou EN)"
                  value={recherche}
                  onChange={e => setRecherche(e.target.value)}
                />
                {recherche && (
                  <button style={styles.clearBtn} onClick={() => setRecherche('')}>✕</button>
                )}
              </div>
              <select style={styles.select} value={matiere}
                onChange={e => setMatiere(e.target.value)}>
                <option value="">Toutes les matières</option>
                {matieres.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Filtres matières */}
            <div style={styles.matieresPills}>
              <div style={{ ...styles.matierePill, background: !matiere ? '#534AB7' : '#f3f4f6', color: !matiere ? '#fff' : '#374151' }}
                onClick={() => setMatiere('')}>Tout</div>
              {matieres.map(m => (
                <div key={m} style={{
                  ...styles.matierePill,
                  background: matiere === m ? (matiereColors[m] || '#534AB7') : '#f3f4f6',
                  color: matiere === m ? '#fff' : '#374151',
                }} onClick={() => setMatiere(matiere === m ? '' : m)}>{m}</div>
              ))}
            </div>

            <div style={styles.compteur}>
              {loading ? 'Recherche...' : `${termes.length} terme(s) trouvé(s)`}
            </div>

            {/* Liste */}
            {loading ? (
              <div style={styles.loading}><div style={styles.spinner} /></div>
            ) : termes.length === 0 ? (
              <div style={styles.vide}>
                <p style={{ fontSize: 32, margin: '0 0 12px' }}>🔍</p>
                <p>Aucun terme trouvé pour "{recherche}"</p>
              </div>
            ) : (
              <div style={styles.termesList}>
                {termes.map((t, i) => (
                  <div key={t.id} className="terme-card"
                    style={{
                      ...styles.termeCard,
                      ...(termeActif?.id === t.id ? styles.termeCardActif : {}),
                      animationDelay: `${i * 0.03}s`,
                      borderLeft: `4px solid ${matiereColors[t.matiere] || '#534AB7'}`,
                    }}
                    onClick={() => setTermeActif(termeActif?.id === t.id ? null : t)}>
                    <div style={styles.termeHeader}>
                      <div style={styles.termeNoms}>
                        <span style={styles.termeEs}>{t.terme_es}</span>
                        {t.terme_fr && <span style={styles.termeFr}>{t.terme_fr}</span>}
                        {t.terme_en && <span style={styles.termeEn}>{t.terme_en}</span>}
                      </div>
                      <div style={styles.termeBadges}>
                        {t.matiere && (
                          <span style={{
                            ...styles.termeBadge,
                            background: (matiereColors[t.matiere] || '#534AB7') + '18',
                            color: matiereColors[t.matiere] || '#534AB7',
                          }}>{t.matiere}</span>
                        )}
                        {t.annee && (
                          <span style={{ ...styles.termeBadge, background: '#E1F5EE', color: '#085041' }}>
                            {t.annee}e an.
                          </span>
                        )}
                        <span style={styles.termeToggle}>{termeActif?.id === t.id ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {termeActif?.id === t.id && t.definition_fr && (
                      <div style={styles.definition}>
                        <div style={styles.defLabel}>Définition</div>
                        <p style={styles.defTexte}>{t.definition_fr}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page:          { minHeight: '100vh', background: '#f4f5f7', fontFamily: 'system-ui,sans-serif' },
  layout:        { display: 'flex', minHeight: '100vh' },
  sidebar:       { width: 220, background: 'linear-gradient(180deg,#1a1a2e,#2d1b69)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem 1rem', position: 'sticky', top: 0, height: '100vh' },
  sidebarTop:    { flex: 1 },
  logo:          { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '0.5px solid rgba(255,255,255,0.1)' },
  logoIcon:      { width: 34, height: 34, background: 'linear-gradient(135deg,#534AB7,#F97316)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 },
  logoText:      { fontSize: 15, fontWeight: 700, color: '#fff' },
  nav:           { display: 'flex', flexDirection: 'column', gap: 4 },
  navItem:       { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontWeight: 500 },
  navIcon:       { fontSize: 16 },
  navItemActif:  { background: 'rgba(255,255,255,0.12)', color: '#fff' },
  sidebarBottom: { borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: '1rem' },
  userCard:      { display: 'flex', alignItems: 'center', gap: 10 },
  userAvatar:    { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#534AB7,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 },
  userName:      { fontSize: 13, fontWeight: 600, color: '#fff' },
  userAnnee:     { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  main:          { flex: 1, overflow: 'auto' },
  heroHeader:    { position: 'relative', overflow: 'hidden', padding: '2rem' },
  heroBg:        { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1D9E75,#0F6E56,#534AB7)', backgroundSize: '200% 200%', animation: 'gradShift 8s ease infinite', opacity: 0.92 },
  heroContent:   { position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  heroTitle:     { fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 4px' },
  heroSub:       { fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 },
  heroStats:     { },
  heroStat:      { textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 20px', border: '1px solid rgba(255,255,255,0.2)' },
  heroStatNum:   { fontSize: 28, fontWeight: 800, color: '#fff' },
  heroStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  content:       { padding: '1.5rem 2rem' },
  searchWrap:    { display: 'flex', gap: 10, marginBottom: '1rem' },
  searchBox:     { flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '0 14px' },
  searchIcon:    { fontSize: 16 },
  searchInput:   { flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#1a1a2e', padding: '12px 0', background: 'transparent' },
  clearBtn:      { background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 14 },
  select:        { padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, background: '#fff', color: '#374151', cursor: 'pointer' },
  matieresPills: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' },
  matierePill:   { padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' },
  compteur:      { fontSize: 12, color: '#9ca3af', marginBottom: '1rem' },
  loading:       { display: 'flex', justifyContent: 'center', padding: '3rem' },
  spinner:       { width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #534AB7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  vide:          { textAlign: 'center', color: '#9ca3af', padding: '3rem', fontSize: 15 },
  termesList:    { display: 'flex', flexDirection: 'column', gap: 8 },
  termeCard:     { background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', border: '0.5px solid #e5e7eb', cursor: 'pointer', animation: 'fadeUp 0.4s ease forwards', opacity: 0 },
  termeCardActif:{ border: '1.5px solid #534AB7', background: '#FAFAFE' },
  termeHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  termeNoms:     { display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' },
  termeEs:       { fontSize: 15, fontWeight: 700, color: '#1a1a2e' },
  termeFr:       { fontSize: 13, color: '#534AB7', fontWeight: 500 },
  termeEn:       { fontSize: 12, color: '#9ca3af' },
  termeBadges:   { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 },
  termeBadge:    { fontSize: 11, borderRadius: 20, padding: '2px 10px', fontWeight: 600 },
  termeToggle:   { fontSize: 10, color: '#9ca3af' },
  definition:    { marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #f3f4f6' },
  defLabel:      { fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 },
  defTexte:      { fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0 },
};

export default Glossaire;