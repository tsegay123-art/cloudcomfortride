import wixLocationFrontend from 'wix-location-frontend';
import { wireAllMasterCustomElements } from 'public/veloPageBridge';

$w.onReady(function () {
  const path = wixLocationFrontend.path && wixLocationFrontend.path.length
    ? `/${wixLocationFrontend.path.join('/')}`
    : '/';

  wireAllMasterCustomElements(path);

  // Hide default Wix Login Bar & Shopping Cart icons if still placed in the Wix Studio header
  ['#loginBar1', '#accountNavBar1', '#shoppingCartIcon1', '#cartIcon1'].forEach((id) => {
    try {
      const el = $w(id);
      if (el && typeof el.collapse === 'function') el.collapse();
      if (el && typeof el.hide === 'function') el.hide();
    } catch (e) {
      // Ignore if element is not on page
    }
  });
});
