import wixData from 'wix-data';
import wixCrmBackend from 'wix-crm-backend';
import { getSecret } from 'wix-secrets-backend';

const NOTIFICATION_LOGS_COLLECTION = 'NotificationLogs';
export const OWNER_EMAIL = 'info@cloudmedicaltrans.com';

async function logNotification({
  relatedRecordReference,
  notificationType,
  recipient,
  deliveryStatus,
  errorDetails = ''
}) {
  const notificationReference = `NTF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const entry = {
    notificationReference,
    relatedRecordReference: String(relatedRecordReference || ''),
    notificationType: String(notificationType || ''),
    recipient: String(recipient || ''),
    deliveryStatus,
    timestamp: new Date().toISOString(),
    errorDetails: String(errorDetails || '').slice(0, 500)
  };
  try {
    await wixData.insert(NOTIFICATION_LOGS_COLLECTION, entry, { suppressAuth: true });
  } catch (err) {
    console.warn('NotificationLogs insert skipped:', err && err.message ? err.message : err);
  }
  return entry;
}

async function tryResendEmail({ to, subject, html }) {
  let apiKey = '';
  try {
    apiKey = await getSecret('CCR_RESEND_API_KEY');
  } catch (e) {
    return { attempted: false, ok: false, error: 'CCR_RESEND_API_KEY not configured' };
  }
  if (!apiKey) {
    return { attempted: false, ok: false, error: 'CCR_RESEND_API_KEY empty' };
  }

  let fromAddress = 'Cloud Comfort Ride <onboarding@resend.dev>';
  try {
    const customFrom = await getSecret('CCR_RESEND_FROM');
    if (customFrom) fromAddress = customFrom;
  } catch (e) {
    // Use default Resend sender
  }

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: fromAddress, to: [to], subject, html })
    });
    if (!resp.ok) {
      const txt = await resp.text();
      return { attempted: true, ok: false, error: `Resend HTTP ${resp.status}: ${txt}` };
    }
    return { attempted: true, ok: true, error: '' };
  } catch (err) {
    return { attempted: true, ok: false, error: err && err.message ? err.message : 'Resend request failed' };
  }
}

export async function sendWixOrResendNotification({
  relatedRecordReference,
  notificationType,
  recipientEmail,
  recipientFirstName = 'Cloud Comfort Ride',
  recipientLastName = 'Customer',
  recipientPhone = '',
  triggeredEmailId,
  variables,
  fallbackSubject,
  fallbackHtml
}) {
  let delivered = false;
  const errors = [];

  try {
    const contactPayload = {
      emails: [{ email: recipientEmail, primary: true }],
      name: { first: recipientFirstName, last: recipientLastName }
    };
    if (recipientPhone) {
      contactPayload.phones = [{ phone: recipientPhone, primary: true }];
    }
    const contactRes = await wixCrmBackend.contacts.appendOrCreateContact(contactPayload);
    const contactId = contactRes && contactRes.contactId;
    if (contactId) {
      await wixCrmBackend.triggeredEmails.emailContact(triggeredEmailId, contactId, { variables });
      delivered = true;
    } else {
      errors.push('Wix CRM contactId not returned');
    }
  } catch (err) {
    errors.push(`TriggeredEmail(${triggeredEmailId}): ${err && err.message ? err.message : err}`);
  }

  if (!delivered) {
    const resendRes = await tryResendEmail({
      to: recipientEmail,
      subject: fallbackSubject,
      html: fallbackHtml
    });
    if (resendRes.ok) {
      delivered = true;
    } else if (resendRes.attempted) {
      errors.push(resendRes.error);
    } else {
      errors.push(resendRes.error);
    }
  }

  const deliveryStatus = delivered ? 'SENT' : 'FAILED';
  const errorDetails = delivered ? '' : errors.join(' | ');
  await logNotification({
    relatedRecordReference,
    notificationType,
    recipient: recipientEmail,
    deliveryStatus,
    errorDetails
  });

  return { delivered, deliveryStatus, errorDetails };
}
