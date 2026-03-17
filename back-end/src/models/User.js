const db = require('../config/database');

const User = {
    // Tìm user bằng email
    async findByEmail(email) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    // Tìm user bằng ID
    async findById(id) {
        const [rows] = await db.query(
            'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Tạo user mới
    async create(userData) {
        const { id, email, password_hash, full_name, role } = userData;
        const [result] = await db.query(
            'INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [id, email, password_hash, full_name, role || 'student']
        );
        return result.insertId;
    },

    // Cập nhật thông tin user
    async update(id, updateData) {
        const { full_name, is_active } = updateData;
        const [result] = await db.query(
            'UPDATE users SET full_name = COALESCE(?, full_name), is_active = COALESCE(?, is_active) WHERE id = ?',
            [full_name || null, is_active, id]
        );
        return result.affectedRows > 0;
    },

    // Lấy tất cả users (phân trang)
    async findAll(limit = 10, offset = 0) {
        const [rows] = await db.query(
            'SELECT id, email, full_name, role, is_active, created_at FROM users LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return rows;
    }
};

module.exports = User;