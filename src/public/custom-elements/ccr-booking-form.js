import { BOOKING_SERVICE_OPTIONS, COMPANY_INFO, getServiceTitle } from '../companyData';
import {
  buildVoucherMarkup,
  getTomorrowDateStr,
  saveLocalBooking,
  validateBookingPayload
} from '../bookingHelpers';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrBookingForm extends HTMLElement {
    static get observedAttributes() {
      return ['initial-service', 'booking-result', 'booking-error'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._state = {
        serviceType: '',
        tripType: 'round_trip',
        pickupDate: getTomorrowDateStr(),
        pickupTime: '09:00',
        returnTime: '11:30',
        pickupAddress: '',
        pickupNotes: '',
        facilityName: '',
        destinationAddress: '',
        destinationNotes: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        mobilityNeed: 'ambulatory',
        hasCompanion: false,
        companionCount: 1,
        hasStairs: false,
        specialInstructions: ''
      };
      this._errors = {};
      this._isSubmitting = false;
      this._submitTimer = null;
      this._completedBooking = null;
      this._showVoucher = false;
      this._onThemeSync = () => syncThemeHost(this);
    }

    connectedCallback() {
      ensureGoogleFonts();
      syncThemeHost(this);
      const initial = this.getAttribute('initial-service');
      if (initial) this._state.serviceType = initial;
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
      if (name === 'initial-service' && newVal) {
        this._state.serviceType = newVal;
        this.render();
      } else if (name === 'booking-result' && newVal) {
        try {
          const booking = JSON.parse(newVal);
          this.setBookingResult(booking);
        } catch (err) {
          this.setBookingError('Received an invalid confirmation response. Please call (206) 327-4411.');
        }
      } else if (name === 'booking-error' && newVal) {
        this.setBookingError(newVal);
      }
    }

    setBookingResult(booking) {
      if (this._submitTimer) {
        clearTimeout(this._submitTimer);
        this._submitTimer = null;
      }
      this._isSubmitting = false;
      if (booking) {
        saveLocalBooking(booking);
        this._completedBooking = booking;
        window.dispatchEvent(new CustomEvent('ccr-bookings-updated'));
      }
      this.render();
    }

    setBookingError(message) {
      if (this._submitTimer) {
        clearTimeout(this._submitTimer);
        this._submitTimer = null;
      }
      this._isSubmitting = false;
      this._errors = { ...this._errors, form: message || 'Unable to submit booking. Please call (206) 327-4411.' };
      this.render();
    }

    _collectValues() {
      const sr = this.shadowRoot;
      const val = (id) => {
        const el = /** @type {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null} */ (sr.getElementById(id));
        return el ? el.value : '';
      };
      const checked = (id) => {
        const el = /** @type {HTMLInputElement | null} */ (sr.getElementById(id));
        return el ? Boolean(el.checked) : false;
      };

      this._state = {
        ...this._state,
        serviceType: val('serviceType'),
        pickupDate: val('pickupDate'),
        pickupTime: val('pickupTime'),
        returnTime: val('returnTime'),
        pickupAddress: val('pickupAddress'),
        pickupNotes: val('pickupNotes'),
        facilityName: val('facilityName'),
        destinationAddress: val('destinationAddress'),
        destinationNotes: val('destinationNotes'),
        firstName: val('firstName'),
        lastName: val('lastName'),
        phone: val('phone'),
        email: val('email'),
        mobilityNeed: val('mobilityNeed') || 'ambulatory',
        hasCompanion: checked('hasCompanion'),
        companionCount: Number(val('companionCount') || 1),
        hasStairs: checked('hasStairs'),
        specialInstructions: val('specialInstructions'),
        website: val('b-website')
      };
    }

    _handleSubmit(e) {
      e.preventDefault();
      if (this._isSubmitting) return;
      this._collectValues();
      if (this._state.website) return;
      const { isValid, errors } = validateBookingPayload(this._state);
      this._errors = errors;
      if (!isValid) {
        this.render();
        const firstErr = this.shadowRoot.querySelector('.err-msg');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      this._isSubmitting = true;
      this._errors = {};
      this.render();

      const event = new CustomEvent('submitBooking', {
        detail: {
          payload: { ...this._state }
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);

      if (this._submitTimer) clearTimeout(this._submitTimer);
      this._submitTimer = setTimeout(() => {
        if (this._isSubmitting && !this._completedBooking) {
          this.setBookingError('Dispatch server did not respond in time. Please call (206) 327-4411 or try again.');
        }
      }, 15000);
    }

    render() {
      if (this._completedBooking) {
        const b = this._completedBooking;
        this.shadowRoot.innerHTML = `
          <style>
            ${CCR_SHARED_CSS}
            .success-card {
              background: var(--card-bg);
              border: 2px solid #f3bf28;
              border-radius: 20px;
              padding: 32px 24px;
              text-align: center;
            }
            .success-icon {
              width: 60px;
              height: 60px;
              border-radius: 9999px;
              background: #dcfce7;
              color: #15803d;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              margin-bottom: 14px;
            }
            .ref-box {
              display: inline-block;
              margin: 14px 0;
              padding: 10px 20px;
              border-radius: 12px;
              background: #061f46;
              color: #f3bf28;
              font-family: 'Manrope', sans-serif;
              font-weight: 800;
              font-size: 18px;
            }
            .summary-grid {
              text-align: left;
              background: var(--surface-alt);
              border: 1px solid var(--card-border);
              border-radius: 14px;
              padding: 18px;
              margin: 18px 0;
              display: grid;
              grid-template-columns: 1fr;
              gap: 10px;
              font-size: 13px;
            }
            @media (min-width: 640px) {
              .summary-grid { grid-template-columns: 1fr 1fr; }
            }
            .summary-grid span { color: var(--muted); display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; }
            .voucher-card {
              text-align: left;
              border: 2px solid #061f46;
              border-radius: 14px;
              padding: 20px;
              background: #ffffff;
              color: #122747;
              margin-top: 18px;
            }
            .voucher-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f3bf28; padding-bottom: 10px; margin-bottom: 14px; }
            .voucher-eyebrow { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #986800; }
            .voucher-status { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; }
            .voucher-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; }
            .voucher-grid span { display: block; color: #65758b; font-size: 10px; text-transform: uppercase; font-weight: 700; }
            .voucher-notes { margin-top: 12px; font-size: 12px; background: #f7f9fc; padding: 10px; border-radius: 8px; }
            .voucher-foot { margin-top: 14px; padding-top: 10px; border-top: 1px solid #dce4ee; font-size: 11px; color: #65758b; text-align: center; }
          </style>
          <div class="success-card">
            <div class="success-icon">✓</div>
            <h3 style="font-size:24px;font-weight:800;color:var(--ink);">Ride Request Received</h3>
            <p style="font-size:14px;color:var(--muted);margin-top:6px;">Our Seattle dispatch team is reviewing your route and vehicle assignment.</p>
            <div class="ref-box">${b.id}</div>
            <div class="summary-grid">
              <div><span>Passenger</span><strong>${b.passengerName}</strong></div>
              <div><span>Service</span><strong>${getServiceTitle(b.serviceType)}</strong></div>
              <div><span>Pickup</span><strong>${b.pickupDate} at ${b.pickupTime}</strong></div>
              <div><span>From</span><strong>${b.pickupAddress}</strong></div>
              <div><span>Destination</span><strong>${b.destinationAddress}</strong></div>
              <div><span>Dispatch Phone</span><strong>${COMPANY_INFO.phoneDisplay}</strong></div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
              <button class="dt-button" id="toggle-voucher">${this._showVoucher ? 'Hide Trip Voucher' : 'View Printable Voucher'}</button>
              <button class="dt-button-outline" id="view-my-bookings">My Bookings</button>
              <button class="dt-button-outline" id="new-booking">Book Another Ride</button>
            </div>
            ${this._showVoucher ? `
              ${buildVoucherMarkup(b)}
              <div style="margin-top:12px;">
                <button class="dt-button" id="print-voucher">🖨 Print Voucher</button>
              </div>
            ` : ''}
          </div>
        `;

        this.shadowRoot.getElementById('toggle-voucher').addEventListener('click', () => {
          this._showVoucher = !this._showVoucher;
          this.render();
        });
        this.shadowRoot.getElementById('view-my-bookings').addEventListener('click', () => {
          this.dispatchEvent(new CustomEvent('navigate', { detail: { path: '/my-bookings' }, bubbles: true, composed: true }));
        });
        this.shadowRoot.getElementById('new-booking').addEventListener('click', () => {
          this._completedBooking = null;
          this._showVoucher = false;
          this.render();
        });
        const printBtn = this.shadowRoot.getElementById('print-voucher');
        if (printBtn) printBtn.addEventListener('click', () => window.print());
        return;
      }

      const s = this._state;
      const e = this._errors;
      const fieldErr = (key) => (e[key] ? `<div class="err-msg">${e[key]}</div>` : '');

      this.shadowRoot.innerHTML = `
        <style>
          ${CCR_SHARED_CSS}
          .form-wrap {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-top: 4px solid #f3bf28;
            border-radius: 20px;
            padding: 24px;
          }
          @media (min-width: 640px) { .form-wrap { padding: 32px; } }
          .section-head {
            font-family: 'Manrope', sans-serif;
            font-weight: 800;
            font-size: 19px;
            color: #061f46;
            margin: 24px 0 14px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--line);
            display: flex;
            align-items: center;
            gap: 8px;
          }
          :host([data-theme="dark"]) .section-head { color: #f3bf28; }
          .grid-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
          @media (min-width: 640px) { .grid-2 { grid-template-columns: 1fr 1fr; } }
          .grid-3 { display: grid; grid-template-columns: 1fr; gap: 16px; }
          @media (min-width: 640px) { .grid-3 { grid-template-columns: 1fr 1fr 1fr; } }
          label {
            display: block;
            font-size: 15px;
            font-weight: 700;
            color: var(--ink);
            margin-bottom: 6px;
          }
          input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="time"], input[type="number"], select, textarea {
            width: 100%;
            padding: 12px 14px;
            border-radius: 10px;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            font-size: 16px;
            font-family: inherit;
            min-height: 48px;
          }
          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #123e77;
            box-shadow: 0 0 0 3px rgba(18, 62, 119, 0.14);
          }
          .trip-toggle {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .trip-btn {
            padding: 12px;
            min-height: 48px;
            border-radius: 10px;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            font-weight: 700;
            font-size: 15px;
          }
          .trip-btn.active {
            background: #061f46;
            color: #ffffff;
            border-color: #f3bf28;
          }
          .check-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 14px;
            min-height: 48px;
            border-radius: 10px;
            border: 1px solid var(--card-border);
            background: var(--surface-alt);
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
          }
          .check-row input { width: 20px; height: 20px; min-height: auto; flex-shrink: 0; }
          .err-msg { color: #dc2626; font-size: 14px; font-weight: 600; margin-top: 5px; }
          .hp-field { position: absolute; left: -9999px; opacity: 0; height: 0; width: 0; overflow: hidden; }
          .submit-bar {
            margin-top: 24px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
        </style>

        <form class="form-wrap" id="booking-form" novalidate>
          ${e.form ? `<div class="err-msg" role="alert" style="padding:12px;background:#fef2f2;border-radius:10px;margin-bottom:14px;">${e.form}</div>` : ''}
          <div class="hp-field" aria-hidden="true">
            <label for="b-website">Website</label>
            <input type="text" id="b-website" tabindex="-1" autocomplete="off" />
          </div>

          <div class="section-head" style="margin-top:0;">1. Service &amp; Schedule</div>
          <div class="grid-2">
            <div>
              <label for="serviceType">Select Medical Service *</label>
              <select id="serviceType">
                ${BOOKING_SERVICE_OPTIONS.map((opt) => `
                  <option value="${opt.value}" ${opt.disabled ? 'disabled' : ''} ${s.serviceType === opt.value ? 'selected' : ''}>
                    ${opt.label}
                  </option>
                `).join('')}
              </select>
              ${fieldErr('serviceType')}
            </div>
            <div>
              <label>Trip Type *</label>
              <div class="trip-toggle">
                <button type="button" class="trip-btn ${s.tripType === 'round_trip' ? 'active' : ''}" data-trip="round_trip">Round Trip</button>
                <button type="button" class="trip-btn ${s.tripType === 'one_way' ? 'active' : ''}" data-trip="one_way">One-Way</button>
              </div>
            </div>
          </div>

          <div class="grid-3" style="margin-top:14px;">
            <div>
              <label for="pickupDate">Pickup Date *</label>
              <input type="date" id="pickupDate" value="${s.pickupDate}" />
              ${fieldErr('pickupDate')}
            </div>
            <div>
              <label for="pickupTime">Pickup Time *</label>
              <input type="time" id="pickupTime" value="${s.pickupTime}" />
              ${fieldErr('pickupTime')}
            </div>
            ${s.tripType === 'round_trip' ? `
              <div>
                <label for="returnTime">Estimated Return Time *</label>
                <input type="time" id="returnTime" value="${s.returnTime}" />
                ${fieldErr('returnTime')}
              </div>
            ` : ''}
          </div>

          <div class="section-head">2. Pickup &amp; Destination</div>
          <div class="grid-2">
            <div>
              <label for="pickupAddress">Pickup Street Address *</label>
              <input type="text" id="pickupAddress" placeholder="e.g., 1902 E Yesler Way, Seattle, WA" value="${s.pickupAddress}" />
              ${fieldErr('pickupAddress')}
            </div>
            <div>
              <label for="pickupNotes">Pickup Gate / Door Notes</label>
              <input type="text" id="pickupNotes" placeholder="Apt #, buzzer code, front/side entrance" value="${s.pickupNotes}" />
            </div>
          </div>

          <div class="grid-3" style="margin-top:14px;">
            <div>
              <label for="facilityName">Medical Facility / Clinic Name</label>
              <input type="text" id="facilityName" placeholder="e.g., Swedish First Hill, UW Medical" value="${s.facilityName}" />
            </div>
            <div>
              <label for="destinationAddress">Destination Address *</label>
              <input type="text" id="destinationAddress" placeholder="Clinic street address" value="${s.destinationAddress}" />
              ${fieldErr('destinationAddress')}
            </div>
            <div>
              <label for="destinationNotes">Department / Suite</label>
              <input type="text" id="destinationNotes" placeholder="e.g., Dialysis Unit, 3rd Floor" value="${s.destinationNotes}" />
            </div>
          </div>

          <div class="section-head">3. Passenger &amp; Mobility Details</div>
          <div class="grid-2">
            <div>
              <label for="firstName">First Name *</label>
              <input type="text" id="firstName" placeholder="Passenger first name" value="${s.firstName}" />
              ${fieldErr('firstName')}
            </div>
            <div>
              <label for="lastName">Last Name *</label>
              <input type="text" id="lastName" placeholder="Passenger last name" value="${s.lastName}" />
              ${fieldErr('lastName')}
            </div>
          </div>

          <div class="grid-2" style="margin-top:14px;">
            <div>
              <label for="phone">Contact Telephone *</label>
              <input type="tel" id="phone" placeholder="(206) 555-0199" value="${s.phone}" />
              ${fieldErr('phone')}
            </div>
            <div>
              <label for="email">Email Address *</label>
              <input type="email" id="email" placeholder="patient@example.com" value="${s.email}" />
              ${fieldErr('email')}
            </div>
          </div>

          <div class="grid-2" style="margin-top:14px;">
            <div>
              <label for="mobilityNeed">Mobility &amp; Equipment Requirement</label>
              <select id="mobilityNeed">
                <option value="ambulatory" ${s.mobilityNeed === 'ambulatory' ? 'selected' : ''}>Ambulatory (Standard Seat)</option>
                <option value="wheelchair_standard" ${s.mobilityNeed === 'wheelchair_standard' ? 'selected' : ''}>Manual Wheelchair (ADA Lift / Ramp)</option>
                <option value="wheelchair_motorized" ${s.mobilityNeed === 'wheelchair_motorized' ? 'selected' : ''}>Motorized / Power Wheelchair</option>
                <option value="walker" ${s.mobilityNeed === 'walker' ? 'selected' : ''}>Walker / Rollator Assistance</option>
                <option value="bedside_transfer" ${s.mobilityNeed === 'bedside_transfer' ? 'selected' : ''}>Bedside / Hospital Discharge Escort</option>
              </select>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;justify-content:flex-end;">
              <label class="check-row">
                <input type="checkbox" id="hasCompanion" ${s.hasCompanion ? 'checked' : ''} />
                <span>Family Companion / Caregiver Riding Along (No Extra Charge)</span>
              </label>
              <label class="check-row">
                <input type="checkbox" id="hasStairs" ${s.hasStairs ? 'checked' : ''} />
                <span>Stairs or Steps at Pickup / Drop-off</span>
              </label>
            </div>
          </div>

          ${s.hasCompanion ? `
            <div style="margin-top:12px;max-width:220px;">
              <label for="companionCount">Number of Companions</label>
              <input type="number" id="companionCount" min="1" max="3" value="${s.companionCount}" />
            </div>
          ` : ''}

          <div style="margin-top:14px;">
            <label for="specialInstructions">Special Care Instructions</label>
            <textarea id="specialInstructions" rows="3" placeholder="Oxygen tank, dementia care notes, recurring dialysis schedule, or nurse contact...">${s.specialInstructions}</textarea>
          </div>

          <div class="submit-bar">
            <button type="submit" class="dt-button" style="width:100%;font-size:17px;padding:15px 24px;min-height:52px;" ${this._isSubmitting ? 'disabled' : ''}>
              ${this._isSubmitting ? 'Submitting to Seattle Dispatch...' : '📅 Request Medical Ride Confirmation →'}
            </button>
            <p style="text-align:center;font-size:15px;color:var(--muted);">
              Need immediate same-day dispatch? Call <strong><a href="tel:${COMPANY_INFO.phoneRaw}">${COMPANY_INFO.phoneDisplay}</a></strong>
            </p>
          </div>
        </form>
      `;

      this.shadowRoot.querySelectorAll('[data-trip]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this._collectValues();
          this._state.tripType = btn.getAttribute('data-trip');
          this.render();
        });
      });
      const companionBox = this.shadowRoot.getElementById('hasCompanion');
      if (companionBox) {
        companionBox.addEventListener('change', () => {
          this._collectValues();
          this.render();
        });
      }
      this.shadowRoot.getElementById('booking-form').addEventListener('submit', (ev) => this._handleSubmit(ev));
    }
  }

  if (!customElements.get('ccr-booking-form')) {
    customElements.define('ccr-booking-form', CcrBookingForm);
  }
}
