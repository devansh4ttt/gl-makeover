/* ==========================================================================
   Gorgeous Look Makeover (G L Makeover) — Production Atelier Admin Panel
   6 Tabs: Analytics & Bridal Leads, Makeup Packages, Offer & Styling Add-Ons,
   Bridal Slot Calendar, Lookbook Photos (WebP auto-compression), and
   Bride Reviews & Studio Settings (including per-person Sider rate).
   Includes the 3D Rose-Gold & Mulberry Geodesic Vanity Sphere.
   ========================================================================== */

import { mountAdminVanitySphere3D } from './scene3d.js?v=1';

const SLOT_LABELS = {
  home_hero: 'Home Hero & 3D Vanity',
  home_signature: 'Home Oval Signature Look',
  about_atelier: 'About Us Atelier Photo',
  gallery: 'Bridal Lookbook'
};

const LOOK_CATEGORIES = [
  'HD Bridal',
  'Airbrush Bridal',
  'Reception Glam',
  'Haldi & Mehendi',
  'Hairstyling & Sider',
  'Atelier'
];

const LEAD_STATUSES = [
  { id: 'new', label: 'New' },
  { id: 'trial', label: 'Trial / Called' },
  { id: 'advance', label: 'Advance Paid' },
  { id: 'completed', label: 'Completed' }
];

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatINR(n) {
  return '₹' + Math.round(Number(n || 0)).toLocaleString('en-IN');
}

function formatTs(ms) {
  if (!ms) return '—';
  const d = new Date(Number(ms));
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function apiFetch(url, options = {}) {
  const opts = {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  };
  const res = await fetch(url, opts);
  let data = {};
  try {
    data = await res.json();
  } catch (_) {}
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

/* Browser-side WebP/JPEG compressor keeping uploads <= 220 KB for free-tier D1 */
async function compressImageFile(file) {
  const bitmapUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not read the selected image file.'));
      el.src = bitmapUrl;
    });

    const maxEdge = 1200;
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    if (w > maxEdge || h > maxEdge) {
      if (w >= h) {
        h = Math.round((h * maxEdge) / w);
        w = maxEdge;
      } else {
        w = Math.round((w * maxEdge) / h);
        h = maxEdge;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    let mime = 'image/webp';
    let dataUrl = canvas.toDataURL(mime, 0.8);
    if (!dataUrl.startsWith('data:image/webp')) {
      mime = 'image/jpeg';
      dataUrl = canvas.toDataURL(mime, 0.8);
    }

    let quality = 0.72;
    while (dataUrl.length > 320000 && quality >= 0.42) {
      dataUrl = canvas.toDataURL(mime, quality);
      quality -= 0.1;
    }

    if (dataUrl.length > 360000) {
      canvas.width = Math.round(w * 0.75);
      canvas.height = Math.round(h * 0.75);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL(mime, 0.72);
    }

    const kb = Math.round((dataUrl.length * 3) / 4 / 1024);
    return { dataUrl, kb, width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

function showAdminToast(message) {
  let el = document.getElementById('gl-admin-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gl-admin-toast';
    el.className = 'admin-toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.hidden = true;
  }, 3400);
}

export async function mountAdminApp(rootEl, { onDataChanged } = {}) {
  const cleanups = [];
  let sphereCtrl = null;
  let state = null;
  let activeTab = 'analytics';
  let editingPlanId = null;
  let editingAddonId = null;
  let editingMediaId = null;
  let pendingImageData = '';
  let mediaSlotFilter = 'all';

  function disposeSphere() {
    if (sphereCtrl) {
      sphereCtrl.dispose();
      sphereCtrl = null;
    }
  }
  cleanups.push(disposeSphere);

  /* ---------- Sign-In View ---------- */
  function renderLoginView(errMsg = '', adminConfigured = true) {
    disposeSphere();
    rootEl.innerHTML = `
      <section class="admin-login-wrap">
        <div class="admin-login-card">
          <span class="live-status-pill" style="margin-bottom:10px;">
            <span class="live-pulse-dot" aria-hidden="true"></span>
            <span>Gorgeous Look Atelier Control</span>
          </span>
          <h1>Atelier Admin Sign In</h1>
          <p>Sign in with your studio password to manage makeup packages, add-ons, booked bridal dates, live offers, lookbook photos, and incoming inquiries.</p>
          ${
            !adminConfigured
              ? `<div class="field-error" style="color:#F5B8C4;margin-bottom:16px;">Set the <strong>ADMIN_PASSWORD</strong> secret in Cloudflare Worker Settings to enable sign-in.</div>`
              : ''
          }
          <form id="adm-login-form" novalidate>
            <div class="form-block" style="margin-bottom:16px;">
              <label class="form-label" for="adm-pass" style="color:var(--light-text);">Admin Password</label>
              <input class="dark-input" id="adm-pass" type="password" autocomplete="current-password" placeholder="Enter studio password" required />
            </div>
            <div id="adm-login-err" class="field-error" style="color:#F5B8C4;margin-bottom:14px;">${esc(errMsg)}</div>
            <button type="submit" class="btn btn-rosegold" style="width:100%;" id="adm-login-btn">Sign In to Admin Panel</button>
          </form>
          <div style="margin-top:16px;text-align:center;">
            <a href="#/" style="font-size:0.86rem;color:var(--taupe);text-decoration:underline;">Return to Public Website</a>
          </div>
        </div>
      </section>
    `;

    const form = rootEl.querySelector('#adm-login-form');
    const passInput = rootEl.querySelector('#adm-pass');
    const errEl = rootEl.querySelector('#adm-login-err');
    const btn = rootEl.querySelector('#adm-login-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = passInput.value;
      if (!pw) {
        errEl.textContent = 'Please enter your admin password.';
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Verifying...';
      errEl.textContent = '';
      try {
        await apiFetch('/api/v1/makeover-auth/login', {
          method: 'POST',
          body: JSON.stringify({ password: pw })
        });
        await loadAndRenderDashboard();
      } catch (err) {
        errEl.textContent = err.message || 'Sign in failed.';
        btn.disabled = false;
        btn.textContent = 'Sign In to Admin Panel';
        passInput.value = '';
        passInput.focus();
      }
    });
  }

  /* ---------- Load Overview & Render Shell ---------- */
  async function loadAndRenderDashboard() {
    try {
      state = await apiFetch('/api/v1/makeover-cms/overview');
    } catch (err) {
      if (String(err.message).toLowerCase().includes('unauthorized')) {
        renderLoginView('Your session ended. Please sign in again.');
        return;
      }
      showAdminToast(err.message);
      return;
    }

    if (typeof onDataChanged === 'function') onDataChanged();
    renderDashboardShell();
  }

  function renderDashboardShell() {
    const { analytics, plans, offer, bookedDates, media, recentBookings } = state;
    const trendingPlan = plans.find((p) => p.id === analytics.trendingPlanId) || plans[0];

    const tabs = [
      { id: 'analytics', label: `Analytics & Brides (${recentBookings.length})` },
      { id: 'plans', label: `Packages (${plans.length})` },
      { id: 'offer', label: offer.active ? `Offer (${offer.percent}%) & Add-Ons` : 'Offer & Add-Ons' },
      { id: 'dates', label: `Slot Calendar (${bookedDates.length})` },
      { id: 'media', label: `Lookbook (${media.length})` },
      { id: 'reviews', label: 'Reviews & Studio' }
    ];

    rootEl.innerHTML = `
      <section class="admin-hero">
        <div class="container admin-hero-grid">
          <div>
            <div class="live-status-pill">
              <span class="live-pulse-dot" aria-hidden="true"></span>
              <span>Gorgeous Look Atelier Connected · Secure Session</span>
            </div>
            <h1 class="display-lg">Makeover Command Center</h1>
            <p style="color:var(--taupe);margin:10px 0 20px;max-width:54ch;">
              Update bridal makeup packages, launch seasonal offers, mark busy wedding dates, upload fresh bride photos from your phone, and manage every inquiry in one place.
            </p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <a class="btn btn-rosegold btn-sm" href="#/" target="_blank" rel="noopener noreferrer">Open Live Site</a>
              <button type="button" class="btn btn-ghost-dark btn-sm" id="adm-refresh-btn">Refresh Data</button>
              <button type="button" class="btn btn-ghost-dark btn-sm" id="adm-logout-btn">Sign Out All Devices</button>
            </div>
          </div>

          <div class="sphere-stage" id="admin-sphere-stage">
            <div class="sphere-fallback-rings" aria-hidden="true">
              <div class="sphere-fallback-inner"></div>
            </div>
            <div class="sphere-canvas-host" id="admin-sphere-host" aria-label="Interactive 3D vanity activity sphere — drag to spin"></div>
            <div class="sphere-caption">
              <span>Atelier Activity Sphere</span>
              <span>Drag to spin · Double-tap boost</span>
            </div>
          </div>
        </div>
      </section>

      <section class="admin-shell">
        <div class="container">
          <div class="admin-toolbar">
            <div class="segmented-control" id="admin-tabs" role="tablist" aria-label="Admin sections">
              <span class="seg-indicator" id="admin-tab-ind" aria-hidden="true"></span>
              ${tabs
                .map(
                  (t) =>
                    `<button type="button" role="tab" aria-selected="${t.id === activeTab}" class="seg-btn ${t.id === activeTab ? 'is-active' : ''}" data-adm-tab="${t.id}">${esc(t.label)}</button>`
                )
                .join('')}
            </div>
            <div style="font-size:0.86rem;color:var(--muted);">
              Trending: <strong style="color:var(--mulberry);">${esc(trendingPlan ? trendingPlan.name : '—')}</strong> · Top Look: <strong style="color:var(--ink);">${esc(analytics.topLookStyle || 'HD Bridal')}</strong>
            </div>
          </div>

          <div id="admin-tab-body"></div>
        </div>
      </section>
    `;

    // Mount 3D Rose-Gold Geodesic Vanity Sphere
    const sphereHost = rootEl.querySelector('#admin-sphere-host');
    const activityScore = analytics.totalBookings * 3 + Math.min(20, analytics.totalViews * 0.2);
    disposeSphere();
    mountAdminVanitySphere3D(sphereHost, activityScore).then((ctrl) => {
      if (!document.body.contains(sphereHost)) {
        ctrl.dispose();
        return;
      }
      sphereCtrl = ctrl;
      if (ctrl.supported) {
        const fb = rootEl.querySelector('.sphere-fallback-rings');
        if (fb) fb.style.display = 'none';
      }
    });

    const tabWrap = rootEl.querySelector('#admin-tabs');
    const tabInd = rootEl.querySelector('#admin-tab-ind');
    const posTabInd = () => {
      const act = tabWrap.querySelector('.seg-btn.is-active');
      if (!act) return;
      tabInd.style.width = `${act.offsetWidth}px`;
      tabInd.style.transform = `translateX(${act.offsetLeft}px)`;
    };
    requestAnimationFrame(posTabInd);

    tabWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-adm-tab]');
      if (!btn) return;
      activeTab = btn.dataset.admTab;
      Array.from(tabWrap.querySelectorAll('.seg-btn')).forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      posTabInd();
      renderActiveTab();
    });

    rootEl.querySelector('#adm-refresh-btn').addEventListener('click', async () => {
      showAdminToast('Refreshing live studio data...');
      await loadAndRenderDashboard();
    });

    rootEl.querySelector('#adm-logout-btn').addEventListener('click', async () => {
      try {
        await apiFetch('/api/v1/makeover-auth/logout', { method: 'POST', body: '{}' });
      } catch (_) {}
      showAdminToast('Signed out from all devices.');
      renderLoginView('');
    });

    renderActiveTab();
  }

  function renderActiveTab() {
    const body = rootEl.querySelector('#admin-tab-body');
    if (!body) return;
    if (activeTab === 'analytics') renderAnalyticsTab(body);
    else if (activeTab === 'plans') renderPlansTab(body);
    else if (activeTab === 'offer') renderOfferAddonsTab(body);
    else if (activeTab === 'dates') renderDatesTab(body);
    else if (activeTab === 'media') renderMediaTab(body);
    else if (activeTab === 'reviews') renderReviewsSettingsTab(body);
  }

  /* ---------- TAB 1: ANALYTICS & BRIDAL LEADS PIPELINE ---------- */
  function renderAnalyticsTab(container) {
    const { analytics, plans, offer, recentBookings } = state;
    const trendingPlan = plans.find((p) => p.id === analytics.trendingPlanId) || plans[0];
    const maxViews = Math.max(1, ...plans.map((p) => p.views));

    const barsHtml = plans
      .map((p) => {
        const isTrend = p.id === analytics.trendingPlanId;
        const rate = p.views > 0 ? Math.round((p.bookings / p.views) * 100) : 0;
        const viewPct = Math.max(4, Math.round((p.views / maxViews) * 100));
        const bookPct = Math.min(viewPct, Math.round((p.bookings / maxViews) * 100));
        return `
          <div class="bar-row">
            <div class="bar-row-top">
              <strong>
                ${esc(p.name)}
                ${isTrend ? ' <span class="badge-trending" style="margin-left:6px;padding:2px 9px;font-size:0.72rem;">Most Trending</span>' : ''}
              </strong>
              <span style="color:var(--muted);">
                <strong>${p.views}</strong> visits · <strong style="color:var(--mulberry);">${p.bookings}</strong> booked (${rate}% conv.)
              </span>
            </div>
            <div class="bar-track" aria-hidden="true">
              <div class="bar-fill-book" style="width:${bookPct}%;"></div>
              <div class="bar-fill-views" style="width:${Math.max(0, viewPct - bookPct)}%;"></div>
            </div>
          </div>`;
      })
      .join('');

    const leadsHtml = recentBookings.length
      ? `
        <div class="table-scroll">
          <table class="bookings-table">
            <thead>
              <tr>
                <th>Bride / Client</th>
                <th>Package, Siders &amp; Quote</th>
                <th>Date, Ready-By &amp; Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${recentBookings
                .map((b) => {
                  const cleanPhone = String(b.customer_phone || '').replace(/[^0-9]/g, '');
                  const replyLink = cleanPhone.length >= 10
                    ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(`Namaste ${b.customer_name}, thank you for contacting Gorgeous Look Makeover regarding ${b.plan_name} on ${b.event_date}. Your bridal slot is open—let us finalize your Ready-By timing.`)}`
                    : '';
                  return `
                    <tr>
                      <td>
                        <strong>${esc(b.customer_name)}</strong>
                        ${b.customer_phone ? `<div style="font-size:0.8rem;color:var(--muted);">${esc(b.customer_phone)}</div>` : ''}
                        <div style="font-size:0.75rem;color:var(--muted);">${formatTs(b.created_at)}</div>
                      </td>
                      <td>
                        <strong>${esc(b.plan_name)}</strong>
                        <div style="font-size:0.84rem;color:var(--mulberry);font-weight:700;">${formatINR(b.quoted_price)}</div>
                        ${Number(b.sider_count) > 0 ? `<div style="font-size:0.76rem;color:var(--sage);font-weight:600;">+ ${b.sider_count} Family Sider(s)</div>` : ''}
                        ${b.addon_names ? `<div style="font-size:0.76rem;color:var(--muted);">+ ${esc(b.addon_names)}</div>` : ''}
                        ${b.offer_applied ? `<div style="font-size:0.74rem;color:var(--sage);">${esc(b.offer_applied)}</div>` : ''}
                      </td>
                      <td>
                        <strong>${esc(b.event_date)} · ${esc(b.event_type)}</strong>
                        <div style="font-size:0.8rem;color:var(--muted);">Ready by ${esc(b.ready_time)} (${esc(b.event_shift)})</div>
                        <div style="font-size:0.8rem;color:var(--ink);">${esc(b.service_mode)}${b.venue ? ` · ${esc(b.venue)}` : ''}</div>
                        ${b.notes ? `<div style="font-size:0.78rem;color:var(--muted);max-width:220px;">${esc(b.notes)}</div>` : ''}
                      </td>
                      <td>
                        <select class="text-input" style="min-height:36px;padding:4px 10px;font-size:0.82rem;min-width:128px;" data-status-booking="${b.id}" aria-label="Status for ${esc(b.customer_name)}">
                          ${LEAD_STATUSES.map((st) => `<option value="${st.id}" ${b.status === st.id ? 'selected' : ''}>${st.label}</option>`).join('')}
                        </select>
                      </td>
                      <td>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
                          ${replyLink ? `<a class="btn btn-sage btn-sm" href="${replyLink}" target="_blank" rel="noopener noreferrer">Reply</a>` : ''}
                          <button type="button" class="btn btn-danger btn-sm" data-del-booking="${b.id}">Delete</button>
                        </div>
                      </td>
                    </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>`
      : `<p style="color:var(--muted);margin:0;">No bridal inquiries logged yet. Whenever a bride checks a date and taps Book Slot on WhatsApp, her full details appear here automatically.</p>`;

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Package Visits</div>
          <div class="kpi-value">${analytics.totalViews.toLocaleString('en-IN')}</div>
          <div class="kpi-sub">Unique visitor views across packages</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Bridal Inquiries</div>
          <div class="kpi-value">${analytics.totalBookings.toLocaleString('en-IN')}</div>
          <div class="kpi-sub">${analytics.conversionRate}% conversion · ${offer.active ? `${offer.percent}% offer on` : 'Standard pricing'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Most Viewed Look</div>
          <div class="kpi-value" style="font-size:1.38rem;">${esc(analytics.topLookStyle || 'HD Bridal')}</div>
          <div class="kpi-sub">Top lookbook filter tapped</div>
        </div>
        <div class="kpi-card is-highlight">
          <div class="kpi-label">Most Trending Package</div>
          <div class="kpi-value" style="font-size:1.32rem;">${esc(trendingPlan ? trendingPlan.name : '—')}</div>
          <div class="kpi-sub">${trendingPlan ? `${trendingPlan.views} visits · ${trendingPlan.bookings} booked` : ''}</div>
        </div>
      </div>

      <div class="admin-panel-card">
        <div class="admin-panel-head">
          <h2>Makeup Package Performance</h2>
          <span style="font-size:0.82rem;color:var(--muted);">Mulberry = Booked · Espresso = Visits</span>
        </div>
        <div class="bar-list">${barsHtml}</div>
      </div>

      <div class="admin-panel-card">
        <div class="admin-panel-head">
          <h2>Incoming Bridal Slot Inquiries</h2>
          <span style="font-size:0.84rem;color:var(--muted);">${recentBookings.length} recorded</span>
        </div>
        ${leadsHtml}
      </div>
    `;

    container.addEventListener('change', async (e) => {
      const sel = e.target.closest('[data-status-booking]');
      if (!sel) return;
      try {
        await apiFetch(`/api/v1/makeover-cms/bookings/${sel.dataset.statusBooking}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: sel.value })
        });
        showAdminToast(`Lead updated to ${sel.value}.`);
      } catch (err) {
        showAdminToast(err.message);
      }
    });

    container.addEventListener('click', async (e) => {
      const delBtn = e.target.closest('[data-del-booking]');
      if (!delBtn) return;
      if (!window.confirm('Delete this bridal inquiry?')) return;
      delBtn.disabled = true;
      try {
        await apiFetch(`/api/v1/makeover-cms/bookings/${delBtn.dataset.delBooking}`, { method: 'DELETE' });
        showAdminToast('Lead removed.');
        await loadAndRenderDashboard();
      } catch (err) {
        showAdminToast(err.message);
        delBtn.disabled = false;
      }
    });
  }

  /* ---------- TAB 2: MAKEUP PACKAGES CRUD ---------- */
  function renderPlansTab(container) {
    const { plans } = state;
    const editing = editingPlanId ? plans.find((p) => p.id === editingPlanId) : null;

    container.innerHTML = `
      <div class="admin-split">
        <div class="admin-panel-card">
          <div class="admin-panel-head">
            <h2>${editing ? 'Edit Makeup Package' : 'Add New Makeup Package'}</h2>
            ${editing ? '<button type="button" class="btn btn-ghost-light btn-sm" id="plan-cancel-edit">Add New Instead</button>' : ''}
          </div>
          <form id="adm-plan-form">
            <div class="form-block" style="margin-bottom:14px;">
              <label class="form-label" for="pf-name">Package Name *</label>
              <input class="text-input" id="pf-name" required value="${esc(editing ? editing.name : '')}" placeholder="e.g. Royal Bridal + Pre-Bridal Glow" />
            </div>
            <div class="form-block field-row-2" style="margin-bottom:14px;">
              <div>
                <label class="form-label" for="pf-price">Base Price (₹) *</label>
                <input class="text-input" id="pf-price" type="number" min="500" max="1000000" required value="${esc(editing ? editing.price : '')}" placeholder="e.g. 15999" />
              </div>
              <div>
                <label class="form-label" for="pf-order">Display Order</label>
                <input class="text-input" id="pf-order" type="number" min="1" max="99" value="${esc(editing ? editing.sort_order : plans.length + 1)}" />
              </div>
            </div>
            <div class="form-block field-row-2" style="margin-bottom:14px;">
              <div>
                <label class="form-label" for="pf-dur">Prep Duration *</label>
                <input class="text-input" id="pf-dur" required value="${esc(editing ? editing.duration : '')}" placeholder="e.g. 3.5 Hours Prep" />
              </div>
              <div>
                <label class="form-label" for="pf-finish">Skin Finish / Kit *</label>
                <input class="text-input" id="pf-finish" required value="${esc(editing ? editing.finish_scope : '')}" placeholder="e.g. Silicone Airbrush + Luxury Kit" />
              </div>
            </div>
            <div class="form-block" style="margin-bottom:14px;">
              <label class="form-label" for="pf-desc">Short Description *</label>
              <textarea class="text-area" id="pf-desc" required placeholder="Describe the look, finish, and best occasion...">${esc(editing ? editing.tagline : '')}</textarea>
            </div>
            <div class="form-block" style="margin-bottom:18px;">
              <label class="form-label" for="pf-deliv">What's Included (One item per line) *</label>
              <textarea class="text-area" id="pf-deliv" style="min-height:124px;" required placeholder="MAC, NARS &amp; Huda Beauty luxury kit&#10;Mink-effect lashes &amp; colored lenses&#10;Bridal floral bun &amp; double dupatta draping">${esc(editing ? editing.deliverables.join('\n') : '')}</textarea>
            </div>
            <button type="submit" class="btn btn-primary" id="pf-submit">${editing ? 'Save Package Changes' : 'Publish New Package'}</button>
          </form>
        </div>

        <div class="admin-panel-card">
          <div class="admin-panel-head">
            <h2>Active Website Packages</h2>
            <span style="font-size:0.84rem;color:var(--muted);">Changes go live immediately</span>
          </div>
          <div class="cms-list">
            ${plans
              .map(
                (p) => `
                <div class="cms-item">
                  <div>
                    <strong style="font-size:1rem;">${esc(p.name)}</strong>
                    <div style="font-size:0.86rem;color:var(--mulberry);font-weight:700;margin-top:2px;">${formatINR(p.price)} · ${esc(p.duration)}</div>
                    <div style="font-size:0.82rem;color:var(--muted);margin-top:4px;">${p.views} visits · ${p.bookings} booked · ${p.deliverables.length} inclusions</div>
                  </div>
                  <div class="cms-item-actions">
                    <button type="button" class="btn btn-ghost-light btn-sm" data-edit-plan="${esc(p.id)}">Edit</button>
                    <button type="button" class="btn btn-danger btn-sm" data-del-plan="${esc(p.id)}">Delete</button>
                  </div>
                </div>`
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    const cancelBtn = container.querySelector('#plan-cancel-edit');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        editingPlanId = null;
        renderPlansTab(container);
      });
    }

    container.querySelector('#adm-plan-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = container.querySelector('#pf-submit');
      const deliverables = container
        .querySelector('#pf-deliv')
        .value.split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
      try {
        await apiFetch('/api/v1/makeover-cms/plans', {
          method: 'POST',
          body: JSON.stringify({
            id: editing ? editing.id : undefined,
            name: container.querySelector('#pf-name').value.trim(),
            price: Number(container.querySelector('#pf-price').value),
            sort_order: Number(container.querySelector('#pf-order').value || 1),
            duration: container.querySelector('#pf-dur').value.trim(),
            finish_scope: container.querySelector('#pf-finish').value.trim(),
            tagline: container.querySelector('#pf-desc').value.trim(),
            deliverables
          })
        });
        editingPlanId = null;
        showAdminToast('Makeup package saved live.');
        await loadAndRenderDashboard();
      } catch (err) {
        showAdminToast(err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = editing ? 'Save Package Changes' : 'Publish New Package';
      }
    });

    container.addEventListener('click', async (e) => {
      const ed = e.target.closest('[data-edit-plan]');
      if (ed) {
        editingPlanId = ed.dataset.editPlan;
        renderPlansTab(container);
        return;
      }
      const del = e.target.closest('[data-del-plan]');
      if (del) {
        if (!window.confirm('Delete this package from the live website?')) return;
        del.disabled = true;
        try {
          await apiFetch(`/api/v1/makeover-cms/plans/${encodeURIComponent(del.dataset.delPlan)}`, { method: 'DELETE' });
          if (editingPlanId === del.dataset.delPlan) editingPlanId = null;
          showAdminToast('Package deleted.');
          await loadAndRenderDashboard();
        } catch (err) {
          showAdminToast(err.message);
          del.disabled = false;
        }
      }
    });
  }

  /* ---------- TAB 3: LIVE BRIDAL OFFER + STYLING ADD-ONS ---------- */
  function renderOfferAddonsTab(container) {
    const { offer, plans, addons } = state;
    let liveActive = Boolean(offer.active);
    const editAddon = editingAddonId ? addons.find((a) => a.id === editingAddonId) : null;

    container.innerHTML = `
      <div class="admin-split" style="margin-bottom:22px;">
        <div class="admin-panel-card" style="margin-bottom:0;">
          <div class="admin-panel-head">
            <h2>Live Bridal Offer Switch</h2>
          </div>
          <div class="switch-row">
            <div>
              <strong>Offer Ribbon &amp; Automatic Discount</strong>
              <div style="font-size:0.84rem;color:var(--muted);">Turns seasonal bridal savings ON or OFF across Home, Packages, and WhatsApp quotes</div>
            </div>
            <button type="button" id="offer-toggle" class="toggle-switch ${liveActive ? 'is-on' : ''}" role="switch" aria-checked="${liveActive}" aria-label="Toggle live bridal offer"></button>
          </div>
          <form id="adm-offer-form">
            <div class="form-block field-row-2" style="margin-bottom:14px;">
              <div>
                <label class="form-label" for="of-title">Offer Title</label>
                <input class="text-input" id="of-title" value="${esc(offer.title)}" required />
              </div>
              <div>
                <label class="form-label" for="of-pct">Discount (%)</label>
                <input class="text-input" id="of-pct" type="number" min="0" max="75" value="${esc(offer.percent)}" required />
              </div>
            </div>
            <div class="form-block" style="margin-bottom:14px;">
              <label class="form-label" for="of-note">Offer Banner Message</label>
              <input class="text-input" id="of-note" value="${esc(offer.note)}" />
            </div>
            <div class="form-block" style="margin-bottom:18px;">
              <label class="form-label" for="of-valid">Valid Till Text</label>
              <input class="text-input" id="of-valid" value="${esc(offer.validTill)}" placeholder="e.g. 31 Dec 2026" />
            </div>
            <button type="submit" class="btn btn-primary" id="of-save-btn">Update Live Offer</button>
          </form>
        </div>

        <div class="admin-panel-card" style="margin-bottom:0;">
          <div class="admin-panel-head">
            <h2>Live Bride Price Preview</h2>
          </div>
          <div class="cms-list" id="offer-price-preview"></div>
        </div>
      </div>

      <div class="admin-split">
        <div class="admin-panel-card">
          <div class="admin-panel-head">
            <h2>${editAddon ? 'Edit Styling Add-On' : 'Add Optional Styling Upgrade'}</h2>
            ${editAddon ? '<button type="button" class="btn btn-ghost-light btn-sm" id="addon-cancel-edit">Add New Instead</button>' : ''}
          </div>
          <form id="adm-addon-form">
            <div class="form-block" style="margin-bottom:14px;">
              <label class="form-label" for="ad-name">Add-On Name *</label>
              <input class="text-input" id="ad-name" required value="${esc(editAddon ? editAddon.name : '')}" placeholder="e.g. Fresh Mogra Floral Hair Bun Set" />
            </div>
            <div class="form-block field-row-2" style="margin-bottom:14px;">
              <div>
                <label class="form-label" for="ad-price">Extra Price (₹) *</label>
                <input class="text-input" id="ad-price" type="number" min="100" max="250000" required value="${esc(editAddon ? editAddon.price : '')}" placeholder="e.g. 1200" />
              </div>
              <div>
                <label class="form-label" for="ad-order">Order</label>
                <input class="text-input" id="ad-order" type="number" min="1" max="99" value="${esc(editAddon ? editAddon.sort_order : addons.length + 1)}" />
              </div>
            </div>
            <div class="form-block" style="margin-bottom:18px;">
              <label class="form-label" for="ad-note">Short Note</label>
              <input class="text-input" id="ad-note" value="${esc(editAddon ? editAddon.note : '')}" placeholder="e.g. Arranged fresh on the wedding morning" />
            </div>
            <button type="submit" class="btn btn-primary" id="ad-save-btn">${editAddon ? 'Save Add-On' : 'Publish Add-On'}</button>
          </form>
        </div>

        <div class="admin-panel-card">
          <div class="admin-panel-head">
            <h2>Active Styling Add-Ons (${addons.length})</h2>
          </div>
          <div class="cms-list">
            ${addons
              .map(
                (a) => `
                <div class="cms-item">
                  <div>
                    <strong>${esc(a.name)}</strong>
                    <div style="font-size:0.84rem;color:var(--mulberry);font-weight:700;">+${formatINR(a.price)}</div>
                    <div style="font-size:0.8rem;color:var(--muted);">${esc(a.note)}</div>
                  </div>
                  <div class="cms-item-actions">
                    <button type="button" class="btn btn-ghost-light btn-sm" data-edit-addon="${esc(a.id)}">Edit</button>
                    <button type="button" class="btn btn-danger btn-sm" data-del-addon="${esc(a.id)}">Delete</button>
                  </div>
                </div>`
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    const toggleBtn = container.querySelector('#offer-toggle');
    const pctInput = container.querySelector('#of-pct');
    const previewList = container.querySelector('#offer-price-preview');

    function syncPreview() {
      const pct = liveActive ? Math.max(0, Math.min(75, Number(pctInput.value || 0))) : 0;
      previewList.innerHTML = plans
        .map((p) => {
          const finalP = pct > 0 ? Math.round((p.price * (100 - pct)) / 100) : p.price;
          return `
            <div class="cms-item">
              <div>
                <strong>${esc(p.name)}</strong>
                <div style="font-size:0.82rem;color:var(--muted);">Base: ${formatINR(p.price)}</div>
              </div>
              <div style="text-align:right;">
                <strong style="color:var(--mulberry);font-size:1.05rem;">${formatINR(finalP)}</strong>
                <div style="font-size:0.78rem;color:var(--sage);">${pct > 0 ? `-${pct}% live` : 'Regular rate'}</div>
              </div>
            </div>`;
        })
        .join('');
    }

    toggleBtn.addEventListener('click', () => {
      liveActive = !liveActive;
      toggleBtn.classList.toggle('is-on', liveActive);
      toggleBtn.setAttribute('aria-checked', String(liveActive));
      syncPreview();
    });
    pctInput.addEventListener('input', syncPreview);
    syncPreview();

    container.querySelector('#adm-offer-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = container.querySelector('#of-save-btn');
      btn.disabled = true;
      btn.textContent = 'Saving...';
      try {
        await apiFetch('/api/v1/makeover-cms/offer', {
          method: 'PUT',
          body: JSON.stringify({
            active: liveActive,
            title: container.querySelector('#of-title').value.trim(),
            percent: Number(pctInput.value || 0),
            note: container.querySelector('#of-note').value.trim(),
            validTill: container.querySelector('#of-valid').value.trim()
          })
        });
        showAdminToast(liveActive ? 'Live bridal offer published!' : 'Bridal offer switched off.');
        await loadAndRenderDashboard();
      } catch (err) {
        showAdminToast(err.message);
        btn.disabled = false;
        btn.textContent = 'Update Live Offer';
      }
    });

    const cancelAd = container.querySelector('#addon-cancel-edit');
    if (cancelAd) {
      cancelAd.addEventListener('click', () => {
        editingAddonId = null;
        renderOfferAddonsTab(container);
      });
    }

    container.querySelector('#adm-addon-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = container.querySelector('#ad-save-btn');
      btn.disabled = true;
      btn.textContent = 'Saving...';
      try {
        await apiFetch('/api/v1/makeover-cms/addons', {
          method: 'POST',
          body: JSON.stringify({
            id: editAddon ? editAddon.id : undefined,
            name: container.querySelector('#ad-name').value.trim(),
            price: Number(container.querySelector('#ad-price').value),
            sort_order: Number(container.querySelector('#ad-order').value || 1),
            note: container.querySelector('#ad-note').value.trim()
          })
        });
        editingAddonId = null;
        showAdminToast('Styling add-on saved live.');
        await loadAndRenderDashboard();
      } catch (err) {
        showAdminToast(err.message);
        btn.disabled = false;
        btn.textContent = editAddon ? 'Save Add-On' : 'Publish Add-On';
      }
    });

    container.addEventListener('click', async (e) => {
      const ed = e.target.closest('[data-edit-addon]');
      if (ed) {
        editingAddonId = ed.dataset.editAddon;
        renderOfferAddonsTab(container);
        return;
      }
      const del = e.target.closest('[data-del-addon]');
      if (del) {
        if (!window.confirm('Remove this styling add-on?')) return;
        del.disabled = true;
        try {
          await apiFetch(`/api/v1/makeover-cms/addons/${encodeURIComponent(del.dataset.delAddon)}`, { method: 'DELETE' });
          if (editingAddonId === del.dataset.delAddon) editingAddonId = null;
          showAdminToast('Add-on removed.');
          await loadAndRenderDashboard();
        } catch (err) {
          showAdminToast(err.message);
          del.disabled = false;
        }
      }
    });
  }

  /* ---------- TAB 4: BRIDAL SLOT AVAILABILITY CALENDAR ---------- */
  function renderDatesTab(container) {
    const { bookedDates } = state;

    container.innerHTML = `
      <div class="admin-split">
        <div class="admin-panel-card">
          <div class="admin-panel-head">
            <h2>Mark Busy Bridal Dates</h2>
          </div>
          <p style="font-size:0.9rem;color:var(--muted);margin:0 0 18px;">
            Dates marked here immediately show live slot availability on the public Booking page (your private bride note stays visible inside Admin only).
          </p>
          <form id="adm-date-form">
            <div class="form-block field-row-2" style="margin-bottom:14px;">
              <div>
                <label class="form-label" for="dt-val">Wedding Date *</label>
                <input class="text-input" id="dt-val" type="date" min="${todayISO()}" required />
              </div>
              <div>
                <label class="form-label" for="dt-status">Slot Status *</label>
                <select class="text-input" id="dt-status">
                  <option value="booked">Bridal Slots Full (Mulberry Alert)</option>
                  <option value="limited">1 Bridal Slot Left (Amber)</option>
                </select>
              </div>
            </div>
            <div class="form-block" style="margin-bottom:18px;">
              <label class="form-label" for="dt-note">Private Bride Note (Admin Only)</label>
              <input class="text-input" id="dt-note" placeholder="e.g. Anjali Airbrush 6 PM + 2 Siders" />
            </div>
            <button type="submit" class="btn btn-primary" id="dt-save-btn">Save Slot Status</button>
          </form>
        </div>

        <div class="admin-panel-card">
          <div class="admin-panel-head">
            <h2>Marked Calendar Dates (${bookedDates.length})</h2>
          </div>
          <div class="cms-list">
            ${
              bookedDates.length
                ? bookedDates
                    .map(
                      (d) => `
                      <div class="cms-item">
                        <div>
                          <strong>${esc(d.event_date)}</strong>
                          <span style="margin-left:8px;padding:2px 9px;border-radius:999px;font-size:0.75rem;font-weight:700;background:${d.status === 'booked' ? 'rgba(109,33,60,0.14)' : 'rgba(126,81,17,0.14)'};color:${d.status === 'booked' ? 'var(--mulberry)' : 'var(--amber-deep)'};">
                            ${d.status === 'booked' ? 'Slots Full' : '1 Slot Left'}
                          </span>
                          ${d.note ? `<div style="font-size:0.82rem;color:var(--muted);margin-top:4px;">Note: ${esc(d.note)}</div>` : ''}
                        </div>
                        <button type="button" class="btn btn-ghost-light btn-sm" data-open-date="${esc(d.event_date)}">Re-Open Date</button>
                      </div>`
                    )
                    .join('')
                : `<p style="color:var(--muted);margin:0;">All upcoming dates currently show as Open on the public Bridal Booking page.</p>`
            }
          </div>
        </div>
      </div>
    `;

    container.querySelector('#adm-date-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = container.querySelector('#dt-save-btn');
      btn.disabled = true;
      btn.textContent = 'Saving...';
      try {
        await apiFetch('/api/v1/makeover-cms/dates', {
          method: 'POST',
          body: JSON.stringify({
            event_date: container.querySelector('#dt-val').value,
            status: container.querySelector('#dt-status').value,
            note: container.querySelector('#dt-note').value.trim()
          })
        });
        showAdminToast('Bridal slot calendar updated live.');
        await loadAndRenderDashboard();
      } catch (err) {
        showAdminToast(err.message);
        btn.disabled = false;
        btn.textContent = 'Save Slot Status';
      }
    });

    container.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-open-date]');
      if (!btn) return;
      btn.disabled = true;
      try {
        await apiFetch(`/api/v1/makeover-cms/dates/${encodeURIComponent(btn.dataset.openDate)}`, { method: 'DELETE' });
        showAdminToast('Date re-opened.');
        await loadAndRenderDashboard();
      } catch (err) {
        showAdminToast(err.message);
        btn.disabled = false;
      }
    });
  }

  /* ---------- TAB 5: LOOKBOOK & STUDIO PHOTO MANAGER ---------- */
  function renderMediaTab(container) {
    const { media } = state;
    const editing = editingMediaId ? media.find((m) => m.id === editingMediaId) : null;
    const filteredMedia = mediaSlotFilter === 'all' ? media : media.filter((m) => m.slot === mediaSlotFilter);

    container.innerHTML = `
      <div class="admin-panel-card">
        <div class="admin-panel-head">
          <h2>${editing ? 'Edit / Replace Lookbook Photo' : 'Upload Real Bride Photo to Home, About Us, or Lookbook'}</h2>
          ${editing ? '<button type="button" class="btn btn-ghost-light btn-sm" id="media-cancel-edit">Upload New Photo Instead</button>' : ''}
        </div>
        <form id="adm-media-form">
          <div class="field-row-2" style="margin-bottom:14px;">
            <div>
              <label class="form-label" for="mf-slot">Page Section *</label>
              <select class="text-input" id="mf-slot">
                <option value="gallery" ${(!editing || editing.slot === 'gallery') ? 'selected' : ''}>Bridal Lookbook Page</option>
                <option value="home_hero" ${(editing && editing.slot === 'home_hero') ? 'selected' : ''}>Home Page · 3D Vanity Mirror</option>
                <option value="home_signature" ${(editing && editing.slot === 'home_signature') ? 'selected' : ''}>Home Page · Oval Signature Portrait (Replaces current)</option>
                <option value="about_atelier" ${(editing && editing.slot === 'about_atelier') ? 'selected' : ''}>About Us Page · Main Atelier Photo (Replaces current)</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="mf-cat">Look Category *</label>
              <select class="text-input" id="mf-cat">
                ${LOOK_CATEGORIES.map((c) => `<option value="${c}" ${(editing && editing.category === c) ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="field-row-2" style="margin-bottom:14px;">
            <div>
              <label class="form-label" for="mf-title">Look Title *</label>
              <input class="text-input" id="mf-title" required value="${esc(editing ? editing.title : '')}" placeholder="e.g. Royal Red Airbrush Bride" />
            </div>
            <div>
              <label class="form-label" for="mf-loc">Finish / Styling Caption</label>
              <input class="text-input" id="mf-loc" value="${esc(editing ? editing.location : '')}" placeholder="e.g. Soft Bronze Eyes &amp; Mogra Bun" />
            </div>
          </div>

          <div class="form-block" style="margin-bottom:16px;">
            <label class="form-label" for="mf-file">${editing ? 'Replace Photo File (Optional — leave empty to keep existing)' : 'Choose Photo From Phone or PC *'}</label>
            <label class="upload-drop" for="mf-file" style="display:block;">
              <input id="mf-file" type="file" accept="image/*" style="display:none;" />
              <strong id="mf-file-status">Tap to choose a photo (auto-compressed to fast WebP under 220 KB)</strong>
              <img id="mf-preview" class="upload-preview-img" src="${editing ? esc(editing.src) : ''}" ${editing ? '' : 'hidden'} alt="Selected preview" />
            </label>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;">
            <label style="display:inline-flex;align-items:center;gap:8px;font-size:0.9rem;cursor:pointer;">
              <input type="checkbox" id="mf-wide" ${editing && editing.wide ? 'checked' : ''} />
              <span>Span wide (2 columns) inside Bridal Lookbook</span>
            </label>
            <button type="submit" class="btn btn-primary" id="mf-save-btn">${editing ? 'Save Photo Update' : 'Upload & Publish Photo'}</button>
          </div>
        </form>
      </div>

      <div class="admin-panel-card">
        <div class="admin-panel-head">
          <h2>Current Live Photos (${filteredMedia.length})</h2>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${[
              ['all', 'All'],
              ['home_hero', 'Home Vanity'],
              ['home_signature', 'Home Oval'],
              ['about_atelier', 'About Atelier'],
              ['gallery', 'Lookbook']
            ]
              .map(
                ([k, lbl]) =>
                  `<button type="button" class="btn btn-sm ${mediaSlotFilter === k ? 'btn-primary' : 'btn-ghost-light'}" data-mslot="${k}">${lbl}</button>`
              )
              .join('')}
          </div>
        </div>

        <div class="media-admin-grid">
          ${filteredMedia
            .map(
              (m) => `
              <article class="media-admin-card">
                <div class="media-admin-thumb">
                  <img src="${esc(m.src)}" alt="${esc(m.title)}" loading="lazy" />
                  <span class="media-slot-badge">${esc(SLOT_LABELS[m.slot] || m.slot)}</span>
                </div>
                <div class="media-admin-body">
                  <div>
                    <strong style="font-size:0.95rem;">${esc(m.title)}</strong>
                    <div style="font-size:0.8rem;color:var(--muted);">${esc(m.category)} · ${esc(m.location)}</div>
                  </div>
                  <div class="cms-item-actions" style="margin-top:6px;">
                    <button type="button" class="btn btn-ghost-light btn-sm" data-edit-media="${esc(m.id)}">Edit / Replace</button>
                    ${
                      m.slot === 'gallery' || m.slot === 'home_hero'
                        ? `<button type="button" class="btn btn-danger btn-sm" data-del-media="${esc(m.id)}">Remove</button>`
                        : ''
                    }
                  </div>
                </div>
              </article>`
            )
            .join('')}
        </div>
      </div>
    `;

    const cancelEdit = container.querySelector('#media-cancel-edit');
    if (cancelEdit) {
      cancelEdit.addEventListener('click', () => {
        editingMediaId = null;
        pendingImageData = '';
        renderMediaTab(container);
      });
    }

    const fileInput = container.querySelector('#mf-file');
    const fileStatus = container.querySelector('#mf-file-status');
    const previewImg = container.querySelector('#mf-preview');

    fileInput.addEventListener('change', async () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      fileStatus.textContent = 'Compressing photo to WebP...';
      try {
        const res = await compressImageFile(f);
        pendingImageData = res.dataUrl;
        previewImg.src = res.dataUrl;
        previewImg.hidden = false;
        fileStatus.textContent = `Ready: ${res.width}×${res.height}px (${res.kb} KB optimized)`;
      } catch (err) {
        pendingImageData = '';
        fileStatus.textContent = err.message;
      }
    });

    container.querySelector('#adm-media-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = container.querySelector('#mf-save-btn');
      if (!editing && !pendingImageData) {
        showAdminToast('Please choose an image file first.');
        return;
      }
      saveBtn.disabled = true;
      saveBtn.textContent = 'Publishing...';
      try {
        await apiFetch('/api/v1/makeover-cms/media', {
          method: 'POST',
          body: JSON.stringify({
            id: editing ? editing.id : undefined,
            slot: container.querySelector('#mf-slot').value,
            category: container.querySelector('#mf-cat').value,
            title: container.querySelector('#mf-title').value.trim(),
            location: container.querySelector('#mf-loc').value.trim(),
            wide: container.querySelector('#mf-wide').checked,
            imageData: pendingImageData || ''
          })
        });
        editingMediaId = null;
        pendingImageData = '';
        showAdminToast('Lookbook photo published live!');
        await loadAndRenderDashboard();
      } catch (err) {
        showAdminToast(err.message);
        saveBtn.disabled = false;
        saveBtn.textContent = editing ? 'Save Photo Update' : 'Upload & Publish Photo';
      }
    });

    container.addEventListener('click', async (e) => {
      const mf = e.target.closest('[data-mslot]');
      if (mf) {
        mediaSlotFilter = mf.dataset.mslot;
        renderMediaTab(container);
        return;
      }
      const ed = e.target.closest('[data-edit-media]');
      if (ed) {
        editingMediaId = ed.dataset.editMedia;
        pendingImageData = '';
        renderMediaTab(container);
        window.scrollTo({ top: 180, behavior: 'smooth' });
        return;
      }
      const del = e.target.closest('[data-del-media]');
      if (del) {
        if (!window.confirm('Remove this photo from the website?')) return;
        del.disabled = true;
        try {
          await apiFetch(`/api/v1/makeover-cms/media/${encodeURIComponent(del.dataset.delMedia)}`, { method: 'DELETE' });
          showAdminToast('Photo removed.');
          await loadAndRenderDashboard();
        } catch (err) {
          showAdminToast(err.message);
          del.disabled = false;
        }
      }
    });
  }

  /* ---------- TAB 6: BRIDE REVIEWS & STUDIO SETTINGS ---------- */
  function renderReviewsSettingsTab(container) {
    const { reviews, studio } = state;

    container.innerHTML = `
      <div class="admin-split">
        <div class="admin-panel-card">
          <div class="admin-panel-head">
            <h2>Add Bride Review</h2>
          </div>
          <form id="adm-rev-form">
            <div class="form-block field-row-2" style="margin-bottom:14px;">
              <div>
                <label class="form-label" for="rv-name">Bride Name &amp; Area *</label>
                <input class="text-input" id="rv-name" required placeholder="e.g. Sakshi Verma · Manhari" />
              </div>
              <div>
                <label class="form-label" for="rv-ev">Makeup Package *</label>
                <input class="text-input" id="rv-ev" required placeholder="e.g. HD Signature Bridal" />
              </div>
            </div>
            <div class="form-block" style="margin-bottom:16px;">
              <label class="form-label" for="rv-quote">Review Quote *</label>
              <textarea class="text-area" id="rv-quote" required placeholder="Paste the bride's real WhatsApp review..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary" id="rv-save-btn">Publish Review</button>
          </form>

          <div class="cms-list" style="margin-top:20px;">
            ${reviews
              .map(
                (r) => `
                <div class="cms-item">
                  <div>
                    <strong>${esc(r.bride_name)}</strong>
                    <div style="font-size:0.78rem;color:var(--mulberry);font-weight:600;">${esc(r.event_type)}</div>
                    <div style="font-size:0.84rem;color:var(--muted);margin-top:4px;">“${esc(r.quote)}”</div>
                  </div>
                  <button type="button" class="btn btn-danger btn-sm" data-del-rev="${esc(r.id)}">Remove</button>
                </div>`
              )
              .join('')}
          </div>
        </div>

        <div class="admin-panel-card">
          <div class="admin-panel-head">
            <h2>Studio Profile &amp; Sider Rate</h2>
          </div>
          <form id="adm-studio-form">
            <div class="form-block field-row-2" style="margin-bottom:14px;">
              <div>
                <label class="form-label" for="st-name">Studio Full Name</label>
                <input class="text-input" id="st-name" value="${esc(studio.name)}" required />
              </div>
              <div>
                <label class="form-label" for="st-short">Short Name</label>
                <input class="text-input" id="st-short" value="${esc(studio.shortName || 'G L Makeover')}" required />
              </div>
            </div>
            <div class="form-block field-row-2" style="margin-bottom:14px;">
              <div>
                <label class="form-label" for="st-wa">WhatsApp Number (With 91)</label>
                <input class="text-input" id="st-wa" value="${esc(studio.whatsapp)}" required />
              </div>
              <div>
                <label class="form-label" for="st-phone">Display Phone</label>
                <input class="text-input" id="st-phone" value="${esc(studio.phone)}" required />
              </div>
            </div>
            <div class="form-block field-row-2" style="margin-bottom:14px;">
              <div>
                <label class="form-label" for="st-sider">Extra Sider Makeup Rate (₹ / person)</label>
                <input class="text-input" id="st-sider" type="number" min="500" max="25000" value="${esc(studio.siderPrice || 2500)}" required />
              </div>
              <div>
                <label class="form-label" for="st-hours">Studio Hours</label>
                <input class="text-input" id="st-hours" value="${esc(studio.hours)}" required />
              </div>
            </div>
            <div class="form-block" style="margin-bottom:14px;">
              <label class="form-label" for="st-city">Studio Address</label>
              <input class="text-input" id="st-city" value="${esc(studio.city)}" required />
            </div>
            <div class="form-block" style="margin-bottom:18px;">
              <label class="form-label" for="st-maps">Google Maps Link</label>
              <input class="text-input" id="st-maps" value="${esc(studio.mapsUrl)}" />
            </div>
            <button type="submit" class="btn btn-primary" id="st-save-btn">Save Studio Settings</button>
          </form>
        </div>
      </div>
    `;

    container.querySelector('#adm-rev-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = container.querySelector('#rv-save-btn');
      btn.disabled = true;
      btn.textContent = 'Publishing...';
      try {
        await apiFetch('/api/v1/makeover-cms/reviews', {
          method: 'POST',
          body: JSON.stringify({
            bride_name: container.querySelector('#rv-name').value.trim(),
            event_type: container.querySelector('#rv-ev').value.trim(),
            quote: container.querySelector('#rv-quote').value.trim()
          })
        });
        showAdminToast('Bride review published live.');
        await loadAndRenderDashboard();
      } catch (err) {
        showAdminToast(err.message);
        btn.disabled = false;
        btn.textContent = 'Publish Review';
      }
    });

    container.addEventListener('click', async (e) => {
      const del = e.target.closest('[data-del-rev]');
      if (!del) return;
      del.disabled = true;
      try {
        await apiFetch(`/api/v1/makeover-cms/reviews/${encodeURIComponent(del.dataset.delRev)}`, { method: 'DELETE' });
        showAdminToast('Review removed.');
        await loadAndRenderDashboard();
      } catch (err) {
        showAdminToast(err.message);
        del.disabled = false;
      }
    });

    container.querySelector('#adm-studio-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = container.querySelector('#st-save-btn');
      btn.disabled = true;
      btn.textContent = 'Saving...';
      try {
        await apiFetch('/api/v1/makeover-cms/studio', {
          method: 'PUT',
          body: JSON.stringify({
            name: container.querySelector('#st-name').value.trim(),
            shortName: container.querySelector('#st-short').value.trim(),
            whatsapp: container.querySelector('#st-wa').value.trim(),
            phone: container.querySelector('#st-phone').value.trim(),
            siderPrice: Number(container.querySelector('#st-sider').value || 2500),
            city: container.querySelector('#st-city').value.trim(),
            hours: container.querySelector('#st-hours').value.trim(),
            mapsUrl: container.querySelector('#st-maps').value.trim()
          })
        });
        showAdminToast('Studio profile & Sider rate updated live.');
        await loadAndRenderDashboard();
      } catch (err) {
        showAdminToast(err.message);
        btn.disabled = false;
        btn.textContent = 'Save Studio Settings';
      }
    });
  }

  /* ---------- Bootstrap Admin Session Check ---------- */
  rootEl.innerHTML = `<section class="admin-login-wrap"><p style="color:var(--taupe);">Checking atelier session...</p></section>`;
  try {
    const sess = await apiFetch('/api/v1/makeover-auth/session');
    if (sess.authenticated) {
      await loadAndRenderDashboard();
    } else {
      renderLoginView('', sess.adminConfigured !== false);
    }
  } catch (_) {
    renderLoginView('Could not connect to server. Deploy on Cloudflare Workers with D1 attached.', true);
  }

  return () => cleanups.forEach((fn) => fn());
}
