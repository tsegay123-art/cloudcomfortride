import { BOOKING_SERVICE_OPTIONS, COMPANY_INFO, SEATTLE_MEDICAL_CENTERS, SEATTLE_PICKUP_AREAS, getServiceTitle } from '../companyData';
import {
  buildVoucherMarkup,
  getTomorrowDateStr,
  saveLocalBooking,
  validateBookingPayload
} from '../bookingHelpers';
import { CCR_SHARED_CSS, dispatchCcrNavigation, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

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
        vehiclePreference: 'best_match',
        tripType: 'round_trip',
        pickupDate: getTomorrowDateStr(),
        pickupTime: '09:00',
        returnTime: '11:30',
        pickupAddress: '',
        pickupCity: 'Seattle',
        pickupState: 'WA',
        pickupZip: '',
        pickupLat: null,
        pickupLng: null,
        pickupPlaceId: '',
        pickupConfirmed: false,
        pickupNotes: '',
        facilityName: '',
        destinationAddress: '',
        destinationCity: 'Seattle',
        destinationZip: '',
        destinationLat: null,
        destinationLng: null,
        destinationPlaceId: '',
        destinationConfirmed: false,
        destinationNotes: '',
        firstName: '',
        lastName: '',
        countryCode: '+1',
        phone: '',
        email: '',
        passengerCount: 1,
        additionalStops: '',
        flightInfo: '',
        mobilityNeed: 'ambulatory',
        hasCompanion: false,
        companionCount: 1,
        hasStairs: false,
        needsBoardingAssistance: false,
        specialInstructions: ''
      };
      this._errors = {};
      this._isSubmitting = false;
      this._submitTimer = null;
      this._lookupTimer = null;
      this._completedBooking = null;
      this._showVoucher = false;
      this._onThemeSync = () => syncThemeHost(this);
    }

    connectedCallback() {
      ensureGoogleFonts();
      syncThemeHost(this);
      let initial = this.getAttribute('initial-service');
      if (!initial && typeof window !== 'undefined' && window.sessionStorage) {
        try {
          initial = window.sessionStorage.getItem('ccr_selected_service') || '';
          if (initial) window.sessionStorage.removeItem('ccr_selected_service');
        } catch (e) {
          // Ignore
        }
      }
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
        vehiclePreference: val('vehiclePreference') || 'best_match',
        pickupDate: val('pickupDate'),
        pickupTime: val('pickupTime'),
        returnTime: val('returnTime'),
        pickupAddress: val('pickupAddress'),
        pickupCity: val('pickupCity') || 'Seattle',
        pickupState: val('pickupState') || 'WA',
        pickupZip: val('pickupZip'),
        pickupNotes: val('pickupNotes'),
        facilityName: val('facilityName'),
        destinationAddress: val('destinationAddress'),
        destinationCity: val('destinationCity') || 'Seattle',
        destinationZip: val('destinationZip'),
        destinationNotes: val('destinationNotes'),
        firstName: val('firstName'),
        lastName: val('lastName'),
        countryCode: val('countryCode') || '+1',
        phone: val('phone'),
        email: val('email'),
        passengerCount: Number(val('passengerCount') || 1),
        additionalStops: val('additionalStops'),
        flightInfo: val('flightInfo'),
        mobilityNeed: val('mobilityNeed') || 'ambulatory',
        hasCompanion: checked('hasCompanion'),
        companionCount: Number(val('companionCount') || 1),
        hasStairs: checked('hasStairs'),
        needsBoardingAssistance: checked('needsBoardingAssistance'),
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

      const clientRequestId = `REQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const event = new CustomEvent('submitBooking', {
        detail: {
          payload: { ...this._state, clientRequestId }
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
              gap: 14px;
              font-size: 16px;
            }
            @media (min-width: 640px) {
              .summary-grid { grid-template-columns: 1fr 1fr; }
            }
            .summary-grid span { color: var(--muted); display: block; font-size: 13px; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
            .voucher-card {
              text-align: left;
              border: 2px solid #061f46;
              border-radius: 14px;
              padding: 22px;
              background: #ffffff;
              color: #000000;
              margin-top: 18px;
            }
            .voucher-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f3bf28; padding-bottom: 12px; margin-bottom: 16px; }
            .voucher-eyebrow { font-size: 13px; text-transform: uppercase; font-weight: 800; color: #986800; }
            .voucher-status { background: #fef3c7; color: #92400e; padding: 5px 12px; border-radius: 9999px; font-size: 13px; font-weight: 800; }
            .voucher-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 15px; }
            .voucher-grid span { display: block; color: #334155; font-size: 12px; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
            .voucher-notes { margin-top: 14px; font-size: 15px; background: #f7f9fc; padding: 12px; border-radius: 8px; }
            .voucher-foot { margin-top: 14px; padding-top: 12px; border-top: 1px solid #dce4ee; font-size: 14px; color: #334155; text-align: center; }
          </style>
          <div class="success-card">
            <div class="success-icon">✓</div>
            <h3 style="font-size:26px;font-weight:800;color:var(--ink);">Your transportation request has been received successfully.</h3>
            <p style="font-size:16px;color:var(--ink);margin-top:8px;line-height:1.6;">
              Status: <strong>PENDING OWNER CONFIRMATION</strong>. Our team will review your request and contact you once your driver is assigned.
            </p>
            <div class="ref-box">${b.bookingReference || b.id}</div>
            <div class="summary-grid">
              <div><span>Passenger</span><strong>${b.passengerName || `${b.firstName || ''} ${b.lastName || ''}`.trim()}</strong></div>
              <div><span>Requested Service</span><strong>${getServiceTitle(b.serviceType)}</strong></div>
              <div><span>Pickup Date &amp; Time</span><strong>${b.pickupDate} at ${b.pickupTime}</strong></div>
              <div><span>Pickup Address</span><strong>${b.pickupAddress}</strong></div>
              <div><span>Destination</span><strong>${b.destinationAddress}</strong></div>
              <div><span>Next Steps</span><strong>Awaiting owner confirmation</strong></div>
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
          dispatchCcrNavigation(this, '/my-booking');
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
            border-top: 5px solid #f3bf28;
            border-radius: 22px;
            padding: 26px;
            box-shadow: 0 18px 44px rgba(6, 31, 70, 0.09), 0 4px 12px rgba(6, 31, 70, 0.04);
          }
          @media (min-width: 640px) { .form-wrap { padding: 38px; } }
          .section-head {
            font-family: 'Manrope', sans-serif;
            font-weight: 800;
            font-size: clamp(22px, 2.2vw, 26px);
            color: #061f46;
            margin: 30px 0 18px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--line);
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .step-num {
            width: 34px;
            height: 34px;
            border-radius: 9999px;
            background: #061f46;
            color: #f3bf28;
            font-size: 16px;
            font-weight: 900;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 3px 8px rgba(6, 31, 70, 0.2);
          }
          :host([data-theme="dark"]) .section-head { color: #f3bf28; }
          :host([data-theme="dark"]) .step-num { background: #f3bf28; color: #061f46; }
          .grid-2 { display: grid; grid-template-columns: 1fr; gap: 18px; }
          @media (min-width: 640px) { .grid-2 { grid-template-columns: 1fr 1fr; } }
          .grid-3 { display: grid; grid-template-columns: 1fr; gap: 18px; }
          @media (min-width: 640px) { .grid-3 { grid-template-columns: 1fr 1fr; } }
          @media (min-width: 900px) { .grid-3 { grid-template-columns: 1fr 1fr 1fr; } }
          label {
            display: block;
            font-size: clamp(16px, 1.15vw, 18px);
            font-weight: 700;
            color: var(--ink);
            margin-bottom: 8px;
          }
          input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="time"], input[type="number"], select, textarea {
            width: 100%;
            padding: 14px 16px;
            border-radius: 12px;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            font-size: 18px;
            font-family: inherit;
            min-height: 58px;
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          }
          input::placeholder, textarea::placeholder {
            color: #334155;
            opacity: 1;
          }
          :host([data-theme="dark"]) input::placeholder,
          :host([data-theme="dark"]) textarea::placeholder {
            color: #cbd5e1;
          }
          textarea { min-height: 110px; }
          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #123e77;
            background: var(--surface);
            box-shadow: 0 0 0 4px rgba(18, 62, 119, 0.16);
          }
          .trip-toggle {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .trip-btn {
            padding: 14px 16px;
            min-height: 56px;
            border-radius: 12px;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            font-weight: 700;
            font-size: 16px;
            transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .trip-btn:hover { border-color: #123e77; }
          .trip-btn.active {
            background: linear-gradient(180deg, #0b2d63 0%, #061f46 100%);
            color: #ffffff;
            border-color: #f3bf28;
            box-shadow: 0 4px 12px rgba(6, 31, 70, 0.22);
          }
          .check-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            min-height: 56px;
            border-radius: 12px;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
            font-size: 16px;
            font-weight: 600;
            line-height: 1.4;
            cursor: pointer;
          }
          .check-row input { width: 22px; height: 22px; min-height: auto; flex-shrink: 0; }
          .err-msg { color: #dc2626; font-size: 15px; font-weight: 600; margin-top: 6px; }
          .hp-field { position: absolute; left: -9999px; opacity: 0; height: 0; width: 0; overflow: hidden; }
          .quick-facilities { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 6px; align-items: center; }
          .fac-chip {
            padding: 8px 14px;
            min-height: 40px;
            border-radius: 9999px;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            font-size: 14px;
            font-weight: 700;
          }
          .fac-chip:hover { border-color: #123e77; background: #eaf2ff; color: #061f46; }
          .map-preview-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
            padding: 10px 16px;
            min-height: 44px;
            border-radius: 10px;
            border: 1.5px solid #123e77;
            background: #eaf2ff;
            color: #061f46;
            font-size: 15px;
            font-weight: 700;
          }
          .map-preview-btn:hover { background: #061f46; color: #ffffff; }
          .ac-wrap { position: relative; }
          .ac-list {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            right: 0;
            z-index: 30;
            background: var(--surface);
            border: 1.5px solid #123e77;
            border-radius: 12px;
            box-shadow: 0 14px 32px rgba(6, 31, 70, 0.18);
            max-height: 240px;
            overflow-y: auto;
            display: none;
          }
          .ac-list.open { display: block; }
          .ac-item {
            width: 100%;
            text-align: left;
            padding: 11px 14px;
            background: none;
            border: none;
            border-bottom: 1px solid var(--line);
            color: var(--ink);
            font-size: 15px;
            line-height: 1.4;
          }
          .ac-item:last-child { border-bottom: none; }
          .ac-item:hover { background: #eaf2ff; color: #061f46; }
          .ac-item strong { display: block; font-size: 15px; }
          .ac-item span { font-size: 13px; color: #334155; }
          :host([data-theme="dark"]) .ac-item:hover { background: #1e293b; color: #f3bf28; }
          :host([data-theme="dark"]) .ac-item span { color: #cbd5e1; }
          .inline-map-box {
            margin-top: 14px;
            border-radius: 14px;
            overflow: hidden;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
          }
          .inline-map-box iframe { width: 100%; height: 220px; border: 0; display: block; }
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

          <div class="section-head" style="margin-top:0;"><span class="step-num">1</span> Service &amp; Schedule</div>
          <div class="grid-3">
            <div>
              <label for="serviceType">Service &amp; Transport Type *</label>
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
              <label for="vehiclePreference">Vehicle &amp; Ride Option</label>
              <select id="vehiclePreference">
                <option value="best_match" ${s.vehiclePreference === 'best_match' ? 'selected' : ''}>Best Match for Selected Service</option>
                <option value="sedan_suv" ${s.vehiclePreference === 'sedan_suv' ? 'selected' : ''}>Comfort Sedan / SUV</option>
                <option value="wheelchair_van" ${s.vehiclePreference === 'wheelchair_van' ? 'selected' : ''}>Wheelchair Accessible Van (Lift / Ramp)</option>
                <option value="multi_passenger_van" ${s.vehiclePreference === 'multi_passenger_van' ? 'selected' : ''}>Multi-Passenger / School &amp; Group Van</option>
              </select>
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
          <p style="font-size:14px;color:var(--muted);margin-top:8px;">
            Note: Submitted dates and times are requests (<strong>PENDING REVIEW</strong>) and are not confirmed until verified by Seattle dispatch.
          </p>

          <div class="section-head"><span class="step-num">2</span> Pickup &amp; Destination</div>
          <div class="grid-2">
            <div class="ac-wrap">
              <label for="pickupAddress">Pickup Street Address *</label>
              <input type="text" id="pickupAddress" autocomplete="off" placeholder="e.g., 1902 E Yesler Way, Seattle, WA" value="${s.pickupAddress}" />
              <div class="ac-list" id="pickup-ac" role="listbox" aria-label="Pickup address suggestions"></div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
                <button type="button" class="fac-chip" id="gps-pickup-btn">📍 Use My Current Location</button>
                <button type="button" class="fac-chip" id="confirm-pickup-btn">${s.pickupConfirmed ? '✓ Pickup Confirmed' : 'Confirm Pickup Pin'}</button>
              </div>
              ${fieldErr('pickupAddress')}
            </div>
            <div>
              <label for="pickupNotes">Apt / Unit / Gate / Access Notes</label>
              <input type="text" id="pickupNotes" placeholder="Apt #, buzzer code, front/side entrance" value="${s.pickupNotes}" />
            </div>
          </div>
          <div class="grid-3" style="margin-top:12px;">
            <div>
              <label for="pickupCity">Pickup City</label>
              <input type="text" id="pickupCity" placeholder="Seattle" value="${s.pickupCity}" />
            </div>
            <div>
              <label for="pickupState">State</label>
              <input type="text" id="pickupState" placeholder="WA" value="${s.pickupState}" maxlength="2" />
            </div>
            <div>
              <label for="pickupZip">ZIP Code</label>
              <input type="text" id="pickupZip" placeholder="98122" value="${s.pickupZip}" maxlength="10" />
            </div>
          </div>

          <div class="grid-2" style="margin-top:16px;">
            <div class="ac-wrap">
              <label for="destinationAddress">Destination Address *</label>
              <input type="text" id="destinationAddress" autocomplete="off" placeholder="Clinic street address" value="${s.destinationAddress}" />
              <div class="ac-list" id="dest-ac" role="listbox" aria-label="Destination address suggestions"></div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
                <button type="button" class="fac-chip" id="gps-dest-btn">📍 Use Current Location</button>
                <button type="button" class="fac-chip" id="confirm-dest-btn">${s.destinationConfirmed ? '✓ Destination Confirmed' : 'Confirm Destination Pin'}</button>
              </div>
              ${fieldErr('destinationAddress')}
            </div>
            <div>
              <label for="destinationNotes">Department / Suite / Entrance</label>
              <input type="text" id="destinationNotes" placeholder="e.g., Dialysis Unit, 3rd Floor" value="${s.destinationNotes}" />
            </div>
          </div>
          <div class="grid-3" style="margin-top:12px;">
            <div>
              <label for="facilityName">Medical Facility / Clinic Name</label>
              <input type="text" id="facilityName" placeholder="e.g., Swedish First Hill, UW Medical" value="${s.facilityName}" />
            </div>
            <div>
              <label for="destinationCity">Destination City</label>
              <input type="text" id="destinationCity" placeholder="Seattle" value="${s.destinationCity}" />
            </div>
            <div>
              <label for="destinationZip">Destination ZIP Code</label>
              <input type="text" id="destinationZip" placeholder="98104" value="${s.destinationZip}" maxlength="10" />
            </div>
          </div>
          <div class="grid-2" style="margin-top:12px;">
            <div>
              <label for="additionalStops">Additional Stops (Optional)</label>
              <input type="text" id="additionalStops" placeholder="e.g., Pharmacy stop before returning home" value="${s.additionalStops}" />
            </div>
            <div>
              <label for="flightInfo">Flight Number / Airline (Airport Rides)</label>
              <input type="text" id="flightInfo" placeholder="e.g., Delta DL 412 (Sea-Tac)" value="${s.flightInfo}" />
            </div>
          </div>
          <div class="quick-facilities">
            <span style="font-size:14px;font-weight:700;color:var(--ink);">Quick-Fill Hospital:</span>
            ${SEATTLE_MEDICAL_CENTERS.slice(0, 6).map((c, idx) => `<button type="button" class="fac-chip" data-facility="${idx}">${c.name}</button>`).join('')}
          </div>
          <div class="inline-map-box">
            <iframe
              id="booking-map-frame"
              title="Pickup and Destination Map Preview"
              src="${s.destinationAddress ? `https://maps.google.com/maps?q=${encodeURIComponent(s.destinationAddress)}&t=&z=13&ie=UTF8&iwloc=&output=embed` : COMPANY_INFO.mapsEmbedUrl}"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
          <button type="button" class="map-preview-btn" id="preview-route-map">📍 Open Full Route &amp; Directions in Google Maps ↗</button>

          <div class="section-head"><span class="step-num">3</span> Passenger &amp; Mobility Details</div>
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

          <div class="grid-3" style="margin-top:14px;">
            <div>
              <label for="countryCode">Country Code</label>
              <select id="countryCode">
                <option value="+1" ${s.countryCode === '+1' ? 'selected' : ''}>US (+1)</option>
                <option value="+1-CA" ${s.countryCode === '+1-CA' ? 'selected' : ''}>Canada (+1)</option>
                <option value="other" ${s.countryCode === 'other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
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
              <label for="passengerCount">Number of Passengers</label>
              <input type="number" id="passengerCount" min="1" max="6" value="${s.passengerCount}" />
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
                <option value="door_through_door" ${s.mobilityNeed === 'door_through_door' ? 'selected' : ''}>Door-Through-Door Assistance</option>
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
              <label class="check-row">
                <input type="checkbox" id="needsBoardingAssistance" ${s.needsBoardingAssistance ? 'checked' : ''} />
                <span>Additional Boarding Assistance Required</span>
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
            <button type="submit" class="dt-button" style="width:100%;font-size:18px;padding:16px 26px;min-height:58px;" ${this._isSubmitting ? 'disabled' : ''}>
              ${this._isSubmitting ? 'Submitting to Seattle Dispatch...' : '📅 Book Medical Ride →'}
            </button>
            <p style="text-align:center;font-size:16px;color:var(--muted);">
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
      this.shadowRoot.querySelectorAll('[data-facility]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this._collectValues();
          const item = SEATTLE_MEDICAL_CENTERS[Number(btn.getAttribute('data-facility'))];
          if (item) {
            this._state.facilityName = item.name;
            this._state.destinationAddress = item.address;
            this.render();
          }
        });
      });

      const updateMapFrame = () => {
        const frame = /** @type {HTMLIFrameElement | null} */ (this.shadowRoot.getElementById('booking-map-frame'));
        if (!frame) return;
        const pEl = /** @type {HTMLInputElement | null} */ (this.shadowRoot.getElementById('pickupAddress'));
        const dEl = /** @type {HTMLInputElement | null} */ (this.shadowRoot.getElementById('destinationAddress'));
        const origin = (pEl ? pEl.value : this._state.pickupAddress || '').trim();
        const dest = (dEl ? dEl.value : this._state.destinationAddress || '').trim();
        if (origin && dest) {
          frame.src = `https://maps.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(dest)}&output=embed`;
        } else if (dest || origin) {
          frame.src = `https://maps.google.com/maps?q=${encodeURIComponent(dest || origin)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
        }
      };

      const bindAutocomplete = (inputId, listId, localPool, isDest) => {
        const inputEl = /** @type {HTMLInputElement | null} */ (this.shadowRoot.getElementById(inputId));
        const listEl = this.shadowRoot.getElementById(listId);
        if (!inputEl || !listEl) return;

        const renderOptions = (items) => {
          if (!items.length) {
            listEl.classList.remove('open');
            listEl.innerHTML = '';
            return;
          }
          listEl.innerHTML = items.map((item, idx) => `
            <button type="button" class="ac-item" data-idx="${idx}">
              <strong>${item.name}</strong>
              <span>${item.address}</span>
            </button>
          `).join('');
          listEl.classList.add('open');
          listEl.querySelectorAll('.ac-item').forEach((btn) => {
            btn.addEventListener('click', () => {
              const chosen = items[Number(btn.getAttribute('data-idx'))];
              if (!chosen) return;
              inputEl.value = chosen.address;
              if (isDest) {
                this._state.destinationAddress = chosen.address;
                if (chosen.lat) this._state.destinationLat = chosen.lat;
                if (chosen.lng) this._state.destinationLng = chosen.lng;
                if (chosen.placeId) this._state.destinationPlaceId = chosen.placeId;
                const facEl = /** @type {HTMLInputElement | null} */ (this.shadowRoot.getElementById('facilityName'));
                if (facEl && chosen.isFacility !== false) {
                  facEl.value = chosen.name;
                  this._state.facilityName = chosen.name;
                }
              } else {
                this._state.pickupAddress = chosen.address;
                if (chosen.lat) this._state.pickupLat = chosen.lat;
                if (chosen.lng) this._state.pickupLng = chosen.lng;
                if (chosen.placeId) this._state.pickupPlaceId = chosen.placeId;
              }
              listEl.classList.remove('open');
              updateMapFrame();
            });
          });
        };

        const runSearch = (q) => {
          const term = q.trim().toLowerCase();
          const localMatches = localPool.filter((p) => (
            !term || p.name.toLowerCase().includes(term) || p.address.toLowerCase().includes(term)
          )).slice(0, 5);
          renderOptions(localMatches);

          if (term.length >= 3 && typeof fetch === 'function') {
            if (this._lookupTimer) clearTimeout(this._lookupTimer);
            this._lookupTimer = setTimeout(async () => {
              try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=us&viewbox=-122.6,47.85,-122.0,47.35&bounded=1&limit=4&q=${encodeURIComponent(q)}`;
                const resp = await fetch(url, { headers: { Accept: 'application/json' } });
                if (!resp.ok) return;
                const rows = await resp.json();
                if (!Array.isArray(rows) || !rows.length) return;
                const remoteItems = rows.map((r) => ({
                  name: (r.display_name || '').split(',')[0] || 'Seattle Location',
                  address: r.display_name,
                  lat: r.lat ? Number(r.lat) : null,
                  lng: r.lon ? Number(r.lon) : null,
                  placeId: r.place_id ? String(r.place_id) : '',
                  isFacility: false
                }));
                renderOptions([...localMatches.slice(0, 3), ...remoteItems]);
              } catch (err) {
                // Local Seattle/King County recommendations remain available
              }
            }, 320);
          }
        };

        inputEl.addEventListener('focus', () => runSearch(inputEl.value));
        inputEl.addEventListener('input', () => runSearch(inputEl.value));
        inputEl.addEventListener('blur', () => {
          setTimeout(() => listEl.classList.remove('open'), 180);
        });
      };

      bindAutocomplete('pickupAddress', 'pickup-ac', SEATTLE_PICKUP_AREAS, false);
      bindAutocomplete('destinationAddress', 'dest-ac', SEATTLE_MEDICAL_CENTERS, true);

      const useGpsLocation = (isDest) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            let resolvedAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            try {
              const rev = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              if (rev.ok) {
                const json = await rev.json();
                if (json && json.display_name) resolvedAddress = json.display_name;
              }
            } catch (e) {
              // Coordinate fallback already set
            }
            this._collectValues();
            if (isDest) {
              this._state.destinationAddress = resolvedAddress;
              this._state.destinationLat = lat;
              this._state.destinationLng = lng;
              this._state.destinationConfirmed = true;
            } else {
              this._state.pickupAddress = resolvedAddress;
              this._state.pickupLat = lat;
              this._state.pickupLng = lng;
              this._state.pickupConfirmed = true;
            }
            this.render();
          },
          () => {
            this._errors = { ...this._errors, [isDest ? 'destinationAddress' : 'pickupAddress']: 'Location permission denied. Please type your address.' };
            this.render();
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      };

      const gpsPickupBtn = this.shadowRoot.getElementById('gps-pickup-btn');
      if (gpsPickupBtn) gpsPickupBtn.addEventListener('click', () => useGpsLocation(false));
      const gpsDestBtn = this.shadowRoot.getElementById('gps-dest-btn');
      if (gpsDestBtn) gpsDestBtn.addEventListener('click', () => useGpsLocation(true));
      const confirmPickupBtn = this.shadowRoot.getElementById('confirm-pickup-btn');
      if (confirmPickupBtn) {
        confirmPickupBtn.addEventListener('click', () => {
          this._collectValues();
          this._state.pickupConfirmed = Boolean(this._state.pickupAddress);
          this.render();
        });
      }
      const confirmDestBtn = this.shadowRoot.getElementById('confirm-dest-btn');
      if (confirmDestBtn) {
        confirmDestBtn.addEventListener('click', () => {
          this._collectValues();
          this._state.destinationConfirmed = Boolean(this._state.destinationAddress);
          this.render();
        });
      }
      const routeBtn = this.shadowRoot.getElementById('preview-route-map');
      if (routeBtn) {
        routeBtn.addEventListener('click', () => {
          this._collectValues();
          const origin = (this._state.pickupAddress || '').trim();
          const dest = (this._state.destinationAddress || '').trim();
          const url = origin && dest
            ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}`
            : dest
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`
              : COMPANY_INFO.mapsUrl;
          window.open(url, '_blank', 'noopener,noreferrer');
        });
      }
      this.shadowRoot.getElementById('booking-form').addEventListener('submit', (ev) => this._handleSubmit(ev));
    }
  }

  if (!customElements.get('ccr-booking-form')) {
    customElements.define('ccr-booking-form', CcrBookingForm);
  }
}
