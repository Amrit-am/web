function checkAdminAuth() {
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isAdmin) {
        new bootstrap.Modal(document.getElementById('authModal')).show();
    }
}

function verifyAdmin() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.reload();
    } else {
        alert('Invalid credentials!');
    }
}

function logoutAdmin() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
}

function handleImageSelect(event) {
    const file = event.target.files[0];
    previewImage(file);
}

function previewImage(file) {
    const preview = document.getElementById('imagePreview');
    const reader = new FileReader();

    reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" class="image-preview shadow-sm" alt="Product preview">`;
    };

    if (file) reader.readAsDataURL(file);
}
