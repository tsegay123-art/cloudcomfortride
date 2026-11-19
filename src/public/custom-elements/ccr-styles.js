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
    --muted: #65758b;
    --line: #dce4ee;
    --surface: #ffffff;
    --surface-alt: #f7f9fc;
    --card-bg: #ffffff;
    --card-border: #dce4ee;
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    color: var(--ink);
    display: block;
    box-sizing: border-box;
  }

  :host([data-theme="dark"]) {
    --navy: #092754;
    --navy-dark: #030d1a;
    --cream: #061426;
    --ink: #f1f5f9;
    --muted: #94a3b8;
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
    font-size: clamp(34px, 4.6vw, 60px);
    line-height: 1.08;
    font-weight: 800;
  }

  h2 {
    font-size: clamp(28px, 3.6vw, 42px);
    line-height: 1.15;
    font-weight: 800;
  }

  h3 {
    font-size: clamp(20px, 2vw, 24px);
    line-height: 1.25;
    font-weight: 800;
  }

  p {
    margin: 0;
    font-size: clamp(16px, 1.2vw, 18px);
    line-height: 1.65;
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
    padding: 13px 24px;
    border-radius: 10px;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: 16px;
    min-height: 48px;
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
    padding: 13px 22px;
    border-radius: 10px;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: 16px;
    min-height: 48px;
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
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.6px;
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

  .banner-hero {
    background: #061f46;
    color: #ffffff;
    padding: 64px 0;
    border-bottom: 2px solid #f3bf28;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  :host([data-theme="dark"]) .banner-hero {
    background: #030d1a;
  }
  .banner-hero h1 {
    font-size: clamp(34px, 4.5vw, 54px);
    font-weight: 800;
    color: #ffffff;
    margin: 16px 0 14px;
    line-height: 1.1;
    text-shadow: 0 2px 14px rgba(4, 19, 41, 0.45);
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
    border-radius: 16px;
    box-shadow: 0 15px 40px rgba(16, 44, 77, 0.04);
    overflow: hidden;
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

