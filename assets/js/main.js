/**
 * WEBMARKET CORE SCRIPT - ENTERPRISE VERSION
 * Tích hợp: Auth, Cart, Checkout QR, Skeleton Load, Sorting, Scroll Animation, Toast
 */
const App = {
    // ==========================================
    // 1. STATE & DỮ LIỆU SẢN PHẨM
    // ==========================================
    state: {
        cart: [],
        currentCategory: 'all',
        searchQuery: '',
        sortBy: 'newest',
        currentUser: null,
        usersDB: []
    },

    products: [
        {
            id: 1, name: "Feane - Giao diện Nhà hàng cao cấp", category: "shop", price: 29,
            sales: 145, rating: 4.8, author: "ThemeOcean",
            image: "https://themewagon.com/wp-content/uploads/2021/10/feane-1.png",
            shortDesc: "Giao diện website nhà hàng, quán ăn hiện đại và bắt mắt.",
            desc: "Mẫu website chuyên nghiệp với bố cục rõ ràng, giúp làm nổi bật các món ăn. Tích hợp sẵn các section cho Menu, Đặt bàn, và Thông tin liên hệ. Thích hợp cho mọi nhà hàng sang trọng.", 
            tech: ["HTML5", "CSS3", "JavaScript"],
            features: ["Tối ưu hiển thị hình ảnh", "Giao diện dễ tùy chỉnh", "Responsive 100%"],
            demoUrl: "templates_demo/feane/index.html"
        },
        {
            id: 2, name: "Organic - Cửa hàng Thực phẩm sạch", category: "shop", price: 39,
            sales: 320, rating: 4.9, author: "EcoThemes",
            image: "https://themewagon.com/wp-content/uploads/2024/09/Organic-1200x736.webp",
            shortDesc: "Giao diện cửa hàng bán thực phẩm sạch, nông sản hữu cơ.",
            desc: "Mang lại cảm giác tươi mát, thân thiện với thiên nhiên. Phù hợp cho các cửa hàng tạp hóa, siêu thị mini hoặc farmstay bán nông sản sạch. Tích hợp sẵn UI giỏ hàng.", 
            tech: ["HTML5", "Bootstrap", "JavaScript"],
            features: ["Hiển thị lưới sản phẩm đẹp", "Thân thiện với người dùng", "Tốc độ load siêu tốc"],
            demoUrl: "templates_demo/organic/index.html"
        },
        { 
            id: 3, name: "Sneat - Admin Dashboard Template", category: "admin", price: 49,
            sales: 1250, rating: 5.0, author: "ProCoder",
            image: "https://themewagon.com/wp-content/uploads/2024/09/FoodMart-1200x736.webp",
            shortDesc: "Giao diện trang quản trị hiện đại, thanh lịch và đầy đủ tính năng.",
            desc: "Sneat là một trong những mẫu Admin Dashboard được yêu thích nhất. Cung cấp sẵn hàng trăm UI components, biểu đồ, bảng dữ liệu giúp bạn xây dựng hệ thống backend dễ dàng và chuyên nghiệp.", 
            tech: ["HTML5", "Bootstrap 5", "SCSS"],
            features: ["Thiết kế UI/UX xuất sắc", "Nhiều layout có sẵn", "Tài liệu hướng dẫn chi tiết"], 
            demoUrl: "templates_demo/FoodMart-1.0.0/index.html"
        }
    ],

    // ==========================================
    // 2. KHỞI TẠO ỨNG DỤNG (ROUTER)
    // ==========================================
    init() {
        this.initProductsDB();
        this.initAuth();
        this.loadCart();
        this.initTheme();
        this.bindGlobalEvents();

        // Tự động nhận diện đang ở trang nào để chạy logic tương ứng
        if (document.getElementById('product-grid')) this.initHomePage();
        if (document.getElementById('product-detail-container')) this.initProductPage();
        if (document.getElementById('demo-frame')) this.initDemoPage();
        if (document.getElementById('cart-items-container')) this.renderCartPage();
    },

    initProductsDB() {
        try {
            const savedProducts = localStorage.getItem('webmarket_products');
            if (savedProducts) {
                // Nếu đã có data trong LocalStorage thì lấy ra dùng
                this.products = JSON.parse(savedProducts);
            } else {
                // Lần đầu tiên vào web, lưu 3 sản phẩm mẫu vào LocalStorage
                localStorage.setItem('webmarket_products', JSON.stringify(this.products));
            }
        } catch (e) {
            console.error("Lỗi đọc Database Sản phẩm");
        }
    },

    // ==========================================
    // 3. UI/UX UTILITIES (TOAST, THEME)
    // ==========================================
    showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed bottom-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-rose-500';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation';
        
        toast.className = `${bgColor} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 translate-x-full opacity-0 pointer-events-auto`;
        toast.innerHTML = `<i class="fa-solid ${icon} text-xl"></i> <span class="font-medium">${message}</span>`;
        container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.remove('translate-x-full', 'opacity-0'));
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    initTheme() {
        const htmlClass = document.documentElement.classList;
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            htmlClass.add('dark');
        } else {
            htmlClass.remove('dark');
        }
    },

    bindGlobalEvents() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            });
        }
    },

    // ==========================================
    // 4. AUTH MODULE (ĐĂNG NHẬP / ĐĂNG KÝ)
    // ==========================================
    initAuth() {
        try { this.state.usersDB = JSON.parse(localStorage.getItem('webmarket_users')) || []; } catch (e) { this.state.usersDB = []; }
        try { this.state.currentUser = JSON.parse(localStorage.getItem('webmarket_session')); } catch (e) { this.state.currentUser = null; }
        this.renderAuthMenu();
    },

    saveUsersDB() { localStorage.setItem('webmarket_users', JSON.stringify(this.state.usersDB)); },
    saveSession() {
        if(this.state.currentUser) localStorage.setItem('webmarket_session', JSON.stringify(this.state.currentUser));
        else localStorage.removeItem('webmarket_session');
        this.renderAuthMenu();
    },

    renderAuthMenu() {
        const container = document.getElementById('auth-menu-container');
        if (!container) return;

        if (this.state.currentUser) {
            container.innerHTML = `
                <div class="relative group cursor-pointer">
                    <div class="flex items-center gap-2">
                        <div class="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                            ${this.state.currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <span class="text-sm font-semibold text-slate-800 dark:text-slate-200 hidden md:block">${this.state.currentUser.name}</span>
                    </div>
                    
                    <!-- Dropdown cố định góc phải -->
                    <div class="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 z-[100] overflow-hidden">
                        <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <p class="text-xs text-slate-500">Đăng nhập với</p>
                            <p class="text-sm font-bold text-slate-900 dark:text-white truncate">${this.state.currentUser.email}</p>
                        </div>
                        <a href="add-product.html" class="flex items-center gap-2 px-4 py-3 text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"><i class="fa-solid fa-cloud-arrow-up w-5 text-center"></i> Đăng bán giao diện</a>
                        <button onclick="App.logout()" class="w-full flex items-center gap-2 text-left px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-medium transition-colors"><i class="fa-solid fa-right-from-bracket w-5 text-center"></i> Đăng xuất</button>
                    </div>
                </div>`;
        } else {
            container.innerHTML = `
                <button onclick="App.showAuthModal('login')" class="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors mr-2">Đăng nhập</button>
                <button onclick="App.showAuthModal('register')" class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg hover:-translate-y-0.5 transition-all">Đăng ký</button>
            `;
        }
    },

    showAuthModal(type = 'login') {
        const existingModal = document.getElementById('auth-modal');
        if(existingModal) existingModal.remove();

        const isLogin = type === 'login';
        const title = isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới';
        const btnText = isLogin ? 'Đăng nhập' : 'Đăng ký';
        const switchText = isLogin ? 'Chưa có tài khoản? <a href="#" onclick="App.showAuthModal(\'register\')" class="text-indigo-600 font-bold hover:underline">Đăng ký ngay</a>' : 'Đã có tài khoản? <a href="#" onclick="App.showAuthModal(\'login\')" class="text-indigo-600 font-bold hover:underline">Đăng nhập</a>';
        const nameField = isLogin ? '' : `<div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Họ và tên</label><input type="text" id="auth-name" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"></div>`;

        const modalHtml = `
            <div id="auth-modal" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="document.getElementById('auth-modal').remove()"></div>
                <div class="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all border border-slate-100 dark:border-slate-700">
                    <button onclick="document.getElementById('auth-modal').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-xl"></i></button>
                    <div class="text-center mb-6"><h3 class="text-2xl font-extrabold text-slate-900 dark:text-white">${title}</h3></div>
                    <form onsubmit="event.preventDefault(); App.handleAuthSubmit('${type}')" class="space-y-4">
                        ${nameField}
                        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label><input type="email" id="auth-email" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"></div>
                        <div><label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mật khẩu</label><input type="password" id="auth-password" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"></div>
                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg mt-2">${btnText}</button>
                    </form>
                    <p class="text-center text-sm text-slate-500 mt-6">${switchText}</p>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    handleAuthSubmit(type) {
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;

        if (type === 'register') {
            const name = document.getElementById('auth-name').value.trim();
            if (this.state.usersDB.some(u => u.email === email)) return this.showToast('Email này đã được đăng ký!', 'error');

            const newUser = { id: Date.now(), name, email, password };
            this.state.usersDB.push(newUser);
            this.saveUsersDB();
            
            this.state.currentUser = { id: newUser.id, name: newUser.name, email: newUser.email };
            this.saveSession();
            this.showToast('Đăng ký thành công!', 'success');
        } else {
            const user = this.state.usersDB.find(u => u.email === email && u.password === password);
            if (user) {
                this.state.currentUser = { id: user.id, name: user.name, email: user.email };
                this.saveSession();
                this.showToast(`Chào mừng ${user.name} trở lại!`, 'success');
            } else {
                return this.showToast('Email hoặc mật khẩu không chính xác!', 'error');
            }
        }
        document.getElementById('auth-modal')?.remove();
    },

    logout() {
        this.state.currentUser = null;
        this.saveSession();
        this.showToast('Đã đăng xuất', 'success');
    },

    // ==========================================
    // 5. CART & CHECKOUT MODULE
    // ==========================================
    loadCart() {
        try { this.state.cart = JSON.parse(localStorage.getItem('theme_cart')) || []; } catch (e) { this.state.cart = []; }
        this.updateCartBadge();
    },
    saveCart() {
        localStorage.setItem('theme_cart', JSON.stringify(this.state.cart));
        this.updateCartBadge();
    },

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        if (!this.state.cart.some(item => item.id === productId)) {
            this.state.cart.push(product);
            this.saveCart();
            this.showToast(`Đã thêm ${product.name} vào giỏ!`, 'success');
        } else {
            this.showToast(`Sản phẩm đã có trong giỏ hàng!`, 'error');
        }
    },

    removeFromCart(productId) {
        this.state.cart = this.state.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.showToast('Đã xóa sản phẩm', 'success');
        if (document.getElementById('cart-items-container')) this.renderCartPage();
    },

    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            badge.innerText = this.state.cart.length;
            badge.classList.add('animate-bounce');
            setTimeout(() => badge.classList.remove('animate-bounce'), 1000);
        }
    },

    renderCartPage() {
        const container = document.getElementById('cart-items-container');
        if (!container) return;
        const subtotalEl = document.getElementById('subtotal-price');
        const totalEl = document.getElementById('total-price');

        if (this.state.cart.length === 0) {
            container.innerHTML = `<div class="text-center py-16"><div class="bg-slate-100 dark:bg-slate-700/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"><i class="fa-solid fa-cart-shopping text-4xl text-slate-400 dark:text-slate-500"></i></div><h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Giỏ hàng trống</h3><a href="index.html" class="inline-block mt-4 bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">Tiếp tục khám phá</a></div>`;
            subtotalEl.innerText = `$0`; totalEl.innerText = `$0`;
            return;
        }

        let total = 0;
        container.innerHTML = this.state.cart.map(item => {
            total += item.price;
            return `<div class="flex items-center gap-6 py-6 border-b border-slate-100 dark:border-slate-700 last:border-0"><img src="${item.image}" alt="${item.name}" class="w-32 h-20 object-cover rounded-lg shadow-sm"><div class="flex-1"><h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1"><a href="product.html?id=${item.id}" class="hover:text-indigo-600 transition-colors">${item.name}</a></h3><p class="text-sm text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded inline-block uppercase">${item.category}</p></div><div class="font-bold text-slate-900 dark:text-white text-xl w-24 text-right">$${item.price}</div><button onclick="App.removeFromCart(${item.id})" class="text-slate-400 hover:text-red-500 w-10 h-10 rounded-full flex items-center justify-center transition-colors"><i class="fa-solid fa-trash-can"></i></button></div>`;
        }).join('');

        subtotalEl.innerText = `$${total}`; totalEl.innerText = `$${total}`;
        
        // Sự kiện click nút Thanh toán
        const checkoutBtn = document.getElementById('checkout-btn');
        if(checkoutBtn) {
            checkoutBtn.onclick = () => {
                if(total === 0) return this.showToast('Giỏ hàng trống!', 'error');
                if(!this.state.currentUser) {
                    this.showToast('Vui lòng đăng nhập để thanh toán!', 'error');
                    return this.showAuthModal('login');
                }
                this.showCheckoutModal(total);
            };
        }
    },

    showCheckoutModal(totalPrice) {
        const modalHtml = `
            <div id="checkout-modal" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="document.getElementById('checkout-modal').remove()"></div>
                <div class="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all text-center border border-slate-100 dark:border-slate-700">
                    <button onclick="document.getElementById('checkout-modal').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-xl"></i></button>
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Thanh toán an toàn</h3>
                    <p class="text-slate-500 mb-6">Quét mã QR để thanh toán tổng cộng <span class="font-bold text-indigo-600">$${totalPrice}</span></p>
                    <div class="bg-white p-4 rounded-xl border-2 border-dashed border-slate-200 inline-block mb-6">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PaymentDemo$${totalPrice}" alt="QR Code" class="w-48 h-48">
                    </div>
                    <button onclick="App.processPayment()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2"><i class="fa-solid fa-check-circle"></i> Tôi đã chuyển khoản</button>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    processPayment() {
        document.getElementById('checkout-modal')?.remove();
        this.showToast('Thanh toán thành công! Mã nguồn đã gửi vào mail.', 'success');
        this.state.cart = [];
        this.saveCart();
        this.renderCartPage();
    },

    // ==========================================
    // 6. HOME PAGE (TÌM KIẾM, LỌC, SẮP XẾP, SKELETON)
    // ==========================================
    initHomePage() {
        this.fetchAndRenderProducts();
        
        let searchTimeout;
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.addEventListener('input', (e) => { 
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => { this.state.searchQuery = e.target.value.trim().toLowerCase(); this.fetchAndRenderProducts(); }, 300);
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('bg-white', 'text-slate-900', 'dark:bg-slate-700', 'dark:text-white', 'shadow-sm'); b.classList.add('text-slate-600', 'dark:text-slate-400'); });
                e.target.classList.remove('text-slate-600', 'dark:text-slate-400');
                e.target.classList.add('bg-white', 'text-slate-900', 'dark:bg-slate-700', 'dark:text-white', 'shadow-sm');
                this.state.currentCategory = e.target.dataset.cat;
                this.fetchAndRenderProducts();
            });
        });

        const sortSelect = document.getElementById('sort-select');
        if(sortSelect) sortSelect.addEventListener('change', (e) => { this.state.sortBy = e.target.value; this.fetchAndRenderProducts(); });
    },

    fetchAndRenderProducts() {
        const grid = document.getElementById('product-grid');
        if (!grid) return;
        
        // Hiện Skeleton Loader giả lập đang tải API
        grid.innerHTML = Array(3).fill(0).map(() => `<div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm animate-pulse flex flex-col gap-4"><div class="w-full aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-xl"></div><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div><div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div><div class="mt-auto pt-4 flex justify-between"><div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div><div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div></div></div>`).join('');

        setTimeout(() => {
            let filtered = this.products.filter(p => (this.state.currentCategory === 'all' || p.category === this.state.currentCategory) && p.name.toLowerCase().includes(this.state.searchQuery));
            filtered.sort((a, b) => {
                if(this.state.sortBy === 'price-asc') return a.price - b.price;
                if(this.state.sortBy === 'price-desc') return b.price - a.price;
                if(this.state.sortBy === 'popular') return b.sales - a.sales;
                return b.id - a.id;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `<div class="col-span-full text-center py-20 text-slate-500 text-lg flex flex-col items-center gap-4"><i class="fa-solid fa-folder-open text-4xl opacity-50"></i> Không tìm thấy mẫu web nào.</div>`;
                return;
            }

            grid.innerHTML = filtered.map((p, index) => {
                let stars = '<i class="fa-solid fa-star"></i>'.repeat(Math.floor(p.rating)) + (p.rating % 1 !== 0 ? '<i class="fa-solid fa-star-half-stroke"></i>' : '');
                return `<div class="reveal-item opacity-0 translate-y-8 transition-all duration-700 ease-out group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-2xl hover:-translate-y-2 overflow-hidden flex flex-col" style="transition-delay: ${index * 100}ms"><div class="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700"><img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"><div class="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]"><a href="demo.html?id=${p.id}" class="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold shadow-xl hover:bg-indigo-50 transition-colors text-sm transform hover:scale-105">Xem Demo</a></div></div><div class="p-5 flex-1 flex flex-col"><div class="flex justify-between items-center mb-3"><span class="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">${p.category}</span><span class="text-xs text-slate-500 font-medium flex items-center gap-1.5"><i class="fa-solid fa-fire text-orange-500"></i> ${p.sales} Đã bán</span></div><h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1"><a href="product.html?id=${p.id}" class="hover:text-indigo-600 transition-colors">${p.name}</a></h3><p class="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 flex-1">${p.shortDesc}</p><div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center"><span class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">$${p.price}</span><div class="flex gap-2"><a href="product.html?id=${p.id}" class="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 w-10 h-10 rounded-full flex items-center justify-center transition-colors"><i class="fa-solid fa-arrow-right -rotate-45"></i></a><button onclick="App.addToCart(${p.id})" class="bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/30"><i class="fa-solid fa-cart-plus"></i></button></div></div></div></div>`;
            }).join('');
            
            // Scroll Animation Observer
            const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('opacity-0', 'translate-y-8'); observer.unobserve(entry.target); }}); }, { threshold: 0.1 });
            document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));
        }, 600);
    },

    // ==========================================
    // 7. TRANG CHI TIẾT SẢN PHẨM & SẢN PHẨM LIÊN QUAN
    // ==========================================
    initProductPage() {
        const id = parseInt(new URLSearchParams(window.location.search).get('id'));
        const p = this.products.find(x => x.id === id);
        if (!p) { window.location.href = 'index.html'; return; }
        document.title = `${p.name} - WebMarket`;

        const headerContainer = document.getElementById('product-header');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <nav class="text-sm text-slate-500 mb-4 flex gap-2 items-center">
                    <a href="index.html" class="hover:text-indigo-600"><i class="fa-solid fa-house"></i></a>
                    <span><i class="fa-solid fa-chevron-right text-[10px]"></i></span><span class="uppercase">${p.category}</span>
                    <span><i class="fa-solid fa-chevron-right text-[10px]"></i></span><span class="text-slate-800 dark:text-slate-200 font-medium">${p.name}</span>
                </nav>
                <h1 class="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">${p.name}</h1>
                <p class="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">${p.shortDesc}</p>
            `;
        }

        const bodyContainer = document.getElementById('product-detail-container');
        if (bodyContainer) {
            // Render Sản phẩm liên quan
            const related = this.products.filter(item => item.category === p.category && item.id !== p.id).slice(0, 3);
            let relatedHTML = '';
            if(related.length > 0) {
                relatedHTML = `<div class="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8"><h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Sản phẩm cùng thể loại</h3><div class="grid grid-cols-1 sm:grid-cols-3 gap-6">` + 
                    related.map(item => `<a href="product.html?id=${item.id}" class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"><div class="h-32 overflow-hidden bg-slate-100 dark:bg-slate-700"><img src="${item.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></div><div class="p-4 flex-1 flex flex-col justify-between"><h4 class="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 mb-2">${item.name}</h4><div class="text-indigo-600 dark:text-indigo-400 font-extrabold">$${item.price}</div></div></a>`).join('') 
                + `</div></div>`;
            }

            const featuresHTML = p.features.map(f => `<li class="flex items-start gap-3 mb-3"><i class="fa-solid fa-circle-check text-emerald-500 mt-1"></i> <span>${f}</span></li>`).join('');
            const techHTML = p.tech.map(t => `<span class="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded text-sm border border-slate-200 dark:border-slate-600">${t}</span>`).join('');
            let stars = '<i class="fa-solid fa-star"></i>'.repeat(Math.floor(p.rating)) + (p.rating % 1 !== 0 ? '<i class="fa-solid fa-star-half-stroke"></i>' : '');

            bodyContainer.innerHTML = `
                <div class="lg:w-2/3 space-y-8">
                    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 shadow-sm overflow-hidden">
                        <img src="${p.image}" class="w-full h-auto rounded-lg border border-slate-100 dark:border-slate-700">
                        <div class="p-4 flex gap-4"><a href="demo.html?id=${p.id}" class="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 flex-1 transition-colors"><i class="fa-solid fa-desktop"></i> Live Preview</a></div>
                    </div>
                    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8 shadow-sm">
                        <h2 class="text-2xl font-bold mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">Về mẫu giao diện này</h2>
                        <div class="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"><p>${p.desc}</p></div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div><h3 class="text-lg font-bold mb-4 text-slate-900 dark:text-white">Tính năng chính</h3><ul class="text-slate-600 dark:text-slate-400">${featuresHTML}</ul></div>
                            <div><h3 class="text-lg font-bold mb-4 text-slate-900 dark:text-white">Công nghệ</h3><div class="flex flex-wrap gap-2">${techHTML}</div></div>
                        </div>
                    </div>
                    ${relatedHTML}
                </div>
                <div class="lg:w-1/3">
                    <div class="sticky top-24 space-y-6">
                        <div class="bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-900 shadow-xl overflow-hidden relative">
                            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                            <div class="p-6">
                                <div class="flex justify-between items-end mb-6"><span class="text-slate-500">Tiêu chuẩn</span><span class="text-4xl font-extrabold text-slate-900 dark:text-white">$${p.price}</span></div>
                                <ul class="text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-3">
                                    <li class="flex items-center gap-2"><i class="fa-solid fa-check text-indigo-500 w-4"></i> Kiểm duyệt chất lượng</li>
                                    <li class="flex items-center gap-2"><i class="fa-solid fa-check text-indigo-500 w-4"></i> Cập nhật miễn phí</li>
                                    <li class="flex items-center gap-2"><i class="fa-solid fa-check text-indigo-500 w-4"></i> Hỗ trợ 6 tháng</li>
                                </ul>
                                <button onclick="App.addToCart(${p.id})" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg flex justify-center items-center gap-2 transition-all shadow-md"><i class="fa-solid fa-cart-shopping"></i> Thêm vào giỏ</button>
                            </div>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                            <div class="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                                <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">${p.author.charAt(0)}</div>
                                <div><div class="font-bold text-slate-900 dark:text-white">${p.author}</div><div class="text-xs text-slate-500">Thành viên Elite</div></div>
                            </div>
                            <div class="flex justify-between items-center text-sm mb-3"><span class="text-slate-500"><i class="fa-solid fa-cart-arrow-down w-5"></i> Lượt bán</span><span class="font-bold">${p.sales}</span></div>
                            <div class="flex justify-between items-center text-sm"><span class="text-slate-500"><i class="fa-solid fa-star w-5"></i> Đánh giá</span><span class="text-amber-400 flex items-center gap-1">${stars} <span class="text-slate-800 dark:text-slate-200 font-bold ml-1">${p.rating}</span></span></div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // ==========================================
    // 8. TRANG DEMO
    // ==========================================
    initDemoPage() {
        const id = parseInt(new URLSearchParams(window.location.search).get('id'));
        const p = this.products.find(x => x.id === id);
        if (!p) { window.location.href = 'index.html'; return; }
        
        document.getElementById('demo-title').innerText = p.name; 
        document.title = `Live Demo - ${p.name}`;
        
        const iframe = document.getElementById('demo-frame');
        iframe.onload = () => { 
            const overlay = document.getElementById('loader-overlay'); 
            if(overlay) { overlay.style.opacity = '0'; setTimeout(() => overlay.style.display = 'none', 500); } 
        };
        iframe.src = p.demoUrl;
        
        const buyBtn = document.getElementById('buy-btn');
        if(buyBtn) buyBtn.addEventListener('click', () => this.addToCart(p.id));
    }
};

// Khởi chạy App khi HTML tải xong
document.addEventListener('DOMContentLoaded', () => App.init());