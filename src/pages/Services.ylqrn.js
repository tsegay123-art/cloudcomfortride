import { applyPageSeo, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  applyPageSeo('services');
  wireNavigationElement('#ccrServices');
});
