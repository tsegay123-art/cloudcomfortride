import { COMPANY_INFO, getServiceTitle } from '../companyData';
import { escapeHtml } from '../bookingHelpers';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrDispatchPage extends HTMLElement {
    static get observedAttributes() {
      return ['dispatch-data', 'dispatch-error'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._pin = '';
      this._authenticated = false;
      this._loading = false;
      this._error = '';
      this._tab = 'bookings';
      this._filter = 'all';
      this._search = '';
      this._dateFilter = '';
      this._serviceFilter = '';
      this._bookings = [];
      this._inquiries = [];
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
      if (name === 'dispatch-data' && newVal) {
        try {
          const data = JSON.parse(newVal);
          this._bookings = Array.isArray(data.bookings) ? data.bookings : [];
          this._inquiries = Array.isArray(data.inquiries) ? data.inquiries : [];
          this._authenticated = true;
          this._loading = false;
          this._error = '';
          this.render();
        } catch (err) {
          this._loading = false;
          this._error = 'Invalid response from dispatch server.';
          this.render();
        }
      } else if (name === 'dispatch-error' && newVal) {
        this._loading = false;
        this._error = newVal;
        this.render();
      }
    }

    _login(pin) {
      this._pin = pin;
      this._loading = true;
      this._error = '';
      this.render();
      this.dispatchEvent(new CustomEvent('dispatchLogin', {
        detail: { pin },
        bubbles: true,
        composed: true
      }));
    }

    _setBookingStatus(bookingId, status, ownerNotes = '') {
      this._loading = true;
      this.render();
      this.dispatchEvent(new CustomEvent('updateBookingStatus', {
        detail: { pin: this._pin, bookingId, status, ownerNotes },
        bubbles: true,
        composed: true
      }));
    }

    _resolveInquiry(inquiryId) {
      this._loading = true;
      this.render();
      this.dispatchEvent(new CustomEvent('resolveInquiry', {
        detail: { pin: this._pin, inquiryId },
        bubbles: true,
        composed: true
      }));
    }

    render() {
      const normStatus = (b) => String(b.bookingStatus || b.status || 'PENDING').toUpperCase();
      const pendingCount = this._bookings.filter((b) => normStatus(b) === 'PENDING').length;
      const confirmedCount = this._bookings.filter((b) => normStatus(b) === 'CONFIRMED').length;
      const q = this._search.trim().toLowerCase();
      const filteredBookings = this._bookings.filter((b) => {
        const st = normStatus(b);
        if (this._filter !== 'all' && st !== this._filter) return false;
        if (this._dateFilter && b.pickupDate !== this._dateFilter) return false;
        if (this._serviceFilter && b.serviceType !== this._serviceFilter) return false;
        if (q) {
          const ref = String(b.bookingReference || b.bookingId || b.id || '').toLowerCase();
          const name = String(b.passengerName || `${b.firstName || ''} ${b.lastName || ''}`).toLowerCase();
          return ref.includes(q) || name.includes(q);
        }
        return true;
      });

      this.shadowRoot.innerHTML = `
        <style>
          ${CCR_SHARED_CSS}
          .login-card {
            max-width: 480px;
            margin: 48px auto;
            padding: 36px;
            border-radius: 22px;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-top: 5px solid #f3bf28;
            box-shadow: 0 18px 44px rgba(6, 31, 70, 0.1);
          }
          .pin-input {
            width: 100%;
            min-height: 56px;
            padding: 14px 16px;
            border-radius: 12px;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            font-size: 18px;
            margin: 10px 0 18px;
          }
          .tab-row { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; align-items: center; justify-content: space-between; }
          .tab-btns { display: flex; flex-wrap: wrap; gap: 10px; }
          .tab-btn {
            padding: 12px 20px;
            min-height: 48px;
            border-radius: 12px;
            border: 1.5px solid var(--card-border);
            background: var(--card-bg);
            color: var(--ink);
            font-weight: 800;
            font-size: 16px;
          }
          .tab-btn.active { background: #061f46; color: #ffffff; border-color: #f3bf28; }
          .item-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-left: 5px solid #f3bf28;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 18px;
          }
          .item-card.confirmed { border-left-color: #16a34a; }
          .item-card.cancelled { border-left-color: #dc2626; opacity: 0.78; }
          .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .badge.pending_review { background: #fef3c7; color: #92400e; }
          .badge.confirmed { background: #dcfce7; color: #166534; }
          .badge.cancelled { background: #fee2e2; color: #991b1b; }
          .badge.new { background: #dbeafe; color: #1e40af; }
          .badge.resolved { background: #dcfce7; color: #166534; }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 14px;
            margin: 16px 0;
            font-size: 16px;
          }
          .meta-grid span { display: block; font-size: 13px; text-transform: uppercase; font-weight: 700; color: #334155; }
          :host([data-theme="dark"]) .meta-grid span { color: #cbd5e1; }
        </style>

        <section class="banner-hero">
          <div class="container">
            <span class="badge-pill">Owner &amp; Dispatch Management</span>
            <h1>Cloud Comfort Ride Dispatch Portal</h1>
            <p>Review incoming ride bookings and contact inquiries, approve or cancel reservations, and open pickup-to-destination routes.</p>
          </div>
        </section>

        <section style="background:var(--surface-alt);padding:44px 0;min-height:500px;">
          <div class="container">
            ${!this._authenticated ? `
              <form class="login-card" id="dispatch-login-form">
                <h2 style="font-size:26px;font-weight:800;margin-bottom:8px;">Owner Dispatch Sign-In</h2>
                <p style="font-size:16px;margin-bottom:16px;">Enter your Dispatch PIN to view bookings and contact submissions.</p>
                ${this._error ? `<div role="alert" style="padding:12px;border-radius:10px;background:#fef2f2;color:#dc2626;font-size:15px;font-weight:700;margin-bottom:12px;">${escapeHtml(this._error)}</div>` : ''}
                <label for="dispatch-pin" style="font-size:16px;font-weight:700;display:block;">Dispatch PIN</label>
                <input id="dispatch-pin" class="pin-input" type="password" placeholder="Enter Dispatch PIN" value="${escapeHtml(this._pin)}" required />
                <button type="submit" class="dt-button" style="width:100%;" ${this._loading ? 'disabled' : ''}>
                  ${this._loading ? 'Verifying...' : 'Open Owner Dispatch Portal →'}
                </button>
              </form>
            ` : `
              <div class="tab-row">
                <div class="tab-btns">
                  <button class="tab-btn ${this._tab === 'bookings' ? 'active' : ''}" id="tab-bookings">
                    Ride Bookings (${this._bookings.length}) • Pending: ${pendingCount} • Confirmed: ${confirmedCount}
                  </button>
                  <button class="tab-btn ${this._tab === 'inquiries' ? 'active' : ''}" id="tab-inquiries">
                    Contact Messages (${this._inquiries.length})
                  </button>
                </div>
                <button class="dt-button-outline" id="refresh-dispatch" ${this._loading ? 'disabled' : ''}>↻ Refresh</button>
              </div>

              ${this._error ? `<div role="alert" style="padding:12px;border-radius:10px;background:#fef2f2;color:#dc2626;font-size:15px;font-weight:700;margin-bottom:16px;">${escapeHtml(this._error)}</div>` : ''}

              ${this._tab === 'bookings' ? `
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px;">
                  <input id="d-search" type="text" placeholder="Search Reference or Customer Name..." value="${escapeHtml(this._search)}" style="min-height:46px;padding:10px 14px;border-radius:10px;border:1.5px solid var(--card-border);background:var(--card-bg);color:var(--ink);font-size:15px;" />
                  <input id="d-date" type="date" value="${escapeHtml(this._dateFilter)}" style="min-height:46px;padding:10px 14px;border-radius:10px;border:1.5px solid var(--card-border);background:var(--card-bg);color:var(--ink);font-size:15px;" />
                  <select id="d-service" style="min-height:46px;padding:10px 14px;border-radius:10px;border:1.5px solid var(--card-border);background:var(--card-bg);color:var(--ink);font-size:15px;">
                    <option value="">All Services</option>
                    ${Array.from(new Set(this._bookings.map((b) => b.serviceType).filter(Boolean))).map((sv) => `<option value="${escapeHtml(sv)}" ${this._serviceFilter === sv ? 'selected' : ''}>${escapeHtml(getServiceTitle(sv))}</option>`).join('')}
                  </select>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
                  ${['all', 'PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'].map((f) => `
                    <button class="tab-btn ${this._filter === f ? 'active' : ''}" data-filter="${f}" style="padding:8px 16px;min-height:42px;font-size:14px;">
                      ${f === 'all' ? 'All Bookings' : f}
                    </button>
                  `).join('')}
                </div>

                ${filteredBookings.length === 0 ? `
                  <div class="card" style="padding:40px;text-align:center;">
                    <h3>No Bookings in This View</h3>
                    <p style="margin-top:8px;">New ride requests submitted online will appear here immediately.</p>
                  </div>
                ` : filteredBookings.map((b) => {
                  const bid = escapeHtml(b.bookingReference || b.bookingId || b.id);
                  const st = normStatus(b);
                  const nStat = String(b.notificationStatus || 'PENDING').toUpperCase();
                  const routeUrl = b.pickupAddress && b.destinationAddress
                    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(b.pickupAddress)}&destination=${encodeURIComponent(b.destinationAddress)}`
                    : COMPANY_INFO.mapsUrl;
                  return `
                    <div class="item-card ${escapeHtml(st.toLowerCase())}">
                      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--line);">
                        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                          <strong style="font-size:20px;">${bid}</strong>
                          <span class="badge ${st === 'CONFIRMED' ? 'confirmed' : (st === 'CANCELLED' || st === 'REJECTED' ? 'cancelled' : 'pending_review')}">${escapeHtml(st)}</span>
                          <span class="badge ${nStat === 'SENT' ? 'resolved' : (nStat === 'FAILED' ? 'cancelled' : 'pending_review')}">Notify: ${escapeHtml(nStat)}</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:10px;">
                          <a class="dt-button-outline" href="${routeUrl}" target="_blank" rel="noopener noreferrer" style="min-height:44px;padding:8px 14px;font-size:15px;">📍 Map Route ↗</a>
                          ${st !== 'CONFIRMED' ? `<button class="dt-button" data-approve="${bid}" style="min-height:44px;padding:8px 16px;font-size:15px;">✓ Confirm</button>` : ''}
                          ${st !== 'REJECTED' ? `<button class="dt-button-outline" data-reject="${bid}" style="min-height:44px;padding:8px 14px;font-size:15px;border-color:#dc2626;color:#dc2626;">✕ Reject</button>` : ''}
                        </div>
                      </div>
                      <div class="meta-grid">
                        <div><span>Passenger</span><strong>${escapeHtml(b.passengerName || `${b.firstName || ''} ${b.lastName || ''}`)}</strong></div>
                        <div><span>Phone</span><a href="tel:${escapeHtml(b.phone || b.passengerPhone)}" style="text-decoration:underline;font-weight:700;">${escapeHtml(b.phone || b.passengerPhone)}</a></div>
                        <div><span>Email</span><a href="mailto:${escapeHtml(b.email || b.passengerEmail)}" style="text-decoration:underline;font-weight:700;">${escapeHtml(b.email || b.passengerEmail)}</a></div>
                        <div><span>Service</span><strong>${escapeHtml(b.serviceTitle || getServiceTitle(b.serviceType))}</strong></div>
                        <div><span>Vehicle &amp; Mobility</span><strong>${escapeHtml(b.vehiclePreference || 'best_match')} • ${escapeHtml(b.mobilityRequirement || b.mobilityNeed || 'ambulatory')}</strong></div>
                        <div><span>Schedule</span><strong>${escapeHtml(b.pickupDate)} at ${escapeHtml(b.pickupTime)}${b.returnTime ? ` (Return ${escapeHtml(b.returnTime)})` : ''}</strong></div>
                        <div><span>Pickup</span><strong>${escapeHtml(b.pickupAddress)}</strong></div>
                        <div><span>Destination</span><strong>${escapeHtml(b.facilityName ? `${b.facilityName} — ${b.destinationAddress}` : b.destinationAddress)}</strong></div>
                      </div>
                      ${b.specialInstructions ? `<div style="font-size:15px;padding:10px 14px;background:var(--surface-alt);border-radius:10px;margin-bottom:10px;"><strong>Notes:</strong> ${escapeHtml(b.specialInstructions)}</div>` : ''}
                      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                        <input type="text" data-notes-for="${bid}" placeholder="Internal owner/dispatch notes..." value="${escapeHtml(b.ownerNotes || '')}" style="flex:1;min-width:220px;min-height:44px;padding:8px 12px;border-radius:10px;border:1.5px solid var(--card-border);background:var(--surface-alt);color:var(--ink);font-size:15px;" />
                      </div>
                    </div>
                  `;
                }).join('')}
              ` : `
                ${this._inquiries.length === 0 ? `
                  <div class="card" style="padding:40px;text-align:center;">
                    <h3>No Contact Messages Yet</h3>
                    <p style="margin-top:8px;">Messages submitted on the Contact Us page will appear here.</p>
                  </div>
                ` : this._inquiries.map((inq) => {
                  const iid = escapeHtml(inq.inquiryId || inq._id);
                  const st = inq.status || 'new';
                  return `
                    <div class="item-card">
                      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--line);">
                        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                          <strong style="font-size:19px;">${escapeHtml(inq.name)}</strong>
                          <span class="badge ${escapeHtml(st)}">${escapeHtml(st)}</span>
                        </div>
                        <div style="display:flex;gap:10px;flex-wrap:wrap;">
                          <a class="dt-button-outline" href="mailto:${escapeHtml(inq.email)}" style="min-height:44px;padding:8px 14px;font-size:15px;">✉ Reply</a>
                          ${st !== 'resolved' ? `<button class="dt-button" data-resolve="${iid}" style="min-height:44px;padding:8px 14px;font-size:15px;">✓ Mark Resolved</button>` : ''}
                        </div>
                      </div>
                      <div class="meta-grid">
                        <div><span>Topic</span><strong>${escapeHtml(inq.subject)}</strong></div>
                        <div><span>Email</span><strong>${escapeHtml(inq.email)}</strong></div>
                        <div><span>Phone</span><strong>${escapeHtml(inq.phone || 'Not provided')}</strong></div>
                      </div>
                      <p style="font-size:16px;line-height:1.6;">${escapeHtml(inq.message)}</p>
                    </div>
                  `;
                }).join('')}
              `}
            `}
          </div>
        </section>
      `;

      const loginForm = this.shadowRoot.getElementById('dispatch-login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const pinInput = /** @type {HTMLInputElement | null} */ (this.shadowRoot.getElementById('dispatch-pin'));
          this._login(pinInput ? pinInput.value : '');
        });
      }

      const tabB = this.shadowRoot.getElementById('tab-bookings');
      const tabI = this.shadowRoot.getElementById('tab-inquiries');
      const refBtn = this.shadowRoot.getElementById('refresh-dispatch');
      if (tabB) tabB.addEventListener('click', () => { this._tab = 'bookings'; this.render(); });
      if (tabI) tabI.addEventListener('click', () => { this._tab = 'inquiries'; this.render(); });
      if (refBtn) refBtn.addEventListener('click', () => this._login(this._pin));

      const dSearch = /** @type {HTMLInputElement | null} */ (this.shadowRoot.getElementById('d-search'));
      const dDate = /** @type {HTMLInputElement | null} */ (this.shadowRoot.getElementById('d-date'));
      const dSvc = /** @type {HTMLSelectElement | null} */ (this.shadowRoot.getElementById('d-service'));
      if (dSearch) dSearch.addEventListener('input', () => { this._search = dSearch.value; this.render(); });
      if (dDate) dDate.addEventListener('change', () => { this._dateFilter = dDate.value; this.render(); });
      if (dSvc) dSvc.addEventListener('change', () => { this._serviceFilter = dSvc.value; this.render(); });

      this.shadowRoot.querySelectorAll('[data-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this._filter = btn.getAttribute('data-filter') || 'all';
          this.render();
        });
      });
      const getNotes = (id) => {
        const inp = /** @type {HTMLInputElement | null} */ (this.shadowRoot.querySelector(`[data-notes-for="${id}"]`));
        return inp ? inp.value : '';
      };
      this.shadowRoot.querySelectorAll('[data-approve]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-approve');
          this._setBookingStatus(id, 'CONFIRMED', getNotes(id));
        });
      });
      this.shadowRoot.querySelectorAll('[data-reject]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-reject');
          this._setBookingStatus(id, 'REJECTED', getNotes(id));
        });
      });
      this.shadowRoot.querySelectorAll('[data-resolve]').forEach((btn) => {
        btn.addEventListener('click', () => this._resolveInquiry(btn.getAttribute('data-resolve')));
      });
    }
  }

  if (!customElements.get('ccr-dispatch-page')) {
    customElements.define('ccr-dispatch-page', CcrDispatchPage);
  }
}
