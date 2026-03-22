import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { inscription } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Inscription() {
  const [form, setForm]       = useState({ prenom: '', email: '', mot_de_passe: '', annee_etudes: 1 });
  const [erreur, setErreur]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();
  const canvasRef             = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 25 }, (_, i) => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      r:       Math.random() * 16 + 4,
      vx:      (Math.random() - 0.5) * 0.35,
      vy:      (Math.random() - 0.5) * 0.35,
      type:    ['cell', 'molecule', 'cross', 'dna', 'ring'][i % 5],
      opacity: Math.random() * 0.15 + 0.04,
      phase:   Math.random() * Math.PI * 2,
      speed:   Math.random() * 0.02 + 0.01,
      color:   ['#534AB7', '#7C3AED', '#F97316', '#1D9E75'][i % 4],
    }));

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(83,74,183,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const drawCell = (p, t) => {
      const pulse = 1 + Math.sin(t * p.speed * 60 + p.phase) * 0.12;
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);

      if (p.type === 'cell') {
        ctx.beginPath();
        ctx.arc(0, 0, p.r * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = p.color; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.35 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity * 0.5; ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.7 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = p.color; ctx.globalAlpha = p.opacity * 0.3;
        ctx.lineWidth = 0.5; ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
      } else if (p.type === 'molecule') {
        const positions = [
          { x: 0, y: -p.r * pulse },
          { x: p.r * 0.85 * pulse, y: p.r * 0.5 * pulse },
          { x: -p.r * 0.85 * pulse, y: p.r * 0.5 * pulse },
        ];
        ctx.strokeStyle = p.color; ctx.lineWidth = 0.8; ctx.globalAlpha = p.opacity;
        positions.forEach((a, i) => {
          positions.forEach((b, j) => {
            if (i < j) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
          });
          ctx.beginPath(); ctx.arc(a.x, a.y, p.r * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity * 0.8; ctx.fill();
        });
      } else if (p.type === 'cross') {
        const s = p.r * 0.9 * pulse; const w = s * 0.35;
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity * 0.6;
        ctx.fillRect(-w / 2, -s / 2, w, s); ctx.fillRect(-s / 2, -w / 2, s, w);
      } else if (p.type === 'dna') {
        ctx.strokeStyle = p.color; ctx.lineWidth = 0.8; ctx.globalAlpha = p.opacity;
        let prevX1, prevX2, prevY1;
        for (let k = -4; k <= 4; k++) {
          const y1 = k * p.r * 0.28;
          const x1 = Math.sin(k * 0.8 + t * p.speed * 30 + p.phase) * p.r * 0.6;
          const x2 = -x1;
          if (k > -4) {
            ctx.beginPath(); ctx.moveTo(prevX1, prevY1); ctx.lineTo(x1, y1); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(prevX2, prevY1); ctx.lineTo(x2, y1); ctx.stroke();
          }
          if (k % 2 === 0) {
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y1);
            ctx.globalAlpha = p.opacity * 0.5; ctx.stroke(); ctx.globalAlpha = p.opacity;
          }
          ctx.beginPath(); ctx.arc(x1, y1, 1.5, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill();
          ctx.beginPath(); ctx.arc(x2, y1, 1.5, 0, Math.PI * 2); ctx.fill();
          prevX1 = x1; prevX2 = x2; prevY1 = y1;
        }
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color; ctx.lineWidth = 0.8; ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (k / 6) * Math.PI * 2 - Math.PI / 6;
          k === 0 ? ctx.moveTo(Math.cos(angle) * p.r * pulse, Math.sin(angle) * p.r * pulse)
                  : ctx.lineTo(Math.cos(angle) * p.r * pulse, Math.sin(angle) * p.r * pulse);
        }
        ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, p.r * 0.5 * pulse, 0, Math.PI * 2);
        ctx.globalAlpha = p.opacity * 0.4; ctx.stroke();
      }
      ctx.restore();
    };

    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawConnections();
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -40) p.x = canvas.width + 40;
        if (p.x > canvas.width + 40) p.x = -40;
        if (p.y < -40) p.y = canvas.height + 40;
        if (p.y > canvas.height + 40) p.y = -40;
        drawCell(p, t);
      });
      t += 0.016;
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur('');
    try {
      const res = await inscription(form);
      login(res.data.token, res.data.utilisateur);
      navigate('/');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const etapes = [
    { n: '1', t: 'Crée ton compte',      d: 'Inscription gratuite en 30 secondes' },
    { n: '2', t: 'Choisis ton année',    d: 'De la 1ère à la 6ème année' },
    { n: '3', t: 'Commence à apprendre', d: 'Cours, quiz et planning t\'attendent' },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeSlide { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .input-field:focus { border-color: #534AB7 !important; box-shadow: 0 0 0 3px rgba(83,74,183,0.12) !important; outline: none; }
        .input-field { transition: all 0.2s ease !important; }
        .btn-submit { transition: all 0.2s ease !important; }
        .btn-submit:hover { transform: translateY(-1px) !important; box-shadow: 0 8px 24px rgba(83,74,183,0.35) !important; }
        .btn-submit:disabled { opacity: 0.7 !important; cursor: not-allowed !important; }
      `}</style>

      <canvas ref={canvasRef} style={styles.canvas} />
      <div style={styles.overlay} />

      <div style={styles.container}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <div style={{ animation: 'float 3s ease-in-out infinite' }}>
            <div style={styles.leftLogo}>
              <div style={styles.logoIcon}>M</div>
              <span style={styles.logoText}>MediCuba ES</span>
            </div>
            <h2 style={styles.leftTitle}>Commence ton<br />parcours médical 🎓</h2>
            <p style={styles.leftDesc}>
              Rejoins la plateforme et accède à tous les cours du programme cubain MINSAP en espagnol et français.
            </p>
            <div style={styles.etapes}>
              {etapes.map((e, i) => (
                <div key={i} style={styles.etape}>
                  <div style={styles.etapeNum}>{e.n}</div>
                  <div>
                    <div style={styles.etapeTitre}>{e.t}</div>
                    <div style={styles.etapeDesc}>{e.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={styles.rightPanel}>
          <div style={{ ...styles.formCard, animation: 'fadeSlide 0.7s ease forwards' }}>
            <h1 style={styles.formTitle}>Créer mon compte</h1>
            <p style={styles.formSub}>Inscription gratuite — accès immédiat</p>

            {erreur && <div style={styles.erreur}>{erreur}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Prénom</label>
                <input
                  className="input-field"
                  style={styles.input}
                  type="text"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  placeholder="Ton prénom"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Adresse email</label>
                <input
                  className="input-field"
                  style={styles.input}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ton@email.com"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Mot de passe</label>
                <input
                  className="input-field"
                  style={styles.input}
                  type="password"
                  name="mot_de_passe"
                  value={form.mot_de_passe}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Année d'études</label>
                <select
                  className="input-field"
                  style={styles.input}
                  name="annee_etudes"
                  value={form.annee_etudes}
                  onChange={handleChange}
                  required
                >
                  {[1,2,3,4,5,6].map(a => (
                    <option key={a} value={a}>{a}{a === 1 ? 'ère' : 'ème'} année</option>
                  ))}
                </select>
              </div>
              <button className="btn-submit" style={styles.btnSubmit} type="submit" disabled={loading}>
                {loading ? 'Création du compte...' : 'Créer mon compte →'}
              </button>
            </form>

            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>ou</span>
              <div style={styles.dividerLine} />
            </div>

            <p style={styles.switchText}>
              Déjà un compte ?{' '}
              <Link to="/connexion" style={styles.switchLink}>Se connecter</Link>
            </p>

            <p style={styles.backLink} onClick={() => navigate('/landing')}>
              ← Retour à l'accueil
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:          { minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden', background: '#F8F7FF' },
  canvas:        { position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 },
  overlay:       { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(238,237,254,0.85) 0%, rgba(248,247,255,0.92) 60%)', zIndex: 1 },
  container:     { position: 'relative', zIndex: 2, display: 'flex', width: '100%', minHeight: '100vh' },
  leftPanel:     { flex: 1, background: 'linear-gradient(135deg,#534AB7,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#fff' },
  leftLogo:      { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' },
  logoIcon:      { width: 38, height: 38, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, border: '1.5px solid rgba(255,255,255,0.3)' },
  logoText:      { fontSize: 18, fontWeight: 700, color: '#fff' },
  leftTitle:     { fontSize: 34, fontWeight: 800, lineHeight: 1.2, margin: '0 0 1rem', color: '#fff' },
  leftDesc:      { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: '0 0 2.5rem', maxWidth: 320 },
  etapes:        { display: 'flex', flexDirection: 'column', gap: 16 },
  etape:         { display: 'flex', alignItems: 'flex-start', gap: 14 },
  etapeNum:      { width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.4)' },
  etapeTitre:    { fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 },
  etapeDesc:     { fontSize: 12, color: 'rgba(255,255,255,0.72)' },
  rightPanel:    { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' },
  formCard:      { background: '#fff', borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 420, border: '0.5px solid #e5e7eb', opacity: 0 },
  formTitle:     { fontSize: 26, fontWeight: 800, color: '#1a1a2e', margin: '0 0 6px' },
  formSub:       { fontSize: 14, color: '#6b7280', margin: '0 0 1.75rem' },
  field:         { marginBottom: '1.1rem' },
  label:         { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input:         { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, color: '#1a1a2e', background: '#fafafa', boxSizing: 'border-box' },
  btnSubmit:     { width: '100%', padding: '13px', background: 'linear-gradient(135deg,#534AB7,#7C3AED)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  erreur:        { background: '#FEF2F2', color: '#DC2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: '1.25rem', border: '1px solid #FECACA' },
  divider:       { display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0' },
  dividerLine:   { flex: 1, height: 1, background: '#e5e7eb' },
  dividerText:   { fontSize: 13, color: '#9ca3af' },
  switchText:    { textAlign: 'center', fontSize: 14, color: '#6b7280', margin: '0 0 1rem' },
  switchLink:    { color: '#534AB7', fontWeight: 600, textDecoration: 'none' },
  backLink:      { textAlign: 'center', fontSize: 13, color: '#9ca3af', cursor: 'pointer', margin: 0 },
};

export default Inscription;