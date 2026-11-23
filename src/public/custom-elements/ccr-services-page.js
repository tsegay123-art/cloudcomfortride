import { COMPANY_INFO, IMAGES, SERVICES_DATA } from '../companyData';
import { CCR_SHARED_CSS, dispatchCcrNavigation, ensureGoogleFonts, initScrollReveals, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrServicesPage extends HTMLElement {
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

    _navigate(path, serviceId = '') {
      dispatchCcrNavigation(this, path, serviceId);
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          ${CCR_SHARED_CSS}
          .quick-jump {
            background: var(--surface);
            border-bottom: 1px solid var(--line);
            padding: 12px 0;
            position: sticky;
            top: 0;
            z-index: 20;
          }
          .pill-row {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding: 4px 0;
          }
          .jump-pill {
            flex-shrink: 0;
            white-space: nowrap;
            padding: 9px 16px;
            min-height: 44px;
            border-radius: 9999px;
            border: 1px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            font-size: 14px;
            font-weight: 700;
          }
          .jump-pill:hover {
            background: #061f46;
            color: #ffffff;
          }
          .svc-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 28px;
            align-items: center;
            padding: 40px 0;
            border-bottom: 1px solid var(--line);
          }
          @media (min-width: 1024px) {
            .svc-row { grid-template-columns: 1fr 1fr; gap: 48px; }
          }
          .svc-img {
            border-radius: 20px;
            overflow: hidden;
            border: 2px solid var(--card-border);
            aspect-ratio: 16 / 10;
            min-height: 280px;
            box-shadow: 0 14px 36px rgba(6, 31, 70, 0.1);
          }
          .svc-img img { width: 100%; height: 100%; object-fit: cover; object-position: center 22%; display: block; transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
          .svc-row:hover .svc-img img { transform: scale(1.04); }
          .feat-list { list-style: none; padding: 0; margin: 16px 0; display: flex; flex-direction: column; gap: 10px; font-size: 17px; color: var(--ink); line-height: 1.6; }
        </style>

        <section class="banner-hero" style="text-align:left;">
          <div class="container">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:32px;align-items:center;">
              <div>
                <span class="badge-pill">Non-Emergency Medical Transportation</span>
                <h1>Specialized Medical Transit in Greater Seattle</h1>
                <p style="margin:0 0 20px;">
                  Our Non-Emergency Medical Transport Service provides comfortable, secure journeys to your clinical appointments, dialysis treatments, and therapy sessions with trained, compassionate drivers.
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:12px;">
                  <button class="dt-button" id="book-main">📅 Book Medical Transit</button>
                  <a class="dt-button-outline" style="background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.3);" href="tel:${COMPANY_INFO.phoneRaw}">☎ Call Us: ${COMPANY_INFO.phoneDisplay}</a>
                </div>
              </div>
              <div style="border-radius:18px;overflow:hidden;border:2px solid rgba(255,255,255,0.22);">
                <img src="${IMAGES.medicalCenterVanDoctor}" alt="Cloud Comfort Ride clean medical transport van" style="width:100%;aspect-ratio:16/10;min-height:240px;object-fit:cover;object-position:center 22%;display:block;" />
                <div style="padding:14px 18px;background:#041329;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:15px;">
                  <strong>Seattle Medical Center Transit</strong>
                  <span style="color:#f3bf28;font-weight:700;">100% On-Time Protocol</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="quick-jump">
          <div class="container">
            <div class="pill-row">
              ${SERVICES_DATA.map((s) => `<button class="jump-pill" data-jump="${s.id}">${s.badge}</button>`).join('')}
            </div>
          </div>
        </div>

        <section style="background:var(--surface);padding:20px 0 60px;">
          <div class="container">
            ${SERVICES_DATA.map((s) => `
              <div class="svc-row" id="svc-${s.id}">
                <div class="svc-img">
                  <img src="${s.imageUrl}" alt="${s.title}" loading="lazy" />
                </div>
                <div>
                  <span class="badge-pill" style="background:rgba(18,62,119,0.1);color:#123e77;border-color:rgba(18,62,119,0.25);">${s.badge}</span>
                  <h2 style="font-size:clamp(26px,3vw,34px);font-weight:800;margin:12px 0 10px;">${s.title}</h2>
                  <p style="font-size:17px;font-weight:700;color:var(--gold-accent);margin-bottom:12px;">${s.tagline}</p>
                  <p style="font-size:17px;color:var(--muted);line-height:1.65;">${s.longDescription}</p>
                  <ul class="feat-list">
                    ${s.features.map((f) => `<li><span style="color:#16a34a;font-weight:900;">✓</span> ${f}</li>`).join('')}
                  </ul>
                  <div style="font-size:15px;color:var(--muted);margin-bottom:18px;">
                    <strong>Vehicle Type:</strong> ${s.vehicleType}
                  </div>
                  <button class="dt-button" data-book="${s.id}">Book ${s.title} →</button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;

      this.shadowRoot.getElementById('book-main').addEventListener('click', () => this._navigate('/book-online'));
      this.shadowRoot.querySelectorAll('[data-jump]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = this.shadowRoot.getElementById(`svc-${btn.getAttribute('data-jump')}`);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
      this.shadowRoot.querySelectorAll('[data-book]').forEach((btn) => {
        btn.addEventListener('click', () => this._navigate('/book-online', btn.getAttribute('data-book')));
      });
      initScrollReveals(this.shadowRoot);
    }
  }

  if (!customElements.get('ccr-services-page')) {
    customElements.define('ccr-services-page', CcrServicesPage);
  }
}
