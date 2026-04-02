const express = require('express');
const cors = require('cors');
const multer = require('multer');
const extract = require('extract-zip');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Cấu hình để Server đọc được dữ liệu JSON gửi từ Frontend
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Cấu hình để Server đọc được dữ liệu JSON
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==============================================================
// 🛡️ API SECURITY PRO MAX: BẢO VỆ SOURCE CODE MẪU BẰNG BACKEND
// Chống F12, Chống Chuột Phải, Chống Ctrl+S, Chống Copy trực tiếp
// ==============================================================
const ANTI_THEFT_SCRIPT = `
<script>
    // 1. Cấm chuột phải
    document.addEventListener('contextmenu', event => event.preventDefault());
    
    // 2. Cấm bôi đen, copy
    document.addEventListener('selectstart', event => event.preventDefault());
    document.addEventListener('copy', event => {
        event.clipboardData.setData('text/plain', 'Cảnh báo: Hành động sao chép mã nguồn đã bị ghi nhận!');
        event.preventDefault();
    });

    // 3. Cấm các phím tắt F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
    document.onkeydown = function(e) {
        if (e.keyCode == 123) return false; // F12
        if (e.ctrlKey && e.shiftKey && e.keyCode == 73) return false; // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.keyCode == 67) return false; // Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && e.keyCode == 74) return false; // Ctrl+Shift+J
        if (e.ctrlKey && e.keyCode == 85) return false; // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode == 83) return false; // Ctrl+S (Save As)
    };
</script>
`;

// Cổng kiểm duyệt (Middleware) cho thư mục templates_demo
app.use('/templates_demo', (req, res, next) => {
    // 1. KIỂM TRA NGUỒN GỐC (CORS/Hotlink Protection)
    // Nếu request không xuất phát từ web mẹ (localhost), chặn đứng ngay lập tức!
    const referer = req.headers.referer;
    if (!referer || !referer.includes('localhost:3000')) {
        return res.status(403).send('<h1>Access Denied (403)</h1><p>Source code được bảo vệ bởi WebMarket. Không thể truy cập trực tiếp!</p>');
    }

    // Lấy đường dẫn file thực tế trên ổ cứng
    const filePath = path.join(__dirname, 'templates_demo', req.path);

    // 2. NẾU KHÁCH XEM FILE HTML -> TIÊM MÃ ĐỘC CHỐNG COPY RỒI MỚI TRẢ VỀ
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile() && filePath.endsWith('.html')) {
        let htmlContent = fs.readFileSync(filePath, 'utf8');
        
        // Nhét code chống trộm vào cuối thẻ body
        if (htmlContent.includes('</body>')) {
            htmlContent = htmlContent.replace('</body>', `${ANTI_THEFT_SCRIPT}\n</body>`);
        } else {
            htmlContent += ANTI_THEFT_SCRIPT;
        }
        
        res.setHeader('Content-Type', 'text/html');
        return res.send(htmlContent); // Trả file đã được cấy bảo mật
    }

    // Nếu là file css, js, ảnh bình thường thì cho qua
    next();
});

// Khai báo lại dòng này ĐỂ DƯỚI CÙNG của phần cấu hình, 
// để đảm bảo các file hệ thống tĩnh vẫn hoạt động
app.use(express.static(__dirname));

const upload = multer({ dest: 'uploads/' });

// ==============================================================
// 1. CẤU HÌNH DATABASE (JSON LƯU TRỮ VĨNH VIỄN)
// ==============================================================
const DB_DIR = path.join(__dirname, 'database');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');
const ACTIVITIES_FILE = path.join(DB_DIR, 'activities.json');

// Dữ liệu mẫu khởi tạo lần đầu tiên
const defaultProducts = [
    { id: 1, name: "Feane - Nhà hàng cao cấp", category: "shop", price: 29, sales: 145, rating: 5, author: "ThemeOcean", image: "https://themewagon.com/wp-content/uploads/2021/10/feane-1.png", demoUrl: "https://themewagon.github.io/feane/" },
    { id: 2, name: "Sneat - Admin Dashboard", category: "admin", price: 49, sales: 1250, rating: 5, author: "ProCoder", image: "https://themewagon.com/wp-content/uploads/2024/09/FoodMart-1200x736.webp", demoUrl: "https://themewagon.github.io/sneat-html-admin-template-free/" }
];

const defaultActivities = [
    { type: 'publish', msg: 'Hệ thống Database Pro Max đã trực tuyến!' },
    { type: 'register', msg: 'Admin Tâm Quyết vừa khởi tạo sàn giao dịch.' }
];

// Hàm đọc/ghi DB
function readDB(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 4));
        return defaultData;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeDB(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

// Khởi động Database
let productsDB = readDB(PRODUCTS_FILE, defaultProducts);
let activitiesDB = readDB(ACTIVITIES_FILE, defaultActivities);


// ==============================================================
// 2. THUẬT TOÁN TÌM FILE INDEX.HTML (ĐÃ NÂNG CẤP BỞI BẠN)
// ==============================================================
function findIndexHtml(baseDir) {
    const queue = ['']; 
    let firstHtmlFile = null; 

    while (queue.length > 0) {
        const currentDir = queue.shift();
        const searchPath = path.join(baseDir, currentDir);
        let files = [];
        try { files = fs.readdirSync(searchPath); } catch (e) { continue; }

        for (const file of files) {
            const fullPath = path.join(searchPath, file);
            if (!fs.statSync(fullPath).isDirectory()) {
                if (file.toLowerCase() === 'index.html') return path.join(currentDir, file).replace(/\\/g, '/');
                if (!firstHtmlFile && file.toLowerCase().endsWith('.html')) firstHtmlFile = path.join(currentDir, file).replace(/\\/g, '/');
            }
        }
        for (const file of files) {
            const fullPath = path.join(searchPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                const ignoredDirs = ['__macosx', 'node_modules', 'vendor', '.git', 'docs', 'documentation', 'document'];
                if (ignoredDirs.includes(file.toLowerCase())) continue;
                queue.push(path.join(currentDir, file));
            }
        }
    }
    return firstHtmlFile; 
}


// ==============================================================
// 3. CÁC API GIAO TIẾP VỚI FRONTEND
// ==============================================================

// API 1: Lấy toàn bộ dữ liệu (Đổ ra trang chủ)
app.get('/api/get-all-data', (req, res) => {
    productsDB = readDB(PRODUCTS_FILE, defaultProducts);
    activitiesDB = readDB(ACTIVITIES_FILE, defaultActivities);
    res.json({ success: true, products: productsDB, activities: activitiesDB });
});

// API 2: Upload File ZIP và Giải nén (Giữ nguyên)
app.post('/api/upload-template', upload.single('templateZip'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Chưa có file ZIP' });
        const rawName = req.body.productName || 'WebMarket_Code';
        const safeName = rawName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const templatesDemoPath = path.join(__dirname, 'templates_demo');
        if (!fs.existsSync(templatesDemoPath)) fs.mkdirSync(templatesDemoPath);

        const folderName = `${safeName}_${Date.now()}`;
        const extractToPath = path.join(templatesDemoPath, folderName);

        await extract(req.file.path, { dir: extractToPath });
        const sourceZipPath = path.join(extractToPath, `${safeName}.zip`);
        fs.copyFileSync(req.file.path, sourceZipPath); 
        fs.unlinkSync(req.file.path); 

        const relativeIndexPath = findIndexHtml(extractToPath);
        if (!relativeIndexPath) {
            fs.rmSync(extractToPath, { recursive: true, force: true });
            return res.status(400).json({ success: false, message: 'Lỗi: Mã nguồn không có file HTML nào!' });
        }

        // ==========================================
        // TUYỆT CHIÊU: ÉP WEB MẪU CHẠY ĐÚNG TRÊN WEB MẸ
        // ==========================================
        const indexPath = path.join(extractToPath, relativeIndexPath);
        let htmlContent = fs.readFileSync(indexPath, 'utf8');
        
        // Cắt lấy đường dẫn thư mục chứa file index.html
        let baseDir = relativeIndexPath.substring(0, relativeIndexPath.lastIndexOf('/') + 1);
        let baseUrl = `/templates_demo/${folderName}/${baseDir}`;

        // Tiêm thẻ <base> vào ngay sau thẻ <head> của web mẫu
        const baseTag = `<base href="${baseUrl}">`;
        if (htmlContent.includes('<head>')) {
            htmlContent = htmlContent.replace('<head>', `<head>\n    ${baseTag}`);
        } else if (htmlContent.includes('<HEAD>')) {
            htmlContent = htmlContent.replace('<HEAD>', `<HEAD>\n    ${baseTag}`);
        } else {
            // Nếu code quá cùi không có thẻ head, tự động tạo
            htmlContent = `<head>${baseTag}</head>\n` + htmlContent;
        }
        
        // Lưu lại file index.html đã được "thuần hóa"
        fs.writeFileSync(indexPath, htmlContent);
        // ==========================================

        res.json({ 
            success: true, 
            demoUrl: encodeURI(`templates_demo/${folderName}/${relativeIndexPath}`),
            downloadUrl: encodeURI(`templates_demo/${folderName}/${safeName}.zip`)
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Lỗi giải nén Server.' });
    }
});

// API 3: Lưu Sản phẩm mới vào DATABASE (NEW)
app.post('/api/save-product', (req, res) => {
    const newProduct = req.body;
    
    // Lưu sản phẩm
    productsDB.unshift(newProduct); // Đẩy lên đầu danh sách
    writeDB(PRODUCTS_FILE, productsDB);

    // Ghi nhận vào Bảng tin Hoạt động (Activity Feed)
    activitiesDB.push({
        type: 'publish',
        msg: `<span class="font-bold text-indigo-500">${newProduct.author}</span> vừa phát hành siêu phẩm <span class="font-bold">${newProduct.name}</span>`
    });
    // Giữ lại 50 hoạt động gần nhất để ko bị đầy bộ nhớ
    if(activitiesDB.length > 50) activitiesDB.shift(); 
    writeDB(ACTIVITIES_FILE, activitiesDB);

    res.json({ success: true, message: 'Lưu Database thành công!' });
});

app.listen(PORT, () => {
    console.log(`🚀 DATABASE PRO MAX ĐÃ CHẠY TẠI: http://localhost:${PORT}`);
});