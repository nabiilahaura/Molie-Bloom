/* ==========================================
   MOLIE BLOOM - JAVASCRIPT
   Keranjang, jumlah barang, dan pemesanan
========================================== */

const CART_KEY = "molieBloomCart";

// Nomor WhatsApp toko.
// GANTI dengan nomor WhatsApp toko yang sebenarnya.
// Gunakan kode negara, tanpa tanda +, spasi, atau tanda hubung.
const WHATSAPP_NUMBER = "6281234567890";

// Data produk MOLIE BLOOM
const PRODUCTS = [
    { id: "sweet-rose", name: "Sweet Rose", price: 85000 },
    { id: "sunny-day", name: "Sunny Day", price: 75000 },
    { id: "lovely-bloom", name: "Lovely Bloom", price: 100000 },
    { id: "blush-romance", name: "Blush Romance", price: 120000 },
    { id: "graduation-bloom", name: "Graduation Bloom", price: 110000 },
    { id: "dreamy-gift", name: "Dreamy Gift", price: 95000 }
];


/* ==========================================
   1. FORMAT HARGA RUPIAH
========================================== */

function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);
}


/* ==========================================
   2. AMBIL DAN SIMPAN KERANJANG
========================================== */

function getCart() {
    try {
        const savedCart = JSON.parse(
            localStorage.getItem(CART_KEY)
        );

        if (!Array.isArray(savedCart)) {
            return [];
        }

        return savedCart.filter(item =>
            item &&
            typeof item.id === "string" &&
            Number.isFinite(Number(item.price)) &&
            Number(item.price) >= 0 &&
            Number.isFinite(Number(item.quantity)) &&
            Number(item.quantity) > 0
        ).map(item => ({
            id: item.id,
            name: String(item.name || "Produk MOLIE BLOOM"),
            price: Number(item.price),
            quantity: Math.floor(Number(item.quantity))
        }));
    } catch (error) {
        console.error("Keranjang tidak dapat dibaca:", error);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCount();
        return true;
    } catch (error) {
        console.error("Keranjang tidak dapat disimpan:", error);
        showToast("Keranjang gagal disimpan. Periksa browser kamu.");
        return false;
    }
}


/* ==========================================
   3. NOTIFIKASI PASTEL
========================================== */

function showToast(message) {
    let toast = document.getElementById("molieToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "molieToast";
        toast.setAttribute("role", "status");

        Object.assign(toast.style, {
            position: "fixed",
            right: "20px",
            bottom: "20px",
            zIndex: "9999",
            maxWidth: "calc(100% - 40px)",
            padding: "14px 20px",
            background: "#657c63",
            color: "#ffffff",
            borderRadius: "14px",
            boxShadow: "0 8px 25px rgba(85,67,62,0.16)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px",
            lineHeight: "1.6",
            opacity: "0",
            transform: "translateY(10px)",
            transition: "opacity 0.25s ease, transform 0.25s ease"
        });

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    if (toast.hideTimer) {
        clearTimeout(toast.hideTimer);
    }

    toast.hideTimer = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
    }, 2500);
}


/* ==========================================
   4. JUMLAH PRODUK DI IKON KERANJANG
========================================== */

function updateCartCount() {
    const cart = getCart();

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    document.querySelectorAll("#cartCount").forEach(element => {
        element.textContent = totalQuantity;
    });
}


/* ==========================================
   5. TAMBAHKAN PRODUK KE KERANJANG
========================================== */

function addToCart(productId, productName, productPrice) {
    const product = PRODUCTS.find(item => item.id === productId);

    // Gunakan data produk yang telah ditentukan
    // agar harga tidak sembarangan diubah dari HTML.
    if (!product) {
        showToast("Maaf, produk tidak ditemukan.");
        return;
    }

    const cart = getCart();
    const existingProduct = cart.find(
        item => item.id === product.id
    );

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    if (saveCart(cart)) {
        showToast(product.name + " berhasil ditambahkan ke keranjang ♡");
    }
}


/* ==========================================
   6. TOMBOL TAMBAH KE KERANJANG
========================================== */

function setupAddToCartButtons() {
    document.querySelectorAll(".add-to-cart").forEach(button => {
        if (button.dataset.cartReady === "true") return;

        button.dataset.cartReady = "true";

        button.addEventListener("click", () => {
            const card = button.closest(".product-card");

            const productId =
                button.dataset.id ||
                (card && card.dataset.id);

            const productName =
                button.dataset.name ||
                (card && card.dataset.name);

            const productPrice =
                button.dataset.price ||
                (card && card.dataset.price);

            if (!productId) {
                showToast("ID produk belum diatur di HTML.");
                return;
            }

            addToCart(
                productId,
                productName,
                Number(productPrice)
            );
        });
    });
}


/* ==========================================
   7. UBAH JUMLAH PRODUK
========================================== */

function changeQuantity(productId, change) {
    const cart = getCart();
    const product = cart.find(item => item.id === productId);

    if (!product) return;

    product.quantity += change;

    const updatedCart = cart.filter(item => item.quantity > 0);

    if (saveCart(updatedCart)) {
        renderCart();
    }
}


/* ==========================================
   8. HAPUS PRODUK DARI KERANJANG
========================================== */

function removeFromCart(productId) {
    const cart = getCart().filter(
        item => item.id !== productId
    );

    if (saveCart(cart)) {
        renderCart();
        showToast("Produk dihapus dari keranjang.");
    }
}


/* ==========================================
   9. TAMPILKAN ISI KERANJANG
========================================== */

function renderCart() {
    const cartContainer = document.getElementById("cartItems");
    const totalElement = document.getElementById("cartTotal");
    const checkoutButton = document.getElementById("checkoutButton");

    // Halaman yang tidak memiliki elemen keranjang dilewati.
    if (!cartContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <div style="font-size: 45px; margin-bottom: 12px;">🌷</div>
                <h2>Keranjangmu Masih Kosong</h2>
                <p>Yuk, temukan buket cantik untuk momen spesialmu.</p>
                <a href="produk.html" class="btn-primary">
                    Lihat Koleksi Buket
                </a>
            </div>
        `;

        if (totalElement) {
            totalElement.textContent = formatRupiah(0);
        }

        if (checkoutButton) {
            checkoutButton.disabled = true;
        }

        return;
    }

    cartContainer.innerHTML = cart.map(item => `
        <article class="cart-item"
            style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                flex-wrap: wrap;
                padding: 20px;
                margin-bottom: 14px;
                background: #ffffff;
                border: 1px solid #eee3dc;
                border-radius: 16px;
            ">

            <div style="flex: 1; min-width: 150px;">
                <h3 style="font-size: 20px; margin-bottom: 5px;">
                    ${escapeHTML(item.name)}
                </h3>
                <p style="font-size: 13px;">
                    ${formatRupiah(item.price)} / buket
                </p>
                <p style="
                    color: #b86f83;
                    font-weight: 700;
                    margin-top: 5px;
                ">
                    Subtotal: ${formatRupiah(item.price * item.quantity)}
                </p>
            </div>

            <div style="
                display: flex;
                align-items: center;
                gap: 10px;
            ">
                <button
                    type="button"
                    class="quantity-button"
                    data-action="decrease"
                    data-id="${escapeHTML(item.id)}"
                    aria-label="Kurangi jumlah ${escapeHTML(item.name)}"
                    style="${quantityButtonStyle()}">−</button>

                <strong>${item.quantity}</strong>

                <button
                    type="button"
                    class="quantity-button"
                    data-action="increase"
                    data-id="${escapeHTML(item.id)}"
                    aria-label="Tambah jumlah ${escapeHTML(item.name)}"
                    style="${quantityButtonStyle()}">+</button>
            </div>

            <button
                type="button"
                data-action="remove"
                data-id="${escapeHTML(item.id)}"
                style="
                    border: none;
                    background: #f9e9ec;
                    color: #b86f83;
                    padding: 9px 13px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                ">
                Hapus
            </button>
        </article>
    `).join("");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    if (totalElement) {
        totalElement.textContent = formatRupiah(total);
    }

    if (checkoutButton) {
        checkoutButton.disabled = false;
    }
}

function quantityButtonStyle() {
    return `
        width: 34px;
        height: 34px;
        border: none;
        border-radius: 50%;
        background: #e9eee4;
        color: #657c63;
        font-size: 19px;
        font-weight: 700;
        cursor: pointer;
    `;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


/* ==========================================
   10. TOMBOL KURANG, TAMBAH, DAN HAPUS
========================================== */

function setupCartActions() {
    const cartContainer = document.getElementById("cartItems");

    if (!cartContainer || cartContainer.dataset.actionsReady === "true") {
        return;
    }

    cartContainer.dataset.actionsReady = "true";

    cartContainer.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const productId = button.dataset.id;
        const action = button.dataset.action;

        if (action === "increase") {
            changeQuantity(productId, 1);
        } else if (action === "decrease") {
            changeQuantity(productId, -1);
        } else if (action === "remove") {
            removeFromCart(productId);
        }
    });
}


/* ==========================================
   11. KOSONGKAN KERANJANG
========================================== */


function setupClearCartButton() {
    const clearButton = document.getElementById("clearCartButton");
    const modal = document.getElementById("clearCartModal");
    const cancelButton = document.getElementById("cancelClearCart");
    const confirmButton = document.getElementById("confirmClearCart");

    if (
        !clearButton ||
        !modal ||
        !cancelButton ||
        !confirmButton ||
        clearButton.dataset.ready === "true"
    ) {
        return;
    }

    clearButton.dataset.ready = "true";

    // Buka popup custom
    clearButton.addEventListener("click", () => {
        const cart = getCart();

        if (cart.length === 0) {
            showToast("Keranjang sudah kosong.");
            return;
        }

        modal.classList.add("show");
    });

    // Batalkan penghapusan
    cancelButton.addEventListener("click", () => {
        modal.classList.remove("show");
    });

    // Hapus seluruh isi keranjang jika dikonfirmasi
    confirmButton.addEventListener("click", () => {
        if (saveCart([])) {
            renderCart();
            showToast("Keranjang berhasil dikosongkan.");
        }

        modal.classList.remove("show");
    });

    // Tutup popup jika area luar diklik
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("show");
        }
    });

    // Tutup popup dengan tombol Escape
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            modal.classList.remove("show");
        }
    });
}



/* ==========================================
   12. CHECKOUT MELALUI WHATSAPP
========================================== */

function checkoutWhatsApp() {
    const cart = getCart();

    if (cart.length === 0) {
        showToast("Tambahkan buket ke keranjang terlebih dahulu.");
        return;
    }

    if (
        !/^\d{10,15}$/.test(WHATSAPP_NUMBER) ||
        WHATSAPP_NUMBER === "6281234567890"
    ) {
        showToast("Atur nomor WhatsApp toko di file script.js terlebih dahulu.");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    let message = "Halo MOLIE BLOOM! 🌷\n";
    message += "Saya ingin memesan buket berikut:\n\n";

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   Jumlah: ${item.quantity}\n`;
        message += `   Harga: ${formatRupiah(item.price)}\n`;
        message += `   Subtotal: ${formatRupiah(item.price * item.quantity)}\n\n`;
    });

    message += `TOTAL SEMENTARA: ${formatRupiah(total)}\n\n`;
    message += "Mohon informasi mengenai ketersediaan produk, ongkir, dan cara pembayaran. Terima kasih! ♡";

    const whatsappURL =
        "https://wa.me/" + WHATSAPP_NUMBER +
        "?text=" + encodeURIComponent(message);

    // Keranjang tidak dihapus otomatis.
    // Pesanan belum dianggap berhasil sampai dikonfirmasi toko.
    window.open(whatsappURL, "_blank", "noopener,noreferrer");
}

function setupCheckoutButton() {
    const checkoutButton = document.getElementById("checkoutButton");

    if (!checkoutButton || checkoutButton.dataset.ready === "true") return;

    checkoutButton.dataset.ready = "true";

    checkoutButton.addEventListener("click", checkoutWhatsApp);
}


/* ==========================================
   13. TAHUN OTOMATIS DI FOOTER
========================================== */

function updateYear() {
    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}


/* ==========================================
   14. JALANKAN FITUR SAAT HALAMAN DIBUKA
========================================== */

function initializeMolieBloom() {
    updateCartCount();
    setupAddToCartButtons();
    setupCartActions();
    setupClearCartButton();
    setupCheckoutButton();
    renderCart();
    updateYear();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMolieBloom);
} else {
    initializeMolieBloom();
}
