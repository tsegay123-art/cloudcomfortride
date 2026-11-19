/// <reference lib="dom" />
import { COMPANY_INFO, IMAGES } from '../companyData';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrFooter extends HTMLElement {
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
      const year = new Date().getFullYear();
      this.shadowRoot.innerHTML = `
        <style>
          ${CCR_SHARED_CSS}
          footer {
            background: #041329;
            color: #ffffff;
            border-top: 3px solid #f3bf28;
            padding-bottom: 72px;
          }
          @media (min-width: 640px) {
            footer { padding-bottom: 0; }
          }
          .footer-main {
            padding: 48px 0 36px;
            display: grid;
            grid-template-columns: 1fr;
            gap: 32px;
            border-bottom: 1px solid #243650;
          }
          @media (min-width: 768px) {
            .footer-main { grid-template-columns: 5fr 3fr 4fr; }
          }
          .brand-row {
            display: flex;
            align-items: center;
            gap: 12px;
            background: none;
            border: none;
            color: #ffffff;
            padding: 0;
            text-align: left;
            margin-bottom: 14px;
          }
          .brand-row img { height: 44px; width: auto; }
          .brand-name { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 19px; display: block; }
          .brand-sub { font-size: 11px; color: #f3bf28; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
          .desc { font-size: 13px; color: #bac8d9; line-height: 1.65; max-width: 360px; margin-bottom: 14px; }
          .meta { font-size: 12px; color: #9eb0c6; display: flex; flex-direction: column; gap: 6px; }
          .col-title {
            font-family: 'Manrope', sans-serif;
            font-weight: 800;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #f3bf28;
            margin-bottom: 12px;
          }
          .nav-col { display: flex; flex-direction: column; gap: 8px; }
          .nav-col button {
            background: none;
            border: none;
            color: #c8d5e5;
            text-align: left;
            padding: 4px 0;
            font-size: 13px;
          }
          .nav-col button:hover { color: #ffffff; }
          .dispatch-box {
            padding: 18px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }
          .dispatch-eyebrow { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: #f3bf28; display: block; margin-bottom: 6px; }
          .dispatch-phone {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 800;
            color: #ffffff;
            margin-top: 8px;
          }
          .dispatch-phone:hover { color: #f3bf28; }
          .disclaimer {
            padding: 16px 0;
            font-size: 11px;
            color: #788ca4;
            border-bottom: 1px solid rgba(36, 54, 80, 0.6);
            line-height: 1.5;
          }
          .bottom-bar {
            padding: 20px 0;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            font-size: 12px;
            color: #8da0b8;
          }
          .legal-links { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
          .legal-links button { background: none; border: none; color: inherit; font-size: 12px; padding: 2px 0; }
          .legal-links button:hover { color: #ffffff; }
          .mobile-float-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 45;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(10px);
            border-top: 2px solid #f3bf28;
            padding: 10px 12px;
            display: flex;
            gap: 10px;
            box-shadow: 0 -8px 24px rgba(6, 31, 70, 0.15);
          }
          @media (min-width: 640px) { .mobile-float-bar { display: none; } }
          .float-call {
            flex: 1;
            min-height: 44px;
            border-radius: 12px;
            background: #f1f5f9;
            color: #061f46;
            border: 1px solid #cbd5e1;
            font-weight: 700;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .float-book {
            flex: 1;
            min-height: 44px;
            border-radius: 12px;
            background: #f4c832;
            color: #061f46;
            border: 1px solid #f4c832;
            font-family: 'Manrope', sans-serif;
            font-weight: 900;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
        </style>

        <footer>
          <div class="container">
            <div class="footer-main">
              <div>
                <button class="brand-row" data-nav="/">
                  <img src="${IMAGES.emblemTransparent}" alt="Cloud Comfort Ride emblem" />
                  <div>
                    <span class="brand-name">${COMPANY_INFO.brandName}</span>
                    <span class="brand-sub">${COMPANY_INFO.subTagline}</span>
                  </div>
                </button>
                <p class="desc">
                  Providing compassionate, punctual non-emergency medical transportation throughout Seattle and King County. Wheelchair lifts, clinical appointments, and door-through-door care.
                </p>
                <div class="meta">
                  <div>📍 ${COMPANY_INFO.address}</div>
                  <div>🕒 Mon – Sun: 6:00 AM – 8:00 PM (On-call priority dispatch)</div>
                </div>
              </div>

              <div>
                <h4 class="col-title">Quick Navigation</h4>
                <div class="nav-col">
                  <button data-nav="/">Home</button>
                  <button data-nav="/services">Specialized Services</button>
                  <button data-nav="/safety-drivers">Drivers &amp; Safety Standards</button>
                  <button data-nav="/about">About Our Company</button>
                  <button data-nav="/my-bookings">My Bookings &amp; Trip Vouchers</button>
                  <button data-nav="/contact">Contact &amp; Dispatch Support</button>
                </div>
              </div>

              <div style="display:flex;flex-direction:column;justify-content:space-between;gap:16px;">
                <div class="dispatch-box">
                  <span class="dispatch-eyebrow">24/7 Seattle Dispatch</span>
                  <p style="font-size:12px;color:#bac8d9;">Need immediate ride coordination or appointment adjustments?</p>
                  <a class="dispatch-phone" href="tel:${COMPANY_INFO.phoneRaw}">
                    <span style="color:#f3bf28">☎</span>
                    <span>${COMPANY_INFO.phoneDisplay}</span>
                  </a>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#8699b0;">
                  <span>King County Licensed NEMT</span>
                  <button id="scroll-top" style="background:none;border:none;color:#f3bf28;font-weight:700;">Back to top ↑</button>
                </div>
              </div>
            </div>

            <div class="disclaimer">
              <strong>Important Clinical Notice:</strong> Cloud Comfort Ride operates strictly as a Non-Emergency Medical Transportation (NEMT) provider. If you are experiencing a life-threatening medical emergency, please dial 911 immediately.
            </div>

            <div class="bottom-bar">
              <div class="legal-links">
                <button data-nav="/privacy">Privacy Policy</button>
                <span>|</span>
                <button data-nav="/terms">Terms of Service</button>
                <span>|</span>
                <button data-nav="/accessibility">Accessibility Statement</button>
                <span>|</span>
                <button data-nav="/contact">Contact Us</button>
              </div>
              <div>© ${year} Cloud Comfort Ride. All rights reserved.</div>
            </div>
          </div>
        </footer>

        <div class="mobile-float-bar">
          <a class="float-call" href="tel:${COMPANY_INFO.phoneRaw}">☎ Call Dispatch</a>
          <button class="float-book" data-nav="/book-a-ride">📅 Book a Ride</button>
        </div>
      `;

      this.shadowRoot.querySelectorAll('[data-nav]').forEach((btn) => {
        btn.addEventListener('click', () => this._navigate(btn.getAttribute('data-nav')));
      });
      const topBtn = this.shadowRoot.getElementById('scroll-top');
      if (topBtn) {
        topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      }
    }
  }

  if (!customElements.get('ccr-footer')) {
    customElements.define('ccr-footer', CcrFooter);
  }
}
