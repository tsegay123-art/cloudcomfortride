/// <reference lib="dom" />
import { COMPANY_INFO, IMAGES } from '../companyData';
import { THEME_STORAGE_KEY } from '../bookingHelpers';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrHeader extends HTMLElement {
    static get observedAttributes() {
      return ['current-path', 'booking-count', 'route-map'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._mobileOpen = false;
      this._theme = 'light';
      this._onThemeSync = () => {
        syncThemeHost(this);
        this._theme = this.getAttribute('data-theme') || 'light';
        this.render();
      };
      this._onKeyDown = (e) => {
        if (e.key === 'Escape' && this._mobileOpen) {
          this._mobileOpen = false;
          this.render();
        }
      };
    }

    connectedCallback() {
      ensureGoogleFonts();
      syncThemeHost(this);
      this._theme = this.getAttribute('data-theme') || 'light';
      window.addEventListener('ccr-theme-change', this._onThemeSync);
      window.addEventListener('ccr-bookings-updated', this._onThemeSync);
      window.addEventListener('keydown', this._onKeyDown);
      this.render();
    }

    disconnectedCallback() {
      window.removeEventListener('ccr-theme-change', this._onThemeSync);
      window.removeEventListener('ccr-bookings-updated', this._onThemeSync);
      window.removeEventListener('keydown', this._onKeyDown);
    }

    attributeChangedCallback() {
      this.render();
    }

    _navigate(path) {
      const requested = path || '/';
      let routeMap = {};
      let hasRouteMap = false;
      try {
        const rawMap = this.getAttribute('route-map');
        if (rawMap) {
          routeMap = JSON.parse(rawMap);
          hasRouteMap = Object.keys(routeMap).length > 0;
        }
      } catch (e) {
        routeMap = {};
      }
      const targetPath = routeMap[requested] || requested;
      const prevHref = typeof window !== 'undefined' ? window.location.href : '';
      const currentAttr = this.getAttribute('current-path') || '/';

      this.dispatchEvent(new CustomEvent('navigate', {
        detail: { path: requested },
        bubbles: true,
        composed: true
      }));

      this._mobileOpen = false;
      this.render();

      if (!hasRouteMap && typeof window !== 'undefined' && targetPath !== currentAttr) {
        setTimeout(() => {
          if (window.location.href === prevHref && window.location.pathname !== targetPath) {
            window.location.assign(targetPath);
          }
        }, 350);
      }
    }

    _toggleTheme() {
      const next = this._theme === 'dark' ? 'light' : 'dark';
      this._theme = next;
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (e) {
        // Ignore
      }
      this.setAttribute('data-theme', next);
      window.dispatchEvent(new CustomEvent('ccr-theme-change', { detail: { theme: next } }));
      this.render();
    }

    render() {
      const currentPath = this.getAttribute('current-path') || '/';

      const navLinks = [
        { label: 'Home', path: '/', aliases: ['/'] },
        { label: 'Services', path: '/services', aliases: ['/services'] },
        { label: 'About Us', path: '/about', aliases: ['/about', '/about-us'] },
        { label: 'Why Cloud Comfort Ride', path: '/safety-drivers', aliases: ['/safety-drivers', '/why-cloud-comfort-ride', '/why-cloud-medical'] },
        { label: 'Fleet', path: '/fleet', aliases: ['/fleet'] },
        { label: 'Contact Us', path: '/contact', aliases: ['/contact', '/contact-us'] },
        { label: 'My Bookings', path: '/my-booking', aliases: ['/my-bookings', '/my-booking'] }
      ];
      const isLinkActive = (link) => link.aliases.includes(currentPath);

      this.shadowRoot.innerHTML = `
        <style>
          ${CCR_SHARED_CSS}
          header {
            position: sticky;
            top: 0;
            z-index: 50;
            width: 100%;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(10px);
            border-bottom: 3px solid #f3bf28;
            box-shadow: 0 2px 10px rgba(6, 31, 70, 0.06);
          }
          :host([data-theme="dark"]) header {
            background: rgba(4, 19, 41, 0.96);
          }
          .top-strip {
            background: #f7f9fc;
            border-bottom: 1px solid #dce4ee;
            font-size: 14px;
            padding: 8px 0;
          }
          :host([data-theme="dark"]) .top-strip {
            background: #030d1a;
            border-bottom-color: #1e293b;
          }
          .strip-inner {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .strip-left {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 700;
            color: var(--ink);
            white-space: nowrap;
          }
          .strip-left a {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          }
          .strip-left a:hover { color: #123e77; }
          :host([data-theme="dark"]) .strip-left a:hover { color: #f3bf28; }
          .strip-right {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--muted);
            white-space: nowrap;
          }
          @media (min-width: 640px) { .strip-right { font-size: 13px; } }
          .nav-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            min-height: 68px;
            padding: 10px 0;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            background: none;
            border: none;
            padding: 0;
            text-align: left;
            min-width: 0;
          }
          .brand img {
            height: 36px;
            width: auto;
            object-fit: contain;
            flex-shrink: 0;
          }
          @media (min-width: 640px) {
            .brand { gap: 12px; }
            .brand img { height: 46px; }
          }
          .brand-title {
            font-family: 'Manrope', sans-serif;
            font-weight: 900;
            font-size: clamp(16px, 4.3vw, 22px);
            color: #061f46;
            line-height: 1.1;
            display: block;
            white-space: nowrap;
          }
          :host([data-theme="dark"]) .brand-title { color: #ffffff; }
          .brand-sub {
            font-size: 11px;
            font-weight: 700;
            color: #123e77;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            display: none;
            margin-top: 3px;
          }
          @media (min-width: 520px) { .brand-sub { display: block; font-size: 12px; } }
          :host([data-theme="dark"]) .brand-sub { color: #f3bf28; }
          .desktop-nav {
            display: none;
            align-items: center;
            gap: 12px;
            font-size: 15px;
            font-weight: 700;
          }
          @media (min-width: 1120px) {
            .desktop-nav { display: flex; }
            .mobile-actions { display: none !important; }
          }
          @media (min-width: 1280px) {
            .desktop-nav { gap: 18px; font-size: 16px; }
          }
          .nav-link, .mobile-link, .brand, .icon-btn, .book-pill {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
          .nav-link {
            background: none;
            border: none;
            color: var(--ink);
            font-weight: 700;
            font-size: inherit;
            padding: 8px 2px;
            min-height: 44px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border-bottom: 2px solid transparent;
            transition: color 0.15s ease, border-color 0.15s ease;
            white-space: nowrap;
          }
          .nav-link:hover { color: #123e77; }
          .nav-link.active {
            color: #123e77;
            border-bottom-color: #123e77;
            font-weight: 800;
          }
          :host([data-theme="dark"]) .nav-link:hover,
          :host([data-theme="dark"]) .nav-link.active {
            color: #f3bf28;
            border-bottom-color: #f3bf28;
          }
          .count-badge {
            padding: 2px 7px;
            border-radius: 9999px;
            font-size: 10px;
            background: #f3bf28;
            color: #061f46;
            font-weight: 900;
          }
          .icon-btn {
            padding: 8px;
            border-radius: 10px;
            border: 1px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            min-width: 40px;
            min-height: 40px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
          }
          .book-pill {
            border-radius: 9999px !important;
            padding: 10px 20px !important;
            font-size: 15px !important;
            min-height: 44px !important;
          }
          .mobile-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .mobile-drawer {
            background: var(--surface);
            border-top: 1px solid var(--line);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
            position: relative;
            z-index: 60;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          }
          .mobile-link {
            width: 100%;
            text-align: left;
            padding: 14px 16px;
            min-height: 48px;
            border-radius: 12px;
            border: none;
            background: transparent;
            color: var(--ink);
            font-weight: 700;
            font-size: 17px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .mobile-link.active {
            background: #eaf2ff;
            color: #123e77;
          }
          :host([data-theme="dark"]) .mobile-link.active {
            background: #1e293b;
            color: #f3bf28;
          }
          .hide-sm { display: none; }
          @media (min-width: 640px) { .hide-sm { display: inline-flex; } }
        </style>

        <header>
          <div class="top-strip">
            <div class="container strip-inner">
              <div class="strip-left">
                <a href="tel:${COMPANY_INFO.phoneRaw}">
                  <span style="color:#986800">☎</span>
                  <strong>${COMPANY_INFO.phoneDisplay}</strong>
                </a>
                <span class="hide-sm" style="color:#cbd5e1">|</span>
                <a class="hide-sm" href="mailto:${COMPANY_INFO.email}">
                  <span style="color:#986800">✉</span>
                  <span>${COMPANY_INFO.email}</span>
                </a>
              </div>
              <div class="strip-right">
                <span class="pulse-dot"></span>
                <span>Serving Seattle &amp; King County</span>
              </div>
            </div>
          </div>

          <div class="container nav-bar">
            <button class="brand" data-nav="/">
              <img src="${IMAGES.emblemTransparent}" alt="Cloud Comfort Ride emblem" />
              <div>
                <span class="brand-title">${COMPANY_INFO.brandName}</span>
                <span class="brand-sub">${COMPANY_INFO.subTagline}</span>
              </div>
            </button>

            <nav class="desktop-nav" aria-label="Main Navigation">
              ${navLinks.map((link) => `
                <button class="nav-link ${isLinkActive(link) ? 'active' : ''}" data-nav="${link.path}">
                  <span>${link.label}</span>
                  ${link.badge ? `<span class="count-badge">${link.badge}</span>` : ''}
                </button>
              `).join('')}
              <button class="icon-btn" id="theme-toggle-desktop" aria-label="Toggle dark mode" title="Toggle Light/Dark Mode">
                ${this._theme === 'dark' ? '☀' : '☾'}
              </button>
              <button class="dt-button book-pill" data-nav="/book-a-ride">
                <span style="color:#f3bf28">📅</span>
                <span>Book A Ride</span>
              </button>
            </nav>

            <div class="mobile-actions">
              <button class="icon-btn" id="theme-toggle-mobile" aria-label="Toggle dark mode">
                ${this._theme === 'dark' ? '☀' : '☾'}
              </button>
              <button class="dt-button book-pill" data-nav="/book-a-ride">Book</button>
              <button class="icon-btn" id="menu-toggle" aria-label="Toggle menu" aria-expanded="${this._mobileOpen}">
                ${this._mobileOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          ${this._mobileOpen ? `
            <div class="mobile-drawer">
              ${navLinks.map((link) => `
                <button class="mobile-link ${isLinkActive(link) ? 'active' : ''}" data-nav="${link.path}">
                  <span>${link.label} ${link.badge ? `<span class="count-badge">${link.badge}</span>` : ''}</span>
                  <span>›</span>
                </button>
              `).join('')}
              <div style="display:flex;flex-direction:column;gap:8px;padding-top:10px;border-top:1px solid var(--line);">
                <button class="dt-button" data-nav="/book-a-ride">📅 Book A Ride Online</button>
                <a class="dt-button-outline" href="tel:${COMPANY_INFO.phoneRaw}">☎ Call Us: ${COMPANY_INFO.phoneDisplay}</a>
              </div>
            </div>
          ` : ''}
        </header>
      `;

      this.shadowRoot.querySelectorAll('[data-nav]').forEach((btn) => {
        btn.addEventListener('click', () => this._navigate(btn.getAttribute('data-nav')));
      });
      const dtBtn = this.shadowRoot.getElementById('theme-toggle-desktop');
      const mbBtn = this.shadowRoot.getElementById('theme-toggle-mobile');
      if (dtBtn) dtBtn.addEventListener('click', () => this._toggleTheme());
      if (mbBtn) mbBtn.addEventListener('click', () => this._toggleTheme());

      const menuBtn = this.shadowRoot.getElementById('menu-toggle');
      if (menuBtn) {
        menuBtn.addEventListener('click', () => {
          this._mobileOpen = !this._mobileOpen;
          this.render();
        });
      }
    }
  }

  if (!customElements.get('ccr-header')) {
    customElements.define('ccr-header', CcrHeader);
  }
}
