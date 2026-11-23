import { services, availabilityCalendar, bookings, extendedBookings } from 'wix-bookings.v2';
import { elevate } from 'wix-auth';

function safeElevate(fn) {
  try {
    return typeof elevate === 'function' ? elevate(fn) : fn;
  } catch (e) {
    return fn;
  }
}

/**
 * Retrieve real services configured in Wix Bookings.
 */
export async function listWixServices() {
  try {
    const queryFn = safeElevate(() => services.queryServices().limit(50).find());
    const res = await queryFn();
    const items = (res && res.items) || [];
    return {
      success: true,
      items: items.map((svc) => ({
        _id: svc._id,
        name: svc.name || '',
        description: svc.description || '',
        type: svc.type || '',
        scheduleId: (svc.schedule && svc.schedule._id) || '',
        onlineBookingEnabled: Boolean(svc.onlineBooking && svc.onlineBooking.enabled),
        requireManualApproval: Boolean(svc.onlineBooking && svc.onlineBooking.requireManualApproval),
        locations: svc.locations || []
      }))
    };
  } catch (err) {
    return {
      success: false,
      items: [],
      message: err && err.message ? err.message : 'Unable to query Wix Bookings services.'
    };
  }
}

/**
 * Query real Wix Bookings availability slots for a given serviceId and YYYY-MM-DD date.
 */
export async function queryWixServiceAvailability(serviceId, pickupDate, timezone = 'America/Los_Angeles') {
  if (!serviceId || !pickupDate) {
    return { success: false, slots: [], message: 'Service ID and pickup date are required.' };
  }
  try {
    const startDate = `${pickupDate}T00:00:00.000`;
    const endDate = `${pickupDate}T23:59:59.999`;
    const res = await availabilityCalendar.queryAvailability(
      {
        filter: {
          serviceId: [String(serviceId)],
          startDate,
          endDate
        }
      },
      { timezone }
    );
    const entries = (res && res.availabilityEntries) || [];
    const bookable = entries.filter((e) => e.bookable && e.slot);
    return {
      success: true,
      slots: bookable.map((e) => ({
        slot: e.slot,
        startDate: e.slot.startDate,
        endDate: e.slot.endDate,
        openSpots: e.openSpots || 1,
        bookable: Boolean(e.bookable)
      })),
      totalFound: entries.length
    };
  } catch (err) {
    return {
      success: false,
      slots: [],
      message: err && err.message ? err.message : 'Unable to query Wix Bookings availability.'
    };
  }
}

const SERVICE_TYPE_KEYWORDS = {
  therapy: ['physical therapy', 'therapy', 'rehabilitation', 'rehab', 'occupational'],
  rehabilitation: ['physical therapy', 'rehabilitation', 'therapy', 'hospital discharge'],
  wheelchair: ['wheelchair', 'ada', 'lift', 'ramp'],
  dialysis: ['dialysis'],
  non_emergency: ['non-emergency medical', 'non-emergency', 'nemt', 'medical transportation'],
  hospital_discharge: ['hospital discharge', 'discharge', 'hospital'],
  senior_private: ['senior', 'private-pay', 'ambulatory'],
  private: ['private transportation', 'private'],
  school: ['school', 'youth'],
  stretcher: ['stretcher', 'gurney'],
  outpatient: ['outpatient', 'surgery', 'dental'],
  airport: ['airport', 'long-distance', 'sea-tac'],
  behavioral: ['behavioral health', 'counseling', 'wellness']
};

function findMatchingService(wixServices, serviceType, requestedServiceId) {
  if (!Array.isArray(wixServices) || !wixServices.length) return null;
  if (requestedServiceId) {
    const byId = wixServices.find((s) => s._id === requestedServiceId);
    if (byId) return byId;
  }
  const needle = String(serviceType || '').toLowerCase().replace(/[_-]+/g, ' ').trim();
  if (!needle) return wixServices[0];

  const key = String(serviceType || '').toLowerCase().trim();
  const keywords = SERVICE_TYPE_KEYWORDS[key] || [needle];
  const byKeyword = wixServices.find((s) => {
    const sName = String(s.name || '').toLowerCase();
    return keywords.some((kw) => sName.includes(kw));
  });
  return byKeyword || wixServices[0];
}

function pickBestSlot(slots, pickupTime) {
  if (!Array.isArray(slots) || !slots.length) return null;
  if (!pickupTime) return slots[0].slot;
  const [hh = '09', mm = '00'] = String(pickupTime).split(':');
  const targetMinutes = Number(hh) * 60 + Number(mm);
  let best = slots[0];
  let bestDiff = Infinity;
  slots.forEach((entry) => {
    const d = new Date(entry.startDate);
    if (Number.isNaN(d.getTime())) return;
    const mins = d.getHours() * 60 + d.getMinutes();
    const diff = Math.abs(mins - targetMinutes);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = entry;
    }
  });
  return best.slot;
}

/**
 * Create a real booking in Wix Bookings V2 so it appears in Wix Dashboard Calendar & Booking Requests.
 */
export async function createWixBookingRecord(payload, bookingReference) {
  const svcRes = await listWixServices();
  if (!svcRes.success || !svcRes.items.length) {
    return {
      createdInWix: false,
      reason: 'NO_WIX_SERVICES_CONFIGURED',
      message: 'No Wix Bookings services are configured in Wix Dashboard yet.'
    };
  }

  const matchedService = findMatchingService(svcRes.items, payload.serviceType, payload.wixServiceId);
  if (!matchedService) {
    return {
      createdInWix: false,
      reason: 'SERVICE_NOT_FOUND',
      message: 'Requested transportation service is not mapped in Wix Bookings.'
    };
  }

  const availRes = await queryWixServiceAvailability(matchedService._id, payload.pickupDate);
  const selectedSlot = payload.wixSlot || pickBestSlot(availRes.slots, payload.pickupTime);

  if (!selectedSlot) {
    return {
      createdInWix: false,
      reason: 'NO_AVAILABLE_SLOT',
      serviceId: matchedService._id,
      serviceName: matchedService.name,
      message: `No available Wix Bookings time slot found for ${matchedService.name} on ${payload.pickupDate}.`
    };
  }

  const firstName = String(payload.firstName || '').trim();
  const lastName = String(payload.lastName || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const phone = String(payload.phone || '').trim();
  const companions = Boolean(payload.hasCompanion ?? payload.companionRequired)
    ? Number(payload.companionCount || 1)
    : 0;

  try {
    const createFn = safeElevate(bookings.createBooking);
    const created = await createFn(
      {
        bookedEntity: { slot: selectedSlot },
        contactDetails: {
          firstName,
          lastName,
          email,
          phone
        },
        totalParticipants: 1 + companions,
        additionalFields: [
          {
            _id: 'bookingReference',
            label: 'Booking Reference',
            value: bookingReference
          },
          {
            _id: 'pickupAddress',
            label: 'Pickup Address',
            value: String(payload.pickupAddress || '')
          },
          {
            _id: 'destinationAddress',
            label: 'Destination Address',
            value: String(payload.destinationAddress || '')
          }
        ]
      },
      {
        sendSmsReminder: false,
        participantNotification: {
          notifyParticipants: false
        }
      }
    );

    const wixBooking = (created && created.booking) || created;
    return {
      createdInWix: Boolean(wixBooking && wixBooking._id),
      wixBookingId: wixBooking ? wixBooking._id : '',
      wixRevision: wixBooking ? wixBooking.revision : '',
      wixStatus: wixBooking ? wixBooking.status : 'PENDING',
      wixServiceId: matchedService._id,
      wixServiceName: matchedService.name,
      wixBooking
    };
  } catch (err) {
    return {
      createdInWix: false,
      reason: 'WIX_CREATE_BOOKING_FAILED',
      message: err && err.message ? err.message : 'Wix Bookings createBooking failed.'
    };
  }
}

export async function confirmWixBookingRecord(wixBookingId, revision, message = '') {
  if (!wixBookingId) return { updatedInWix: false, reason: 'NO_WIX_BOOKING_ID' };
  try {
    const fn = safeElevate(bookings.confirmBooking);
    const res = await fn(wixBookingId, revision || '1', {
      participantNotification: {
        notifyParticipants: Boolean(message),
        message: message || undefined
      }
    });
    const updated = (res && res.booking) || res;
    return { updatedInWix: true, booking: updated, revision: updated && updated.revision };
  } catch (err) {
    return { updatedInWix: false, message: err && err.message ? err.message : 'Wix confirmBooking failed.' };
  }
}

export async function declineWixBookingRecord(wixBookingId, revision, message = '') {
  if (!wixBookingId) return { updatedInWix: false, reason: 'NO_WIX_BOOKING_ID' };
  try {
    const fn = safeElevate(bookings.declineBooking);
    const res = await fn(wixBookingId, revision || '1', {
      participantNotification: {
        notifyParticipants: Boolean(message),
        message: message || undefined
      }
    });
    const updated = (res && res.booking) || res;
    return { updatedInWix: true, booking: updated, revision: updated && updated.revision };
  } catch (err) {
    return { updatedInWix: false, message: err && err.message ? err.message : 'Wix declineBooking failed.' };
  }
}

export async function cancelWixBookingRecord(wixBookingId, revision, message = '') {
  if (!wixBookingId) return { updatedInWix: false, reason: 'NO_WIX_BOOKING_ID' };
  try {
    const fn = safeElevate(bookings.cancelBooking);
    const res = await fn(wixBookingId, {
      revision: revision || '1',
      flowControlSettings: { ignoreCancellationPolicy: true },
      participantNotification: {
        notifyParticipants: Boolean(message),
        message: message || undefined
      }
    });
    const updated = (res && res.booking) || res;
    return { updatedInWix: true, booking: updated, revision: updated && updated.revision };
  } catch (err) {
    return { updatedInWix: false, message: err && err.message ? err.message : 'Wix cancelBooking failed.' };
  }
}

export async function queryAllWixBookings(limit = 100) {
  try {
    const fn = safeElevate(extendedBookings.queryExtendedBookings);
    const res = await fn({
      cursorPaging: { limit: Math.min(limit, 100) }
    });
    const items = (res && res.extendedBookings) || [];
    return {
      success: true,
      items: items.map((entry) => {
        const b = entry.booking || entry;
        const contact = b.contactDetails || {};
        const slot = (b.bookedEntity && b.bookedEntity.slot) || {};
        const start = slot.startDate ? new Date(slot.startDate) : null;
        return {
          wixBookingId: b._id,
          wixRevision: b.revision,
          wixStatus: b.status || 'PENDING',
          serviceTitle: (b.bookedEntity && b.bookedEntity.title) || 'Medical Transportation',
          serviceId: slot.serviceId || '',
          pickupDate: start && !Number.isNaN(start.getTime()) ? start.toISOString().split('T')[0] : '',
          pickupTime: start && !Number.isNaN(start.getTime()) ? start.toISOString().slice(11, 16) : '',
          passengerFirstName: contact.firstName || '',
          passengerLastName: contact.lastName || '',
          passengerName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
          emailAddress: contact.email || '',
          contactPhone: contact.phone || '',
          createdAt: b._createdDate || '',
          updatedAt: b._updatedDate || ''
        };
      })
    };
  } catch (err) {
    return {
      success: false,
      items: [],
      message: err && err.message ? err.message : 'Unable to query Wix extended bookings.'
    };
  }
}
