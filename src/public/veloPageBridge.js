import wixLocationFrontend from 'wix-location-frontend';
import { session } from 'wix-storage-frontend';
import { submitBooking, searchBookings, cancelBooking } from 'backend/bookingService.jsw';
import { submitInquiry } from 'backend/contactService.jsw';

export const SELECTED_SERVICE_KEY = 'ccr_selected_service';

function getElement(selector) {
  try {
    return $w(selector);
  } catch (e) {
    return null;
  }
}

export function setElementAttribute(selector, name, value) {
  const el = /** @type {any} */ (getElement(selector));
  if (el && typeof el.setAttribute === 'function') {
    el.setAttribute(name, value);
  }
}

export function wireHeaderElement(selector, currentPath) {
  setElementAttribute(selector, 'current-path', currentPath);
  wireNavigationElement(selector);
}

export function wireLegalElement(selector, mode) {
  setElementAttribute(selector, 'mode', mode);
}

export function wireNavigationElement(selector) {
  const el = /** @type {any} */ (getElement(selector));
  if (!el || typeof el.on !== 'function') return;
  el.on('navigate', (event) => {
    const detail = (event && event.detail) || {};
    if (detail.serviceId) {
      session.setItem(SELECTED_SERVICE_KEY, detail.serviceId);
    }
    if (detail.path) {
      wixLocationFrontend.to(detail.path);
    }
  });
}

export function wireBookingElement(selector) {
  const el = /** @type {any} */ (getElement(selector));
  if (!el || typeof el.on !== 'function') return;

  const preselected = session.getItem(SELECTED_SERVICE_KEY);
  if (preselected && typeof el.setAttribute === 'function') {
    el.setAttribute('initial-service', preselected);
    session.removeItem(SELECTED_SERVICE_KEY);
  }

  el.on('submitBooking', async (event) => {
    const detail = (event && event.detail) || {};
    try {
      const result = await submitBooking(detail.payload);
      if (result && result.success && result.booking) {
        setElementAttribute(selector, 'booking-error', '');
        setElementAttribute(selector, 'booking-result', JSON.stringify(result.booking));
      } else {
        const msg = (result && result.message) || 'Please check your booking details.';
        setElementAttribute(selector, 'booking-error', msg);
      }
    } catch (err) {
      setElementAttribute(selector, 'booking-error', 'Unable to reach dispatch server. Please call (206) 327-4411.');
    }
  });
}

export function wireContactElement(selector) {
  const el = /** @type {any} */ (getElement(selector));
  if (!el || typeof el.on !== 'function') return;
  el.on('submitContact', async (event) => {
    const detail = (event && event.detail) || {};
    try {
      const result = await submitInquiry(detail.payload);
      if (result && result.success) {
        setElementAttribute(selector, 'contact-error', '');
        setElementAttribute(selector, 'contact-result', JSON.stringify(result.inquiry || { ok: true }));
      } else {
        const msg = (result && result.message) || 'Please check your inquiry details.';
        setElementAttribute(selector, 'contact-error', msg);
      }
    } catch (err) {
      setElementAttribute(selector, 'contact-error', 'Failed to send message. Please call (206) 327-4411.');
    }
  });
}

export async function wireMyBookingsElement(selector) {
  const el = /** @type {any} */ (getElement(selector));
  if (!el || typeof el.on !== 'function') return;
  wireNavigationElement(selector);

  el.on('removeBooking', async (event) => {
    const detail = (event && event.detail) || {};
    if (detail.bookingId) {
      try {
        await cancelBooking(detail.bookingId);
      } catch (e) {
        // Local storage removal still proceeds in the custom element
      }
    }
  });

  try {
    const res = await searchBookings('CCR-');
    if (res && res.success && Array.isArray(res.items)) {
      const activeItems = res.items.filter((item) => item.status !== 'cancelled');
      setElementAttribute(selector, 'server-bookings', JSON.stringify(activeItems));
    }
  } catch (e) {
    // Local storage fallback handled inside custom element
  }
}
