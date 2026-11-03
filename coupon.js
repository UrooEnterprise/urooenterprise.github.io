"use strict";
/* =========================================================
   Uroo Enterprise: coupon popup, checkout coupon box and
   Google Sheet connection (needs app.js to be loaded first)
   ========================================================= */

// Paste your Google Apps Script "Web app" URL here (see setup steps). Leave as is to keep coupons switched off.
const SHEET_API_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

const COUPON_KEY = 'uroo_coupon';
const COUPON_SNOOZE_KEY = 'uroo_coupon_snooze';
const POPUP_DELAY_MS = 7000;
const SNOOZE_DAYS = 3;

function sheetReady() { return /^https:\/\/script\.google\.com\//.test(SHEET_API_URL); }

function sheetCall(payload, timeoutMs = 10000) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    // A string body is sent as text/plain, which Apps Script accepts without a CORS preflight
    return fetch(SHEET_API_URL, { method: 'POST', body: JSON.stringify(payload), signal: ctl.signal })
        .then(r => r.json())
        .finally(() => clearTimeout(t));
}

function getSavedCoupon() {
    try { return JSON.parse(localStorage.getItem(COUPON_KEY) || 'null'); } catch (e) { return null; }
}
function saveCoupon(c) { try { localStorage.setItem(COUPON_KEY, JSON.stringify(c)); } catch (e) {} }
function couponPrefill() {
    const s = getSavedCoupon();
    return s ? { name: s.name || '', phone: s.phone || '' } : null;
}

/* ---------- Lead popup ("Get up to 10% OFF") ---------- */
function buildCouponUI() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
    <button type="button" id="couponChip" class="coupon-chip" onclick="openLeadModal()" hidden>🎁 Get up to 10% OFF</button>
    <div class="modal-overlay" id="leadModal">
        <div class="modal-sheet">
            <div class="modal-header">
                <div class="modal-title">🎁 Get up to 10% OFF</div>
                <button class="modal-close" onclick="closeLeadModal()" aria-label="Close">✕</button>
            </div>
            <div id="leadModalBody"></div>
        </div>
    </div>`;
    document.body.append(...wrap.children);
}

function renderLeadForm() {
    $('leadModalBody').innerHTML = `
        <p class="lead-text">Enter your details to get your personal coupon code.<br>
        <strong>5% off</strong> on orders under ₹499 · <strong>7%</strong> on ₹499–₹999 · <strong>10%</strong> on ₹1000+</p>
        <form id="leadForm" onsubmit="claimCoupon(event)">
            <div class="form-group">
                <label class="form-label" for="leadName">Full Name *</label>
                <input type="text" id="leadName" class="form-input" required minlength="2" maxlength="60" autocomplete="name" placeholder="Enter your name">
            </div>
            <div class="form-group">
                <label class="form-label" for="leadPhone">WhatsApp Number *</label>
                <input type="tel" id="leadPhone" class="form-input" required inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" title="Enter a valid 10-digit mobile number" autocomplete="tel-national" placeholder="10-digit mobile number">
            </div>
            <label class="lead-consent"><input type="checkbox" id="leadConsent" required> I agree to receive my coupon and offers from Uroo Enterprise on WhatsApp.</label>
            <div id="leadMsg" class="coupon-msg" aria-live="polite"></div>
            <button type="submit" id="leadBtn" class="app-btn whatsapp-order" style="margin-top:10px;">🎁 Get My Coupon</button>
        </form>`;
}

function renderLeadResult(c) {
    $('leadModalBody').innerHTML = `
        <div class="lead-result">
            <div class="lead-text">Your coupon code</div>
            <div class="lead-code" id="leadCode">${escapeHtml(c.code)}</div>
            <p class="lead-text">Valid till <strong>${escapeHtml(c.expires || '')}</strong> · works only with WhatsApp number <strong>${escapeHtml(c.phone)}</strong><br>
            5% / 7% / 10% off depending on your order value. It is applied automatically at checkout.</p>
            <button type="button" class="app-btn" style="background:var(--app-primary);color:#fff;" onclick="copyCouponCode()">📋 Copy Code</button>
            <button type="button" class="guide-another" onclick="closeLeadModal(true)">Start Shopping →</button>
        </div>`;
}

function openLeadModal() {
    if (!sheetReady()) return;
    const s = getSavedCoupon();
    if (s) renderLeadResult(s); else renderLeadForm();
    $('leadModal').classList.add('active');
}

function closeLeadModal(claimed) {
    $('leadModal').classList.remove('active');
    if (claimed !== true && !getSavedCoupon()) {
        try { localStorage.setItem(COUPON_SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 864e5)); } catch (e) {}
    }
    refreshCouponChip();
}

function copyCouponCode() {
    const s = getSavedCoupon();
    if (!s) return;
    if (navigator.clipboard) navigator.clipboard.writeText(s.code).then(() => showToast('Coupon code copied'), () => {});
}

async function claimCoupon(e) {
    e.preventDefault();
    const btn = $('leadBtn'), msg = $('leadMsg');
    const name = $('leadName').value.trim(), phone = $('leadPhone').value.trim();
    btn.disabled = true; msg.textContent = 'Please wait…';
    try {
        const r = await sheetCall({ action: 'lead', name, phone, consent: true, source: 'website' });
        if (!r.ok) { msg.textContent = r.error || 'Something went wrong. Please try again.'; btn.disabled = false; return; }
        const c = { code: r.code, name, phone, expires: r.expires };
        saveCoupon(c);
        renderLeadResult(c);
        refreshCouponChip();
        showToast('🎉 Coupon unlocked!');
    } catch (err) {
        msg.textContent = 'Could not connect. Please check your internet and try again.';
        btn.disabled = false;
    }
}

function refreshCouponChip() {
    const chip = $('couponChip');
    if (!chip) return;
    chip.hidden = !(sheetReady() && !getSavedCoupon());
}

/* ---------- Coupon box inside checkout ---------- */
function couponBoxHTML(ctx) {
    if (!sheetReady()) return '';
    if (ctx.coupon) {
        const c = ctx.coupon;
        return `<div class="coupon-box coupon-ok">✅ <strong>${escapeHtml(c.code)}</strong> applied: ${c.pct}% off (−${formatINR(c.discount)})
            <button type="button" class="saved-clear" onclick="removeCoupon()">Remove</button></div>`;
    }
    const saved = getSavedCoupon();
    return `<div class="coupon-box">
        <label class="form-label" for="couponInput">🎟️ Coupon code</label>
        <div class="coupon-row">
            <input type="text" id="couponInput" class="form-input" maxlength="20" autocapitalize="characters" placeholder="Enter coupon code" value="${escapeHtml(saved ? saved.code : '')}" onkeydown="if(event.key==='Enter'){event.preventDefault();applyCoupon();}">
            <button type="button" class="coupon-apply" onclick="applyCoupon()">Apply</button>
        </div>
        <div id="couponMsg" class="coupon-msg" aria-live="polite"></div>
        ${saved ? '' : `<button type="button" class="saved-clear" onclick="openLeadModal()">No code? Get up to 10% OFF</button>`}
    </div>`;
}

async function applyCoupon(silent) {
    const ctx = checkoutContext;
    if (!ctx || ctx.step !== 'form') return;
    captureForm();
    const input = $('couponInput');
    const code = (input ? input.value : '').trim().toUpperCase();
    const phone = (ctx.form && ctx.form.phone) || '';
    const msg = $('couponMsg');
    const say = (t) => { if (msg && silent !== true) msg.textContent = t; };
    if (!code) return say('Enter a coupon code.');
    if (!/^[6-9]\d{9}$/.test(phone)) return say('Enter your 10-digit WhatsApp number above first.');
    say('Checking…');
    try {
        const r = await sheetCall({ action: 'validate', code, phone, subtotal: checkoutTotals(ctx).subtotal });
        if (checkoutContext !== ctx || ctx.step !== 'form') return;
        if (r.ok) {
            ctx.coupon = { code: r.code, pct: r.pct, discount: r.discount, phone };
            captureForm();
            renderCheckoutForm();
            showToast(`Coupon applied: ${r.pct}% off`);
        } else {
            say(r.error || 'This coupon is not valid.');
        }
    } catch (e) {
        say('Could not check the coupon right now. Please try again, or order without it.');
    }
}

function removeCoupon() {
    const ctx = checkoutContext;
    if (!ctx) return;
    captureForm();
    ctx.coupon = null;
    ctx.autoTried = true;
    renderCheckoutForm();
}

// If the customer already claimed a code, apply it as soon as checkout opens
function maybeAutoApplyCoupon() {
    const ctx = checkoutContext;
    if (!sheetReady() || !ctx || ctx.coupon || ctx.autoTried || !getSavedCoupon()) return;
    ctx.autoTried = true;
    applyCoupon(true);
}

/* ---------- Order log (runs at the same moment WhatsApp opens) ---------- */
function logOrderToSheet(order) {
    if (!sheetReady()) return;
    try {
        fetch(SHEET_API_URL, {
            method: 'POST', mode: 'no-cors', keepalive: true,
            body: JSON.stringify(Object.assign({ action: 'order' }, order))
        }).catch(() => {});
    } catch (e) {}
}

/* ---------- Start ---------- */
buildCouponUI();
refreshCouponChip();
if (sheetReady() && !getSavedCoupon()) {
    let snoozeUntil = 0;
    try { snoozeUntil = Number(localStorage.getItem(COUPON_SNOOZE_KEY) || 0); } catch (e) {}
    if (Date.now() > snoozeUntil) {
        setTimeout(() => {
            const busy = document.querySelector('.modal-overlay.active');
            if (!busy && !getSavedCoupon()) openLeadModal();
        }, POPUP_DELAY_MS);
    }
}
