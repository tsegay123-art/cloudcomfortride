import { applyPageSeo, wireBookingElement, wireHomeSeo, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  applyPageSeo('home');
  wireHomeSeo('#ccrHome');
  wireNavigationElement('#ccrHome');
  wireBookingElement('#ccrHome');
});
