import wixLocationFrontend from 'wix-location-frontend';
import { resolveWixRoute } from 'public/veloPageBridge';

$w.onReady(function () {
  ['#myBookings1', '#bookings1', '#page1'].forEach((id) => {
    try {
      const el = $w(id);
      if (el && typeof el.collapse === 'function') el.collapse();
      if (el && typeof el.hide === 'function') el.hide();
    } catch (e) {}
  });
  wixLocationFrontend.to(resolveWixRoute('/my-booking'));
});
