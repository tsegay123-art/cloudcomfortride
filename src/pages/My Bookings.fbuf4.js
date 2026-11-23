import wixLocationFrontend from 'wix-location-frontend';
import { resolveWixRoute } from 'public/veloPageBridge';

$w.onReady(function () {
  const target = resolveWixRoute('/my-booking');
  wixLocationFrontend.to(target);
});
