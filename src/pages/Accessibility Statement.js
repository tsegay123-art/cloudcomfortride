import { applyPageSeo, wireLegalElement } from 'public/veloPageBridge';

$w.onReady(function () {
  applyPageSeo('accessibility');
  wireLegalElement('#ccrAccessibility', 'accessibility');
});
