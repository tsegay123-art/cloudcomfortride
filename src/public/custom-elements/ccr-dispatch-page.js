import { COMPANY_INFO, getServiceTitle } from '../companyData';
import { escapeHtml } from '../bookingHelpers';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrDispatchPage extends HTMLElement {
    static get observedAttributes() {
      return ['dispatch-data', 'dispatch-error', 'dispatch-search-results', 'admin-route'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._pin = '';
      this._token = '';
      this._user = null;
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
      this._drivers = [];
      this._vehicles = [];
      this._auditLogs = [];
      this._wixBookingsCount = 0;
      this._detailBooking = null;
      this._editBooking = null;
      this._rejectBooking = null;
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
      if (name === 'admin-route' && newVal) {
        const route = String(newVal).toLowerCase();
        if (route.includes('/customers')) this._tab = 'customers';
        else if (route.includes('/dispatch')) this._tab = 'dispatch';
        else if (route.includes('/drivers')) this._tab = 'drivers';
        else if (route.includes('/vehicles')) this._tab = 'vehicles';
        else if (route.includes('/reports')) this._tab = 'reports';
        else if (route.includes('/settings')) this._tab = 'settings';
        else this._tab = 'bookings';
        this.render();
      } else if (name === 'dispatch-data' && newVal) {
        try {
          const data = JSON.parse(newVal);
          if (data.token) this._token = data.token;
          if (data.user) this._user = data.user;
          this._bookings = Array.isArray(data.bookings) ? data.bookings : [];
          this._inquiries = Array.isArray(data.inquiries) ? data.inquiries : [];
          this._drivers = Array.isArray(data.drivers) ? data.drivers : [];
          this._vehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
          this._auditLogs = Array.isArray(data.auditLogs) ? data.auditLogs : [];
          this._wixBookingsCount = Number(data.wixBookingsCount || 0);
          this._authenticated = true;
          this._loading = false;
          this._error = '';
          this.render();
        } catch (err) {
          this._loading = false;
          this._error = 'Invalid response from dispatch server.';
          this.render();
        }
      } else if (name === 'dispatch-search-results' && newVal) {
        try {
          const items = JSON.parse(newVal);
          this._bookings = Array.isArray(items) ? items : [];
          this._loading = false;
          this.render();
        } catch (err) {
          this._loading = false;
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
        detail: { pin: this._pin, token: this._token || this._pin, bookingId, status, ownerNotes },
        bubbles: true,
        composed: true
      }));
    }

    _resolveInquiry(inquiryId) {
      this._loading = true;
      this.render();
      this.dispatchEvent(new CustomEvent('resolveInquiry', {
        detail: { pin: this._pin, token: this._token || this._pin, inquiryId },
        bubbles: true,
        composed: true
      }));
    }

    _exportBookingsCsv(rows) {
      if (!rows || !rows.length) return;
      const csvCell = (val) => `"${String(val == null ? '' : val).replace(/"/g, '""')}"`;
      const headers = [
        'Reference', 'Status', 'Passenger', 'Email', 'Phone',
        'Service', 'Vehicle', 'Trip Type', 'Pickup Date', 'Pickup Time',
        'Return Time', 'Pickup Address', 'Destination Address',
        'Mobility Needs', 'Passengers', 'Notes', 'Owner Notes', 'Submitted'
      ];
      const lines = [headers.map(csvCell).join(',')];
      rows.forEach((b) => {
        lines.push([
          b.bookingReference || b.bookingId || b.id || '',
          String(b.bookingStatus || b.status || 'PENDING').toUpperCase(),
          b.passengerName || `${b.firstName || ''} ${b.lastName || ''}`.trim(),
          b.email || '',
          b.phone || '',
          getServiceTitle(b.serviceType),
          b.vehicleType || '',
          b.tripType || '',
          b.pickupDate || '',
          b.pickupTime || '',
          b.returnTime || '',
          b.pickupAddress || '',
          b.destinationAddress || '',
          b.mobilityNeeds || '',
          b.passengerCount || 1,
          b.notes || '',
          b.ownerNotes || '',
          b.submissionDate || b.createdAt || ''
        ].map(csvCell).join(','));
      });
      const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cloud-comfort-ride-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    render() {
      const normStatus = (b) => {
        const raw = String((b && (b.bookingStatus || b.status)) || 'Pending').trim().toLowerCase();
        if (raw === 'confirmed') return 'Confirmed';
        if (raw === 'rejected') return 'Rejected';
        if (raw === 'completed') return 'Completed';
        if (raw === 'cancelled' || raw === 'canceled') return 'Cancelled';
        return 'Pending';
      };
      const getRef = (b) => String(b.bookingId || b.bookingReference || b.id || '');
      const getName = (b) => String(b.passengerName || `${b.passengerFirstName || b.firstName || ''} ${b.passengerLastName || b.lastName || ''}`).trim();
      const getPhone = (b) => String(b.contactPhone || b.phone || b.passengerPhone || '');
      const getEmail = (b) => String(b.emailAddress || b.email || b.passengerEmail || '');

      const pendingCount = this._bookings.filter((b) => normStatus(b) === 'Pending').length;
      const confirmedCount = this._bookings.filter((b) => normStatus(b) === 'Confirmed').length;
      const rejectedCount = this._bookings.filter((b) => normStatus(b) === 'Rejected').length;
      const completedCount = this._bookings.filter((b) => normStatus(b) === 'Completed').length;
      const cancelledCount = this._bookings.filter((b) => normStatus(b) === 'Cancelled').length;

      const q = this._search.trim();
      const qLower = q.toLowerCase();
      const qDigits = q.replace(/\D/g, '');
      const filteredBookings = this._bookings.filter((b) => {
        const st = normStatus(b);
        if (this._filter !== 'all' && st !== this._filter) return false;
        if (this._dateFilter && b.pickupDate !== this._dateFilter) return false;
        if (this._serviceFilter && b.serviceType !== this._serviceFilter) return false;
        if (q) {
          const refMatch = getRef(b).toLowerCase().includes(qLower);
          const emailMatch = getEmail(b).toLowerCase().includes(qLower);
          const phoneDigits = getPhone(b).replace(/\D/g, '');
          const phoneMatch = qDigits.length >= 3 && phoneDigits.includes(qDigits);
          const nameMatch = getName(b).toLowerCase().includes(qLower);
          return refMatch || emailMatch || phoneMatch || nameMatch;
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
                  ${[
                    { id: 'bookings', label: `Bookings (${this._bookings.length})` },
                    { id: 'dispatch', label: 'Dispatch' },
                    { id: 'customers', label: 'Customers' },
                    { id: 'drivers', label: `Drivers (${this._drivers.length})` },
                    { id: 'vehicles', label: `Vehicles (${this._vehicles.length})` },
                    { id: 'reports', label: 'Reports & Audit' },
                    { id: 'inquiries', label: `Messages (${this._inquiries.length})` },
                    { id: 'settings', label: 'Settings' }
                  ].map((t) => `
                    <button class="tab-btn ${this._tab === t.id ? 'active' : ''}" data-admin-tab="${t.id}" style="padding:10px 14px;min-height:44px;font-size:14px;">
                      ${t.label}
                    </button>
                  `).join('')}
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                  ${this._user ? `<span class="badge resolved">${escapeHtml(this._user.role || 'SUPER_ADMIN')}</span>` : ''}
                  ${this._tab === 'bookings' || this._tab === 'reports' ? `<button class="dt-button-outline" id="export-csv-btn" ${filteredBookings.length === 0 ? 'disabled' : ''}>⬇ Export CSV</button>` : ''}
                  <button class="dt-button-outline" id="refresh-dispatch" ${this._loading ? 'disabled' : ''}>↻ Refresh</button>
                </div>
              </div>

              ${this._error ? `<div role="alert" style="padding:12px;border-radius:10px;background:#fef2f2;color:#dc2626;font-size:15px;font-weight:700;margin-bottom:16px;">${escapeHtml(this._error)}</div>` : ''}

              ${this._tab === 'bookings' ? `
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
                  ${[
                    { key: 'all', label: 'Total Bookings', count: this._bookings.length, border: '#061f46' },
                    { key: 'Pending', label: 'Pending Requests', count: pendingCount, border: '#d97706' },
                    { key: 'Confirmed', label: 'Confirmed', count: confirmedCount, border: '#16a34a' },
                    { key: 'Rejected', label: 'Rejected', count: rejectedCount, border: '#dc2626' },
                    { key: 'Completed', label: 'Completed', count: completedCount, border: '#2563eb' },
                    { key: 'Cancelled', label: 'Cancelled', count: cancelledCount, border: '#64748b' }
                  ].map((ov) => `
                    <button type="button" data-filter="${ov.key}" style="text-align:left;padding:14px 16px;border-radius:14px;border:1.5px solid ${this._filter === ov.key ? ov.border : 'var(--card-border)'};border-top:4px solid ${ov.border};background:var(--card-bg);color:var(--ink);cursor:pointer;">
                      <span style="display:block;font-size:12px;font-weight:800;text-transform:uppercase;color:var(--muted);">${ov.label}</span>
                      <strong style="font-size:26px;font-weight:900;">${ov.count}</strong>
                    </button>
                  `).join('')}
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:16px;">
                  <input id="d-search" type="text" placeholder="Search Reference (CCR-...), Email, or Phone..." value="${escapeHtml(this._search)}" style="min-height:46px;padding:10px 14px;border-radius:10px;border:1.5px solid var(--card-border);background:var(--card-bg);color:var(--ink);font-size:15px;" />
                  <input id="d-date" type="date" value="${escapeHtml(this._dateFilter)}" style="min-height:46px;padding:10px 14px;border-radius:10px;border:1.5px solid var(--card-border);background:var(--card-bg);color:var(--ink);font-size:15px;" />
                  <select id="d-service" style="min-height:46px;padding:10px 14px;border-radius:10px;border:1.5px solid var(--card-border);background:var(--card-bg);color:var(--ink);font-size:15px;">
                    <option value="">All Services</option>
                    ${Array.from(new Set(this._bookings.map((b) => b.serviceType).filter(Boolean))).map((sv) => `<option value="${escapeHtml(sv)}" ${this._serviceFilter === sv ? 'selected' : ''}>${escapeHtml(getServiceTitle(sv))}</option>`).join('')}
                  </select>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
                  ${[
                    { key: 'all', label: 'All Bookings' },
                    { key: 'Pending', label: 'Pending Requests' },
                    { key: 'Confirmed', label: 'Confirmed Bookings' },
                    { key: 'Rejected', label: 'Rejected Bookings' },
                    { key: 'Completed', label: 'Completed Bookings' },
                    { key: 'Cancelled', label: 'Cancelled Bookings' }
                  ].map((f) => `
                    <button class="tab-btn ${this._filter === f.key ? 'active' : ''}" data-filter="${f.key}" style="padding:8px 16px;min-height:42px;font-size:14px;">
                      ${f.label}
                    </button>
                  `).join('')}
                </div>

                ${filteredBookings.length === 0 ? `
                  <div class="card" style="padding:40px;text-align:center;">
                    <h3>No Matching Bookings Found</h3>
                    <p style="margin-top:8px;">${q ? 'No booking matched that Reference, Email Address, or Phone Number.' : 'No ride requests match the selected section filter.'}</p>
                  </div>
                ` : filteredBookings.map((b) => {
                  const bid = escapeHtml(getRef(b));
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
                          <span class="badge ${st === 'Confirmed' ? 'confirmed' : (st === 'Cancelled' || st === 'Rejected' ? 'cancelled' : (st === 'Completed' ? 'resolved' : 'pending_review'))}">${escapeHtml(st)}</span>
                          <span class="badge ${nStat === 'SENT' ? 'resolved' : (nStat === 'FAILED' ? 'cancelled' : 'pending_review')}">Notify: ${escapeHtml(nStat)}</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;">
                          <button class="dt-button-outline" data-view="${bid}" style="min-height:42px;padding:6px 12px;font-size:14px;">👁 View Details</button>
                          <button class="dt-button-outline" data-edit="${bid}" style="min-height:42px;padding:6px 12px;font-size:14px;">✎ Edit Booking</button>
                          ${st !== 'Confirmed' ? `<button class="dt-button" data-approve="${bid}" style="min-height:42px;padding:6px 14px;font-size:14px;">✓ Confirm Booking</button>` : ''}
                          ${st !== 'Rejected' ? `<button class="dt-button-outline" data-reject-modal="${bid}" style="min-height:42px;padding:6px 12px;font-size:14px;border-color:#dc2626;color:#dc2626;">✕ Reject Booking</button>` : ''}
                          ${st !== 'Cancelled' ? `<button class="dt-button-outline" data-cancel="${bid}" style="min-height:42px;padding:6px 12px;font-size:14px;">Cancel Booking</button>` : ''}
                          <a class="dt-button-outline" href="${routeUrl}" target="_blank" rel="noopener noreferrer" style="min-height:42px;padding:6px 12px;font-size:14px;">📍 Map ↗</a>
                        </div>
                      </div>
                      <div class="meta-grid">
                        <div><span>Passenger</span><strong>${escapeHtml(getName(b))}</strong></div>
                        <div><span>Phone</span><a href="tel:${escapeHtml(getPhone(b))}" style="text-decoration:underline;font-weight:700;">${escapeHtml(getPhone(b))}</a></div>
                        <div><span>Email</span><a href="mailto:${escapeHtml(getEmail(b))}" style="text-decoration:underline;font-weight:700;">${escapeHtml(getEmail(b))}</a></div>
                        <div><span>Service</span><strong>${escapeHtml(b.serviceTitle || getServiceTitle(b.serviceType))}</strong></div>
                        <div><span>Vehicle</span><strong>${escapeHtml(b.vehicleOption || b.vehiclePreference || 'best_match')}</strong></div>
                        <div><span>Pickup Date &amp; Time</span><strong>${escapeHtml(b.pickupDate)} at ${escapeHtml(b.pickupTime)}${b.estimatedReturnTime || b.returnTime ? ` (Return ${escapeHtml(b.estimatedReturnTime || b.returnTime)})` : ''}</strong></div>
                        <div><span>Pickup Address</span><strong>${escapeHtml(b.pickupAddress)}</strong></div>
                        <div><span>Destination</span><strong>${escapeHtml(b.facilityName ? `${b.facilityName} — ${b.destinationAddress}` : b.destinationAddress)}</strong></div>
                      </div>
                      ${b.rejectionReason && st === 'Rejected' ? `<div style="font-size:15px;padding:10px 14px;background:#fef2f2;color:#991b1b;border-radius:10px;margin-bottom:10px;"><strong>Rejection Reason:</strong> ${escapeHtml(b.rejectionReason)}</div>` : ''}
                      ${b.specialInstructions ? `<div style="font-size:15px;padding:10px 14px;background:var(--surface-alt);border-radius:10px;margin-bottom:10px;"><strong>Notes:</strong> ${escapeHtml(b.specialInstructions)}</div>` : ''}
                      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
                        <input type="text" data-notes-for="${bid}" placeholder="Internal owner/dispatch notes..." value="${escapeHtml(b.ownerNotes || '')}" style="flex:1;min-width:220px;min-height:44px;padding:8px 12px;border-radius:10px;border:1.5px solid var(--card-border);background:var(--surface-alt);color:var(--ink);font-size:15px;" />
                      </div>
                    </div>
                  `;
                }).join('')}
              ` : this._tab === 'dispatch' ? `
                <h2 style="font-size:22px;font-weight:800;margin-bottom:14px;">Dispatch &amp; Driver/Vehicle Assignment (RideOperations)</h2>
                ${this._bookings.filter((b) => normStatus(b) === 'Confirmed' || normStatus(b) === 'Pending').map((b) => {
                  const bid = escapeHtml(getRef(b));
                  return `
                    <div class="item-card">
                      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;margin-bottom:10px;">
                        <strong>${bid} — ${escapeHtml(getName(b))} (${escapeHtml(b.pickupDate)} ${escapeHtml(b.pickupTime)})</strong>
                        <span class="badge ${normStatus(b) === 'Confirmed' ? 'confirmed' : 'pending_review'}">${escapeHtml(b.dispatchStatus || normStatus(b))}</span>
                      </div>
                      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;align-items:end;">
                        <div><label style="font-size:12px;font-weight:700;">Driver ID / Name</label><input type="text" data-driver-for="${bid}" value="${escapeHtml(b.driverId || '')}" placeholder="Assign driver..." style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--card-border);" /></div>
                        <div><label style="font-size:12px;font-weight:700;">Vehicle ID / Unit</label><input type="text" data-vehicle-for="${bid}" value="${escapeHtml(b.vehicleId || b.vehicleOption || '')}" placeholder="Assign vehicle..." style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--card-border);" /></div>
                        <div><label style="font-size:12px;font-weight:700;">Dispatch Status</label>
                          <select data-dstatus-for="${bid}" style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--card-border);">
                            ${['Unassigned', 'Assigned', 'En Route', 'On Scene', 'Completed'].map((ds) => `<option value="${ds}" ${(b.dispatchStatus || '') === ds ? 'selected' : ''}>${ds}</option>`).join('')}
                          </select>
                        </div>
                        <button class="dt-button" data-assign="${bid}" style="min-height:42px;">Save Assignment</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              ` : this._tab === 'customers' ? `
                <h2 style="font-size:22px;font-weight:800;margin-bottom:14px;">Customer Directory</h2>
                ${Array.from(new Map(this._bookings.map((b) => [getEmail(b) || getPhone(b) || getRef(b), b])).values()).map((c) => `
                  <div class="item-card">
                    <div class="meta-grid">
                      <div><span>Customer</span><strong>${escapeHtml(getName(c))}</strong></div>
                      <div><span>Email</span><strong>${escapeHtml(getEmail(c))}</strong></div>
                      <div><span>Phone</span><strong>${escapeHtml(getPhone(c))}</strong></div>
                      <div><span>Latest Booking</span><strong>${escapeHtml(getRef(c))} (${escapeHtml(normStatus(c))})</strong></div>
                    </div>
                  </div>
                `).join('')}
              ` : this._tab === 'drivers' ? `
                <h2 style="font-size:22px;font-weight:800;margin-bottom:14px;">Drivers (${this._drivers.length})</h2>
                ${this._drivers.length === 0 ? `<div class="card" style="padding:28px;"><p>No records in <code>Drivers</code> CMS collection yet. Add drivers in Wix CMS or assign Driver IDs directly in the Dispatch tab.</p></div>` : this._drivers.map((d) => `<div class="item-card"><strong>${escapeHtml(d.name || d.title || d._id)}</strong> — ${escapeHtml(d.phone || d.status || '')}</div>`).join('')}
              ` : this._tab === 'vehicles' ? `
                <h2 style="font-size:22px;font-weight:800;margin-bottom:14px;">Fleet Vehicles (${this._vehicles.length})</h2>
                ${this._vehicles.length === 0 ? `<div class="card" style="padding:28px;"><p>No records in <code>Vehicles</code> CMS collection yet. Add vehicles in Wix CMS or assign Vehicle IDs directly in the Dispatch tab.</p></div>` : this._vehicles.map((v) => `<div class="item-card"><strong>${escapeHtml(v.name || v.title || v._id)}</strong> — ${escapeHtml(v.type || v.status || '')}</div>`).join('')}
              ` : this._tab === 'reports' ? `
                <h2 style="font-size:22px;font-weight:800;margin-bottom:14px;">Reports &amp; Audit History</h2>
                <div class="item-card">
                  <div class="meta-grid">
                    <div><span>Total Bookings</span><strong>${this._bookings.length}</strong></div>
                    <div><span>Pending</span><strong>${pendingCount}</strong></div>
                    <div><span>Confirmed</span><strong>${confirmedCount}</strong></div>
                    <div><span>Wix Bookings Synced</span><strong>${this._wixBookingsCount}</strong></div>
                  </div>
                </div>
                <h3 style="font-size:18px;font-weight:800;margin:18px 0 10px;">Recent Admin Audit Logs (${this._auditLogs.length})</h3>
                ${this._auditLogs.length === 0 ? `<div class="card" style="padding:24px;"><p>No audit log records yet (provision <code>AdminAuditLogs</code> in Wix CMS to persist audit history).</p></div>` : this._auditLogs.slice(0, 30).map((log) => `
                  <div class="item-card" style="padding:14px;">
                    <strong>${escapeHtml(log.action)}</strong> — Target: <code>${escapeHtml(log.targetId)}</code> • By: ${escapeHtml(log.actor)} • ${escapeHtml(log.createdAt)}
                    ${log.details ? `<div style="font-size:14px;color:var(--muted);margin-top:4px;">${escapeHtml(log.details)}</div>` : ''}
                  </div>
                `).join('')}
              ` : this._tab === 'settings' ? `
                <h2 style="font-size:22px;font-weight:800;margin-bottom:14px;">Admin &amp; Wix Bookings Integration Settings</h2>
                <div class="item-card">
                  <div class="meta-grid">
                    <div><span>Signed-In User</span><strong>${escapeHtml((this._user && this._user.name) || 'Administrator')}</strong></div>
                    <div><span>RBAC Role</span><strong>${escapeHtml((this._user && this._user.role) || 'SUPER_ADMIN')}</strong></div>
                    <div><span>Wix Bookings Loaded</span><strong>${this._wixBookingsCount}</strong></div>
                    <div><span>Import 1 Records</span><strong>${this._bookings.length}</strong></div>
                  </div>
                  <p style="font-size:14px;line-height:1.6;">Configure <code>CCR_DISPATCH_PIN</code>, <code>CCR_SESSION_SECRET</code>, <code>CCR_ADMIN_USERS_JSON</code>, and email secrets in Wix Dashboard → Developer Tools → Secrets Manager.</p>
                </div>
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

        ${this._detailBooking ? `
          <div style="position:fixed;inset:0;z-index:70;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;padding:16px;">
            <div style="background:var(--card-bg);color:var(--ink);max-width:680px;width:100%;border-radius:18px;padding:24px;border:2px solid #f3bf28;max-height:90vh;overflow:auto;">
              <h3 style="font-size:22px;font-weight:800;margin-bottom:12px;">Booking Details — ${escapeHtml(getRef(this._detailBooking))}</h3>
              <div class="meta-grid">
                <div><span>Status</span><strong>${escapeHtml(normStatus(this._detailBooking))}</strong></div>
                <div><span>Passenger</span><strong>${escapeHtml(getName(this._detailBooking))}</strong></div>
                <div><span>Phone</span><strong>${escapeHtml(getPhone(this._detailBooking))}</strong></div>
                <div><span>Email</span><strong>${escapeHtml(getEmail(this._detailBooking))}</strong></div>
                <div><span>Service</span><strong>${escapeHtml(this._detailBooking.serviceTitle || getServiceTitle(this._detailBooking.serviceType))}</strong></div>
                <div><span>Vehicle</span><strong>${escapeHtml(this._detailBooking.vehicleOption || 'best_match')}</strong></div>
                <div><span>Pickup Date &amp; Time</span><strong>${escapeHtml(this._detailBooking.pickupDate)} ${escapeHtml(this._detailBooking.pickupTime)}</strong></div>
                <div><span>Return Time</span><strong>${escapeHtml(this._detailBooking.estimatedReturnTime || 'N/A')}</strong></div>
                <div><span>Pickup Address</span><strong>${escapeHtml(this._detailBooking.pickupAddress)}</strong></div>
                <div><span>Destination</span><strong>${escapeHtml(this._detailBooking.destinationAddress)}</strong></div>
                <div><span>Mobility</span><strong>${escapeHtml(this._detailBooking.mobilityRequirements || 'ambulatory')}</strong></div>
                <div><span>Updated At</span><strong>${escapeHtml(this._detailBooking.updatedAt || this._detailBooking.createdAt || '')}</strong></div>
              </div>
              <div style="display:flex;justify-content:flex-end;margin-top:16px;">
                <button class="dt-button" id="close-detail-modal">Close</button>
              </div>
            </div>
          </div>
        ` : ''}

        ${this._rejectBooking ? `
          <div style="position:fixed;inset:0;z-index:70;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;padding:16px;">
            <form id="reject-modal-form" style="background:var(--card-bg);color:var(--ink);max-width:520px;width:100%;border-radius:18px;padding:24px;border:2px solid #dc2626;">
              <h3 style="font-size:20px;font-weight:800;margin-bottom:8px;">Reject Booking ${escapeHtml(getRef(this._rejectBooking))}</h3>
              <p style="font-size:15px;margin-bottom:12px;">Optionally enter a reason for rejecting this booking (saved to CMS &amp; included in customer notice):</p>
              <textarea id="reject-reason-input" rows="3" placeholder="e.g., No wheelchair van available at requested time" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--card-border);background:var(--surface-alt);color:var(--ink);font-size:15px;margin-bottom:14px;"></textarea>
              <div style="display:flex;justify-content:flex-end;gap:10px;">
                <button type="button" class="dt-button-outline" id="cancel-reject-modal">Cancel</button>
                <button type="submit" class="dt-button" style="background:#dc2626;color:#fff;">Confirm Rejection</button>
              </div>
            </form>
          </div>
        ` : ''}

        ${this._editBooking ? `
          <div style="position:fixed;inset:0;z-index:70;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;padding:16px;">
            <form id="edit-modal-form" style="background:var(--card-bg);color:var(--ink);max-width:600px;width:100%;border-radius:18px;padding:24px;border:2px solid #f3bf28;max-height:90vh;overflow:auto;">
              <h3 style="font-size:20px;font-weight:800;margin-bottom:12px;">Edit Booking ${escapeHtml(getRef(this._editBooking))}</h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                <div><label style="font-size:13px;font-weight:700;">Pickup Date</label><input id="ed-date" type="date" value="${escapeHtml(this._editBooking.pickupDate || '')}" style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--card-border);" /></div>
                <div><label style="font-size:13px;font-weight:700;">Pickup Time</label><input id="ed-time" type="text" value="${escapeHtml(this._editBooking.pickupTime || '')}" style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--card-border);" /></div>
                <div><label style="font-size:13px;font-weight:700;">Return Time</label><input id="ed-return" type="text" value="${escapeHtml(this._editBooking.estimatedReturnTime || '')}" style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--card-border);" /></div>
                <div><label style="font-size:13px;font-weight:700;">Status</label>
                  <select id="ed-status" style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--card-border);">
                    ${['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'].map((s) => `<option value="${s}" ${normStatus(this._editBooking) === s ? 'selected' : ''}>${s}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div style="margin-bottom:10px;"><label style="font-size:13px;font-weight:700;">Pickup Address</label><input id="ed-pickup" type="text" value="${escapeHtml(this._editBooking.pickupAddress || '')}" style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--card-border);" /></div>
              <div style="margin-bottom:10px;"><label style="font-size:13px;font-weight:700;">Destination Address</label><input id="ed-dest" type="text" value="${escapeHtml(this._editBooking.destinationAddress || '')}" style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--card-border);" /></div>
              <div style="margin-bottom:14px;"><label style="font-size:13px;font-weight:700;">Owner Notes</label><input id="ed-notes" type="text" value="${escapeHtml(this._editBooking.ownerNotes || '')}" style="width:100%;padding:8px;border-radius:8px;border:1.5px solid var(--card-border);" /></div>
              <div style="display:flex;justify-content:flex-end;gap:10px;">
                <button type="button" class="dt-button-outline" id="cancel-edit-modal">Cancel</button>
                <button type="submit" class="dt-button">Save Changes</button>
              </div>
            </form>
          </div>
        ` : ''}
      `;

      const loginForm = this.shadowRoot.getElementById('dispatch-login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const pinInput = /** @type {HTMLInputElement | null} */ (this.shadowRoot.getElementById('dispatch-pin'));
          this._login(pinInput ? pinInput.value : '');
        });
      }

      const refBtn = this.shadowRoot.getElementById('refresh-dispatch');
      const exportBtn = this.shadowRoot.getElementById('export-csv-btn');
      this.shadowRoot.querySelectorAll('[data-admin-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this._tab = btn.getAttribute('data-admin-tab') || 'bookings';
          this.render();
        });
      });
      if (refBtn) refBtn.addEventListener('click', () => this._login(this._pin));
      if (exportBtn) exportBtn.addEventListener('click', () => this._exportBookingsCsv(filteredBookings));

      this.shadowRoot.querySelectorAll('[data-assign]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-assign');
          const dEl = /** @type {HTMLInputElement | null} */ (this.shadowRoot.querySelector(`[data-driver-for="${id}"]`));
          const vEl = /** @type {HTMLInputElement | null} */ (this.shadowRoot.querySelector(`[data-vehicle-for="${id}"]`));
          const sEl = /** @type {HTMLSelectElement | null} */ (this.shadowRoot.querySelector(`[data-dstatus-for="${id}"]`));
          this._loading = true;
          this.render();
          this.dispatchEvent(new CustomEvent('assignDispatch', {
            detail: {
              pin: this._pin,
              token: this._token || this._pin,
              bookingId: id,
              driverId: dEl ? dEl.value : '',
              vehicleId: vEl ? vEl.value : '',
              dispatchStatus: sEl ? sEl.value : 'Assigned'
            },
            bubbles: true,
            composed: true
          }));
        });
      });

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
          this._setBookingStatus(id, 'Confirmed', getNotes(id));
        });
      });
      this.shadowRoot.querySelectorAll('[data-cancel]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-cancel');
          this._setBookingStatus(id, 'Cancelled', getNotes(id));
        });
      });
      this.shadowRoot.querySelectorAll('[data-view]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-view');
          this._detailBooking = this._bookings.find((b) => getRef(b) === id) || null;
          this.render();
        });
      });
      this.shadowRoot.querySelectorAll('[data-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-edit');
          this._editBooking = this._bookings.find((b) => getRef(b) === id) || null;
          this.render();
        });
      });
      this.shadowRoot.querySelectorAll('[data-reject-modal]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-reject-modal');
          this._rejectBooking = this._bookings.find((b) => getRef(b) === id) || null;
          this.render();
        });
      });
      const closeDetail = this.shadowRoot.getElementById('close-detail-modal');
      if (closeDetail) closeDetail.addEventListener('click', () => { this._detailBooking = null; this.render(); });
      const cancelReject = this.shadowRoot.getElementById('cancel-reject-modal');
      if (cancelReject) cancelReject.addEventListener('click', () => { this._rejectBooking = null; this.render(); });
      const rejectForm = this.shadowRoot.getElementById('reject-modal-form');
      if (rejectForm && this._rejectBooking) {
        rejectForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const inp = /** @type {HTMLTextAreaElement | null} */ (this.shadowRoot.getElementById('reject-reason-input'));
          const id = getRef(this._rejectBooking);
          this._rejectBooking = null;
          this._setBookingStatus(id, 'Rejected', inp ? inp.value : '');
        });
      }
      const cancelEdit = this.shadowRoot.getElementById('cancel-edit-modal');
      if (cancelEdit) cancelEdit.addEventListener('click', () => { this._editBooking = null; this.render(); });
      const editForm = this.shadowRoot.getElementById('edit-modal-form');
      if (editForm && this._editBooking) {
        editForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const val = (id) => {
            const el = /** @type {HTMLInputElement | HTMLSelectElement | null} */ (this.shadowRoot.getElementById(id));
            return el ? el.value : '';
          };
          const id = getRef(this._editBooking);
          this._editBooking = null;
          this._loading = true;
          this.render();
          this.dispatchEvent(new CustomEvent('editBooking', {
            detail: {
              pin: this._pin,
              token: this._token || this._pin,
              bookingId: id,
              updates: {
                pickupDate: val('ed-date'),
                pickupTime: val('ed-time'),
                estimatedReturnTime: val('ed-return'),
                bookingStatus: val('ed-status'),
                pickupAddress: val('ed-pickup'),
                destinationAddress: val('ed-dest'),
                ownerNotes: val('ed-notes')
              }
            },
            bubbles: true,
            composed: true
          }));
        });
      }
      this.shadowRoot.querySelectorAll('[data-resolve]').forEach((btn) => {
        btn.addEventListener('click', () => this._resolveInquiry(btn.getAttribute('data-resolve')));
      });
    }
  }

  if (!customElements.get('ccr-dispatch-page')) {
    customElements.define('ccr-dispatch-page', CcrDispatchPage);
  }
}
