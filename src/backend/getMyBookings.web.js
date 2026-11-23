import { Permissions, webMethod } from 'wix-web-module';
import wixData from 'wix-data';
import { getServiceTitle } from 'public/companyData';
import { queryAllWixBookings, cancelWixBookingRecord } from './wixBookingsIntegration';

const BOOKING_COLLECTIONS = ['Import1', 'Import_1', 'Import 1', 'Bookings'];
let cachedCol = '';

async function resolveBookingsCollection() {
  if (cachedCol) return cachedCol;
  for (const col of BOOKING_COLLECTIONS) {
    try {
      await wixData.query(col).limit(1).find({ suppressAuth: true });
      cachedCol = col;
      return col;
    } catch (e) {
      // Try next candidate collection ID
    }
  }
  return '';
}

function normalizeStatus(raw) {
  const s = String(raw || 'Pending').trim().toLowerCase();
  if (s === 'confirmed') return 'Confirmed';
  if (s === 'rejected' || s === 'declined') return 'Rejected';
  if (s === 'completed') return 'Completed';
  if (s === 'cancelled' || s === 'canceled') return 'Cancelled';
  return 'Pending';
}

function isUpcomingBooking(pickupDate, status) {
  const st = normalizeStatus(status);
  if (st === 'Cancelled' || st === 'Rejected' || st === 'Completed') return false;
  if (!pickupDate) return true;
  const today = new Date().toISOString().split('T')[0];
  return String(pickupDate) >= today;
}

function matchesQuery(item, q) {
  if (!q) return false;
  const qLower = q.toLowerCase();
  const qDigits = q.replace(/\D/g, '');
  const ref = String(item.bookingId || item.bookingReference || item.wixBookingId || '').toLowerCase();
  const email = String(item.emailAddress || item.email || '').toLowerCase();
  const phoneDigits = String(item.contactPhone || item.phone || '').replace(/\D/g, '');

  return ref.includes(qLower)
    || email.includes(qLower)
    || (qDigits.length >= 3 && phoneDigits.includes(qDigits));
}

async function getMemberEmailIfLoggedIn() {
  return '';
}

/**
 * Fetch logged-in member's or guest's bookings from BOTH native Wix Bookings V2
 * AND "Import 1" CMS collection, merging ride details by wixBookingId / bookingId.
 */
export const getMyBookings = webMethod(Permissions.Anyone, async (searchQuery = '') => {
  const q = String(searchQuery || '').trim();
  const memberEmail = await getMemberEmailIfLoggedIn();

  if (!q && !memberEmail) {
    return {
      success: true,
      isMember: false,
      items: [],
      message: 'Enter your Booking Reference, Email Address, or Phone Number to view your bookings.'
    };
  }

  const col = await resolveBookingsCollection();
  let cmsItems = [];
  if (col) {
    try {
      const cmsRes = await wixData.query(col).descending('createdAt').limit(500).find({ suppressAuth: true });
      cmsItems = cmsRes.items || [];
    } catch (e) {
      cmsItems = [];
    }
  }

  const wixRes = await queryAllWixBookings(100);
  const wixItems = wixRes.items || [];
  const wixById = new Map();
  wixItems.forEach((wb) => {
    if (wb.wixBookingId) wixById.set(wb.wixBookingId, wb);
  });

  const merged = cmsItems.map((item) => {
    const wixMatch = item.wixBookingId ? wixById.get(item.wixBookingId) : null;
    const status = wixMatch
      ? normalizeStatus(wixMatch.wixStatus)
      : normalizeStatus(item.bookingStatus || item.status);
    const pickupDate = item.pickupDate || (wixMatch && wixMatch.pickupDate) || '';
    const pickupTime = item.pickupTime || (wixMatch && wixMatch.pickupTime) || '';
    return {
      bookingId: item.bookingId || item.bookingReference || item._id,
      bookingReference: item.bookingId || item.bookingReference || item._id,
      wixBookingId: item.wixBookingId || '',
      wixRevision: (wixMatch && wixMatch.wixRevision) || item.wixRevision || '',
      bookingStatus: status,
      status,
      serviceType: item.serviceType || '',
      serviceTitle: item.serviceTitle || getServiceTitle(item.serviceType || ''),
      vehicleOption: item.vehicleOption || 'best_match',
      pickupDate,
      pickupTime,
      estimatedReturnTime: item.estimatedReturnTime || '',
      pickupAddress: item.pickupAddress || '',
      destinationAddress: item.destinationAddress || '',
      passengerName: item.passengerName || `${item.passengerFirstName || ''} ${item.passengerLastName || ''}`.trim(),
      contactPhone: item.contactPhone || item.phone || '',
      emailAddress: item.emailAddress || item.email || '',
      rejectionReason: item.rejectionReason || '',
      isUpcoming: isUpcomingBooking(pickupDate, status)
    };
  });

  const knownWixIds = new Set(cmsItems.map((i) => i.wixBookingId).filter(Boolean));
  wixItems.forEach((wb) => {
    if (wb.wixBookingId && !knownWixIds.has(wb.wixBookingId)) {
      const status = normalizeStatus(wb.wixStatus);
      merged.push({
        bookingId: wb.wixBookingId,
        bookingReference: wb.wixBookingId,
        wixBookingId: wb.wixBookingId,
        wixRevision: wb.wixRevision || '',
        bookingStatus: status,
        status,
        serviceType: wb.serviceTitle || '',
        serviceTitle: wb.serviceTitle || 'Medical Transportation',
        vehicleOption: 'best_match',
        pickupDate: wb.pickupDate || '',
        pickupTime: wb.pickupTime || '',
        estimatedReturnTime: '',
        pickupAddress: '',
        destinationAddress: '',
        passengerName: wb.passengerName || '',
        contactPhone: wb.contactPhone || '',
        emailAddress: wb.emailAddress || '',
        rejectionReason: '',
        isUpcoming: isUpcomingBooking(wb.pickupDate, status)
      });
    }
  });

  const filtered = merged.filter((item) => {
    const emailMatch = memberEmail && String(item.emailAddress || '').toLowerCase() === memberEmail;
    if (q) return matchesQuery(item, q);
    return emailMatch;
  });

  return {
    success: true,
    isMember: Boolean(memberEmail),
    items: filtered,
    message: filtered.length ? '' : 'No matching booking found.'
  };
});

/**
 * Cancel a booking in BOTH native Wix Bookings V2 (bookings.cancelBooking)
 * AND "Import 1" CMS collection (updating updatedAt with real Date()).
 */
export const cancelMyBooking = webMethod(Permissions.Anyone, async (bookingReference, verifierQuery = '') => {
  const ref = String(bookingReference || '').trim();
  if (!ref) return { success: false, message: 'Booking reference is required.' };

  const memberEmail = await getMemberEmailIfLoggedIn();
  const col = await resolveBookingsCollection();
  let cmsItem = null;

  if (col) {
    try {
      const res = await wixData.query(col)
        .eq('bookingId', ref)
        .or(wixData.query(col).eq('bookingReference', ref))
        .or(wixData.query(col).eq('wixBookingId', ref))
        .limit(1)
        .find({ suppressAuth: true });
      if (res.items && res.items.length) cmsItem = res.items[0];
    } catch (e) {
      cmsItem = null;
    }
  }

  const targetObj = cmsItem || { bookingId: ref, wixBookingId: ref };
  const ownerVerified = (memberEmail && String(targetObj.emailAddress || targetObj.email || '').toLowerCase() === memberEmail)
    || (verifierQuery && matchesQuery(targetObj, String(verifierQuery)));

  if (!ownerVerified) {
    return { success: false, message: 'Verification required to cancel this booking.' };
  }

  const wixId = (cmsItem && cmsItem.wixBookingId) || (!cmsItem ? ref : '');
  if (wixId) {
    await cancelWixBookingRecord(wixId, cmsItem ? cmsItem.wixRevision : '1', 'Cancelled by customer via My Bookings');
  }

  if (col && cmsItem) {
    await wixData.update(col, {
      ...cmsItem,
      bookingStatus: 'Cancelled',
      status: 'Cancelled',
      updatedAt: new Date()
    }, { suppressAuth: true });
  }

  return { success: true, bookingReference: ref };
});
