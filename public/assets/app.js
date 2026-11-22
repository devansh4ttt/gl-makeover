/* ==========================================================================
   Gorgeous Look Makeover (G L Makeover), Manhari, Farrukhabad
   Production Multi-Page Web Application
   Live-wired to same-origin hidden Cloudflare Worker + D1 API (/api/v1/*).
   Routes: #/ (Home), #/gallery, #/about, #/plans, #/booking, #/admin, * (404)
   ========================================================================== */

import { mountVanityMirror3D } from './scene3d.js?v=1';

const FALLBACK_DATA = {
  studio: {
    name: 'Gorgeous Look Makeover',
    shortName: 'G L Makeover',
    city: 'Manhari, Farrukhabad, UP',
    whatsapp: '916307855239',
    phone: '+91 63078 55239',
    hours: 'Daily · 10:00 AM to 8:30 PM',
    siderPrice: 2500,
    instagram: 'https://www.instagram.com/',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=G+L+makeover+Manhari+Farrukhabad'
  },
  offer: {
    active: true,
    title: 'Bridal Season Offer',
    percent: 12,
    note: 'Flat 12% off on HD & Airbrush Bridal Makeup slots booked 30+ days ahead',
    validTill: '31 Dec 2026'
  },
  trendingPlanId: 'hd-signature-bridal',
  plans: [
    {
      id: 'party-sider-glam',
      name: 'Party & Sider Makeup',
      tagline: 'Luminous soft-glam makeup and styled hair for sisters, mothers, bridesmaids, and family guests.',
      price: 2999,
      duration: '1.5 Hours Prep',
      finish_scope: 'HD Dewy or Soft Matte Finish',
      deliverables: [
        'Skin prep, color correction, and lightweight HD base',
        'Soft shimmer or kohl-defined eye makeup with natural lashes',
        'Blow-dry waves, curls, or classic neat bun hairstyling',
        'Saree, lehenga, or dupatta pinning included'
      ],
      views: 0,
      bookings: 0
    },
    {
      id: 'haldi-mehendi-dewy',
      name: 'Haldi & Mehendi Dewy Look',
      tagline: 'Breathable, sweat-resistant daytime bridal radiance paired with fresh floral hairstyling.',
      price: 6999,
      duration: '2 Hours Prep',
      finish_scope: 'Daylight Natural Dewy Finish',
      deliverables: [
        'Hydrating glass-skin prep built for outdoor daytime sunlight',
        'Soft peach-gold blush, kohl-rimmed eyes, and glossy tint lip',
        'Braid, half-up curls, or floral jewellery placement',
        'Outfit & dupatta draping with waterproof setting mist'
      ],
      views: 0,
      bookings: 0
    },
    {
      id: 'engagement-reception-glam',
      name: 'Engagement & Reception Glam',
      tagline: 'Camera-ready evening glamour with sculpted bronze-smoky eyes, champagne highlight, and Hollywood waves.',
      price: 9999,
      duration: '2.5 Hours Prep',
      finish_scope: 'Luxury HD Evening Glam (MAC / Huda / NARS)',
      deliverables: [
        'International luxury kit (MAC, Huda Beauty, NARS, Bobbi Brown)',
        'Custom smoky or rose-shimmer eyes with mink-feel lashes & lenses',
        'Signature Hollywood waves, sleek bun, or pearl-pinned styling',
        'Gown or lehenga draping + jewelry setting included'
      ],
      views: 0,
      bookings: 0
    },
    {
      id: 'hd-signature-bridal',
      name: 'HD Signature Bridal Makeup',
      tagline: 'Our signature Farrukhabad wedding look—true skin tone matching, crease-free longevity, and full bridal draping.',
      price: 15999,
      duration: '3.5 Hours Prep',
      finish_scope: 'High-Definition Long-Wear Bridal (16+ Hours)',
      deliverables: [
        'Full luxury international kit (MAC, NARS, Huda Beauty, Estée Lauder)',
        'Custom undertone matching with zero grey cast or cakey finish',
        'Premium mink-effect lashes, colored contact lenses & nail polish',
        'Sculpted bridal bun with fresh mogra/rose setting + hair padding',
        'Complete bridal jewellery setting and double dupatta pinning'
      ],
      views: 0,
      bookings: 0
    },
    {
      id: 'luxury-airbrush-bridal',
      name: 'Luxury Airbrush Bridal Atelier',
      tagline: 'Feather-light silicone airbrush base that stays water-resistant and photo-flawless from varmala to vidaai.',
      price: 22999,
      duration: '4 Hours Prep',
      finish_scope: 'Water-Resistant Silicone Airbrush + Luxury Kit',
      deliverables: [
        'Temptu / Kett silicone airbrush foundation for ultra-smooth skin texture',
        'Charlotte Tilbury, NARS, Bobbi Brown & Dior complexion finishing',
        'Custom bridal eye artistry, premium lashes, contact lenses & press-on nails',
        'Advance hair styling with extensions/padding & fresh floral gajra work',
        'Double dupatta architectural draping + mini touch-up lip & blot kit'
      ],
      views: 0,
      bookings: 0
    }
  ],
  addons: [
    { id: 'addon-hair-ext', name: 'Original Human-Blend Hair Extensions', price: 1500, note: 'Added volume and length matched to your natural hair shade' },
    { id: 'addon-double-drape', name: 'Double Dupatta & Heavy Lehenga Draping', price: 1200, note: 'Architectural pleating and pin-work for heavy bridal veils' },
    { id: 'addon-bridal-nails', name: 'Gel / Acrylic Bridal Nail Extensions', price: 1400, note: 'Custom French tip, pearl, or neutral champagne bridal nails' },
    { id: 'addon-bridal-trial', name: 'Pre-Wedding Makeup Shade & Eye Trial', price: 2500, note: '90-minute studio session to finalize base undertone and eye look' },
    { id: 'addon-venue-kit', name: 'On-Venue Bridal Suite Travel Setup', price: 2500, note: 'Portable vanity ring light & full team travel within Farrukhabad' }
  ],
  bookedDates: [],
  media: [
    { id: 'hero-1', slot: 'home_hero', category: 'HD Bridal', title: 'Velvet Mulberry HD Bridal', location: 'HD Bridal · Luminous Skin & Kundan', src: '/assets/photos/01-hero-bridal-velvet.webp', wide: true },
    { id: 'hero-2', slot: 'home_hero', category: 'Airbrush Bridal', title: 'Ivory & Champagne Airbrush Bride', location: 'Airbrush Bridal · Water-Resistant Dewy Finish', src: '/assets/photos/03-airbrush-ivory-bride.webp', wide: true },
    { id: 'hero-3', slot: 'home_hero', category: 'Reception Glam', title: 'Bronze Smoky Reception Glam', location: 'Reception · Hollywood Waves & Satin Lip', src: '/assets/photos/04-reception-smoky-glam.webp', wide: false },
    { id: 'hero-4', slot: 'home_hero', category: 'Reception Glam', title: 'Rose-Champagne Engagement Look', location: 'Engagement · Soft Shimmer & Pearl Curls', src: '/assets/photos/05-engagement-rose-glam.webp', wide: true },
    { id: 'home-sig-main', slot: 'home_signature', category: 'HD Bridal', title: 'Timeless Natural-Light HD Bride', location: 'True Skin Tone Finish · Manhari Studio', src: '/assets/photos/02-hd-bridal-window.webp', wide: false },
    { id: 'about-atelier-main', slot: 'about_atelier', category: 'Atelier', title: 'Gorgeous Look Vanity & Luxury Kit', location: 'Manhari, Farrukhabad · Sanitized Brushes & International Kit', src: '/assets/photos/10-vanity-atelier-kit.webp', wide: true },
    { id: 'gal-1', slot: 'gallery', category: 'HD Bridal', title: 'Velvet Mulberry HD Bridal', location: 'Deep Zari Lehenga & Rose-Mulberry Lip', src: '/assets/photos/01-hero-bridal-velvet.webp', wide: true },
    { id: 'gal-2', slot: 'gallery', category: 'HD Bridal', title: 'Natural-Light Window Bridal Portrait', location: 'Warm Golden Glow & Sculpted Bronze Eyes', src: '/assets/photos/02-hd-bridal-window.webp', wide: false },
    { id: 'gal-3', slot: 'gallery', category: 'Airbrush Bridal', title: 'Ivory & Polki Airbrush Bridal', location: 'Breathable Silicone Airbrush Complexion', src: '/assets/photos/03-airbrush-ivory-bride.webp', wide: true },
    { id: 'gal-4', slot: 'gallery', category: 'Reception Glam', title: 'Espresso-Bronze Smoky Reception', location: 'Evening Cocktail Waves & Radiant Highlight', src: '/assets/photos/04-reception-smoky-glam.webp', wide: false },
    { id: 'gal-5', slot: 'gallery', category: 'Reception Glam', title: 'Pastel Rose Engagement Soft Glam', location: 'Half-Up Curls & Glossy Berry-Nude Lip', src: '/assets/photos/05-engagement-rose-glam.webp', wide: true },
    { id: 'gal-6', slot: 'gallery', category: 'Haldi & Mehendi', title: 'Sunlit Floral Haldi Dewy Look', location: 'Fresh Mogra Jewellery & Glass-Skin Finish', src: '/assets/photos/06-haldi-dewy-floral.webp', wide: true },
    { id: 'gal-7', slot: 'gallery', category: 'Hairstyling & Sider', title: 'Mogra Gajra & Rose Bridal Bun', location: 'Sculpted Low Bun & Dupatta Pinning', src: '/assets/photos/07-bridal-floral-bun.webp', wide: false },
    { id: 'gal-8', slot: 'gallery', category: 'Hairstyling & Sider', title: 'Bridesmaid & Sider Silk Saree Glam', location: 'Soft Copper Shimmer & Bouncy Waves', src: '/assets/photos/08-party-sider-sage.webp', wide: false },
    { id: 'gal-9', slot: 'gallery', category: 'HD Bridal', title: 'Final Bridal Veil Draping Touch-Up', location: 'Bridal Suite Setting & Jewellery Pin-Work', src: '/assets/photos/09-bridal-veil-draping.webp', wide: true }
  ],
  reviews: [
    {
      id: 'rev-1',
      bride_name: 'Anjali Shukla · Fatehgarh',
      event_type: 'Luxury Airbrush Bridal',
      quote: 'My skin looked like real glowing skin—not chalky or heavy at all. Even after four hours beside the phera fire, my eyeliner and base stayed completely fresh.'
    },
    {
      id: 'rev-2',
      bride_name: 'Priya & Sisters · Manhari',
      event_type: 'HD Signature Bridal + 3 Siders',
      quote: 'They used authentic MAC and Huda products right in front of us, finished all four of us right on time, and pinned my heavy double dupatta so neatly it never slipped once.'
    },
    {
      id: 'rev-3',
      bride_name: 'Ritu Katiyar · Awas Vikas Colony',
      event_type: 'Engagement & Reception Glam',
      quote: 'Soft bronze smoky eyes and Hollywood waves looked amazing in both phone photos and wedding video. Everyone asked which studio in Farrukhabad did my look.'
    }
  ]
};

const LUXURY_KIT_BRANDS = ['MAC', 'Huda Beauty', 'NARS', 'Bobbi Brown', 'Charlotte Tilbury', 'Estée Lauder', 'Kryolan'];

const SHIFTS = [
  { id: 'Early Morning', label: 'Early Morning', range: 'Ready by 6:00 – 9:30 AM', defaultTime: '08:00' },
  { id: 'Morning / Day', label: 'Morning / Day', range: 'Ready by 10:00 AM – 2:00 PM', defaultTime: '11:30' },
  { id: 'Afternoon', label: 'Afternoon', range: 'Ready by 2:00 – 5:30 PM', defaultTime: '16:00' },
  { id: 'Evening / Night', label: 'Evening / Night', range: 'Ready by 6:00 – 9:00 PM', defaultTime: '19:30' }
];

const EVENT_TYPES = [
  'Wedding Bridal',
  'Engagement / Ring Ceremony',
  'Reception',
  'Haldi & Mehendi',
  'Party / Sider Makeup',
  'Pre-Wedding Shoot'
];

const SERVICE_MODES = [
  { id: 'At Manhari Studio', title: 'At Manhari Studio', sub: 'Calm AC vanity suite with pro lighting' },
  { id: 'At Venue / Home Travel', title: 'At Venue / Home Travel', sub: 'Our artists travel to your hotel or lawn' }
];

const PAGE_ORDER = ['/', '/gallery', '/about', '/plans', '/booking', '/admin'];

let siteData = structuredClone ? structuredClone(FALLBACK_DATA) : JSON.parse(JSON.stringify(FALLBACK_DATA));

/* ---------- Live Server Bootstrap & Analytics ---------- */
async function syncFromServer() {
  try {
    const res = await fetch('/api/v1/bootstrap', { credentials: 'same-origin', cache: 'no-store' });
    if (!res.ok) return false;
    const data = await res.json();
    if (data && Array.isArray(data.plans) && data.plans.length) {
      siteData = {
        studio: { ...FALLBACK_DATA.studio, ...(data.studio || {}) },
        offer: { ...FALLBACK_DATA.offer, ...(data.offer || {}) },
        plans: data.plans,
        addons: Array.isArray(data.addons) ? data.addons : FALLBACK_DATA.addons,
        bookedDates: Array.isArray(data.bookedDates) ? data.bookedDates : [],
        media: Array.isArray(data.media) && data.media.length ? data.media : FALLBACK_DATA.media,
        reviews: Array.isArray(data.reviews) && data.reviews.length ? data.reviews : FALLBACK_DATA.reviews,
        trendingPlanId: data.trendingPlanId || data.plans[0].id
      };
      updateShellBranding();
      return true;
    }
  } catch (_) {}
  return false;
}

function updateShellBranding() {
  const dot = document.getElementById('nav-offer-dot');
  const label = document.getElementById('nav-plans-label');
  if (dot) dot.style.display = siteData.offer && siteData.offer.active ? '' : 'none';
  if (label) label.textContent = siteData.offer && siteData.offer.active ? `Packages · ${siteData.offer.percent}% Off` : 'Makeup Packages';

  const brandName = document.getElementById('shell-brand-name');
  const footerPhone = document.getElementById('footer-phone-line');
  const footerWa = document.getElementById('footer-wa-link');
  const drawerContact = document.getElementById('drawer-contact-line');
  if (brandName && siteData.studio.name) brandName.textContent = siteData.studio.name;
  if (footerPhone) footerPhone.textContent = `${siteData.studio.phone} · ${siteData.studio.hours}`;
  if (footerWa) footerWa.href = `https://wa.me/${siteData.studio.whatsapp}`;
  if (drawerContact) drawerContact.textContent = `${siteData.studio.city} · ${siteData.studio.phone}`;
}

function trackPulse(payload) {
  const key = 'gl_pulse_' + (payload.planId || payload.category || '');
  if (!key || sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  fetch('/api/v1/pulse', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {});
}

function sendBookingRecord(payload) {
  fetch('/api/v1/book', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {});
}

/* ---------- Media Slot Helpers (Always Non-Empty) ---------- */
function getHeroFrames() {
  const list = siteData.media.filter((m) => m.slot === 'home_hero');
  return list.length ? list : FALLBACK_DATA.media.filter((m) => m.slot === 'home_hero');
}

function getGalleryItems() {
  const list = siteData.media.filter((m) => m.slot === 'gallery');
  return list.length ? list : FALLBACK_DATA.media.filter((m) => m.slot === 'gallery');
}

function getSlotPhoto(slotName, fallbackSrc) {
  const found = siteData.media.find((m) => m.slot === slotName);
  return found || { src: fallbackSrc, title: 'Gorgeous Look Makeover', location: 'Manhari, Farrukhabad' };
}

/* ---------- Formatting Helpers ---------- */
function formatINR(amount) {
  return '₹' + Math.round(Number(amount || 0)).toLocaleString('en-IN');
}

function getPlanPricing(plan) {
  const base = Number(plan.price || 0);
  const off = siteData.offer;
  if (off && off.active && Number(off.percent) > 0) {
    const finalPrice = Math.round((base * (100 - Number(off.percent))) / 100);
    return { base, finalPrice, savings: base - finalPrice, hasOffer: true, percent: Number(off.percent) };
  }
  return { base, finalPrice: base, savings: 0, hasOffer: false, percent: 0 };
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function splitWordsMarkup(text) {
  return text
    .split(' ')
    .map((w, i) => `<span class="at-word" aria-hidden="true"><span style="--wd:${i * 42}ms">${escapeHtml(w)}</span></span>`)
    .join('');
}

function formatDateNice(iso) {
  if (!iso) return 'Not selected yet';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime12h(hhmm) {
  if (!hhmm || !hhmm.includes(':')) return 'Flexible';
  const [hStr, mStr] = hhmm.split(':');
  let h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return hhmm;
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${suffix}`;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ---------- Fullscreen Lightbox ---------- */
const lightboxEl = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbTitle = document.getElementById('lb-title');
const lbMeta = document.getElementById('lb-meta');
const lbCounter = document.getElementById('lb-counter');
const lbClose = document.getElementById('lb-close');
const lbPrev = document.getElementById('lb-prev');
const lbNext = document.getElementById('lb-next');
const lbBook = document.getElementById('lb-book');

let lbItems = [];
let lbIndex = 0;
let lbTouchX = 0;

function renderLightboxFrame() {
  const item = lbItems[lbIndex];
  if (!item) return;
  lbImg.src = item.src;
  lbImg.alt = item.title;
  lbTitle.textContent = item.title;
  lbMeta.textContent = item.location || item.category || '';
  lbCounter.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(lbItems.length).padStart(2, '0')}`;
}

function openLightbox(items, startIdx = 0) {
  if (!items || !items.length) return;
  lbItems = items;
  lbIndex = Math.max(0, Math.min(startIdx, items.length - 1));
  renderLightboxFrame();
  lightboxEl.classList.add('is-open');
  lightboxEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightboxEl.classList.remove('is-open');
  lightboxEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function stepLightbox(delta) {
  if (!lbItems.length) return;
  lbIndex = (lbIndex + delta + lbItems.length) % lbItems.length;
  renderLightboxFrame();
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => stepLightbox(-1));
lbNext.addEventListener('click', () => stepLightbox(1));
lbBook.addEventListener('click', () => {
  const item = lbItems[lbIndex];
  closeLightbox();
  const note = item ? `?look=${encodeURIComponent(item.title)}` : '';
  navigate('/booking' + note);
});
lightboxEl.addEventListener('click', (e) => { if (e.target === lightboxEl) closeLightbox(); });
lightboxEl.addEventListener('touchstart', (e) => { if (e.touches && e.touches[0]) lbTouchX = e.touches[0].clientX; }, { passive: true });
lightboxEl.addEventListener('touchend', (e) => {
  if (!e.changedTouches || !e.changedTouches[0]) return;
  const dx = e.changedTouches[0].clientX - lbTouchX;
  if (Math.abs(dx) > 48) stepLightbox(dx < 0 ? 1 : -1);
}, { passive: true });
window.addEventListener('keydown', (e) => {
  if (!lightboxEl.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowRight') stepLightbox(1);
  else if (e.key === 'ArrowLeft') stepLightbox(-1);
});

/* ---------- Mobile Drawer ---------- */
const drawer = document.getElementById('mobile-drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const menuToggle = document.getElementById('menu-toggle');
const drawerClose = document.getElementById('drawer-close');

function setDrawer(open) {
  drawer.classList.toggle('is-open', open);
  drawerBackdrop.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  menuToggle.setAttribute('aria-expanded', String(open));
}

menuToggle.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
drawerClose.addEventListener('click', () => setDrawer(false));
drawerBackdrop.addEventListener('click', () => setDrawer(false));

/* ---------- Dual Reveal Safety Net + Scroll-Scrubbed Copy ---------- */
function setupMotion(rootEl) {
  const reveals = Array.from(rootEl.querySelectorAll('.reveal'));
  const scrubs = Array.from(rootEl.querySelectorAll('.at-scrub'));

  const updateScrollMotion = () => {
    const vh = window.innerHeight || 800;
    for (const el of reveals) {
      if (el.classList.contains('is-in')) continue;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.96 && r.bottom > 0) el.classList.add('is-in');
    }
    for (const el of scrubs) {
      const r = el.getBoundingClientRect();
      const prog = Math.max(0, Math.min(1, (vh * 0.92 - r.top) / (vh * 0.42)));
      el.style.setProperty('--scrub', prog.toFixed(3));
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.02 }
  );
  for (const el of reveals) io.observe(el);
  requestAnimationFrame(updateScrollMotion);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateScrollMotion();
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  return () => {
    io.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}

/* ==========================================================================
   PAGE 1: HOME (#/) — 3D Vanity Mirror + Luxury Kit Strip + Lookbook + Reviews
   ========================================================================== */
function renderHomePage() {
  const { studio, offer, plans, reviews, trendingPlanId } = siteData;
  const heroFrames = getHeroFrames();
  const gallery = getGalleryItems();
  const homeSig = getSlotPhoto('home_signature', '/assets/photos/02-hd-bridal-window.webp');
  const cfItems = gallery.slice(0, Math.min(6, gallery.length));

  const findCatImg = (cat, fb) => {
    const found = gallery.find((g) => g.category === cat);
    return found ? found.src : fb;
  };

  const offerRibbon = offer.active
    ? `<div class="offer-ribbon">
         <div class="offer-ribbon-inner">
           <div class="offer-ribbon-main">
             <span class="offer-pill-tag">${escapeHtml(offer.title)} · ${offer.percent}% Off</span>
             <span>${escapeHtml(offer.note)}</span>
           </div>
           <a class="offer-ribbon-link" href="#/plans">See Offer Packages</a>
         </div>
       </div>`
    : '';

  const coverflowSlides = cfItems
    .map(
      (item, idx) => `
      <article class="cf-slide" data-cf-idx="${idx}">
        <div class="cf-card">
          <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" loading="${idx < 2 ? 'eager' : 'lazy'}" />
          <div class="cf-overlay">
            <div class="cf-meta">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.category)} · ${escapeHtml(item.location)}</p>
            </div>
            <button type="button" class="cf-expand" data-expand-idx="${idx}" aria-label="View ${escapeHtml(item.title)} fullscreen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            </button>
          </div>
        </div>
      </article>`
    )
    .join('');

  const cfDots = cfItems
    .map(
      (_, idx) => `
      <button type="button" class="cf-dot ${idx === 0 ? 'is-active' : ''}" data-cf-dot="${idx}" aria-label="Go to slide ${idx + 1}">
        <span class="cf-dot-fill"></span>
      </button>`
    )
    .join('');

  const featuredPlans = plans.slice(0, 4);
  const planTeasers = featuredPlans
    .map((plan) => {
      const { base, finalPrice, savings, hasOffer } = getPlanPricing(plan);
      const isTrend = plan.id === trendingPlanId;
      return `
        <article class="plan-card reveal ${isTrend ? 'is-trending' : ''}">
          <div>
            <div class="plan-badges">
              ${isTrend ? '<span class="badge-trending">Most Booked Bridal Plan</span>' : `<span class="badge-views">${escapeHtml(plan.duration)}</span>`}
              <span class="badge-views">${escapeHtml(plan.finish_scope)}</span>
            </div>
            <h3>${escapeHtml(plan.name)}</h3>
            <p class="plan-desc">${escapeHtml(plan.tagline)}</p>
            <div class="plan-price-row">
              <span class="price-final">${formatINR(finalPrice)}</span>
              ${hasOffer ? `<span class="price-old">${formatINR(base)}</span><span class="price-save">Save ${formatINR(savings)}</span>` : ''}
            </div>
            <ul class="plan-features">
              ${plan.deliverables.slice(0, 3).map((d) => `<li>${escapeHtml(d)}</li>`).join('')}
            </ul>
          </div>
          <div class="plan-card-actions">
            <a class="btn btn-rosegold" href="#/booking?plan=${encodeURIComponent(plan.id)}">Check Slot &amp; Book</a>
            <a class="btn btn-ghost-dark" href="#/plans">Full Details</a>
          </div>
        </article>`;
    })
    .join('');

  const reviewsHtml = reviews
    .slice(0, 3)
    .map(
      (r) => `
      <article class="review-card reveal">
        <p class="review-quote">“${escapeHtml(r.quote)}”</p>
        <div class="review-author">
          <strong>${escapeHtml(r.bride_name)}</strong>
          <span>${escapeHtml(r.event_type)}</span>
        </div>
      </article>`
    )
    .join('');

  return `
    ${offerRibbon}
    <section class="hero-atelier">
      <div class="hero-backdrop-wash" aria-hidden="true"></div>
      <div class="container hero-grid">
        <div class="hero-copy">
          <div class="hero-location">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${escapeHtml(studio.shortName)} · ${escapeHtml(studio.city)}</span>
          </div>
          <h1 class="display-xl" aria-label="Bridal beauty that still looks like you.">
            ${splitWordsMarkup('Bridal beauty that still looks like you.')}
          </h1>
          <p class="lead-copy">
            ${escapeHtml(studio.name)} specializes in breathable HD &amp; Silicone Airbrush bridal makeup, sculpted floral hairstyling, and double-dupatta draping—using 100% original international luxury products in Manhari, Farrukhabad.
          </p>
          <div class="hero-cta-row">
            <a class="btn btn-rosegold" href="#/booking">Book Bridal Slot</a>
            <a class="btn btn-ghost-dark" href="#/plans">View Packages</a>
            <a class="btn btn-ghost-dark" href="#/gallery">Bridal Lookbook</a>
          </div>
          <div class="hero-facts">
            <div class="hero-fact">
              <strong>600+</strong>
              <span>Brides styled</span>
            </div>
            <div class="hero-fact">
              <strong>100% Real</strong>
              <span>Original luxury kit</span>
            </div>
            <div class="hero-fact">
              <strong>16+ Hrs</strong>
              <span>Sweat-proof wear</span>
            </div>
          </div>
        </div>

        <div class="stage-card" id="hero-stage-card">
          <img id="hero-fallback-img" class="stage-photo-fallback" src="${escapeHtml(heroFrames[0].src)}" alt="${escapeHtml(heroFrames[0].title)}" />
          <div id="hero-3d-host" class="stage-canvas-host" aria-label="Interactive 3D illuminated bridal vanity mirror — drag horizontally to tilt"></div>
          <div class="stage-vignette" aria-hidden="true"></div>

          <div class="stage-top-bar">
            <div class="glass-segment" role="group" aria-label="Display mode">
              <button type="button" class="glass-seg-btn is-active" id="mode-3d-btn">3D Vanity</button>
              <button type="button" class="glass-seg-btn" id="mode-photo-btn">Photo</button>
            </div>
            <button type="button" class="stage-icon-btn" id="stage-pause-btn">Pause</button>
          </div>

          <div class="stage-bottom-bar">
            <div class="stage-caption">
              <strong id="stage-frame-title">${escapeHtml(heroFrames[0].title)}</strong>
              <span id="stage-frame-meta">${escapeHtml(heroFrames[0].location)} · Drag to tilt</span>
            </div>
            <div class="stage-frame-dots" aria-label="Switch bridal look">
              ${heroFrames
                .slice(0, 5)
                .map(
                  (f, i) => `<button type="button" class="stage-dot ${i === 0 ? 'is-active' : ''}" data-hero-frame="${i}" aria-label="Preview ${escapeHtml(f.title)}"><img src="${escapeHtml(f.src)}" alt="" /></button>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="lifted-sheet">
      <div class="container">
        <div class="kit-strip reveal">
          <span class="kit-label">Authentic Vanity Kit Used</span>
          <div class="kit-brands">
            ${LUXURY_KIT_BRANDS.map((b) => `<span>${escapeHtml(b)}</span>`).join('')}
          </div>
        </div>

        <div class="chapter-rail">
          <span>Signature Bridal Lookbook</span>
          <span>Swipe or drag the reel · Tap expand for fullscreen</span>
        </div>
        <div class="chapter-head reveal">
          <div>
            <h2 class="display-lg">Natural radiance built for real lighting &amp; cameras</h2>
            <p class="at-scrub">Every skin tone deserves a custom-mixed undertone—never a pale mask. From sunlit Haldi mornings to late-night pheras, our bases stay breathable and crease-free.</p>
          </div>
          <a class="btn btn-ghost-light" href="#/gallery">Open Full Lookbook</a>
        </div>

        <div class="coverflow-track" id="cf-track">${coverflowSlides}</div>
        <div class="cf-controls">
          <div class="cf-dots" id="cf-dots">${cfDots}</div>
          <div class="cf-nav-btns">
            <button type="button" class="icon-circle-btn" id="cf-play-btn" aria-label="Pause slideshow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <button type="button" class="icon-circle-btn" id="cf-prev-btn" aria-label="Previous look">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button type="button" class="icon-circle-btn" id="cf-next-btn" aria-label="Next look">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="cashmere-chapter">
      <div class="container">
        <div class="chapter-rail">
          <span>Explore By Occasion &amp; Skin Finish</span>
          <span>Tap any finish to view matching bridal looks</span>
        </div>
        <div class="chapter-head reveal">
          <div>
            <h2 class="display-lg">Tailored to every ceremony on your wedding calendar</h2>
          </div>
          <a class="btn btn-primary" href="#/gallery">Browse Lookbook</a>
        </div>

        <div class="bento-grid">
          <a class="bento-card span-7 reveal" href="#/gallery?cat=HD+Bridal">
            <img src="${escapeHtml(findCatImg('HD Bridal', '/assets/photos/01-hero-bridal-velvet.webp'))}" alt="HD Signature Bridal Makeup" loading="lazy" />
            <div class="bento-scrim" aria-hidden="true"></div>
            <div class="bento-content">
              <h3>HD &amp; Airbrush Bridal</h3>
              <p>Skin-like luminous coverage, kundan jewellery setting, sculpted mogra buns, and double-dupatta draping.</p>
            </div>
          </a>

          <a class="bento-card span-5 reveal" href="#/gallery?cat=Reception+Glam">
            <img src="${escapeHtml(findCatImg('Reception Glam', '/assets/photos/04-reception-smoky-glam.webp'))}" alt="Reception and Engagement Evening Glam" loading="lazy" />
            <div class="bento-scrim" aria-hidden="true"></div>
            <div class="bento-content">
              <h3>Engagement &amp; Reception Glam</h3>
              <p>Softly smoked bronze eyes, champagne cheekbones, and glossy Hollywood waves.</p>
            </div>
          </a>

          <a class="bento-card span-6 reveal" href="#/gallery?cat=Haldi+%26+Mehendi">
            <img src="${escapeHtml(findCatImg('Haldi & Mehendi', '/assets/photos/06-haldi-dewy-floral.webp'))}" alt="Haldi and Mehendi Dewy Bridal Look" loading="lazy" />
            <div class="bento-scrim" aria-hidden="true"></div>
            <div class="bento-content">
              <h3>Haldi &amp; Mehendi Dewy Finish</h3>
              <p>Breathable daylight glow, soft peach blush, and fresh marigold &amp; mogra floral jewellery styling.</p>
            </div>
          </a>

          <a class="bento-card span-6 reveal" href="#/gallery?cat=Hairstyling+%26+Sider">
            <img src="${escapeHtml(findCatImg('Hairstyling & Sider', '/assets/photos/07-bridal-floral-bun.webp'))}" alt="Bridal floral bun and sider party makeup" loading="lazy" />
            <div class="bento-scrim" aria-hidden="true"></div>
            <div class="bento-content">
              <h3>Floral Hairstyles &amp; Sider Makeup</h3>
              <p>Fresh gajra buns, curled waves, and coordinated party makeup for sisters, mothers, and bridesmaids.</p>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="silk-chapter">
      <div class="container editorial-split">
        <div class="oval-vanity-frame reveal">
          <img src="${escapeHtml(homeSig.src)}" alt="${escapeHtml(homeSig.title)}" loading="lazy" />
        </div>
        <div class="reveal">
          <h2 class="display-lg">Why brides across Farrukhabad book their wedding morning with us</h2>
          <p class="lead-copy at-scrub" style="color:var(--muted);margin-top:16px;">
            Your wedding morning should feel calm and unrushed. We take limited brides per wedding date so you get full attention, freshly sanitized brushes, and zero frantic rushing before the Baraat arrives.
          </p>
          <div class="story-points">
            <div class="story-point">
              <span class="story-num">01</span>
              <div>
                <h3>True undertone matching—zero white cast</h3>
                <p>Foundation and concealer are blended specifically for Indian golden and warm undertones so flash photography looks natural.</p>
              </div>
            </div>
            <div class="story-point">
              <span class="story-num">02</span>
              <div>
                <h3>Sanitized tools &amp; genuine sealed products</h3>
                <p>Every brush is deep-cleaned between clients, and every mascara wand and sponge is single-use hygienic.</p>
              </div>
            </div>
            <div class="story-point">
              <span class="story-num">03</span>
              <div>
                <h3>Ready right on your exact "Ready-By" clock</h3>
                <p>Whether you get ready in our Manhari AC studio or book our travel team to your wedding venue, we finish on schedule for portraits.</p>
              </div>
            </div>
          </div>
          <div class="hero-cta-row">
            <a class="btn btn-primary" href="#/about">Inside Our Atelier</a>
            <a class="btn btn-ghost-light" href="#/booking">Check Date Slot</a>
          </div>
        </div>
      </div>
    </section>

    <section class="espresso-chapter">
      <div class="container">
        <div class="chapter-rail">
          <span>Transparent Makeup Packages</span>
          <span>${offer.active ? `${offer.percent}% ${escapeHtml(offer.title)} active` : 'Direct atelier pricing'}</span>
        </div>
        <div class="chapter-head reveal">
          <div>
            <h2 class="display-lg">Packages built for brides &amp; wedding families</h2>
            <p>Pick your bridal look, add extra Sider / Family makeups on the Booking page, and lock your date straight on WhatsApp.</p>
          </div>
          <a class="btn btn-rosegold" href="#/plans">See All ${plans.length} Packages</a>
        </div>
        <div class="plans-grid">${planTeasers}</div>
      </div>
    </section>

    <section class="silk-chapter">
      <div class="container">
        <div class="chapter-rail">
          <span>Real Bride Stories</span>
          <span>Verified reviews from Manhari, Fatehgarh &amp; Farrukhabad</span>
        </div>
        <div class="chapter-head reveal">
          <div>
            <h2 class="display-lg">Words from our brides after the celebrations</h2>
          </div>
        </div>
        <div class="reviews-grid">${reviewsHtml}</div>

        <div class="next-page-bar reveal">
          <div>
            <span style="font-size:0.84rem;color:var(--muted);">Next Page</span>
            <h3 class="display-md">Browse the Complete Bridal Lookbook</h3>
          </div>
          <a class="btn btn-primary" href="#/gallery">Open Bridal Lookbook</a>
        </div>
      </div>
    </section>
  `;
}

function hydrateHomePage(rootEl) {
  const cleanups = [];
  const heroFrames = getHeroFrames().slice(0, 5);
  const gallery = getGalleryItems();
  const cfItems = gallery.slice(0, Math.min(6, gallery.length));

  const stageCard = rootEl.querySelector('#hero-stage-card');
  const stageHost = rootEl.querySelector('#hero-3d-host');
  const fallbackImg = rootEl.querySelector('#hero-fallback-img');
  const titleEl = rootEl.querySelector('#stage-frame-title');
  const metaEl = rootEl.querySelector('#stage-frame-meta');
  const btn3d = rootEl.querySelector('#mode-3d-btn');
  const btnPhoto = rootEl.querySelector('#mode-photo-btn');
  const btnPause = rootEl.querySelector('#stage-pause-btn');
  const frameDots = Array.from(rootEl.querySelectorAll('[data-hero-frame]'));

  let stageCtrl = null;
  let is3dMode = true;
  let isPaused = false;
  let unmounted = false;

  const init3D = async () => {
    const ctrl = await mountVanityMirror3D(stageHost, heroFrames[0].src, {
      onReady() {
        if (!unmounted && is3dMode) stageCard.classList.add('is-3d-live');
      }
    });
    if (unmounted) {
      ctrl.dispose();
      return;
    }
    stageCtrl = ctrl;
    if (!ctrl.supported) {
      is3dMode = false;
      stageCard.classList.remove('is-3d-live');
      btn3d.classList.remove('is-active');
      btnPhoto.classList.add('is-active');
      btn3d.disabled = true;
      btnPause.style.display = 'none';
    }
  };

  const tId = setTimeout(init3D, 120);
  cleanups.push(() => {
    unmounted = true;
    clearTimeout(tId);
    if (stageCtrl) stageCtrl.dispose();
  });

  const onMode3d = () => {
    if (!stageCtrl || !stageCtrl.supported) return;
    is3dMode = true;
    stageCard.classList.add('is-3d-live');
    stageHost.style.opacity = '1';
    stageHost.style.pointerEvents = 'auto';
    stageCtrl.setPaused(isPaused);
    btn3d.classList.add('is-active');
    btnPhoto.classList.remove('is-active');
    btnPause.style.display = '';
  };

  const onModePhoto = () => {
    is3dMode = false;
    stageCard.classList.remove('is-3d-live');
    stageHost.style.opacity = '0';
    stageHost.style.pointerEvents = 'none';
    if (stageCtrl) stageCtrl.setPaused(true);
    btnPhoto.classList.add('is-active');
    btn3d.classList.remove('is-active');
    btnPause.style.display = 'none';
  };

  const onPauseToggle = () => {
    isPaused = !isPaused;
    btnPause.textContent = isPaused ? 'Play' : 'Pause';
    if (stageCtrl && is3dMode) stageCtrl.setPaused(isPaused);
  };

  btn3d.addEventListener('click', onMode3d);
  btnPhoto.addEventListener('click', onModePhoto);
  btnPause.addEventListener('click', onPauseToggle);
  cleanups.push(() => {
    btn3d.removeEventListener('click', onMode3d);
    btnPhoto.removeEventListener('click', onModePhoto);
    btnPause.removeEventListener('click', onPauseToggle);
  });

  frameDots.forEach((dot, idx) => {
    const h = () => {
      const f = heroFrames[idx];
      if (!f) return;
      frameDots.forEach((d, j) => d.classList.toggle('is-active', j === idx));
      fallbackImg.src = f.src;
      fallbackImg.alt = f.title;
      titleEl.textContent = f.title;
      metaEl.textContent = `${f.location} · Drag to tilt`;
      if (stageCtrl && stageCtrl.supported) stageCtrl.setPhoto(f.src);
    };
    dot.addEventListener('click', h);
    cleanups.push(() => dot.removeEventListener('click', h));
  });

  // 3D Coverflow Carousel
  const track = rootEl.querySelector('#cf-track');
  const slides = Array.from(track.querySelectorAll('.cf-slide'));
  const dots = Array.from(rootEl.querySelectorAll('.cf-dot'));
  const prevBtn = rootEl.querySelector('#cf-prev-btn');
  const nextBtn = rootEl.querySelector('#cf-next-btn');
  const playBtn = rootEl.querySelector('#cf-play-btn');

  let activeIdx = 0;
  let scrollLockUntil = 0;
  let autoPlay = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  let hovering = false;
  let touching = false;
  let inView = true;
  let slideStart = performance.now();
  const SLIDE_MS = 5200;
  let cfRaf = 0;

  function updateCoverflowTransforms() {
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closest = 0;
    let closestDist = Infinity;

    for (let i = 0; i < slides.length; i++) {
      const r = slides[i].getBoundingClientRect();
      const slideCenter = r.left + r.width / 2;
      const shift = Math.max(-1, Math.min(1, (slideCenter - center) / Math.max(r.width, 1)));
      const absShift = Math.abs(shift);
      slides[i].style.setProperty('--hl-shift', shift.toFixed(4));
      slides[i].style.setProperty('--hl-abs', absShift.toFixed(4));
      if (absShift < closestDist) {
        closestDist = absShift;
        closest = i;
      }
    }
    if (performance.now() > scrollLockUntil && closest !== activeIdx) setActiveDot(closest);
  }

  function setActiveDot(idx) {
    activeIdx = idx;
    slideStart = performance.now();
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === idx);
      const fill = d.querySelector('.cf-dot-fill');
      if (fill) fill.style.transform = 'scaleX(0)';
    });
  }

  function goToSlide(idx, smooth = true) {
    if (!slides.length) return;
    const target = (idx + slides.length) % slides.length;
    setActiveDot(target);
    scrollLockUntil = performance.now() + 560;
    const s = slides[target];
    if (s) {
      const left = s.offsetLeft - (track.clientWidth - s.clientWidth) / 2;
      track.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
    }
  }

  let dragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragLastX = 0;
  let dragLastTime = 0;
  let dragVelocity = 0;

  const onTrackDown = (e) => {
    if (e.pointerType !== 'mouse' || e.target.closest('button')) return;
    dragging = true;
    track.classList.add('is-dragging');
    dragStartX = e.clientX;
    dragLastX = e.clientX;
    dragLastTime = performance.now();
    dragStartScroll = track.scrollLeft;
    dragVelocity = 0;
  };
  const onTrackMove = (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - dragLastTime);
    dragVelocity = (e.clientX - dragLastX) / dt;
    dragLastX = e.clientX;
    dragLastTime = now;
    track.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
  };
  const onTrackUp = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    if (Math.abs(dragVelocity) > 0.45) goToSlide(activeIdx + (dragVelocity < 0 ? 1 : -1));
  };

  const onTrackScroll = () => updateCoverflowTransforms();
  const onTrackEnter = () => { hovering = true; };
  const onTrackLeave = () => { hovering = false; slideStart = performance.now(); };
  const onTrackTouchStart = () => { touching = true; };
  const onTrackTouchEnd = () => { touching = false; slideStart = performance.now(); };

  track.addEventListener('scroll', onTrackScroll, { passive: true });
  track.addEventListener('pointerdown', onTrackDown);
  window.addEventListener('pointermove', onTrackMove, { passive: true });
  window.addEventListener('pointerup', onTrackUp, { passive: true });
  track.addEventListener('mouseenter', onTrackEnter);
  track.addEventListener('mouseleave', onTrackLeave);
  track.addEventListener('touchstart', onTrackTouchStart, { passive: true });
  track.addEventListener('touchend', onTrackTouchEnd, { passive: true });
  window.addEventListener('resize', updateCoverflowTransforms, { passive: true });

  const onPrev = () => goToSlide(activeIdx - 1);
  const onNext = () => goToSlide(activeIdx + 1);
  const onTogglePlay = () => {
    autoPlay = !autoPlay;
    slideStart = performance.now();
    playBtn.setAttribute('aria-label', autoPlay ? 'Pause slideshow' : 'Play slideshow');
    playBtn.innerHTML = autoPlay
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
  };

  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);
  playBtn.addEventListener('click', onTogglePlay);

  dots.forEach((d, idx) => {
    const h = () => goToSlide(idx);
    d.addEventListener('click', h);
    cleanups.push(() => d.removeEventListener('click', h));
  });

  Array.from(rootEl.querySelectorAll('[data-expand-idx]')).forEach((btn) => {
    const h = () => openLightbox(cfItems, Number(btn.dataset.expandIdx));
    btn.addEventListener('click', h);
    cleanups.push(() => btn.removeEventListener('click', h));
  });

  const cfIo = new IntersectionObserver((entries) => {
    inView = !!(entries[0] && entries[0].isIntersecting);
    if (inView) slideStart = performance.now();
  }, { threshold: 0.15 });
  cfIo.observe(track);

  function cfLoop(now) {
    cfRaf = requestAnimationFrame(cfLoop);
    const activeFill = dots[activeIdx] && dots[activeIdx].querySelector('.cf-dot-fill');
    if (autoPlay && !hovering && !touching && !dragging && inView && !document.hidden) {
      const progress = Math.min(1, (now - slideStart) / SLIDE_MS);
      if (activeFill) activeFill.style.transform = `scaleX(${progress.toFixed(4)})`;
      if (progress >= 1) goToSlide(activeIdx + 1);
    } else {
      slideStart = now;
    }
  }
  cfRaf = requestAnimationFrame(cfLoop);
  requestAnimationFrame(updateCoverflowTransforms);

  cleanups.push(() => {
    cancelAnimationFrame(cfRaf);
    cfIo.disconnect();
    track.removeEventListener('scroll', onTrackScroll);
    track.removeEventListener('pointerdown', onTrackDown);
    window.removeEventListener('pointermove', onTrackMove);
    window.removeEventListener('pointerup', onTrackUp);
    track.removeEventListener('mouseenter', onTrackEnter);
    track.removeEventListener('mouseleave', onTrackLeave);
    track.removeEventListener('touchstart', onTrackTouchStart);
    track.removeEventListener('touchend', onTrackTouchEnd);
    window.removeEventListener('resize', updateCoverflowTransforms);
    prevBtn.removeEventListener('click', onPrev);
    nextBtn.removeEventListener('click', onNext);
    playBtn.removeEventListener('click', onTogglePlay);
  });

  return () => cleanups.forEach((fn) => fn());
}

/* ==========================================================================
   PAGE 2: BRIDAL LOOKBOOK (#/gallery)
   ========================================================================== */
function renderGalleryPage(query) {
  const gallery = getGalleryItems();
  const presentCats = Array.from(new Set(gallery.map((g) => g.category)));
  const categories = ['All', ...presentCats];
  const reqCat = query.get('cat');
  const startCat = reqCat && categories.includes(reqCat) ? reqCat : 'All';
  const headerPhoto = gallery.find((g) => g.category === 'Airbrush Bridal') || gallery[0];

  return `
    <section class="sub-hero">
      <img class="sub-hero-bg" src="${escapeHtml(headerPhoto.src)}" alt="" />
      <div class="sub-hero-scrim" aria-hidden="true"></div>
      <div class="container sub-hero-inner">
        <h1 class="display-xl" aria-label="Bridal Makeup Lookbook">${splitWordsMarkup('Bridal Makeup Lookbook')}</h1>
        <p class="lead-copy">
          Filter real bridal finishes by ceremony—HD Bridal, Airbrush Bridal, Reception Glam, Haldi &amp; Mehendi, and Hairstyling &amp; Sider looks. Tap any frame to zoom fullscreen or book that exact look.
        </p>
      </div>
    </section>

    <section class="lifted-sheet">
      <div class="container">
        <div class="filter-rail-wrap">
          <div class="segmented-control" id="gallery-filter" role="tablist" aria-label="Filter lookbook by finish or ceremony">
            <span class="seg-indicator" id="seg-indicator" aria-hidden="true"></span>
            ${categories
              .map(
                (cat) => `<button type="button" role="tab" aria-selected="${cat === startCat}" class="seg-btn ${cat === startCat ? 'is-active' : ''}" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`
              )
              .join('')}
          </div>
          <span id="gallery-count" style="font-size:0.88rem;color:var(--muted);">Showing ${gallery.length} looks</span>
        </div>

        <div class="spotlight-box reveal" id="spotlight-box">
          <div class="spotlight-stage" id="spotlight-stage">
            <img class="spotlight-img" id="spotlight-img" src="${escapeHtml(gallery[0].src)}" alt="${escapeHtml(gallery[0].title)}" />
          </div>
          <div class="spotlight-bar">
            <div>
              <strong id="spotlight-title" style="font-family:var(--font-display);font-size:1.5rem;font-weight:500;">${escapeHtml(gallery[0].title)}</strong>
              <div id="spotlight-meta" style="font-size:0.86rem;color:var(--taupe);">${escapeHtml(gallery[0].category)} · ${escapeHtml(gallery[0].location)}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <button type="button" class="stage-icon-btn" id="spot-prev">Prev</button>
              <button type="button" class="stage-icon-btn" id="spot-next">Next</button>
              <button type="button" class="btn btn-rosegold" style="min-height:40px;padding:0 16px;font-size:0.84rem;" id="spot-expand">Fullscreen</button>
            </div>
          </div>
          <div class="thumb-strip" id="thumb-strip"></div>
        </div>

        <div class="gallery-grid" id="gallery-grid"></div>

        <div class="next-page-bar reveal">
          <div>
            <span style="font-size:0.84rem;color:var(--muted);">Next Page</span>
            <h3 class="display-md">Explore Our Manhari Studio &amp; Luxury Kit</h3>
          </div>
          <a class="btn btn-primary" href="#/about">About Gorgeous Look</a>
        </div>
      </div>
    </section>
  `;
}

function hydrateGalleryPage(rootEl, query) {
  const gallery = getGalleryItems();
  const filterWrap = rootEl.querySelector('#gallery-filter');
  const segBtns = Array.from(filterWrap.querySelectorAll('.seg-btn'));
  const indicator = rootEl.querySelector('#seg-indicator');
  const countEl = rootEl.querySelector('#gallery-count');
  const gridEl = rootEl.querySelector('#gallery-grid');

  const spotStage = rootEl.querySelector('#spotlight-stage');
  const spotTitle = rootEl.querySelector('#spotlight-title');
  const spotMeta = rootEl.querySelector('#spotlight-meta');
  const spotPrev = rootEl.querySelector('#spot-prev');
  const spotNext = rootEl.querySelector('#spot-next');
  const spotExpand = rootEl.querySelector('#spot-expand');
  const thumbStrip = rootEl.querySelector('#thumb-strip');

  const reqCat = query.get('cat');
  let activeCat = segBtns.some((b) => b.dataset.cat === reqCat) ? reqCat : 'All';
  let filtered = [...gallery];
  let spotIdx = 0;
  let touchStartX = 0;

  function positionIndicator() {
    const active = filterWrap.querySelector('.seg-btn.is-active');
    if (!active) return;
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.transform = `translateX(${active.offsetLeft}px)`;
  }

  function renderSpotlight(dir = '') {
    const item = filtered[spotIdx] || filtered[0];
    if (!item) return;
    const wipeClass = dir === 'next' ? 'wipe-next' : dir === 'prev' ? 'wipe-prev' : '';
    spotStage.innerHTML = `<img class="spotlight-img ${wipeClass}" src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" />`;
    spotTitle.textContent = item.title;
    spotMeta.textContent = `${item.category} · ${item.location}`;
    Array.from(thumbStrip.querySelectorAll('.thumb-btn')).forEach((b, i) => {
      b.classList.toggle('is-active', i === spotIdx);
    });
  }

  function renderFiltered() {
    filtered = activeCat === 'All' ? [...gallery] : gallery.filter((g) => g.category === activeCat);
    spotIdx = 0;
    countEl.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'look' : 'looks'}`;

    thumbStrip.innerHTML = filtered
      .map(
        (item, idx) => `<button type="button" class="thumb-btn ${idx === 0 ? 'is-active' : ''}" data-thumb="${idx}" aria-label="Show ${escapeHtml(item.title)}"><img src="${escapeHtml(item.src)}" alt="" /></button>`
      )
      .join('');

    gridEl.innerHTML = filtered
      .map(
        (item, idx) => `
        <button type="button" class="gallery-tile ${item.wide && activeCat === 'All' ? 'is-wide' : ''}" data-tile-idx="${idx}">
          <div class="gallery-tile-media">
            <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" loading="lazy" />
          </div>
          <div class="gallery-tile-cap">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.category)} · ${escapeHtml(item.location)}</span>
          </div>
        </button>`
      )
      .join('');

    renderSpotlight('');
  }

  const onFilterClick = (e) => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    activeCat = btn.dataset.cat;
    if (activeCat !== 'All') trackPulse({ category: activeCat });
    segBtns.forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    positionIndicator();
    renderFiltered();
  };

  const onThumbClick = (e) => {
    const btn = e.target.closest('.thumb-btn');
    if (!btn) return;
    const nextIdx = Number(btn.dataset.thumb);
    const dir = nextIdx >= spotIdx ? 'next' : 'prev';
    spotIdx = nextIdx;
    renderSpotlight(dir);
  };

  const onGridClick = (e) => {
    const tile = e.target.closest('.gallery-tile');
    if (!tile) return;
    openLightbox(filtered, Number(tile.dataset.tileIdx));
  };

  const onPrev = () => { spotIdx = (spotIdx - 1 + filtered.length) % filtered.length; renderSpotlight('prev'); };
  const onNext = () => { spotIdx = (spotIdx + 1) % filtered.length; renderSpotlight('next'); };
  const onExpand = () => openLightbox(filtered, spotIdx);

  const onTouchStart = (e) => { if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 42) (dx < 0 ? onNext : onPrev)();
  };

  filterWrap.addEventListener('click', onFilterClick);
  thumbStrip.addEventListener('click', onThumbClick);
  gridEl.addEventListener('click', onGridClick);
  spotPrev.addEventListener('click', onPrev);
  spotNext.addEventListener('click', onNext);
  spotExpand.addEventListener('click', onExpand);
  spotStage.addEventListener('touchstart', onTouchStart, { passive: true });
  spotStage.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('resize', positionIndicator, { passive: true });

  if (activeCat !== 'All') trackPulse({ category: activeCat });
  renderFiltered();
  requestAnimationFrame(positionIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(positionIndicator);

  return () => {
    filterWrap.removeEventListener('click', onFilterClick);
    thumbStrip.removeEventListener('click', onThumbClick);
    gridEl.removeEventListener('click', onGridClick);
    spotPrev.removeEventListener('click', onPrev);
    spotNext.removeEventListener('click', onNext);
    spotExpand.removeEventListener('click', onExpand);
    spotStage.removeEventListener('touchstart', onTouchStart);
    spotStage.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('resize', positionIndicator);
  };
}

/* ==========================================================================
   PAGE 3: ABOUT & LUXURY KIT (#/about) — Atelier + Sticky 4-Step Bridal Prep
   ========================================================================== */
function getBridalPrepSteps() {
  const atelierPhoto = getSlotPhoto('about_atelier', '/assets/photos/10-vanity-atelier-kit.webp');
  const gallery = getGalleryItems();
  const airbrush = gallery.find((g) => g.category === 'Airbrush Bridal') || gallery[0];
  const bun = gallery.find((g) => g.category === 'Hairstyling & Sider') || gallery[0];
  const veil = gallery.find((g) => g.title.toLowerCase().includes('veil')) || gallery[0];

  return [
    {
      step: 'Step 01 · Skin Prep & Shade Match',
      title: 'Deep hydration and true-undertone base check',
      copy: 'We begin with pH-balanced cleansing, hyaluronic hydration, and pore-smoothing primer matched to your skin type—oily, dry, or combination—so makeup sits like second skin.',
      img: atelierPhoto.src,
      alt: atelierPhoto.title
    },
    {
      step: 'Step 02 · Eye Artistry & Complexion',
      title: 'Lightweight HD or Airbrush finish built for flash',
      copy: 'Using authentic MAC, NARS, Huda Beauty, and Temptu silicone formulas, we sculpt eyes and complexion in ultra-thin layers that resist tears, humidity, and havan warmth.',
      img: airbrush.src,
      alt: airbrush.title
    },
    {
      step: 'Step 03 · Hair Sculpture & Fresh Florals',
      title: 'Secure bridal buns, mogra gajra, or soft waves',
      copy: 'Hair is prepped for volume and pinned symmetrically with fresh mogra garlands, roses, or pearl accents designed to support heavy matha patti and passa jewellery comfortably.',
      img: bun.src,
      alt: bun.title
    },
    {
      step: 'Step 04 · Jewellery & Double Dupatta Draping',
      title: 'Architectural pleating & final mirror check',
      copy: 'We set your nath, choker, rani haar, and double bridal veil cleanly before your portrait session—leaving you with a mini lip touch-up kit for the entire night.',
      img: veil.src,
      alt: veil.title
    }
  ];
}

function renderAboutPage() {
  const { studio, reviews } = siteData;
  const atelierPhoto = getSlotPhoto('about_atelier', '/assets/photos/10-vanity-atelier-kit.webp');
  const steps = getBridalPrepSteps();

  return `
    <section class="sub-hero">
      <img class="sub-hero-bg" src="${escapeHtml(atelierPhoto.src)}" alt="" />
      <div class="sub-hero-scrim" aria-hidden="true"></div>
      <div class="container sub-hero-inner">
        <h1 class="display-xl" aria-label="Luxury skin-first bridal artistry in Manhari.">${splitWordsMarkup('Luxury skin-first bridal artistry in Manhari.')}</h1>
        <p class="lead-copy">
          ${escapeHtml(studio.name)} (${escapeHtml(studio.shortName)}) combines calm bridal prep, authentic international makeup brands, and strict brush hygiene for brides across Farrukhabad and Fatehgarh.
        </p>
      </div>
    </section>

    <section class="lifted-sheet">
      <div class="container editorial-split">
        <div class="reveal">
          <div style="border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-card);">
            <img src="${escapeHtml(atelierPhoto.src)}" alt="${escapeHtml(atelierPhoto.title)}" />
          </div>
        </div>
        <div class="reveal">
          <h2 class="display-lg">Original luxury vanity kit, sanitized tools, unrushed prep</h2>
          <p class="at-scrub" style="color:var(--muted);margin-top:16px;">
            Too many salons pile thick chalky foundation onto every bride regardless of undertone or lighting. At ${escapeHtml(studio.name)}, every product on our Manhari vanity—from Bobbi Brown skin prep to NARS and Huda Beauty pigments—is authentic, skin-safe, and chosen for your lehenga color and ceremony light.
          </p>
          <div class="story-points">
            <div class="story-point">
              <span class="story-num">A</span>
              <div>
                <h3>100% Genuine International Brands</h3>
                <p>MAC, NARS, Huda Beauty, Bobbi Brown, Charlotte Tilbury, Estée Lauder, and Temptu Airbrush—zero replica cosmetics ever touch your skin.</p>
              </div>
            </div>
            <div class="story-point">
              <span class="story-num">B</span>
              <div>
                <h3>Studio Suite &amp; Venue Travel Available</h3>
                <p>Get ready in our calm AC bridal studio in Manhari, or book our portable ring-light travel team directly to your marriage lawn or hotel suite.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cashmere-chapter">
      <div class="container">
        <div class="chapter-rail">
          <span>Your 4-Step Bridal Preparation</span>
          <span>How we take 3.5 calm hours from bare skin to bridal reveal</span>
        </div>
        <div class="chapter-head reveal">
          <div>
            <h2 class="display-lg">Inside a Gorgeous Look bridal session</h2>
            <p>Tap or scroll through each stage of our skin-first bridal prep workflow.</p>
          </div>
        </div>

        <div class="sticky-walkthrough">
          <div class="sticky-visual-col reveal">
            <div class="sticky-frame" id="about-sticky-frame">
              <div class="sticky-frame-inner">
                <img src="${escapeHtml(steps[0].img)}" alt="${escapeHtml(steps[0].alt)}" />
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;">
              <span id="about-step-counter" style="font-size:0.86rem;color:var(--muted);">Step 01 of 04</span>
              <div style="display:flex;gap:8px;">
                <button type="button" class="icon-circle-btn" id="step-prev-btn" aria-label="Previous step">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button type="button" class="icon-circle-btn" id="step-next-btn" aria-label="Next step">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="step-cards">
            ${steps
              .map(
                (s, i) => `
              <article class="step-card ${i === 0 ? 'is-active' : ''}" data-step-idx="${i}" tabindex="0">
                <div class="step-tag">${escapeHtml(s.step)}</div>
                <h3>${escapeHtml(s.title)}</h3>
                <p>${escapeHtml(s.copy)}</p>
              </article>`
              )
              .join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="silk-chapter">
      <div class="container">
        <div class="reviews-grid" style="margin-bottom:36px;">
          ${reviews
            .slice(0, 3)
            .map(
              (r) => `
              <article class="review-card reveal">
                <p class="review-quote">“${escapeHtml(r.quote)}”</p>
                <div class="review-author">
                  <strong>${escapeHtml(r.bride_name)}</strong>
                  <span>${escapeHtml(r.event_type)}</span>
                </div>
              </article>`
            )
            .join('')}
        </div>

        <div class="location-grid reveal">
          <div class="info-card">
            <h3>Visit Our Manhari Studio</h3>
            <p>${escapeHtml(studio.city)}. Easy parking and private AC bridal dressing space.</p>
            <a class="btn btn-ghost-light btn-sm" style="margin-top:14px;" href="${escapeHtml(studio.mapsUrl)}" target="_blank" rel="noopener noreferrer">Open on Google Maps</a>
          </div>
          <div class="info-card">
            <h3>Studio Timings</h3>
            <p>${escapeHtml(studio.hours)}. Early-morning bridal slots from 5:00 AM arranged by advance booking.</p>
          </div>
          <div class="info-card">
            <h3>Direct Booking Line</h3>
            <p>Call or WhatsApp ${escapeHtml(studio.phone)} to check bridal slot availability for your wedding date.</p>
            <a class="btn btn-primary btn-sm" style="margin-top:14px;" href="#/booking">Book Bridal Slot</a>
          </div>
        </div>

        <div class="next-page-bar reveal">
          <div>
            <span style="font-size:0.84rem;color:var(--muted);">Next Page</span>
            <h3 class="display-md">Compare Bridal Packages &amp; Styling Add-Ons</h3>
          </div>
          <a class="btn btn-primary" href="#/plans">View Makeup Packages</a>
        </div>
      </div>
    </section>
  `;
}

function hydrateAboutPage(rootEl) {
  const steps = getBridalPrepSteps();
  const frameWrap = rootEl.querySelector('#about-sticky-frame');
  const counterEl = rootEl.querySelector('#about-step-counter');
  const cards = Array.from(rootEl.querySelectorAll('.step-card'));
  const prevBtn = rootEl.querySelector('#step-prev-btn');
  const nextBtn = rootEl.querySelector('#step-next-btn');

  let cur = 0;
  function setStep(idx) {
    const next = (idx + steps.length) % steps.length;
    if (next === cur && frameWrap.querySelector('img')) return;
    cur = next;
    const s = steps[cur];
    cards.forEach((c, i) => c.classList.toggle('is-active', i === cur));
    frameWrap.innerHTML = `<div class="sticky-frame-inner"><img src="${escapeHtml(s.img)}" alt="${escapeHtml(s.alt)}" /></div>`;
    counterEl.textContent = `Step 0${cur + 1} of 0${steps.length}`;
  }

  const cardHandlers = cards.map((card, i) => {
    const h = () => setStep(i);
    const kh = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setStep(i);
      }
    };
    card.addEventListener('click', h);
    card.addEventListener('keydown', kh);
    return { card, h, kh };
  });

  const onPrev = () => setStep(cur - 1);
  const onNext = () => setStep(cur + 1);
  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.dataset.stepIdx);
          if (!Number.isNaN(idx)) setStep(idx);
        }
      }
    },
    { rootMargin: '-36% 0px -44% 0px', threshold: 0.1 }
  );
  cards.forEach((c) => io.observe(c));

  return () => {
    io.disconnect();
    prevBtn.removeEventListener('click', onPrev);
    nextBtn.removeEventListener('click', onNext);
    cardHandlers.forEach(({ card, h, kh }) => {
      card.removeEventListener('click', h);
      card.removeEventListener('keydown', kh);
    });
  };
}

/* ==========================================================================
   PAGE 4: MAKEUP PACKAGES & STYLING ADD-ONS (#/plans)
   ========================================================================== */
const BRIDAL_FAQS = [
  {
    q: 'How far in advance should I reserve my wedding bridal slot?',
    a: 'We only take 1 to 2 full brides per wedding date so every bride receives calm, dedicated attention. Booking 30 to 60 days ahead guarantees your preferred Ready-By time and locks our live seasonal discount.'
  },
  {
    q: 'What is the difference between HD Bridal and Airbrush Bridal?',
    a: 'HD Signature Bridal uses creamy, high-definition liquid foundations blended with pro brushes and sponges for a natural skin glow. Luxury Airbrush uses an ultra-fine silicone mist sprayed evenly onto skin for maximum sweat-resistance, feather-light feel, and 16+ hour oil control.'
  },
  {
    q: 'Are lashes, lenses, hairstyling, and lehenga dupatta draping included?',
    a: 'Yes—both HD Signature Bridal and Luxury Airbrush Bridal include premium lashes, colored contact lenses, sculpted bridal hairstyling with padding, jewellery setting, and double dupatta draping.'
  },
  {
    q: 'Can you also do party makeup for my sisters, mother, and relatives?',
    a: 'Yes. On our Booking page, simply use the Extra Family / Sider Makeup counter to add as many family members as needed—our assistant artists coordinate alongside your bridal prep so everyone is ready together.'
  }
];

function renderPlansPage() {
  const { offer, plans, addons, studio, trendingPlanId } = siteData;
  const gallery = getGalleryItems();
  const headerPhoto = gallery.find((g) => g.title.toLowerCase().includes('veil')) || gallery[0];

  const offerCard = offer.active
    ? `
      <div class="live-offer-card reveal">
        <div>
          <span class="offer-pill-tag">Live Bridal Offer${offer.validTill ? ` · Valid till ${escapeHtml(offer.validTill)}` : ''}</span>
          <h3>${escapeHtml(offer.title)} — ${offer.percent}% Off Automatically Applied</h3>
          <p>${escapeHtml(offer.note)}. Prices below already show your discounted rate.</p>
        </div>
        <a class="btn btn-rosegold" href="#/booking">Book Slot With Offer</a>
      </div>`
    : '';

  const cardsHtml = plans
    .map((plan) => {
      const { base, finalPrice, savings, hasOffer } = getPlanPricing(plan);
      const isTrend = plan.id === trendingPlanId;
      return `
        <article class="plan-card reveal ${isTrend ? 'is-trending' : ''}" data-plan-card="${escapeHtml(plan.id)}">
          <div>
            <div class="plan-badges">
              ${isTrend ? '<span class="badge-trending">Most Trending Package</span>' : `<span class="badge-views">${escapeHtml(plan.duration)}</span>`}
              <span class="badge-views">${escapeHtml(plan.finish_scope)}</span>
            </div>
            <h3>${escapeHtml(plan.name)}</h3>
            <p class="plan-desc">${escapeHtml(plan.tagline)}</p>
            <div class="plan-price-row">
              <span class="price-final">${formatINR(finalPrice)}</span>
              ${hasOffer ? `<span class="price-old">${formatINR(base)}</span><span class="price-save">Save ${formatINR(savings)}</span>` : ''}
            </div>
            <p style="font-size:0.86rem;color:var(--muted);margin:0 0 14px;">
              <strong>Finish:</strong> ${escapeHtml(plan.finish_scope)} · <strong>Prep Time:</strong> ${escapeHtml(plan.duration)}
            </p>
            <ul class="plan-features">
              ${plan.deliverables.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}
            </ul>
          </div>
          <div class="plan-card-actions">
            <a class="btn btn-primary" href="#/booking?plan=${encodeURIComponent(plan.id)}">Book This Look</a>
          </div>
        </article>`;
    })
    .join('');

  const addonsSection = addons.length
    ? `
      <section class="cashmere-chapter">
        <div class="container">
          <div class="chapter-rail">
            <span>Optional Styling Upgrades &amp; Family Siders</span>
            <span>Extra Sider / Party Makeup: ${formatINR(studio.siderPrice || 2500)} per person</span>
          </div>
          <div class="chapter-head reveal">
            <div>
              <h2 class="display-lg">Add hair extensions, bridal nails, trials, or venue travel</h2>
              <p>Select any optional upgrade on the Booking page—your live estimate updates automatically.</p>
            </div>
            <a class="btn btn-primary" href="#/booking">Customize Your Slot</a>
          </div>
          <div class="addons-grid">
            ${addons
              .map(
                (a) => `
                <article class="addon-card reveal">
                  <div>
                    <h3>${escapeHtml(a.name)}</h3>
                    <p>${escapeHtml(a.note)}</p>
                  </div>
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:10px;border-top:1px solid var(--line-light);">
                    <span class="addon-price">+${formatINR(a.price)}</span>
                    <a class="btn btn-ghost-light btn-sm" href="#/booking?addon=${encodeURIComponent(a.id)}">Add to Booking</a>
                  </div>
                </article>`
              )
              .join('')}
          </div>
        </div>
      </section>`
    : '';

  return `
    <section class="sub-hero">
      <img class="sub-hero-bg" src="${escapeHtml(headerPhoto.src)}" alt="" />
      <div class="sub-hero-scrim" aria-hidden="true"></div>
      <div class="container sub-hero-inner">
        <h1 class="display-xl" aria-label="Makeup Packages & Bridal Details">${splitWordsMarkup('Makeup Packages & Bridal Details')}</h1>
        <p class="lead-copy">
          Clear inclusions, real luxury brands, and transparent rates for every wedding ceremony. Choose any package to check open slots for your date.
        </p>
      </div>
    </section>

    <section class="lifted-sheet">
      <div class="container">
        ${offerCard}
        <div class="plans-grid">${cardsHtml}</div>
      </div>
    </section>

    ${addonsSection}

    <section class="silk-chapter">
      <div class="container-narrow">
        <div class="chapter-rail">
          <span>Bridal Booking Policies &amp; FAQs</span>
          <span>Everything to know before reserving your date</span>
        </div>
        <h2 class="display-lg reveal" style="margin-bottom:26px;">Common questions from brides &amp; families</h2>
        <div class="accordion-list" id="plans-accordion">
          ${BRIDAL_FAQS.map(
            (item, idx) => `
            <div class="acc-item ${idx === 0 ? 'is-open' : ''}">
              <button type="button" class="acc-trigger" aria-expanded="${idx === 0}">
                <span>${escapeHtml(item.q)}</span>
                <svg class="acc-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <div class="acc-body">
                <div class="acc-body-inner"><p>${escapeHtml(item.a)}</p></div>
              </div>
            </div>`
          ).join('')}
        </div>

        <div class="next-page-bar reveal">
          <div>
            <span style="font-size:0.84rem;color:var(--muted);">Ready to check your date?</span>
            <h3 class="display-md">Reserve Your Bridal Slot on WhatsApp</h3>
          </div>
          <a class="btn btn-primary" href="#/booking">Book Your Slot</a>
        </div>
      </div>
    </section>
  `;
}

function hydratePlansPage(rootEl) {
  const cards = Array.from(rootEl.querySelectorAll('[data-plan-card]'));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          trackPulse({ planId: entry.target.dataset.planCard });
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.35 }
  );
  cards.forEach((c) => io.observe(c));

  const acc = rootEl.querySelector('#plans-accordion');
  const onAccClick = (e) => {
    const trig = e.target.closest('.acc-trigger');
    if (!trig) return;
    const item = trig.parentElement;
    const willOpen = !item.classList.contains('is-open');
    item.classList.toggle('is-open', willOpen);
    trig.setAttribute('aria-expanded', String(willOpen));
  };
  acc.addEventListener('click', onAccClick);

  return () => {
    io.disconnect();
    acc.removeEventListener('click', onAccClick);
  };
}

/* ==========================================================================
   PAGE 5: BRIDAL SLOT BOOKING PAGE (#/booking)
   ========================================================================== */
function renderBookingPage(query) {
  const { studio, plans, addons, trendingPlanId } = siteData;
  const gallery = getGalleryItems();
  const headerPhoto = gallery.find((g) => g.category === 'Reception Glam') || gallery[0];
  const prePlanId = query.get('plan') || trendingPlanId || plans[0].id;
  const validPlan = plans.find((p) => p.id === prePlanId) ? prePlanId : plans[0].id;
  const preAddon = query.get('addon') || '';
  const preLook = query.get('look') || '';
  const minDate = todayISO();
  const siderRate = Number(studio.siderPrice || 2500);

  return `
    <section class="sub-hero">
      <img class="sub-hero-bg" src="${escapeHtml(headerPhoto.src)}" alt="" />
      <div class="sub-hero-scrim" aria-hidden="true"></div>
      <div class="container sub-hero-inner">
        <h1 class="display-xl" aria-label="Check Date & Book Your Bridal Slot">${splitWordsMarkup('Check Date & Book Your Bridal Slot')}</h1>
        <p class="lead-copy">
          Pick your makeup package, optional styling add-ons, extra family siders, and your exact Ready-By time—then send your complete bridal booking brief directly to ${escapeHtml(studio.name)} on WhatsApp.
        </p>
      </div>
    </section>

    <section class="lifted-sheet">
      <div class="container booking-layout">
        <form class="booking-form-card" id="booking-form" novalidate>
          <div class="form-block">
            <label class="form-label">1. Select Makeup Package</label>
            <div class="plan-picker-grid" id="plan-picker">
              ${plans
                .map((p) => {
                  const { finalPrice } = getPlanPricing(p);
                  const sel = p.id === validPlan;
                  return `
                    <button type="button" class="plan-pick-btn ${sel ? 'is-selected' : ''}" data-pick-plan="${escapeHtml(p.id)}" aria-pressed="${sel}">
                      <strong>${escapeHtml(p.name)}</strong>
                      <span>${formatINR(finalPrice)} · ${escapeHtml(p.duration)}</span>
                    </button>`;
                })
                .join('')}
            </div>
          </div>

          <div class="form-block">
            <label class="form-label">2. Extra Family / Sider Party Makeups (Optional)</label>
            <div class="sider-stepper-bar">
              <div>
                <strong style="display:block;font-size:0.94rem;">Sisters, Mother &amp; Bridesmaids</strong>
                <span style="font-size:0.82rem;color:var(--muted);">${formatINR(siderRate)} per person · Includes hair &amp; saree/dupatta pinning</span>
              </div>
              <div class="stepper-controls">
                <button type="button" class="stepper-btn" id="sider-minus" aria-label="Decrease sider count">−</button>
                <span class="stepper-val" id="sider-count-val">0</span>
                <button type="button" class="stepper-btn" id="sider-plus" aria-label="Increase sider count">+</button>
              </div>
            </div>
          </div>

          ${
            addons.length
              ? `
          <div class="form-block">
            <label class="form-label">
              3. Optional Styling Add-Ons
              <span class="form-hint">Tap any extras you want included</span>
            </label>
            <div class="addon-toggle-list" id="addon-picker">
              ${addons
                .map((a) => {
                  const sel = a.id === preAddon;
                  return `
                    <button type="button" class="addon-toggle-btn ${sel ? 'is-selected' : ''}" data-pick-addon="${escapeHtml(a.id)}" aria-pressed="${sel}">
                      <div>
                        <strong>${escapeHtml(a.name)}</strong>
                        <span>+${formatINR(a.price)}</span>
                      </div>
                      <span class="addon-check" aria-hidden="true">${sel ? '✓' : ''}</span>
                    </button>`;
                })
                .join('')}
            </div>
          </div>`
              : ''
          }

          <div class="form-block field-row-2">
            <div>
              <label class="form-label" for="bk-name">4. Bride / Customer Full Name *</label>
              <input class="text-input" id="bk-name" type="text" placeholder="e.g. Kritika Mishra" autocomplete="name" required />
            </div>
            <div>
              <label class="form-label" for="bk-phone">Mobile Number (Optional)</label>
              <input class="text-input" id="bk-phone" type="tel" placeholder="e.g. 98765 43210" autocomplete="tel" />
            </div>
          </div>

          <div class="form-block">
            <label class="form-label">5. Where Will You Get Ready?</label>
            <div class="shift-grid" id="mode-picker">
              ${SERVICE_MODES.map(
                (m, i) => `
                <button type="button" class="shift-btn ${i === 0 ? 'is-selected' : ''}" data-mode="${escapeHtml(m.id)}" aria-pressed="${i === 0}">
                  <strong>${escapeHtml(m.title)}</strong>
                  <span>${escapeHtml(m.sub)}</span>
                </button>`
              ).join('')}
            </div>
          </div>

          <div class="form-block field-row-2">
            <div>
              <label class="form-label" for="bk-type">6. Ceremony / Occasion *</label>
              <select class="text-input" id="bk-type">
                ${EVENT_TYPES.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label" for="bk-time">
                7. Ready-By Time *
                <span class="form-hint">When do you need to be fully ready?</span>
              </label>
              <input class="text-input" id="bk-time" type="time" value="19:30" required />
            </div>
          </div>

          <div class="form-block">
            <label class="form-label" for="bk-date">
              8. Event Date *
              <span class="form-hint">Live bridal slot calendar checks automatically</span>
            </label>
            <input class="text-input" id="bk-date" type="date" min="${minDate}" required />
            <div id="date-avail-chip" class="date-status-chip is-open">Bridal slot looks open — confirm on WhatsApp</div>
          </div>

          <div class="form-block">
            <label class="form-label">Preferred Slot Window</label>
            <div class="shift-grid" id="shift-picker">
              ${SHIFTS.map(
                (s, i) => `
                <button type="button" class="shift-btn ${i === 3 ? 'is-selected' : ''}" data-shift="${escapeHtml(s.id)}" data-default-time="${s.defaultTime}" aria-pressed="${i === 3}">
                  <strong>${escapeHtml(s.label)}</strong>
                  <span>${escapeHtml(s.range)}</span>
                </button>`
              ).join('')}
            </div>
          </div>

          <div class="form-block">
            <label class="form-label" for="bk-venue">Venue / Hotel / Address (Optional)</label>
            <input class="text-input" id="bk-venue" type="text" placeholder="e.g. Manhari Studio or Fatehgarh Guest House" />
          </div>

          <div class="form-block" style="margin-bottom:0;">
            <label class="form-label" for="bk-notes">Outfit Color / Makeup Preferences (Optional)</label>
            <textarea class="text-area" id="bk-notes" placeholder="e.g. Deep red velvet lehenga, prefer soft bronze eyes &amp; mogra floral bun">${preLook ? `Interested in look: ${escapeHtml(preLook)}` : ''}</textarea>
          </div>

          <div id="bk-error" class="field-error" role="alert" aria-live="polite"></div>
        </form>

        <aside class="booking-slip" aria-label="Live Bridal Booking Estimate">
          <div class="slip-head">
            <h3>Bridal Slot Slip</h3>
            <p>Sends directly to ${escapeHtml(studio.name)} (${escapeHtml(studio.phone)})</p>
          </div>

          <div class="slip-rows">
            <div class="slip-row"><span>Bride / Client</span><strong id="slip-name">Enter your name</strong></div>
            <div class="slip-row"><span>Occasion</span><strong id="slip-type">Wedding Bridal</strong></div>
            <div class="slip-row"><span>Location</span><strong id="slip-mode">At Manhari Studio</strong></div>
            <div class="slip-row"><span>Package</span><strong id="slip-plan">—</strong></div>
            <div class="slip-row" id="slip-sider-row" style="display:none;"><span>Family Siders</span><strong id="slip-sider">—</strong></div>
            <div class="slip-row" id="slip-addons-row" style="display:none;"><span>Add-Ons</span><strong id="slip-addons">—</strong></div>
            <div class="slip-row"><span>Event Date</span><strong id="slip-date">—</strong></div>
            <div class="slip-row"><span>Ready-By Time</span><strong id="slip-time">Evening / Night · 7:30 PM</strong></div>
            <div class="slip-row" id="slip-offer-row"><span>Live Offer</span><strong style="color:var(--rosegold);" id="slip-offer">—</strong></div>
          </div>

          <div class="slip-total">
            <span style="color:var(--taupe);font-size:0.9rem;">Estimated Total</span>
            <strong id="slip-total">₹0</strong>
          </div>

          <div style="font-size:0.78rem;color:var(--taupe);margin-bottom:8px;">WhatsApp Message Preview</div>
          <div class="slip-preview-msg" id="slip-msg-preview"></div>

          <div class="slip-actions">
            <a id="bk-whatsapp-btn" class="btn btn-rosegold" href="#" target="_blank" rel="noopener noreferrer">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              <span>Book Slot on WhatsApp</span>
            </a>
            <button type="button" id="bk-copy-btn" class="btn btn-ghost-dark">Copy Booking Summary</button>
          </div>

          <div id="bk-toast" class="booking-toast" hidden></div>
        </aside>
      </div>
    </section>
  `;
}

function hydrateBookingPage(rootEl, query) {
  const { studio, plans, addons, bookedDates, offer, trendingPlanId } = siteData;
  const prePlanId = query.get('plan') || trendingPlanId || plans[0].id;
  let selectedPlanId = plans.find((p) => p.id === prePlanId) ? prePlanId : plans[0].id;
  let selectedShift = 'Evening / Night';
  let selectedMode = 'At Manhari Studio';
  let siderCount = 0;
  const siderRate = Number(studio.siderPrice || 2500);
  const selectedAddonIds = new Set();
  const preAddon = query.get('addon');
  if (preAddon && addons.some((a) => a.id === preAddon)) selectedAddonIds.add(preAddon);

  trackPulse({ planId: selectedPlanId });

  const planPicker = rootEl.querySelector('#plan-picker');
  const addonPicker = rootEl.querySelector('#addon-picker');
  const modePicker = rootEl.querySelector('#mode-picker');
  const shiftPicker = rootEl.querySelector('#shift-picker');
  const siderMinus = rootEl.querySelector('#sider-minus');
  const siderPlus = rootEl.querySelector('#sider-plus');
  const siderVal = rootEl.querySelector('#sider-count-val');

  const nameInput = rootEl.querySelector('#bk-name');
  const phoneInput = rootEl.querySelector('#bk-phone');
  const typeSelect = rootEl.querySelector('#bk-type');
  const dateInput = rootEl.querySelector('#bk-date');
  const timeInput = rootEl.querySelector('#bk-time');
  const venueInput = rootEl.querySelector('#bk-venue');
  const notesInput = rootEl.querySelector('#bk-notes');
  const availChip = rootEl.querySelector('#date-avail-chip');
  const errEl = rootEl.querySelector('#bk-error');

  const slipName = rootEl.querySelector('#slip-name');
  const slipType = rootEl.querySelector('#slip-type');
  const slipMode = rootEl.querySelector('#slip-mode');
  const slipPlan = rootEl.querySelector('#slip-plan');
  const slipSiderRow = rootEl.querySelector('#slip-sider-row');
  const slipSider = rootEl.querySelector('#slip-sider');
  const slipAddonsRow = rootEl.querySelector('#slip-addons-row');
  const slipAddons = rootEl.querySelector('#slip-addons');
  const slipDate = rootEl.querySelector('#slip-date');
  const slipTime = rootEl.querySelector('#slip-time');
  const slipOffer = rootEl.querySelector('#slip-offer');
  const slipOfferRow = rootEl.querySelector('#slip-offer-row');
  const slipTotal = rootEl.querySelector('#slip-total');
  const slipPreview = rootEl.querySelector('#slip-msg-preview');
  const waBtn = rootEl.querySelector('#bk-whatsapp-btn');
  const copyBtn = rootEl.querySelector('#bk-copy-btn');
  const toastEl = rootEl.querySelector('#bk-toast');

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 21);
  dateInput.value = `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, '0')}-${String(defaultDate.getDate()).padStart(2, '0')}`;

  function updateDateAvailability() {
    const val = dateInput.value;
    const match = bookedDates.find((d) => d.event_date === val);
    availChip.classList.remove('is-open', 'is-limited', 'is-booked');
    if (match && match.status === 'booked') {
      availChip.classList.add('is-booked');
      availChip.textContent = 'Bridal slots marked Full on this date — message on WhatsApp to check early/late timing.';
    } else if (match && match.status === 'limited') {
      availChip.classList.add('is-limited');
      availChip.textContent = 'Only 1 bridal slot left for this date — send your inquiry soon to lock it.';
    } else {
      availChip.classList.add('is-open');
      availChip.textContent = 'Bridal slot is open on our calendar — send WhatsApp brief to reserve.';
    }
  }

  function calcTotals() {
    const plan = plans.find((p) => p.id === selectedPlanId) || plans[0];
    const pkg = getPlanPricing(plan);
    const chosenAddons = addons.filter((a) => selectedAddonIds.has(a.id));
    const addonsSum = chosenAddons.reduce((s, a) => s + Number(a.price || 0), 0);
    const siderSum = siderCount * siderRate;
    return { plan, pkg, chosenAddons, addonsSum, siderSum, grandTotal: pkg.finalPrice + addonsSum + siderSum };
  }

  function buildMessage() {
    const { plan, pkg, chosenAddons, siderSum, grandTotal } = calcTotals();
    const custName = nameInput.value.trim() || '[Your Name]';
    const custPhone = phoneInput.value.trim();
    const evType = typeSelect.value;
    const niceDate = formatDateNice(dateInput.value);
    const niceTime = formatTime12h(timeInput.value);
    const venue = venueInput.value.trim();
    const notes = notesInput.value.trim();

    return [
      `Namaste ${studio.name}!`,
      `I would like to check bridal slot availability and book makeup:`,
      ``,
      `Name: ${custName}`,
      ...(custPhone ? [`Phone: ${custPhone}`] : []),
      `Occasion: ${evType}`,
      `Service Location: ${selectedMode}`,
      `Package: ${plan.name} (${formatINR(pkg.finalPrice)}${pkg.hasOffer ? ` — ${offer.percent}% ${offer.title} applied` : ''})`,
      ...(siderCount > 0 ? [`Extra Family / Sider Makeups: ${siderCount} person(s) (+${formatINR(siderSum)})`] : []),
      ...(chosenAddons.length ? [`Add-Ons: ${chosenAddons.map((a) => `${a.name} (+${formatINR(a.price)})`).join(', ')}`] : []),
      `Estimated Total: ${formatINR(grandTotal)}`,
      `Event Date: ${niceDate}`,
      `Ready-By Time: ${niceTime} (${selectedShift})`,
      ...(venue ? [`Venue / Address: ${venue}`] : []),
      ...(notes ? [`Outfit / Look Notes: ${notes}`] : []),
      ``,
      `Please confirm slot availability and advance booking details.`
    ].join('\n');
  }

  function syncSummary() {
    updateDateAvailability();
    const { plan, pkg, chosenAddons, addonsSum, siderSum, grandTotal } = calcTotals();

    slipName.textContent = nameInput.value.trim() || 'Enter your name';
    slipType.textContent = typeSelect.value;
    slipMode.textContent = selectedMode;
    slipPlan.textContent = plan.name;
    slipDate.textContent = formatDateNice(dateInput.value);
    slipTime.textContent = `${selectedShift} · ${formatTime12h(timeInput.value)}`;
    slipTotal.textContent = formatINR(grandTotal);
    siderVal.textContent = String(siderCount);

    if (siderCount > 0) {
      slipSiderRow.style.display = '';
      slipSider.textContent = `${siderCount} × ${formatINR(siderRate)} (+${formatINR(siderSum)})`;
    } else {
      slipSiderRow.style.display = 'none';
    }

    if (chosenAddons.length) {
      slipAddonsRow.style.display = '';
      slipAddons.textContent = `${chosenAddons.length} selected (+${formatINR(addonsSum)})`;
    } else {
      slipAddonsRow.style.display = 'none';
    }

    if (pkg.hasOffer) {
      slipOfferRow.style.display = '';
      slipOffer.textContent = `-${formatINR(pkg.savings)} (${offer.percent}% Off)`;
    } else {
      slipOfferRow.style.display = 'none';
    }

    const msg = buildMessage();
    slipPreview.textContent = msg;
    waBtn.href = `https://wa.me/${studio.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  const onPlanPick = (e) => {
    const btn = e.target.closest('[data-pick-plan]');
    if (!btn) return;
    selectedPlanId = btn.dataset.pickPlan;
    trackPulse({ planId: selectedPlanId });
    Array.from(planPicker.querySelectorAll('.plan-pick-btn')).forEach((b) => {
      const sel = b === btn;
      b.classList.toggle('is-selected', sel);
      b.setAttribute('aria-pressed', String(sel));
    });
    syncSummary();
  };

  const onAddonPick = (e) => {
    const btn = e.target.closest('[data-pick-addon]');
    if (!btn) return;
    const aid = btn.dataset.pickAddon;
    if (selectedAddonIds.has(aid)) selectedAddonIds.delete(aid);
    else selectedAddonIds.add(aid);
    const on = selectedAddonIds.has(aid);
    btn.classList.toggle('is-selected', on);
    btn.setAttribute('aria-pressed', String(on));
    const chk = btn.querySelector('.addon-check');
    if (chk) chk.textContent = on ? '✓' : '';
    syncSummary();
  };

  const onModePick = (e) => {
    const btn = e.target.closest('[data-mode]');
    if (!btn) return;
    selectedMode = btn.dataset.mode;
    Array.from(modePicker.querySelectorAll('.shift-btn')).forEach((b) => {
      const sel = b === btn;
      b.classList.toggle('is-selected', sel);
      b.setAttribute('aria-pressed', String(sel));
    });
    syncSummary();
  };

  const onShiftPick = (e) => {
    const btn = e.target.closest('[data-shift]');
    if (!btn) return;
    selectedShift = btn.dataset.shift;
    if (btn.dataset.defaultTime) timeInput.value = btn.dataset.defaultTime;
    Array.from(shiftPicker.querySelectorAll('.shift-btn')).forEach((b) => {
      const sel = b === btn;
      b.classList.toggle('is-selected', sel);
      b.setAttribute('aria-pressed', String(sel));
    });
    syncSummary();
  };

  const onSiderMinus = () => { siderCount = Math.max(0, siderCount - 1); syncSummary(); };
  const onSiderPlus = () => { siderCount = Math.min(10, siderCount + 1); syncSummary(); };

  const onWaClick = (e) => {
    const custName = nameInput.value.trim();
    if (custName.length < 2) {
      e.preventDefault();
      errEl.textContent = 'Please enter the bride or customer name before opening WhatsApp.';
      nameInput.focus();
      return;
    }
    if (!dateInput.value) {
      e.preventDefault();
      errEl.textContent = 'Please choose your event date.';
      dateInput.focus();
      return;
    }
    if (!timeInput.value) {
      e.preventDefault();
      errEl.textContent = 'Please select your Ready-By time.';
      timeInput.focus();
      return;
    }
    errEl.textContent = '';
    syncSummary();
    sendBookingRecord({
      planId: selectedPlanId,
      addonIds: Array.from(selectedAddonIds),
      siderCount,
      customerName: custName,
      customerPhone: phoneInput.value.trim(),
      eventType: typeSelect.value,
      serviceMode: selectedMode,
      eventDate: dateInput.value,
      eventShift: selectedShift,
      readyTime: timeInput.value,
      venue: venueInput.value.trim(),
      notes: notesInput.value.trim()
    });
    toastEl.hidden = false;
    toastEl.textContent = `Bridal slot inquiry logged. Opening WhatsApp for ${studio.name}...`;
  };

  const onCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(buildMessage());
      toastEl.hidden = false;
      toastEl.textContent = 'Booking summary copied. Paste it directly into WhatsApp.';
    } catch (_) {
      toastEl.hidden = false;
      toastEl.textContent = 'Copy blocked by browser—tap Book Slot on WhatsApp above.';
    }
  };

  planPicker.addEventListener('click', onPlanPick);
  if (addonPicker) addonPicker.addEventListener('click', onAddonPick);
  modePicker.addEventListener('click', onModePick);
  shiftPicker.addEventListener('click', onShiftPick);
  siderMinus.addEventListener('click', onSiderMinus);
  siderPlus.addEventListener('click', onSiderPlus);
  nameInput.addEventListener('input', syncSummary);
  phoneInput.addEventListener('input', syncSummary);
  typeSelect.addEventListener('change', syncSummary);
  dateInput.addEventListener('change', syncSummary);
  timeInput.addEventListener('change', syncSummary);
  venueInput.addEventListener('input', syncSummary);
  notesInput.addEventListener('input', syncSummary);
  waBtn.addEventListener('click', onWaClick);
  copyBtn.addEventListener('click', onCopyClick);

  syncSummary();

  return () => {
    planPicker.removeEventListener('click', onPlanPick);
    if (addonPicker) addonPicker.removeEventListener('click', onAddonPick);
    modePicker.removeEventListener('click', onModePick);
    shiftPicker.removeEventListener('click', onShiftPick);
    siderMinus.removeEventListener('click', onSiderMinus);
    siderPlus.removeEventListener('click', onSiderPlus);
    nameInput.removeEventListener('input', syncSummary);
    phoneInput.removeEventListener('input', syncSummary);
    typeSelect.removeEventListener('change', syncSummary);
    dateInput.removeEventListener('change', syncSummary);
    timeInput.removeEventListener('change', syncSummary);
    venueInput.removeEventListener('input', syncSummary);
    notesInput.removeEventListener('input', syncSummary);
    waBtn.removeEventListener('click', onWaClick);
    copyBtn.removeEventListener('click', onCopyClick);
  };
}

/* ==========================================================================
   CUSTOM 404 ILLUMINATED VANITY OVAL PAGE
   ========================================================================== */
function renderNotFoundPage(badPath) {
  return `
    <section class="page-404">
      <div class="vanity-404-box">
        <div class="vanity-ring" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DFB98A" stroke-width="1.6"><ellipse cx="12" cy="12" rx="7" ry="9"/><circle cx="12" cy="12" r="2.2"/></svg>
        </div>
        <p class="code-404">404</p>
        <h1>This bridal look page was not found.</h1>
        <p>
          We could not find <strong>${escapeHtml(badPath || '/unknown')}</strong> in the Gorgeous Look Makeover archive. Browse our bridal lookbook or reserve your wedding slot below.
        </p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <a class="btn btn-rosegold" href="#/">Return Home</a>
          <a class="btn btn-ghost-dark" href="#/gallery">Bridal Lookbook</a>
          <a class="btn btn-ghost-dark" href="#/booking">Book a Slot</a>
        </div>
      </div>
    </section>
  `;
}

/* ==========================================================================
   TWO-STAGE DIRECTIONAL HASH ROUTER
   ========================================================================== */
const viewRoot = document.getElementById('view-root');
const routeBar = document.getElementById('route-bar');

let currentPath = null;
let currentCleanup = null;
let navTimer = 0;
let idleTimer = 0;
let renderSeq = 0;

function parseHash() {
  const raw = window.location.hash || '#/';
  const cleaned = raw.startsWith('#') ? raw.slice(1) : raw;
  const [pathPart, queryPart] = cleaned.split('?');
  const path = pathPart ? (pathPart.startsWith('/') ? pathPart : '/' + pathPart) : '/';
  return { path: path === '' ? '/' : path, query: new URLSearchParams(queryPart || '') };
}

function updateActiveNav(path) {
  document.querySelectorAll('[data-route]').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.route === path);
  });
}

function triggerRouteBar() {
  routeBar.classList.remove('is-sweeping');
  void routeBar.offsetWidth;
  routeBar.classList.add('is-sweeping');
}

function mountRoute(path, query, animate = true) {
  const seq = ++renderSeq;
  const prevIdx = PAGE_ORDER.indexOf(currentPath);
  const nextIdx = PAGE_ORDER.indexOf(path);
  const dir = prevIdx !== -1 && nextIdx !== -1 && nextIdx < prevIdx ? 'bwd' : 'fwd';

  clearTimeout(navTimer);
  clearTimeout(idleTimer);
  setDrawer(false);

  const performSwap = async () => {
    if (seq !== renderSeq) return;
    if (currentCleanup) {
      currentCleanup();
      currentCleanup = null;
    }

    currentPath = path;
    updateActiveNav(path);
    window.scrollTo({ top: 0, behavior: 'auto' });

    if (path === '/admin') {
      document.title = 'Atelier Admin — Gorgeous Look Makeover';
      viewRoot.innerHTML = `<section class="admin-login-wrap"><p style="color:var(--taupe);">Loading Makeover Command Center...</p></section>`;
      viewRoot.className = 'view-shell is-idle';
      try {
        const mod = await import('./admin.js?v=1');
        if (seq !== renderSeq) return;
        const admCleanup = await mod.mountAdminApp(viewRoot, {
          onDataChanged: () => { syncFromServer(); }
        });
        if (seq !== renderSeq) {
          if (admCleanup) admCleanup();
          return;
        }
        currentCleanup = admCleanup;
      } catch (_) {
        viewRoot.innerHTML = renderNotFoundPage('/admin');
      }
      return;
    }

    let html = '';
    let hydrate = null;

    if (path === '/' || path === '/home') {
      html = renderHomePage();
      hydrate = hydrateHomePage;
      document.title = 'Gorgeous Look Makeover (G L Makeover) — Bridal Makeup Atelier, Manhari, Farrukhabad';
    } else if (path === '/gallery') {
      html = renderGalleryPage(query);
      hydrate = hydrateGalleryPage;
      document.title = 'Bridal Lookbook — Gorgeous Look Makeover, Farrukhabad';
    } else if (path === '/about') {
      html = renderAboutPage();
      hydrate = hydrateAboutPage;
      document.title = 'About & Luxury Kit — Gorgeous Look Makeover, Manhari';
    } else if (path === '/plans') {
      html = renderPlansPage();
      hydrate = hydratePlansPage;
      document.title = 'Makeup Packages & Add-Ons — Gorgeous Look Makeover';
    } else if (path === '/booking') {
      html = renderBookingPage(query);
      hydrate = hydrateBookingPage;
      document.title = 'Check Date & Book Bridal Slot — Gorgeous Look Makeover';
    } else {
      html = renderNotFoundPage(path);
      document.title = '404 Look Not Found — Gorgeous Look Makeover';
    }

    viewRoot.innerHTML = html;
    const motionCleanup = setupMotion(viewRoot);
    const pageCleanup = hydrate ? hydrate(viewRoot, query) : null;
    currentCleanup = () => {
      motionCleanup();
      if (pageCleanup) pageCleanup();
    };

    if (animate) {
      viewRoot.className = `view-shell enter-${dir}`;
      idleTimer = setTimeout(() => {
        viewRoot.className = 'view-shell is-idle';
      }, 450);
    } else {
      viewRoot.className = 'view-shell is-idle';
    }
  };

  if (!animate || currentPath === null) {
    performSwap();
  } else {
    triggerRouteBar();
    viewRoot.className = `view-shell exit-${dir}`;
    navTimer = setTimeout(performSwap, 140);
  }
}

export function navigate(targetHash) {
  window.location.hash = targetHash.startsWith('#') ? targetHash : '#' + targetHash;
}

window.addEventListener('hashchange', () => {
  const { path, query } = parseHash();
  mountRoute(path, query, true);
});

(async function boot() {
  await syncFromServer();
  updateShellBranding();
  const initial = parseHash();
  mountRoute(initial.path, initial.query, false);
})();
