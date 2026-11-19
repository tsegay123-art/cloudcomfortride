import { COMPANY_INFO } from '../companyData';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrLegalPage extends HTMLElement {
    static get observedAttributes() {
      return ['mode'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._onThemeSync = () => syncThemeHost(this);
    }

    connectedCallback() {
      ensureGoogleFonts();
      syncThemeHost(this);
      window.addEventListener('ccr-theme-change', this._onThemeSync);
      this.render();
    }

    disconnectedCallback() {
      window.removeEventListener('ccr-theme-change', this._onThemeSync);
    }

    attributeChangedCallback() {
      this.render();
    }

    render() {
      const mode = this.getAttribute('mode') || 'privacy';
      const titles = {
        privacy: { badge: 'Legal & Compliance', h1: 'Privacy Policy', sub: 'How Cloud Comfort Ride protects your personal and transportation information.' },
        terms: { badge: 'Terms & Conditions', h1: 'Terms of Service', sub: 'Service guidelines, scheduling policies, and non-emergency medical transit terms.' },
        accessibility: { badge: 'ADA & Digital Access', h1: 'Accessibility Statement', sub: 'Our commitment to physical ADA vehicle access and WCAG-compliant digital booking.' }
      };
      const meta = titles[mode] || titles.privacy;

      this.shadowRoot.innerHTML = `
        <style>
          ${CCR_SHARED_CSS}
          .prose-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 36px;
            max-width: 860px;
            margin: 0 auto;
          }
          .prose-card h2 { font-size: clamp(22px, 2.4vw, 28px); font-weight: 800; margin: 26px 0 10px; }
          .prose-card p { font-size: 17px; color: var(--muted); line-height: 1.7; margin-bottom: 14px; }
          .prose-card a { color: #123e77; font-weight: 700; text-decoration: underline; }
          :host([data-theme="dark"]) .prose-card a { color: #f3bf28; }
        </style>

        <section class="banner-hero">
          <div class="container">
            <span class="badge-pill">${meta.badge}</span>
            <h1>${meta.h1}</h1>
            <p>${meta.sub}</p>
          </div>
        </section>

        <section style="background:var(--surface-alt);padding:48px 0;">
          <div class="container">
            <div class="prose-card">
              ${mode === 'privacy' ? `
                <h2 style="margin-top:0;">1. Information We Collect</h2>
                <p>${COMPANY_INFO.legalName} collects only the information necessary to coordinate safe, punctual non-emergency medical transportation—including passenger name, contact telephone, email, pickup/destination addresses, and mobility equipment requirements.</p>
                <h2>2. Confidentiality &amp; Medical Privacy</h2>
                <p>We treat all appointment details, clinic destinations, and mobility notes with strict confidentiality. We never sell or rent passenger information to third parties.</p>
                <h2>3. Contact Us</h2>
                <p>For privacy inquiries, contact us at <a href="mailto:${COMPANY_INFO.email}">${COMPANY_INFO.email}</a> or call ${COMPANY_INFO.phoneDisplay}.</p>
              ` : mode === 'accessibility' ? `
                <h2 style="margin-top:0;">1. Physical Fleet Accessibility (ADA)</h2>
                <p>Cloud Comfort Ride operates ADA-compliant vehicles equipped with hydraulic wheelchair lifts, gentle-grade ramps, and certified 4-point Q-Straint tie-downs for manual and motorized wheelchairs.</p>
                <h2>2. Digital Accessibility</h2>
                <p>We strive to meet WCAG 2.1 AA standards across all pages, including keyboard navigation, high-contrast color tokens, and accessible form labels.</p>
                <h2>3. Assistance</h2>
                <p>If you need assistance booking a ride or encounter any barrier, please call our Seattle dispatch directly at ${COMPANY_INFO.phoneDisplay}.</p>
              ` : `
                <h2 style="margin-top:0;">1. Non-Emergency Medical Transportation Scope</h2>
                <p>Cloud Comfort Ride provides strictly Non-Emergency Medical Transportation (NEMT). In any life-threatening medical emergency, please dial 911 immediately.</p>
                <h2>2. Scheduling &amp; Cancellations</h2>
                <p>We recommend booking 24–48 hours in advance. To modify or cancel a scheduled ride, please call Seattle dispatch at ${COMPANY_INFO.phoneDisplay}.</p>
              `}
            </div>
          </div>
        </section>
      `;
    }
  }

  if (!customElements.get('ccr-legal-page')) {
    customElements.define('ccr-legal-page', CcrLegalPage);
  }
}
