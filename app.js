let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

const API_URL = 'http://localhost:5000/api/products';



// Fetch products from MongoDB and render on main page
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
    // Only run cart-related functions on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        renderCartItems();
    }
    // Only run order-related functions on order.html
    if (window.location.pathname.includes('order.html')) {
        renderOrders();
    }
});

async function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    // Fetch products from backend
    try {
        const res = await fetch(API_URL);
        products = await res.json();
    } catch (e) {
        grid.innerHTML = '<div class="col">Failed to load products.</div>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="col">
            <div class="card h-100 cursor-pointer">
                <img src="${product.imageUrl || 'assets/images/' + (product.image || 'hero.jpg')}" 
                     class="product-image card-img-top"
                     data-product-id="${product._id}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="text-primary fw-bold">$${product.price}</p>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.product-image').forEach(img => {
        img.addEventListener('click', () => showProductDetail(img.dataset.productId));
    });
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        const removedItem = cart.splice(index, 1)[0];
        updateLocalStorage();
        updateCartCount();
        renderCartItems();
        showToast(`${removedItem.name} removed from cart`);
    }
}


async function showProductDetail(productId) {
    const product = products.find(p => p._id === productId) || products.find(p => p._id == productId);
    const similarProducts = products.filter(p => p._id !== productId);
    const grid = document.getElementById('product-grid');
    const detailContainer = document.getElementById('product-detail-container');

    if (!grid || !detailContainer || !product) return;

    grid.classList.add('d-none');
    detailContainer.classList.remove('d-none');
    
    detailContainer.innerHTML = `
        <div class="row">
            <div class="col-12 mb-4">
                <img src="${product.imageUrl || 'assets/images/' + (product.image || 'hero.jpg')}" 
                     class="img-fluid w-100" 
                     style="max-height: 60vh; object-fit: contain;">
            </div>
            <div class="col-12 mb-4">
                <h4>${product.name}</h4>
                <p class="lead">${product.description || ''}</p>
                <p class="text-primary fw-bold">$${product.price}</p>
                <button class="btn btn-primary mt-3" onclick="showQuantityModal('${product._id}')">Add to Cart</button>
            </div>
            <div class="col-12">
                <h5>Similar Products</h5>
                <div class="d-flex flex-nowrap overflow-x-auto gap-3">
                    ${similarProducts.map(p => `
                        <div class="flex-shrink-0" style="width: 200px;">
                            <img src="${p.imageUrl || 'assets/images/' + (p.image || 'hero.jpg')}" 
                                 class="img-fluid cursor-pointer"
                                 style="height: 200px; object-fit: cover;"
                                 data-product-id="${p._id}">
                            <p class="text-primary fw-bold mt-2">$${p.price}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="col-12 mt-4">
                <button class="btn btn-outline-primary" onclick="hideProductDetail()">
                    Back to Products
                </button>
            </div>
        </div>
        <div class="modal fade" id="quantityModal" tabindex="-1" aria-labelledby="quantityModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="quantityModalLabel">Select Quantity</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body d-flex align-items-center justify-content-center gap-3">
                <button class="btn btn-outline-secondary" id="qty-minus">-</button>
                <input type="number" id="qty-input" class="form-control text-center" value="1" min="1" style="width:60px;">
                <button class="btn btn-outline-secondary" id="qty-plus">+</button>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" id="addQtyToCart">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
    `;

    detailContainer.querySelectorAll('img[data-product-id]').forEach(img => {
        img.addEventListener('click', () => showProductDetail(img.dataset.productId));
    });
    // Modal logic
    window.showQuantityModal = function(productId) {
        let qty = 1;
        const modal = new bootstrap.Modal(document.getElementById('quantityModal'));
        document.getElementById('qty-input').value = 1;
        document.getElementById('qty-minus').onclick = function() {
            qty = Math.max(1, parseInt(document.getElementById('qty-input').value) - 1);
            document.getElementById('qty-input').value = qty;
        };
        document.getElementById('qty-plus').onclick = function() {
            qty = parseInt(document.getElementById('qty-input').value) + 1;
            document.getElementById('qty-input').value = qty;
        };
        document.getElementById('qty-input').oninput = function() {
            qty = Math.max(1, parseInt(this.value) || 1);
            this.value = qty;
        };
        document.getElementById('addQtyToCart').onclick = function() {
            addToCart(productId, qty);
            modal.hide();
        };
        modal.show();
    }
}


function addToCart(productId, quantity = 1) {
    const product = products.find(p => p._id === productId || p._id == productId);
    if (product) {
        let cartData = JSON.parse(localStorage.getItem('cart')) || [];
        // Always use _id for matching, but store all needed fields for cart.html
        let cartItem = cartData.find(item => item._id === product._id);
        if (cartItem) {
            cartItem.quantity = (cartItem.quantity || 1) + quantity;
        } else {
            cartData.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl || (product.image ? 'assets/images/' + product.image : 'assets/images/hero.jpg'),
                quantity: quantity
            });
        }
        localStorage.setItem('cart', JSON.stringify(cartData));
        cart = cartData;
        updateCartCount();
        if (typeof renderCartPreview === 'function') renderCartPreview();
        showToast(`${product.name} added to cart!`);
    }
}


function updateLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Add this to handle page visibility changes
window.addEventListener('pageshow', function(event) {
    // Update cart count when returning to page
    updateCartCount();
    
    // Force reload if coming from checkout page
    if (event.persisted || performance.navigation.type === 2) {
        updateCartCount();
        renderProducts();
    }
});

// Modify the updateCartCount function to handle cross-page updates
function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        // Always get fresh cart data from localStorage
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        countElement.textContent = currentCart.length;
    }
}


function hideProductDetail() {
    const grid = document.getElementById('product-grid');
    const detailContainer = document.getElementById('product-detail-container');
    if (grid && detailContainer) {
        grid.classList.remove('d-none');
        detailContainer.classList.add('d-none');
    }
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    // Always get the latest cart from localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    container.innerHTML = currentCart.map((item, index) => `
        <div class="cart-item mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                    <h5 class="mb-0">${item.name}</h5>
                    <div class="input-group input-group-sm" style="width:120px;">
                        <button class="btn btn-outline-secondary" type="button" onclick="updateCartQuantity(${index}, -1)">-</button>
                        <input type="text" class="form-control text-center" value="${item.quantity || 1}" readonly style="max-width:40px;">
                        <button class="btn btn-outline-secondary" type="button" onclick="updateCartQuantity(${index}, 1)">+</button>
                    </div>
                    <button onclick="removeFromCart(${index})" 
                            class="btn btn-danger btn-sm"
                            aria-label="Remove item">
                        &times;
                    </button>
                </div>
                <p class="mb-0">$${(item.price * (item.quantity || 1)).toFixed(2)}</p>
            </div>
        </div>
    `).join('');
    const total = currentCart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const totalElement = document.getElementById('total');
    if (totalElement) totalElement.textContent = total.toFixed(2);
}

// Allow user to update quantity in cart
function updateCartQuantity(index, delta) {
    // Always use the latest cart from localStorage
    let currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (index >= 0 && index < currentCart.length) {
        currentCart[index].quantity = (currentCart[index].quantity || 1) + delta;
        if (currentCart[index].quantity < 1) currentCart[index].quantity = 1;
        localStorage.setItem('cart', JSON.stringify(currentCart));
        renderCartItems();
        updateCartCount();
    }
}
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center">
                <span class="me-3">${message}</span>
                <button class="btn btn-link text-white py-0" 
                        onclick="hideProductDetail()"
                        aria-label="Back to products">
                    ← Back
                </button>
            </div>
            <button type="button" 
                    class="btn-close btn-close-white me-2 m-auto" 
                    data-bs-dismiss="toast"
                    aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    bsToast.show();
}




document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
    // Only run cart-related functions on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        renderCartItems();
    }
    // Only run order-related functions on order.html
    if (window.location.pathname.includes('order.html')) {
        renderOrders();
    }
});

// --- ORDER SUBMISSION (for checkout.html) ---
async function submitOrder() {
    if (!cart.length) {
        alert('Your cart is empty!');
        return;
    }
    const name = document.getElementById('name')?.value || '';
    const address = document.getElementById('address')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const paymentOption = document.getElementById('payment-option')?.value || '';
    if (!name || !address || !email || !paymentOption) {
        alert('Please fill in all required fields.');
        return;
    }
    const order = {
        customer: { name, address, email },
        items: cart,
        paymentOption,
        createdAt: new Date().toISOString(),
        status: 'Pending'
    };
    try {
        const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        if (!res.ok) throw new Error('Order failed');
        cart = [];
        updateLocalStorage();
        updateCartCount();
        if (typeof renderCartPreview === 'function') renderCartPreview();
        alert('Order placed successfully!');
        window.location.href = 'main.html';
    } catch (err) {
        alert('Order failed: ' + err.message);
    }
}

// --- RENDER ORDERS (for order.html) ---
async function renderOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;
    try {
        const res = await fetch('http://localhost:5000/api/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const orders = await res.json();
        list.innerHTML = '';
        if (!orders.length) {
            list.innerHTML = '<tr><td colspan="5">No orders found.</td></tr>';
            return;
        }
        orders.forEach((order, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order._id || idx + 1}</td>
                <td>${order.customer?.name || 'Unknown'}</td>
                <td>${order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</td>
                <td>${order.items?.length || 0}</td>
                <td><span class="badge bg-warning status-badge">${order.status || 'Pending'}</span></td>
            `;
            list.appendChild(tr);
        });
    } catch (err) {
        list.innerHTML = '<tr><td colspan="5" class="text-danger">Failed to load orders.</td></tr>';
    }
}

// App.js

