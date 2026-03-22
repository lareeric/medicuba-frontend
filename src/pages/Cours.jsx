import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCours, ajouterFavori } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Cours() {
  const { utilisateur }         = useAuth();
  const [cours, setCours]       = useState([]);
  const [filtre, setFiltre]     = useState({ annee: '', matiere: '' });
  const [loading, setLoading]   = useState(true);
  const navigate                = useNavigate();

  useEffect(() => { charger(); }, [filtre]);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await getCours(filtre);
      setCours(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavori = async (e, cours_id) => {
    e.stopPropagation();
    try {
      await ajouterFavori({ cours_id });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNav = (item) => {
    if (item === 'Accueil')   navigate('/');
    if (item === 'Quiz')      navigate('/quiz');
    if (item === 'Glossaire') navigate('/glossaire');
    if (item === 'Notes')     navigate('/notes');
    if (item === 'Planning')  navigate('/planning');
  };

  const matieres = [...new Set(cours.map(c => c.matiere))];

  const matiereColors = {
    'Anatomie':      '#534AB7',
    'Physiologie':   '#1D9E75',
    'Biochimie':     '#F97316',
    'Histologie':    '#7C3AED',
    'Sémiologie':    '#DC2626',
    'Pathologie':    '#0891B2',
    'Pharmacologie': '#D97706',
    'Chirurgie':     '#059669',
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .nav-item:hover { background: rgba(255,255,255,0.12) !important; color: #fff !important; }
        .cours-card:hover { border-color: #534AB7 !important; transform: translateY(-2px) !important; box-shadow: 0 4px 20px rgba(83,74,183,0.1) !important; }
        .cours-card { transition: all 0.2s ease !important; }
        .fav-btn:hover { background: #EEEDFE !important; color: #534AB7 !important; }
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
                  style={{ ...styles.navItem, ...(item === 'Cours' ? styles.navItemActif : {}) }}
                  onClick={() => handleNav(item)}
                >
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
                <h1 style={styles.heroTitle}>📚 Tous les cours</h1>
                <p style={styles.heroSub}>Programme officiel MINSAP · {cours.length} cours disponibles</p>
              </div>
            </div>
          </div>

          <div style={styles.content}>
            {/* Filtres */}
            <div style={styles.filtresBar}>
              <div style={styles.filtresLeft}>
                <select style={styles.select} value={filtre.annee}
                  onChange={e => setFiltre({ ...filtre, annee: e.target.value })}>
                  <option value="">Toutes les années</option>
                  {[1,2,3,4,5,6].map(a => <option key={a} value={a}>{a}e année</option>)}
                </select>
                <select style={styles.select} value={filtre.matiere}
                  onChange={e => setFiltre({ ...filtre, matiere: e.target.value })}>
                  <option value="">Toutes les matières</option>
                  {matieres.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={styles.filtresCount}>{cours.length} cours</div>
            </div>

            {/* Matières pills */}
            <div style={styles.matieresPills}>
              <div style={{ ...styles.matierePill, background: !filtre.matiere ? '#534AB7' : '#f3f4f6', color: !filtre.matiere ? '#fff' : '#374151' }}
                onClick={() => setFiltre({ ...filtre, matiere: '' })}>
                Tout
              </div>
              {matieres.map(m => (
                <div key={m} style={{
                  ...styles.matierePill,
                  background: filtre.matiere === m ? (matiereColors[m] || '#534AB7') : '#f3f4f6',
                  color: filtre.matiere === m ? '#fff' : '#374151',
                }}
                  onClick={() => setFiltre({ ...filtre, matiere: filtre.matiere === m ? '' : m })}>
                  {m}
                </div>
              ))}
            </div>

            {/* Liste */}
            {loading ? (
              <div style={styles.loading}><div style={styles.spinner} /></div>
            ) : cours.length === 0 ? (
              <div style={styles.vide}>Aucun cours trouvé</div>
            ) : (
              <div style={styles.coursList}>
                {cours.map((c, i) => (
                  <div key={c.id} className="cours-card"
                    style={{ ...styles.coursCard, animationDelay: `${i * 0.04}s`, borderLeft: `4px solid ${matiereColors[c.matiere] || '#534AB7'}` }}
                    onClick={() => navigate(`/cours/${c.id}`)}>
                    <div style={styles.coursLeft}>
                      <div style={{ ...styles.coursMatiereDot, background: matiereColors[c.matiere] || '#534AB7' }} />
                      <div>
                        <div style={styles.coursTitre}>{c.titre_es}</div>
                        <div style={styles.coursFr}>{c.titre_fr}</div>
                        <div style={styles.coursMeta}>
                          <span style={{ ...styles.coursMetaTag, background: (matiereColors[c.matiere] || '#534AB7') + '18', color: matiereColors[c.matiere] || '#534AB7' }}>{c.matiere}</span>
                          <span style={styles.coursMetaText}>{c.annee}e année</span>
                          <span style={styles.coursMetaText}>{c.duree_minutes} min</span>
                          <span style={styles.coursMetaText}>{c.programme}</span>
                        </div>
                      </div>
                    </div>
                    <div style={styles.coursRight}>
                      <button className="fav-btn" style={styles.favBtn}
                        onClick={(e) => handleFavori(e, c.id)}>☆</button>
                      <button style={styles.quizBtn}
                        onClick={(e) => { e.stopPropagation(); navigate(`/quiz?cours_id=${c.id}`); }}>
                        Quiz
                      </button>
                      <span style={styles.arrow}>›</span>
                    </div>
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
  userCard:       { display: 'flex', alignItems: 'center', gap: 10 },
  userAvatar:     { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#534AB7,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 },
  userName:       { fontSize: 13, fontWeight: 600, color: '#fff' },
  userAnnee:      { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  main:           { flex: 1, overflow: 'auto' },
  heroHeader:     { position: 'relative', overflow: 'hidden', padding: '2rem' },
  heroBg:         { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#534AB7,#7C3AED,#F97316)', backgroundSize: '200% 200%', animation: 'gradShift 8s ease infinite', opacity: 0.92 },
  heroContent:    { position: 'relative', zIndex: 1 },
  heroTitle:      { fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 4px' },
  heroSub:        { fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 },
  content:        { padding: '1.5rem 2rem' },
  filtresBar:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  filtresLeft:    { display: 'flex', gap: 10 },
  select:         { padding: '8px 12px', borderRadius: 10, border: '0.5px solid #e5e7eb', fontSize: 13, background: '#fff', color: '#374151', cursor: 'pointer' },
  filtresCount:   { fontSize: 13, color: '#9ca3af', fontWeight: 500 },
  matieresPills:  { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' },
  matierePill:    { padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' },
  loading:        { display: 'flex', justifyContent: 'center', padding: '3rem' },
  spinner:        { width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #534AB7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  vide:           { textAlign: 'center', color: '#9ca3af', padding: '3rem', fontSize: 15 },
  coursList:      { display: 'flex', flexDirection: 'column', gap: 10 },
  coursCard:      { background: '#fff', borderRadius: 14, padding: '1.1rem 1.25rem', border: '0.5px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', animation: 'fadeUp 0.4s ease forwards', opacity: 0 },
  coursLeft:      { display: 'flex', alignItems: 'center', gap: 14, flex: 1 },
  coursMatiereDot:{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  coursTitre:     { fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 2 },
  coursFr:        { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  coursMeta:      { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  coursMetaTag:   { fontSize: 11, borderRadius: 20, padding: '2px 10px', fontWeight: 600 },
  coursMetaText:  { fontSize: 11, color: '#9ca3af' },
  coursRight:     { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  favBtn:         { width: 32, height: 32, borderRadius: '50%', background: '#f9fafb', border: '0.5px solid #e5e7eb', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' },
  quizBtn:        { padding: '5px 14px', background: '#EEEDFE', color: '#3C3489', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  arrow:          { fontSize: 20, color: '#d1d5db', fontWeight: 300 },
};

export default Cours;