const express = require('express');
const cors = require('cors');
const multer = require('multer');
const extract = require('extract-zip');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(__dirname));

const upload = multer({ dest: 'uploads/' });

// ==============================================================
// HÀM QUÉT TỰ ĐỘNG: Tìm file index.html dù nó nằm ở bất kỳ đâu
// ==============================================================
function findIndexHtml(baseDir, currentDir = '') {
    const searchPath = path.join(baseDir, currentDir);
    const files = fs.readdirSync(searchPath);

    for (const file of files) {
        const fullPath = path.join(searchPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Nếu là thư mục, nhảy vào trong tìm tiếp (Đệ quy)
            const found = findIndexHtml(baseDir, path.join(currentDir, file));
            if (found) return found;
        } else if (file.toLowerCase() === 'index.html') {
            // Nếu tìm thấy file index.html, trả về đường dẫn tương đối của nó
            return path.join(currentDir, file).replace(/\\/g, '/'); // Chuyển chéo \ thành / cho chuẩn URL web
        }
    }
    return null; // Không tìm thấy
}

// ==============================================================
// API XỬ LÝ UPLOAD VÀ GIẢI NÉN
// ==============================================================
app.post('/api/upload-template', upload.single('templateZip'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Chưa có file nào được tải lên.' });
        }

        const templatesDemoPath = path.join(__dirname, 'templates_demo');
        if (!fs.existsSync(templatesDemoPath)) {
            fs.mkdirSync(templatesDemoPath);
        }

        const folderName = `template_${Date.now()}`;
        const extractToPath = path.join(templatesDemoPath, folderName);

        // 1. Giải nén
        await extract(req.file.path, { dir: extractToPath });

        // 2. Xóa file ZIP tạm
        fs.unlinkSync(req.file.path);

        // 3. Tự động truy lùng file index.html
        const relativeIndexPath = findIndexHtml(extractToPath);

        if (!relativeIndexPath) {
            // Nếu ZIP này hoàn toàn không chứa file index.html nào, xóa luôn thư mục vừa giải nén cho sạch máy
            fs.rmSync(extractToPath, { recursive: true, force: true });
            return res.status(400).json({ 
                success: false, 
                message: 'Không tìm thấy file index.html trong file ZIP này! Vui lòng kiểm tra lại source code.' 
            });
        }

        // 4. Tạo đường link chính xác tuyệt đối
        const demoUrl = `templates_demo/${folderName}/${relativeIndexPath}`;

        res.json({ 
            success: true, 
            message: 'Tải lên và xử lý thành công!',
            demoUrl: demoUrl 
        });

    } catch (error) {
        console.error("Lỗi giải nén:", error);
        // Xóa file tạm nếu lỗi
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        res.status(500).json({ success: false, message: 'File ZIP bị lỗi hoặc không thể giải nén.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`👉 Hãy truy cập bằng link này: http://localhost:${PORT}/index.html`);
});