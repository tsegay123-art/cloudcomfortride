import wixData from 'wix-data';
import { upsertRideOperation } from './rideOperationsService';
import { recordAdminAudit } from './authService.jsw';

const BOOKING_COLLECTIONS = ['Import1', 'Import_1', 'Import 1', 'Bookings'];

async function syncWixBookingLifecycle(event, mappedStatus, actionName) {
  const booking = (event && (event.entity || event.booking || event)) || {};
  const wixBookingId = String(booking._id || booking.id || '').trim();
  if (!wixBookingId) return;

  const nowIso = new Date().toISOString();

  // Sync supplementary RideOperations record
  await upsertRideOperation({
    bookingId: wixBookingId,
    dispatchStatus: mappedStatus === 'Cancelled' || mappedStatus === 'Rejected' ? 'Cancelled' : undefined,
    adminNotes: `Synced from Wix Bookings event (${actionName}) at ${nowIso}`
  });

  // Sync matching record in Import 1 if present
  for (const colId of BOOKING_COLLECTIONS) {
    try {
      const res = await wixData.query(colId)
        .eq('wixBookingId', wixBookingId)
        .limit(1)
        .find({ suppressAuth: true });
      if (res.items && res.items.length > 0) {
        const current = res.items[0];
        await wixData.update(colId, {
          ...current,
          bookingStatus: mappedStatus,
          status: mappedStatus,
          wixStatus: booking.status || mappedStatus.toUpperCase(),
          wixRevision: booking.revision || current.wixRevision || '',
          updatedAt: nowIso
        }, { suppressAuth: true });
      }
      break;
    } catch (e) {
      // Try next candidate collection ID
    }
  }

  await recordAdminAudit('wix-dashboard', actionName, wixBookingId, `Status synced to ${mappedStatus}`);
}

export async function wixBookings_onBookingCreated(event) {
  await syncWixBookingLifecycle(event, 'Pending', 'WIX_EVENT_BOOKING_CREATED');
}

export async function wixBookings_onBookingConfirmed(event) {
  await syncWixBookingLifecycle(event, 'Confirmed', 'WIX_EVENT_BOOKING_CONFIRMED');
}

export async function wixBookings_onBookingDeclined(event) {
  await syncWixBookingLifecycle(event, 'Rejected', 'WIX_EVENT_BOOKING_DECLINED');
}

export async function wixBookings_onBookingCanceled(event) {
  await syncWixBookingLifecycle(event, 'Cancelled', 'WIX_EVENT_BOOKING_CANCELED');
}

export async function wixBookings_onBookingUpdated(event) {
  const booking = (event && (event.entity || event.booking || event)) || {};
  const raw = String(booking.status || 'PENDING').toUpperCase();
  const mapped = raw === 'CONFIRMED'
    ? 'Confirmed'
    : (raw === 'DECLINED' ? 'Rejected' : (raw === 'CANCELED' || raw === 'CANCELLED' ? 'Cancelled' : 'Pending'));
  await syncWixBookingLifecycle(event, mapped, 'WIX_EVENT_BOOKING_UPDATED');
}
