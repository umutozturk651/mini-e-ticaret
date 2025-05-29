// SEPET VERİSİ
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// SAYFA YÜKLENDİĞİNDE
document.addEventListener('DOMContentLoaded', function() {
    // Ana sayfa ise
    if (document.getElementById('products-container')) {
        setupAddToCartButtons();
        setupCategoryFilters();
        updateCartCount();
    }
    
    // Sepet sayfası ise
    if (document.getElementById('cart-items')) {
        renderCart();
        setupCartEvents();
        setupCheckoutButton();
    }
});

// SEPETE EKLE BUTONLARI
function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productElement = this.closest('.product');
            const productId = parseInt(productElement.getAttribute('data-id'));
            const productName = productElement.querySelector('.product-title').textContent;
            const productPrice = parseFloat(
                productElement.querySelector('.product-price').textContent.replace('₺', '')
            );
            const productImage = productElement.querySelector('.product-img').src;
            const productCategory = productElement.getAttribute('data-category');

            addToCart({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                category: productCategory
            });
        });
    });
}

// SEPETE EKLEME FONKSİYONU
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    alert(`${product.name} sepete eklendi!`);
}

// SEPET SAYFASINI RENDER ET
function renderCart() {
    const container = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">Sepetiniz boş</div>';
        checkoutBtn.disabled = true;
        updateCartSummary(); // Boş sepette toplamları sıfırla
        return;
    }

    container.innerHTML = '';
    checkoutBtn.disabled = false;
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.name}</h3>
                <div class="cart-item-price">₺${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(cartItem);
    });

    updateCartSummary(); // Sepet değiştiğinde toplamları güncelle
}

// SEPET ETKİNLİKLERİ
function setupCartEvents() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('minus') || e.target.closest('.minus')) {
            const btn = e.target.classList.contains('minus') ? e.target : e.target.closest('.minus');
            updateQuantity(parseInt(btn.getAttribute('data-id')), -1);
        } 
        else if (e.target.classList.contains('plus') || e.target.closest('.plus')) {
            const btn = e.target.classList.contains('plus') ? e.target : e.target.closest('.plus');
            updateQuantity(parseInt(btn.getAttribute('data-id')), 1);
        } 
        else if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
            const btn = e.target.classList.contains('remove-btn') ? e.target : e.target.closest('.remove-btn');
            removeFromCart(parseInt(btn.getAttribute('data-id')));
        }
    });
}

// MİKTAR GÜNCELLEME
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity < 1) item.quantity = 1;
        
        saveCart();
        renderCart();
        updateCartCount();
    }0
}

// SEPETTEN KALDIRMA
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    updateCartCount();
}

// ÖDEME BUTONU
function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Sepetiniz boş, ödeme yapamazsınız!');
                return;
            }
            
            // Sipariş detaylarını hazırla
            const orderDetails = cart.map(item => 
                `${item.name} (${item.quantity} x ₺${item.price.toFixed(2)})`
            ).join('\n');
            
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = 9.90;
            const total = subtotal + shipping;
            
            // Ödeme başarılı mesajı
            alert(`ÖDEME BAŞARILI!\n\nSipariş Detayları:\n${orderDetails}\n\nAra Toplam: ₺${subtotal.toFixed(2)}\nKargo: ₺${shipping.toFixed(2)}\nToplam: ₺${total.toFixed(2)}\n\nTeşekkür ederiz!`);
            
            // Sepeti temizle
            cart = [];
            saveCart();
            updateCartCount();
            
            // Ana sayfaya yönlendir
            window.location.href = 'index.html';
        });
    }
}

// SEPET ÖZETİNİ GÜNCELLE
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 9.90;
    const total = subtotal + shipping;
    
    // Elementleri kontrol et
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const headerTotalElement = document.getElementById('cart-total-header');
    
    if (subtotalElement) subtotalElement.textContent = `₺${subtotal.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `₺${total.toFixed(2)}`;
    if (headerTotalElement) headerTotalElement.textContent = `₺${total.toFixed(2)}`;
}

// SEPETİ KAYDET
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// SEPET SAYACINI GÜNCELLE
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const countElements = document.querySelectorAll('#cart-count');
    
    countElements.forEach(el => {
        el.textContent = count;
    });
}

// KATEGORİ FİLTRELEME
function setupCategoryFilters() {
    document.querySelectorAll('.category').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.category').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            filterProducts(category);
        });
    });
}

// ÜRÜN FİLTRELEME
function filterProducts(category) {
    const products = document.querySelectorAll('.product');
    
    products.forEach(product => {
        if (category === 'all' || product.getAttribute('data-category') === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}