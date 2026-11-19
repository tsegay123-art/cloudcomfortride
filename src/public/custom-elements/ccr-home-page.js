import { COMPANY_INFO, IMAGES } from '../companyData';
import { CCR_SHARED_CSS, ensureGoogleFonts, syncThemeHost } from './ccr-styles';
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
    }

    disconnectedCallback() {
      window.removeEventListener('ccr-theme-change', this._onThemeSync);
    }

    _navigate(path, serviceId = '') {
      this.dispatchEvent(new CustomEvent('navigate', {
        detail: { path, serviceId },
        bubbles: true,
        composed: true
      }));
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
          img: IMAGES.driverSedanAssistance,
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
            background: linear-gradient(90deg, rgba(6,31,70,0.97) 0%, rgba(6,31,70,0.92) 48%, rgba(6,31,70,0.52) 100%);
          }
          .hero-content {
            position: relative;
            z-index: 2;
            padding: 64px 0;
            max-width: 700px;
          }
          .hero h1 {
            margin: 20px 0 18px;
          }
          .hero-sub {
            margin-bottom: 26px;
          }
          .hero-ctas {
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
            margin-bottom: 26px;
          }
          .hero-checks {
            padding-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.22);
            display: flex;
            flex-wrap: wrap;
            gap: 10px 20px;
            font-size: 13px;
            font-weight: 600;
            color: #f1f5f9;
            margin-bottom: 16px;
            text-shadow: 0 1px 2px rgba(3, 13, 26, 0.5);
          }
          .fleet-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 7px 14px;
            border-radius: 12px;
            background: rgba(4, 19, 41, 0.85);
            border: 1px solid rgba(243, 191, 40, 0.4);
            font-size: 12px;
          }
          .feature-strip {
            background: var(--surface);
            border-bottom: 1px solid var(--line);
            padding: 16px 0;
          }
          .feature-pills {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
          }
          .f-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 7px 14px;
            border-radius: 9999px;
            background: var(--surface-alt);
            border: 1px solid var(--card-border);
            font-size: 12px;
            font-weight: 700;
          }
          .f-dot {
            width: 24px;
            height: 24px;
            border-radius: 9999px;
            color: #ffffff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          }
          .promise-ribbon {
            background: #04152f;
            border-top: 1px solid #d6a51b;
            color: #ffffff;
            padding: 14px 0;
          }
          .promise-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 12px;
            font-size: 13px;
            font-weight: 700;
          }
          .sec { padding: 72px 0; background: var(--surface); }
          .sec-alt { padding: 72px 0; background: var(--surface-alt); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
          .sec-head { text-align: center; max-width: 700px; margin: 0 auto 44px; }
          .sec-head h2 { margin: 10px 0 12px; }
          .sec-head p { margin: 0 auto; }
          .card:hover {
            transform: translateY(-3px);
            box-shadow: 0 20px 44px rgba(6, 31, 70, 0.1);
            border-color: #8ca5c5;
          }
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
          .grid-4 { display: grid; grid-template-columns: 1fr; gap: 20px; }
          @media (min-width: 640px) { .grid-4 { grid-template-columns: 1fr 1fr; } }
          @media (min-width: 1024px) { .grid-4 { grid-template-columns: repeat(4, 1fr); } }
          .grid-3 { display: grid; grid-template-columns: 1fr; gap: 22px; }
          @media (min-width: 768px) { .grid-3 { grid-template-columns: 1fr 1fr; } }
          @media (min-width: 1024px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }
          .card-img-wrap { position: relative; height: 180px; overflow: hidden; }
          .card-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
          .card:hover .card-img-wrap img { transform: scale(1.05); }
          .card-tag {
            position: absolute;
            top: 10px;
            left: 10px;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 800;
            background: rgba(6, 31, 70, 0.88);
            color: #ffffff;
          }
          .card-tag.gold { background: #f3bf28; color: #061f46; }
          .card-body { padding: 18px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
          .card-btn {
            width: 100%;
            min-height: 44px;
            border-radius: 10px;
            border: 1.5px solid #061f46;
            background: transparent;
            color: var(--ink);
            font-weight: 700;
            font-size: 12px;
          }
          .card-btn:hover { background: #061f46; color: #ffffff; }
          :host([data-theme="dark"]) .card-btn { border-color: #334155; }
          :host([data-theme="dark"]) .card-btn:hover { background: #f3bf28; color: #061f46; border-color: #f3bf28; }
          .svc-card { border-top: 3px solid #f3bf28; display: flex; flex-direction: column; justify-content: space-between; }
          .svc-list { list-style: none; padding: 0; margin: 12px 0 0; display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; line-height: 1.5; color: var(--muted-readable); }
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
            <div class="hero-content">
              <div class="badge-pill"><span class="pulse-dot"></span> Serving Seattle &amp; Surrounding Washington</div>
              <h1 class="ccr-hero-title">Every Ride. <br /><span class="ccr-hero-title-accent">More Comfort. More Care.</span></h1>
              <p class="hero-sub ccr-hero-lead">
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
              <h2 class="ccr-section-title">Comfort and Accessibility for Every Journey</h2>
              <p class="ccr-section-lead">Explore our versatile fleet and dedicated passenger care options, tailored to keep you safe and comfortable from door to destination.</p>
            </div>

            <div class="flagship">
              <img src="${IMAGES.heroBrandedVanPanoramic}" alt="Cloud Comfort Ride official branded medical transit vehicle in Seattle" />
              <div class="flagship-body">
                <span class="badge-pill" style="align-self:flex-start;">★ Flagship Seattle Fleet</span>
                <h3 class="ccr-section-title-dark" style="font-size:clamp(1.375rem, 2.4vw, 1.85rem);">Custom-Branded Medical Transportation Vans</h3>
                <p style="font-size:15px;color:#e2e8f0;line-height:1.68;">
                  Our official Seattle vehicles feature high roofs, gentle-grade ADA entry steps, low boarding thresholds, stability grab handles, and dedicated rollator walker storage. Operated by certified, empathetic drivers who escort you straight to your clinical check-in.
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:10px;padding-top:6px;">
                  <button class="dt-button" data-book="non_emergency_medical">Book Accessible Transit →</button>
                  <a class="dt-button-outline" style="background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.3);" href="tel:${COMPANY_INFO.phoneRaw}">☎ Call (206) 327-4411</a>
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
                      <h3 class="ccr-card-title">${c.title}</h3>
                      <div style="font-size:12.5px;font-weight:700;color:#0369a1;">${c.sub}</div>
                      <p class="ccr-card-desc">${c.desc}</p>
                    </div>
                  </div>
                  <div style="padding:0 18px 18px;">
                    <button class="card-btn" data-book="${c.service}">${c.cta}</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- SERVICES -->
        <section class="sec-alt" id="services">
          <div class="container">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:40px;">
              <div>
                <span class="eyebrow"><span class="eyebrow-dot"></span> How we can help</span>
                <h2 class="ccr-section-title" style="margin-top:8px;">Transportation for <span style="color:var(--gold-accent);">real life.</span></h2>
              </div>
              <p class="ccr-section-lead" style="max-width:400px;">From important appointments to everyday destinations, explore the ride options available through Cloud Comfort Ride.</p>
            </div>

            <div class="grid-3">
              ${serviceCards.map((s) => `
                <article class="card svc-card">
                  <div>
                    <div class="card-img-wrap"><img src="${s.img}" alt="${s.title}" loading="lazy" /></div>
                    <div class="card-body" style="position:relative;">
                      <span style="position:absolute;right:18px;top:18px;font-size:12px;font-weight:800;color:#64748b;">${s.num}</span>
                      <div style="width:40px;height:40px;border-radius:9999px;background:#eaf2ff;color:#123e77;border:2px solid #8ca5c5;display:flex;align-items:center;justify-content:center;font-size:17px;">${s.icon}</div>
                      <h3 class="ccr-card-title">${s.title}</h3>
                      <p class="ccr-card-desc">${s.desc}</p>
                      <ul class="svc-list">
                        ${s.points.map((pt) => `<li><span style="color:#b88b23;font-weight:900;">✓</span> ${pt}</li>`).join('')}
                      </ul>
                    </div>
                  </div>
                  <div style="padding:12px 18px;border-top:1px solid var(--line);">
                    <button data-book="${s.service}" style="background:none;border:none;color:var(--ink-strong);font-weight:800;font-size:13.5px;padding:6px 0;">
                      Book this ride →
                    </button>
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- ABOUT VALUES -->
        <section class="sec">
          <div class="container">
            <div style="max-width:660px;margin-bottom:36px;">
              <span class="eyebrow"><span class="eyebrow-dot"></span> A ride you can feel good about</span>
              <h2 class="ccr-section-title" style="margin:10px 0 14px;">More than a ride.<br /><span style="color:var(--gold-accent);">A caring experience.</span></h2>
              <p class="ccr-section-lead">
                Getting from one place to another can be a big part of someone’s day. We aim to make that journey feel easier with respectful service, clear communication, and attention to each passenger’s needs.
              </p>
            </div>

            <div class="grid-3">
              <article class="card">
                <div class="card-img-wrap"><img src="${IMAGES.clinicPickupSedan}" alt="Respect at every step" loading="lazy" /></div>
                <div class="card-body">
                  <strong class="ccr-card-title">Respect at every step</strong>
                  <p class="ccr-card-desc">We treat every passenger with dignity, patience, and kindness.</p>
                </div>
              </article>
              <article class="card">
                <div class="card-img-wrap"><img src="${IMAGES.medicalCenterVanDoctor}" alt="Communication you can count on" loading="lazy" /></div>
                <div class="card-body">
                  <strong class="ccr-card-title">Communication you can count on</strong>
                  <p class="ccr-card-desc">We’ll work with you and your clinic to coordinate your ride request.</p>
                </div>
              </article>
              <article class="card">
                <div class="card-img-wrap"><img src="${IMAGES.wheelchairSeattleSkyline}" alt="Thoughtful transportation" loading="lazy" /></div>
                <div class="card-body">
                  <strong class="ccr-card-title">Thoughtful transportation</strong>
                  <p class="ccr-card-desc">Your destination and individual medical needs matter.</p>
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
              <h2 class="ccr-section-title">Care is in the <span style="color:var(--gold-accent);">details.</span></h2>
              <p class="ccr-section-lead">Our goal is to make arranging transportation clear and comfortable from the first conversation.</p>
            </div>
            <div class="grid-4">
              <div class="pillar"><div class="pillar-icon">♡</div><h3 class="ccr-card-title" style="margin-bottom:8px;">Caring service</h3><p class="ccr-card-desc">A courteous, passenger-first approach on every trip across Seattle.</p></div>
              <div class="pillar"><div class="pillar-icon">✓</div><h3 class="ccr-card-title" style="margin-bottom:8px;">Reliable communication</h3><p class="ccr-card-desc">We review requests, coordinate timing, and communicate next steps clearly.</p></div>
              <div class="pillar"><div class="pillar-icon">⌖</div><h3 class="ccr-card-title" style="margin-bottom:8px;">Local Seattle focus</h3><p class="ccr-card-desc">Centrally located at 1902 E Yesler Way, serving Seattle &amp; King County.</p></div>
              <div class="pillar"><div class="pillar-icon">✧</div><h3 class="ccr-card-title" style="margin-bottom:8px;">Personal attention</h3><p class="ccr-card-desc">Dedicated drivers assigned to clinics, fostering familiarity and trust.</p></div>
            </div>
          </div>
        </section>

        <!-- INLINE BOOKING FORM -->
        <section class="sec" id="request">
          <div class="container" style="max-width:900px;">
            <div class="sec-head">
              <span class="eyebrow"><span class="eyebrow-dot"></span> Let’s plan your trip</span>
              <h2 class="ccr-section-title">Book A <span style="color:var(--gold-accent);">Ride</span></h2>
              <p class="ccr-section-lead">Share a few details and our Seattle dispatch team will follow up to confirm vehicle availability and coordinates.</p>
            </div>
            <ccr-booking-form id="home-booking-form"></ccr-booking-form>
          </div>
        </section>

        <!-- CONTACT BAR -->
        <section class="contact-bar">
          <div class="container">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;padding-bottom:28px;">
              <div>
                <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.8px;color:#f3bf28;">Direct Contact</span>
                <h2 class="ccr-section-title-dark" style="margin-top:6px;">We Want to Hear from You.</h2>
              </div>
              <p style="font-size:15px;color:#e2e8f0;max-width:440px;line-height:1.6;">Call us or message us for more info, or to coordinate recurring medical appointment transit.</p>
            </div>
            <div class="contact-grid">
              <a href="mailto:${COMPANY_INFO.email}">
                <span style="font-size:12px;color:#c1ccda;display:block;">Email</span>
                <strong style="font-size:15px;color:#fff;">${COMPANY_INFO.email}</strong>
              </a>
              <a href="tel:${COMPANY_INFO.phoneRaw}">
                <span style="font-size:12px;color:#c1ccda;display:block;">Phone</span>
                <strong style="font-size:16px;color:#fff;">${COMPANY_INFO.phoneDisplay}</strong>
              </a>
              <div>
                <span style="font-size:12px;color:#c1ccda;display:block;">Business office</span>
                <strong style="font-size:13px;color:#fff;">1902 E Yesler Way Unit #4, Seattle WA</strong>
              </div>
            </div>
          </div>
        </section>
      `;

      this.shadowRoot.getElementById('hero-book').addEventListener('click', () => this._navigate('/book-a-ride'));
      this.shadowRoot.querySelectorAll('[data-book]').forEach((btn) => {
        btn.addEventListener('click', () => this._navigate('/book-a-ride', btn.getAttribute('data-book')));
      });
    }
  }

  if (!customElements.get('ccr-home-page')) {
    customElements.define('ccr-home-page', CcrHomePage);
  }
}
