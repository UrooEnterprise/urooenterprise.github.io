/* =========================================================
   Uroo Enterprise: Google Apps Script backend
   Paste into Extensions > Apps Script of your Google Sheet.
   Creates and fills 3 tabs: Leads, Coupons, Orders.
   ========================================================= */

const CFG = {
  TIERS: [ {min: 0, pct: 5}, {min: 499, pct: 7}, {min: 1000, pct: 10} ],  // order value -> % off
  VALID_DAYS: 30,
  PREFIX: 'URO',
  TZ: 'Asia/Kolkata'
};

const TABS = {
  Leads:   ['Time', 'Name', 'WhatsApp', 'Coupon', 'Consent', 'Source'],
  Coupons: ['Code', 'WhatsApp', 'Name', 'Created', 'Expires', 'Status', 'Used In Order', 'Used On'],
  Orders:  ['Time', 'Order ID', 'Name', 'WhatsApp', 'Address', 'Landmark', 'Pincode', 'Area', 'City/District',
            'State', 'Items', 'Qty', 'Subtotal', 'Coupon', 'Discount', 'Final Total', 'Payment Status', 'Notes']
};
const TEXT_COLS = { Leads: [3], Coupons: [2], Orders: [4, 7] };   // stored as text so numbers keep leading digits

function doGet() { return out_({ ok: true, service: 'Uroo coupons' }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    if (d.action === 'lead') return out_(lead_(d));
    if (d.action === 'validate') return out_(validate_(d));
    if (d.action === 'order') return out_(order_(d));
    return out_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return out_({ ok: false, error: 'Server busy, please try again.' });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/* ---------- actions ---------- */
function lead_(d) {
  const name = clean_(d.name, 60), phone = phone_(d.phone);
  if (name.length < 2) return { ok: false, error: 'Please enter your name.' };
  if (!/^[6-9]\d{9}$/.test(phone)) return { ok: false, error: 'Enter a valid 10-digit WhatsApp number.' };
  if (d.consent !== true) return { ok: false, error: 'Please tick the consent box.' };

  const cs = sheet_('Coupons');
  const found = findRow_(cs, 2, phone);
  if (found) {                                   // same number again: give the same code back, no duplicate
    const r = found.values;
    if (String(r[5]) === 'Used') return { ok: false, error: 'This number has already used its coupon.' };
    return { ok: true, code: r[0], expires: String(r[4]), existing: true };
  }
  const code = newCode_(cs);
  const expires = Utilities.formatDate(new Date(Date.now() + CFG.VALID_DAYS * 864e5), CFG.TZ, 'yyyy-MM-dd');
  cs.appendRow([code, phone, name, now_(), expires, 'Active', '', '']);
  sheet_('Leads').appendRow([now_(), name, phone, code, 'Yes', clean_(d.source, 30)]);
  return { ok: true, code: code, expires: expires };
}

function validate_(d) {
  const c = check_(d.code, d.phone, Number(d.subtotal));
  return c.ok ? { ok: true, code: c.code, pct: c.pct, discount: c.discount } : { ok: false, error: c.error };
}

function order_(d) {
  const os = sheet_('Orders');
  const orderId = clean_(d.orderId, 40);
  if (!orderId || findRow_(os, 2, orderId)) return { ok: true };   // ignore repeats
  const items = Array.isArray(d.items) ? d.items : [];
  const itemsText = items.map(function (i) { return clean_(i.title, 80) + ' (' + clean_(i.sku, 30) + ') x ' + Number(i.quantity); }).join('\n');
  const qty = items.reduce(function (s, i) { return s + Number(i.quantity || 0); }, 0);
  const subtotal = Number(d.subtotal) || 0, claimed = Number(d.discount) || 0;
  let code = '', discount = 0, notes = '';

  if (d.coupon) {
    const c = check_(d.coupon, d.phone, subtotal);
    if (c.ok) {
      code = c.code; discount = c.discount;
      const cs = sheet_('Coupons'), f = findRow_(cs, 1, c.code);
      cs.getRange(f.row, 6, 1, 3).setValues([['Used', orderId, now_()]]);
      if (discount !== claimed) notes = 'CHECK: website discount was ' + claimed;
    } else {
      code = clean_(d.coupon, 20);
      notes = 'COUPON NOT VALID (' + c.error + '). Website showed discount ' + claimed + '. Verify before dispatch.';
    }
  }
  os.appendRow([now_(), orderId, clean_(d.name, 60), phone_(d.phone), clean_(d.address, 250), clean_(d.landmark, 100),
    clean_(d.pincode, 6), clean_(d.area, 80), clean_(d.district, 80), clean_(d.state, 60), itemsText, qty, subtotal,
    code, discount, Number(d.total) || 0, 'Awaiting payment', notes]);
  return { ok: true };
}

/* ---------- helpers ---------- */
function check_(codeIn, phoneIn, subtotal) {
  const code = String(codeIn || '').trim().toUpperCase(), phone = phone_(phoneIn);
  const f = findRow_(sheet_('Coupons'), 1, code);
  if (!code || !f) return { ok: false, error: 'This coupon code is not valid.' };
  const r = f.values;
  if (String(r[1]) !== phone) return { ok: false, error: 'This coupon belongs to a different WhatsApp number.' };
  if (String(r[5]) === 'Used') return { ok: false, error: 'This coupon has already been used.' };
  if (String(r[5]) !== 'Active') return { ok: false, error: 'This coupon is not active.' };
  if (String(r[4]) < Utilities.formatDate(new Date(), CFG.TZ, 'yyyy-MM-dd')) return { ok: false, error: 'This coupon has expired.' };
  if (!(subtotal > 0)) return { ok: false, error: 'Your cart is empty.' };
  let pct = 0;
  CFG.TIERS.forEach(function (t) { if (subtotal >= t.min) pct = t.pct; });
  return { ok: true, code: code, pct: pct, discount: Math.round(subtotal * pct / 100) };
}

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(TABS[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, TABS[name].length).setFontWeight('bold');
    TEXT_COLS[name].forEach(function (c) { sh.getRange(1, c, sh.getMaxRows(), 1).setNumberFormat('@'); });
  }
  return sh;
}

function findRow_(sh, col, value) {
  const last = sh.getLastRow();
  if (last < 2) return null;
  const vals = sh.getRange(2, col, last - 1, 1).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][0]) === String(value)) {
      return { row: i + 2, values: sh.getRange(i + 2, 1, 1, sh.getLastColumn()).getValues()[0] };
    }
  }
  return null;
}

function newCode_(cs) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let n = 0; n < 20; n++) {
    let c = CFG.PREFIX;
    for (let i = 0; i < 5; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
    if (!findRow_(cs, 1, c)) return c;
  }
  return CFG.PREFIX + Date.now().toString(36).toUpperCase();
}

// Stops text from being run as a spreadsheet formula (=, +, -, @ at the start)
function clean_(v, max) {
  let s = String(v == null ? '' : v).replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max || 100);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function phone_(v) { return String(v || '').replace(/\D/g, '').slice(-10); }
function now_() { return Utilities.formatDate(new Date(), CFG.TZ, 'yyyy-MM-dd HH:mm:ss'); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
