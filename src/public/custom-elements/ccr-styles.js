/**
 * Shared design tokens and component CSS for Cloud Comfort Ride Wix Custom Elements.
 * Matches the Cloud-Comfort-Ride Tailwind/CSS design system.
 */

export function ensureGoogleFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('ccr-google-fonts')) return;
  const link = document.createElement('link');
  link.id = 'ccr-google-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Manrope:wght@500;600;700;800;900&display=swap';
  document.head.appendChild(link);
}

export const CCR_SHARED_CSS = `
  :host {
    --navy: #061f46;
    --navy-dark: #041329;
    --navy-bottom: #04152f;
    --blue: #123e77;
    --gold: #f3bf28;
    --gold-dark: #bd8b09;
    --gold-accent: #986800;
    --gold-shadow: #c99308;
    --cream: #f7f9fc;
    --ink: #000000;
    --muted: #000000;
    --line: #dce4ee;
    --surface: #ffffff;
    --surface-alt: #f7f9fc;
    --card-bg: #ffffff;
    --card-border: #cbd5e1;
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    color: var(--ink);
    display: block;
    box-sizing: border-box;
  }

  :host([data-theme="dark"]) {
    --navy: #092754;
    --navy-dark: #030d1a;
    --cream: #061426;
    --ink: #ffffff;
    --muted: #e2e8f0;
    --line: #1e293b;
    --surface: #040d1a;
    --surface-alt: #061426;
    --card-bg: #091b33;
    --card-border: #1e293b;
    --gold-accent: #f3bf28;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  h1, h2, h3, h4, .font-heading {
    font-family: 'Manrope', system-ui, sans-serif;
    letter-spacing: -0.025em;
    margin: 0;
  }

  h1 {
    font-size: clamp(36px, 5vw, 64px);
    line-height: 1.08;
    font-weight: 800;
  }

  h2 {
    font-size: clamp(30px, 3.8vw, 44px);
    line-height: 1.15;
    font-weight: 800;
    text-shadow: 0 2px 10px rgba(6, 31, 70, 0.08);
  }

  h3 {
    font-size: clamp(23px, 2.2vw, 27px);
    line-height: 1.25;
    font-weight: 800;
  }

  p {
    margin: 0;
    font-size: clamp(18px, 1.35vw, 20px);
    line-height: 1.7;
    color: var(--ink);
  }

  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; cursor: pointer; }

  a:focus-visible,
  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 3px solid #f3bf28;
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  .container {
    width: 100%;
    max-width: 1340px;
    margin: 0 auto;
    padding: 0 20px;
  }
  @media (min-width: 640px) { .container { padding: 0 24px; } }
  @media (min-width: 1024px) { .container { padding: 0 32px; } }

  .dt-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: linear-gradient(180deg, #0b2d63 0%, #061f46 100%);
    color: #ffffff;
    border: 2px solid #f3bf28;
    box-shadow: 0 5px 0 #c99308, 0 10px 20px rgba(6, 31, 70, 0.18);
    padding: 14px 26px;
    border-radius: 12px;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: clamp(16px, 1.1vw, 17px);
    min-height: 52px;
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s ease, box-shadow 0.2s ease;
  }
  .dt-button:hover {
    transform: translateY(-3px);
    background: linear-gradient(180deg, #164b8f 0%, #123e77 100%);
    box-shadow: 0 7px 0 #c99308, 0 14px 26px rgba(6, 31, 70, 0.24);
  }
  .dt-button:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #c99308, 0 4px 10px rgba(6, 31, 70, 0.16);
  }

  .dt-button-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #ffffff;
    color: #061f46;
    border: 2px solid #061f46;
    box-shadow: 0 4px 12px rgba(6, 31, 70, 0.08);
    padding: 14px 24px;
    border-radius: 12px;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: clamp(16px, 1.1vw, 17px);
    min-height: 52px;
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  }
  .dt-button-outline:hover {
    transform: translateY(-2px);
    background: #061f46;
    color: #ffffff;
  }

  :host([data-theme="dark"]) .dt-button-outline {
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.25);
  }
  :host([data-theme="dark"]) .dt-button-outline:hover {
    background: #ffffff;
    color: #061f46;
  }

  .eyebrow {
    font-size: 15px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.4px;
    color: #061f46;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  :host([data-theme="dark"]) .eyebrow {
    color: #f3bf28;
  }
  .eyebrow-dot {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: #f3bf28;
    display: inline-block;
  }

  .badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 16px;
    border-radius: 9999px;
    background: rgba(243, 191, 40, 0.2);
    color: #f3bf28;
    border: 1px solid rgba(243, 191, 40, 0.45);
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: #f3bf28;
    animation: ccrPulse 2s infinite;
  }

  @keyframes ccrPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  @keyframes ccrFadeInUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes ccrFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  .anim-enter {
    animation: ccrFadeInUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .reveal {
    transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .reveal.reveal-pending {
    opacity: 0;
    transform: translateY(18px);
  }
  .reveal.reveal-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .banner-hero {
    background: linear-gradient(135deg, #041329 0%, #061f46 55%, #0c3268 100%);
    color: #ffffff;
    padding: 68px 0;
    border-bottom: 3px solid #f3bf28;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .banner-hero::after {
    content: '';
    position: absolute;
    width: 340px;
    height: 340px;
    border-radius: 9999px;
    background: radial-gradient(circle, rgba(243, 191, 40, 0.14) 0%, transparent 70%);
    top: -140px;
    right: -80px;
    pointer-events: none;
    animation: ccrFloat 7s ease-in-out infinite;
  }
  :host([data-theme="dark"]) .banner-hero {
    background: linear-gradient(135deg, #020b18 0%, #030d1a 60%, #061a38 100%);
  }
  .banner-hero h1 {
    font-size: clamp(34px, 4.6vw, 56px);
    font-weight: 800;
    color: #ffffff;
    margin: 16px 0 14px;
    line-height: 1.08;
    text-shadow: 0 4px 18px rgba(3, 13, 26, 0.55);
  }
  .banner-hero p {
    font-size: clamp(17px, 1.4vw, 19px);
    color: #e2e8f0;
    max-width: 740px;
    margin: 0 auto;
    line-height: 1.65;
  }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 18px;
    box-shadow: 0 12px 32px rgba(6, 31, 70, 0.08), 0 2px 6px rgba(6, 31, 70, 0.04);
    overflow: hidden;
    transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease, border-color 0.28s ease;
  }
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 44px rgba(6, 31, 70, 0.14), 0 4px 12px rgba(6, 31, 70, 0.06);
    border-color: #8ca5c5;
  }
`;

export function initScrollReveals(root) {
  if (!root || typeof window === 'undefined') return;
  const nodes = root.querySelectorAll('.reveal');
  if (!nodes.length) return;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof IntersectionObserver === 'undefined') {
    nodes.forEach((n) => n.classList.add('reveal-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('reveal-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  nodes.forEach((n) => {
    const rect = n.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      n.classList.add('reveal-visible');
    } else {
      n.classList.add('reveal-pending');
      io.observe(n);
    }
  });
}

export function syncThemeHost(hostEl) {
  try {
    const saved = typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem('cloud_comfort_theme')
      : 'light';
    hostEl.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');
  } catch (e) {
    hostEl.setAttribute('data-theme', 'light');
  }
}

