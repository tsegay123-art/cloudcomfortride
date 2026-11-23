import { COMPANY_INFO, DRIVER_STANDARDS, IMAGES } from '../companyData';
import { CCR_SHARED_CSS, dispatchCcrNavigation, ensureGoogleFonts, initScrollReveals, syncThemeHost } from './ccr-styles';

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
      dispatchCcrNavigation(this, path);
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
            <div style="display:flex;flex-direction:column;gap:16px;">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Driver Excellence</span>
              <h2 style="font-size:clamp(28px,3.6vw,40px);font-weight:800;">Safety, Courtesy &amp; Empathy at Every Turn</h2>
              <p style="font-size:clamp(16px,1.25vw,18px);color:var(--muted);line-height:1.65;">
                Each potential driver undergoes rigorous Washington State Patrol and FBI background checks before joining our team. We often assign the same drivers to specific facilities to foster familiarity, trust, and comfort.
              </p>
              <div class="callout">
                <span style="color:#16a34a;font-weight:900;font-size:18px;">✓</span>
                <div>
                  <strong style="font-size:16px;text-transform:uppercase;">EFFICIENT: Ramp &amp; Wheelchair Lift Operation</strong>
                  <p style="font-size:16px;color:var(--muted);margin-top:6px;line-height:1.6;">Hydraulic ramps and wheelchair lifts operated with strict adherence to ADA protocols and 4-point Q-Straint tie-downs.</p>
                </div>
              </div>
              <div class="callout">
                <span style="color:#16a34a;font-weight:900;font-size:18px;">✓</span>
                <div>
                  <strong style="font-size:16px;text-transform:uppercase;">SAFE: Vehicle Entry &amp; Exit Support</strong>
                  <p style="font-size:16px;color:var(--muted);margin-top:6px;line-height:1.6;">Stability support for walking aids, rollators, and wheelchair transfers at every pickup and drop-off.</p>
                </div>
              </div>
              <div class="callout">
                <span style="color:#16a34a;font-weight:900;font-size:18px;">✓</span>
                <div>
                  <strong style="font-size:16px;text-transform:uppercase;">ASSISTANCE: Clinic Escort Navigation</strong>
                  <p style="font-size:16px;color:var(--muted);margin-top:6px;line-height:1.6;">Door-through-door escort into your healthcare facility lobby, check-in desk, or clinic department.</p>
                </div>
              </div>
            </div>

            <div class="card reveal">
              <img src="${IMAGES.wheelchairRampVan}" alt="Cloud Comfort Ride wheelchair accessible transit van with commercial ramp deployed" style="width:100%;aspect-ratio:16/10;min-height:260px;object-fit:cover;object-position:center 22%;display:block;" />
              <div style="padding:24px;background:#061f46;color:#fff;border-top:2px solid #f3bf28;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:10px;flex-wrap:wrap;">
                  <strong style="font-size:20px;">Certified Ramp &amp; Lift Operation</strong>
                  <span class="badge-pill">ADA Certified</span>
                </div>
                <p style="font-size:16px;color:#cbd5e1;line-height:1.6;">
                  "Seeing the same dedicated, courteous driver each week gives patients peace of mind and builds genuine community trust."
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style="background:var(--surface-alt);padding:64px 0;border-top:1px solid var(--line);">
          <div class="container">
            <div style="text-align:center;max-width:700px;margin:0 auto 40px;">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Safety &amp; Vetting Standards</span>
              <h2 style="font-size:clamp(28px,3.6vw,40px);font-weight:800;margin:10px 0;">6-Point Driver &amp; Fleet Guarantee</h2>
            </div>
            <div class="standards-grid">
              ${DRIVER_STANDARDS.map((st) => `
                <div class="std-card">
                  <h3 style="font-size:21px;font-weight:800;margin-bottom:10px;">${st.title}</h3>
                  <p style="font-size:16px;color:var(--muted);line-height:1.65;">${st.description}</p>
                </div>
              `).join('')}
            </div>
            <div style="text-align:center;margin-top:40px;">
              <button class="dt-button" id="book-safety">Book with Our Certified Team →</button>
            </div>
          </div>
        </section>

        <section style="background:var(--surface);padding:64px 0;border-top:1px solid var(--line);">
          <div class="container">
            <div style="text-align:center;max-width:700px;margin:0 auto 40px;">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Our Medical Transit Fleet</span>
              <h2 style="font-size:clamp(28px,3.6vw,40px);font-weight:800;margin:10px 0;">ADA-Compliant Vans &amp; Comfort Sedans</h2>
              <p style="font-size:clamp(16px,1.25vw,18px);color:var(--muted);line-height:1.65;">Every vehicle undergoes daily pre-trip safety inspections, climate calibration, and hospital-grade sanitization.</p>
            </div>
            <div class="standards-grid reveal">
              <div class="std-card" style="padding:0;overflow:hidden;">
                <img src="${IMAGES.wheelchairSeattleSkyline}" alt="ADA Wheelchair Accessible Van with hydraulic lift" style="width:100%;aspect-ratio:16/10;min-height:210px;object-fit:cover;object-position:center 22%;display:block;" />
                <div style="padding:22px;">
                  <h3 style="font-size:21px;font-weight:800;margin-bottom:8px;">ADA Wheelchair Accessible Vans</h3>
                  <p style="font-size:17px;color:var(--ink);line-height:1.6;">High-roof transit vans with commercial hydraulic lifts, gentle-grade ramps, and certified 4-point Q-Straint tie-downs.</p>
                </div>
              </div>
              <div class="std-card" style="padding:0;overflow:hidden;">
                <img src="${IMAGES.clinicPickupSedan}" alt="Low-step comfort sedan for ambulatory medical transit" style="width:100%;aspect-ratio:16/10;min-height:210px;object-fit:cover;object-position:center 22%;display:block;" />
                <div style="padding:22px;">
                  <h3 style="font-size:21px;font-weight:800;margin-bottom:8px;">Ambulatory Sedans &amp; SUVs</h3>
                  <p style="font-size:17px;color:var(--ink);line-height:1.6;">Low-step-in sedans and SUVs ideal for routine clinic visits, specialist consultations, and post-procedure discharges.</p>
                </div>
              </div>
              <div class="std-card" style="padding:0;overflow:hidden;">
                <img src="${IMAGES.cleanVanInterior}" alt="Spacious sanitized passenger van interior" style="width:100%;aspect-ratio:16/10;min-height:210px;object-fit:cover;object-position:center 35%;display:block;" />
                <div style="padding:22px;">
                  <h3 style="font-size:21px;font-weight:800;margin-bottom:8px;">Spacious &amp; Sanitized Cabins</h3>
                  <p style="font-size:17px;color:var(--ink);line-height:1.6;">Leather seating, dual-zone climate control, walker/rollator storage, and room for a family caregiver or health aide.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;

      this.shadowRoot.getElementById('book-safety').addEventListener('click', () => this._navigate('/booking-calendar'));
      initScrollReveals(this.shadowRoot);
    }
  }

  if (!customElements.get('ccr-safety-page')) {
    customElements.define('ccr-safety-page', CcrSafetyPage);
  }
}
