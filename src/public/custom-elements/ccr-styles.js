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
    --ink: #122747;
    --ink-strong: #061f46;
    --body-ink: #1e293b;
    --muted: #475569;
    --muted-readable: #475569;
    --line: #dce4ee;
    --surface: #ffffff;
    --surface-alt: #f7f9fc;
    --card-bg: #ffffff;
    --card-border: #dce4ee;
    --text-3d-light: 0 1px 0 rgba(255, 255, 255, 0.9), 0 2px 0 rgba(6, 31, 70, 0.08), 0 6px 14px rgba(6, 31, 70, 0.1);
    --text-3d-dark: 0 1px 0 rgba(4, 19, 41, 0.85), 0 2px 0 rgba(4, 19, 41, 0.6), 0 8px 20px rgba(2, 11, 24, 0.55);
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    color: var(--ink);
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  :host([data-theme="dark"]) {
    --navy: #092754;
    --navy-dark: #030d1a;
    --cream: #061426;
    --ink: #f1f5f9;
    --ink-strong: #ffffff;
    --body-ink: #e2e8f0;
    --muted: #cbd5e1;
    --muted-readable: #cbd5e1;
    --line: #1e293b;
    --surface: #040d1a;
    --surface-alt: #061426;
    --card-bg: #091b33;
    --card-border: #1e293b;
    --gold-accent: #f3bf28;
    --text-3d-light: 0 1px 0 rgba(3, 13, 26, 0.85), 0 3px 12px rgba(2, 11, 24, 0.55);
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  h1, h2, h3, h4, .font-heading {
    font-family: 'Manrope', system-ui, sans-serif;
    letter-spacing: -0.025em;
    margin: 0;
  }

  p { margin: 0; }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; cursor: pointer; }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 16px;
  }
  @media (min-width: 640px) { .container { padding: 0 24px; } }
  @media (min-width: 1024px) { .container { padding: 0 32px; } }

  .dt-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #061f46;
    color: #ffffff;
    border: 2px solid #f3bf28;
    box-shadow: 0 4px 0 #c99308;
    padding: 12px 22px;
    border-radius: 10px;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: 14px;
    min-height: 44px;
    transition: transform 0.2s ease, background 0.2s ease;
  }
  .dt-button:hover {
    transform: translateY(-2px);
    background: #123e77;
  }
  .dt-button:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #c99308;
  }

  .dt-button-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #ffffff;
    color: #061f46;
    border: 2px solid #061f46;
    padding: 12px 20px;
    border-radius: 10px;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: 14px;
    min-height: 44px;
    transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
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
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.8px;
    color: #775d23;
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
    padding: 6px 14px;
    border-radius: 9999px;
    background: rgba(243, 191, 40, 0.2);
    color: #f3bf28;
    border: 1px solid rgba(243, 191, 40, 0.45);
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
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

  .banner-hero {
    background: #061f46;
    color: #ffffff;
    padding: 56px 0;
    border-bottom: 2px solid #f3bf28;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  :host([data-theme="dark"]) .banner-hero {
    background: #030d1a;
  }
  .banner-hero h1 {
    font-size: clamp(28px, 4.5vw, 48px);
    font-weight: 800;
    color: #ffffff;
    margin: 14px 0 12px;
    line-height: 1.12;
  }
  .banner-hero p {
    font-size: 16px;
    color: #e2e8f0;
    max-width: 720px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    box-shadow: 0 15px 40px rgba(16, 44, 77, 0.05);
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  }

  /* Premium 3D Typography System */
  .ccr-hero-title {
    font-family: 'Manrope', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(2rem, 4.8vw, 3.6rem);
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: #ffffff;
    text-shadow: var(--text-3d-dark);
    animation: ccrFadeUp 0.55s ease-out both;
  }

  .ccr-hero-title-accent {
    display: inline-block;
    background: linear-gradient(180deg, #ffe285 0%, #f3bf28 58%, #d69d08 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #f3bf28;
    filter: drop-shadow(0 2px 4px rgba(3, 13, 26, 0.6));
  }

  .ccr-hero-lead {
    font-size: clamp(1rem, 1.45vw, 1.15rem);
    line-height: 1.7;
    color: #f1f5f9;
    font-weight: 500;
    max-width: 56ch;
    text-shadow: 0 1px 3px rgba(3, 13, 26, 0.65);
    animation: ccrFadeUp 0.65s ease-out both;
  }

  .ccr-section-title {
    font-family: 'Manrope', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.625rem, 3.4vw, 2.5rem);
    line-height: 1.15;
    letter-spacing: -0.025em;
    color: var(--ink-strong);
    text-shadow: var(--text-3d-light);
    transition: transform 0.25s ease;
  }

  .ccr-section-title-dark {
    font-family: 'Manrope', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    line-height: 1.16;
    letter-spacing: -0.025em;
    color: #ffffff;
    text-shadow: var(--text-3d-dark);
  }

  .ccr-section-lead {
    font-size: clamp(0.9375rem, 1.25vw, 1.0625rem);
    line-height: 1.68;
    color: var(--muted-readable);
    max-width: 60ch;
  }

  .ccr-card-title {
    font-family: 'Manrope', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.0625rem, 1.35vw, 1.2rem);
    line-height: 1.3;
    letter-spacing: -0.015em;
    color: var(--ink-strong);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.65);
  }
  :host([data-theme="dark"]) .ccr-card-title {
    text-shadow: 0 1px 2px rgba(2, 11, 24, 0.6);
  }

  .ccr-card-desc {
    font-size: 0.90625rem;
    line-height: 1.65;
    color: var(--muted-readable);
  }

  @keyframes ccrFadeUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ccr-hero-title,
    .ccr-hero-lead,
    .pulse-dot {
      animation: none !important;
    }
    .card,
    .dt-button,
    .dt-button-outline,
    .ccr-section-title {
      transition: none !important;
    }
  }
`;

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

