import wixData from 'wix-data';

const RIDE_OPERATIONS_COLLECTION = 'RideOperations';
const DRIVERS_COLLECTION = 'Drivers';
const VEHICLES_COLLECTION = 'Vehicles';

const collectionAvailability = new Map();

async function isCollectionAvailable(name) {
  if (collectionAvailability.has(name)) {
    return collectionAvailability.get(name);
  }
  try {
    await wixData.query(name).limit(1).find({ suppressAuth: true });
    collectionAvailability.set(name, true);
    return true;
  } catch (e) {
    collectionAvailability.set(name, false);
    return false;
  }
}

export async function upsertRideOperation(data) {
  const available = await isCollectionAvailable(RIDE_OPERATIONS_COLLECTION);
  if (!available) return { saved: false, reason: 'RideOperations collection not provisioned' };

  const keyBookingId = String(data.bookingId || '').trim();
  const keyRef = String(data.bookingReference || keyBookingId).trim();
  const nowIso = new Date().toISOString();

  try {
    let existing = null;
    if (keyBookingId) {
      const q1 = await wixData.query(RIDE_OPERATIONS_COLLECTION)
        .eq('bookingId', keyBookingId)
        .limit(1)
        .find({ suppressAuth: true });
      if (q1.items && q1.items.length) existing = q1.items[0];
    }
    if (!existing && keyRef) {
      const q2 = await wixData.query(RIDE_OPERATIONS_COLLECTION)
        .eq('bookingReference', keyRef)
        .limit(1)
        .find({ suppressAuth: true });
      if (q2.items && q2.items.length) existing = q2.items[0];
    }

    const record = {
      ...(existing || {}),
      bookingId: keyBookingId || (existing && existing.bookingId) || keyRef,
      bookingReference: keyRef || (existing && existing.bookingReference) || keyBookingId,
      driverId: data.driverId !== undefined ? String(data.driverId) : ((existing && existing.driverId) || ''),
      vehicleId: data.vehicleId !== undefined ? String(data.vehicleId) : ((existing && existing.vehicleId) || ''),
      dispatchStatus: data.dispatchStatus !== undefined ? String(data.dispatchStatus) : ((existing && existing.dispatchStatus) || 'Unassigned'),
      pickupInstructions: data.pickupInstructions !== undefined ? String(data.pickupInstructions) : ((existing && existing.pickupInstructions) || ''),
      accessibilityRequirements: data.accessibilityRequirements !== undefined ? String(data.accessibilityRequirements) : ((existing && existing.accessibilityRequirements) || ''),
      facilityName: data.facilityName !== undefined ? String(data.facilityName) : ((existing && existing.facilityName) || ''),
      departmentSuite: data.departmentSuite !== undefined ? String(data.departmentSuite) : ((existing && existing.departmentSuite) || ''),
      adminNotes: data.adminNotes !== undefined ? String(data.adminNotes) : ((existing && existing.adminNotes) || ''),
      assignedAt: data.assignedAt || (data.driverId ? nowIso : ((existing && existing.assignedAt) || '')),
      lastUpdated: nowIso
    };

    if (existing && existing._id) {
      const updated = await wixData.update(RIDE_OPERATIONS_COLLECTION, record, { suppressAuth: true });
      return { saved: true, item: updated };
    }
    const inserted = await wixData.insert(RIDE_OPERATIONS_COLLECTION, record, { suppressAuth: true });
    return { saved: true, item: inserted };
  } catch (err) {
    return { saved: false, reason: err && err.message ? err.message : 'RideOperations write failed' };
  }
}

export async function listRideOperations(limit = 200) {
  const available = await isCollectionAvailable(RIDE_OPERATIONS_COLLECTION);
  if (!available) return [];
  try {
    const res = await wixData.query(RIDE_OPERATIONS_COLLECTION)
      .descending('lastUpdated')
      .limit(Math.min(limit, 500))
      .find({ suppressAuth: true });
    return res.items || [];
  } catch (e) {
    return [];
  }
}

export async function listDrivers() {
  const available = await isCollectionAvailable(DRIVERS_COLLECTION);
  if (!available) return [];
  try {
    const res = await wixData.query(DRIVERS_COLLECTION).limit(100).find({ suppressAuth: true });
    return res.items || [];
  } catch (e) {
    return [];
  }
}

export async function listVehicles() {
  const available = await isCollectionAvailable(VEHICLES_COLLECTION);
  if (!available) return [];
  try {
    const res = await wixData.query(VEHICLES_COLLECTION).limit(100).find({ suppressAuth: true });
    return res.items || [];
  } catch (e) {
    return [];
  }
}
