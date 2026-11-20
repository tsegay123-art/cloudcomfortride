import wixLocationFrontend from 'wix-location-frontend';
import wixSiteFrontend from 'wix-site-frontend';
import wixSeoFrontend from 'wix-seo-frontend';
import { session } from 'wix-storage-frontend';
import { submitBooking, searchBookings, cancelBooking, requestBookingConfirmation } from 'backend/bookingService.jsw';
import { submitInquiry } from 'backend/contactService.jsw';
import { COMPANY_INFO } from './companyData';

export const SELECTED_SERVICE_KEY = 'ccr_selected_service';

const ROUTE_ALIASES = {
  '/': { urls: ['/'], names: ['home'] },
  '/about': { urls: ['/about', '/about-us'], names: ['about us', 'about'] },
  '/about-us': { urls: ['/about', '/about-us'], names: ['about us', 'about'] },
  '/services': { urls: ['/services'], names: ['services'] },
  '/safety-drivers': { urls: ['/safety-drivers', '/why-cloud-medical', '/why-cloud-comfort-ride', '/fleet'], names: ['why cloud comfort ride', 'why cloud medical', 'fleet', 'safety'] },
  '/fleet': { urls: ['/safety-drivers', '/why-cloud-medical', '/why-cloud-comfort-ride', '/fleet'], names: ['why cloud comfort ride', 'why cloud medical', 'fleet', 'safety'] },
  '/why-cloud-medical': { urls: ['/safety-drivers', '/why-cloud-medical', '/why-cloud-comfort-ride', '/fleet'], names: ['why cloud comfort ride', 'why cloud medical', 'fleet', 'safety'] },
  '/book-a-ride': { urls: ['/book-a-ride', '/book-online', '/book-ride'], names: ['book a ride', 'book online', 'book ride', 'schedule'] },
  '/book-online': { urls: ['/book-a-ride', '/book-online', '/book-ride'], names: ['book a ride', 'book online', 'book ride', 'schedule'] },
  '/my-bookings': { urls: ['/my-bookings', '/my-booking'], names: ['my bookings', 'my booking'] },
  '/contact': { urls: ['/contact', '/contact-us'], names: ['contact'] },
  '/privacy': { urls: ['/privacy', '/privacy-policy'], names: ['privacy policy', 'privacy'] },
  '/terms': { urls: ['/terms', '/terms-of-service'], names: ['terms of service', 'terms'] },
  '/accessibility': { urls: ['/accessibility', '/accessibility-statement'], names: ['accessibility statement', 'accessibility'] }
};

function resolveWixRoute(requestedPath) {
  const clean = String(requestedPath || '/').split('?')[0].replace(/\/+$/, '') || '/';
  try {
    const structure = wixSiteFrontend.getSiteStructure();
    const pages = (structure && Array.isArray(structure.pages)) ? structure.pages : [];
    if (!pages.length) return clean;

    const normUrl = (u) => `/${String(u || '').replace(/^\/+|\/+$/g, '')}`;
    if (clean === '/') {
      const home = pages.find((p) => p.isHomePage);
      return home && home.url ? normUrl(home.url) : '/';
    }

    const exact = pages.find((p) => normUrl(p.url) === clean);
    if (exact && exact.url) return normUrl(exact.url);

    const rule = ROUTE_ALIASES[clean];
    if (rule) {
      const byAliasUrl = pages.find((p) => rule.urls.includes(normUrl(p.url)));
      if (byAliasUrl && byAliasUrl.url) return normUrl(byAliasUrl.url);

      const byName = pages.find((p) => {
        const pname = String(p.name || '').toLowerCase();
        if ((clean === '/book-a-ride' || clean === '/book-online') && pname.includes('my booking')) {
          return false;
        }
        return rule.names.some((n) => pname.includes(n));
      });
      if (byName && byName.url) return normUrl(byName.url);
    }

    if (clean === '/book-a-ride' || clean === '/book-online') {
      const home = pages.find((p) => p.isHomePage);
      const homeUrl = home && home.url ? normUrl(home.url) : '/';
      return `${homeUrl}?book=1#request`;
    }
  } catch (e) {
    // Fallback to requested path if site structure is unavailable
  }
  return clean;
}

function buildRouteMap() {
  const keys = ['/', '/services', '/about', '/safety-drivers', '/book-a-ride', '/my-bookings', '/contact', '/privacy', '/terms', '/accessibility'];
  const map = {};
  keys.forEach((k) => {
    map[k] = resolveWixRoute(k);
  });
  return map;
}

function getElement(selector) {
  try {
    return $w(selector);
  } catch (e) {
    return null;
  }
}

function resolveElementOrFallback(selector) {
  const direct = getElement(selector);
  if (direct && typeof /** @type {any} */ (direct).on === 'function') {
    return direct;
  }
  try {
    const all = /** @type {any} */ ($w('CustomElement'));
    if (Array.isArray(all) && all.length) {
      return all.find((item) => item && item.id !== 'ccrHeader' && item.id !== 'ccrFooter') || all[0];
    }
    if (all && typeof all.on === 'function') return all;
  } catch (e) {
    // Ignore
  }
  return direct;
}

export function applyBusinessSeo() {
  try {
    wixSeoFrontend.setStructuredData([
      {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        name: COMPANY_INFO.brandName,
        alternateName: 'Cloud Medical Transportation',
        url: COMPANY_INFO.website,
        sameAs: [COMPANY_INFO.legacyWebsite],
        telephone: COMPANY_INFO.phoneRaw,
        email: COMPANY_INFO.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '1902 E Yesler Way Unit #4',
          addressLocality: 'Seattle',
          addressRegion: 'WA',
          postalCode: '98122',
          addressCountry: 'US'
        },
        areaServed: COMPANY_INFO.serviceAreas,
        openingHours: 'Mo-Su 06:00-20:00'
      }
    ]);
  } catch (e) {
    // Ignore if SEO API is unavailable in preview
  }
}

export function setElementAttribute(selector, name, value) {
  const el = /** @type {any} */ (resolveElementOrFallback(selector));
  if (el && typeof el.setAttribute === 'function') {
    el.setAttribute(name, value);
  }
}

export function wireHeaderElement(selector, currentPath) {
  setElementAttribute(selector, 'current-path', currentPath);
  setElementAttribute(selector, 'route-map', JSON.stringify(buildRouteMap()));
  wireNavigationElement(selector);
}

export function wireAllMasterCustomElements(currentPath) {
  applyBusinessSeo();
  const routeMapJson = JSON.stringify(buildRouteMap());
  const wired = new Set();

  const wireOne = (el) => {
    if (!el || wired.has(el)) return;
    wired.add(el);
    if (typeof el.setAttribute === 'function') {
      el.setAttribute('current-path', currentPath);
      el.setAttribute('route-map', routeMapJson);
    }
    if (typeof el.on === 'function') {
      el.on('navigate', (event) => {
        const detail = (event && event.detail) || {};
        if (detail.serviceId) {
          session.setItem(SELECTED_SERVICE_KEY, detail.serviceId);
        }
        if (detail.path) {
          wixLocationFrontend.to(resolveWixRoute(detail.path));
        }
      });
    }
  };

  ['#ccrHeader', '#ccrFooter'].forEach((sel) => wireOne(getElement(sel)));
  try {
    const allCustom = /** @type {any} */ ($w('CustomElement'));
    if (Array.isArray(allCustom)) {
      allCustom.forEach(wireOne);
    } else if (allCustom && typeof allCustom.forEach === 'function') {
      allCustom.forEach(wireOne);
    } else {
      wireOne(allCustom);
    }
  } catch (e) {
    // Ignore if selector is unavailable
  }
}

export function wireLegalElement(selector, mode) {
  setElementAttribute(selector, 'mode', mode);
}

export function wireNavigationElement(selector) {
  const el = /** @type {any} */ (resolveElementOrFallback(selector));
  if (!el || typeof el.on !== 'function') return;
  if (typeof el.setAttribute === 'function') {
    el.setAttribute('route-map', JSON.stringify(buildRouteMap()));
  }
  el.on('navigate', (event) => {
    const detail = (event && event.detail) || {};
    if (detail.serviceId) {
      session.setItem(SELECTED_SERVICE_KEY, detail.serviceId);
    }
    if (detail.path) {
      wixLocationFrontend.to(resolveWixRoute(detail.path));
    }
  });
}

export function wireBookingElement(selector) {
  const el = /** @type {any} */ (resolveElementOrFallback(selector));
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
        el.setAttribute('booking-error', '');
        el.setAttribute('booking-result', JSON.stringify(result.booking));
      } else {
        const msg = (result && result.message) || 'Please check your booking details.';
        el.setAttribute('booking-error', msg);
      }
    } catch (err) {
      el.setAttribute('booking-error', 'Unable to reach dispatch server. Please call (206) 327-4411.');
    }
  });
}

export function wireContactElement(selector) {
  const el = /** @type {any} */ (resolveElementOrFallback(selector));
  if (!el || typeof el.on !== 'function') return;
  el.on('submitContact', async (event) => {
    const detail = (event && event.detail) || {};
    try {
      const result = await submitInquiry(detail.payload);
      if (result && result.success) {
        el.setAttribute('contact-error', '');
        el.setAttribute('contact-result', JSON.stringify(result.inquiry || { ok: true }));
      } else {
        const msg = (result && result.message) || 'Please check your inquiry details.';
        el.setAttribute('contact-error', msg);
      }
    } catch (err) {
      el.setAttribute('contact-error', 'Failed to send message. Please call (206) 327-4411.');
    }
  });
}

export async function wireMyBookingsElement(selector) {
  const el = /** @type {any} */ (resolveElementOrFallback(selector));
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

  el.on('searchBookings', async (event) => {
    const detail = (event && event.detail) || {};
    const q = String(detail.query || '').trim() || 'CCR-';
    try {
      const res = await searchBookings(q);
      if (res && res.success && Array.isArray(res.items)) {
        const activeItems = res.items.filter((item) => item.status !== 'cancelled');
        el.setAttribute('server-bookings', JSON.stringify(activeItems));
      }
    } catch (e) {
      // Local filtering remains active
    }
  });

  el.on('requestConfirmation', async (event) => {
    const detail = (event && event.detail) || {};
    if (detail.bookingId) {
      try {
        await requestBookingConfirmation(detail.bookingId);
        el.setAttribute('confirmation-requested', detail.bookingId);
      } catch (e) {
        // Ignore
      }
    }
  });

  try {
    const res = await searchBookings('CCR-');
    if (res && res.success && Array.isArray(res.items)) {
      const activeItems = res.items.filter((item) => item.status !== 'cancelled');
      el.setAttribute('server-bookings', JSON.stringify(activeItems));
    }
  } catch (e) {
    // Local storage fallback handled inside custom element
  }
}
