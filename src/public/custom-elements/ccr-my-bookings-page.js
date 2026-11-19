import { COMPANY_INFO, getServiceTitle } from '../companyData';
import {
  buildVoucherMarkup,
  getLocalBookings,
  removeLocalBooking
} from '../bookingHelpers';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrMyBookingsPage extends HTMLElement {
    static get observedAttributes() {
      return ['server-bookings'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._search = '';
      this._bookings = [];
      this._voucherBooking = null;
      this._onThemeSync = () => syncThemeHost(this);
    }

    attributeChangedCallback(name, _oldVal, newVal) {
      if (name === 'server-bookings' && newVal) {
        try {
          const items = JSON.parse(newVal);
          this.setServerBookings(items);
        } catch (err) {
          // Ignore malformed server payload
        }
      }
    }

    connectedCallback() {
      ensureGoogleFonts();
      syncThemeHost(this);
      this._bookings = getLocalBookings();
      window.addEventListener('ccr-theme-change', this._onThemeSync);
      window.addEventListener('ccr-bookings-updated', () => {
        this._bookings = getLocalBookings();
        this.render();
      });
      this.render();
    }

    disconnectedCallback() {
      window.removeEventListener('ccr-theme-change', this._onThemeSync);
    }

    setServerBookings(items) {
      if (Array.isArray(items) && items.length > 0) {
        const merged = [...items];
        this._bookings.forEach((local) => {
          if (!merged.some((m) => (m.bookingId || m.id) === local.id)) {
            merged.push(local);
          }
        });
        this._bookings = merged;
        this.render();
      }
    }

    _navigate(path) {
      this.dispatchEvent(new CustomEvent('navigate', {
        detail: { path },
        bubbles: true,
        composed: true
      }));
    }

    render() {
      const q = this._search.trim().toLowerCase();
      const filtered = this._bookings.filter((b) => {
        if (!q) return true;
        const id = (b.bookingId || b.id || '').toLowerCase();
        return (
          id.includes(q) ||
          (b.passengerName || '').toLowerCase().includes(q) ||
          (b.passengerPhone || '').includes(q) ||
          (b.pickupAddress || '').toLowerCase().includes(q) ||
          (b.destinationAddress || '').toLowerCase().includes(q)
        );
      });

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
            padding: 11px 14px;
            border-radius: 10px;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            font-size: 14px;
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
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            font-size: 13px;
          }
          .b-grid span { display: block; font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700; }
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
            color: #122747;
            border-radius: 18px;
            max-width: 680px;
            width: 100%;
            padding: 24px;
            border: 2px solid #f3bf28;
          }
          .voucher-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f3bf28; padding-bottom: 10px; margin-bottom: 14px; }
          .voucher-eyebrow { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #986800; }
          .voucher-status { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; }
          .voucher-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; }
          .voucher-grid span { display: block; color: #65758b; font-size: 10px; text-transform: uppercase; font-weight: 700; }
          .voucher-notes { margin-top: 12px; font-size: 12px; background: #f7f9fc; padding: 10px; border-radius: 8px; }
          .voucher-foot { margin-top: 14px; padding-top: 10px; border-top: 1px solid #dce4ee; font-size: 11px; color: #65758b; text-align: center; }
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
              <input class="search-input" id="search-box" type="text" placeholder="Search by booking ID, passenger name, or phone..." value="${this._search}" />
              <button class="dt-button" id="new-ride-btn">+ Book Another Ride</button>
            </div>

            ${filtered.length === 0 ? `
              <div class="card" style="padding:48px 24px;text-align:center;">
                <h3 style="font-size:20px;font-weight:800;margin-bottom:8px;">No Bookings Found</h3>
                <p style="font-size:14px;color:var(--muted);max-width:460px;margin:0 auto 20px;">
                  ${this._bookings.length === 0
                    ? 'You have not submitted a ride request from this browser yet. Book a medical ride online or call Seattle dispatch.'
                    : 'No bookings matched your search query.'}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
                  <button class="dt-button" id="empty-book">Book a Ride Online</button>
                  <a class="dt-button-outline" href="tel:${COMPANY_INFO.phoneRaw}">☎ Call ${COMPANY_INFO.phoneDisplay}</a>
                </div>
              </div>
            ` : filtered.map((b) => {
              const bid = b.bookingId || b.id;
              return `
                <div class="booking-card">
                  <div class="b-head">
                    <div>
                      <strong style="font-size:17px;">${bid}</strong>
                      <span style="margin-left:10px;padding:3px 10px;border-radius:9999px;background:#fef3c7;color:#92400e;font-size:11px;font-weight:800;">
                        ${(b.status || 'pending_review').replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div style="display:flex;gap:8px;">
                      <button class="dt-button" style="padding:8px 14px;font-size:12px;" data-voucher="${bid}">🖨 Trip Voucher</button>
                      <button class="dt-button-outline" style="padding:8px 12px;font-size:12px;" data-remove="${bid}">Remove</button>
                    </div>
                  </div>
                  <div class="b-grid">
                    <div><span>Passenger</span><strong>${b.passengerName}</strong></div>
                    <div><span>Service</span><strong>${getServiceTitle(b.serviceType)}</strong></div>
                    <div><span>Pickup Date &amp; Time</span><strong>${b.pickupDate} at ${b.pickupTime}</strong></div>
                    <div><span>Pickup Address</span><strong>${b.pickupAddress}</strong></div>
                    <div><span>Destination</span><strong>${b.destinationAddress}</strong></div>
                    <div><span>Phone</span><strong>${b.passengerPhone}</strong></div>
                  </div>
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
      if (searchBox) {
        searchBox.addEventListener('input', (e) => {
          const target = /** @type {HTMLInputElement | null} */ (e.target);
          this._search = target ? target.value : '';
          this.render();
        });
      }
      this.shadowRoot.getElementById('new-ride-btn').addEventListener('click', () => this._navigate('/book-a-ride'));
      const emptyBook = this.shadowRoot.getElementById('empty-book');
      if (emptyBook) emptyBook.addEventListener('click', () => this._navigate('/book-a-ride'));

      this.shadowRoot.querySelectorAll('[data-voucher]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-voucher');
          this._voucherBooking = this._bookings.find((b) => (b.bookingId || b.id) === id) || null;
          this.render();
        });
      });

      this.shadowRoot.querySelectorAll('[data-remove]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-remove');
          this._bookings = removeLocalBooking(id);
          this.dispatchEvent(new CustomEvent('removeBooking', {
            detail: { bookingId: id },
            bubbles: true,
            composed: true
          }));
          window.dispatchEvent(new CustomEvent('ccr-bookings-updated'));
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
