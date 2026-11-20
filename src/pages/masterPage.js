import wixLocationFrontend from 'wix-location-frontend';
import { wireAllMasterCustomElements } from 'public/veloPageBridge';

$w.onReady(function () {
  const path = wixLocationFrontend.path && wixLocationFrontend.path.length
    ? `/${wixLocationFrontend.path.join('/')}`
    : '/';

  wireAllMasterCustomElements(path);
});
