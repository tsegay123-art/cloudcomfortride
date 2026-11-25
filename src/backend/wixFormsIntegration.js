import { submissions } from 'wix-forms.v2';
import { getSecret } from 'wix-secrets-backend';

async function getOptionalSecret(key) {
  try {
    const val = await getSecret(key);
    return val ? String(val).trim() : '';
  } catch (e) {
    return '';
  }
}

function normalizeFormId(raw) {
  return String(raw || '').trim().replace(/^WixForms\//i, '');
}

/**
 * Submit booking intake payload to the existing Wix Forms & Submissions "Booking Form".
 * @param {Record<string, any>} payload
 * @param {string} bookingReference
 * @param {string} [wixBookingId]
 * @returns {Promise<Record<string, any>>}
 */
export async function submitBookingToWixForms(payload, bookingReference, wixBookingId = '') {
  const formId = normalizeFormId(await getOptionalSecret('CCR_BOOKING_FORM_ID'));
  if (!formId) {
    return {
      submitted: false,
      submissionId: '',
      reason: 'CCR_BOOKING_FORM_ID secret not configured in Wix Secrets Manager'
    };
  }

  try {
    const res = await submissions.createSubmission({
      formId,
      submissions: {
        bookingReference,
        wixBookingId: wixBookingId || '',
        first_name: String(payload.firstName || '').trim(),
        last_name: String(payload.lastName || '').trim(),
        email: String(payload.email || '').trim().toLowerCase(),
        country_code: String(payload.countryCode || '+1'),
        phone: String(payload.phone || '').trim(),
        passenger_count: Number(payload.passengerCount || 1),
        service_type: String(payload.serviceType || ''),
        trip_type: String(payload.tripType || 'round_trip'),
        pickup_date: String(payload.pickupDate || ''),
        pickup_time: String(payload.pickupTime || ''),
        return_time: String(payload.returnTime || ''),
        pickup_address: String(payload.pickupAddress || '').trim(),
        pickup_city: String(payload.pickupCity || '').trim(),
        pickup_zip: String(payload.pickupZip || '').trim(),
        pickup_notes: String(payload.pickupNotes || '').trim(),
        facility_name: String(payload.facilityName || '').trim(),
        destination_address: String(payload.destinationAddress || '').trim(),
        destination_city: String(payload.destinationCity || '').trim(),
        destination_zip: String(payload.destinationZip || '').trim(),
        department_suite: String(payload.destinationNotes || payload.departmentSuite || '').trim(),
        additional_stops: String(payload.additionalStops || '').trim(),
        flight_info: String(payload.flightInfo || '').trim(),
        mobility_requirement: String(payload.mobilityNeed || 'ambulatory'),
        boarding_assistance: Boolean(payload.needsBoardingAssistance),
        special_instructions: String(payload.specialInstructions || '').trim()
      }
    });
    const sub = /** @type {Record<string, any>} */ ((res && res.submission) || res || {});
    return {
      submitted: Boolean(sub._id),
      submissionId: String(sub._id || ''),
      reason: ''
    };
  } catch (err) {
    return {
      submitted: false,
      submissionId: '',
      reason: err && err.message ? err.message : 'Wix Forms Booking Form createSubmission failed'
    };
  }
}

/**
 * Submit contact enquiry payload to the existing Wix Forms & Submissions "Contact us" form.
 * @param {Record<string, any>} record
 * @returns {Promise<Record<string, any>>}
 */
export async function submitContactToWixForms(record) {
  const formId = normalizeFormId(await getOptionalSecret('CCR_CONTACT_FORM_ID'));
  if (!formId) {
    return {
      submitted: false,
      submissionId: '',
      reason: 'CCR_CONTACT_FORM_ID secret not configured in Wix Secrets Manager'
    };
  }

  try {
    const res = await submissions.createSubmission({
      formId,
      submissions: {
        messageReference: String(record.messageReference || ''),
        first_name: String(record.firstName || ''),
        last_name: String(record.lastName || ''),
        email: String(record.email || ''),
        phone: String(record.phone || ''),
        subject: String(record.subject || ''),
        message: String(record.message || '')
      }
    });
    const sub = /** @type {Record<string, any>} */ ((res && res.submission) || res || {});
    return {
      submitted: Boolean(sub._id),
      submissionId: String(sub._id || ''),
      reason: ''
    };
  } catch (err) {
    return {
      submitted: false,
      submissionId: '',
      reason: err && err.message ? err.message : 'Wix Forms Contact us createSubmission failed'
    };
  }
}
