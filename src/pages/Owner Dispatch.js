import { applyPageSeo, wireDispatchElement } from 'public/veloPageBridge';

$w.onReady(function () {
  applyPageSeo('dispatch');
  wireDispatchElement('#ccrDispatch');
});
