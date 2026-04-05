# 🚀 Auto Code-grader

Hệ thống chấm bài tập lập trình tự động dành cho môi trường học đường, hỗ trợ nhiều ngôn ngữ lập trình và tích hợp AI (Gemini) để đánh giá chất lượng code.

## 📋 Tính năng chính

### 👨‍🎓 Sinh viên
- Đăng ký / Đăng nhập / Đăng xuất
- Xem danh sách bài thi
- Nộp bài (code) với nhiều ngôn ngữ
- Auto-save draft
- Xem kết quả test cases
- Nhận feedback từ AI
- Xem lịch sử nộp bài

### 👨‍🏫 Giảng viên
- Tạo / Sửa / Xóa bài thi
- Thêm câu hỏi và test cases
- Cấu hình rubric chấm điểm
- Xem danh sách bài nộp
- Chấm điểm thủ công (ghi đè)
- Xuất báo cáo điểm

### 👑 Quản trị viên
- Quản lý người dùng
- Cấu hình hệ thống
- Quản lý sandbox
- Giám sát hoạt động

## 🛠 Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time notifications
- **Bull** - Queue system
- **Redis** - Queue storage

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Vite** - Build tool
- **Monaco Editor** - Code editor
- **Axios** - HTTP client

### AI Integration
- **Google Gemini API** - Code evaluation & feedback

## 📁 Cấu trúc dự án
auto-code-grader/
├── back-end/ # Backend Node.js
│ ├── src/
│ │ ├── config/ # Cấu hình database, env
│ │ ├── controllers/ # Xử lý request/response
│ │ ├── middleware/ # Auth, validation
│ │ ├── models/ # Database models
│ │ ├── routes/ # API endpoints
│ │ ├── services/ # Business logic, AI, queue
│ │ └── app.js # Express config
│ ├── .env # Environment variables
│ ├── package.json
│ └── server.js # Entry point
│
├── frontend/ # Frontend React
│ ├── src/
│ │ ├── app/
│ │ │ ├── components/ # UI components
│ │ │ ├── contexts/ # React contexts
│ │ │ └── App.tsx
│ │ ├── services/ # API services
│ │ ├── styles/ # CSS files
│ │ └── main.tsx
│ ├── .env # Environment variables
│ ├── package.json
│ └── vite.config.ts
│
└── docker-compose.yml # Docker setup


==================================================
AUTO CODE-GRADER - CÀI ĐẶT VÀ CHẠY DỰ ÁN
==================================================

I. YÊU CẦU HỆ THỐNG
--------------------------------------------------
- Node.js >= 18.x
- MySQL >= 8.0 hoặc MariaDB >= 10.4
- XAMPP (cho MySQL) hoặc Docker
- Redis (cho queue system - tùy chọn)


II. CẤU HÌNH DATABASE (XAMPP)
--------------------------------------------------
1. Mở XAMPP Control Panel
2. Start MySQL (nhấn Start)
3. Mở phpMyAdmin: http://localhost/phpmyadmin
4. Tạo database:
   - Database name: auto_code_grader
   - Charset: utf8mb4_unicode_ci

5. Chạy SQL tạo bảng:
--------------------------------------------------
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exams (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id CHAR(36) NOT NULL,
    duration_minutes INT,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    status ENUM('draft', 'published', 'in_progress', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE questions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    exam_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(50) DEFAULT 'python',
    max_score INT DEFAULT 100,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE testcases (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    question_id CHAR(36) NOT NULL,
    input_data TEXT,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE submissions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id CHAR(36) NOT NULL,
    exam_id CHAR(36) NOT NULL,
    question_id CHAR(36) NOT NULL,
    code TEXT NOT NULL,
    status ENUM('draft', 'submitted', 'graded') DEFAULT 'draft',
    score DECIMAL(5,2),
    feedback TEXT,
    test_results JSON,
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE drafts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id CHAR(36) NOT NULL,
    exam_id CHAR(36) NOT NULL,
    question_id CHAR(36) NOT NULL,
    code TEXT NOT NULL,
    last_auto_save TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
--------------------------------------------------

6. Thêm tài khoản demo:
--------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, role) VALUES 
(UUID(), 'student@edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr3FjKzQqJqJqJqJqJqJqJqJqJqJq', 'Sinh viên', 'student'),
(UUID(), 'teacher@edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr3FjKzQqJqJqJqJqJqJqJqJqJqJq', 'Giảng viên', 'teacher'),
(UUID(), 'admin@edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr3FjKzQqJqJqJqJqJqJqJqJqJqJq', 'Quản trị viên', 'admin');
--------------------------------------------------


III. CÀI ĐẶT BACKEND
--------------------------------------------------
1. Mở terminal, di chuyển vào thư mục back-end:
cd back-end

2. Cài đặt dependencies:
npm install

3. Tạo file .env:
--------------------------------------------------
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=auto_code_grader

JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:5173
--------------------------------------------------

4. Chạy backend:
npm run dev

Kết quả mong đợi:
✅ Connected to MySQL database successfully!
🚀 Server is running on port 5000


IV. CÀI ĐẶT FRONTEND
--------------------------------------------------
1. Mở terminal mới, di chuyển vào thư mục frontend:
cd frontend

2. Cài đặt dependencies:
npm install

3. Tạo file .env:
--------------------------------------------------
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5001
--------------------------------------------------

4. Chạy frontend:
npm run dev

Kết quả mong đợi:
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/


V. CHẠY TOÀN BỘ HỆ THỐNG
--------------------------------------------------
Cần 3 cửa sổ terminal chạy cùng lúc:

Terminal 1 - XAMPP:
- Mở XAMPP Control Panel
- Start MySQL (đảm bảo chữ "Running" màu xanh)

Terminal 2 - Backend:
cd back-end
npm run dev

Terminal 3 - Frontend:
cd frontend
npm run dev

Sau đó mở trình duyệt: http://localhost:5173


VI. THÔNG TIN ĐĂNG NHẬP
--------------------------------------------------
| Vai trò      | Email              | Mật khẩu      |
|--------------|--------------------|---------------|
| Sinh viên    | student@edu.vn     | demo123456    |
| Giảng viên   | teacher@edu.vn     | demo123456    |
| Admin        | admin@edu.vn       | demo123456    |


VII. CÁC API ENDPOINTS CHÍNH
--------------------------------------------------
Authentication:
POST   /api/auth/register     - Đăng ký
POST   /api/auth/login        - Đăng nhập
GET    /api/auth/me           - Lấy thông tin user

Exams:
GET    /api/exams             - Lấy danh sách bài thi
GET    /api/exams/:id         - Chi tiết bài thi
POST   /api/exams             - Tạo bài thi (teacher)
PUT    /api/exams/:id         - Cập nhật bài thi
DELETE /api/exams/:id         - Xóa bài thi

Submissions:
POST   /api/submissions/submit   - Nộp bài
POST   /api/submissions/draft    - Lưu draft
GET    /api/submissions/history  - Lịch sử nộp bài
GET    /api/submissions/:id      - Kết quả bài nộp
GET    /api/submissions/job/:jobId - Trạng thái chấm điểm


VIII. XỬ LÝ LỖI THƯỜNG GẶP
--------------------------------------------------
1. Lỗi "Access denied for user 'root'@'localhost'":
   - Vào XAMPP → MySQL → Config → my.ini
   - Tìm dòng [mysqld] thêm: skip-grant-tables
   - Restart MySQL
   - Chạy: mysql -u root
   - SET PASSWORD FOR 'root'@'localhost' = PASSWORD('');

2. Lỗi "Port 3306 already in use":
   - Mở Task Manager → End task mysqld.exe
   - Hoặc đổi port MySQL trong my.ini

3. Lỗi CORS khi gọi API:
   - Kiểm lại file .env của frontend: VITE_API_URL=http://localhost:5000/api
   - Restart cả backend và frontend

4. Lỗi "Cannot find module 'xxx'":
   - Chạy: npm install

5. Đăng nhập thất bại:
   - Kiểm lại database có user không
   - Chạy SQL: UPDATE users SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr3FjKzQqJqJqJqJqJqJqJqJqJqJq';
   - Restart backend


IX. CẤU TRÚC THƯ MỤC DỰ ÁN
--------------------------------------------------
auto-code-grader/
├── back-end/
│   ├── src/
│   │   ├── config/          # Cấu hình
│   │   ├── controllers/     # Xử lý request
│   │   ├── middleware/      # Auth, validation
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   └── app.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/  # UI components
    │   │   ├── contexts/    # React contexts
    │   │   └── App.tsx
    │   ├── services/        # API services
    │   ├── styles/          # CSS
    │   └── main.tsx
    ├── .env
    └── package.json


X. LIÊN KẾT HỮU ÍCH
--------------------------------------------------
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health
- Frontend: http://localhost:5173
- phpMyAdmin: http://localhost/phpmyadmin

==================================================
CHÚC BẠN CÀI ĐẶT THÀNH CÔNG! 🚀
==================================================
