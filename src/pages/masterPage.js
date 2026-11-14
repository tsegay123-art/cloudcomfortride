import wixLocationFrontend from 'wix-location-frontend';
import { wireHeaderElement, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  const path = wixLocationFrontend.path && wixLocationFrontend.path.length
    ? `/${wixLocationFrontend.path.join('/')}`
    : '/';

  wireHeaderElement('#ccrHeader', path);
  wireNavigationElement('#ccrFooter');
});
