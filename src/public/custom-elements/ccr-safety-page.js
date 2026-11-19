import { COMPANY_INFO, DRIVER_STANDARDS, IMAGES } from '../companyData';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrSafetyPage extends HTMLElement {
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
          .split-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 36px;
            align-items: center;
            padding: 56px 0;
          }
          @media (min-width: 1024px) { .split-grid { grid-template-columns: 1fr 1fr; } }
          .callout {
            padding: 16px;
            border-radius: 14px;
            background: var(--surface-alt);
            border: 1px solid var(--card-border);
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }
          .standards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
          }
          .std-card {
            padding: 24px;
            border-radius: 16px;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-top: 3px solid #f3bf28;
          }
        </style>

        <section class="banner-hero">
          <div class="container">
            <span class="badge-pill">Driver Safety, Fleet &amp; Training</span>
            <h1>Dedicated Drivers. Empathy-First Service.</h1>
            <p>
              At Cloud Comfort Ride, we prioritize selecting individuals who are naturally courteous, solution-focused, and deeply empathetic. Every driver is CPR certified and thoroughly trained.
            </p>
          </div>
        </section>

        <section style="background:var(--surface);">
          <div class="container split-grid">
            <div style="display:flex;flex-direction:column;gap:14px;">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Driver Excellence</span>
              <h2 style="font-size:34px;font-weight:800;">Safety, Courtesy &amp; Empathy at Every Turn</h2>
              <p style="font-size:15px;color:var(--muted);line-height:1.65;">
                Each potential driver undergoes rigorous Washington State Patrol and FBI background checks before joining our team. We often assign the same drivers to specific facilities to foster familiarity, trust, and comfort.
              </p>
              <div class="callout">
                <span style="color:#16a34a;font-weight:900;">✓</span>
                <div>
                  <strong style="font-size:13px;text-transform:uppercase;">EFFICIENT: Ramp &amp; Wheelchair Lift Operation</strong>
                  <p style="font-size:12px;color:var(--muted);margin-top:4px;">Hydraulic ramps and wheelchair lifts operated with strict adherence to ADA protocols and 4-point Q-Straint tie-downs.</p>
                </div>
              </div>
              <div class="callout">
                <span style="color:#16a34a;font-weight:900;">✓</span>
                <div>
                  <strong style="font-size:13px;text-transform:uppercase;">SAFE: Vehicle Entry &amp; Exit Support</strong>
                  <p style="font-size:12px;color:var(--muted);margin-top:4px;">Stability support for walking aids, rollators, and wheelchair transfers at every pickup and drop-off.</p>
                </div>
              </div>
              <div class="callout">
                <span style="color:#16a34a;font-weight:900;">✓</span>
                <div>
                  <strong style="font-size:13px;text-transform:uppercase;">ASSISTANCE: Clinic Escort Navigation</strong>
                  <p style="font-size:12px;color:var(--muted);margin-top:4px;">Door-through-door escort into your healthcare facility lobby, check-in desk, or clinic department.</p>
                </div>
              </div>
            </div>

            <div class="card">
              <img src="${IMAGES.wheelchairRampVan}" alt="Cloud Comfort Ride wheelchair accessible transit van with commercial ramp deployed" style="width:100%;height:340px;object-fit:cover;display:block;" />
              <div style="padding:22px;background:#061f46;color:#fff;border-top:2px solid #f3bf28;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <strong style="font-size:17px;">Certified Ramp &amp; Lift Operation</strong>
                  <span class="badge-pill">ADA Certified</span>
                </div>
                <p style="font-size:12px;color:#cbd5e1;line-height:1.55;">
                  "Seeing the same dedicated, courteous driver each week gives patients peace of mind and builds genuine community trust."
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style="background:var(--surface-alt);padding:56px 0;border-top:1px solid var(--line);">
          <div class="container">
            <div style="text-align:center;max-width:660px;margin:0 auto 36px;">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Safety &amp; Vetting Standards</span>
              <h2 style="font-size:32px;font-weight:800;margin:8px 0;">6-Point Driver &amp; Fleet Guarantee</h2>
            </div>
            <div class="standards-grid">
              ${DRIVER_STANDARDS.map((st) => `
                <div class="std-card">
                  <h3 style="font-size:18px;font-weight:800;margin-bottom:8px;">${st.title}</h3>
                  <p style="font-size:13px;color:var(--muted);line-height:1.6;">${st.description}</p>
                </div>
              `).join('')}
            </div>
            <div style="text-align:center;margin-top:36px;">
              <button class="dt-button" id="book-safety">Book with Our Certified Team →</button>
            </div>
          </div>
        </section>

        <section style="background:var(--surface);padding:56px 0;border-top:1px solid var(--line);">
          <div class="container">
            <div style="text-align:center;max-width:660px;margin:0 auto 36px;">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Our Medical Transit Fleet</span>
              <h2 style="font-size:32px;font-weight:800;margin:8px 0;">ADA-Compliant Vans &amp; Comfort Sedans</h2>
              <p style="font-size:14px;color:var(--muted);">Every vehicle undergoes daily pre-trip safety inspections, climate calibration, and hospital-grade sanitization.</p>
            </div>
            <div class="standards-grid">
              <div class="std-card" style="padding:0;overflow:hidden;">
                <img src="${IMAGES.wheelchairSeattleSkyline}" alt="ADA Wheelchair Accessible Van with hydraulic lift" style="width:100%;height:190px;object-fit:cover;display:block;" />
                <div style="padding:20px;">
                  <h3 style="font-size:17px;font-weight:800;margin-bottom:6px;">ADA Wheelchair Accessible Vans</h3>
                  <p style="font-size:13px;color:var(--muted);line-height:1.55;">High-roof transit vans with commercial hydraulic lifts, gentle-grade ramps, and certified 4-point Q-Straint tie-downs.</p>
                </div>
              </div>
              <div class="std-card" style="padding:0;overflow:hidden;">
                <img src="${IMAGES.clinicPickupSedan}" alt="Low-step comfort sedan for ambulatory medical transit" style="width:100%;height:190px;object-fit:cover;display:block;" />
                <div style="padding:20px;">
                  <h3 style="font-size:17px;font-weight:800;margin-bottom:6px;">Ambulatory Sedans &amp; SUVs</h3>
                  <p style="font-size:13px;color:var(--muted);line-height:1.55;">Low-step-in sedans and SUVs ideal for routine clinic visits, specialist consultations, and post-procedure discharges.</p>
                </div>
              </div>
              <div class="std-card" style="padding:0;overflow:hidden;">
                <img src="${IMAGES.cleanVanInterior}" alt="Spacious sanitized passenger van interior" style="width:100%;height:190px;object-fit:cover;display:block;" />
                <div style="padding:20px;">
                  <h3 style="font-size:17px;font-weight:800;margin-bottom:6px;">Spacious &amp; Sanitized Cabins</h3>
                  <p style="font-size:13px;color:var(--muted);line-height:1.55;">Leather seating, dual-zone climate control, walker/rollator storage, and room for a family caregiver or health aide.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;

      this.shadowRoot.getElementById('book-safety').addEventListener('click', () => this._navigate('/book-a-ride'));
    }
  }

  if (!customElements.get('ccr-safety-page')) {
    customElements.define('ccr-safety-page', CcrSafetyPage);
  }
}
