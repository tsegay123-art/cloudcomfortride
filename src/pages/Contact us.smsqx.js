import { applyPageSeo, wireContactElement, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  applyPageSeo('contact');
  wireNavigationElement('#ccrContact');
  wireContactElement('#ccrContact');
});
