import wixLocationFrontend from 'wix-location-frontend';
import { resolveWixRoute } from 'public/veloPageBridge';

$w.onReady(function () {
  const target = resolveWixRoute('/book-a-ride');
  wixLocationFrontend.to(target);
});
