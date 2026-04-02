/**
 * WEBMARKET CORE SCRIPT - ULTIMATE PRO MAX
 */
const App = {
    state: {
        cart: [], currentCategory: 'all', searchQuery: '', currentUser: null, productsDB: [], activityDB: [], usersDB: []
    },

    init() {
        this.initAuth(); this.loadCart(); this.initTheme(); this.bindGlobalEvents();
        this.loadDataFromServer();
    },

    async loadDataFromServer() {
        try {
            const grid = document.getElementById('product-grid');
            if(grid) grid.innerHTML = `<div class="col-span-1 md:col-span-3 text-center py-20 text-slate-500 font-bold"><i class="fa-solid fa-spinner fa-spin fa-2x mb-3 block"></i> Đang tải dữ liệu Pro Max từ Server...</div>`;
            
            const response = await fetch('/api/get-all-data');
            const result = await response.json();
            
            if (result.success) {
                this.state.productsDB = result.products;
                this.state.activityDB = result.activities;
                
                // Khởi tạo các trang dựa trên ID phần tử
                if(document.getElementById('product-grid')) this.fetchAndRenderProducts();
                if(document.getElementById('activity-feed')) this.renderActivityFeed();
                if(document.getElementById('product-detail-container') && typeof this.initProductPage === 'function') this.initProductPage();
                if(document.getElementById('cart-items-container')) this.renderCartPage();
                if(document.getElementById('admin-layout')) this.initAdmin();
                if(document.getElementById('account-content')) this.initPurchasesPage();
                if(document.getElementById('demo-frame')) this.initDemoPage();
            }
        } catch (error) { this.showToast('Lỗi kết nối Server Database!', 'error'); }
    },
    // ==========================================
    // MODULE: QUICK VIEW DEMO (BẬT POPUP TẠI CHỖ)
    // ==========================================
    showDemoModal(productId) {
        const p = this.state.productsDB.find(x => x.id === productId);
        if (!p) return;
        document.getElementById('demo-modal')?.remove();
        
        // Chuẩn hóa đường dẫn
        const finalDemoUrl = p.demoUrl.startsWith('http') ? p.demoUrl : '/' + p.demoUrl;

        const modalHtml = `
        <div id="demo-modal" class="fixed inset-0 z-[9999] flex flex-col bg-slate-900/90 backdrop-blur-2xl animate-fadeIn" oncontextmenu="return false;">
            <div class="h-16 bg-slate-950 flex items-center justify-between px-4 sm:px-6 border-b border-slate-800 shadow-xl flex-shrink-0">
                <div class="flex items-center gap-4 text-white">
                    <button onclick="document.getElementById('demo-modal').remove()" class="w-10 h-10 bg-slate-800 hover:bg-rose-500 rounded-full flex items-center justify-center transition-colors shadow-md">
                        <i class="fa-solid fa-arrow-left text-lg"></i>
                    </button>
                    <h3 class="font-black text-lg truncate max-w-md hidden sm:block">${p.name} <span class="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30"><i class="fa-solid fa-lock"></i> Protected</span></h3>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="App.buyNow(${p.id})" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5">
                        <i class="fa-solid fa-cart-shopping"></i> Mua Ngay (${p.price}$)
                    </button>
                </div>
            </div>

            <div class="relative flex-1 w-full bg-white dark:bg-[#0b0f19]">
                <div id="demo-loader" class="absolute inset-0 bg-[#0b0f19] flex flex-col items-center justify-center z-10 transition-opacity duration-500">
                    <div class="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p class="text-white font-bold text-lg">Đang trích xuất mã nguồn bảo mật...</p>
                </div>
                
                <iframe 
                    src="${finalDemoUrl}" 
                    onload="document.getElementById('demo-loader').style.opacity = '0'; setTimeout(()=>document.getElementById('demo-loader').style.display='none', 500);"
                    class="w-full h-full border-none bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                ></iframe>
                
                <div class="absolute inset-0 z-20 pointer-events-none" style="box-shadow: inset 0 0 50px rgba(0,0,0,0.5);"></div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    // ==========================================
    // MODULE AUTH & USER
    // ==========================================
    initAuth() {
        try { this.state.usersDB = JSON.parse(localStorage.getItem('webmarket_users')) || []; } catch(e) { this.state.usersDB = []; }
        try { this.state.currentUser = JSON.parse(localStorage.getItem('webmarket_session')); } catch(e) { this.state.currentUser = null; }
        this.renderAuthMenu();
    },
    saveUsersDB() { localStorage.setItem('webmarket_users', JSON.stringify(this.state.usersDB)); },
    saveSession() {
        if(this.state.currentUser) {
            const index = this.state.usersDB.findIndex(u => u.email === this.state.currentUser.email);
            if(index !== -1) this.state.usersDB[index] = this.state.currentUser;
            else this.state.usersDB.push(this.state.currentUser);
            localStorage.setItem('webmarket_session', JSON.stringify(this.state.currentUser));
            this.saveUsersDB();
        } else localStorage.removeItem('webmarket_session');
        this.renderAuthMenu();
    },
    renderAuthMenu() {
        const container = document.getElementById('auth-menu-container'); 
        if (!container) return; 
        if (this.state.currentUser) { 
            const isAdmin = this.state.currentUser.email === 'admin@gmail.com'; 
            const adminMenuHTML = isAdmin ? `<div class="h-px bg-slate-100 dark:bg-slate-700 my-2"></div><a href="admin.html" class="flex items-center gap-3 px-5 py-3.5 text-sm text-emerald-600 dark:text-emerald-400 font-black hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors"><i class="fa-solid fa-shield-halved w-5"></i> Quản trị Hệ thống</a>` : ''; 
            container.innerHTML = `<div class="relative group cursor-pointer"><div class="flex items-center gap-2"><div class="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white dark:border-slate-800">${this.state.currentUser.name.charAt(0).toUpperCase()}</div></div><div class="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] overflow-hidden"><div class="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"><p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Chào mừng,</p><p class="text-base font-black text-slate-900 dark:text-white truncate">${this.state.currentUser.name}</p><p class="text-xs text-slate-500 truncate">${this.state.currentUser.email}</p></div><div class="py-2"><a href="dashboard.html" class="flex items-center gap-3 px-5 py-3.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-medium"><i class="fa-solid fa-store w-5"></i> Shop của tôi</a><a href="purchases.html" class="flex items-center gap-3 px-5 py-3.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-medium"><i class="fa-solid fa-box-open w-5"></i> Kho mã nguồn</a><a href="add-product.html" class="flex items-center gap-3 px-5 py-3.5 text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl"><i class="fa-solid fa-cloud-arrow-up w-5"></i> Đăng Giao Diện</a>${adminMenuHTML}<div class="h-px bg-slate-100 dark:bg-slate-700 my-2"></div><button onclick="App.logout()" class="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-bold"><i class="fa-solid fa-right-from-bracket w-5"></i> Đăng xuất</button></div></div></div>`; 
        } else { 
            container.innerHTML = `<button onclick="App.showAuthModal('login')" class="hidden sm:block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 mr-5">Đăng nhập</button><button onclick="App.showAuthModal('register')" class="bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5">Đăng ký</button>`; 
        } 
    },
    showAuthModal(type = 'login') { 
        const existingModal = document.getElementById('auth-modal'); if(existingModal) existingModal.remove(); 
        const isLogin = type === 'login'; 
        const modalHtml = `<div id="auth-modal" class="fixed inset-0 z-[100] flex items-center justify-center px-4"><div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="document.getElementById('auth-modal').remove()"></div><div class="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-8 transform transition-all shadow-2xl border border-slate-100 dark:border-slate-700"><button onclick="document.getElementById('auth-modal').remove()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center"><i class="fa-solid fa-xmark"></i></button><h3 class="text-3xl font-black text-center mb-8 text-slate-900 dark:text-white">${isLogin ? 'Đăng nhập' : 'Tạo tài khoản Pro Max'}</h3><form onsubmit="event.preventDefault(); App.handleAuthSubmit('${type}')" class="space-y-5">${!isLogin ? `<div><label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Họ tên</label><input type="text" id="auth-name" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none"></div>` : ''}<div><label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Email (Dùng admin@gmail.com cho quyền Admin)</label><input type="email" id="auth-email" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none"></div><div><label class="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Mật khẩu</label><input type="password" id="auth-password" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none"></div><button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-transform transform hover:-translate-y-1 mt-4">${isLogin ? 'Đăng nhập' : 'Đăng ký ngay'}</button></form><p class="text-center text-sm mt-8 text-slate-500">${isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} <span class="cursor-pointer text-indigo-600 dark:text-indigo-400 font-bold hover:underline" onclick="App.showAuthModal('${isLogin ? 'register' : 'login'}')">${isLogin ? 'Đăng ký' : 'Đăng nhập'}</span></p></div></div>`; 
        document.body.insertAdjacentHTML('beforeend', modalHtml); 
    },
    handleAuthSubmit(type) { 
        const email = document.getElementById('auth-email').value.trim(); 
        const password = document.getElementById('auth-password').value; 
        if (type === 'register') {
            const name = document.getElementById('auth-name').value.trim();
            if (this.state.usersDB.some(u => u.email === email)) return this.showToast('Email đã tồn tại!', 'error');
            this.state.currentUser = { id: Date.now(), name, email, password, purchases: [], wishlist: [] }; 
            this.showToast(`Chào mừng ${name}!`, 'success');
        } else {
            const user = this.state.usersDB.find(u => u.email === email && u.password === password);
            if (user) { this.state.currentUser = user; this.showToast(`Mừng trở lại, ${user.name}!`, 'success'); }
            else return this.showToast('Sai thông tin!', 'error');
        }
        this.saveSession(); document.getElementById('auth-modal')?.remove(); 
    },
    logout() { this.state.currentUser = null; this.saveSession(); this.showToast('Đã đăng xuất', 'success'); setTimeout(()=>window.location.reload(), 500); },

    // ==========================================
    // MODULE CHUNG & GIỎ HÀNG
    // ==========================================
    showToast(message, type = 'success') {
        let container = document.getElementById('toast-container') || Object.assign(document.createElement('div'), { id: 'toast-container', className: 'fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none' });
        if(!document.getElementById('toast-container')) document.body.appendChild(container);
        const toast = document.createElement('div');
        toast.className = `${type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 translate-y-full opacity-0 pointer-events-auto`;
        toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'} text-xl"></i> <span class="font-bold">${message}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.remove('translate-y-full', 'opacity-0'));
        setTimeout(() => { toast.classList.add('translate-y-full', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
    },
    initTheme() { if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark'); },
    bindGlobalEvents() { document.getElementById('theme-toggle')?.addEventListener('click', () => { document.documentElement.classList.toggle('dark'); localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'; }); },

    loadCart() { try { this.state.cart = JSON.parse(localStorage.getItem('theme_cart')) || []; } catch (e) { this.state.cart = []; } this.updateCartBadge(); },
    saveCart() { localStorage.setItem('theme_cart', JSON.stringify(this.state.cart)); this.updateCartBadge(); },
    addToCart(productId) { const p = this.state.productsDB.find(x => x.id === productId); if(!p) return; if(this.state.currentUser && (this.state.currentUser.purchases || []).includes(productId)) return this.showToast('Bạn đã mua sản phẩm này rồi!', 'error'); if (!this.state.cart.some(item => item.id === productId)) { this.state.cart.push(p); this.saveCart(); this.showToast(`Đã thêm ${p.name}!`, 'success'); } else this.showToast('Đã có trong giỏ!', 'error'); },
    buyNow(productId) { this.addToCart(productId); setTimeout(() => window.location.href = 'cart.html', 600); },
    updateCartBadge() { const badge = document.getElementById('cart-badge'); if (badge) { badge.innerText = this.state.cart.length; badge.classList.add('animate-bounce'); setTimeout(() => badge.classList.remove('animate-bounce'), 1000); } },
    removeFromCart(productId) { this.state.cart = this.state.cart.filter(i => i.id !== productId); this.saveCart(); if (document.getElementById('cart-items-container')) this.renderCartPage(); },
    
    toggleWishlist(productId) {
        if (!this.state.currentUser) return this.showAuthModal('login');
        const list = this.state.currentUser.wishlist || [];
        const index = list.indexOf(productId);
        if (index === -1) { list.push(productId); this.showToast('Đã lưu vào tim!', 'success'); } 
        else { list.splice(index, 1); this.showToast('Đã bỏ tim!', 'success'); }
        this.state.currentUser.wishlist = list; this.saveSession();
        const btn = document.getElementById(`wishlist-btn-${productId}`);
        if(btn) btn.innerHTML = `<i class="fa-${list.includes(productId) ? 'solid text-rose-500' : 'regular text-slate-400'} fa-heart text-lg"></i>`;
    },

    renderCartPage() {
        const container = document.getElementById('cart-items-container');
        if(!container) return;
        if (this.state.cart.length === 0) {
            container.innerHTML = `<div class="text-center py-20"><div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6"><i class="fa-solid fa-cart-shopping text-4xl text-slate-300 dark:text-slate-600"></i></div><h3 class="text-2xl font-bold mb-2 dark:text-white">Giỏ hàng trống</h3><a href="index.html" class="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg transition-all">Đi dạo một vòng</a></div>`;
            document.getElementById('subtotal-price').innerText = '$0'; document.getElementById('total-price').innerText = '$0'; return;
        }
        let total = 0;
        container.innerHTML = this.state.cart.map(item => {
            total += item.price;
            return `<div class="flex flex-col md:flex-row items-center gap-6 py-6 border-b border-slate-100 dark:border-slate-800"><img src="${item.image}" class="w-full md:w-32 h-20 object-cover rounded-xl bg-slate-100 dark:bg-slate-800"><div class="flex-1 text-center md:text-left"><h3 class="font-bold text-lg text-slate-900 dark:text-white">${item.name}</h3><p class="text-sm text-slate-500">${item.category}</p></div><div class="font-black text-2xl text-slate-900 dark:text-white">$${item.price}</div><button onclick="App.removeFromCart(${item.id})" class="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-colors"><i class="fa-solid fa-trash"></i></button></div>`;
        }).join('');
        document.getElementById('subtotal-price').innerText = `$${total}`; document.getElementById('total-price').innerText = `$${total}`;
        document.getElementById('checkout-btn').onclick = () => { if(!this.state.currentUser) return this.showAuthModal('login'); this.showCheckoutModal(total); };
    },

    showCheckoutModal(totalPrice) {
        document.getElementById('checkout-modal')?.remove();
        const qrUrl = `https://quickchart.io/qr?text=WebMarket_ThanhToan_${totalPrice}_USD&size=200`;
        const modalHtml = `<div id="checkout-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div class="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-md text-center shadow-2xl border border-slate-100 dark:border-slate-700 transform transition-all"><h3 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Thanh toán</h3><p class="text-slate-500 mb-6">Quét mã QR để chuyển khoản <span class="text-indigo-600 dark:text-indigo-400 font-black text-xl">$${totalPrice}</span></p><div class="bg-white p-4 rounded-2xl border-2 border-dashed border-indigo-200 inline-block mb-6 shadow-sm relative"><img src="${qrUrl}" alt="QR" class="w-48 h-48 mx-auto"><div class="absolute inset-0 bg-indigo-500/10 pointer-events-none rounded-xl"></div></div><button onclick="App.processPayment()" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"><i class="fa-solid fa-check-circle text-xl"></i> Xác nhận đã chuyển khoản</button><button onclick="document.getElementById('checkout-modal').remove()" class="mt-4 text-slate-400 font-bold text-sm py-2">Hủy</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    processPayment() {
        if (!this.state.currentUser.purchases) this.state.currentUser.purchases = [];
        this.state.cart.forEach(item => { if(!this.state.currentUser.purchases.includes(item.id)) { this.state.currentUser.purchases.push(item.id); } });
        this.saveSession(); this.state.cart = []; this.saveCart();
        document.getElementById('checkout-modal')?.remove();
        this.showToast('Giao dịch thành công!', 'success');
        setTimeout(() => window.location.href = 'purchases.html', 1000);
    },

    // ==========================================
    // MODULE: HOME (LƯỚI SẢN PHẨM & FEED)
    // ==========================================
    fetchAndRenderProducts() {
        const grid = document.getElementById('product-grid');
        if (!grid || this.state.productsDB.length === 0) return;
        
        let filtered = this.state.productsDB.filter(p => p.name.toLowerCase().includes(this.state.searchQuery));
        if (this.state.currentCategory !== 'all') filtered = filtered.filter(p => p.category === this.state.currentCategory);
        filtered.sort((a, b) => b.id - a.id);

        grid.innerHTML = filtered.map(p => {
            const isLiked = this.state.currentUser && (this.state.currentUser.wishlist || []).includes(p.id);
            const heartIcon = isLiked ? 'fa-solid text-rose-500' : 'fa-regular text-slate-400';
            return `
            <div class="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col relative">
                <button id="wishlist-btn-${p.id}" onclick="App.toggleWishlist(${p.id})" class="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <i class="${heartIcon} fa-heart text-lg"></i>
                </button>
                <div class="relative aspect-[16/11] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                    <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5 z-10">
                        <button onclick="App.showDemoModal(${p.id})" class="w-full bg-white text-slate-900 text-center py-3.5 rounded-xl font-bold text-sm shadow-xl hover:bg-indigo-600 hover:text-white transition-colors">Xem Live Demo</button>
                    </div>
                </div>
                <div class="p-6 flex-1 flex flex-col">
                    <div class="flex items-center justify-between mb-4"><span class="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg uppercase tracking-wider">${p.category}</span></div>
                    <h3 class="text-lg font-extrabold mb-1 line-clamp-1 text-slate-900 dark:text-white"><a href="product.html?id=${p.id}" class="hover:text-indigo-600 transition-colors">${p.name}</a></h3>
                    <p class="text-sm text-slate-500 mb-6 font-medium">by <span class="font-bold text-slate-700 dark:text-slate-300">${p.author}</span></p>
                    <div class="mt-auto flex justify-between items-center pt-5 border-t border-slate-100 dark:border-slate-800/80">
                        <span class="text-2xl font-black text-slate-900 dark:text-white">$${p.price}</span>
                        <button onclick="App.buyNow(${p.id})" class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform">
                            <i class="fa-solid fa-cart-arrow-down text-lg"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    renderActivityFeed() {
        const feed = document.getElementById('activity-feed');
        if(!feed || this.state.activityDB.length === 0) return;
        feed.innerHTML = this.state.activityDB.map(act => {
            let icon = 'fa-dot-circle text-slate-400';
            if(act.type === 'register') icon = 'fa-user-plus text-sky-500';
            if(act.type === 'publish') icon = 'fa-rocket text-fuchsia-500';
            return `<div class="flex items-start gap-3 animate-fadeIn"><i class="fa-solid ${icon} mt-0.5 w-5 text-center"></i> <p>${act.msg}</p></div>`;
        }).join('');
        setTimeout(()=> feed.scrollTop = feed.scrollHeight, 100);
    },

    // ==========================================
    // MODULE: PRODUCT DETAIL & REVIEWS
    // ==========================================
    renderReviews(product) {
        const revContainer = document.getElementById('reviews-list');
        if(!revContainer) return;
        if(!product.reviews || product.reviews.length === 0) {
            revContainer.innerHTML = `<p class="text-slate-500 italic">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>`;
        } else {
            revContainer.innerHTML = product.reviews.map(r => `<div class="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4"><div class="flex items-center gap-2 mb-1"><div class="font-bold text-slate-900 dark:text-white">${r.userName}</div><div class="text-amber-400 text-xs">${'<i class="fa-solid fa-star"></i>'.repeat(r.rating)}</div></div><p class="text-slate-600 dark:text-slate-300 text-sm mt-2">${r.comment}</p></div>`).join('');
        }
        document.getElementById('review-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            if(!this.state.currentUser) return this.showAuthModal('login');
            this.showToast('Gửi nhận xét thành công! (Dữ liệu đánh giá đang chờ API Backend)', 'success');
            document.getElementById('review-form').reset();
        });
    },

    // ==========================================
    // MODULE: ADMIN PANEL
    // ==========================================
    initAdmin() {
        if(!this.state.currentUser || this.state.currentUser.email !== 'admin@gmail.com') { this.showToast('Không có quyền!', 'error'); setTimeout(() => window.location.href = 'index.html', 1000); return; }
        this.renderAdminDashboard(); this.renderAdminProducts(); this.renderAdminUsers();
    },
    switchAdminTab(tabName) {
        ['dashboard', 'products', 'users'].forEach(t => document.getElementById(`admin-tab-${t}`).classList.add('hidden'));
        document.getElementById(`admin-tab-${tabName}`).classList.remove('hidden');
    },
    renderAdminDashboard() {
        document.getElementById('admin-total-users').innerText = this.state.usersDB.length || '1';
        document.getElementById('admin-total-products').innerText = this.state.productsDB.length;
        document.getElementById('admin-total-revenue').innerText = `$${this.state.productsDB.reduce((s, p) => s + (p.price * p.sales), 0)}`;
    },
    renderAdminProducts() {
        const tbody = document.getElementById('admin-products-table');
        if(!tbody) return;
        tbody.innerHTML = this.state.productsDB.map(p => `<tr class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><td class="p-5 font-bold text-slate-900 dark:text-white flex items-center gap-3"><img src="${p.image}" class="w-12 h-9 rounded-lg object-cover"> <span class="line-clamp-1">${p.name}</span></td><td class="p-5 text-slate-600 dark:text-slate-400 font-medium">${p.author}</td><td class="p-5 font-black text-indigo-600">$${p.price}</td><td class="p-5 text-center font-bold text-emerald-600">${p.sales}</td><td class="p-5 text-right"><button onclick="App.deleteAdminProduct(${p.id})" class="bg-rose-100 hover:bg-rose-500 text-rose-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm">Xóa</button></td></tr>`).join('');
    },
    deleteAdminProduct(id) { if(!confirm('Xóa?')) return; this.state.productsDB = this.state.productsDB.filter(p => p.id !== id); this.renderAdminProducts(); this.renderAdminDashboard(); this.showToast('Xóa ảo thành công!', 'success'); },
    renderAdminUsers() {
        const tbody = document.getElementById('admin-users-table');
        if(!tbody) return;
        tbody.innerHTML = this.state.usersDB.map(u => `<tr class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800"><td class="p-5 font-bold dark:text-white">${u.name}</td><td class="p-5 text-slate-400">${u.email}</td><td class="p-5 text-center font-bold text-emerald-600">${(u.purchases || []).length}</td><td class="p-5 text-right"><span class="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold">Active</span></td></tr>`).join('');
    },

    // ==========================================
    // MODULE: KHO ĐÃ MUA (PURCHASES)
    // ==========================================
    initPurchasesPage() {
        if(!this.state.currentUser) { window.location.href = 'index.html'; return; }
        document.getElementById('tab-purchases')?.addEventListener('click', () => this.renderAccountTab('purchases'));
        document.getElementById('tab-wishlist')?.addEventListener('click', () => this.renderAccountTab('wishlist'));
        this.renderAccountTab('purchases');
    },
    renderAccountTab(tabName) {
        const container = document.getElementById('account-content');
        if(!container) return;
        document.getElementById('tab-purchases').className = `flex-1 md:flex-none px-8 py-3.5 font-bold rounded-xl transition-all ${tabName === 'purchases' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`;
        document.getElementById('tab-wishlist').className = `flex-1 md:flex-none px-8 py-3.5 font-bold rounded-xl transition-all ${tabName === 'wishlist' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`;

        const ids = tabName === 'purchases' ? (this.state.currentUser.purchases || []) : (this.state.currentUser.wishlist || []);
        const items = this.state.productsDB.filter(p => ids.includes(p.id));

        if(items.length === 0) {
            container.innerHTML = `<div class="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl"><i class="fa-solid fa-folder-open text-6xl text-slate-200 dark:text-slate-700 mb-6 block"></i><p class="text-slate-500 mb-8 font-medium">Khu vực này đang trống.</p><a href="index.html" class="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg">Khám phá ngay</a></div>`;
            return;
        }

        if(tabName === 'purchases') {
            container.innerHTML = `<div class="grid grid-cols-1 gap-6">` + items.map(p => {
                let niceName = p.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
                return `
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-xl transition-all">
                    <div class="flex items-center gap-6 w-full md:w-auto">
                        <img src="${p.image}" class="w-40 h-28 rounded-2xl object-cover flex-shrink-0 bg-slate-100">
                        <div>
                            <span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg uppercase tracking-wider mb-2 inline-block">${p.category}</span>
                            <h3 class="font-black text-xl text-slate-900 dark:text-white mb-1">${p.name}</h3>
                            <p class="text-sm text-slate-500">Tác giả: <span class="font-bold dark:text-slate-300">${p.author}</span></p>
                        </div>
                    </div>
                    <div class="flex gap-4 w-full md:w-auto">
                        <a href="product.html?id=${p.id}" class="flex-1 text-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-4 rounded-2xl font-bold">Review</a>
                        <a href="${p.downloadUrl}" download="${niceName}.zip" class="flex-1 text-center bg-slate-900 hover:bg-indigo-600 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black shadow-lg"><i class="fa-solid fa-download"></i> Tải Code</a>
                    </div>
                </div>
            `}).join('') + `</div>`;
        } else {
            container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">` + items.map(p => `<div class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 flex flex-col"><img src="${p.image}" class="w-full aspect-[16/11] object-cover rounded-xl mb-4"><h3 class="text-lg font-extrabold mb-4 line-clamp-1 dark:text-white">${p.name}</h3><div class="mt-auto flex justify-between items-center"><span class="text-2xl font-black dark:text-white">$${p.price}</span><button onclick="App.buyNow(${p.id})" class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md"><i class="fa-solid fa-cart-plus"></i></button></div></div>`).join('') + `</div>`;
        }
    },

    // ==========================================
    // MODULE: DEMO PREVIEW (CỰC KỲ QUAN TRỌNG)
    // ==========================================
    initDemoPage() {
        const id = parseInt(new URLSearchParams(window.location.search).get('id'));
        const p = this.state.productsDB.find(x => x.id === id);
        
        if (!p) { window.location.href = 'index.html'; return; }
        
        const titleEl = document.getElementById('demo-title');
        if (titleEl) titleEl.innerText = p.name; 
        document.title = `Live Demo - ${p.name}`;
        
        // Đảm bảo link lấy đúng đường dẫn từ Gốc máy chủ
        const finalDemoUrl = p.demoUrl.startsWith('http') ? p.demoUrl : '/' + p.demoUrl;

        const iframe = document.getElementById('demo-frame');
        if (iframe) {
            iframe.onload = () => { 
                const overlay = document.getElementById('loader-overlay'); 
                if(overlay) { overlay.style.opacity = '0'; setTimeout(() => overlay.style.display = 'none', 500); } 
            };
            iframe.src = finalDemoUrl;
        }
        
        const buyBtn = document.getElementById('buy-btn');
        if(buyBtn) buyBtn.onclick = () => this.addToCart(p.id);

        const newTabBtn = document.getElementById('new-tab-btn');
        if(newTabBtn) newTabBtn.onclick = () => window.open(finalDemoUrl, '_blank');
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());