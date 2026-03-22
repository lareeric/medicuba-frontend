import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCoursById, ajouterFavori, ajouterNote } from '../services/api';
import { useAuth } from '../context/AuthContext';

function LireCours() {
  const { id }                      = useParams();
  const { utilisateur }             = useAuth();
  const [cours, setCours]           = useState(null);
  const [langue, setLangue]         = useState('es');
  const [loading, setLoading]       = useState(true);
  const [note, setNote]             = useState('');
  const [noteOuverte, setNoteOuverte] = useState(false);
  const [favoriOk, setFavoriOk]     = useState(false);
  const [noteOk, setNoteOk]         = useState(false);
  const navigate                    = useNavigate();

  useEffect(() => {
    charger();
  }, [id]);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await getCoursById(id);
      setCours(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavori = async () => {
    try {
      await ajouterFavori({ cours_id: id });
      setFavoriOk(true);
      setTimeout(() => setFavoriOk(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNote = async () => {
    if (!note.trim()) return;
    try {
      await ajouterNote({ cours_id: id, contenu: note });
      setNote('');
      setNoteOuverte(false);
      setNoteOk(true);
      setTimeout(() => setNoteOk(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatContenu = (texte) => {
    if (!texte) return [];
    return texte.split('\n\n').filter(p => p.trim());
  };

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.loadingSpinner} />
      <p>Chargement du cours...</p>
    </div>
  );

  if (!cours) return (
    <div style={styles.loading}>
      <p>Cours introuvable.</p>
      <button style={styles.btnBack} onClick={() => navigate('/cours')}>← Retour</button>
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .lang-btn:hover { background: #534AB7 !important; color: #fff !important; }
        .lang-btn { transition: all 0.15s ease !important; }
        .action-btn:hover { transform: translateY(-1px) !important; }
        .action-btn { transition: all 0.2s ease !important; }
        .para { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <button style={styles.btnBack} onClick={() => navigate('/cours')}>
            ← Retour aux cours
          </button>
          <div style={styles.headerActions}>
            {/* Toggle langue */}
            <div style={styles.langToggle}>
              {['es', 'fr', 'bi'].map(l => (
                <button
                  key={l}
                  className="lang-btn"
                  style={{
                    ...styles.langBtn,
                    ...(langue === l ? styles.langBtnActif : {})
                  }}
                  onClick={() => setLangue(l)}
                >
                  {l === 'es' ? 'ES' : l === 'fr' ? 'FR' : 'ES+FR'}
                </button>
              ))}
            </div>
            <button
              className="action-btn"
              style={{ ...styles.actionBtn, ...(favoriOk ? styles.actionBtnOk : {}) }}
              onClick={handleFavori}
            >
              {favoriOk ? '★ Ajouté !' : '☆ Favori'}
            </button>
            <button
              className="action-btn"
              style={{ ...styles.actionBtn, ...(noteOuverte ? styles.actionBtnActif : {}) }}
              onClick={() => setNoteOuverte(!noteOuverte)}
            >
              ✏️ Note
            </button>
            <button
              className="action-btn"
              style={styles.actionBtnQuiz}
              onClick={() => navigate(`/quiz?cours_id=${cours.id}`)}
            >
              Quiz →
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div style={styles.main}>
        <div style={styles.content}>

          {/* Titre */}
          <div style={{ ...styles.titreSection, animation: 'fadeIn 0.5s ease forwards' }}>
            <div style={styles.breadcrumb}>
              <span style={styles.breadcrumbItem}>Cours</span>
              <span style={styles.breadcrumbSep}>›</span>
              <span style={styles.breadcrumbItem}>{cours.matiere}</span>
              <span style={styles.breadcrumbSep}>›</span>
              <span style={{ ...styles.breadcrumbItem, color: '#534AB7' }}>{cours.titre_es}</span>
            </div>
            <h1 style={styles.titre}>
              {langue === 'fr' ? cours.titre_fr : cours.titre_es}
            </h1>
            {langue === 'bi' && (
              <h2 style={styles.titreFr}>{cours.titre_fr}</h2>
            )}
            <div style={styles.titreMeta}>
              <span style={styles.badge}>{cours.matiere}</span>
              <span style={styles.badge}>{cours.annee}e année</span>
              <span style={styles.badge}>{cours.duree_minutes} min</span>
              <span style={styles.badge}>{cours.programme}</span>
            </div>
          </div>

          {/* Note rapide */}
          {noteOuverte && (
            <div style={styles.noteBox}>
              <p style={styles.noteLabel}>Ajouter une note pour ce cours</p>
              <textarea
                style={styles.noteInput}
                placeholder="Écris ta note ici..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                autoFocus
              />
              <div style={styles.noteActions}>
                <button style={styles.noteCancelBtn} onClick={() => setNoteOuverte(false)}>Annuler</button>
                <button style={styles.noteSaveBtn} onClick={handleNote}>Sauvegarder</button>
              </div>
            </div>
          )}

          {noteOk && (
            <div style={styles.successMsg}>✓ Note sauvegardée avec succès !</div>
          )}

          {/* Contenu du cours */}
          <div style={styles.coursContent}>
            {langue === 'bi' ? (
              // Mode bilingue : paragraphes côte à côte
              <div style={styles.bilingue}>
                <div style={styles.biCol}>
                  <div style={styles.biColHeader}>
                    <span style={styles.biColBadge}>Español</span>
                  </div>
                  {formatContenu(cours.contenu_es).map((para, i) => (
                    <p key={i} className="para" style={{ ...styles.para, animationDelay: `${i * 0.05}s` }}>
                      {para}
                    </p>
                  ))}
                </div>
                <div style={styles.biDivider} />
                <div style={styles.biCol}>
                  <div style={styles.biColHeader}>
                    <span style={{ ...styles.biColBadge, background: '#E1F5EE', color: '#085041' }}>Français</span>
                  </div>
                  {formatContenu(cours.contenu_fr).map((para, i) => (
                    <p key={i} className="para" style={{ ...styles.para, color: '#4b5563', animationDelay: `${i * 0.05}s` }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              // Mode simple
              <div>
                {formatContenu(langue === 'es' ? cours.contenu_es : cours.contenu_fr).map((para, i) => (
                  <p key={i} className="para" style={{ ...styles.para, animationDelay: `${i * 0.08}s` }}>
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Footer du cours */}
          <div style={styles.coursFooter}>
            <button style={styles.btnQuizFull} onClick={() => navigate(`/quiz?cours_id=${cours.id}`)}>
              Faire le quiz de ce cours →
            </button>
            <button style={styles.btnRetour} onClick={() => navigate('/cours')}>
              ← Retour aux cours
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page:           { minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' },
  loading:        { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, color: '#6b7280' },
  loadingSpinner: { width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #534AB7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  header:         { background: '#fff', borderBottom: '0.5px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 },
  headerInner:    { maxWidth: 900, margin: '0 auto', padding: '0 2rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  btnBack:        { fontSize: 13, color: '#6b7280', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 },
  headerActions:  { display: 'flex', alignItems: 'center', gap: 8 },
  langToggle:     { display: 'flex', gap: 2, background: '#f3f4f6', borderRadius: 8, padding: 3 },
  langBtn:        { padding: '4px 10px', fontSize: 12, fontWeight: 600, background: 'transparent', border: 'none', borderRadius: 6, color: '#6b7280', cursor: 'pointer' },
  langBtnActif:   { background: '#534AB7', color: '#fff' },
  actionBtn:      { padding: '6px 14px', fontSize: 12, fontWeight: 600, background: '#f3f4f6', border: '0.5px solid #e5e7eb', borderRadius: 8, color: '#374151', cursor: 'pointer' },
  actionBtnOk:    { background: '#E1F5EE', color: '#085041', borderColor: '#1D9E75' },
  actionBtnActif: { background: '#EEEDFE', color: '#3C3489', borderColor: '#534AB7' },
  actionBtnQuiz:  { padding: '6px 14px', fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg,#534AB7,#7C3AED)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' },
  main:           { maxWidth: 900, margin: '0 auto', padding: '2rem' },
  content:        { background: '#fff', borderRadius: 16, border: '0.5px solid #e5e7eb', overflow: 'hidden' },
  titreSection:   { padding: '2rem 2.5rem', borderBottom: '0.5px solid #f3f4f6', opacity: 0 },
  breadcrumb:     { display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem' },
  breadcrumbItem: { fontSize: 13, color: '#9ca3af' },
  breadcrumbSep:  { fontSize: 13, color: '#d1d5db' },
  titre:          { fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 6px', lineHeight: 1.2 },
  titreFr:        { fontSize: 18, fontWeight: 500, color: '#6b7280', margin: '0 0 12px' },
  titreMeta:      { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 },
  badge:          { fontSize: 12, background: '#EEEDFE', color: '#3C3489', borderRadius: 20, padding: '3px 12px', fontWeight: 500 },
  noteBox:        { margin: '1.5rem 2.5rem', background: '#FAFAFA', borderRadius: 12, padding: '1.25rem', border: '1px solid #e5e7eb' },
  noteLabel:      { fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 8px' },
  noteInput:      { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'system-ui', resize: 'vertical', boxSizing: 'border-box', color: '#1a1a2e' },
  noteActions:    { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  noteCancelBtn:  { padding: '6px 16px', background: 'transparent', border: '0.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#6b7280', cursor: 'pointer' },
  noteSaveBtn:    { padding: '6px 16px', background: '#534AB7', border: 'none', borderRadius: 8, fontSize: 13, color: '#fff', fontWeight: 600, cursor: 'pointer' },
  successMsg:     { margin: '0 2.5rem 1rem', background: '#E1F5EE', color: '#085041', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 500, border: '1px solid #1D9E75' },
  coursContent:   { padding: '2rem 2.5rem' },
  para:           { fontSize: 15, color: '#374151', lineHeight: 1.85, margin: '0 0 1.25rem', opacity: 0 },
  bilingue:       { display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '1.5rem' },
  biCol:          { },
  biColHeader:    { marginBottom: '1rem' },
  biColBadge:     { fontSize: 12, fontWeight: 700, background: '#EEEDFE', color: '#3C3489', borderRadius: 20, padding: '4px 14px' },
  biDivider:      { background: '#f3f4f6', width: 1 },
  coursFooter:    { padding: '1.5rem 2.5rem', borderTop: '0.5px solid #f3f4f6', display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' },
  btnQuizFull:    { padding: '10px 24px', background: 'linear-gradient(135deg,#534AB7,#7C3AED)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  btnRetour:      { fontSize: 13, color: '#6b7280', background: 'transparent', border: 'none', cursor: 'pointer' },
};

export default LireCours;