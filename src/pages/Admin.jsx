import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
getAdminStats, getAdminUtilisateurs, supprimerUtilisateur,
getAdminVersets, ajouterAdminVerset, modifierAdminVerset, supprimerAdminVerset
} from '../services/api';
import { useAuth } from '../context/AuthContext';
function Admin() {
const { utilisateur } = useAuth();
const isAdmin = utilisateur?.is_admin === true;
const [onglet, setOnglet] = useState('stats');
const [stats, setStats] = useState(null);
const [users, setUsers] = useState([]);
const [versets, setVersets] = useState([]);
const [loading, setLoading] = useState(true);
const [formVerset, setFormVerset] = useState(
{ reference: '', texte_es: '', texte_fr: '', date_affichage: '' }
);
const [editId, setEditId] = useState(null);
const navigate = useNavigate();
useEffect(() => {
if (!isAdmin) { navigate('/'); return; }
charger();
}, []);
const charger = async () => {
setLoading(true);
try {
const [statsRes, usersRes, versetsRes] = await Promise.all([
getAdminStats(), getAdminUtilisateurs(), getAdminVersets(),
]);
setStats(statsRes.data);
setUsers(usersRes.data);
setVersets(versetsRes.data);
} catch (err) { console.error(err); }
finally { setLoading(false); }
};
const handleSupprimerUser = async (id) => {
if (!window.confirm('Supprimer cet utilisateur ?')) return;
try {
await supprimerUtilisateur(id);
setUsers(users.filter(u => u.id !== id));
} catch (err) { console.error(err); }
};
const handleSubmitVerset = async (e) => {
e.preventDefault();
try {
if (editId) { await modifierAdminVerset(editId, formVerset); }
else { await ajouterAdminVerset(formVerset); }
setFormVerset({ reference:'', texte_es:'', texte_fr:'', date_affichage:'' });
setEditId(null);
charger();
} catch (err) { console.error(err); }
};
const handleEditVerset = (v) => {
setEditId(v.id);
setFormVerset({
reference: v.reference, texte_es: v.texte_es,
texte_fr: v.texte_fr || '',
date_affichage: v.date_affichage?.split('T')[0] || '',
});
};
const handleSupprimerVerset = async (id) => {
if (!window.confirm('Supprimer ce verset ?')) return;
try { await supprimerAdminVerset(id); charger(); }
catch (err) { console.error(err); }
};
if (loading) return <div style={s.loading}>Chargement...</div>;
return (
<div style={s.page}>
<div style={s.header}>
<div style={s.headerLeft}>
<div style={s.logoIcon}>M</div>
<div>
<div style={s.headerTitle}>Panel Administrateur</div>
<div style={s.headerSub}>MediCuba ES</div>
</div>
</div>
<button style={s.backBtn} onClick={() => navigate('/')}>Retour au site</button>
</div>
<div style={s.main}>
<div style={s.onglets}>
{[['stats','Statistiques'],['users','Utilisateurs'],['versets','Versets']]
.map(([key, label]) => (
<div key={key}
style={{...s.onglet,...(onglet===key?s.ongletActif:{})}}
onClick={() => setOnglet(key)}>{label}</div>
))}
</div>
{onglet === 'stats' && stats && (
<div style={s.statsGrid}>
{[
{ n: stats.utilisateurs, l: 'Utilisateurs', c: '#534AB7' },
{ n: stats.cours, l: 'Cours', c: '#1D9E75' },
{ n: stats.quiz_passes, l: 'Quiz passes', c: '#F97316' },
{ n: stats.notes, l: 'Notes', c: '#7C3AED' },
{ n: stats.favoris, l: 'Favoris', c: '#DC2626' },
{ n: stats.taches_faites, l: 'Taches faites',c: '#0891B2' },
].map(st => (
<div key={st.l} style={{...s.statCard, borderTop:'3px solid '+st.c}}>
<div style={{...s.statNum, color:st.c}}>{st.n}</div>
<div style={s.statLabel}>{st.l}</div>
</div>
))}
</div>
)}
{onglet === 'users' && (
<div style={s.tableWrap}>
<table style={s.table}>
<thead><tr>
{['Prenom','Email','Annee','Role','Inscription','Action']
.map(h => <th key={h} style={s.th}>{h}</th>)}
</tr></thead>
<tbody>
{users.map(u => (
<tr key={u.id} style={s.tr}>
<td style={s.td}>{u.prenom}</td>
<td style={s.td}>{u.email}</td>
<td style={s.td}>{u.annee_etudes}e annee</td>
<td style={s.td}>
<span style={{...s.badge,
...(u.is_admin ? s.badgeAdmin : s.badgeUser)}}>
{u.is_admin ? 'Admin' : 'User'}
</span>
</td>
<td style={s.td}>
{new Date(u.cree_le).toLocaleDateString('fr-FR')}
</td>
<td style={s.td}>
{!u.is_admin && (
<button style={s.delBtn}
onClick={() => handleSupprimerUser(u.id)}>X Supprimer</button>
)}
</td>
</tr>
))}
</tbody>
</table>
</div>
)}
{onglet === 'versets' && (
<div style={s.versetSection}>
<form onSubmit={handleSubmitVerset} style={s.form}>
<h3 style={s.formTitle}>
{editId ? 'Modifier le verset' : 'Ajouter un verset'}
</h3>
<div style={s.formGrid}>
<input style={s.input} placeholder='Reference (ex: Jean 3:16)'
value={formVerset.reference}
onChange={e => setFormVerset({...formVerset,reference:e.target.value})}
required />
<input style={s.input} type='date'
value={formVerset.date_affichage}
onChange={e => setFormVerset({...formVerset,date_affichage:e.target.value})}
required />
<textarea style={{...s.input,gridColumn:'1/-1'}} rows={2}
placeholder='Texte en espagnol'
value={formVerset.texte_es}
onChange={e => setFormVerset({...formVerset,texte_es:e.target.value})}
required />
<textarea style={{...s.input,gridColumn:'1/-1'}} rows={2}
placeholder='Texte en francais'
value={formVerset.texte_fr}
onChange={e => setFormVerset({...formVerset,texte_fr:e.target.value})} />
</div>
<div style={s.formActions}>
<button style={s.btnPrimary} type='submit'>
{editId ? 'Modifier' : 'Ajouter'}
</button>
{editId && (
<button style={s.btnSecondaire} type='button'
onClick={() => {
setEditId(null);
setFormVerset({reference:'',texte_es:'',texte_fr:'',date_affichage:''});
}}>Annuler</button>
)}
</div>
</form>
<div style={s.versetsList}>
{versets.map(v => (
<div key={v.id} style={s.versetCard}>
<div style={s.versetTop}>
<div>
<div style={s.versetRef}>{v.reference}</div>
<div style={s.versetDate}>
{new Date(v.date_affichage).toLocaleDateString('fr-FR')}
</div>
</div>
<div style={s.versetActions}>
<button style={s.editBtn}
onClick={() => handleEditVerset(v)}>Modifier</button>
<button style={s.delBtn}
onClick={() => handleSupprimerVerset(v.id)}>Supprimer</button>
</div>
</div>
<p style={s.versetTexteEs}>{v.texte_es}</p>
{v.texte_fr && <p style={s.versetTexteFr}>{v.texte_fr}</p>}
</div>
))}
</div>
</div>
)}
</div>
</div>
);
}
const s = {
page: { minHeight:'100vh', background:'#f4f5f7', fontFamily:'system-ui,sans-serif' },
loading: { display:'flex', alignItems:'center', justifyContent:'center',
minHeight:'100vh', fontSize:16, color:'#6b7280' },
header: { background:'linear-gradient(135deg,#1a1a2e,#2d1b69)', padding:'1rem 2rem',
display:'flex', justifyContent:'space-between', alignItems:'center' },
headerLeft: { display:'flex', alignItems:'center', gap:12 },
logoIcon: { width:38, height:38, background:'linear-gradient(135deg,#534AB7,#F97316)',
borderRadius:9, display:'flex', alignItems:'center',
justifyContent:'center', color:'#fff', fontWeight:800, fontSize:18 },
headerTitle: { fontSize:18, fontWeight:700, color:'#fff' },
headerSub: { fontSize:12, color:'rgba(255,255,255,0.6)' },
backBtn: { padding:'8px 18px', background:'rgba(255,255,255,0.1)',
border:'1px solid rgba(255,255,255,0.2)', borderRadius:8,
color:'#fff', fontSize:13, cursor:'pointer' },
main: { maxWidth:1100, margin:'0 auto', padding:'1.5rem 2rem' },
onglets: { display:'flex', gap:0, marginBottom:'1.5rem', background:'#fff',
borderRadius:12, padding:4, border:'0.5px solid #e5e7eb' },
onglet: { flex:1, padding:'10px', fontSize:13, fontWeight:600,
color:'#6b7280', cursor:'pointer', borderRadius:10, textAlign:'center' },
ongletActif: { background:'linear-gradient(135deg,#534AB7,#7C3AED)', color:'#fff' },
statsGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 },
statCard: { background:'#fff', borderRadius:14, padding:'1.5rem',
border:'0.5px solid #e5e7eb', textAlign:'center' },
statNum: { fontSize:36, fontWeight:800, marginBottom:6 },
statLabel: { fontSize:13, color:'#6b7280' },
tableWrap: { background:'#fff', borderRadius:14,
border:'0.5px solid #e5e7eb', overflow:'auto' },
table: { width:'100%', borderCollapse:'collapse' },
th: { padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:700,
color:'#6b7280', borderBottom:'1px solid #f3f4f6', background:'#fafafa' },
tr: { borderBottom:'0.5px solid #f9fafb' },
td: { padding:'12px 16px', fontSize:13, color:'#374151' },
badge: { fontSize:11, borderRadius:20, padding:'3px 10px', fontWeight:600 },
badgeAdmin: { background:'#EEEDFE', color:'#3C3489' },
badgeUser: { background:'#f3f4f6', color:'#6b7280' },
delBtn: { padding:'4px 12px', background:'#FEF2F2', color:'#DC2626',
border:'none', borderRadius:20, fontSize:11, cursor:'pointer' },
editBtn: { padding:'4px 12px', background:'#EEEDFE', color:'#3C3489',
border:'none', borderRadius:20, fontSize:11, cursor:'pointer' },
versetSection: { display:'flex', flexDirection:'column', gap:'1.5rem' },
form: { background:'#fff', borderRadius:14, padding:'1.5rem',
border:'0.5px solid #e5e7eb' },
formTitle: { fontSize:15, fontWeight:700, color:'#1a1a2e', margin:'0 0 1rem' },
formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 },
input: { padding:'10px 12px', borderRadius:8, border:'1.5px solid #e5e7eb',
fontSize:13, color:'#1a1a2e', background:'#fafafa',
fontFamily:'system-ui', resize:'vertical',
width:'100%', boxSizing:'border-box' },
formActions: { display:'flex', gap:10 },
btnPrimary: { padding:'10px 24px',
background:'linear-gradient(135deg,#534AB7,#7C3AED)',
border:'none', borderRadius:10, color:'#fff',
fontSize:13, fontWeight:700, cursor:'pointer' },
btnSecondaire: { padding:'10px 24px', background:'#f3f4f6',
border:'0.5px solid #e5e7eb', borderRadius:10,
color:'#374151', fontSize:13, cursor:'pointer' },
versetsList: { display:'flex', flexDirection:'column', gap:10 },
versetCard: { background:'#fff', borderRadius:12, padding:'1.25rem',
border:'0.5px solid #e5e7eb' },
versetTop: { display:'flex', justifyContent:'space-between',
alignItems:'flex-start', marginBottom:10 },
versetRef: { fontSize:14, fontWeight:700, color:'#534AB7' },
versetDate: { fontSize:12, color:'#9ca3af' },
versetActions: { display:'flex', gap:6 },
versetTexteEs: { fontSize:13, color:'#374151', margin:'0 0 4px', fontStyle:'italic' },
versetTexteFr: { fontSize:12, color:'#6b7280', margin:0, fontStyle:'italic' },
};
export default Admin;
