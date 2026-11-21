import { applyPageSeo, wireLegalElement } from 'public/veloPageBridge';

$w.onReady(function () {
  applyPageSeo('privacy');
  wireLegalElement('#ccrPrivacy', 'privacy');
});
