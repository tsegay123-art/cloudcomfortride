import { wireContactElement, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  wireNavigationElement('#ccrContact');
  wireContactElement('#ccrContact');
});

