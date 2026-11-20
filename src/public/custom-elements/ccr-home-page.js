import { COMPANY_INFO, IMAGES, TESTIMONIALS } from '../companyData';
import { CCR_SHARED_CSS, dispatchCcrNavigation, ensureGoogleFonts, initScrollReveals, syncThemeHost } from './ccr-styles';
import './ccr-booking-form';

if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
  class CcrHomePage extends HTMLElement {
    static get observedAttributes() {
      return ['initial-service', 'booking-result', 'booking-error'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._onThemeSync = () => syncThemeHost(this);
    }

    attributeChangedCallback(name, _oldVal, newVal) {
      const form = this.shadowRoot && this.shadowRoot.getElementById('home-booking-form');
      if (form && newVal !== null) {
        form.setAttribute(name, newVal);
      }
    }

    connectedCallback() {
      ensureGoogleFonts();
      syncThemeHost(this);
      window.addEventListener('ccr-theme-change', this._onThemeSync);
      this.render();
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          const pre = window.sessionStorage.getItem('ccr_selected_service');
          if (pre) {
            const form = this.shadowRoot && this.shadowRoot.getElementById('home-booking-form');
            if (form) form.setAttribute('initial-service', pre);
          }
        } catch (e) {
          // Ignore
        }
      }
      if (typeof window !== 'undefined' && (window.location.hash === '#request' || window.location.search.includes('book=1'))) {
        setTimeout(() => {
          const req = this.shadowRoot && this.shadowRoot.getElementById('request');
          if (req) req.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }

    disconnectedCallback() {
      window.removeEventListener('ccr-theme-change', this._onThemeSync);
    }

    _navigate(path, serviceId = '') {
      let routeMap = {};
      try {
        const rawMap = this.getAttribute('route-map');
        if (rawMap) routeMap = JSON.parse(rawMap);
      } catch (e) {
        routeMap = {};
      }
      const mapped = routeMap[path] || path;
      if ((path === '/book-a-ride' || path === '/book-online') && mapped.includes('#request')) {
        if (serviceId) {
          const form = this.shadowRoot && this.shadowRoot.getElementById('home-booking-form');
          if (form) form.setAttribute('initial-service', serviceId);
        }
        const req = this.shadowRoot && this.shadowRoot.getElementById('request');
        if (req) req.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      dispatchCcrNavigation(this, path, serviceId);
    }

    render() {
      const galleryCards = [
        {
          badge: 'Sedan & SUV',
          goldBadge: false,
          img: IMAGES.clinicPickupSedan,
          alt: 'Driver assisting elderly passenger out of sedan outside Medical Clinic intake entrance',
          title: 'Sedan & SUV Options',
          sub: 'Comfortable rides for every need',
          desc: 'Dependable, low-step transportation for routine check-ups, diagnostic appointments, and outpatient clinic visits.',
          cta: 'Book Sedan / SUV',
          service: 'non_emergency_medical'
        },
        {
          badge: 'Wheelchair Van & Lift',
          goldBadge: true,
          img: IMAGES.wheelchairSeattleSkyline,
          alt: 'Driver assisting senior woman in motorized wheelchair on accessible van lift with Seattle Space Needle skyline',
          title: 'Wheelchair Accessible Vans',
          sub: 'Safe and easy entry and exit',
          desc: 'Commercial hydraulic lifts and gentle ramps, certified 4-point Q-Straint floor tie-downs, and patient boarding assistance.',
          cta: 'Book Wheelchair Van',
          service: 'wheelchair'
        },
        {
          badge: 'Spacious Cabin',
          goldBadge: false,
          img: IMAGES.cleanVanInterior,
          alt: 'Spacious leather passenger van interior with captain chairs and panoramic sunroof',
          title: 'Spacious & Comfortable',
          sub: 'Relax and feel at ease',
          desc: 'Spotless leather seating, climate control, and room for family companions, health aides, or medical supplies.',
          cta: 'Schedule Comfort Ride',
          service: 'senior_private_pay'
        },
        {
          badge: 'Hospital & Clinic',
          goldBadge: false,
          img: IMAGES.medicalCenterVanDoctor,
          alt: 'Healthcare professional assisting patient in wheelchair on accessible vehicle ramp outside hospital clinic',
          title: 'Assistance When You Need It',
          sub: 'From door to destination',
          desc: 'CPR and First Aid certified drivers providing door-through-door escort into hospital departments and clinic check-ins.',
          cta: 'Request Assisted Ride',
          service: 'hospital_discharge'
        }
      ];

      const serviceCards = [
        {
          num: '01',
          icon: '✚',
          img: IMAGES.clinicPickupSedan,
          title: 'Non-Emergency Medical',
          desc: 'Support getting to healthcare appointments and treatments—without the stress of driving yourself.',
          points: ['Doctor appointments & check-ups', 'Specialist consultations & lab work', 'Hospital visits and clinical care'],
          service: 'non_emergency_medical'
        },
        {
          num: '02',
          icon: '♿',
          img: IMAGES.wheelchairSeattleSkyline,
          title: 'Wheelchair Transportation',
          desc: 'Thoughtful transportation for passengers who need a wheelchair-accessible ride with ramps and lifts.',
          points: ['Accessible vehicle hydraulic lifts & ramps', 'Certified 4-point Q-Straint tie downs', 'Door-to-door boarding assistance'],
          service: 'wheelchair'
        },
        {
          num: '03',
          icon: '◷',
          img: IMAGES.medicalCenterVanDoctor,
          title: 'Dialysis Transportation',
          desc: 'Dependable and secure transportation for regular dialysis treatments with strict punctuality.',
          points: ['Consistent familiar driver assignments', 'Scheduled recurring chair times', 'Gentle post-treatment ride home'],
          service: 'dialysis'
        },
        {
          num: '04',
          icon: '↗',
          img: IMAGES.driverWellnessCenter,
          title: 'Physical Therapy Transit',
          desc: 'Ensuring easy access to physical therapy sessions, crucial for healing and overall health.',
          points: ['Post-operative rehabilitation visits', 'Support with walkers and crutches', 'Hassle-free recovery scheduling'],
          service: 'therapy'
        },
        {
          num: '05',
          icon: '⌂',
          img: IMAGES.wheelchairRampVan,
          title: 'Hospital Discharge',
          desc: 'Help arranging a ride home after a hospital stay, with assistance to your destination as agreed.',
          points: ['Rides home after a hospital stay', 'Destination assistance inside residence', 'Comfort-focused transportation'],
          service: 'hospital_discharge'
        },
        {
          num: '06',
          icon: '▣',
          img: IMAGES.cleanVanInterior,
          title: 'Senior & Companion Rides',
          desc: 'Dependable rides that help make everyday appointments and personal healthcare visits easier to reach.',
          points: ['Companion transportation welcomed', 'Hassle-free transparent billing', 'Direct phone reservation support'],
          service: 'senior_private_pay'
        }
      ];

      this.shadowRoot.innerHTML = `
        <style>
          ${CCR_SHARED_CSS}
          .hero {
            position: relative;
            min-height: 560px;
            display: flex;
            align-items: center;
            background: #061f46;
            color: #ffffff;
            overflow: hidden;
            border-bottom: 2px solid #f3bf28;
          }
          .hero-bg {
            position: absolute;
            inset: 0;
            z-index: 0;
          }
          .hero-bg img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: 80% center;
          }
          .hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(6,31,70,0.88) 0%, rgba(6,31,70,0.72) 55%, rgba(6,31,70,0.92) 100%);
          }
          @media (min-width: 768px) {
            .hero-overlay {
              background: linear-gradient(90deg, #061f46 0%, rgba(6,31,70,0.95) 45%, rgba(6,31,70,0.4) 100%);
            }
          }
          .hero-content {
            position: relative;
            z-index: 2;
            padding: 44px 0;
            max-width: 640px;
            margin-right: auto;
            text-align: left;
          }
          @media (min-width: 768px) {
            .hero-content {
              padding: 64px 0 64px clamp(8px, 2.5vw, 36px);
            }
          }
          .hero .badge-pill {
            font-size: 12px;
            padding: 6px 12px;
          }
          @media (min-width: 640px) {
            .hero .badge-pill {
              font-size: 14px;
              padding: 7px 16px;
            }
          }
          .hero h1 {
            font-size: clamp(34px, 4.8vw, 60px);
            font-weight: 800;
            line-height: 1.08;
            color: #ffffff;
            margin: 20px 0 18px;
            text-shadow: 0 2px 14px rgba(4, 19, 41, 0.5);
          }
          .hero-sub {
            font-size: clamp(17px, 1.4vw, 20px);
            color: #f1f5f9;
            line-height: 1.65;
            max-width: 580px;
            margin-bottom: 24px;
          }
          .hero-ctas {
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
            margin-bottom: 24px;
          }
          .hero-checks {
            padding-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.22);
            display: flex;
            flex-wrap: wrap;
            gap: 12px 20px;
            font-size: 15px;
            font-weight: 600;
            color: #f1f5f9;
            margin-bottom: 16px;
          }
          .fleet-pill {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 9px 16px;
            border-radius: 12px;
            background: rgba(4, 19, 41, 0.88);
            border: 1px solid rgba(243, 191, 40, 0.45);
            font-size: 14px;
          }
          .feature-strip {
            background: var(--surface);
            border-bottom: 1px solid var(--line);
            padding: 18px 0;
          }
          .feature-pills {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
          }
          .f-pill {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 9px 16px;
            border-radius: 9999px;
            background: var(--surface-alt);
            border: 1px solid var(--card-border);
            font-size: 15px;
            font-weight: 700;
          }
          .f-dot {
            width: 26px;
            height: 26px;
            border-radius: 9999px;
            color: #ffffff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
          }
          .promise-ribbon {
            background: #04152f;
            border-top: 1px solid #d6a51b;
            color: #ffffff;
            padding: 16px 0;
          }
          .promise-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 14px;
            font-size: 15px;
            font-weight: 700;
          }
          .sec { padding: 72px 0; background: var(--surface); }
          .sec-alt { padding: 72px 0; background: var(--surface-alt); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
          .sec-head { text-align: center; max-width: 720px; margin: 0 auto 44px; }
          .sec-head h2 { font-size: clamp(28px, 3.8vw, 42px); font-weight: 800; color: var(--ink); margin: 10px 0 12px; }
          .sec-head p { font-size: clamp(16px, 1.3vw, 18px); color: var(--muted); line-height: 1.65; }
          .flagship {
            border-radius: 24px;
            overflow: hidden;
            border: 2px solid #f3bf28;
            background: linear-gradient(90deg, #061f46 0%, #092b5a 50%, #061f46 100%);
            color: #ffffff;
            display: grid;
            grid-template-columns: 1fr;
            margin-bottom: 36px;
          }
          @media (min-width: 1024px) { .flagship { grid-template-columns: 7fr 5fr; align-items: center; } }
          .flagship img { width: 100%; height: 100%; min-height: 260px; object-fit: cover; display: block; }
          .flagship-body { padding: 28px; display: flex; flex-direction: column; gap: 14px; }
          .grid-4 { display: grid; grid-template-columns: 1fr; gap: 24px; }
          @media (min-width: 640px) { .grid-4 { grid-template-columns: 1fr 1fr; } }
          @media (min-width: 1200px) { .grid-4 { grid-template-columns: repeat(4, 1fr); } }
          .grid-3 { display: grid; grid-template-columns: 1fr; gap: 26px; }
          @media (min-width: 768px) { .grid-3 { grid-template-columns: 1fr 1fr; } }
          @media (min-width: 1100px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }
          .card-img-wrap { position: relative; aspect-ratio: 16 / 10; min-height: 220px; width: 100%; overflow: hidden; background: #0f172a; }
          .card-img-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: center 22%; transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); display: block; }
          .card:hover .card-img-wrap img { transform: scale(1.06); }
          .card-tag {
            position: absolute;
            top: 12px;
            left: 12px;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 800;
            background: rgba(6, 31, 70, 0.92);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          }
          .card-tag.gold { background: #f3bf28; color: #061f46; }
          .card-body { padding: 24px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
          .card-btn {
            width: 100%;
            min-height: 50px;
            border-radius: 12px;
            border: 2px solid #061f46;
            background: transparent;
            color: var(--ink);
            font-weight: 700;
            font-size: 16px;
            transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
          }
          .card-btn:hover { background: #061f46; color: #ffffff; transform: translateY(-2px); }
          :host([data-theme="dark"]) .card-btn { border-color: #334155; }
          :host([data-theme="dark"]) .card-btn:hover { background: #f3bf28; color: #061f46; border-color: #f3bf28; }
          .svc-card { border-top: 4px solid #f3bf28; display: flex; flex-direction: column; justify-content: space-between; }
          .svc-card:hover { transform: translateY(-6px); border-color: #f3bf28; }
          .svc-list { list-style: none; padding: 0; margin: 12px 0 0; display: flex; flex-direction: column; gap: 10px; font-size: 17px; color: var(--ink); line-height: 1.6; }
          .svc-cta-btn {
            width: 100%;
            min-height: 48px;
            padding: 12px 18px;
            border-radius: 10px;
            border: 1.5px solid var(--card-border);
            background: var(--surface-alt);
            color: var(--ink);
            font-family: 'Manrope', sans-serif;
            font-weight: 800;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          }
          .svc-cta-btn .arrow { transition: transform 0.2s ease; color: var(--gold-accent); font-size: 18px; }
          .svc-card:hover .svc-cta-btn { background: #061f46; color: #ffffff; border-color: #061f46; }
          .svc-card:hover .svc-cta-btn .arrow { color: #f3bf28; transform: translateX(4px); }
          :host([data-theme="dark"]) .svc-card:hover .svc-cta-btn { background: #f3bf28; color: #061f46; border-color: #f3bf28; }
          :host([data-theme="dark"]) .svc-card:hover .svc-cta-btn .arrow { color: #061f46; }
          .pillar { border-top: 1px solid var(--line); padding-top: 20px; }
          .pillar-icon {
            width: 44px;
            height: 44px;
            border-radius: 9999px;
            background: #fff4d7;
            color: #aa8122;
            border: 1px solid #f3bf28;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 800;
            margin-bottom: 12px;
          }
          .contact-bar {
            background: linear-gradient(90deg, #061a38 0%, #0c3268 100%);
            color: #ffffff;
            padding: 56px 0;
            border-top: 5px solid #f3bf28;
          }
          .contact-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            padding-top: 28px;
            border-top: 1px solid rgba(255,255,255,0.2);
            text-align: center;
          }
          @media (min-width: 640px) { .contact-grid { grid-template-columns: repeat(3, 1fr); } }
        </style>

        <!-- HERO -->
        <section class="hero">
          <div class="hero-bg">
            <img src="${IMAGES.heroBrandedVanPanoramic}" alt="Cloud Comfort Ride branded medical transit van in Seattle" />
            <div class="hero-overlay"></div>
          </div>
          <div class="container">
            <div class="hero-content anim-enter">
              <div class="badge-pill"><span class="pulse-dot"></span> Serving Seattle &amp; Surrounding Washington</div>
              <h1>Every Ride. <br /><span style="color:#f3bf28;">More Comfort. More Care.</span></h1>
              <p class="hero-sub">
                Safe, comfortable non-emergency medical transportation in Seattle. Our dedicated drivers provide respectful curb-to-clinic and door-through-door care.
              </p>
              <div class="hero-ctas">
                <button class="dt-button" id="hero-book">📅 Book a Ride <span style="color:#f3bf28">→</span></button>
                <a class="dt-button-outline" style="background:rgba(6,31,70,0.8);color:#fff;border-color:rgba(255,255,255,0.4);" href="tel:${COMPANY_INFO.phoneRaw}">
                  <span style="color:#f3bf28">☎</span> Call Us: ${COMPANY_INFO.phoneDisplay}
                </a>
              </div>
              <div class="hero-checks">
                <span>✓ Routine Clinic Visits</span>
                <span>✓ Dialysis Priority</span>
                <span>✓ Physical Therapy</span>
                <span>✓ Hospital Discharge</span>
              </div>
              <div class="fleet-pill">
                <span style="width:8px;height:8px;border-radius:9999px;background:#34d399;display:inline-block;"></span>
                <strong style="color:#f3bf28;">Cloud Comfort Ride Official Fleet:</strong>
                <span style="color:#cbd5e1;">"Safe Rides. Better Days."</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 5 FEATURE PILLS -->
        <div class="feature-strip">
          <div class="container feature-pills">
            <div class="f-pill"><span class="f-dot" style="background:#2563eb;">🛡</span> Safe &amp; Professional Drivers</div>
            <div class="f-pill"><span class="f-dot" style="background:#14b8a6;">♡</span> Compassionate Assistance</div>
            <div class="f-pill"><span class="f-dot" style="background:#9333ea;">◷</span> On-Time Service</div>
            <div class="f-pill"><span class="f-dot" style="background:#f59e0b;">♿</span> Full Accessibility Options</div>
            <div class="f-pill"><span class="f-dot" style="background:#059669;">★</span> Comfortable Journeys</div>
          </div>
        </div>

        <!-- PROMISE RIBBON -->
        <div class="promise-ribbon">
          <div class="container promise-grid">
            <div><span style="color:#f3bf28;margin-right:6px;">◇</span> Safety-minded medical transport</div>
            <div><span style="color:#f3bf28;margin-right:6px;">♡</span> Care and dignity in every journey</div>
            <div><span style="color:#f3bf28;margin-right:6px;">◷</span> Reliable on-time clinic dispatch</div>
          </div>
        </div>

        <!-- GALLERY & FLEET -->
        <section class="sec" id="gallery">
          <div class="container">
            <div class="sec-head">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Fleet &amp; Accessibility Showcase</span>
              <h2>Comfort and Accessibility for Every Journey</h2>
              <p>Explore our versatile fleet and dedicated passenger care options, tailored to keep you safe and comfortable from door to destination.</p>
            </div>

            <div class="flagship">
              <img src="${IMAGES.heroBrandedVanPanoramic}" alt="Cloud Comfort Ride official branded medical transit vehicle in Seattle" />
              <div class="flagship-body">
                <span class="badge-pill" style="align-self:flex-start;">★ Flagship Seattle Fleet</span>
                <h3 style="font-size:clamp(22px,2.4vw,30px);font-weight:800;color:#fff;line-height:1.2;">Custom-Branded Medical Transportation Vans</h3>
                <p style="font-size:16px;color:#e2e8f0;line-height:1.65;">
                  Our official Seattle vehicles feature high roofs, gentle-grade ADA entry steps, low boarding thresholds, stability grab handles, and dedicated rollator walker storage. Operated by certified, empathetic drivers who escort you straight to your clinical check-in.
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:12px;padding-top:8px;">
                  <button class="dt-button" data-book="non_emergency_medical">Book Accessible Transit →</button>
                  <a class="dt-button-outline" style="background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.35);" href="tel:${COMPANY_INFO.phoneRaw}">☎ Call (206) 327-4411</a>
                </div>
              </div>
            </div>

            <div class="grid-4">
              ${galleryCards.map((c) => `
                <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;">
                  <div>
                    <div class="card-img-wrap">
                      <img src="${c.img}" alt="${c.alt}" loading="lazy" />
                      <span class="card-tag ${c.goldBadge ? 'gold' : ''}">${c.badge}</span>
                    </div>
                    <div class="card-body">
                      <h3 style="font-size:clamp(22px,2vw,26px);font-weight:800;">${c.title}</h3>
                      <div style="font-size:17px;font-weight:700;color:#0369a1;">${c.sub}</div>
                      <p style="font-size:18px;color:var(--ink);line-height:1.65;">${c.desc}</p>
                    </div>
                  </div>
                  <div style="padding:0 24px 24px;">
                    <button class="card-btn" data-book="${c.service}">${c.cta}</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- SERVICES -->
        <section class="sec-alt reveal" id="services">
          <div class="container">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:44px;">
              <div>
                <span class="eyebrow"><span class="eyebrow-dot"></span> How we can help</span>
                <h2 style="font-size:clamp(28px,3.8vw,44px);font-weight:800;margin-top:8px;">Transportation for <span style="color:var(--gold-accent);">real life.</span></h2>
              </div>
              <p style="font-size:clamp(17px,1.25vw,19px);color:var(--muted);max-width:440px;line-height:1.65;">From important appointments to everyday destinations, explore the ride options available through Cloud Comfort Ride.</p>
            </div>

            <div class="grid-3">
              ${serviceCards.map((s) => `
                <article class="card svc-card">
                  <div>
                    <div class="card-img-wrap"><img src="${s.img}" alt="${s.title}" loading="lazy" /></div>
                    <div class="card-body" style="position:relative;">
                      <span style="position:absolute;right:22px;top:22px;font-size:15px;font-weight:800;color:var(--ink);background:var(--surface-alt);padding:4px 12px;border-radius:9999px;border:1px solid var(--card-border);">${s.num}</span>
                      <div style="width:48px;height:48px;border-radius:9999px;background:#eaf2ff;color:#123e77;border:2px solid #8ca5c5;display:flex;align-items:center;justify-content:center;font-size:20px;">${s.icon}</div>
                      <h3 style="font-size:clamp(23px,2.1vw,27px);font-weight:800;">${s.title}</h3>
                      <p style="font-size:18px;color:var(--ink);line-height:1.65;">${s.desc}</p>
                      <ul class="svc-list">
                        ${s.points.map((pt) => `<li><span style="color:#b88b23;font-weight:900;">✓</span> ${pt}</li>`).join('')}
                      </ul>
                    </div>
                  </div>
                  <div style="padding:0 24px 24px;">
                    <button class="svc-cta-btn" data-book="${s.service}">
                      <span>Book this ride</span>
                      <span class="arrow">→</span>
                    </button>
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- ABOUT VALUES -->
        <section class="sec reveal">
          <div class="container">
            <div style="max-width:680px;margin-bottom:36px;">
              <span class="eyebrow"><span class="eyebrow-dot"></span> A ride you can feel good about</span>
              <h2 style="font-size:clamp(28px,3.8vw,42px);font-weight:800;margin:10px 0 14px;">More than a ride.<br /><span style="color:var(--gold-accent);">A caring experience.</span></h2>
              <p style="font-size:17px;color:var(--muted);line-height:1.65;">
                Getting from one place to another can be a big part of someone’s day. We aim to make that journey feel easier with respectful service, clear communication, and attention to each passenger’s needs.
              </p>
            </div>

            <div class="grid-3">
              <article class="card">
                <div class="card-img-wrap"><img src="${IMAGES.clinicPickupSedan}" alt="Respect at every step" loading="lazy" /></div>
                <div class="card-body">
                  <strong style="font-size:21px;font-family:'Manrope',sans-serif;">Respect at every step</strong>
                  <p style="font-size:16px;color:var(--muted);line-height:1.6;">We treat every passenger with dignity, patience, and kindness.</p>
                </div>
              </article>
              <article class="card">
                <div class="card-img-wrap"><img src="${IMAGES.medicalCenterVanDoctor}" alt="Communication you can count on" loading="lazy" /></div>
                <div class="card-body">
                  <strong style="font-size:21px;font-family:'Manrope',sans-serif;">Communication you can count on</strong>
                  <p style="font-size:16px;color:var(--muted);line-height:1.6;">We’ll work with you and your clinic to coordinate your ride request.</p>
                </div>
              </article>
              <article class="card">
                <div class="card-img-wrap"><img src="${IMAGES.wheelchairSeattleSkyline}" alt="Thoughtful transportation" loading="lazy" /></div>
                <div class="card-body">
                  <strong style="font-size:21px;font-family:'Manrope',sans-serif;">Thoughtful transportation</strong>
                  <p style="font-size:16px;color:var(--muted);line-height:1.6;">Your destination and individual medical needs matter.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <!-- WHY US -->
        <section class="sec-alt">
          <div class="container">
            <div class="sec-head">
              <span class="eyebrow"><span class="eyebrow-dot"></span> The Cloud Comfort Ride difference</span>
              <h2>Care is in the <span style="color:var(--gold-accent);">details.</span></h2>
              <p>Our goal is to make arranging transportation clear and comfortable from the first conversation.</p>
            </div>
            <div class="grid-4">
              <div class="pillar"><div class="pillar-icon">♡</div><h3 style="font-size:21px;font-weight:800;margin-bottom:8px;">Caring service</h3><p style="font-size:16px;color:var(--muted);line-height:1.6;">A courteous, passenger-first approach on every trip across Seattle.</p></div>
              <div class="pillar"><div class="pillar-icon">✓</div><h3 style="font-size:21px;font-weight:800;margin-bottom:8px;">Reliable communication</h3><p style="font-size:16px;color:var(--muted);line-height:1.6;">We review requests, coordinate timing, and communicate next steps clearly.</p></div>
              <div class="pillar"><div class="pillar-icon">⌖</div><h3 style="font-size:21px;font-weight:800;margin-bottom:8px;">Local Seattle focus</h3><p style="font-size:16px;color:var(--muted);line-height:1.6;">Centrally located at 1902 E Yesler Way, serving Seattle &amp; King County.</p></div>
              <div class="pillar"><div class="pillar-icon">✧</div><h3 style="font-size:21px;font-weight:800;margin-bottom:8px;">Personal attention</h3><p style="font-size:16px;color:var(--muted);line-height:1.6;">Dedicated drivers assigned to clinics, fostering familiarity and trust.</p></div>
            </div>
          </div>
        </section>

        <!-- REVIEWS & GOOGLE PROFILE -->
        <section class="sec reveal" id="reviews">
          <div class="container">
            <div class="sec-head">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Verified Patient &amp; Facility Reviews</span>
              <h2>Trusted Across <span style="color:var(--gold-accent);">Seattle &amp; King County</span></h2>
              <p>Serving patients, families, and medical discharge coordinators from our Seattle headquarters at 1902 E Yesler Way Unit #4.</p>
            </div>
            <div class="grid-3" style="margin-bottom:44px;">
              ${TESTIMONIALS.map((t) => `
                <article class="card" style="padding:26px;display:flex;flex-direction:column;justify-content:space-between;gap:14px;border-top:4px solid #f3bf28;">
                  <div>
                    <div style="color:#f59e0b;font-size:18px;letter-spacing:2px;margin-bottom:10px;">★★★★★</div>
                    <p style="font-size:17px;color:var(--ink);line-height:1.65;">“${t.quote}”</p>
                  </div>
                  <div style="padding-top:14px;border-top:1px solid var(--line);">
                    <strong style="font-size:17px;display:block;">${t.name}</strong>
                    <span style="font-size:15px;color:var(--ink);display:block;margin-top:2px;">${t.role} • ${t.location}</span>
                  </div>
                </article>
              `).join('')}
            </div>

            <div class="card" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));overflow:hidden;border:2px solid var(--card-border);">
              <div style="padding:30px;display:flex;flex-direction:column;justify-content:center;gap:14px;">
                <span class="eyebrow"><span class="eyebrow-dot"></span> Google Business Profile</span>
                <h3 style="font-size:clamp(22px,2.2vw,28px);font-weight:800;">Seattle Dispatch &amp; Service Map</h3>
                <p style="font-size:17px;color:var(--ink);line-height:1.65;">
                  <strong>${COMPANY_INFO.brandName}</strong> (Cloud Medical Transportation)<br />
                  ${COMPANY_INFO.address}<br />
                  ${COMPANY_INFO.operatingHours}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:12px;padding-top:4px;">
                  <a class="dt-button" href="${COMPANY_INFO.mapsUrl}" target="_blank" rel="noopener noreferrer">📍 Open in Google Maps ↗</a>
                  <a class="dt-button-outline" href="tel:${COMPANY_INFO.phoneRaw}">☎ ${COMPANY_INFO.phoneDisplay}</a>
                </div>
              </div>
              <div style="min-height:300px;background:#e2e8f0;">
                <iframe
                  title="Cloud Comfort Ride Seattle Location Map"
                  src="${COMPANY_INFO.mapsEmbedUrl}"
                  style="width:100%;height:100%;min-height:300px;border:0;display:block;"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
            </div>
          </div>
        </section>

        <!-- INLINE BOOKING FORM -->
        <section class="sec-alt" id="request">
          <div class="container" style="max-width:1060px;">
            <div class="sec-head">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Let’s plan your trip</span>
              <h2>Book A <span style="color:var(--gold-accent);">Ride</span></h2>
              <p>Share a few details and our Seattle dispatch team will follow up to confirm vehicle availability and coordinates.</p>
            </div>
            <ccr-booking-form id="home-booking-form"></ccr-booking-form>
          </div>
        </section>

        <!-- CONTACT BAR -->
        <section class="contact-bar">
          <div class="container">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;padding-bottom:28px;">
              <div>
                <span style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1.6px;color:#f3bf28;">Direct Contact</span>
                <h2 style="font-size:clamp(28px,3.2vw,36px);font-weight:800;color:#fff;margin-top:6px;">We Want to Hear from You.</h2>
              </div>
              <p style="font-size:17px;color:#cbd5e1;max-width:460px;line-height:1.6;">Call us or message us for more info, or to coordinate recurring medical appointment transit.</p>
            </div>
            <div class="contact-grid">
              <a href="mailto:${COMPANY_INFO.email}" style="padding:12px;border-radius:12px;">
                <span style="font-size:14px;color:#cbd5e1;display:block;margin-bottom:4px;">Email Dispatch</span>
                <strong style="font-size:18px;color:#fff;">${COMPANY_INFO.email}</strong>
              </a>
              <a href="tel:${COMPANY_INFO.phoneRaw}" style="padding:12px;border-radius:12px;">
                <span style="font-size:14px;color:#cbd5e1;display:block;margin-bottom:4px;">Phone Dispatch</span>
                <strong style="font-size:20px;color:#fff;">${COMPANY_INFO.phoneDisplay}</strong>
              </a>
              <a href="${COMPANY_INFO.mapsUrl}" target="_blank" rel="noopener noreferrer" style="padding:12px;border-radius:12px;">
                <span style="font-size:14px;color:#cbd5e1;display:block;margin-bottom:4px;">Business Office (Open Map)</span>
                <strong style="font-size:17px;color:#fff;">${COMPANY_INFO.address}</strong>
              </a>
            </div>
          </div>
        </section>
      `;

      this.shadowRoot.getElementById('hero-book').addEventListener('click', () => this._navigate('/book-a-ride'));
      this.shadowRoot.querySelectorAll('[data-book]').forEach((btn) => {
        btn.addEventListener('click', () => this._navigate('/book-a-ride', btn.getAttribute('data-book')));
      });
      initScrollReveals(this.shadowRoot);
    }
  }

  if (!customElements.get('ccr-home-page')) {
    customElements.define('ccr-home-page', CcrHomePage);
  }
}
