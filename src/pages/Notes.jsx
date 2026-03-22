import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotes, ajouterNote, supprimerNote, getFavoris, supprimerFavori, getCours } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Notes() {
  const { utilisateur }           = useAuth();
  const [notes, setNotes]         = useState([]);
  const [favoris, setFavoris]     = useState([]);
  const [cours, setCours]         = useState([]);
  const [onglet, setOnglet]       = useState('notes');
  const [contenu, setContenu]     = useState('');
  const [coursId, setCoursId]     = useState('');
  const [loading, setLoading]     = useState(true);
  const navigate                  = useNavigate();

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const [notesRes, favorisRes, coursRes] = await Promise.all([
        getNotes(), getFavoris(), getCours({ annee: utilisateur.annee_etudes }),
      ]);
      setNotes(notesRes.data);
      setFavoris(favorisRes.data);
      setCours(coursRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAjouterNote = async (e) => {
    e.preventDefault();
    if (!contenu.trim() || !coursId) return;
    try {
      await ajouterNote({ cours_id: coursId, contenu });
      setContenu(''); setCoursId('');
      charger();
    } catch (err) { console.error(err); }
  };

  const handleSupprimerNote = async (id) => {
    try {
      await supprimerNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleSupprimerFavori = async (id) => {
    try {
      await supprimerFavori(id);
      setFavoris(favoris.filter(f => f.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleNav = (item) => {
    if (item === 'Accueil')   navigate('/');
    if (item === 'Cours')     navigate('/cours');
    if (item === 'Quiz')      navigate('/quiz');
    if (item === 'Glossaire') navigate('/glossaire');
    if (item === 'Planning')  navigate('/planning');
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .nav-item:hover { background: rgba(255,255,255,0.12) !important; color: #fff !important; }
        .note-card:hover { border-color: #534AB7 !important; }
        .note-card { transition: all 0.18s ease !important; }
        .del-btn:hover { background: #FEF2F2 !important; color: #DC2626 !important; }
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
                  style={{ ...styles.navItem, ...(item === 'Notes' ? styles.navItemActif : {}) }}
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
                <h1 style={styles.heroTitle}>✏️ Notes & Favoris</h1>
                <p style={styles.heroSub}>{notes.length} note(s) · {favoris.length} favori(s)</p>
              </div>
            </div>
          </div>

          <div style={styles.content}>
            {/* Onglets */}
            <div style={styles.onglets}>
              <div style={{ ...styles.onglet, ...(onglet === 'notes' ? styles.ongletActif : {}) }}
                onClick={() => setOnglet('notes')}>
                ✏️ Mes notes ({notes.length})
              </div>
              <div style={{ ...styles.onglet, ...(onglet === 'favoris' ? styles.ongletActif : {}) }}
                onClick={() => setOnglet('favoris')}>
                ★ Mes favoris ({favoris.length})
              </div>
            </div>

            {loading ? (
              <div style={styles.loading}><div style={styles.spinner} /></div>
            ) : onglet === 'notes' ? (
              <div>
                {/* Formulaire */}
                <div style={styles.formCard}>
                  <h3 style={styles.formTitle}>Ajouter une note</h3>
                  <form onSubmit={handleAjouterNote} style={styles.form}>
                    <select style={styles.select} value={coursId}
                      onChange={e => setCoursId(e.target.value)} required>
                      <option value="">Choisir un cours...</option>
                      {cours.map(c => (
                        <option key={c.id} value={c.id}>{c.titre_es}</option>
                      ))}
                    </select>
                    <textarea style={styles.textarea}
                      placeholder="Écris ta note ici..."
                      value={contenu}
                      onChange={e => setContenu(e.target.value)}
                      rows={3} required />
                    <button style={styles.btnSubmit} type="submit">
                      + Ajouter la note
                    </button>
                  </form>
                </div>

                {/* Liste notes */}
                {notes.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>✏️</div>
                    <p style={styles.emptyTitle}>Aucune note pour l'instant</p>
                    <p style={styles.emptyDesc}>Commence à prendre des notes sur tes cours !</p>
                  </div>
                ) : (
                  <div style={styles.liste}>
                    {notes.map((n, i) => (
                      <div key={n.id} className="note-card"
                        style={{ ...styles.noteCard, animationDelay: `${i * 0.05}s` }}>
                        <div style={styles.noteHeader}>
                          <div>
                            <div style={styles.noteTitre}>{n.titre_es}</div>
                            <div style={styles.noteMeta}>
                              <span style={styles.noteMatiere}>{n.matiere}</span>
                              <span style={styles.noteDate}>
                                {new Date(n.cree_le).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                          <button className="del-btn" style={styles.delBtn}
                            onClick={() => handleSupprimerNote(n.id)}>
                            Supprimer
                          </button>
                        </div>
                        <p style={styles.noteContenu}>{n.contenu}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {favoris.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>★</div>
                    <p style={styles.emptyTitle}>Aucun favori pour l'instant</p>
                    <p style={styles.emptyDesc}>Ajoute des cours en favoris depuis la liste des cours !</p>
                    <button style={styles.btnPrimary} onClick={() => navigate('/cours')}>
                      Voir les cours →
                    </button>
                  </div>
                ) : (
                  <div style={styles.liste}>
                    {favoris.map((f, i) => (
                      <div key={f.id} className="note-card"
                        style={{ ...styles.noteCard, animationDelay: `${i * 0.05}s` }}>
                        <div style={styles.noteHeader}>
                          <div>
                            <div style={styles.noteTitre}>{f.titre_es}</div>
                            <div style={styles.noteMeta}>
                              <span style={styles.noteMatiere}>{f.matiere}</span>
                              <span style={styles.noteDate}>{f.annee}e année · {f.duree_minutes} min</span>
                            </div>
                          </div>
                          <div style={styles.favActions}>
                            <button style={styles.quizBtn}
                              onClick={() => navigate(`/quiz?cours_id=${f.cours_id}`)}>
                              Quiz
                            </button>
                            <button style={styles.lireBtn}
                              onClick={() => navigate(`/cours/${f.cours_id}`)}>
                              Lire →
                            </button>
                            <button className="del-btn" style={styles.delBtn}
                              onClick={() => handleSupprimerFavori(f.id)}>
                              Retirer
                            </button>
                          </div>
                        </div>
                        <p style={styles.noteContenu}>{f.titre_fr}</p>
                      </div>
                    ))}
                  </div>
                )}
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
  heroBg:        { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#F97316,#EA580C,#534AB7)', backgroundSize: '200% 200%', animation: 'gradShift 8s ease infinite', opacity: 0.92 },
  heroContent:   { position: 'relative', zIndex: 1 },
  heroTitle:     { fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 4px' },
  heroSub:       { fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 },
  content:       { padding: '1.5rem 2rem' },
  onglets:       { display: 'flex', gap: 0, marginBottom: '1.5rem', background: '#fff', borderRadius: 12, padding: 4, border: '0.5px solid #e5e7eb' },
  onglet:        { flex: 1, padding: '10px', fontSize: 13, fontWeight: 600, color: '#6b7280', cursor: 'pointer', borderRadius: 10, textAlign: 'center', transition: 'all 0.15s ease' },
  ongletActif:   { background: 'linear-gradient(135deg,#534AB7,#7C3AED)', color: '#fff' },
  loading:       { display: 'flex', justifyContent: 'center', padding: '3rem' },
  spinner:       { width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #534AB7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  formCard:      { background: '#fff', borderRadius: 16, padding: '1.5rem', border: '0.5px solid #e5e7eb', marginBottom: '1.5rem' },
  formTitle:     { fontSize: 15, fontWeight: 700, color: '#1a1a2e', margin: '0 0 1rem' },
  form:          { display: 'flex', flexDirection: 'column', gap: 10 },
  select:        { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, color: '#374151', background: '#fafafa' },
  textarea:      { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'system-ui', resize: 'vertical', color: '#1a1a2e', background: '#fafafa' },
  btnSubmit:     { padding: '10px', background: 'linear-gradient(135deg,#534AB7,#7C3AED)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', paddingLeft: 20, paddingRight: 20 },
  emptyState:    { textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 16, border: '0.5px solid #e5e7eb' },
  emptyIcon:     { fontSize: 40, marginBottom: 12 },
  emptyTitle:    { fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px' },
  emptyDesc:     { fontSize: 13, color: '#6b7280', margin: '0 0 16px' },
  btnPrimary:    { padding: '10px 24px', background: 'linear-gradient(135deg,#534AB7,#7C3AED)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  liste:         { display: 'flex', flexDirection: 'column', gap: 10 },
  noteCard:      { background: '#fff', borderRadius: 14, padding: '1.25rem', border: '0.5px solid #e5e7eb', animation: 'fadeUp 0.4s ease forwards', opacity: 0 },
  noteHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  noteTitre:     { fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 },
  noteMeta:      { display: 'flex', gap: 8, alignItems: 'center' },
  noteMatiere:   { fontSize: 11, background: '#EEEDFE', color: '#3C3489', borderRadius: 20, padding: '2px 10px', fontWeight: 600 },
  noteDate:      { fontSize: 11, color: '#9ca3af' },
  noteContenu:   { fontSize: 13, color: '#4b5563', lineHeight: 1.65, margin: 0, background: '#f9fafb', borderRadius: 8, padding: '10px 12px' },
  favActions:    { display: 'flex', gap: 6 },
  quizBtn:       { padding: '5px 12px', background: '#EEEDFE', color: '#3C3489', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  lireBtn:       { padding: '5px 12px', background: '#E1F5EE', color: '#085041', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  delBtn:        { padding: '5px 12px', background: '#f9fafb', color: '#6b7280', border: '0.5px solid #e5e7eb', borderRadius: 20, fontSize: 11, cursor: 'pointer', transition: 'all 0.15s ease' },
};

export default Notes;