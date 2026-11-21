import wixLocationFrontend from 'wix-location-frontend';
import wixSiteFrontend from 'wix-site-frontend';
import wixSeoFrontend from 'wix-seo-frontend';
import { session } from 'wix-storage-frontend';
import { submitBooking, searchBookings, cancelBooking, requestBookingConfirmation, listAllBookings, updateBookingStatus } from 'backend/bookingService.jsw';
import { submitInquiry, listAllInquiries, resolveInquiry } from 'backend/contactService.jsw';
import { COMPANY_INFO } from './companyData';

export const SELECTED_SERVICE_KEY = 'ccr_selected_service';

const ROUTE_ALIASES = {
  '/': { urls: ['/'], names: ['home'] },
  '/about': { urls: ['/about', '/about-us'], names: ['about us', 'about'] },
  '/about-us': { urls: ['/about', '/about-us'], names: ['about us', 'about'] },
  '/services': { urls: ['/services'], names: ['services'] },
  '/safety-drivers': { urls: ['/why-cloud-comfort-ride', '/safety-drivers', '/why-cloud-medical'], names: ['why cloud comfort ride', 'why cloud medical', 'safety'] },
  '/why-cloud-comfort-ride': { urls: ['/why-cloud-comfort-ride', '/safety-drivers', '/why-cloud-medical'], names: ['why cloud comfort ride', 'why cloud medical', 'safety'] },
  '/fleet': { urls: ['/fleet', '/why-cloud-comfort-ride', '/safety-drivers'], names: ['fleet', 'why cloud comfort ride', 'why cloud medical'] },
  '/why-cloud-medical': { urls: ['/why-cloud-comfort-ride', '/safety-drivers', '/why-cloud-medical'], names: ['why cloud comfort ride', 'why cloud medical', 'safety'] },
  '/book-a-ride': { urls: ['/book-a-ride', '/book-online', '/book-ride'], names: ['book a ride', 'book online', 'book ride', 'schedule'] },
  '/book-online': { urls: ['/book-a-ride', '/book-online', '/book-ride'], names: ['book a ride', 'book online', 'book ride', 'schedule'] },
  '/my-bookings': { urls: ['/my-bookings', '/my-booking'], names: ['my bookings', 'my booking'] },
  '/contact': { urls: ['/contact', '/contact-us'], names: ['contact'] },
  '/privacy': { urls: ['/privacy', '/privacy-policy'], names: ['privacy policy', 'privacy'] },
  '/terms': { urls: ['/terms', '/terms-of-service'], names: ['terms of service', 'terms'] },
  '/accessibility': { urls: ['/accessibility', '/accessibility-statement'], names: ['accessibility statement', 'accessibility'] },
  '/owner-dispatch': { urls: ['/owner-dispatch', '/dispatch'], names: ['owner dispatch', 'dispatch'] }
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
  const keys = ['/', '/services', '/about', '/safety-drivers', '/fleet', '/book-a-ride', '/my-bookings', '/contact', '/privacy', '/terms', '/accessibility', '/owner-dispatch'];
  const map = {};
  keys.forEach((k) => {
    map[k] = resolveWixRoute(k);
  });
  return map;
}

const wiredHandlerRegistry = new WeakMap();

function markWired(el, eventName) {
  if (!el) return false;
  let set = wiredHandlerRegistry.get(el);
  if (!set) {
    set = new Set();
    wiredHandlerRegistry.set(el, set);
  }
  if (set.has(eventName)) return false;
  set.add(eventName);
  return true;
}

const PAGE_SEO_CONFIG = {
  home: {
    title: 'Cloud Comfort Ride | Professional Medical Transportation Seattle',
    description: 'Safe, reliable non-emergency medical transportation in Seattle & King County. Wheelchair vans, dialysis, physical therapy, hospital discharge, and private rides.',
    path: '/'
  },
  services: {
    title: 'Medical Transportation Services | Cloud Comfort Ride Seattle',
    description: 'Explore non-emergency medical transportation, ADA wheelchair transit, dialysis, physical therapy, hospital discharge, and private rides in Seattle.',
    path: '/services'
  },
  about: {
    title: 'About Us | Cloud Comfort Ride Seattle',
    description: 'Learn about Cloud Comfort Ride, founded in Seattle in 2023 to deliver compassionate, punctual non-emergency medical transportation.',
    path: '/about-us'
  },
  safety: {
    title: 'Why Cloud Comfort Ride | Certified Drivers & Safety Standards',
    description: 'Discover why patients and Seattle clinics trust Cloud Comfort Ride: CPR & First Aid certified drivers, background vetting, and ADA Q-Straint safety.',
    path: '/why-cloud-comfort-ride'
  },
  fleet: {
    title: 'Our Medical Transit Fleet | Cloud Comfort Ride Seattle',
    description: 'View our ADA wheelchair accessible vans with hydraulic lifts, comfort sedans & SUVs, and sanitized cabins serving Seattle & King County.',
    path: '/fleet'
  },
  book: {
    title: 'Book A Ride Online | Cloud Comfort Ride Seattle',
    description: 'Schedule your non-emergency medical, wheelchair, dialysis, or private ride online with Cloud Comfort Ride Seattle dispatch.',
    path: '/book-a-ride'
  },
  contact: {
    title: 'Contact Us | Cloud Comfort Ride Seattle Dispatch',
    description: 'Contact Cloud Comfort Ride at (206) 327-4411 or info@cloudmedicaltrans.com. Office: 1902 E Yesler Way Unit #4, Seattle, WA 98122.',
    path: '/contact-us'
  },
  privacy: {
    title: 'Privacy Policy | Cloud Comfort Ride',
    description: 'Read how Cloud Comfort Ride protects passenger privacy and medical transportation booking details.',
    path: '/privacy-policy'
  },
  terms: {
    title: 'Terms of Service | Cloud Comfort Ride',
    description: 'Terms of service, scheduling guidelines, and non-emergency medical transportation policies for Cloud Comfort Ride.',
    path: '/terms-of-service'
  },
  accessibility: {
    title: 'Accessibility Statement | Cloud Comfort Ride',
    description: 'Our commitment to physical ADA wheelchair accessibility and WCAG-compliant digital booking at Cloud Comfort Ride.',
    path: '/accessibility-statement'
  },
  myBookings: {
    title: 'My Bookings | Cloud Comfort Ride',
    description: 'Look up your Cloud Comfort Ride booking reference, print trip vouchers, or request confirmation.',
    path: '/my-booking',
    noindex: true
  },
  dispatch: {
    title: 'Owner Dispatch Portal | Cloud Comfort Ride',
    description: 'Internal dispatch management for Cloud Comfort Ride.',
    path: '/owner-dispatch',
    noindex: true
  }
};

export function applyPageSeo(pageKey) {
  const cfg = PAGE_SEO_CONFIG[pageKey];
  if (!cfg) return;
  try {
    wixSeoFrontend.setTitle(cfg.title);
    const tags = [
      { name: 'description', content: cfg.description }
    ];
    if (cfg.noindex) {
      tags.push({ name: 'robots', content: 'noindex, nofollow' });
    }
    wixSeoFrontend.setMetaTags(tags);
    wixSeoFrontend.setLinks([
      { rel: 'canonical', href: `${COMPANY_INFO.website}${cfg.path}` }
    ]);
  } catch (e) {
    // Ignore if SEO API is unavailable in preview
  }
}

function getElement(selector) {
  try {
    return $w(selector);
  } catch (e) {
    return null;
  }
}

function resolveAllPageCustomElements(selector) {
  const results = [];
  const seen = new Set();
  const add = (el) => {
    if (el && typeof el.on === 'function' && !seen.has(el)) {
      seen.add(el);
      results.push(el);
    }
  };
  add(getElement(selector));
  try {
    const all = /** @type {any} */ ($w('CustomElement'));
    const list = Array.isArray(all) ? all : (all && typeof all.forEach === 'function' ? (() => { const arr = []; all.forEach((x) => arr.push(x)); return arr; })() : [all]);
    list.forEach((item) => {
      if (item && item.id !== 'ccrHeader' && item.id !== 'ccrFooter') {
        add(item);
      }
    });
  } catch (e) {
    // Ignore
  }
  return results;
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
  resolveAllPageCustomElements(selector).forEach((el) => {
    if (typeof el.setAttribute === 'function') {
      el.setAttribute(name, value);
    }
  });
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
    if (typeof el.on === 'function' && markWired(el, 'navigate')) {
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
  const targets = resolveAllPageCustomElements(selector);
  if (!targets.length) return;
  const routeMapJson = JSON.stringify(buildRouteMap());
  targets.forEach((el) => {
    if (typeof el.setAttribute === 'function') {
      el.setAttribute('route-map', routeMapJson);
    }
    if (!markWired(el, 'navigate')) return;
    el.on('navigate', (event) => {
      const detail = (event && event.detail) || {};
      if (detail.serviceId) {
        session.setItem(SELECTED_SERVICE_KEY, detail.serviceId);
      }
      if (detail.path) {
        wixLocationFrontend.to(resolveWixRoute(detail.path));
      }
    });
  });
}

export function wireHomeSeo(selector) {
  const targets = resolveAllPageCustomElements(selector);
  const seoHtml = `
    <section>
      <h1>Cloud Comfort Ride — Non-Emergency Medical Transportation Seattle</h1>
      <p>Cloud Comfort Ride provides safe, reliable, and compassionate medical transportation Seattle, wheelchair transportation Seattle, and medical transport Seattle across King County.</p>
      <ul>
        <li>Non-emergency medical transportation</li>
        <li>Wheelchair transportation Seattle with ADA lifts and ramps</li>
        <li>Dialysis, physical therapy, hospital discharge, and senior rides</li>
      </ul>
      <p>Office: ${COMPANY_INFO.address} | Phone: ${COMPANY_INFO.phoneDisplay} | Email: ${COMPANY_INFO.email}</p>
    </section>
  `.trim();
  targets.forEach((el) => {
    try {
      el.seoMarkup = seoHtml;
    } catch (e) {
      // Ignore if read-only in preview
    }
  });
}

export function wireBookingElement(selector) {
  const targets = resolveAllPageCustomElements(selector);
  if (!targets.length) return;

  const preselected = session.getItem(SELECTED_SERVICE_KEY);
  if (preselected) {
    targets.forEach((el) => {
      if (typeof el.setAttribute === 'function') {
        el.setAttribute('initial-service', preselected);
      }
    });
    session.removeItem(SELECTED_SERVICE_KEY);
  }

  targets.forEach((el) => {
    if (!markWired(el, 'submitBooking')) return;
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
  });
}

export function wireContactElement(selector) {
  const targets = resolveAllPageCustomElements(selector);
  if (!targets.length) return;
  targets.forEach((el) => {
    if (!markWired(el, 'submitContact')) return;
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
  });
}

export async function wireMyBookingsElement(selector) {
  const targets = resolveAllPageCustomElements(selector);
  if (!targets.length) return;
  wireNavigationElement(selector);

  targets.forEach((el) => {
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
  });

  try {
    const res = await searchBookings('CCR-');
    if (res && res.success && Array.isArray(res.items)) {
      const activeItems = res.items.filter((item) => item.status !== 'cancelled');
      const json = JSON.stringify(activeItems);
      targets.forEach((el) => el.setAttribute('server-bookings', json));
    }
  } catch (e) {
    // Local storage fallback handled inside custom element
  }
}

export function wireDispatchElement(selector) {
  const targets = resolveAllPageCustomElements(selector);
  if (!targets.length) return;

  targets.forEach((el) => {
    el.on('dispatchLogin', async (event) => {
      const detail = (event && event.detail) || {};
      const pin = detail.pin || '';
      try {
        const [bRes, iRes] = await Promise.all([listAllBookings(pin), listAllInquiries(pin)]);
        if (bRes && bRes.success) {
          el.setAttribute('dispatch-error', '');
          el.setAttribute('dispatch-data', JSON.stringify({
            bookings: bRes.items || [],
            inquiries: (iRes && iRes.items) || []
          }));
        } else {
          el.setAttribute('dispatch-error', (bRes && bRes.message) || 'Invalid Dispatch PIN.');
        }
      } catch (err) {
        el.setAttribute('dispatch-error', 'Unable to load dispatch data.');
      }
    });

    el.on('updateBookingStatus', async (event) => {
      const detail = (event && event.detail) || {};
      try {
        const res = await updateBookingStatus(detail.pin, detail.bookingId, detail.status);
        if (res && res.success) {
          const [bRes, iRes] = await Promise.all([listAllBookings(detail.pin), listAllInquiries(detail.pin)]);
          el.setAttribute('dispatch-data', JSON.stringify({
            bookings: (bRes && bRes.items) || [],
            inquiries: (iRes && iRes.items) || []
          }));
        } else {
          el.setAttribute('dispatch-error', (res && res.message) || 'Failed to update booking.');
        }
      } catch (err) {
        el.setAttribute('dispatch-error', 'Failed to update booking.');
      }
    });

    el.on('resolveInquiry', async (event) => {
      const detail = (event && event.detail) || {};
      try {
        const res = await resolveInquiry(detail.pin, detail.inquiryId);
        if (res && res.success) {
          const [bRes, iRes] = await Promise.all([listAllBookings(detail.pin), listAllInquiries(detail.pin)]);
          el.setAttribute('dispatch-data', JSON.stringify({
            bookings: (bRes && bRes.items) || [],
            inquiries: (iRes && iRes.items) || []
          }));
        }
      } catch (err) {
        el.setAttribute('dispatch-error', 'Failed to resolve inquiry.');
      }
    });
  });
}
