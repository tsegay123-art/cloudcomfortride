import wixLocationFrontend from 'wix-location-frontend';
import { resolveWixRoute } from 'public/veloPageBridge';

$w.onReady(function () {
  wixLocationFrontend.to(resolveWixRoute('/book-a-ride'));
});
