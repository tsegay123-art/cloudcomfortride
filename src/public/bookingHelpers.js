import { getServiceTitle } from './companyData';

export const BOOKING_STORAGE_KEY = 'cloud_comfort_bookings';
export const INQUIRY_STORAGE_KEY = 'cloud_comfort_inquiries';
export const THEME_STORAGE_KEY = 'cloud_comfort_theme';

export function getTomorrowDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export function validateBookingPayload(data) {
  const errors = {};
  if (!data.serviceType || data.serviceType === 'choose_service') {
    errors.serviceType = 'Please choose a service from the options';
  }
  if (!data.firstName || !String(data.firstName).trim()) {
    errors.firstName = 'First name is required';
  }
  if (!data.lastName || !String(data.lastName).trim()) {
    errors.lastName = 'Last name is required';
  }
  const phoneDigits = String(data.phone || '').replace(/\D/g, '');
  if (!data.phone || !String(data.phone).trim()) {
    errors.phone = 'Contact telephone is required';
  } else if (phoneDigits.length < 10) {
    errors.phone = 'Please provide a valid 10-digit telephone number';
  }
  if (!data.email || !String(data.email).trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
    errors.email = 'Please provide a valid email address';
  }
  if (!data.pickupDate) {
    errors.pickupDate = 'Pickup date is required';
  } else {
    const todayStr = new Date().toISOString().split('T')[0];
    if (String(data.pickupDate) < todayStr) {
      errors.pickupDate = 'Pickup date cannot be in the past';
    }
  }
  if (!data.pickupTime) errors.pickupTime = 'Pickup time is required';
  if (data.tripType === 'round_trip' && !data.returnTime) {
    errors.returnTime = 'Estimated return time is required for round trips';
  }
  if (!data.pickupAddress || !String(data.pickupAddress).trim()) {
    errors.pickupAddress = 'Pickup street address is required';
  }
  if (!data.destinationAddress || !String(data.destinationAddress).trim()) {
    errors.destinationAddress = 'Destination clinic or address is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateContactPayload(data) {
  const errors = {};
  if (!data.name || !String(data.name).trim()) {
    errors.name = 'Full name is required';
  }
  if (!data.email || !String(data.email).trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
    errors.email = 'Please provide a valid email address';
  }
  if (data.phone && String(data.phone).trim()) {
    const phoneDigits = String(data.phone).replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      errors.phone = 'Please provide a valid 10-digit telephone number';
    }
  }
  if (!data.message || !String(data.message).trim()) {
    errors.message = 'Please enter a message for our dispatch team';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function getLocalBookings() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(BOOKING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalBooking(booking) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const list = getLocalBookings().filter((b) => b.id !== booking.id);
    window.localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify([booking, ...list]));
  } catch (e) {
    // Ignore storage quota errors
  }
}

export function removeLocalBooking(bookingId) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const updated = getLocalBookings().filter((b) => b.id !== bookingId);
    window.localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function formatMobilityLabel(level) {
  switch (level) {
    case 'ambulatory':
      return 'Ambulatory (Standard Seat)';
    case 'wheelchair_standard':
      return 'Manual Wheelchair (Lift / Ramp)';
    case 'wheelchair_motorized':
      return 'Motorized / Power Wheelchair';
    case 'walker':
      return 'Walker / Rollator Assistance';
    case 'bedside_transfer':
      return 'Bedside / Hospital Discharge Escort';
    default:
      return level || 'Ambulatory';
  }
}

export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildVoucherMarkup(booking) {
  const ref = escapeHtml(booking.bookingReference || booking.bookingId || booking.id);
  const serviceTitle = escapeHtml(getServiceTitle(booking.serviceType));
  const tripLabel = booking.tripType === 'round_trip' ? 'Round Trip' : 'One-Way';
  const statusLabel = escapeHtml(String(booking.bookingStatus || booking.status || 'PENDING').replace('_', ' ').toUpperCase());
  const pName = escapeHtml(booking.passengerName || `${booking.firstName || ''} ${booking.lastName || ''}`.trim());
  const pPhone = escapeHtml(booking.phone || booking.passengerPhone);
  const mobility = escapeHtml(formatMobilityLabel(booking.mobilityRequirement || booking.mobilityNeed));
  const hasComp = Boolean(booking.companionRequired ?? booking.hasCompanion);
  return `
    <div class="voucher-card">
      <div class="voucher-head">
        <div>
          <div class="voucher-eyebrow">Cloud Comfort Ride • Transportation Request Voucher</div>
          <h3>Booking Reference: ${ref}</h3>
        </div>
        <span class="voucher-status">${statusLabel}</span>
      </div>
      <div class="voucher-grid">
        <div><span>Passenger</span><strong>${pName}</strong></div>
        <div><span>Phone</span><strong>${pPhone}</strong></div>
        <div><span>Service Type</span><strong>${serviceTitle}</strong></div>
        <div><span>Trip Mode</span><strong>${tripLabel}</strong></div>
        <div><span>Pickup Date & Time</span><strong>${escapeHtml(booking.pickupDate)} at ${escapeHtml(booking.pickupTime)}</strong></div>
        ${booking.returnTime ? `<div><span>Estimated Return</span><strong>${escapeHtml(booking.returnTime)}</strong></div>` : ''}
        <div><span>Pickup Address</span><strong>${escapeHtml(booking.pickupAddress)}</strong></div>
        <div><span>Destination</span><strong>${escapeHtml(booking.facilityName ? `${booking.facilityName} — ${booking.destinationAddress}` : booking.destinationAddress)}</strong></div>
        <div><span>Mobility Need</span><strong>${mobility}</strong></div>
        <div><span>Companion / Stairs</span><strong>${hasComp ? `${booking.companionCount || 1} Companion` : 'No Companion'} • ${booking.hasStairs ? 'Stairs Present' : 'Step-Free / Ramp'}</strong></div>
      </div>
      ${booking.specialInstructions ? `<div class="voucher-notes"><strong>Special Instructions:</strong> ${escapeHtml(booking.specialInstructions)}</div>` : ''}
      <div class="voucher-foot">
        Seattle Dispatch: (206) 327-4411 • 1902 E Yesler Way Unit #4, Seattle, WA 98122 • info@cloudmedicaltrans.com
      </div>
    </div>
  `;
}

