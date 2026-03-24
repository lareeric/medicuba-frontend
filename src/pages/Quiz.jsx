import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getQuizByCours, soumettreReponse } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Quiz() {
  const { utilisateur }                     = useAuth();
  const [searchParams]                      = useSearchParams();
  const cours_id                            = searchParams.get('cours_id');
  const [questions, setQuestions]           = useState([]);
  const [index, setIndex]                   = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState(null);
  const [resultat, setResultat]             = useState(null);
  const [score, setScore]                   = useState(0);
  const [termine, setTermine]               = useState(false);
  const [loading, setLoading]               = useState(false);
  const navigate                            = useNavigate();
  const isAdmin = utilisateur?.is_admin === true;

  useEffect(() => {
    if (cours_id) charger();
  }, [cours_id]);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await getQuizByCours(cours_id);
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const choisirReponse = async (idx) => {
    if (reponseChoisie !== null) return;
    setReponseChoisie(idx);
    try {
      const res = await soumettreReponse({ quiz_id: questions[index].id, reponse: idx });
      setResultat(res.data);
      if (res.data.reussi) setScore(s => s + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const questionSuivante = () => {
    if (index + 1 >= questions.length) {
      setTermine(true);
    } else {
      setIndex(i => i + 1);
      setReponseChoisie(null);
      setResultat(null);
    }
  };

  const handleNav = (item) => {
    if (item === 'Accueil')   navigate('/');
    if (item === 'Cours')     navigate('/cours');
    if (item === 'Glossaire') navigate('/glossaire');
    if (item === 'Notes')     navigate('/notes');
    if (item === 'Planning')  navigate('/planning');
  };

  const getOptStyle = (idx) => {
    if (reponseChoisie === null) return styles.option;
    if (idx === resultat?.bonne_reponse) return { ...styles.option, ...styles.optCorrect };
    if (idx === reponseChoisie && !resultat?.reussi) return { ...styles.option, ...styles.optIncorrect };
    return { ...styles.option, ...styles.optGrise };
  };

  const scorePct = Math.round((score / questions.length) * 100);

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
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        .nav-item:hover { background: rgba(255,255,255,0.12) !important; color: #fff !important; }
        .opt-btn:hover { border-color: #534AB7 !important; background: #FAFAFE !important; }
        .opt-btn { transition: all 0.15s ease !important; }
        .btn-next:hover { transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(83,74,183,0.3) !important; }
        .btn-next { transition: all 0.2s ease !important; }

        /* ══════════════════════════════════
           RESPONSIVE MOBILE
        ══════════════════════════════════ */
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .main-content    { margin-left: 0 !important; }
          .page-layout     { padding-bottom: 70px !important; }

          .hero-header  { padding: 1.25rem 1rem !important; }
          .hero-title   { font-size: 20px !important; }
          .hero-sub     { font-size: 12px !important; }

          .content-pad  { padding: 1rem !important; max-width: 100% !important; }

          .question-es  { font-size: 15px !important; }
          .option-item  { padding: 10px 12px !important; gap: 10px !important; }
          .opt-letter   { width: 28px !important; height: 28px !important; font-size: 12px !important; flex-shrink: 0 !important; }

          .resultat-card { padding: 2rem 1.25rem !important; }
          .score-circle  { width: 110px !important; height: 110px !important; }
          .score-num     { font-size: 28px !important; }
          .resultat-btns { flex-direction: column !important; }
          .resultat-btns button { width: 100% !important; }

          .bottom-nav   { display: flex !important; }
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
                  style={{ ...styles.navItem, ...(item.label === 'Quiz' ? styles.navItemActif : {}) }}
                  onClick={() => item.label === 'Quiz' ? null : handleNav(item.label)}>
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
            <div style={styles.heroContent}>
              <h1 className="hero-title" style={styles.heroTitle}>🧠 Quiz interactif</h1>
              <p className="hero-sub" style={styles.heroSub}>Teste tes connaissances médicales</p>
            </div>
          </div>

          <div className="content-pad" style={styles.content}>
            {loading ? (
              <div style={styles.loading}><div style={styles.spinner} /></div>

            ) : !cours_id ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🧠</div>
                <h3 style={styles.emptyTitle}>Choisir un cours</h3>
                <p style={styles.emptyDesc}>Sélectionne un cours pour commencer le quiz correspondant.</p>
                <button style={styles.btnPrimary} onClick={() => navigate('/cours')}>
                  Voir les cours →
                </button>
              </div>

            ) : questions.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📝</div>
                <h3 style={styles.emptyTitle}>Aucune question</h3>
                <p style={styles.emptyDesc}>Ce cours n'a pas encore de questions de quiz.</p>
                <button style={styles.btnPrimary} onClick={() => navigate('/cours')}>
                  Retour aux cours
                </button>
              </div>

            ) : termine ? (
              <div style={{ ...styles.resultatWrap, animation: 'scaleIn 0.5s ease forwards' }}>
                <div className="resultat-card" style={styles.resultatCard}>
                  <div className="score-circle" style={{
                    ...styles.scoreCircle,
                    background: scorePct >= 70 ? 'linear-gradient(135deg,#1D9E75,#0F6E56)' : scorePct >= 40 ? 'linear-gradient(135deg,#F97316,#EA580C)' : 'linear-gradient(135deg,#DC2626,#B91C1C)',
                  }}>
                    <div className="score-num" style={styles.scoreNum}>{scorePct}%</div>
                    <div style={styles.scoreSub}>{score}/{questions.length}</div>
                  </div>
                  <h2 style={styles.resultatTitre}>
                    {scorePct >= 70 ? '🎉 Excellent !' : scorePct >= 40 ? '💪 Pas mal !' : '📚 Continue à réviser'}
                  </h2>
                  <p style={styles.resultatDesc}>
                    {scorePct >= 70 ? 'Tu maîtrises bien ce chapitre !' : scorePct >= 40 ? 'Tu progresses bien, continue !' : 'Relis le cours et réessaie !'}
                  </p>
                  <div className="resultat-btns" style={styles.resultatBtns}>
                    <button style={styles.btnPrimary} onClick={() => navigate('/cours')}>
                      Retour aux cours
                    </button>
                    <button style={styles.btnSecondaire} onClick={() => {
                      setIndex(0); setScore(0); setTermine(false);
                      setReponseChoisie(null); setResultat(null); charger();
                    }}>
                      Recommencer
                    </button>
                  </div>
                </div>
              </div>

            ) : (
              <div style={styles.quizWrap}>
                {/* Progression */}
                <div style={styles.progSection}>
                  <div style={styles.progInfo}>
                    <span style={styles.progLabel}>Question {index + 1} sur {questions.length}</span>
                    <span style={styles.progScore}>Score : {score} ✓</span>
                  </div>
                  <div style={styles.progBar}>
                    <div style={{ ...styles.progFill, width: `${((index) / questions.length) * 100}%` }} />
                  </div>
                </div>

                {/* Question */}
                <div style={styles.questionCard}>
                  <div style={styles.questionBadge}>Question {index + 1}</div>
                  <p className="question-es" style={styles.questionEs}>{questions[index].question_es}</p>
                  <p style={styles.questionFr}>{questions[index].question_fr}</p>
                </div>

                {/* Options */}
                <div style={styles.options}>
                  {questions[index].options.map((opt, idx) => (
                    <div key={idx} className="opt-btn option-item"
                      style={getOptStyle(idx)}
                      onClick={() => choisirReponse(idx)}>
                      <div className="opt-letter" style={{
                        ...styles.optLetter,
                        background: reponseChoisie !== null && idx === resultat?.bonne_reponse ? '#1D9E75' :
                                    reponseChoisie !== null && idx === reponseChoisie && !resultat?.reussi ? '#DC2626' : '#EEEDFE',
                        color: reponseChoisie !== null && (idx === resultat?.bonne_reponse || (idx === reponseChoisie && !resultat?.reussi)) ? '#fff' : '#534AB7',
                      }}>
                        {['A','B','C','D'][idx]}
                      </div>
                      <div>
                        <div style={styles.optEs}>{opt.es}</div>
                        <div style={styles.optFr}>{opt.fr}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Explication */}
                {resultat && (
                  <div style={{
                    ...styles.explication,
                    background: resultat.reussi ? '#E1F5EE' : '#FEF2F2',
                    border: `1px solid ${resultat.reussi ? '#1D9E75' : '#DC2626'}`,
                    color: resultat.reussi ? '#085041' : '#991B1B',
                  }}>
                    <div style={styles.explHeader}>
                      <span style={styles.explIcon}>{resultat.reussi ? '✓' : '✗'}</span>
                      <span style={styles.explTitre}>{resultat.reussi ? 'Correct !' : 'Incorrect'}</span>
                    </div>
                    <p style={styles.explTexte}>{resultat.explication_fr}</p>
                  </div>
                )}

                {/* Bouton suivant */}
                {reponseChoisie !== null && (
                  <button className="btn-next" style={styles.btnNext} onClick={questionSuivante}>
                    {index + 1 >= questions.length ? 'Voir le résultat final →' : 'Question suivante →'}
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Bottom nav mobile ── */}
      <div className="bottom-nav">
        {navItems.map(item => (
          <div key={item.label}
            className={`bottom-nav-item ${item.label === 'Quiz' ? 'actif' : ''}`}
            onClick={() => item.label === 'Quiz' ? null : navigate(item.path)}>
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </div>
        ))}
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
  userCard:      { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  userAvatar:    { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#534AB7,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 },
  userName:      { fontSize: 13, fontWeight: 600, color: '#fff' },
  userAnnee:     { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  logoutBtn:     { width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontWeight: 500 },
  main:          { flex: 1, overflow: 'auto' },
  heroHeader:    { position: 'relative', overflow: 'hidden', padding: '2rem' },
  heroBg:        { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#7C3AED,#534AB7,#1D9E75)', backgroundSize: '200% 200%', animation: 'gradShift 8s ease infinite', opacity: 0.92 },
  heroContent:   { position: 'relative', zIndex: 1 },
  heroTitle:     { fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 4px' },
  heroSub:       { fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 },
  content:       { padding: '1.5rem 2rem', maxWidth: 700, margin: '0 auto' },
  loading:       { display: 'flex', justifyContent: 'center', padding: '4rem' },
  spinner:       { width: 36, height: 36, border: '3px solid #e5e7eb', borderTop: '3px solid #534AB7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  emptyState:    { textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: 20, border: '0.5px solid #e5e7eb' },
  emptyIcon:     { fontSize: 48, marginBottom: 16 },
  emptyTitle:    { fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' },
  emptyDesc:     { fontSize: 14, color: '#6b7280', margin: '0 0 24px' },
  quizWrap:      { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  progSection:   { background: '#fff', borderRadius: 14, padding: '1.25rem', border: '0.5px solid #e5e7eb' },
  progInfo:      { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  progLabel:     { fontSize: 13, fontWeight: 600, color: '#374151' },
  progScore:     { fontSize: 13, color: '#1D9E75', fontWeight: 600 },
  progBar:       { height: 8, background: '#f3f4f6', borderRadius: 4 },
  progFill:      { height: '100%', background: 'linear-gradient(90deg,#534AB7,#F97316)', borderRadius: 4, transition: 'width 0.4s ease' },
  questionCard:  { background: '#fff', borderRadius: 14, padding: '1.5rem', border: '0.5px solid #e5e7eb' },
  questionBadge: { display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#534AB7', background: '#EEEDFE', borderRadius: 20, padding: '3px 12px', marginBottom: 14 },
  questionEs:    { fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px', lineHeight: 1.4 },
  questionFr:    { fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.5 },
  options:       { display: 'flex', flexDirection: 'column', gap: 10 },
  option:        { display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', cursor: 'pointer' },
  optCorrect:    { border: '1.5px solid #1D9E75', background: '#F0FDF4' },
  optIncorrect:  { border: '1.5px solid #DC2626', background: '#FEF2F2' },
  optGrise:      { opacity: 0.45, cursor: 'default' },
  optLetter:     { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, transition: 'all 0.2s ease' },
  optEs:         { fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 2 },
  optFr:         { fontSize: 12, color: '#9ca3af' },
  explication:   { borderRadius: 12, padding: '14px 16px' },
  explHeader:    { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  explIcon:      { fontSize: 18, fontWeight: 700 },
  explTitre:     { fontSize: 15, fontWeight: 700 },
  explTexte:     { fontSize: 13, lineHeight: 1.65, margin: 0 },
  btnNext:       { padding: '14px', background: 'linear-gradient(135deg,#534AB7,#7C3AED)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%' },
  resultatWrap:  { display: 'flex', justifyContent: 'center', padding: '2rem 0', opacity: 0 },
  resultatCard:  { background: '#fff', borderRadius: 24, padding: '3rem 2.5rem', border: '0.5px solid #e5e7eb', textAlign: 'center', maxWidth: 400, width: '100%' },
  scoreCircle:   { width: 140, height: 140, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' },
  scoreNum:      { fontSize: 36, fontWeight: 800, color: '#fff' },
  scoreSub:      { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  resultatTitre: { fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' },
  resultatDesc:  { fontSize: 14, color: '#6b7280', margin: '0 0 2rem' },
  resultatBtns:  { display: 'flex', gap: 10, justifyContent: 'center' },
  btnPrimary:    { padding: '10px 24px', background: 'linear-gradient(135deg,#534AB7,#7C3AED)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  btnSecondaire: { padding: '10px 24px', background: '#f3f4f6', border: '0.5px solid #e5e7eb', borderRadius: 10, color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};

export default Quiz;