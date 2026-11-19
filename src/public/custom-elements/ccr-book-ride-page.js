import { COMPANY_INFO, FAQS, IMAGES } from '../companyData';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';
import './ccr-booking-form';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrBookRidePage extends HTMLElement {
    static get observedAttributes() {
      return ['initial-service', 'booking-result', 'booking-error'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._openFaqIndex = 0;
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

    attributeChangedCallback(name, _oldVal, newVal) {
      if (name === 'initial-service') {
        const form = this.shadowRoot && this.shadowRoot.querySelector('ccr-booking-form');
        if (form && newVal !== null) {
          form.setAttribute('initial-service', newVal);
        } else {
          this.render();
        }
        return;
      }
      if ((name === 'booking-result' || name === 'booking-error') && newVal !== null) {
        const form = this.shadowRoot && this.shadowRoot.querySelector('ccr-booking-form');
        if (form) form.setAttribute(name, newVal);
      }
    }

    render() {
      const initialService = this.getAttribute('initial-service') || '';

      this.shadowRoot.innerHTML = `
        <style>
          ${CCR_SHARED_CSS}
          .book-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 48px 0;
            align-items: start;
          }
          @media (min-width: 1024px) {
            .book-grid { grid-template-columns: 8fr 4fr; }
          }
          .sidebar { display: flex; flex-direction: column; gap: 20px; }
          .faq-item {
            border: 1px solid var(--card-border);
            border-radius: 14px;
            background: var(--card-bg);
            overflow: hidden;
            margin-bottom: 10px;
          }
          .faq-btn {
            width: 100%;
            text-align: left;
            padding: 18px 22px;
            min-height: 52px;
            background: none;
            border: none;
            color: var(--ink);
            font-family: 'Manrope', sans-serif;
            font-weight: 800;
            font-size: 17px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
          }
          .faq-ans {
            padding: 0 22px 18px;
            font-size: 16px;
            color: var(--muted);
            line-height: 1.65;
          }
        </style>

        <section class="banner-hero">
          <div class="container">
            <span class="badge-pill">Online Dispatch Portal</span>
            <h1>Book Your Medical Ride</h1>
            <p>
              Fill in your appointment and mobility requirements below. Our Seattle dispatch team will immediately review your request and confirm vehicle coordination.
            </p>
          </div>
        </section>

        <section style="background:var(--surface);">
          <div class="container book-grid">
            <div>
              <ccr-booking-form initial-service="${initialService}"></ccr-booking-form>
            </div>

            <aside class="sidebar">
              <div class="card">
                <div style="position:relative;height:200px;">
                  <img src="${IMAGES.driverSedanAssistance}" alt="Cloud Comfort Ride driver assisting passenger" style="width:100%;height:100%;object-fit:cover;display:block;" />
                  <span style="position:absolute;bottom:12px;left:12px;padding:5px 12px;border-radius:9999px;background:rgba(6,31,70,0.9);color:#fff;font-size:11px;font-weight:700;border:1px solid rgba(243,191,40,0.5);">Door-Through-Door Care</span>
                </div>
                <div style="padding:24px;display:flex;flex-direction:column;gap:14px;">
                  <h3 style="font-size:21px;font-weight:800;">What to Expect with Cloud Comfort Ride</h3>
                  <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px;font-size:16px;color:var(--muted);line-height:1.55;">
                    <li><strong style="color:var(--ink);">✓ 100% On-Time Guarantee:</strong> Punctual arrival for dialysis, clinic visits, and surgical appointments.</li>
                    <li><strong style="color:var(--ink);">✓ CPR &amp; First Aid Certified:</strong> Drivers trained in safe mobility and emergency care protocols.</li>
                    <li><strong style="color:var(--ink);">✓ Wheelchair &amp; Walker Safe:</strong> ADA ramps, hydraulic lifts, and 4-point Q-Straint tie-downs.</li>
                    <li><strong style="color:var(--ink);">✓ Digital Trip Voucher:</strong> Instant confirmation reference and printable receipt.</li>
                  </ul>
                  <div style="padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:14px;font-weight:700;">
                    <a href="${COMPANY_INFO.mapsUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;">Seattle HQ: 1902 E Yesler Way</a>
                    <span style="color:#15803d;">King County Licensed</span>
                  </div>
                </div>
              </div>

              <div style="background:#061f46;color:#fff;border-radius:20px;padding:26px;border:2px solid #f3bf28;display:flex;flex-direction:column;gap:12px;">
                <span style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#f3bf28;">Need Urgent or Same-Day Booking?</span>
                <h4 style="font-size:21px;font-weight:800;color:#fff;">Call Our Seattle Dispatch Directly</h4>
                <p style="font-size:16px;color:#cbd5e1;line-height:1.6;">Available Monday – Sunday, 6:00 AM – 8:00 PM (Priority on-call for dialysis &amp; discharges).</p>
                <a class="dt-button" style="background:#f3bf28;color:#061f46;border-color:#f3bf28;box-shadow:none;" href="tel:${COMPANY_INFO.phoneRaw}">
                  ☎ ${COMPANY_INFO.phoneDisplay}
                </a>
              </div>
            </aside>
          </div>
        </section>

        <section style="background:var(--surface-alt);padding:64px 0;border-top:1px solid var(--line);">
          <div class="container" style="max-width:860px;">
            <div style="text-align:center;margin-bottom:32px;">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Frequently Asked Questions</span>
              <h2 style="font-size:clamp(28px,3.4vw,38px);font-weight:800;margin-top:10px;">Booking &amp; Ride Information</h2>
            </div>
            ${FAQS.map((faq, idx) => `
              <div class="faq-item">
                <button class="faq-btn" data-faq="${idx}">
                  <span>${faq.question}</span>
                  <span>${this._openFaqIndex === idx ? '−' : '+'}</span>
                </button>
                ${this._openFaqIndex === idx ? `<div class="faq-ans">${faq.answer}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;

      this.shadowRoot.querySelectorAll('[data-faq]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-faq'));
          this._openFaqIndex = this._openFaqIndex === idx ? -1 : idx;
          this.render();
        });
      });
    }
  }

  if (!customElements.get('ccr-book-ride-page')) {
    customElements.define('ccr-book-ride-page', CcrBookRidePage);
  }
}
