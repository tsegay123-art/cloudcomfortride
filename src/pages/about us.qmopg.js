import { applyPageSeo, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  applyPageSeo('about');
  wireNavigationElement('#ccrAbout');
});
