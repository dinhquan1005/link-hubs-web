/**
 * WEBMARKET CORE SCRIPT - ULTIMATE VERSION
 * Tích hợp: Auth, Cart, Checkout, Wishlist, Purchases, Reviews, Dashboard
 */
const App = {
    state: {
        cart: [],
        currentCategory: 'all',
        searchQuery: '',
        sortBy: 'newest',
        currentUser: null,
        usersDB: [],
        productsDB: [] // Thay thế mảng products cứng bằng DB có thể thay đổi
    },

    // Dữ liệu gốc (Chỉ nạp lần đầu nếu DB trống)
    defaultProducts: [
        { id: 1, name: "Feane - Giao diện Nhà hàng cao cấp", category: "shop", price: 29, sales: 145, rating: 5, reviews: [], author: "ThemeOcean", image: "https://themewagon.com/wp-content/uploads/2021/10/feane-1.png", shortDesc: "Giao diện website nhà hàng hiện đại.", desc: "Mẫu website chuyên nghiệp với bố cục rõ ràng...", tech: ["HTML5", "CSS3", "JavaScript"], features: ["Tối ưu hình ảnh", "Responsive 100%"], demoUrl: "templates_demo/feane/index.html" },
        { id: 2, name: "Organic - Cửa hàng Thực phẩm sạch", category: "shop", price: 39, sales: 320, rating: 5, reviews: [], author: "EcoThemes", image: "https://themewagon.com/wp-content/uploads/2024/09/Organic-1200x736.webp", shortDesc: "Giao diện bán thực phẩm sạch, nông sản.", desc: "Mang lại cảm giác tươi mát...", tech: ["HTML5", "Bootstrap"], features: ["Lưới sản phẩm đẹp", "Tốc độ siêu tốc"], demoUrl: "templates_demo/organic/index.html" },
        { id: 3, name: "Sneat - Admin Dashboard Template", category: "admin", price: 49, sales: 1250, rating: 5, reviews: [], author: "ProCoder", image: "https://themewagon.com/wp-content/uploads/2024/09/FoodMart-1200x736.webp", shortDesc: "Giao diện trang quản trị hiện đại.", desc: "Sneat là mẫu Admin Dashboard được yêu thích nhất...", tech: ["HTML5", "Bootstrap 5", "SCSS"], features: ["UI/UX xuất sắc", "Nhiều layout"], demoUrl: "templates_demo/FoodMart-1.0.0/index.html" }
    ],

    init() {
        this.initDB();
        this.initAuth();
        this.loadCart();
        this.initTheme();
        this.bindGlobalEvents();

        if (document.getElementById('product-grid')) this.initHomePage();
        if (document.getElementById('product-detail-container')) this.initProductPage();
        if (document.getElementById('demo-frame')) this.initDemoPage();
        if (document.getElementById('cart-items-container')) this.renderCartPage();
        if (document.getElementById('vendor-dashboard')) this.initDashboard();
        if (document.getElementById('account-content')) this.initPurchasesPage();
    },

    initDB() {
        try {
            const savedProducts = localStorage.getItem('webmarket_products');
            this.state.productsDB = savedProducts ? JSON.parse(savedProducts) : this.defaultProducts;
            if(!savedProducts) localStorage.setItem('webmarket_products', JSON.stringify(this.state.productsDB));
        } catch (e) { this.state.productsDB = this.defaultProducts; }
    },

    saveProductsDB() {
        localStorage.setItem('webmarket_products', JSON.stringify(this.state.productsDB));
    },

    showToast(message, type = 'success') {
        let container = document.getElementById('toast-container') || Object.assign(document.createElement('div'), { id: 'toast-container', className: 'fixed bottom-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none' });
        if(!document.getElementById('toast-container')) document.body.appendChild(container);

        const toast = document.createElement('div');
        toast.className = `${type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 translate-x-full opacity-0 pointer-events-auto`;
        toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'} text-xl"></i> <span class="font-medium">${message}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.remove('translate-x-full', 'opacity-0'));
        setTimeout(() => { toast.classList.add('translate-x-full', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
    },

    initTheme() { /* Giữ nguyên logic theme */ 
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark');
    },

    bindGlobalEvents() {
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        });
    },

    // ==========================================
    // MODULE: AUTH & USER DATA (Wishlist, Purchases)
    // ==========================================
    initAuth() {
        try { this.state.usersDB = JSON.parse(localStorage.getItem('webmarket_users')) || []; } catch(e) { this.state.usersDB = []; }
        try { this.state.currentUser = JSON.parse(localStorage.getItem('webmarket_session')); } catch(e) { this.state.currentUser = null; }
        this.renderAuthMenu();
    },

    saveUsersDB() { localStorage.setItem('webmarket_users', JSON.stringify(this.state.usersDB)); },
    saveSession() {
        if(this.state.currentUser) {
            // Cập nhật lại user hiện tại vào DB
            const index = this.state.usersDB.findIndex(u => u.id === this.state.currentUser.id);
            if(index !== -1) this.state.usersDB[index] = this.state.currentUser;
            localStorage.setItem('webmarket_session', JSON.stringify(this.state.currentUser));
            this.saveUsersDB();
        } else {
            localStorage.removeItem('webmarket_session');
        }
        this.renderAuthMenu();
    },

    renderAuthMenu() {
        const container = document.getElementById('auth-menu-container');
        if (!container) return;
        if (this.state.currentUser) {
            container.innerHTML = `
                <div class="relative group cursor-pointer">
                    <div class="flex items-center gap-2">
                        <div class="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">${this.state.currentUser.name.charAt(0).toUpperCase()}</div>
                    </div>
                    <div class="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] overflow-hidden">
                        <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <p class="text-xs text-slate-500">Xin chào,</p><p class="text-sm font-bold text-slate-900 dark:text-white truncate">${this.state.currentUser.name}</p>
                        </div>
                        <a href="dashboard.html" class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"><i class="fa-solid fa-chart-line w-5"></i> Quản lý Shop</a>
                        <a href="purchases.html" class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"><i class="fa-solid fa-box-open w-5"></i> Đơn hàng đã mua</a>
                        <a href="add-product.html" class="flex items-center gap-2 px-4 py-2.5 text-sm text-indigo-600 font-bold hover:bg-slate-50 transition-colors"><i class="fa-solid fa-cloud-arrow-up w-5"></i> Đăng bán code</a>
                        <button onclick="App.logout()" class="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 font-medium transition-colors"><i class="fa-solid fa-right-from-bracket w-5"></i> Đăng xuất</button>
                    </div>
                </div>`;
        } else {
            container.innerHTML = `<button onclick="App.showAuthModal('login')" class="hidden sm:block text-sm font-semibold text-slate-600 hover:text-indigo-600 mr-2">Đăng nhập</button><button onclick="App.showAuthModal('register')" class="bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">Đăng ký</button>`;
        }
    },

    showAuthModal(type = 'login') {
        /* Giữ nguyên UI Popup đăng nhập/đăng ký của phiên bản trước */
        const existingModal = document.getElementById('auth-modal');
        if(existingModal) existingModal.remove();
        const isLogin = type === 'login';
        const modalHtml = `
            <div id="auth-modal" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="document.getElementById('auth-modal').remove()"></div>
                <div class="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-8 transform transition-all shadow-2xl">
                    <button onclick="document.getElementById('auth-modal').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-xl"></i></button>
                    <h3 class="text-2xl font-extrabold text-center mb-6">${isLogin ? 'Đăng nhập' : 'Đăng ký'}</h3>
                    <form onsubmit="event.preventDefault(); App.handleAuthSubmit('${type}')" class="space-y-4">
                        ${!isLogin ? `<div><label class="block text-sm font-medium mb-1">Họ tên</label><input type="text" id="auth-name" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5"></div>` : ''}
                        <div><label class="block text-sm font-medium mb-1">Email</label><input type="email" id="auth-email" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5"></div>
                        <div><label class="block text-sm font-medium mb-1">Mật khẩu</label><input type="password" id="auth-password" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5"></div>
                        <button type="submit" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-2">${isLogin ? 'Đăng nhập' : 'Đăng ký'}</button>
                    </form>
                    <p class="text-center text-sm mt-6 cursor-pointer text-indigo-600 font-bold" onclick="App.showAuthModal('${isLogin ? 'register' : 'login'}')">${isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}</p>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    handleAuthSubmit(type) {
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        if (type === 'register') {
            const name = document.getElementById('auth-name').value.trim();
            if (this.state.usersDB.some(u => u.email === email)) return this.showToast('Email đã tồn tại!', 'error');
            // THÊM: wishlist và purchases vào User Object
            const newUser = { id: Date.now(), name, email, password, wishlist: [], purchases: [] };
            this.state.usersDB.push(newUser);
            this.state.currentUser = newUser;
            this.showToast('Đăng ký thành công!', 'success');
        } else {
            const user = this.state.usersDB.find(u => u.email === email && u.password === password);
            if (user) {
                this.state.currentUser = user;
                this.showToast(`Chào mừng ${user.name}!`, 'success');
            } else return this.showToast('Sai email hoặc mật khẩu!', 'error');
        }
        this.saveSession();
        document.getElementById('auth-modal')?.remove();
        if(document.getElementById('product-grid')) this.fetchAndRenderProducts(); // Render lại tim wishlist
    },
    logout() { this.state.currentUser = null; this.saveSession(); this.showToast('Đã đăng xuất', 'success'); setTimeout(()=>window.location.reload(), 500); },

    // ==========================================
    // MODULE: WISHLIST (YÊU THÍCH)
    // ==========================================
    toggleWishlist(productId) {
        if (!this.state.currentUser) return this.showAuthModal('login');
        const list = this.state.currentUser.wishlist;
        const index = list.indexOf(productId);
        if (index === -1) {
            list.push(productId);
            this.showToast('Đã thêm vào danh sách yêu thích!', 'success');
        } else {
            list.splice(index, 1);
            this.showToast('Đã bỏ thích!', 'success');
        }
        this.saveSession();
        // Cập nhật lại UI nút thả tim
        const btn = document.getElementById(`wishlist-btn-${productId}`);
        if(btn) {
            btn.innerHTML = `<i class="fa-${list.includes(productId) ? 'solid text-rose-500' : 'regular text-slate-400'} fa-heart"></i>`;
        }
    },

    // ==========================================
    // MODULE: CART & CHECKOUT
    // ==========================================
    loadCart() { try { this.state.cart = JSON.parse(localStorage.getItem('theme_cart')) || []; } catch (e) { this.state.cart = []; } this.updateCartBadge(); },
    saveCart() { localStorage.setItem('theme_cart', JSON.stringify(this.state.cart)); this.updateCartBadge(); },
    addToCart(productId) {
        const p = this.state.productsDB.find(x => x.id === productId);
        if(!p) return;
        
        // Đã sửa lỗi thiếu dấu ngoặc nhọn ở đây
        if(this.state.currentUser && (this.state.currentUser.purchases || []).includes(productId)) {
            return this.showToast('Bạn đã mua sản phẩm này rồi!', 'error');
        }
        
        if (!this.state.cart.some(item => item.id === productId)) { 
            this.state.cart.push(p); 
            this.saveCart(); 
            this.showToast(`Đã thêm ${p.name}!`, 'success'); 
        } else {
            this.showToast(`Đã có trong giỏ hàng!`, 'error');
        }
    },
    buyNow(productId) {
        this.addToCart(productId);
        // Đợi 0.6 giây cho người dùng nhìn thấy thông báo Toast rồi mới chuyển trang
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 600);
    },
    removeFromCart(productId) { this.state.cart = this.state.cart.filter(i => i.id !== productId); this.saveCart(); if (document.getElementById('cart-items-container')) this.renderCartPage(); },
    updateCartBadge() { const badge = document.getElementById('cart-badge'); if (badge) { badge.innerText = this.state.cart.length; badge.classList.add('animate-bounce'); setTimeout(() => badge.classList.remove('animate-bounce'), 1000); } },

    renderCartPage() { /* Giữ nguyên logic renderCartPage */
        const container = document.getElementById('cart-items-container');
        if(!container) return;
        if (this.state.cart.length === 0) {
            container.innerHTML = `<div class="text-center py-16"><h3 class="text-xl font-bold mb-2">Giỏ hàng trống</h3><a href="index.html" class="inline-block mt-4 bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium">Tiếp tục khám phá</a></div>`;
            document.getElementById('subtotal-price').innerText = '$0'; document.getElementById('total-price').innerText = '$0'; return;
        }
        let total = 0;
        container.innerHTML = this.state.cart.map(item => {
            total += item.price;
            return `<div class="flex items-center gap-6 py-4 border-b"><img src="${item.image}" class="w-24 rounded-lg"><div class="flex-1 font-bold">${item.name}</div><div class="font-bold text-lg">$${item.price}</div><button onclick="App.removeFromCart(${item.id})" class="text-red-500"><i class="fa-solid fa-trash"></i></button></div>`;
        }).join('');
        document.getElementById('subtotal-price').innerText = `$${total}`; document.getElementById('total-price').innerText = `$${total}`;
        document.getElementById('checkout-btn').onclick = () => {
            if(!this.state.currentUser) return this.showAuthModal('login');
            this.showCheckoutModal(total);
        };
    },

    showCheckoutModal(totalPrice) {
        // Xóa modal cũ nếu có
        document.getElementById('checkout-modal')?.remove();
        
        // API tạo mã QR tự động dựa trên số tiền
        const qrUrl = `https://quickchart.io/qr?text=ThanhToan_${totalPrice}_USD&size=200`;
        
        const modalHtml = `
        <div id="checkout-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-md text-center shadow-2xl border border-slate-100 dark:border-slate-700 transform transition-all">
                <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Thanh toán an toàn</h3>
                <p class="text-slate-500 mb-6">Quét mã QR để thanh toán <span class="text-indigo-600 dark:text-indigo-400 font-black text-xl">$${totalPrice}</span></p>
                
                <div class="bg-white p-4 rounded-2xl border-2 border-dashed border-indigo-200 inline-block mb-6 shadow-sm relative">
                    <img src="${qrUrl}" alt="QR Code" class="w-48 h-48 mx-auto">
                    <div class="absolute inset-0 bg-indigo-500/10 pointer-events-none rounded-xl"></div>
                </div>
                
                <button onclick="App.processPayment()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2 transform hover:-translate-y-1">
                    <i class="fa-solid fa-check-circle text-xl"></i> Xác nhận chuyển khoản
                </button>
                
                <button onclick="document.getElementById('checkout-modal').remove()" class="mt-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors text-sm">
                    Hủy giao dịch
                </button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    processPayment() {
        if (!this.state.currentUser.purchases) this.state.currentUser.purchases = [];
        // CHUYỂN CART VÀO LỊCH SỬ MUA HÀNG (PURCHASES)
        this.state.cart.forEach(item => {
            if(!this.state.currentUser.purchases.includes(item.id)) {
                this.state.currentUser.purchases.push(item.id);
                // Tăng lượt bán cho Tác giả
                const p = this.state.productsDB.find(x => x.id === item.id);
                if(p) p.sales += 1;
            }
        });
        this.saveProductsDB(); // Lưu lại lượt bán mới
        this.saveSession();    // Lưu lại purchases mới của user
        this.state.cart = [];
        this.saveCart();
        document.getElementById('checkout-modal')?.remove();
        this.showToast('Thanh toán thành công! Vào Đơn hàng để xem source code.', 'success');
        setTimeout(() => window.location.href = 'purchases.html', 1500);
    },

    // ==========================================
    // MODULE: HOME & WISHLIST RENDER
    // ==========================================
    initHomePage() {
        this.fetchAndRenderProducts();
        document.getElementById('search-input')?.addEventListener('input', (e) => { this.state.searchQuery = e.target.value.trim().toLowerCase(); this.fetchAndRenderProducts(); });
        document.getElementById('sort-select')?.addEventListener('change', (e) => { this.state.sortBy = e.target.value; this.fetchAndRenderProducts(); });
    },

    fetchAndRenderProducts() {
        const grid = document.getElementById('product-grid');
        if (!grid) return;
        let filtered = this.state.productsDB.filter(p => p.name.toLowerCase().includes(this.state.searchQuery));
        filtered.sort((a, b) => this.state.sortBy === 'popular' ? b.sales - a.sales : b.id - a.id);

        grid.innerHTML = filtered.map(p => {
            const isLiked = this.state.currentUser && (this.state.currentUser.wishlist || []).includes(p.id);
            const heartIcon = isLiked ? 'fa-solid text-rose-500' : 'fa-regular text-slate-400';
            
            return `
            <div class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col relative">
                <button id="wishlist-btn-${p.id}" onclick="App.toggleWishlist(${p.id})" class="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"><i class="${heartIcon} fa-heart"></i></button>
                <div class="relative aspect-[4/3] bg-slate-100"><img src="${p.image}" class="w-full h-full object-cover"><a href="demo.html?id=${p.id}" class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span class="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm">Xem Demo</span></a></div>
                <div class="p-5 flex-1 flex flex-col">
                    <div class="text-xs text-slate-500 mb-2 font-bold uppercase">${p.category} | ${p.sales} Lượt bán</div>
                    <h3 class="text-lg font-bold mb-2 line-clamp-1"><a href="product.html?id=${p.id}">${p.name}</a></h3>
                    <div class="mt-auto pt-4 border-t flex justify-between items-center"><span class="text-2xl font-black">$${p.price}</span><button onclick="App.addToCart(${p.id})" class="bg-indigo-600 text-white w-10 h-10 rounded-full"><i class="fa-solid fa-cart-plus"></i></button></div>
                </div>
            </div>`;
        }).join('');
    },

    // ==========================================
    // MODULE: PRODUCT DETAIL & REVIEWS
    // ==========================================
    initProductPage() {
        const id = parseInt(new URLSearchParams(window.location.search).get('id'));
        const p = this.state.productsDB.find(x => x.id === id);
        if (!p) return;
        
        document.getElementById('product-title').innerText = p.name;
        document.getElementById('product-price').innerText = `$${p.price}`;
        document.getElementById('product-image').src = p.image;
        document.getElementById('product-desc').innerHTML = p.desc;
        
        // Sự kiện cho 2 nút
        const btnAddCart = document.getElementById('btn-add-cart');
        if (btnAddCart) btnAddCart.onclick = () => this.addToCart(p.id);
        
        // THÊM DÒNG NÀY:
        const btnBuyNow = document.getElementById('btn-buy-now');
        if (btnBuyNow) btnBuyNow.onclick = () => this.buyNow(p.id);
        
        this.renderReviews(p);
    },
    renderReviews(product) {
        const revContainer = document.getElementById('reviews-list');
        if(!revContainer) return;
        if(!product.reviews || product.reviews.length === 0) {
            revContainer.innerHTML = `<p class="text-slate-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>`;
        } else {
            revContainer.innerHTML = product.reviews.map(r => `
                <div class="border-b border-slate-100 pb-4 mb-4">
                    <div class="flex items-center gap-2 mb-1"><div class="font-bold">${r.userName}</div><div class="text-amber-400 text-xs">${'<i class="fa-solid fa-star"></i>'.repeat(r.rating)}</div></div>
                    <p class="text-slate-600">${r.comment}</p>
                </div>
            `).join('');
        }

        // Logic Submit Review
        document.getElementById('review-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            if(!this.state.currentUser) return this.showAuthModal('login');
            // Kiểm tra phải MUA rồi mới được đánh giá
            if(!this.state.currentUser.purchases.includes(product.id)) return this.showToast('Bạn phải mua sản phẩm mới được đánh giá!', 'error');

            const rating = parseInt(document.getElementById('review-rating').value);
            const comment = document.getElementById('review-comment').value;
            
            if(!product.reviews) product.reviews = [];
            product.reviews.push({ userId: this.state.currentUser.id, userName: this.state.currentUser.name, rating, comment, date: new Date().toLocaleDateString() });
            
            // Tính lại sao trung bình
            product.rating = (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1);
            this.saveProductsDB();
            this.showToast('Đã gửi đánh giá!', 'success');
            setTimeout(() => window.location.reload(), 1000);
        });
    },

    // ==========================================
    // MODULE: DASHBOARD (VENDOR)
    // ==========================================
    initDashboard() {
        if(!this.state.currentUser) { window.location.href = 'index.html'; return; }
        // Lọc ra các sản phẩm do User này đăng
        const myProducts = this.state.productsDB.filter(p => p.author === this.state.currentUser.name);
        
        const totalSales = myProducts.reduce((sum, p) => sum + p.sales, 0);
        const totalRevenue = myProducts.reduce((sum, p) => sum + (p.sales * p.price), 0);

        document.getElementById('dash-revenue').innerText = `$${totalRevenue}`;
        document.getElementById('dash-sales').innerText = totalSales;
        document.getElementById('dash-items').innerText = myProducts.length;

        const table = document.getElementById('dash-table-body');
        if(table) {
            table.innerHTML = myProducts.map(p => `
                <tr class="border-b">
                    <td class="py-3 px-4 font-bold">${p.name}</td>
                    <td class="py-3 px-4">$${p.price}</td>
                    <td class="py-3 px-4">${p.sales}</td>
                    <td class="py-3 px-4 text-emerald-600 font-bold">$${p.sales * p.price}</td>
                </tr>
            `).join('');
        }
    },
    // ==========================================
    // MODULE: TÀI KHOẢN (Lịch sử mua & Wishlist)
    // ==========================================
    initPurchasesPage() {
        if(!this.state.currentUser) { window.location.href = 'index.html'; return; }
        
        // Gắn sự kiện cho 2 nút Tab
        document.getElementById('tab-purchases')?.addEventListener('click', () => this.renderAccountTab('purchases'));
        document.getElementById('tab-wishlist')?.addEventListener('click', () => this.renderAccountTab('wishlist'));
        
        // Mặc định load tab mua hàng
        this.renderAccountTab('purchases');
    },

    renderAccountTab(tabName) {
        const container = document.getElementById('account-content');
        if(!container) return;
        
        // UI: Đổi màu tab đang active
        document.getElementById('tab-purchases').className = `px-6 py-3 font-bold rounded-xl transition-all ${tabName === 'purchases' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`;
        document.getElementById('tab-wishlist').className = `px-6 py-3 font-bold rounded-xl transition-all ${tabName === 'wishlist' ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-50'}`;

        const ids = tabName === 'purchases' ? (this.state.currentUser.purchases || []) : (this.state.currentUser.wishlist || []);
        const items = this.state.productsDB.filter(p => ids.includes(p.id));

        if(items.length === 0) {
            container.innerHTML = `<div class="text-center py-20 bg-white border border-slate-200 dark:border-slate-700 rounded-2xl"><i class="fa-solid fa-folder-open text-6xl text-slate-300 dark:text-slate-600 mb-4"></i><p class="text-slate-500 mb-6">Chưa có sản phẩm nào ở đây.</p><a href="index.html" class="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors">Khám phá ngay</a></div>`;
            return;
        }

        if(tabName === 'purchases') {
            container.innerHTML = `<div class="space-y-4">` + items.map(p => `
                <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-center gap-5 w-full md:w-auto">
                        <div class="w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700"><img src="${p.image}" class="w-full h-full object-cover"></div>
                        <div>
                            <h3 class="font-bold text-lg text-slate-900 dark:text-white"><a href="product.html?id=${p.id}" class="hover:text-indigo-600">${p.name}</a></h3>
                            <p class="text-sm text-slate-500 mt-1">Tác giả: <span class="font-semibold text-slate-700 dark:text-slate-300">${p.author}</span></p>
                        </div>
                    </div>
                    <div class="flex gap-3 w-full md:w-auto">
                        <a href="product.html?id=${p.id}" class="flex-1 md:flex-none text-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-5 py-3 rounded-xl font-bold transition-colors">Đánh giá</a>
                        <button onclick="App.downloadSource(${p.id})" class="flex-1 md:flex-none text-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl font-bold transition-colors shadow-lg"><i class="fa-solid fa-download mr-1"></i> Tải Source</button>
                    </div>
                </div>
            `).join('') + `</div>`;
        } else {
            // Hiển thị dạng Grid cho Wishlist
            container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">` + items.map(p => `
                <div class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col relative">
                    <button onclick="App.toggleWishlist(${p.id}); setTimeout(()=>App.renderAccountTab('wishlist'), 100)" class="absolute top-3 right-3 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"><i class="fa-solid text-rose-500 fa-heart"></i></button>
                    <div class="relative aspect-[4/3] bg-slate-100"><img src="${p.image}" class="w-full h-full object-cover"><a href="product.html?id=${p.id}" class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span class="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm">Xem Chi Tiết</span></a></div>
                    <div class="p-5 flex-1 flex flex-col">
                        <h3 class="text-lg font-bold mb-2 line-clamp-1"><a href="product.html?id=${p.id}" class="hover:text-indigo-600 text-slate-900 dark:text-white">${p.name}</a></h3>
                        <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center"><span class="text-2xl font-black text-slate-900 dark:text-white">$${p.price}</span><button onclick="App.addToCart(${p.id})" class="bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-full transition-colors"><i class="fa-solid fa-cart-plus"></i></button></div>
                    </div>
                </div>
            `).join('') + `</div>`;
        }
    },
    // ==========================================
    // MODULE: TRANG DEMO
    // ==========================================
    initDemoPage() {
        const id = parseInt(new URLSearchParams(window.location.search).get('id'));
        // Lưu ý: Đổi thành this.state.productsDB thay vì this.products như bản cũ
        const p = this.state.productsDB.find(x => x.id === id);
        
        if (!p) { 
            window.location.href = 'index.html'; 
            return; 
        }
        
        const titleEl = document.getElementById('demo-title');
        if (titleEl) titleEl.innerText = p.name; 
        document.title = `Live Demo - ${p.name}`;
        
        const iframe = document.getElementById('demo-frame');
        if (iframe) {
            iframe.onload = () => { 
                const overlay = document.getElementById('loader-overlay'); 
                if(overlay) { 
                    overlay.style.opacity = '0'; 
                    setTimeout(() => overlay.style.display = 'none', 500); 
                } 
            };
            iframe.src = p.demoUrl;
        }
        
        const buyBtn = document.getElementById('buy-btn');
        if(buyBtn) buyBtn.onclick = () => this.addToCart(p.id);
    },
    // HÀM XỬ LÝ TẢI FILE SOURCE MỚI
    // HÀM TẢI SOURCE CODE THÔNG MINH (ĐÃ SỬA LỖI)
    downloadSource(productId) {
        const p = this.state.productsDB.find(x => x.id === productId);
        if (!p || !p.downloadUrl) {
            this.showToast('Sản phẩm này không có link tải hoặc file đính kèm!', 'error');
            return;
        }

        const url = p.downloadUrl;

        // TRƯỜNG HỢP 1: Nếu là link ngoài (bắt đầu bằng http/https)
        if (url.startsWith('http')) {
            this.showToast('Đang chuyển hướng đến link tải ngoài...', 'success');
            setTimeout(() => {
                window.open(url, '_blank');
            }, 800);
        } 
        // TRƯỜNG HỢP 2: Nếu là file ZIP nội bộ (do server xử lý)
        else {
            this.showToast('Đang bắt đầu tải Source Code...', 'success');
            const link = document.createElement('a');
            link.href = url;
            // Ép trình duyệt tải về thay vì mở file
            link.setAttribute('download', `SourceCode_${p.id}.zip`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());