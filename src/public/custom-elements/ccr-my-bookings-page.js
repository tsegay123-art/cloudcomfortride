import { COMPANY_INFO, getServiceTitle } from '../companyData';
import { buildVoucherMarkup } from '../bookingHelpers';
import { CCR_SHARED_CSS, dispatchCcrNavigation, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrMyBookingsPage extends HTMLElement {
    static get observedAttributes() {
      return ['server-bookings', 'lookup-error'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._search = '';
      this._tab = 'upcoming';
      this._hasSearched = false;
      this._loading = false;
      this._lookupError = '';
      this._cancelNotice = '';
      this._bookings = [];
      this._voucherBooking = null;
      this._onThemeSync = () => syncThemeHost(this);
    }

    attributeChangedCallback(name, _oldVal, newVal) {
      if (name === 'server-bookings' && newVal) {
        try {
          const items = JSON.parse(newVal);
          this._loading = false;
          this._hasSearched = true;
          this._lookupError = '';
          this.setServerBookings(items);
        } catch (err) {
          this._loading = false;
        }
      } else if (name === 'lookup-error') {
        this._loading = false;
        this._hasSearched = true;
        this._lookupError = newVal || '';
        if (this._lookupError) this._bookings = [];
        this.render();
      }
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

    setServerBookings(items) {
      this._bookings = Array.isArray(items) ? items : [];
      this.render();
    }

    _navigate(path) {
      dispatchCcrNavigation(this, path);
    }

    render() {
      const upcomingList = this._bookings.filter((b) => {
        if (typeof b.isUpcoming === 'boolean') return b.isUpcoming;
        const st = String(b.bookingStatus || b.status || 'Pending').toLowerCase();
        return st !== 'cancelled' && st !== 'rejected' && st !== 'completed';
      });
      const pastList = this._bookings.filter((b) => !upcomingList.includes(b));
      const filtered = this._tab === 'upcoming'
        ? upcomingList
        : (this._tab === 'past' ? pastList : this._bookings);
      const statusBadgeStyle = (rawStatus) => {
        const st = String(rawStatus || 'Pending').toLowerCase();
        if (st === 'confirmed') return 'background:#dcfce7;color:#166534;';
        if (st === 'rejected' || st === 'cancelled') return 'background:#fee2e2;color:#991b1b;';
        if (st === 'completed') return 'background:#dbeafe;color:#1e40af;';
        return 'background:#fef3c7;color:#92400e;';
      };

      this.shadowRoot.innerHTML = `
        <style>
          ${CCR_SHARED_CSS}
          .toolbar {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
          }
          .search-input {
            flex: 1;
            min-width: 240px;
            padding: 12px 16px;
            min-height: 48px;
            border-radius: 10px;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            font-size: 16px;
          }
          .booking-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-left: 4px solid #f3bf28;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 16px;
          }
          .b-head {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--line);
            margin-bottom: 12px;
          }
          .b-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 14px;
            font-size: 16px;
          }
          .b-grid span { display: block; font-size: 13px; color: var(--muted); text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
          .voucher-overlay {
            position: fixed;
            inset: 0;
            z-index: 60;
            background: rgba(0, 0, 0, 0.65);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
          }
          .voucher-modal {
            background: #ffffff;
            color: #000000;
            border-radius: 18px;
            max-width: 720px;
            width: 100%;
            padding: 26px;
            border: 2px solid #f3bf28;
          }
          .voucher-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f3bf28; padding-bottom: 12px; margin-bottom: 16px; }
          .voucher-eyebrow { font-size: 13px; text-transform: uppercase; font-weight: 800; color: #986800; }
          .voucher-status { background: #fef3c7; color: #92400e; padding: 5px 12px; border-radius: 9999px; font-size: 13px; font-weight: 800; }
          .voucher-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 15px; }
          .voucher-grid span { display: block; color: #334155; font-size: 12px; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
          .voucher-notes { margin-top: 14px; font-size: 15px; background: #f7f9fc; padding: 12px; border-radius: 8px; }
          .voucher-foot { margin-top: 14px; padding-top: 12px; border-top: 1px solid #dce4ee; font-size: 14px; color: #334155; text-align: center; }
        </style>

        <section class="banner-hero">
          <div class="container">
            <span class="badge-pill">Passenger Self-Service Portal</span>
            <h1>My Medical Trip Bookings</h1>
            <p>Review your registered transportation requests, access printable trip vouchers, and connect directly with Seattle dispatch.</p>
          </div>
        </section>

        <section style="background:var(--surface-alt);padding:44px 0;min-height:480px;">
          <div class="container" style="max-width:960px;">
            <div class="toolbar">
              <input class="search-input" id="search-box" type="text" placeholder="Search by Booking Reference (e.g. CCR-2026-7685), Email, or Phone Number" value="${this._search}" />
              <button class="dt-button-outline" id="search-dispatch-btn" style="min-height:48px;" ${this._loading ? 'disabled' : ''}>
                ${this._loading ? 'Searching...' : '🔍 Find Booking'}
              </button>
              <button class="dt-button" id="new-ride-btn">+ Book Another Ride</button>
            </div>
            ${this._lookupError ? `<div role="alert" style="padding:14px 18px;border-radius:12px;background:#fef2f2;border:1.5px solid #dc2626;color:#991b1b;font-size:16px;font-weight:700;margin-bottom:18px;">${this._lookupError}</div>` : ''}
            ${this._cancelNotice ? `<div role="status" style="padding:14px 18px;border-radius:12px;background:#ecfdf5;border:1.5px solid #16a34a;color:#14532d;font-size:16px;font-weight:700;margin-bottom:18px;">✓ ${this._cancelNotice}</div>` : ''}

            ${this._bookings.length > 0 ? `
              <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;">
                <button class="${this._tab === 'upcoming' ? 'dt-button' : 'dt-button-outline'}" data-my-tab="upcoming" style="min-height:44px;padding:8px 18px;">Upcoming (${upcomingList.length})</button>
                <button class="${this._tab === 'past' ? 'dt-button' : 'dt-button-outline'}" data-my-tab="past" style="min-height:44px;padding:8px 18px;">Past (${pastList.length})</button>
                <button class="${this._tab === 'all' ? 'dt-button' : 'dt-button-outline'}" data-my-tab="all" style="min-height:44px;padding:8px 18px;">All (${this._bookings.length})</button>
              </div>
            ` : ''}

            ${filtered.length === 0 ? `
              <div class="card" style="padding:52px 24px;text-align:center;">
                <h3 style="font-size:24px;font-weight:800;margin-bottom:10px;">${this._hasSearched ? 'No Matching Bookings Found' : 'Check Your Booking Status'}</h3>
                <p style="font-size:17px;color:var(--muted);max-width:560px;margin:0 auto 22px;line-height:1.6;">
                  ${this._hasSearched
                    ? 'No live booking record matched that Booking Reference, Email Address, or Phone Number. Please check your entry or call Seattle dispatch.'
                    : 'Enter your Booking Reference (e.g. CCR-2026-7685), Email Address, or Phone Number above to view your live booking status.'}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
                  <button class="dt-button" id="empty-book">Book a Ride Online</button>
                  <a class="dt-button-outline" href="tel:${COMPANY_INFO.phoneRaw}">☎ Call ${COMPANY_INFO.phoneDisplay}</a>
                </div>
              </div>
            ` : filtered.map((b) => {
              const bid = b.bookingId || b.bookingReference || b.id;
              const liveStatus = b.bookingStatus || b.status || 'Pending';
              return `
                <div class="booking-card">
                  <div class="b-head">
                    <div>
                      <strong style="font-size:20px;">${bid}</strong>
                      <span style="margin-left:10px;padding:4px 12px;border-radius:9999px;${statusBadgeStyle(liveStatus)}font-size:13px;font-weight:800;">
                        ${String(liveStatus).toUpperCase()}
                      </span>
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                      <button class="dt-button" style="padding:10px 16px;font-size:15px;min-height:44px;" data-voucher="${bid}">🖨 Trip Voucher</button>
                      ${String(liveStatus).toLowerCase() === 'pending' || String(liveStatus).toLowerCase() === 'confirmed' ? `
                        <button class="dt-button-outline" style="padding:10px 14px;font-size:15px;min-height:44px;border-color:#dc2626;color:#dc2626;" data-cancel-booking="${bid}">Cancel / Request Change</button>
                      ` : ''}
                    </div>
                  </div>
                  <div class="b-grid">
                    <div><span>Passenger</span><strong>${b.passengerName || 'Passenger'}</strong></div>
                    <div><span>Service</span><strong>${getServiceTitle(b.serviceType)}</strong></div>
                    <div><span>Pickup Date &amp; Time</span><strong>${b.pickupDate} at ${b.pickupTime}</strong></div>
                    <div><span>Pickup Address</span><strong>${b.pickupAddress}</strong></div>
                    <div><span>Destination</span><strong>${b.destinationAddress}</strong></div>
                    <div><span>Phone</span><strong>${b.contactPhone || b.passengerPhone || b.phone || ''}</strong></div>
                  </div>
                  ${b.rejectionReason && String(liveStatus).toLowerCase() === 'rejected' ? `
                    <div style="margin-top:12px;padding:10px 14px;border-radius:10px;background:#fef2f2;color:#991b1b;font-size:15px;">
                      <strong>Dispatch Note:</strong> ${b.rejectionReason}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </section>

        ${this._voucherBooking ? `
          <div class="voucher-overlay" id="voucher-backdrop">
            <div class="voucher-modal">
              ${buildVoucherMarkup(this._voucherBooking)}
              <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;">
                <button class="dt-button-outline" id="close-voucher">Close</button>
                <button class="dt-button" id="print-voucher">🖨 Print Voucher</button>
              </div>
            </div>
          </div>
        ` : ''}
      `;

      const searchBox = this.shadowRoot.getElementById('search-box');
      const triggerLookup = () => {
        this._lookupError = '';
        this._loading = true;
        this.render();
        this.dispatchEvent(new CustomEvent('lookupBooking', {
          detail: { query: this._search },
          bubbles: true,
          composed: true
        }));
      };
      if (searchBox) {
        searchBox.addEventListener('input', (e) => {
          const target = /** @type {HTMLInputElement | null} */ (e.target);
          this._search = target ? target.value : '';
        });
        searchBox.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') triggerLookup();
        });
      }
      const searchDispatchBtn = this.shadowRoot.getElementById('search-dispatch-btn');
      if (searchDispatchBtn) {
        searchDispatchBtn.addEventListener('click', triggerLookup);
      }
      this.shadowRoot.getElementById('new-ride-btn').addEventListener('click', () => this._navigate('/book-a-ride'));
      const emptyBook = this.shadowRoot.getElementById('empty-book');
      if (emptyBook) emptyBook.addEventListener('click', () => this._navigate('/book-a-ride'));

      this.shadowRoot.querySelectorAll('[data-my-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this._tab = btn.getAttribute('data-my-tab') || 'upcoming';
          this.render();
        });
      });

      this.shadowRoot.querySelectorAll('[data-cancel-booking]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-cancel-booking');
          this._cancelNotice = `Cancellation / change request submitted for ${id}.`;
          this._loading = true;
          this.render();
          this.dispatchEvent(new CustomEvent('cancelMyBooking', {
            detail: { bookingId: id, verifier: this._search },
            bubbles: true,
            composed: true
          }));
        });
      });

      this.shadowRoot.querySelectorAll('[data-voucher]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-voucher');
          this._voucherBooking = this._bookings.find((b) => (b.bookingId || b.bookingReference || b.id) === id) || null;
          this.render();
        });
      });

      const closeBtn = this.shadowRoot.getElementById('close-voucher');
      if (closeBtn) closeBtn.addEventListener('click', () => { this._voucherBooking = null; this.render(); });
      const printBtn = this.shadowRoot.getElementById('print-voucher');
      if (printBtn) printBtn.addEventListener('click', () => window.print());
    }
  }

  if (!customElements.get('ccr-my-bookings-page')) {
    customElements.define('ccr-my-bookings-page', CcrMyBookingsPage);
  }
}
