import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState({});
  const [compteur, setCompteur] = useState({ cours: 0, matieres: 0, quiz: 0 });
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 18 + 4, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      type: ['cell', 'molecule', 'cross', 'dna', 'ring'][i % 5],
      opacity: Math.random() * 0.18 + 0.04, phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01, color: ['#534AB7', '#7C3AED', '#F97316', '#1D9E75'][i % 4],
    }));
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(83,74,183,${0.06 * (1 - dist / 120)})`;
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
      ctx.save(); ctx.globalAlpha = p.opacity; ctx.translate(p.x, p.y);
      if (p.type === 'cell') {
        ctx.beginPath(); ctx.arc(0, 0, p.r * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = p.color; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, p.r * 0.35 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity * 0.5; ctx.fill();
      } else if (p.type === 'cross') {
        const s = p.r * 0.9 * pulse, w = s * 0.35;
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity * 0.6;
        ctx.fillRect(-w / 2, -s / 2, w, s); ctx.fillRect(-s / 2, -w / 2, s, w);
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color; ctx.lineWidth = 0.8; ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (k / 6) * Math.PI * 2 - Math.PI / 6;
          k === 0 ? ctx.moveTo(Math.cos(angle) * p.r * pulse, Math.sin(angle) * p.r * pulse)
                  : ctx.lineTo(Math.cos(angle) * p.r * pulse, Math.sin(angle) * p.r * pulse);
        }
        ctx.closePath(); ctx.stroke();
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
      t += 0.016; animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.id]: true }));
      }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible['stats']) return;
    let frame = 0;
    const total = 60;
    const interval = setInterval(() => {
      frame++;
      setCompteur({ cours: Math.round((10/total)*frame), matieres: Math.round((5/total)*frame), quiz: Math.round((10/total)*frame) });
      if (frame >= total) clearInterval(interval);
    }, 20);
  }, [visible['stats']]);

  const anim = (id, delay = 0) => ({
    id, 'data-animate': true,
    style: {
      opacity: visible[id] ? 1 : 0,
      transform: visible[id] ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    },
  });

  const features = [
    { icon: '📚', titre: 'Cours bilingues',      desc: 'Programme MINSAP en espagnol avec aide en français',   color: '#534AB7' },
    { icon: '🧠', titre: 'Quiz interactifs',     desc: 'Teste tes connaissances avec explications détaillées', color: '#F97316' },
    { icon: '📖', titre: 'Glossaire trilingue',  desc: 'Termes médicaux en espagnol, français et anglais',     color: '#1D9E75' },
    { icon: '📅', titre: 'Planning intelligent', desc: 'Programme de révision généré automatiquement',         color: '#534AB7' },
    { icon: '✏️', titre: 'Notes personnelles',   desc: 'Prends des notes directement sur chaque cours',        color: '#F97316' },
    { icon: '✝️', titre: 'Verset du jour',       desc: 'Une source de motivation spirituelle chaque matin',    color: '#1D9E75' },
  ];

  const matieres = [
    { nom: 'Anatomie',      emoji: '🦴' }, { nom: 'Physiologie',   emoji: '❤️' },
    { nom: 'Biochimie',     emoji: '🔬' }, { nom: 'Histologie',    emoji: '🧬' },
    { nom: 'Sémiologie',    emoji: '🩺' }, { nom: 'Pathologie',    emoji: '🏥' },
    { nom: 'Pharmacologie', emoji: '💊' }, { nom: 'Chirurgie',     emoji: '🔧' },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes float     { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes pulse2    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.75;transform:scale(0.97)} }
        .btn-hero:hover    { transform: translateY(-2px) !important; box-shadow: 0 10px 30px rgba(83,74,183,0.35) !important; }
        .btn-hero, .btn-outline-hero { transition: all 0.2s ease !important; }
        .btn-outline-hero:hover { background: #534AB7 !important; color: #fff !important; }
        .feat-card:hover   { transform: translateY(-5px) !important; border-color: #534AB7 !important; }
        .mat-card:hover    { transform: translateY(-4px) scale(1.04) !important; }
        .mat-card, .feat-card { transition: all 0.25s ease !important; }

        /* ── MENU MOBILE ── */
        .mobile-menu { display: none; }
        .hamburger   { display: none; }
        .nav-desktop { display: flex; }

        /* ── RESPONSIVE MOBILE ── */
        @media (max-width: 768px) {
          .nav-desktop  { display: none !important; }
          .hamburger    { display: flex !important; }

          .mobile-menu.open {
            display: flex !important;
            flex-direction: column;
            position: fixed;
            top: 64px; left: 0; right: 0;
            background: rgba(255,255,255,0.98);
            backdrop-filter: blur(14px);
            padding: 1.5rem;
            gap: 12px;
            z-index: 99;
            border-bottom: 0.5px solid #e5e7eb;
            animation: fadeSlide 0.2s ease forwards;
          }

          .hero-inner {
            grid-template-columns: 1fr !important;
            padding: 3rem 1.25rem !important;
            gap: 2rem !important;
          }

          .hero-title  { font-size: 32px !important; }
          .hero-cards  { display: none !important; }
          .hero-actions { flex-direction: column !important; }
          .btn-hero, .btn-outline-hero { width: 100% !important; text-align: center !important; justify-content: center !important; }

          .stats-grid  { grid-template-columns: repeat(2,1fr) !important; padding: 2rem 1rem !important; }
          .stat-num    { font-size: 28px !important; }

          .section-pad { padding: 3rem 1.25rem !important; }
          .section-title { font-size: 22px !important; }

          .mat-grid    { grid-template-columns: repeat(2,1fr) !important; }
          .feat-grid   { grid-template-columns: 1fr !important; }

          .cta-title   { font-size: 24px !important; }
          .cta-section { padding: 3rem 1.25rem !important; }

          .footer-inner { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
        }
      `}</style>

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>M</div>
            <span style={styles.logoText}>MediCuba ES</span>
          </div>

          {/* Desktop */}
          <div className="nav-desktop" style={styles.navActions}>
            <button className="btn-outline-hero" style={styles.btnOutline} onClick={() => navigate('/connexion')}>Se connecter</button>
            <button className="btn-hero" style={styles.btnPrimary} onClick={() => navigate('/inscription')}>Commencer gratuitement</button>
          </div>

          {/* Hamburger mobile */}
          <button className="hamburger" style={styles.hamburger} onClick={() => setMenuOuvert(!menuOuvert)}>
            <span style={{ fontSize: 22, color: '#534AB7' }}>{menuOuvert ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Menu mobile */}
        <div className={`mobile-menu ${menuOuvert ? 'open' : ''}`}>
          <button style={{ ...styles.btnOutline, width: '100%', padding: '12px' }}
            onClick={() => { navigate('/connexion'); setMenuOuvert(false); }}>Se connecter</button>
          <button style={{ ...styles.btnPrimary, width: '100%', padding: '12px' }}
            onClick={() => { navigate('/inscription'); setMenuOuvert(false); }}>Commencer gratuitement</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <canvas ref={canvasRef} style={styles.canvas} />
        <div style={styles.heroOverlay} />
        <div className="hero-inner" style={styles.heroInner}>
          <div style={{ ...styles.heroContent, animation: 'fadeSlide 0.9s ease forwards' }}>
            <div style={styles.heroBadge}>
              <span style={{ animation: 'pulse2 2.5s infinite' }}>🇨🇺</span>
              Programme MINSAP · La Havane
            </div>
            <h1 className="hero-title" style={styles.heroTitle}>
              Apprends la médecine<br />
              <span style={styles.heroAccent}>en espagnol</span>,<br />
              avec confiance
            </h1>
            <p style={styles.heroDesc}>
              La plateforme conçue pour les étudiants francophones en médecine à Cuba.
              Cours bilingues, quiz, glossaire et planning intelligent.
            </p>
            <div className="hero-actions" style={styles.heroActions}>
              <button className="btn-hero" style={styles.btnHero} onClick={() => navigate('/inscription')}>
                Créer mon compte gratuit →
              </button>
              <button className="btn-outline-hero" style={styles.btnHeroOutline} onClick={() => navigate('/connexion')}>
                J'ai déjà un compte
              </button>
            </div>
            <div style={styles.heroStats}>
              <div style={styles.heroStat}><strong>6</strong> années</div>
              <div style={styles.heroStatDiv} />
              <div style={styles.heroStat}><strong>ES · FR · EN</strong></div>
              <div style={styles.heroStatDiv} />
              <div style={styles.heroStat}><strong>100%</strong> MINSAP</div>
            </div>
          </div>

          <div className="hero-cards" style={styles.heroCards}>
            <div style={{ ...styles.card1, animation: 'float 3.2s ease-in-out infinite' }}>
              <div style={styles.card1Top}><div style={styles.card1Dot} /><span style={styles.card1Label}>Verset du jour</span></div>
              <p style={styles.card1Verse}>"Todo lo puedo en Cristo que me fortalece."</p>
              <p style={styles.card1Ref}>— Philippiens 4:13</p>
            </div>
            <div style={{ ...styles.card2, animation: 'float 3.8s ease-in-out infinite 0.6s' }}>
              <div style={styles.card2Top}>
                <span style={styles.card2Title}>El cráneo humano</span>
                <span style={styles.card2Badge}>Anatomie</span>
              </div>
              <p style={styles.card2Body}>El cráneo está compuesto por 22 huesos divididos en neurocráneo y viscerocráneo...</p>
              <div style={styles.card2ProgWrap}><div style={styles.card2Prog} /></div>
              <div style={styles.card2Footer}>
                <span style={{ fontSize: 11, color: '#888' }}>35% complété</span>
                <span style={{ fontSize: 11, color: '#534AB7', fontWeight: 600 }}>Continuer →</span>
              </div>
            </div>
            <div style={{ ...styles.card3, animation: 'float 4.2s ease-in-out infinite 1.1s' }}>
              {[{ n: '68%', l: 'Quiz réussis' }, { n: '10', l: 'Cours vus' }, { n: '5', l: 'Favoris' }].map(s => (
                <div key={s.l} style={styles.card3Item}>
                  <div style={styles.card3Num}>{s.n}</div>
                  <div style={styles.card3Label}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={styles.statsSection}>
        <div id="stats" data-animate style={{ ...styles.statsGrid, ...anim('stats').style }} className="stats-grid">
          {[
            { n: compteur.cours,    l: 'Cours disponibles' },
            { n: compteur.matieres, l: 'Matières 1ère année' },
            { n: compteur.quiz,     l: 'Quiz interactifs' },
            { n: 6,                 l: 'Années de médecine' },
          ].map(s => (
            <div key={s.l} style={styles.statCard}>
              <div className="stat-num" style={styles.statNum}>{s.n}</div>
              <div style={styles.statLabel}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Matières */}
      <section className="section-pad" style={styles.section}>
        <div id="mat-title" data-animate style={anim('mat-title').style}>
          <h2 className="section-title" style={styles.sectionTitle}>Toutes les matières du programme cubain</h2>
          <p style={styles.sectionDesc}>De la 1ère à la 6ème année, tous les cours en espagnol avec aide en français</p>
        </div>
        <div className="mat-grid" style={styles.matiereGrid}>
          {matieres.map((m, i) => (
            <div key={m.nom} className="mat-card" id={`mat-${i}`} data-animate
              style={{ ...styles.matiereCard, ...anim(`mat-${i}`, i * 0.07).style, borderTop: `3px solid ${i % 2 === 0 ? '#534AB7' : '#F97316'}` }}>
              <div style={styles.matiereEmoji}>{m.emoji}</div>
              <div style={styles.matiereNom}>{m.nom}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section-pad" style={{ ...styles.section, background: '#F8F7FF' }}>
        <div id="feat-title" data-animate style={anim('feat-title').style}>
          <h2 className="section-title" style={styles.sectionTitle}>Tout ce dont tu as besoin pour réussir</h2>
          <p style={styles.sectionDesc}>Une plateforme pensée pour les conditions réelles à La Havane</p>
        </div>
        <div className="feat-grid" style={styles.featGrid}>
          {features.map((f, i) => (
            <div key={f.titre} className="feat-card" id={`feat-${i}`} data-animate
              style={{ ...styles.featCard, ...anim(`feat-${i}`, i * 0.09).style }}>
              <div style={{ ...styles.featIcon, background: f.color + '18', color: f.color }}>{f.icon}</div>
              <div style={styles.featTitre}>{f.titre}</div>
              <div style={styles.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={styles.ctaSection}>
        <div id="cta" data-animate style={{ ...anim('cta').style, textAlign: 'center' }}>
          <h2 className="cta-title" style={styles.ctaTitle}>Prête à commencer ?</h2>
          <p style={styles.ctaDesc}>Rejoins la plateforme et prends le contrôle de tes études de médecine à Cuba.</p>
          <button className="btn-hero" style={{ ...styles.btnHero, fontSize: 16, padding: '14px 40px' }} onClick={() => navigate('/inscription')}>
            Créer mon compte maintenant →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div className="footer-inner" style={styles.footerInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>M</div>
            <span style={{ ...styles.logoText, color: '#888' }}>MediCuba ES</span>
          </div>
          <p style={styles.footerText}>Plateforme d'apprentissage médical pour étudiants francophones à Cuba · 2026</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page:           { minHeight: '100vh', background: '#fff', fontFamily: 'system-ui,sans-serif', overflowX: 'hidden' },
  nav:            { position: 'sticky', top: 0, background: 'rgba(255,255,255,0.92)', borderBottom: '0.5px solid #e8e8e8', zIndex: 100, backdropFilter: 'blur(14px)' },
  navInner:       { maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo:           { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon:       { width: 34, height: 34, background: 'linear-gradient(135deg,#534AB7,#F97316)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 },
  logoText:       { fontSize: 16, fontWeight: 700, color: '#1a1a2e' },
  navActions:     { display: 'flex', gap: 10 },
  btnOutline:     { padding: '8px 18px', background: 'transparent', border: '1.5px solid #534AB7', borderRadius: 8, color: '#534AB7', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnPrimary:     { padding: '8px 18px', background: 'linear-gradient(135deg,#534AB7,#7C3AED)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  hamburger:      { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'none', alignItems: 'center', justifyContent: 'center' },
  hero:           { position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' },
  canvas:         { position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 },
  heroOverlay:    { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%,rgba(238,237,254,0.7) 0%,rgba(255,255,255,0.85) 60%)', zIndex: 1 },
  heroInner:      { position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: '5rem 2rem', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' },
  heroContent:    { opacity: 0 },
  heroBadge:      { display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FFF3E0', color: '#C2410C', fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 20, marginBottom: '1.5rem', border: '1px solid #FED7AA' },
  heroTitle:      { fontSize: 46, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.13, margin: '0 0 1.25rem' },
  heroAccent:     { background: 'linear-gradient(135deg,#534AB7,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroDesc:       { fontSize: 16, color: '#4b5563', lineHeight: 1.75, margin: '0 0 2rem', maxWidth: 460 },
  heroActions:    { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '2rem' },
  btnHero:        { padding: '12px 28px', background: 'linear-gradient(135deg,#534AB7,#7C3AED)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  btnHeroOutline: { padding: '12px 24px', background: 'transparent', border: '2px solid #534AB7', borderRadius: 10, color: '#534AB7', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  heroStats:      { display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' },
  heroStat:       { fontSize: 13, color: '#6b7280' },
  heroStatDiv:    { width: 1, height: 14, background: '#d1d5db' },
  heroCards:      { display: 'flex', flexDirection: 'column', gap: 14 },
  card1:          { background: 'rgba(238,237,254,0.95)', borderRadius: 16, padding: '1.25rem', border: '1px solid #AFA9EC', backdropFilter: 'blur(8px)' },
  card1Top:       { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  card1Dot:       { width: 8, height: 8, borderRadius: '50%', background: '#534AB7' },
  card1Label:     { fontSize: 11, fontWeight: 600, color: '#534AB7', textTransform: 'uppercase', letterSpacing: '0.06em' },
  card1Verse:     { fontSize: 14, color: '#3C3489', fontStyle: 'italic', margin: '0 0 4px', lineHeight: 1.6 },
  card1Ref:       { fontSize: 12, color: '#7F77DD', margin: 0, fontWeight: 500 },
  card2:          { background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: '1.25rem', border: '1px solid #e5e7eb', backdropFilter: 'blur(8px)' },
  card2Top:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  card2Title:     { fontSize: 14, fontWeight: 700, color: '#1a1a2e' },
  card2Badge:     { fontSize: 11, background: '#EEEDFE', color: '#3C3489', borderRadius: 20, padding: '2px 10px', fontWeight: 500 },
  card2Body:      { fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 10 },
  card2ProgWrap:  { height: 5, background: '#f3f4f6', borderRadius: 3, marginBottom: 8 },
  card2Prog:      { height: '100%', width: '35%', background: 'linear-gradient(90deg,#534AB7,#F97316)', borderRadius: 3 },
  card2Footer:    { display: 'flex', justifyContent: 'space-between' },
  card3:          { background: 'linear-gradient(135deg,#534AB7,#7C3AED)', borderRadius: 16, padding: '1.25rem', display: 'flex', justifyContent: 'space-around' },
  card3Item:      { textAlign: 'center' },
  card3Num:       { fontSize: 26, fontWeight: 800, color: '#fff' },
  card3Label:     { fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  statsSection:   { background: 'linear-gradient(135deg,#1a1a2e,#2d1b69)', padding: '4rem 2rem' },
  statsGrid:      { maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 },
  statCard:       { textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.07)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' },
  statNum:        { fontSize: 42, fontWeight: 800, color: '#fff', marginBottom: 6 },
  statLabel:      { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  section:        { padding: '5rem 2rem' },
  sectionTitle:   { fontSize: 30, fontWeight: 800, color: '#1a1a2e', textAlign: 'center', margin: '0 0 0.75rem' },
  sectionDesc:    { fontSize: 16, color: '#6b7280', textAlign: 'center', margin: '0 0 3rem' },
  matiereGrid:    { maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 },
  matiereCard:    { background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #e5e7eb', textAlign: 'center', cursor: 'pointer' },
  matiereEmoji:   { fontSize: 30, marginBottom: 8 },
  matiereNom:     { fontSize: 13, fontWeight: 600, color: '#374151' },
  featGrid:       { maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 },
  featCard:       { background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #e5e7eb' },
  featIcon:       { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 },
  featTitre:      { fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 },
  featDesc:       { fontSize: 13, color: '#6b7280', lineHeight: 1.6 },
  ctaSection:     { background: 'linear-gradient(135deg,#534AB7,#7C3AED,#F97316)', backgroundSize: '200% 200%', animation: 'gradShift 6s ease infinite', padding: '6rem 2rem' },
  ctaTitle:       { fontSize: 36, fontWeight: 800, color: '#fff', margin: '0 0 1rem' },
  ctaDesc:        { fontSize: 16, color: 'rgba(255,255,255,0.85)', margin: '0 0 2.5rem' },
  footer:         { background: '#f9fafb', padding: '2rem 1.25rem', borderTop: '0.5px solid #e5e7eb' },
  footerInner:    { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  footerText:     { fontSize: 13, color: '#9ca3af', margin: 0 },
};

export default Landing;