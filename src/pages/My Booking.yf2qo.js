import { applyPageSeo, wireMyBookingsElement } from 'public/veloPageBridge';

$w.onReady(function () {
  applyPageSeo('myBookings');
  wireMyBookingsElement('#ccrMyBookings');
});
