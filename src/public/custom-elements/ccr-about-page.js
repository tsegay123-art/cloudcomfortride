import { COMPANY_INFO, IMAGES } from '../companyData';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrAboutPage extends HTMLElement {
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

    _navigate(path) {
      this.dispatchEvent(new CustomEvent('navigate', {
        detail: { path },
        bubbles: true,
        composed: true
      }));
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          ${CCR_SHARED_CSS}
          .story-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 36px;
            align-items: center;
            padding: 56px 0;
          }
          @media (min-width: 1024px) { .story-grid { grid-template-columns: 1fr 1fr; } }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 18px;
          }
          .stat-card {
            padding: 24px;
            border-radius: 16px;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            text-align: center;
          }
          .stat-val {
            font-family: 'Manrope', sans-serif;
            font-size: 36px;
            font-weight: 900;
            color: #061f46;
          }
          :host([data-theme="dark"]) .stat-val { color: #f3bf28; }
        </style>

        <section class="banner-hero">
          <div class="container">
            <span class="badge-pill">About Cloud Comfort Ride</span>
            <h1>Transport Service With Care &amp; Dignity</h1>
            <p>
              Founded in 2023 in Seattle, Cloud Comfort Ride (Cloud Medical Transportation) was built to bridge the gap in healthcare transit with safe, compassionate, and punctual service.
            </p>
          </div>
        </section>

        <section style="background:var(--surface);">
          <div class="container story-grid">
            <div>
              <span class="eyebrow"><span class="eyebrow-dot"></span> Our Founding Story</span>
              <h2 style="font-size:34px;font-weight:800;margin:10px 0 16px;">Deeply Rooted in the Heart of Seattle</h2>
              <div style="display:flex;flex-direction:column;gap:14px;font-size:15px;color:var(--muted);line-height:1.7;">
                <p>Welcome to <strong>Cloud Comfort Ride</strong> (Cloud Medical Transportation), a non-emergency medical transportation service deeply rooted in the heart of Seattle. Founded in 2023 by a seasoned professional businessman, our company was born out of a motivation to serve and a commitment to excellence in healthcare transportation.</p>
                <p>At Cloud Comfort Ride, we specialize in providing safe, reliable, and compassionate transportation services for individuals with special medical needs. Recognizing the challenges faced by those who cannot travel via standard means, we have dedicated ourselves to bridging the gap, ensuring that medical appointments and healthcare needs are met with ease and efficiency.</p>
                <p>Understanding the critical nature of punctuality in the medical field, we take immense pride in our reliability. Our efficient scheduling and precise coordination mean that late arrivals and the stress of rescheduling are things of the past.</p>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px;">
                <button class="dt-button" id="schedule-btn">Schedule a Medical Ride</button>
                <a class="dt-button-outline" href="tel:${COMPANY_INFO.phoneRaw}">Call ${COMPANY_INFO.phoneDisplay}</a>
              </div>
            </div>

            <div class="card" style="border:2px solid var(--card-border);">
              <img src="${IMAGES.heroBrandedVanPanoramic}" alt="Cloud Comfort Ride official branded transit van" style="width:100%;height:320px;object-fit:cover;display:block;" />
              <div style="padding:20px;background:#061f46;color:#fff;border-top:2px solid #f3bf28;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;">
                <div>
                  <strong style="font-size:16px;display:block;">Compassionate Patient Assistance</strong>
                  <span style="font-size:12px;color:#cbd5e1;">${COMPANY_INFO.address} • ${COMPANY_INFO.phoneDisplay}</span>
                </div>
                <span class="badge-pill">Seattle &amp; King County</span>
              </div>
            </div>
          </div>
        </section>

        <section style="background:var(--surface-alt);padding:56px 0;border-top:1px solid var(--line);">
          <div class="container">
            <div style="text-align:center;max-width:660px;margin:0 auto 36px;">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Operational Standards</span>
              <h2 style="font-size:32px;font-weight:800;margin:8px 0;">Safety, Fleet Maintenance &amp; The Team</h2>
              <p style="font-size:14px;color:var(--muted);">The heart of Cloud Medical Transport lies in our exceptional team and our rigorous vehicle safety protocols.</p>
            </div>

            <div class="stats-grid">
              ${COMPANY_INFO.stats.map((st) => `
                <div class="stat-card">
                  <div class="stat-val">${st.value}</div>
                  <strong style="display:block;font-size:15px;margin:6px 0 4px;">${st.label}</strong>
                  <span style="font-size:12px;color:var(--muted);">${st.highlight}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      `;

      this.shadowRoot.getElementById('schedule-btn').addEventListener('click', () => this._navigate('/book-a-ride'));
    }
  }

  if (!customElements.get('ccr-about-page')) {
    customElements.define('ccr-about-page', CcrAboutPage);
  }
}
