import { COMPANY_INFO } from '../companyData';
import { INQUIRY_STORAGE_KEY, validateContactPayload } from '../bookingHelpers';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrContactPage extends HTMLElement {
    static get observedAttributes() {
      return ['contact-result', 'contact-error'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._state = {
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry / Medical Transport',
        message: ''
      };
      this._isSubmitting = false;
      this._submitTimer = null;
      this._submitted = false;
      this._error = '';
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
      if (this._submitTimer) {
        clearTimeout(this._submitTimer);
        this._submitTimer = null;
      }
    }

    attributeChangedCallback(name, _oldVal, newVal) {
      if (name === 'contact-result' && newVal) {
        this.setInquiryResult(true);
      } else if (name === 'contact-error' && newVal) {
        this.setInquiryResult(false, newVal);
      }
    }

    setInquiryResult(ok, msg = '') {
      if (this._submitTimer) {
        clearTimeout(this._submitTimer);
        this._submitTimer = null;
      }
      this._isSubmitting = false;
      if (ok) {
        this._submitted = true;
        this._error = '';
      } else {
        this._error = msg || `Failed to send message. Please call ${COMPANY_INFO.phoneDisplay}.`;
      }
      this.render();
    }

    _handleSubmit(e) {
      e.preventDefault();
      if (this._isSubmitting) return;
      const sr = this.shadowRoot;
      const val = (id) => {
        const el = /** @type {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null} */ (sr.getElementById(id));
        return el ? el.value : '';
      };
      if (val('c-website')) return;
      this._state = {
        name: val('c-name'),
        email: val('c-email'),
        phone: val('c-phone'),
        subject: val('c-subject'),
        message: val('c-message')
      };

      const { isValid, errors } = validateContactPayload(this._state);
      if (!isValid) {
        this._error = Object.values(errors)[0];
        this.render();
        return;
      }

      this._isSubmitting = true;
      this._error = '';
      this.render();

      try {
        const existing = JSON.parse(window.localStorage.getItem(INQUIRY_STORAGE_KEY) || '[]');
        window.localStorage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify([{ ...this._state, timestamp: new Date().toISOString() }, ...existing]));
      } catch (err) {
        // Ignore
      }

      this.dispatchEvent(new CustomEvent('submitContact', {
        detail: {
          payload: { ...this._state }
        },
        bubbles: true,
        composed: true
      }));

      if (this._submitTimer) clearTimeout(this._submitTimer);
      this._submitTimer = setTimeout(() => {
        if (this._isSubmitting && !this._submitted) {
          this.setInquiryResult(false, `Dispatch server did not respond in time. Please call ${COMPANY_INFO.phoneDisplay}.`);
        }
      }, 15000);
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          ${CCR_SHARED_CSS}
          .contact-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: 36px;
            padding: 52px 0;
          }
          @media (min-width: 1024px) { .contact-layout { grid-template-columns: 5fr 7fr; } }
          .info-card {
            padding: 18px;
            border-radius: 16px;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            display: flex;
            gap: 14px;
            align-items: flex-start;
          }
          .info-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: #eaf2ff;
            color: #123e77;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
          }
          .form-card {
            padding: 32px;
            border-radius: 20px;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-top: 4px solid #f3bf28;
          }
          label { display: block; font-size: 15px; font-weight: 700; margin-bottom: 6px; color: var(--ink); }
          input, select, textarea {
            width: 100%;
            padding: 12px 14px;
            border-radius: 10px;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            font-size: 16px;
            font-family: inherit;
            min-height: 48px;
            margin-bottom: 16px;
          }
          .hp-field { position: absolute; left: -9999px; opacity: 0; height: 0; width: 0; overflow: hidden; }
        </style>

        <section class="banner-hero">
          <div class="container">
            <span class="badge-pill">Direct Communication &amp; Dispatch</span>
            <h1>We Want to Hear from You!</h1>
            <p>Contact Cloud Comfort Ride and let us be your trusted medical transit partner. Call us or send an inquiry for standing schedules or urgent transfers.</p>
          </div>
        </section>

        <section style="background:var(--surface);">
          <div class="container contact-layout">
            <div style="display:flex;flex-direction:column;gap:18px;">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Get In Touch</span>
              <h2 style="font-size:clamp(28px,3.2vw,36px);font-weight:800;">Seattle Headquarters &amp; Dispatch</h2>
              <p style="font-size:17px;color:var(--muted);line-height:1.65;">
                Whether you need assistance coordinating recurring dialysis trips, physical therapy rides, or hospital discharge, our friendly team is ready to assist.
              </p>

              <div class="info-card">
                <div class="info-icon">☎</div>
                <div>
                  <span style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--muted);">Dispatch Telephone</span>
                  <a href="tel:${COMPANY_INFO.phoneRaw}" style="display:block;font-size:19px;font-weight:800;margin-top:4px;">${COMPANY_INFO.phoneDisplay}</a>
                </div>
              </div>
              <div class="info-card">
                <div class="info-icon">✉</div>
                <div>
                  <span style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--muted);">Email Dispatch</span>
                  <a href="mailto:${COMPANY_INFO.email}" style="display:block;font-size:18px;font-weight:800;margin-top:4px;word-break:break-word;">${COMPANY_INFO.email}</a>
                </div>
              </div>
              <div class="info-card">
                <div class="info-icon">📍</div>
                <div>
                  <span style="font-size:13px;font-weight:700;text-transform:uppercase;color:var(--muted);">Seattle Office</span>
                  <a href="${COMPANY_INFO.mapsUrl}" target="_blank" rel="noopener noreferrer" style="display:block;font-size:17px;font-weight:800;margin-top:4px;text-decoration:underline;">${COMPANY_INFO.address}</a>
                  <span style="font-size:15px;color:var(--muted);display:block;margin-top:6px;line-height:1.5;">${COMPANY_INFO.operatingHours}</span>
                </div>
              </div>
            </div>

            <div class="form-card">
              ${this._submitted ? `
                <div style="text-align:center;padding:32px 12px;">
                  <div style="font-size:40px;color:#16a34a;margin-bottom:12px;">✓</div>
                  <h3 style="font-size:24px;font-weight:800;margin-bottom:10px;">Message Sent to Dispatch</h3>
                  <p style="font-size:17px;color:var(--muted);margin-bottom:20px;line-height:1.6;">Thank you for contacting Cloud Comfort Ride. Our Seattle coordinator will reply shortly.</p>
                  <button class="dt-button" id="send-another">Send Another Message</button>
                </div>
              ` : `
                <h3 style="font-size:24px;font-weight:800;margin-bottom:18px;">Send a Message to Our Team</h3>
                ${this._error ? `<div role="alert" style="padding:12px;border-radius:10px;background:#fef2f2;color:#dc2626;font-size:15px;font-weight:600;margin-bottom:16px;">${this._error}</div>` : ''}
                <form id="contact-form" novalidate>
                  <div class="hp-field" aria-hidden="true">
                    <label for="c-website">Website</label>
                    <input id="c-website" type="text" tabindex="-1" autocomplete="off" />
                  </div>
                  <label for="c-name">Full Name *</label>
                  <input id="c-name" type="text" placeholder="Your name or clinic coordinator" value="${this._state.name}" />
                  <label for="c-email">Email Address *</label>
                  <input id="c-email" type="email" placeholder="you@example.com" value="${this._state.email}" />
                  <label for="c-phone">Phone Number</label>
                  <input id="c-phone" type="tel" placeholder="(206) 555-0199" value="${this._state.phone}" />
                  <label for="c-subject">Inquiry Topic</label>
                  <select id="c-subject">
                    <option ${this._state.subject.includes('General') ? 'selected' : ''}>General Inquiry / Medical Transport</option>
                    <option ${this._state.subject.includes('Dialysis') ? 'selected' : ''}>Recurring Dialysis Schedule</option>
                    <option ${this._state.subject.includes('Facility') ? 'selected' : ''}>Healthcare Facility Partnership</option>
                    <option ${this._state.subject.includes('Billing') ? 'selected' : ''}>Private-Pay Billing &amp; Rates</option>
                  </select>
                  <label for="c-message">Message *</label>
                  <textarea id="c-message" rows="4" placeholder="Tell us how we can assist with your transportation needs...">${this._state.message}</textarea>
                  <button type="submit" class="dt-button" style="width:100%;" ${this._isSubmitting ? 'disabled' : ''}>
                    ${this._isSubmitting ? 'Sending...' : 'Send Message to Dispatch →'}
                  </button>
                </form>
              `}
            </div>
          </div>
        </section>
      `;

      const form = this.shadowRoot.getElementById('contact-form');
      if (form) form.addEventListener('submit', (e) => this._handleSubmit(e));
      const again = this.shadowRoot.getElementById('send-another');
      if (again) {
        again.addEventListener('click', () => {
          this._submitted = false;
          this._state = { name: '', email: '', phone: '', subject: 'General Inquiry / Medical Transport', message: '' };
          this.render();
        });
      }
    }
  }

  if (!customElements.get('ccr-contact-page')) {
    customElements.define('ccr-contact-page', CcrContactPage);
  }
}
