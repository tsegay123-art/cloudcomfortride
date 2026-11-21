import { applyPageSeo, wireBookingElement, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  applyPageSeo('book');
  wireNavigationElement('#ccrBookRide');
  wireBookingElement('#ccrBookRide');
});
