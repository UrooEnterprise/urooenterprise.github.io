const DEFAULT_IMAGE = "/Images/capricorn01.webp";
const WHATSAPP_NUMBER = "919016406623";
const BUSINESS_UPI_ID = "9016406623@ptaxis";

let PRODUCTS = [];
let currentCheckoutProduct = null;
let currentImageIndex = 0;
let currentProductImages = [];

async function loadProducts() {
    try {
        const response = await fetch('uroo_products.json');
        PRODUCTS = await response.json();
    } catch (e) {
        console.error("Failed to load uroo_products.json, using fallback data.");
        PRODUCTS = [];
    }
    initHome();
    handleInitialRoute();
}

function openCheckoutModal(sku) {
    currentCheckoutProduct = PRODUCTS.find(p => p.sku === sku);
    if (!currentCheckoutProduct) return;

    const modalBody = document.getElementById('checkoutModalBody');
    const price = currentCheckoutProduct.price || 299;

    modalBody.innerHTML = `
        <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">
            <strong>Item:</strong> ${escapeHtml(currentCheckoutProduct.title)}<br>
            <strong>Total Price:</strong> <span style="color:var(--app-primary); font-weight:700; font-size:15px;">₹${price}</span>
        </div>
        <form id="checkoutForm" onsubmit="submitCheckout(event)">
            <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input type="text" id="custName" class="form-input" required placeholder="Enter your full name">
            </div>
            <div class="form-group">
                <label class="form-label">WhatsApp Number *</label>
                <input type="tel" id="custPhone" class="form-input" required placeholder="10-digit mobile number">
            </div>
            <div class="form-group">
                <label class="form-label">Delivery Address *</label>
                <textarea id="custAddress" class="form-input" rows="2" required placeholder="House No, Street, Landmark, City"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Pincode *</label>
                <input type="text" id="custPincode" class="form-input" required placeholder="6-digit pincode">
            </div>

            <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:8px; padding:12px; margin:14px 0; font-size:12px; color:var(--text-muted); line-height:1.4;">
                ✨ <strong>Easy Process / आसान प्रक्रिया / எளிதான முறை:</strong><br>
                1️⃣ Click below to send order on WhatsApp.<br>
                2️⃣ Tap the secure payment link received in WhatsApp.<br>
                3️⃣ Pay ₹${price} instantly via GPay/PhonePe/Paytm!
            </div>

            <button type="submit" class="app-btn whatsapp-order" style="margin-top:10px;">
                💬 Send Order & Pay via WhatsApp
            </button>
        </form>
    `;

    document.getElementById('checkoutModal').classList.add('active');
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
}

function submitCheckout(e) {
    e.preventDefault();
    if (!currentCheckoutProduct) return;

    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const pincode = document.getElementById('custPincode').value.trim();
    const price = currentCheckoutProduct.price || 299;

    const personalizedPayLink = `${window.location.origin}${window.location.pathname}?view=pay&sku=${encodeURIComponent(currentCheckoutProduct.sku)}&price=${price}&name=${encodeURIComponent(name)}`;

    const message = encodeURIComponent(
        `*NEW ORDER - Uroo Enterprise*\n\n` +
        `*Product:* ${currentCheckoutProduct.title}\n` +
        `*SKU:* ${currentCheckoutProduct.sku}\n` +
        `*Total Price:* ₹${price}\n\n` +
        `*Customer Details:*\n` +
        `• Name: ${name}\n` +
        `• Phone: ${phone}\n` +
        `• Address: ${address} - ${pincode}\n\n` +
        `✨ *Easy Process / आसान प्रक्रिया / எளிதான முறை:*\n` +
        `1️⃣ Click below to send order on WhatsApp / व्हाट्सएप पर आर्डर भेजें\n` +
        `2️⃣ Tap the secure payment link received in WhatsApp / भुगतान लिंक पर टैप करें\n` +
        `3️⃣ Pay ₹${price} instantly via GPay/PhonePe/Paytm / भुगतान करें\n\n` +
        `👆 *Click above to pay securely / सुरक्षित भुगतान के लिए ऊपर क्लिक करें / பாதுகாப்பாக பணம் செலுத்த மேலே கிளிக் செய்யவும்:*\n` +
        `${personalizedPayLink}`
    );

    closeCheckoutModal();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
}

function renderPayView(params) {
    const sku = params.get('sku');
    const price = params.get('price') || '299';
    const name = params.get('name') || 'Customer';
    const product = PRODUCTS.find(p => p.sku === sku) || PRODUCTS[0] || { title: 'Gemstone Item', sku: sku };

    document.getElementById('appTopbarTitle').textContent = 'Secure UPI Payment';
    document.getElementById('appTopbarSubtitle').textContent = 'Uroo Enterprise';

    const detailsBox = document.getElementById('payDetailsBox');
    detailsBox.innerHTML = `
        <div style="font-size: 13px; color: var(--text-main); line-height: 1.6;">
            <strong>Hello ${escapeHtml(name)},</strong><br>
            <strong>Item:</strong> ${escapeHtml(product.title)}<br>
            <strong>SKU:</strong> ${escapeHtml(product.sku)}<br>
            <strong>Amount to Pay:</strong> <span style="color: var(--app-primary); font-weight: 700; font-size: 16px;">₹${price}</span>
        </div>
    `;

    document.getElementById('qrcode').innerHTML = "";
    const upiString = `upi://pay?pa=${BUSINESS_UPI_ID}&pn=UrooEnterprise&am=${price}&cu=INR&tn=Order_${product.sku}`;
    new QRCode(document.getElementById("qrcode"), {
        text: upiString,
        width: 160,
        height: 160
    });

    const buttonsContainer = document.getElementById('upiButtonsContainer');
    buttonsContainer.innerHTML = `
        <a href="${upiString}" class="app-btn" style="background: #2563eb; color: #fff; font-size: 14px; padding: 12px;">📱 Pay ₹${price} via Google Pay / PhonePe / Paytm</a>
        <div style="font-size: 11px; color: var(--success-green); font-weight: 700; text-align: center; margin-top: 4px;">✓ Instant Direct UPI Transfer to Uroo Enterprise</div>
    `;
}

function safePrice(val) {
    return (typeof val === 'number' && !isNaN(val)) ? val : null;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function createProductCard(product) {
    const price = safePrice(product.price);
    const mrp = safePrice(product.mrp);
    const mainImg = (product.images && product.images.length) ? product.images[0] : DEFAULT_IMAGE;
    const discount = (mrp && price && mrp > price) ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'app-product-card';
    card.onclick = () => navigateTo({ view: 'pdpView', sku: product.sku });

    card.innerHTML = `
        <div class="app-card-img">
            <img src="${mainImg}" alt="${escapeHtml(product.title)}" loading="lazy">
        </div>
        <div class="app-card-body">
            <div class="app-card-title">${escapeHtml(product.title)}</div>
            <div class="app-card-price-row">
                <span class="app-price">${price ? '₹' + price : 'Price on request'}</span>
                ${mrp ? `<span class="app-mrp">₹${mrp}</span>` : ''}
                ${discount > 0 ? `<span class="app-disc">${discount}%off</span>` : ''}
            </div>
        </div>
    `;
    return card;
}

function navigateTo(state, push = true) {
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
        url += `?view=pay&sku=${encodeURIComponent(state.sku || '')}&price=${state.price || '299'}&name=${encodeURIComponent(state.name || '')}`;
    }

    if (push) history.pushState(state, "", url);

    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    const viewEl = document.getElementById(state.view);
    if (viewEl) viewEl.classList.add('active');

    document.querySelectorAll('.app-bottom-nav .nav-item').forEach(n => n.classList.remove('active'));
    if (state.view === 'homeView') document.getElementById('navHome').classList.add('active');
    if (state.view === 'searchView') document.getElementById('navSearch').classList.add('active');

    const backBtn = document.getElementById('appBackBtn');
    if (state.view === 'homeView') {
        backBtn.style.display = 'none';
        document.getElementById('appTopbarTitle').textContent = 'Uroo Enterprise';
        document.getElementById('appTopbarSubtitle').textContent = 'Spiritual & Gemstone Store';
    } else {
        backBtn.style.display = 'block';
    }

    if (state.view === 'categoryView') {
        document.getElementById('appTopbarTitle').textContent = state.category;
        document.getElementById('appTopbarSubtitle').textContent = 'Collection';
        document.getElementById('categoryViewTitle').textContent = state.category;
        renderCategoryProducts(state.category);
    } else if (state.view === 'pdpView') {
        document.getElementById('appTopbarTitle').textContent = 'Product Details';
        renderPDP(state.sku);
    } else if (state.view === 'searchView') {
        document.getElementById('appTopbarTitle').textContent = 'Search Catalog';
        document.getElementById('appTopbarSubtitle').textContent = 'Find items';
    } else if (state.view === 'aboutView') {
        document.getElementById('appTopbarTitle').textContent = 'About Us';
        document.getElementById('appTopbarSubtitle').textContent = 'Uroo Enterprise';
    } else if (state.view === 'contactView') {
        document.getElementById('appTopbarTitle').textContent = 'Contact & Socials';
        document.getElementById('appTopbarSubtitle').textContent = 'Uroo Enterprise';
    } else if (state.view === 'payView') {
        const params = new URLSearchParams(location.search);
        renderPayView(params);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToCats() {
    const el = document.getElementById('homeCatGrid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function initHome() {
    if (!PRODUCTS.length) return;
    const categories = [...new Set(PRODUCTS.map(p => p.category))];
    const catGrid = document.getElementById('homeCatGrid');
    catGrid.innerHTML = '';

    categories.forEach(cat => {
        const count = PRODUCTS.filter(p => p.category === cat).length;
        const coverImg = CATEGORY_IMAGES[cat] || DEFAULT_IMAGE;

        const tile = document.createElement('div');
        tile.className = 'app-cat-tile';
        tile.innerHTML = `
            <img src="${coverImg}" alt="${escapeHtml(cat)}" loading="lazy">
            <div class="app-cat-overlay"></div>
            <div class="app-cat-content">
                <h4>${escapeHtml(cat)}</h4>
                <span>${count} Items ➔</span>
            </div>
        `;
        tile.onclick = () => navigateTo({ view: 'categoryView', category: cat });
        catGrid.appendChild(tile);
    });

    const trendGrid = document.getElementById('homeTrendingGrid');
    trendGrid.innerHTML = '';
    PRODUCTS.slice(0, 6).forEach(product => {
        trendGrid.appendChild(createProductCard(product));
    });
}

const CATEGORY_IMAGES = {
    "Crystal Bracelets": DEFAULT_IMAGE,
    "Rashi/Zodiac Bracelet": DEFAULT_IMAGE,
    "Mala & Pendant": DEFAULT_IMAGE,
    "Anklets": DEFAULT_IMAGE,
    "Vastu & Prosperity": DEFAULT_IMAGE,
    "Jewellery": DEFAULT_IMAGE
};

function renderCategoryProducts(catName) {
    const grid = document.getElementById('categoryProductGrid');
    grid.innerHTML = '';
    const filtered = PRODUCTS.filter(p => p.category.toLowerCase().trim() === catName.toLowerCase().trim());
    filtered.forEach(product => grid.appendChild(createProductCard(product)));
}

function renderPDP(sku) {
    const product = PRODUCTS.find(p => p.sku === sku);
    if (!product) {
        document.getElementById('pdpCardContent').innerHTML = '<div style="padding:16px">Product not found.</div>';
        return;
    }

    document.getElementById('appTopbarSubtitle').textContent = product.category || '';

    const price = safePrice(product.price);
    const mrp = safePrice(product.mrp);
    const discount = (mrp && price && mrp > price) ? Math.round(((mrp - price) / mrp) * 100) : 0;
    currentProductImages = (product.images && product.images.length) ? product.images : [DEFAULT_IMAGE];
    currentImageIndex = 0;

    const inquiryMessage = encodeURIComponent(`Hi Uroo Enterprise,\n\nI have a question about this product:\n*${product.title}* (SKU: ${product.sku})\nPrice: ₹${price}\n\nPlease provide more details.`);
    const shareText = encodeURIComponent(`Check out ${product.title} on Uroo Enterprise for just ₹${price}! View product: ${location.href}`);

    const pdpCard = document.getElementById('pdpCardContent');
    pdpCard.innerHTML = `
        <div class="pdp-img-container" style="position: relative; cursor: pointer; height: 320px; background: #ffffff; display: flex; align-items: center; justify-content: center;" onclick="openLightbox(currentImageIndex)">
            <img id="mainPdpImg" src="${currentProductImages[0]}" alt="${escapeHtml(product.title)}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            ${currentProductImages.length > 1 ? `
                <button onclick="event.stopPropagation(); changeImage(-1)" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 36px; height: 36px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">❮</button>
                <button onclick="event.stopPropagation(); changeImage(1)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 36px; height: 36px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;">❯</button>
                <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; padding: 3px 8px; font-size: 11px; border-radius: 12px;" id="imgCounter">1 / ${currentProductImages.length}</div>
            ` : ''}
            <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; padding: 4px 8px; font-size: 11px; border-radius: 6px;">🔍 Fullscreen</div>
        </div>
        ${currentProductImages.length > 1 ? `
        <div style="display:flex; gap:8px; padding:10px 16px; overflow-x:auto; background:#f8fafc; border-bottom:1px solid var(--border-color);">
            ${currentProductImages.map((imgUrl, index) => `
                <img src="${imgUrl}" alt="Thumbnail ${index + 1}" onclick="setMainImage(${index})" id="thumb-${index}" style="width:55px; height:55px; object-fit:cover; border-radius:6px; cursor:pointer; border:2px solid ${index === 0 ? 'var(--app-primary)' : 'var(--border-color)'};" loading="lazy" />
            `).join('')}
        </div>` : ''}
        <div class="pdp-content">
            <div class="pdp-title">${escapeHtml(product.title)}</div>
            <div class="pdp-price-box">
                <span class="pdp-cur-price">${price ? '₹' + price : 'Price on request'}</span>
                ${mrp ? `<span class="pdp-old-price">₹${mrp}</span>` : ''}
                ${discount > 0 ? `<span style="font-size:12px; font-weight:700; color:var(--success-green);">${discount}% OFF</span>` : ''}
            </div>
            <div class="pdp-description">${escapeHtml(product.description || '')}</div>

            <div class="pdp-action-stack">
                <button onclick="openCheckoutModal('${product.sku}')" class="app-btn whatsapp-order">
                    💬 Order on WhatsApp & Pay via UPI
                </button>
                <div style="font-size:10px; color:var(--success-green); font-weight:700; text-align:center;">✨ Multilingual Visual Guide & Secure Link in WhatsApp</div>

                <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${inquiryMessage}" target="_blank" rel="noopener noreferrer" class="app-btn whatsapp-inquiry">
                    ❓ Product Inquiry via WhatsApp
                </a>

                <div class="market-row" style="display: flex; gap: 10px; margin-top: 4px;">
                    <a href="${product.meesho || '#'}" target="_blank" rel="noopener noreferrer" style="flex: 1; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; text-decoration: none; box-shadow: 0 1px 3px rgba(0,0,0,0.02); ${product.meesho ? '' : 'opacity:0.5; pointer-events:none;'}" title="View on Meesho">
                        <img src="images/meeshoicon.png" alt="Meesho" style="height: 32px; object-fit: contain;">
                    </a>
                    <a href="${product.amazon || '#'}" target="_blank" rel="noopener noreferrer" style="flex: 1; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; text-decoration: none; box-shadow: 0 1px 3px rgba(0,0,0,0.02); ${product.amazon ? '' : 'opacity:0.5; pointer-events:none;'}" title="View on Amazon">
                        <img src="images/amazonicon.png" alt="Amazon" style="height: 32px; object-fit: contain;">
                    </a>
                </div>

                <!-- Share Product Buttons -->
                <div class="share-section">
                    <div class="share-title">📤 Share this product with friends:</div>
                    <div class="share-btns-row">
                        <a href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" rel="noopener noreferrer" class="share-btn share-wa">💬 WhatsApp</a>
                        <button onclick="navigator.clipboard.writeText(location.href); alert('Product link copied to clipboard!');" class="share-btn share-copy">🔗 Copy Link</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    ensureLightboxDOM();

    const recGrid = document.getElementById('pdpRecommendedGrid');
    recGrid.innerHTML = '';
    
    let recommendations = PRODUCTS.filter(p => 
        p.category.toLowerCase().trim() === product.category.toLowerCase().trim() && p.sku !== product.sku
    );

    if (recommendations.length < 4) {
        const others = PRODUCTS.filter(p => p.sku !== product.sku && !recommendations.includes(p));
        recommendations = [...recommendations, ...others];
    }

    recommendations.slice(0, 4).forEach(rec => {
        recGrid.appendChild(createProductCard(rec));
    });
}

function setMainImage(index) {
    if (index < 0 || index >= currentProductImages.length) return;
    currentImageIndex = index;
    document.getElementById('mainPdpImg').src = currentProductImages[index];
    
    const counter = document.getElementById('imgCounter');
    if (counter) counter.textContent = `${index + 1} / ${currentProductImages.length}`;

    currentProductImages.forEach((_, i) => {
        const thumb = document.getElementById(`thumb-${i}`);
        if (thumb) {
            thumb.style.borderColor = i === index ? 'var(--app-primary)' : 'var(--border-color)';
        }
    });
}

function changeImage(direction) {
    let newIndex = currentImageIndex + direction;
    if (newIndex < 0) newIndex = currentProductImages.length - 1;
    if (newIndex >= currentProductImages.length) newIndex = 0;
    setMainImage(newIndex);
}

function ensureLightboxDOM() {
    let lb = document.getElementById('imageLightboxModal');
    if (!lb) {
        lb = document.createElement('div');
        lb.id = 'imageLightboxModal';
        lb.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 9999; display: none; align-items: center; justify-content: center;';
        lb.innerHTML = `
            <button onclick="closeLightbox()" style="position: absolute; top: 20px; right: 20px; background: #dc2626; color: #fff; border: none; border-radius: 50%; width: 44px; height: 44px; font-size: 24px; font-weight: 700; cursor: pointer; z-index: 10000; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">✕</button>
            <button onclick="lightboxChange(-1)" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); color: #fff; border: none; border-radius: 50%; width: 45px; height: 45px; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center;">❮</button>
            <button onclick="lightboxChange(1)" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); color: #fff; border: none; border-radius: 50%; width: 45px; height: 45px; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center;">❯</button>
            <img id="lightboxImg" src="" style="max-width: 90%; max-height: 85vh; object-fit: contain; border-radius: 6px;">
            <div id="lightboxCounter" style="position: absolute; bottom: 25px; color: #fff; font-size: 14px; background: rgba(0,0,0,0.6); padding: 5px 14px; border-radius: 15px;">1 / 1</div>
        `;
        document.body.appendChild(lb);

        let touchstartX = 0;
        let touchendX = 0;
        lb.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; });
        lb.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            if (touchendX < touchstartX - 50) lightboxChange(1);
            if (touchendX > touchstartX + 50) lightboxChange(-1);
        });
    }
}

openLightbox = function(index) {
    const lb = document.getElementById('imageLightboxModal');
    if (!lb) return;
    currentImageIndex = index;
    updateLightboxContent();
    lb.style.display = 'flex';
};

closeLightbox = function() {
    const lb = document.getElementById('imageLightboxModal');
    if (lb) lb.style.display = 'none';
};

lightboxChange = function(direction) {
    let newIndex = currentImageIndex + direction;
    if (newIndex < 0) newIndex = currentProductImages.length - 1;
    if (newIndex >= currentProductImages.length) newIndex = 0;
    currentImageIndex = newIndex;
    updateLightboxContent();
    setMainImage(currentImageIndex);
};

updateLightboxContent = function() {
    const imgEl = document.getElementById('lightboxImg');
    const counterEl = document.getElementById('lightboxCounter');
    if (imgEl && currentProductImages.length > 0) {
        imgEl.src = currentProductImages[currentImageIndex];
    }
    if (counterEl) {
        counterEl.textContent = `${currentImageIndex + 1} / ${currentProductImages.length}`;
    }
};

function handleInitialRoute() {
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    if (view === 'pay') {
        navigateTo({ view: 'payView', sku: params.get('sku'), price: params.get('price'), name: params.get('name') }, false);
    } else if (view === 'pdp' && params.get('sku')) {
        history.replaceState({ view: 'pdpView', sku: params.get('sku') }, '', location.href);
        renderPDP(params.get('sku'));
        navigateTo({ view: 'pdpView', sku: params.get('sku') }, false);
    } else if (view === 'category' && params.get('category')) {
        history.replaceState({ view: 'categoryView', category: params.get('category') }, '', location.href);
        navigateTo({ view: 'categoryView', category: params.get('category') }, false);
    } else if (view === 'about') {
        navigateTo({ view: 'aboutView' }, false);
    } else if (view === 'contact') {
        navigateTo({ view: 'contactView' }, false);
    } else {
        history.replaceState({ view: 'homeView' }, '', '');
    }
}

window.addEventListener('popstate', (event) => {
    if (event.state) {
        navigateTo(event.state, false);
    } else {
        handleInitialRoute();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});