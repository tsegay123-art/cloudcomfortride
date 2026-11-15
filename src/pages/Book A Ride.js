import { wireBookingElement, wireNavigationElement } from 'public/veloPageBridge';

$w.onReady(function () {
  wireNavigationElement('#ccrBookRide');
  wireBookingElement('#ccrBookRide');
});

