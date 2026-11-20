import { wireBookingElement, wireHomeSeo, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  wireHomeSeo('#ccrHome');
  wireNavigationElement('#ccrHome');
  wireBookingElement('#ccrHome');
});
