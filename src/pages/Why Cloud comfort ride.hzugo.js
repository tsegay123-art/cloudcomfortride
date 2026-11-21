import { applyPageSeo, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  applyPageSeo('safety');
  wireNavigationElement('#ccrSafety');
});
