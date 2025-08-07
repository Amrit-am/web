// cart.js - ensures cart is loaded and rendered on cart.html

document.addEventListener('DOMContentLoaded', function() {
    // Always use latest cart from localStorage in renderCartItems
    if (typeof renderCartItems === 'function') renderCartItems();
});
