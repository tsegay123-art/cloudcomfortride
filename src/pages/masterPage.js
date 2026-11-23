import wixLocationFrontend from 'wix-location-frontend';
import { wireAllMasterCustomElements } from 'public/veloPageBridge';

$w.onReady(function () {
  const pathArr = wixLocationFrontend.path || [];
  const path = `/${Array.isArray(pathArr) ? pathArr.join('/') : String(pathArr)}`.replace(/\/+$/, '') || '/';
  wireAllMasterCustomElements(path);
});
