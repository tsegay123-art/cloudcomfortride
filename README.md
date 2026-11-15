# Cloud Comfort Ride — Wix Studio & Velo Website

Safe, reliable, and caring Non-Emergency Medical Transportation (NEMT) in Seattle & King County.

- **Design Reference:** https://cloud-comfort-ride-flame.vercel.app/
- **Office:** 1902 E Yesler Way Unit #4, Seattle, WA 98122
- **Dispatch Phone:** (206) 327-4411
- **Email:** info@cloudmedicaltrans.com

## Project Structure

- `src/pages/` — Velo page scripts (`masterPage.js`, `Home.c1dmp.js`, `About Us.drkx6.js`, `Why Cloud Medical.it7h9.js`, `Services.js`, `Book A Ride.js`, `My Bookings.js`, `Contact.js`, `Privacy Policy.aztx0.js`, `Terms of Service.tqouh.js`).
- `src/public/custom-elements/` — Isolated Web Components (`ccr-header`, `ccr-footer`, `ccr-home-page`, `ccr-services-page`, `ccr-about-page`, `ccr-safety-page`, `ccr-booking-form`, `ccr-book-ride-page`, `ccr-my-bookings-page`, `ccr-contact-page`, `ccr-legal-page`).
- `src/public/companyData.js` — Authoritative services, fleet, driver standards, testimonials, and FAQ data.
- `src/public/bookingHelpers.js` & `src/public/veloPageBridge.js` — Validation, printable trip voucher markup, and Velo event/navigation wiring.
- `src/backend/` — Velo backend web modules (`bookingService.jsw`, `contactService.jsw`, `dataService.jsw`, `permissions.json`).

## Local Development (Wix CLI)

```bash
npm install --ignore-scripts
wix login
wix dev
```
