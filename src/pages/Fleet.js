import { applyPageSeo, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  applyPageSeo('fleet');
  wireNavigationElement('#ccrFleet');
});
