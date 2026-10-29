"use strict";

/* =========================================================
   Uroo Enterprise storefront
   ========================================================= */

const WHATSAPP_NUMBER = "919016406623";
const BUSINESS_UPI_ID = "parmar.prashant01@oksbi";
const MAX_QTY = 99;
const MAX_PAY_AMOUNT = 100000;

// Inline placeholder: no file needed, works on any host (fixes the broken /Images/capricorn01.webp path)
const DEFAULT_IMAGE = "data:image/svg+xml;utf8," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>" +
    "<rect width='200' height='200' fill='#f1f5f9'/>" +
    "<g fill='none' stroke='#94a3b8' stroke-width='6' stroke-linejoin='round'>" +
    "<path d='M100 45l38 32-38 72-38-72z'/><path d='M62 77h76'/></g>" +
    "<text x='100' y='178' font-family='sans-serif' font-size='14' text-anchor='middle' fill='#94a3b8'>Image coming soon</text>" +
    "</svg>"
);

const CATEGORY_IMAGES = {
    "Crystal Bracelets": "images/cat_crystal_bracelets.webp",
    "Rashi/Zodiac Bracelet": "images/cat_rashi_bracelets.webp",
    "Mala & Pendant": "images/cat_mala_machhmani.webp",
    "Anklets": "images/cat_anklet.webp",
    "Vastu & Prosperity": "images/cat_vastu.webp",
    "Jewellery": "images/cat_jewellery.webp"
};

let PRODUCTS = [];
let CART = [];
let checkoutContext = null;   // { items: [{sku,title,price,quantity}], fromCart: bool }
let currentImageIndex = 0;
let currentProductImages = [];
let searchTimer = null;
let toastTimer = null;

// Meesho customer reviews (3-star reviews excluded). Shown only on products whose title/category matches a review's tags.
const PRODUCT_REVIEWS_DB = [
    { 
        name: "Prashant", 
        date: "Posted on 28 May, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Honestly didn't expect the quality to be this good at this price Bracelet looks really nice and feels premium.",
        tags: ["bracelet", "crystal"]
    },
    { 
        name: "Prashant", 
        date: "Posted on 28 May, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Mala feels original and well made. Beads are smooth, lightweight and comfortable for regular use.",
        tags: ["mala", "pendant"]
    },
    { 
        name: "Meesho User", 
        date: "Posted on 15 Aug, 2025", 
        rating: 5, 
        badge: "Very Good",
        text: "Bahut accha bracelet hain sundar rang aur perfect fit daily roz pehne layak aur dekhne me classyy.",
        tags: ["bracelet", "zodiac", "rashi"]
    },
    { 
        name: "Rathod Pravinaben", 
        date: "Posted on 03 Aug, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Price ke hisaab se bahut accha product hai. Comfortable hai aur dekhne mein bhi classy lagta hai.",
        tags: ["bracelet", "crystal"]
    },
    { 
        name: "Sumit Lubana", 
        date: "Posted on 09 May, 2026", 
        rating: 4, 
        badge: "Good",
        text: "Good product quality.",
        tags: ["anklet"]
    },
    { 
        name: "G Mahalakshmi", 
        date: "Posted on 05 Jul, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Surprise gift 🎁 🙏🙏🙏 thank you pendant superb and gift also thank you.",
        tags: ["pendant", "vastu"]
    },
    { 
        name: "Shalli Dogra", 
        date: "Posted on 09 Oct, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Nice 👍",
        tags: ["pendant", "vastu"]
    },
    { 
        name: "Ragula Dhanraj", 
        date: "Posted on 07 Oct, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Super 😍",
        tags: ["pendant", "vastu"]
    },
    { 
        name: "Darshana Mehta", 
        date: "Posted on 28 May, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Nice product",
        tags: ["anklet"]
    },
    { 
        name: "Dipti Panchal", 
        date: "Posted on 19 May, 2026", 
        rating: 4, 
        badge: "Good",
        text: "Good",
        tags: ["anklet"]
    },
    { 
        name: "Dhwani Vora", 
        date: "Posted on 11 Sep, 2026", 
        rating: 4, 
        badge: "Good",
        text: "Nice",
        tags: ["bracelet"]
    },
    { 
        name: "Hardik Gediya", 
        date: "Posted on 22 Jul, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Product is good, comfortable for regular wear.",
        tags: ["anklet"]
    },
    { 
        name: "Arabinda Kumar Mazumdar", 
        date: "Posted on 04 Sep, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "All materials are very good.",
        tags: ["bracelet"]
    },
    { 
        name: "Sweet Angel", 
        date: "Posted on 02 Jul, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Good looking.",
        tags: ["anklet"]
    },
    { 
        name: "Gurjinder Kaur", 
        date: "Posted on 25 Jun, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Nice Product.",
        tags: ["anklet"]
    },
    { 
        name: "Hitesh Kumar Saini", 
        date: "Posted on 16 Jun, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Size thora chota he bs.",
        tags: ["vastu", "frame"]
    },
    { 
        name: "Kainath Khan", 
        date: "Posted on 14 Aug, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Good.",
        tags: ["anklet"]
    },
    { 
        name: "Shipra Sarkar", 
        date: "Posted on 01 Sep, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Nice.",
        tags: ["anklet"]
    },
    { 
        name: "Meesho User", 
        date: "Posted on 26 Sep, 2026", 
        rating: 4, 
        badge: "Good",
        text: "Acha product hai.",
        tags: ["bracelet"]
    },
    { 
        name: "Meesho User", 
        date: "Posted on 27 Sep, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Bahut accha product hai.",
        tags: ["pendant"]
    },
    { 
        name: "Meesho User", 
        date: "Posted on 28 Sep, 2026", 
        rating: 5, 
        badge: "Very Good",
        text: "Ggh - Very satisfied with the finish.",
        tags: ["pendant"]
    }
];

/* ---------------------------------------------------------
   Small helpers
   --------------------------------------------------------- */
const $ = (id) => document.getElementById(id);

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function safePrice(val) {
    const n = (typeof val === 'string' && val.trim() !== '') ? Number(val) : val;
    return (typeof n === 'number' && isFinite(n) && n > 0) ? n : null;
}

function formatINR(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
}

function isInStock(p) {
    return !p.stock || /^in\s*stock$/i.test(String(p.stock).trim());
}

// A product can be ordered only with a real price and in stock (removes the silent "|| 299" fallback)
function canOrder(p) {
    return safePrice(p.price) !== null && isInStock(p);
}

function productImages(p) {
    return (Array.isArray(p.images) && p.images.length) ? p.images : [DEFAULT_IMAGE];
}

// Marketplace links must be real product URLs, not just a homepage
function isRealLink(u) {
    if (!u || typeof u !== 'string') return false;
    try {
        const x = new URL(u.trim());
        return /^https?:$/.test(x.protocol) && (x.pathname.length > 1 || x.search.length > 1);
    } catch (e) { return false; }
}

function imgFallback(img) {
    img.onerror = null;
    img.src = DEFAULT_IMAGE;
}

function discountPercent(price, mrp) {
    return (mrp && price && mrp > price) ? Math.round(((mrp - price) / mrp) * 100) : 0;
}

function showToast(msg) {
    let toast = $('appToastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToastNotification';
        toast.className = 'app-toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ---------------------------------------------------------
   Data loading
   --------------------------------------------------------- */
async function loadProducts() {
    let loaded = true;
    try {
        const response = await fetch('uroo_products.json');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        PRODUCTS = Array.isArray(data) ? data.filter(p => p && p.sku && p.title) : [];
        PRODUCTS.forEach(p => { p.category = p.category || 'Other'; });
    } catch (e) {
        console.error('Failed to load uroo_products.json', e);
        PRODUCTS = [];
        loaded = false;
    }
    loadCartFromStorage();
    initHome(loaded);
    handleInitialRoute();
}

function loadCartFromStorage() {
    CART = [];
    try {
        const saved = JSON.parse(localStorage.getItem('uroo_cart') || '[]');
        if (Array.isArray(saved) && PRODUCTS.length) {
            // Re-validate against the live catalogue so stale prices / removed items never reach checkout
            CART = saved.map(item => {
                const p = PRODUCTS.find(x => x.sku === item.sku);
                if (!p || !canOrder(p)) return null;
                const qty = Math.max(1, Math.min(MAX_QTY, parseInt(item.quantity, 10) || 1));
                return { sku: p.sku, title: p.title, price: safePrice(p.price), quantity: qty, image: productImages(p)[0] };
            }).filter(Boolean);
        }
    } catch (e) { CART = []; }
    updateCartUI();
}

function saveCartToStorage() {
    try { localStorage.setItem('uroo_cart', JSON.stringify(CART)); } catch (e) {}
    updateCartUI();
}

function generateUniqueOrderId() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `UROO-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}-${randomNum}`;

    try {
        const existing = JSON.parse(localStorage.getItem('uroo_orders_history') || '[]');
        if (existing.includes(orderId)) return generateUniqueOrderId();
        existing.push(orderId);
        if (existing.length > 100) existing.shift();
        localStorage.setItem('uroo_orders_history', JSON.stringify(existing));
    } catch (e) {}
    return orderId;
}

/* ---------------------------------------------------------
   Cart
   --------------------------------------------------------- */
function addToCart(sku) {
    const product = PRODUCTS.find(p => p.sku === sku);
    if (!product) return;
    if (!canOrder(product)) {
        showToast(ct('unavailable'));
        return;
    }
    const mainImg = productImages(product)[0];
    const existing = CART.find(item => item.sku === sku);
    if (existing) {
        existing.quantity = Math.min(MAX_QTY, existing.quantity + 1);
    } else {
        CART.push({ sku: product.sku, title: product.title, price: safePrice(product.price), quantity: 1, image: mainImg });
    }

    triggerFlyToCartAnimation(mainImg);   // run before the PDP re-renders
    saveCartToStorage();
    showToast(`✓ Added "${product.title}" to Cart!`);

    const pdp = $('pdpView');
    if (pdp && pdp.classList.contains('active')) renderPDP(sku, { keepImage: true });
}

function triggerFlyToCartAnimation(imgSrc) {
    const imgEl = $('mainPdpImg');
    const cartIcon = document.querySelector('.app-topbar [data-role="cart-btn"]');
    if (!imgEl || !cartIcon || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const startRect = imgEl.getBoundingClientRect();
    const targetRect = cartIcon.getBoundingClientRect();

    const flyer = document.createElement('img');
    flyer.src = imgSrc;
    flyer.alt = '';
    flyer.style.cssText = `position:fixed;top:${startRect.top}px;left:${startRect.left}px;width:${startRect.width}px;height:${startRect.height}px;object-fit:contain;border-radius:8px;z-index:999999;pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:all .8s cubic-bezier(.2,.8,.2,1);`;
    document.body.appendChild(flyer);
    flyer.getBoundingClientRect();

    setTimeout(() => {
        flyer.style.top = `${targetRect.top + 5}px`;
        flyer.style.left = `${targetRect.left + 5}px`;
        flyer.style.width = '30px';
        flyer.style.height = '30px';
        flyer.style.opacity = '0.3';
        flyer.style.borderRadius = '50%';
    }, 20);

    setTimeout(() => {
        flyer.remove();
        const badge = $('cartBadgeCount');
        if (badge) {
            badge.classList.add('cart-badge-bounce');
            setTimeout(() => badge.classList.remove('cart-badge-bounce'), 400);
        }
    }, 820);
}

function updateQuantity(sku, delta) {
    const item = CART.find(i => i.sku === sku);
    if (!item) return;
    item.quantity = Math.min(MAX_QTY, item.quantity + delta);
    if (item.quantity <= 0) CART = CART.filter(i => i.sku !== sku);
    saveCartToStorage();
    renderCartModalItems();
    const pdp = $('pdpView');
    if (pdp && pdp.classList.contains('active') && history.state && history.state.sku) {
        renderPDP(history.state.sku, { keepImage: true });
    }
}

function cartTotals() {
    return {
        items: CART.reduce((s, i) => s + i.quantity, 0),
        subtotal: CART.reduce((s, i) => s + i.price * i.quantity, 0)
    };
}

function updateCartUI() {
    const { items: totalItems, subtotal } = cartTotals();

    const badge = $('cartBadgeCount');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    let bar = $('frozenCartBar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'frozenCartBar';
        bar.className = 'cart-float-bar';
        document.body.appendChild(bar);
    }

    if (totalItems > 0) {
        bar.style.display = 'flex';
        bar.innerHTML = `
            <div class="cart-float-info">
                <span class="cart-float-icon">🛒</span>
                <div>
                    <div class="cart-float-count">${totalItems} ${totalItems === 1 ? 'Item' : 'Items'} in Cart</div>
                    <div class="cart-float-total">${formatINR(subtotal)}</div>
                </div>
            </div>
            <button type="button" class="cart-float-btn" onclick="openCartModal()">Go to Cart ➔</button>
        `;
        document.body.classList.add('has-cart-bar');
    } else {
        bar.style.display = 'none';
        document.body.classList.remove('has-cart-bar');
    }
}

function openCartModal() {
    renderCartModalItems();
    $('cartModal').classList.add('active');
}

function closeCartModal() {
    $('cartModal').classList.remove('active');
}

function renderCartModalItems() {
    const container = $('cartModalItemsList');
    const footer = $('cartModalFooter');
    if (!container) return;

    if (CART.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size:40px;margin-bottom:10px;">🛒</div>
                <div style="font-size:15px;font-weight:600;margin-bottom:4px;">Your Cart is Empty</div>
                <div style="font-size:12px;">Explore our crystal bracelets &amp; spiritual collection to add items.</div>
            </div>`;
        if (footer) footer.style.display = 'none';
        return;
    }

    if (footer) footer.style.display = 'block';

    container.innerHTML = CART.map(item => `
        <div class="cart-item">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="cart-item-img" onerror="imgFallback(this)">
            <div class="cart-item-info">
                <div class="cart-item-title">${escapeHtml(item.title)}</div>
                <div class="cart-item-price">${formatINR(item.price)}</div>
            </div>
            <div class="cart-item-qty">
                <button type="button" class="qty-btn" data-action="qty-dec" data-sku="${escapeHtml(item.sku)}" aria-label="Decrease quantity">−</button>
                <span class="qty-num">${item.quantity}</span>
                <button type="button" class="qty-btn" data-action="qty-inc" data-sku="${escapeHtml(item.sku)}" aria-label="Increase quantity">+</button>
            </div>
        </div>`).join('');

    const el = $('cartSubtotalAmount');
    if (el) el.textContent = formatINR(cartTotals().subtotal);
}

function proceedToCartCheckout() {
    if (CART.length === 0) return;
    closeCartModal();
    openCartCheckoutModal();
}

/* ---------------------------------------------------------
   Checkout (single product + cart share one form / one sender)
   --------------------------------------------------------- */
function openCheckoutModal(sku) {
    const p = PRODUCTS.find(x => x.sku === sku);
    if (!p) return;
    if (!canOrder(p)) {
        showToast(ct('unavailable'));
        return;
    }
    checkoutContext = { items: [{ sku: p.sku, title: p.title, price: safePrice(p.price), quantity: 1 }], fromCart: false };
    renderCheckoutForm();
}

function openCartCheckoutModal() {
    if (!CART.length) return;
    checkoutContext = { items: CART.map(i => ({ sku: i.sku, title: i.title, price: i.price, quantity: i.quantity })), fromCart: true };
    renderCheckoutForm();
}

/* ---- Checkout words (follows the language chosen in the guide: English / Hindi / Tamil) ---- */
const CHECKOUT_TEXT = {
    en: {
        title: 'Enter Delivery Details', confirmTitle: 'Please check your details',
        item: 'Item', totalPrice: 'Total Price', cartSummary: 'Cart Summary', items: 'items', totalAmount: 'Total Amount',
        name: 'Full Name', namePh: 'Enter your full name',
        phone: 'WhatsApp Number', phonePh: '10-digit mobile number', phoneTitle: 'Enter a valid 10-digit mobile number',
        address: 'Delivery Address', addressPh: 'House No, Street, Area, City',
        landmark: 'Nearby Landmark (optional)', landmarkPh: 'Example: Near temple, school or petrol pump',
        pincode: 'Pincode', pincodePh: '6-digit pincode', pincodeTitle: 'Enter a valid 6-digit pincode',
        checking: 'Checking pincode…', chooseArea: 'Choose your area',
        notFound: 'This pincode was not found. Please check the number.',
        notFoundHelp: 'If your pincode is correct, message us on WhatsApp and we will help you place the order.',
        waHelp: 'Talk to us on WhatsApp',
        unverified: 'Could not check the pincode right now. Please make sure it is correct.',
        processTitle: 'Easy Process',
        p1: 'Send your order on WhatsApp using the button below.',
        p2: 'Tap the secure payment link you get in WhatsApp.',
        p3: (t) => `Pay ${t} instantly via GPay/PhonePe/Paytm.`,
        continueBtn: 'Check my details ➔', confirmQ: 'Is everything correct?',
        edit: 'Change details', send: 'Yes, send order on WhatsApp',
        savedNote: 'Your details are saved on this phone only.', clearSaved: 'Clear saved details',
        blocked: 'Please fix the pincode first, or talk to us on WhatsApp.',
        unavailable: 'Sorry, this item is currently unavailable',
        areaLbl: 'Area', cityLbl: 'City / District', stateLbl: 'State'
    },
    hi: {
        title: 'डिलीवरी की जानकारी भरें', confirmTitle: 'कृपया अपनी जानकारी जाँचें',
        item: 'प्रोडक्ट', totalPrice: 'कुल कीमत', cartSummary: 'कार्ट', items: 'प्रोडक्ट', totalAmount: 'कुल रकम',
        name: 'पूरा नाम', namePh: 'अपना पूरा नाम लिखें',
        phone: 'WhatsApp नंबर', phonePh: '10 अंकों का मोबाइल नंबर', phoneTitle: '10 अंकों का सही मोबाइल नंबर लिखें',
        address: 'डिलीवरी का पता', addressPh: 'मकान नंबर, गली, इलाका, शहर',
        landmark: 'पास की पहचान (ज़रूरी नहीं)', landmarkPh: 'जैसे: मंदिर, स्कूल या पेट्रोल पंप के पास',
        pincode: 'पिनकोड', pincodePh: '6 अंकों का पिनकोड', pincodeTitle: '6 अंकों का सही पिनकोड लिखें',
        checking: 'पिनकोड जाँच रहे हैं…', chooseArea: 'अपना इलाका चुनें',
        notFound: 'यह पिनकोड नहीं मिला। कृपया नंबर जाँचें।',
        notFoundHelp: 'अगर पिनकोड सही है, तो WhatsApp पर हमें संदेश भेजें। हम ऑर्डर पूरा करने में मदद करेंगे।',
        waHelp: 'WhatsApp पर हमसे बात करें',
        unverified: 'अभी पिनकोड जाँच नहीं हो पाई। कृपया देख लें कि वह सही है।',
        processTitle: 'आसान प्रक्रिया',
        p1: 'नीचे बटन दबाकर WhatsApp पर ऑर्डर भेजें।',
        p2: 'WhatsApp में मिला सुरक्षित पेमेंट लिंक दबाएँ।',
        p3: (t) => `GPay/PhonePe/Paytm से ${t} का भुगतान करें।`,
        continueBtn: 'मेरी जानकारी जाँचें ➔', confirmQ: 'क्या सब कुछ सही है?',
        edit: 'जानकारी बदलें', send: 'हाँ, WhatsApp पर ऑर्डर भेजें',
        savedNote: 'आपकी जानकारी सिर्फ़ इसी फ़ोन में सेव रहेगी।', clearSaved: 'सेव की हुई जानकारी हटाएँ',
        blocked: 'पहले पिनकोड ठीक करें, या WhatsApp पर हमसे बात करें।',
        unavailable: 'माफ़ कीजिए, यह प्रोडक्ट अभी उपलब्ध नहीं है',
        areaLbl: 'इलाका', cityLbl: 'शहर / ज़िला', stateLbl: 'राज्य'
    },
    ta: {
        title: 'டெலிவரி விவரங்களை உள்ளிடவும்', confirmTitle: 'உங்கள் விவரங்களைச் சரிபார்க்கவும்',
        item: 'பொருள்', totalPrice: 'மொத்த விலை', cartSummary: 'கார்ட்', items: 'பொருட்கள்', totalAmount: 'மொத்தத் தொகை',
        name: 'முழு பெயர்', namePh: 'உங்கள் முழு பெயரை எழுதவும்',
        phone: 'WhatsApp எண்', phonePh: '10 இலக்க மொபைல் எண்', phoneTitle: 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',
        address: 'டெலிவரி முகவரி', addressPh: 'வீட்டு எண், தெரு, பகுதி, ஊர்',
        landmark: 'அருகிலுள்ள அடையாளம் (விருப்பம்)', landmarkPh: 'எ.கா: கோவில், பள்ளி, பெட்ரோல் பங்க் அருகில்',
        pincode: 'பின்கோடு', pincodePh: '6 இலக்க பின்கோடு', pincodeTitle: 'சரியான 6 இலக்க பின்கோடை உள்ளிடவும்',
        checking: 'பின்கோடை சரிபார்க்கிறோம்…', chooseArea: 'உங்கள் பகுதியைத் தேர்ந்தெடுக்கவும்',
        notFound: 'இந்த பின்கோடு கிடைக்கவில்லை. எண்ணைச் சரிபார்க்கவும்.',
        notFoundHelp: 'பின்கோடு சரியாக இருந்தால், WhatsApp-ல் எங்களுக்கு செய்தி அனுப்புங்கள். ஆர்டர் செய்ய உதவுவோம்.',
        waHelp: 'WhatsApp-ல் எங்களிடம் பேசுங்கள்',
        unverified: 'இப்போது பின்கோடை சரிபார்க்க முடியவில்லை. அது சரியானதா என்று பார்க்கவும்.',
        processTitle: 'எளிதான முறை',
        p1: 'கீழே உள்ள பட்டனை அழுத்தி WhatsApp-ல் ஆர்டர் அனுப்பவும்.',
        p2: 'WhatsApp-ல் வரும் பாதுகாப்பான பணம் செலுத்தும் லிங்கைத் தொடவும்.',
        p3: (t) => `GPay/PhonePe/Paytm மூலம் ${t} செலுத்தவும்.`,
        continueBtn: 'என் விவரங்களைச் சரிபார்க்க ➔', confirmQ: 'எல்லாம் சரியாக உள்ளதா?',
        edit: 'விவரங்களை மாற்று', send: 'ஆம், WhatsApp-ல் ஆர்டர் அனுப்பு',
        savedNote: 'உங்கள் விவரங்கள் இந்த போனில் மட்டும் சேமிக்கப்படும்.', clearSaved: 'சேமித்த விவரங்களை நீக்கு',
        blocked: 'முதலில் பின்கோடை சரிசெய்யவும், அல்லது WhatsApp-ல் எங்களிடம் பேசுங்கள்.',
        unavailable: 'மன்னிக்கவும், இந்தப் பொருள் தற்போது இல்லை',
        areaLbl: 'பகுதி', cityLbl: 'ஊர் / மாவட்டம்', stateLbl: 'மாநிலம்'
    }
};

function checkoutLang() {
    return (typeof guideLang !== 'undefined' && CHECKOUT_TEXT[guideLang]) ? guideLang : 'en';
}
function ct(key, arg) {
    const v = CHECKOUT_TEXT[checkoutLang()][key];
    return typeof v === 'function' ? v(arg) : v;
}
function checkoutLangSwitch() {
    return (typeof guideLangSwitchHTML === 'function') ? guideLangSwitchHTML() : '';
}

/* ---- Saved customer details (kept on this phone only) ---- */
function loadSavedCustomer() {
    try {
        const s = JSON.parse(localStorage.getItem('uroo_customer') || 'null');
        if (!s || typeof s !== 'object') return null;
        const clean = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
        const out = {
            name: clean(s.name, 60), phone: clean(s.phone, 10), address: clean(s.address, 250),
            landmark: clean(s.landmark, 100), pincode: clean(s.pincode, 6), area: clean(s.area, 80)
        };
        return out.name || out.phone || out.address ? out : null;
    } catch (e) { return null; }
}
function saveCustomer(f) {
    try { localStorage.setItem('uroo_customer', JSON.stringify(f)); } catch (e) {}
}
function clearSavedCustomer() {
    try { localStorage.removeItem('uroo_customer'); } catch (e) {}
    if (checkoutContext) checkoutContext.form = null;
    renderCheckoutForm();
}

/* ---- Pincode lookup (India Post, free). If the service is down we never block the customer. ---- */
const pinCache = {};
let pinState = { pin: '', status: 'idle', places: [], district: '', state: '', area: '' };
let pinRequestId = 0;
let pinPromise = Promise.resolve();
const PIN_RE = /^[1-9][0-9]{5}$/;

async function fetchPincode(pin) {
    if (pinCache[pin]) return pinCache[pin];

    const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 7000) : null;
    try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, ctrl ? { signal: ctrl.signal } : undefined);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const entry = Array.isArray(data) ? data[0] : null;
        if (!entry) throw new Error('Unexpected response');

        let result;
        if (entry.Status === 'Success' && Array.isArray(entry.PostOffice) && entry.PostOffice.length) {
            const po = entry.PostOffice;
            result = {
                status: 'ok',
                places: [...new Set(po.map(x => x && x.Name).filter(Boolean))],
                district: po[0].District || po[0].Block || '',
                state: po[0].State || ''
            };
        } else if (entry.Status === '404' || entry.Status === 'Error' || /no records/i.test(entry.Message || '')) {
            result = { status: 'notfound', places: [], district: '', state: '' };
        } else {
            throw new Error('Unrecognised status');
        }
        pinCache[pin] = result;
        return result;
    } catch (e) {
        console.warn('Pincode lookup failed:', e);
        return { status: 'unverified', places: [], district: '', state: '' };   // not cached, never blocks the order
    } finally {
        if (timer) clearTimeout(timer);
    }
}

async function startPinLookup(pin, preferArea) {
    const id = ++pinRequestId;
    pinState = { pin, status: 'loading', places: [], district: '', state: '', area: '' };
    updatePinUI();
    const r = await fetchPincode(pin);
    if (id !== pinRequestId) return pinState;   // customer changed the pincode meanwhile
    pinState = { pin, status: r.status, places: r.places, district: r.district, state: r.state, area: '' };
    if (r.status === 'ok') {
        if (r.places.length === 1) pinState.area = r.places[0];
        else if (preferArea && r.places.includes(preferArea)) pinState.area = preferArea;
    }
    updatePinUI();
    return pinState;
}

function pinHelpLink() {
    const ctx = checkoutContext;
    const lines = ctx ? ctx.items.map(i => `- ${i.title} x ${i.quantity}`).join('\n') : '';
    const total = ctx ? ctx.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0;
    const msg = `Hello Uroo Enterprise,\nMy pincode ${pinState.pin} is not accepted in the order form. Please help me place my order.\n\n` +
        (lines ? `Items:\n${lines}\nTotal: ${formatINR(total)}` : '');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function updatePinUI() {
    const box = $('pinStatus');
    const btn = $('checkBtn');
    if (!box) return;
    const s = pinState;
    let html = '';

    if (s.status === 'loading') {
        html = `<div class="pin-msg pin-loading">⏳ ${ct('checking')}</div>`;
    } else if (s.status === 'ok') {
        const place = s.places.length === 1 ? `${escapeHtml(s.places[0])}, ` : '';
        html = `<div class="pin-msg pin-ok">✓ ${place}${escapeHtml(s.district)}, ${escapeHtml(s.state)}</div>`;
        if (s.places.length > 1) {
            html += `
                <label class="form-label" for="custArea" style="margin-top:8px;">${ct('chooseArea')} *</label>
                <select id="custArea" class="form-input" required>
                    <option value="">—</option>
                    ${s.places.map(p => `<option value="${escapeHtml(p)}"${p === s.area ? ' selected' : ''}>${escapeHtml(p)}</option>`).join('')}
                </select>`;
        }
    } else if (s.status === 'notfound') {
        html = `
            <div class="pin-msg pin-bad">❌ ${ct('notFound')}</div>
            <div class="pin-help">${ct('notFoundHelp')}</div>
            <a class="guide-wa" href="${escapeHtml(pinHelpLink())}" target="_blank" rel="noopener noreferrer">💬 ${ct('waHelp')}</a>`;
    } else if (s.status === 'unverified') {
        html = `<div class="pin-msg pin-warn">⚠️ ${ct('unverified')}</div>`;
    }

    box.innerHTML = html;
    if (btn) btn.disabled = (s.status === 'notfound');
}

function onPincodeInput(e) {
    const el = e.target;
    const digits = el.value.replace(/\D/g, '').slice(0, 6);
    if (el.value !== digits) el.value = digits;

    if (PIN_RE.test(digits)) {
        pinPromise = startPinLookup(digits);
    } else {
        pinRequestId++;
        pinState = { pin: digits, status: 'idle', places: [], district: '', state: '', area: '' };
        updatePinUI();
    }
}

document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'custArea') pinState.area = e.target.value;
});

/* ---- Step 1: the form ---- */
function readField(id) {
    const el = $(id);
    return el ? el.value.trim() : '';
}

function captureForm() {
    const ctx = checkoutContext;
    if (!ctx || !$('checkoutForm')) return;
    ctx.form = {
        name: readField('custName'), phone: readField('custPhone'), address: readField('custAddress'),
        landmark: readField('custLandmark'), pincode: readField('custPincode'), area: pinState.area || ''
    };
}

function checkoutTotals(ctx) {
    return {
        total: ctx.items.reduce((s, i) => s + i.price * i.quantity, 0),
        count: ctx.items.reduce((s, i) => s + i.quantity, 0)
    };
}

function renderCheckoutForm() {
    const ctx = checkoutContext;
    if (!ctx) return;
    ctx.step = 'form';

    const { total, count } = checkoutTotals(ctx);
    const saved = loadSavedCustomer();
    const f = ctx.form || saved || {};
    pinState = { pin: '', status: 'idle', places: [], district: '', state: '', area: '' };
    pinRequestId++;

    const summary = ctx.items.length === 1 && ctx.items[0].quantity === 1
        ? `<strong>${ct('item')}:</strong> ${escapeHtml(ctx.items[0].title)}<br><strong>${ct('totalPrice')}:</strong> `
        : `<strong>${ct('cartSummary')}:</strong> ${count} ${ct('items')}<br><strong>${ct('totalAmount')}:</strong> `;

    $('checkoutModalTitle').textContent = ct('title');
    $('checkoutModalBody').innerHTML = `
        ${checkoutLangSwitch()}
        <div class="checkout-summary">${summary}<span class="checkout-total">${formatINR(total)}</span></div>
        <form id="checkoutForm" onsubmit="submitCheckoutForm(event)" autocomplete="on">
            <div class="form-group">
                <label class="form-label" for="custName">${ct('name')} *</label>
                <input type="text" id="custName" class="form-input" required minlength="2" maxlength="60" autocomplete="name" placeholder="${escapeHtml(ct('namePh'))}" value="${escapeHtml(f.name || '')}">
            </div>
            <div class="form-group">
                <label class="form-label" for="custPhone">${ct('phone')} *</label>
                <input type="tel" id="custPhone" class="form-input" required inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" title="${escapeHtml(ct('phoneTitle'))}" autocomplete="tel-national" placeholder="${escapeHtml(ct('phonePh'))}" value="${escapeHtml(f.phone || '')}">
            </div>
            <div class="form-group">
                <label class="form-label" for="custAddress">${ct('address')} *</label>
                <textarea id="custAddress" class="form-input" rows="2" required minlength="8" maxlength="250" autocomplete="street-address" placeholder="${escapeHtml(ct('addressPh'))}">${escapeHtml(f.address || '')}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label" for="custLandmark">${ct('landmark')}</label>
                <input type="text" id="custLandmark" class="form-input" maxlength="100" placeholder="${escapeHtml(ct('landmarkPh'))}" value="${escapeHtml(f.landmark || '')}">
            </div>
            <div class="form-group">
                <label class="form-label" for="custPincode">${ct('pincode')} *</label>
                <input type="text" id="custPincode" class="form-input" required inputmode="numeric" maxlength="6" pattern="[1-9][0-9]{5}" title="${escapeHtml(ct('pincodeTitle'))}" autocomplete="postal-code" placeholder="${escapeHtml(ct('pincodePh'))}" value="${escapeHtml(f.pincode || '')}">
                <div id="pinStatus" aria-live="polite"></div>
            </div>
            <div class="process-box">
                ✨ <strong>${ct('processTitle')}:</strong><br>
                1️⃣ ${ct('p1')}<br>
                2️⃣ ${ct('p2')}<br>
                3️⃣ ${ct('p3', formatINR(total))}
            </div>
            <button type="submit" id="checkBtn" class="app-btn whatsapp-order" style="margin-top:10px;">${ct('continueBtn')}</button>
            <div class="saved-row">
                🔒 ${ct('savedNote')}
                ${saved ? `<button type="button" class="saved-clear" onclick="clearSavedCustomer()">${ct('clearSaved')}</button>` : ''}
            </div>
        </form>`;

    $('custPincode').addEventListener('input', onPincodeInput);
    if (PIN_RE.test(f.pincode || '')) pinPromise = startPinLookup(f.pincode, f.area);

    $('checkoutModal').classList.add('active');
}

async function submitCheckoutForm(e) {
    e.preventDefault();
    const ctx = checkoutContext;
    if (!ctx) return;
    captureForm();
    const f = ctx.form;

    // Make sure the pincode has been looked up for exactly what is typed now
    if (pinState.pin !== f.pincode || pinState.status === 'idle') {
        pinPromise = startPinLookup(f.pincode, f.area);
    }
    if (pinState.status === 'loading') await pinPromise;

    if (pinState.status === 'notfound') {
        updatePinUI();
        showToast(ct('blocked'));
        const el = $('pinStatus');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    if (pinState.status === 'ok' && pinState.places.length > 1 && !pinState.area) {
        showToast(ct('chooseArea'));
        const sel = $('custArea');
        if (sel) sel.focus();
        return;
    }

    f.area = pinState.area || '';
    ctx.geo = { status: pinState.status, area: pinState.area || '', district: pinState.district, state: pinState.state };
    renderCheckoutConfirm();
}

/* ---- Step 2: "Please check your details" ---- */
function renderCheckoutConfirm() {
    const ctx = checkoutContext;
    if (!ctx || !ctx.form || !ctx.geo) return;
    ctx.step = 'confirm';

    const f = ctx.form;
    const g = ctx.geo;
    const { total } = checkoutTotals(ctx);
    const place = [g.area, g.district, g.state].filter(Boolean).join(', ');
    const row = (label, value) => value ? `
        <div class="confirm-row">
            <div class="confirm-label">${label}</div>
            <div class="confirm-value">${escapeHtml(value)}</div>
        </div>` : '';

    $('checkoutModalTitle').textContent = ct('confirmTitle');
    $('checkoutModalBody').innerHTML = `
        ${checkoutLangSwitch()}
        <div class="confirm-q">${ct('confirmQ')}</div>
        <div class="confirm-box">
            ${row(ct('name'), f.name)}
            ${row(ct('phone'), f.phone)}
            ${row(ct('address'), f.address)}
            ${row(ct('landmark').replace(/\s*\(.*\)\s*$/, ''), f.landmark)}
            ${row(ct('pincode'), f.pincode + (place ? ` - ${place}` : ''))}
            <div class="confirm-row">
                <div class="confirm-label">${ct('item')}</div>
                <div class="confirm-value">
                    ${ctx.items.map(i => `${escapeHtml(i.title)} × ${i.quantity}`).join('<br>')}
                </div>
            </div>
            <div class="confirm-row confirm-total-row">
                <div class="confirm-label">${ct('totalPrice')}</div>
                <div class="confirm-total">${formatINR(total)}</div>
            </div>
        </div>
        ${g.status === 'unverified' ? `<div class="pin-msg pin-warn" style="margin-top:10px;">⚠️ ${ct('unverified')}</div>` : ''}
        <button type="button" class="app-btn whatsapp-order" style="margin-top:14px;" onclick="confirmAndSend()">✓ ${ct('send')}</button>
        <button type="button" class="guide-another" onclick="editCheckout()">✏️ ${ct('edit')}</button>`;
}

function editCheckout() {
    renderCheckoutForm();   // ctx.form is kept, so everything is filled in again
}

// Language changed (from the switch inside checkout): redraw the current step, keep what was typed
function onLangChanged() {
    const modal = $('checkoutModal');
    const ctx = checkoutContext;
    if (!modal || !ctx || !modal.classList.contains('active')) return;
    if (ctx.step === 'confirm') {
        renderCheckoutConfirm();
    } else {
        captureForm();
        renderCheckoutForm();
    }
}

function closeCheckoutModal() {
    $('checkoutModal').classList.remove('active');
}

function openWhatsApp(text) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    const w = window.open(url, '_blank');
    if (w) {
        try { w.opener = null; } catch (e) {}
    } else {
        location.href = url;   // popup blocked: fall back to same-tab navigation
    }
}

/* ---- Step 3: send the order ---- */
function confirmAndSend() {
    const ctx = checkoutContext;
    if (!ctx || !ctx.items.length || !ctx.form || !ctx.geo) return;

    // Re-check against the live catalogue so the price in the message can't be stale
    const items = [];
    for (const it of ctx.items) {
        const p = PRODUCTS.find(x => x.sku === it.sku);
        if (!p || !canOrder(p)) {
            showToast(`"${it.title}": ${ct('unavailable')}`);
            return;
        }
        items.push({ sku: p.sku, title: p.title, price: safePrice(p.price), quantity: it.quantity });
    }

    const f = ctx.form;
    const g = ctx.geo;
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const orderId = generateUniqueOrderId();

    const payLink = `${location.origin}${location.pathname}?view=pay&orderId=${encodeURIComponent(orderId)}&price=${total}&name=${encodeURIComponent(f.name)}`;
    const multi = items.length > 1 || items[0].quantity > 1;
    const itemsText = items.map((i, idx) => `${idx + 1}. *${i.title}* (SKU: ${i.sku}) x ${i.quantity} = ${formatINR(i.price * i.quantity)}`).join('\n');

    const addressLines = [
        `• Name: ${f.name}`,
        `• Phone: ${f.phone}`,
        `• Address: ${f.address}`,
        f.landmark ? `• Landmark: ${f.landmark}` : '',
        g.area ? `• Area: ${g.area}` : '',
        g.district ? `• City/District: ${g.district}` : '',
        g.state ? `• State: ${g.state}` : '',
        `• Pincode: ${f.pincode}${g.status === 'ok' ? ' (verified)' : ' (not verified)'}`
    ].filter(Boolean).join('\n');

    const divider = '━━━━━━━━━━━━━━━━━━';
    const message =
        `${payLink}\n` +
        `${divider}\n` +
        `👆 *Click on the above link to make payment / भुगतान करने के लिए ऊपर दिए गए लिंक पर क्लिक करें / பணம் செலுத்த மேலே உள்ள லிங்கைக் கிளிக் செய்யவும்*\n` +
        `${divider}\n\n` +
        `*${multi ? 'MULTIPLE ITEMS ORDER' : 'NEW ORDER'} - Uroo Enterprise*\n` +
        `*Order ID:* ${orderId}\n\n` +
        `*Items Ordered:*\n${itemsText}\n\n` +
        `*Total Amount:* ${formatINR(total)}\n\n` +
        `*Customer Details:*\n${addressLines}\n\n` +
        `✨ *Easy Process / आसान प्रक्रिया / எளிதான முறை:*\n` +
        `1️⃣ Click below to send order on WhatsApp / व्हाट्सएप पर आर्डर भेजें\n` +
        `2️⃣ Tap the secure payment link received in WhatsApp / भुगतान लिंक पर टैप करें\n` +
        `3️⃣ Pay ${formatINR(total)} instantly via GPay/PhonePe/Paytm / भुगतान करें`;

    saveCustomer({ name: f.name, phone: f.phone, address: f.address, landmark: f.landmark, pincode: f.pincode, area: g.area });

    closeCheckoutModal();
    openWhatsApp(message);

    // Clear the cart only after WhatsApp has been opened (not before)
    if (ctx.fromCart) {
        CART = [];
        saveCartToStorage();
    }
    checkoutContext = null;
}

/* ---------------------------------------------------------
   Payment page
   --------------------------------------------------------- */
function renderPayView(params) {
    const orderId = (params.get('orderId') || '').trim();
    const amount = safePrice(params.get('price'));
    const name = (params.get('name') || 'Customer').trim().slice(0, 60) || 'Customer';

    $('appTopbarTitle').textContent = 'Secure UPI Payment';
    $('appTopbarSubtitle').textContent = 'Uroo Enterprise';

    const detailsBox = $('payDetailsBox');
    const qrBox = $('qrcode');
    const btnBox = $('upiButtonsContainer');
    qrBox.innerHTML = '';
    btnBox.innerHTML = '';

    // Validate everything coming from the URL: never trust it, never inject it raw
    const validId = /^[A-Za-z0-9_-]{6,40}$/.test(orderId);
    const validAmount = amount !== null && amount <= MAX_PAY_AMOUNT;
    if (!validId || !validAmount) {
        detailsBox.innerHTML = `<div class="notice notice-warn">This payment link looks invalid or incomplete. Please message us on WhatsApp and we'll send you a fresh link.</div>`;
        btnBox.innerHTML = `<a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Uroo Enterprise, my payment link is not working.')}" target="_blank" rel="noopener noreferrer" class="app-btn whatsapp-order">💬 Contact us on WhatsApp</a>`;
        return;
    }

    detailsBox.innerHTML = `
        <div style="font-size:13px;color:var(--text-main);line-height:1.6;">
            <strong>Hello ${escapeHtml(name)},</strong><br>
            <strong>Order ID:</strong> <span style="color:var(--app-accent);font-weight:700;">${escapeHtml(orderId)}</span><br>
            <strong>Amount to Pay:</strong> <span style="color:var(--app-primary);font-weight:700;font-size:16px;">${formatINR(amount)}</span>
        </div>
        <div class="pay-note">Please pay exactly the amount shown. It is checked against your WhatsApp order before dispatch.</div>`;

    const upiString = `upi://pay?pa=${BUSINESS_UPI_ID}&pn=UrooEnterprise&am=${amount.toFixed(2)}&cu=INR&tn=Order_${orderId}`;

    if (typeof QRCode !== 'undefined') {
        new QRCode(qrBox, { text: upiString, width: 160, height: 160 });
    } else {
        qrBox.innerHTML = '<div style="font-size:12px;color:var(--text-muted);">QR unavailable. Use the button below.</div>';
    }

    btnBox.innerHTML = `
        <a href="${escapeHtml(upiString)}" class="app-btn" style="background:#2563eb;color:#fff;font-size:14px;padding:12px;">📱 Pay ${formatINR(amount)} via Google Pay / PhonePe / Paytm</a>
        <div style="font-size:11px;color:var(--success-green);font-weight:700;text-align:center;margin-top:4px;">✓ Instant Direct UPI Transfer for Order #${escapeHtml(orderId)}</div>`;
}

/* ---------------------------------------------------------
   Product cards, home, category, search
   --------------------------------------------------------- */
function createProductCard(product) {
    const price = safePrice(product.price);
    const mrp = safePrice(product.mrp);
    const mainImg = productImages(product)[0];
    const discount = discountPercent(price, mrp);
    const inStock = isInStock(product);

    const card = document.createElement('div');
    card.className = 'app-product-card';
    card.setAttribute('role', 'link');
    card.tabIndex = 0;
    card.setAttribute('aria-label', product.title);
    const open = () => navigateTo({ view: 'pdpView', sku: product.sku });
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });

    card.innerHTML = `
        <div class="app-card-img">
            <img src="${escapeHtml(mainImg)}" alt="${escapeHtml(product.title)}" loading="lazy" onerror="imgFallback(this)">
            ${inStock ? '' : '<span class="oos-badge">Out of Stock</span>'}
        </div>
        <div class="app-card-body">
            <div class="app-card-title">${escapeHtml(product.title)}</div>
            <div class="app-card-price-row">
                <span class="app-price">${price ? formatINR(price) : 'Price on request'}</span>
                ${mrp && discount > 0 ? `<span class="app-mrp">${formatINR(mrp)}</span>` : ''}
                ${discount > 0 ? `<span class="app-disc">${discount}% off</span>` : ''}
            </div>
        </div>`;
    return card;
}

function initHome(loaded = true) {
    const catGrid = $('homeCatGrid');
    const trendGrid = $('homeTrendingGrid');
    catGrid.innerHTML = '';
    trendGrid.innerHTML = '';

    if (!PRODUCTS.length) {
        const msg = loaded
            ? 'Our catalogue is being updated. Please check back soon.'
            : 'We could not load the products. Please check your connection and try again.';
        catGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">${msg}<br><br><button type="button" class="app-btn" style="background:var(--app-primary);color:#fff;max-width:180px;margin:0 auto;" onclick="location.reload()">Retry</button></div>`;
        return;
    }

    const categories = [...new Set(PRODUCTS.map(p => p.category))];
    categories.forEach(cat => {
        const count = PRODUCTS.filter(p => p.category === cat).length;
        const tile = document.createElement('div');
        tile.className = 'app-cat-tile';
        tile.setAttribute('role', 'link');
        tile.tabIndex = 0;
        tile.setAttribute('aria-label', `${cat}, ${count} items`);
        tile.innerHTML = `
            <img src="${escapeHtml(CATEGORY_IMAGES[cat] || DEFAULT_IMAGE)}" alt="" loading="lazy" onerror="imgFallback(this)">
            <div class="app-cat-overlay"></div>
            <div class="app-cat-content">
                <h4>${escapeHtml(cat)}</h4>
                <span>${count} ${count === 1 ? 'item' : 'items'}</span>
            </div>`;
        const open = () => navigateTo({ view: 'categoryView', category: cat });
        tile.addEventListener('click', open);
        tile.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
        catGrid.appendChild(tile);
    });

    PRODUCTS.slice(0, 6).forEach(p => trendGrid.appendChild(createProductCard(p)));
}

function renderCategoryProducts(catName) {
    const grid = $('categoryProductGrid');
    grid.innerHTML = '';
    const wanted = String(catName || '').toLowerCase().trim();
    const filtered = PRODUCTS.filter(p => p.category.toLowerCase().trim() === wanted);
    if (!filtered.length) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">No products found in this category.</div>';
        return;
    }
    filtered.forEach(p => grid.appendChild(createProductCard(p)));
}

// Search (this function was missing, so search never worked)
function handleAppSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(runAppSearch, 150);
}

function runAppSearch() {
    const input = $('appSearchInput');
    const grid = $('searchProductGrid');
    if (!input || !grid) return;

    const q = input.value.trim().toLowerCase();
    grid.innerHTML = '';

    if (!q) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Type a name, stone or category to search.</div>';
        return;
    }

    const terms = q.split(/\s+/);
    const results = PRODUCTS.filter(p => {
        const hay = [p.title, p.description, p.category, p.sku].join(' ').toLowerCase();
        return terms.every(t => hay.includes(t));
    });

    if (!results.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">No results for "${escapeHtml(input.value.trim())}".<br>Try another word, or ask us on WhatsApp.</div>`;
        return;
    }
    results.forEach(p => grid.appendChild(createProductCard(p)));
}

/* ---------------------------------------------------------
   Product detail page
   --------------------------------------------------------- */
function getReviewsFor(product) {
    // Strict matching only: never fall back to showing every review on every product
    const hay = `${product.title} ${product.category}`.toLowerCase();
    return PRODUCT_REVIEWS_DB.filter(r => r.tags.some(tag => hay.includes(tag)));
}

function renderMarketSection(product) {
    const hasMeesho = isRealLink(product.meesho);
    const hasAmazon = isRealLink(product.amazon);
    if (!hasMeesho && !hasAmazon) return '';

    const link = (url, label, icon, h) => `
        <a href="${escapeHtml(url.trim())}" target="_blank" rel="noopener noreferrer" class="market-link" title="View on ${label}">
            <img src="images/${icon}" alt="${label}" style="height:${h}px;object-fit:contain;" onerror="this.replaceWith(document.createTextNode('${label}'))">
        </a>`;

    return `
        <div class="market-box">
            <div class="market-title">🛍️ Buy From:</div>
            <div class="market-row">
                ${hasMeesho ? link(product.meesho, 'Meesho', 'meeshoicon.png', 44) : ''}
                ${hasAmazon ? link(product.amazon, 'Amazon', 'amazonicon.png', 32) : ''}
            </div>
            <div class="market-note">💡 Note: Prices and discounts may vary on Amazon or Meesho based on active platform promotions.</div>
        </div>`;
}

function renderReviewsSection(product) {
    const reviews = getReviewsFor(product);
    if (!reviews.length) return '';
    const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

    return `
        <div class="reviews-section">
            <div class="reviews-title">⭐ Customer Reviews (${reviews.length}) · ${avg} avg</div>
            <div class="reviews-sub">Reviews from buyers of similar items on Meesho.</div>
            <div class="reviews-list">
                ${reviews.map(r => `
                    <div class="review-card">
                        <div class="review-top">
                            <div class="review-name">${escapeHtml(r.name)}</div>
                            <div class="review-rating">
                                <span class="review-stars">${escapeHtml(r.rating)} ★</span>
                                <span class="review-badge">${escapeHtml(r.badge)}</span>
                            </div>
                        </div>
                        <div class="review-date">${escapeHtml(r.date)}</div>
                        <p class="review-text">"${escapeHtml(r.text)}"</p>
                    </div>`).join('')}
            </div>
        </div>`;
}

function renderPDP(sku, opts = {}) {
    const product = PRODUCTS.find(p => p.sku === sku);
    const card = $('pdpCardContent');
    const recGrid = $('pdpRecommendedGrid');

    if (!product) {
        card.innerHTML = '<div class="empty-state">Product not found.</div>';
        recGrid.innerHTML = '';
        return;
    }

    document.title = `${product.title} | Uroo Enterprise`;
    $('appTopbarSubtitle').textContent = product.category || '';

    const price = safePrice(product.price);
    const mrp = safePrice(product.mrp);
    const discount = discountPercent(price, mrp);
    const inStock = isInStock(product);

    currentProductImages = productImages(product);
    if (!opts.keepImage || currentImageIndex >= currentProductImages.length) currentImageIndex = 0;

    const inquiryMessage = encodeURIComponent(
        `Hi Uroo Enterprise,\n\nI have a question about this product:\n*${product.title}* (SKU: ${product.sku})\n` +
        (price ? `Price: ${formatINR(price)}\n` : '') +
        `\nPlease provide more details.`
    );
    const shareText = encodeURIComponent(
        `Check out ${product.title} on Uroo Enterprise${price ? ` for just ${formatINR(price)}` : ''}! View product: ${location.href}`
    );

    let actionsHTML;
    if (!price) {
        actionsHTML = `<div class="notice">Price on request. Message us on WhatsApp to order this item.</div>`;
    } else if (!inStock) {
        actionsHTML = `<div class="notice notice-warn">Currently out of stock. Message us to know when it's back.</div>`;
    } else {
        const inCart = CART.find(i => i.sku === product.sku);
        const qty = inCart ? inCart.quantity : 0;
        actionsHTML = `
            <button type="button" data-action="order-now" data-sku="${escapeHtml(product.sku)}" class="app-btn whatsapp-order">
                💬 Order on WhatsApp &amp; Pay via UPI
            </button>
            ${qty > 0
                ? `<button type="button" data-action="add-to-cart" data-sku="${escapeHtml(product.sku)}" class="app-btn cart-btn-added">✓ Added in Cart (${qty} in cart) - Add More 🛒</button>`
                : `<button type="button" data-action="add-to-cart" data-sku="${escapeHtml(product.sku)}" class="app-btn cart-btn-add">🛒 Add to Shopping Cart</button>`}`;
    }

    const multi = currentProductImages.length > 1;

    card.innerHTML = `
        <div class="pdp-img-container pdp-hero" data-action="open-lightbox">
            <img id="mainPdpImg" src="${escapeHtml(currentProductImages[currentImageIndex])}" alt="${escapeHtml(product.title)}" onerror="imgFallback(this)">
            ${multi ? `
                <button type="button" class="pdp-arrow pdp-arrow-left" data-action="img-prev" aria-label="Previous image">❮</button>
                <button type="button" class="pdp-arrow pdp-arrow-right" data-action="img-next" aria-label="Next image">❯</button>
                <div class="pdp-img-counter" id="imgCounter">${currentImageIndex + 1} / ${currentProductImages.length}</div>` : ''}
            <div class="pdp-fs-hint">🔍 Fullscreen</div>
            ${inStock ? '' : '<span class="oos-badge oos-badge-lg">Out of Stock</span>'}
        </div>
        ${multi ? `
        <div class="pdp-thumbs">
            ${currentProductImages.map((imgUrl, index) => `
                <img src="${escapeHtml(imgUrl)}" alt="Thumbnail ${index + 1}" data-action="thumb" data-index="${index}" id="thumb-${index}" class="pdp-thumb${index === currentImageIndex ? ' active' : ''}" loading="lazy" onerror="imgFallback(this)">`).join('')}
        </div>` : ''}
        <div class="pdp-content">
            <div class="pdp-title">${escapeHtml(product.title)}</div>
            <div class="pdp-price-box">
                <span class="pdp-cur-price">${price ? formatINR(price) : 'Price on request'}</span>
                ${mrp && discount > 0 ? `<span class="pdp-old-price">${formatINR(mrp)}</span>` : ''}
                ${discount > 0 ? `<span class="pdp-disc">${discount}% OFF</span>` : ''}
            </div>
            <div class="pdp-description">${escapeHtml(product.description || '')}</div>

            <div class="pdp-action-stack">
                ${actionsHTML}
                ${renderMarketSection(product)}
                <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${inquiryMessage}" target="_blank" rel="noopener noreferrer" class="app-btn whatsapp-inquiry" style="margin-top:4px;">
                    ❓ Product Inquiry via WhatsApp
                </a>

                <div class="share-section">
                    <div class="share-title">📤 Share this product with friends:</div>
                    <div class="share-btns-row">
                        <a href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" rel="noopener noreferrer" class="share-btn share-wa">💬 WhatsApp</a>
                        <button type="button" data-action="copy-link" class="share-btn share-copy">🔗 Copy Link</button>
                    </div>
                </div>

                ${renderReviewsSection(product)}
            </div>
        </div>`;

    ensureLightboxDOM();

    recGrid.innerHTML = '';
    const sameCat = PRODUCTS.filter(p => p.category.toLowerCase().trim() === product.category.toLowerCase().trim() && p.sku !== product.sku);
    let recs = sameCat;
    if (recs.length < 4) {
        recs = [...sameCat, ...PRODUCTS.filter(p => p.sku !== product.sku && !sameCat.includes(p))];
    }
    recs.slice(0, 4).forEach(rec => recGrid.appendChild(createProductCard(rec)));
}

function copyProductLink() {
    const url = location.href;
    const done = () => showToast('✓ Product link copied');
    const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { showToast('Could not copy. Please copy the address bar link.'); }
        ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(fallback);
    } else {
        fallback();
    }
}

function setMainImage(index) {
    if (index < 0 || index >= currentProductImages.length) return;
    currentImageIndex = index;
    const main = $('mainPdpImg');
    if (main) main.src = currentProductImages[index];

    const counter = $('imgCounter');
    if (counter) counter.textContent = `${index + 1} / ${currentProductImages.length}`;

    currentProductImages.forEach((_, i) => {
        const thumb = $(`thumb-${i}`);
        if (thumb) thumb.classList.toggle('active', i === index);
    });
}

function changeImage(direction) {
    const n = currentProductImages.length;
    if (!n) return;
    setMainImage((currentImageIndex + direction + n) % n);
}

/* ---------------------------------------------------------
   Lightbox (all functions are now properly declared)
   --------------------------------------------------------- */
function ensureLightboxDOM() {
    if ($('imageLightboxModal')) return;
    const lb = document.createElement('div');
    lb.id = 'imageLightboxModal';
    lb.className = 'lightbox';
    lb.innerHTML = `
        <button type="button" class="lb-btn lb-close" data-action="lb-close" aria-label="Close">✕</button>
        <button type="button" class="lb-btn lb-nav lb-prev" data-action="lb-prev" aria-label="Previous image">❮</button>
        <button type="button" class="lb-btn lb-nav lb-next" data-action="lb-next" aria-label="Next image">❯</button>
        <img id="lightboxImg" src="" alt="">
        <div id="lightboxCounter" class="lb-counter">1 / 1</div>`;
    document.body.appendChild(lb);

    let startX = 0;
    lb.addEventListener('touchstart', e => { startX = e.changedTouches[0].screenX; }, { passive: true });
    lb.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].screenX;
        if (endX < startX - 50) lightboxChange(1);
        if (endX > startX + 50) lightboxChange(-1);
    }, { passive: true });
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
}

function updateLightboxContent() {
    const imgEl = $('lightboxImg');
    const counterEl = $('lightboxCounter');
    if (imgEl && currentProductImages.length) {
        imgEl.src = currentProductImages[currentImageIndex];
        imgEl.onerror = () => imgFallback(imgEl);
    }
    if (counterEl) counterEl.textContent = `${currentImageIndex + 1} / ${currentProductImages.length}`;
}

function openLightbox(index) {
    ensureLightboxDOM();
    currentImageIndex = index;
    updateLightboxContent();
    $('imageLightboxModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = $('imageLightboxModal');
    if (lb) lb.style.display = 'none';
    document.body.style.overflow = '';
}

function lightboxChange(direction) {
    const n = currentProductImages.length;
    if (!n) return;
    currentImageIndex = (currentImageIndex + direction + n) % n;
    updateLightboxContent();
    setMainImage(currentImageIndex);
}

function isLightboxOpen() {
    const lb = $('imageLightboxModal');
    return !!lb && lb.style.display === 'flex';
}

/* ---------------------------------------------------------
   Navigation / routing
   --------------------------------------------------------- */
function setActiveNav(id) {
    document.querySelectorAll('.app-bottom-nav .nav-item').forEach(n => n.classList.remove('active'));
    const el = id ? $(id) : null;
    if (el) el.classList.add('active');
}

function navigateTo(state, push = true) {
    state = Object.assign({}, state);
    const curIdx = (history.state && Number.isInteger(history.state.idx)) ? history.state.idx : 0;

    let url = location.pathname;
    if (state.view === 'pdpView' && state.sku) {
        url += `?view=pdp&sku=${encodeURIComponent(state.sku)}`;
    } else if (state.view === 'categoryView' && state.category) {
        url += `?view=category&category=${encodeURIComponent(state.category)}`;
    } else if (state.view === 'searchView') {
        url += '?view=search';
    } else if (state.view === 'aboutView') {
        url += '?view=about';
    } else if (state.view === 'contactView') {
        url += '?view=contact';
    } else if (state.view === 'payView') {
        url += `?view=pay&orderId=${encodeURIComponent(state.orderId || '')}&price=${encodeURIComponent(state.price || '')}&name=${encodeURIComponent(state.name || '')}`;
    }

    if (push) {
        if (url === location.pathname + location.search) {
            // Same page: don't stack duplicate history entries
            state.idx = curIdx;
            history.replaceState(state, '', url);
        } else {
            state.idx = curIdx + 1;
            history.pushState(state, '', url);
        }
    }

    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    const viewEl = $(state.view);
    if (viewEl) viewEl.classList.add('active');
    document.body.classList.toggle('on-pay', state.view === 'payView');

    const navMap = { homeView: 'navHome', searchView: 'navSearch', contactView: 'navContact' };
    setActiveNav(navMap[state.view]);

    const backBtn = $('appBackBtn');
    const title = $('appTopbarTitle');
    const subtitle = $('appTopbarSubtitle');
    backBtn.style.display = state.view === 'homeView' ? 'none' : 'flex';
    document.title = 'Uroo Enterprise - Certified Natural Crystals & Spiritual Store';

    switch (state.view) {
        case 'homeView':
            title.textContent = 'Uroo Enterprise';
            subtitle.textContent = 'Spiritual & Gemstone Store';
            break;
        case 'categoryView':
            title.textContent = state.category;
            subtitle.textContent = 'Collection';
            $('categoryViewTitle').textContent = state.category;
            renderCategoryProducts(state.category);
            break;
        case 'pdpView':
            title.textContent = 'Product Details';
            renderPDP(state.sku);
            break;
        case 'searchView':
            title.textContent = 'Search Catalog';
            subtitle.textContent = 'Find items';
            runAppSearch();
            setTimeout(() => { const i = $('appSearchInput'); if (i) i.focus(); }, 50);
            break;
        case 'aboutView':
            title.textContent = 'About Us';
            subtitle.textContent = 'Uroo Enterprise';
            break;
        case 'contactView':
            title.textContent = 'Contact & Socials';
            subtitle.textContent = 'Uroo Enterprise';
            break;
        case 'payView':
            renderPayView(new URLSearchParams(location.search));
            break;
    }

    window.scrollTo(0, 0);
}

// Back: only use history.back() if the previous page is inside this app, otherwise go Home
function goBack() {
    const idx = history.state && history.state.idx;
    if (idx > 0) {
        history.back();
    } else {
        const home = { view: 'homeView', idx: 0 };
        history.replaceState(home, '', location.pathname);
        navigateTo(home, false);
    }
}

function scrollToCats() {
    const el = $('homeCatGrid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function goToCategories() {
    navigateTo({ view: 'homeView' });
    setActiveNav('navCategories');
    requestAnimationFrame(scrollToCats);
}

function handleInitialRoute() {
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    let state;

    if (view === 'pay') {
        state = { view: 'payView', orderId: params.get('orderId'), price: params.get('price'), name: params.get('name') };
    } else if (view === 'pdp' && params.get('sku')) {
        state = { view: 'pdpView', sku: params.get('sku') };
    } else if (view === 'category' && params.get('category')) {
        state = { view: 'categoryView', category: params.get('category') };
    } else if (view === 'search') {
        state = { view: 'searchView' };
    } else if (view === 'about') {
        state = { view: 'aboutView' };
    } else if (view === 'contact') {
        state = { view: 'contactView' };
    } else {
        state = { view: 'homeView' };
    }

    state.idx = 0;
    history.replaceState(state, '', location.href);
    navigateTo(state, false);
}

/* ---------------------------------------------------------
   Global event wiring
   --------------------------------------------------------- */
window.addEventListener('popstate', (event) => {
    closeLightbox();
    closeCartModal();
    closeCheckoutModal();
    if (event.state) {
        navigateTo(event.state, false);
    } else {
        handleInitialRoute();
    }
});

// One delegated click handler for data-action buttons (no inline JS with SKUs inside attributes)
document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const sku = el.dataset.sku;
    switch (el.dataset.action) {
        case 'add-to-cart':    addToCart(sku); break;
        case 'order-now':      openCheckoutModal(sku); break;
        case 'qty-inc':        updateQuantity(sku, 1); break;
        case 'qty-dec':        updateQuantity(sku, -1); break;
        case 'copy-link':      copyProductLink(); break;
        case 'thumb':          setMainImage(Number(el.dataset.index)); break;
        case 'img-prev':       e.stopPropagation(); changeImage(-1); break;
        case 'img-next':       e.stopPropagation(); changeImage(1); break;
        case 'open-lightbox':  openLightbox(currentImageIndex); break;
        case 'lb-close':       closeLightbox(); break;
        case 'lb-prev':        lightboxChange(-1); break;
        case 'lb-next':        lightboxChange(1); break;
    }
});

// Tap the dark backdrop to close sheets
['cartModal', 'checkoutModal'].forEach(id => {
    document.addEventListener('DOMContentLoaded', () => {
        const overlay = $(id);
        if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
    });
});

// Keyboard: Esc closes things, arrows move through the lightbox
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (isLightboxOpen()) closeLightbox();
        else { closeCartModal(); closeCheckoutModal(); }
    } else if (isLightboxOpen()) {
        if (e.key === 'ArrowLeft') lightboxChange(-1);
        if (e.key === 'ArrowRight') lightboxChange(1);
    }
});

window.addEventListener('DOMContentLoaded', loadProducts);