import { wireBookingElement, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  wireNavigationElement('#ccrHome');
  wireBookingElement('#ccrHome');
});
