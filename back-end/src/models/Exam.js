const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Exam = {
    // Tạo bài thi mới
    async create(examData) {
        const { 
            id = uuidv4(), 
            title, 
            description, 
            teacher_id, 
            duration_minutes, 
            start_time, 
            end_time, 
            status = 'draft' 
        } = examData;

        const [result] = await db.query(
            `INSERT INTO exams 
            (id, title, description, teacher_id, duration_minutes, start_time, end_time, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, title, description, teacher_id, duration_minutes, start_time, end_time, status]
        );

        return id;
    },

    // Lấy tất cả bài thi (có phân trang)
    async findAll(limit = 10, offset = 0) {
        const [rows] = await db.query(
            `SELECT e.*, u.full_name as teacher_name 
            FROM exams e 
            LEFT JOIN users u ON e.teacher_id = u.id 
            ORDER BY e.created_at DESC 
            LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    },

    // Lấy bài thi theo ID
    async findById(id) {
        const [rows] = await db.query(
            `SELECT e.*, u.full_name as teacher_name 
            FROM exams e 
            LEFT JOIN users u ON e.teacher_id = u.id 
            WHERE e.id = ?`,
            [id]
        );
        return rows[0];
    },

    // Lấy bài thi theo giáo viên
    async findByTeacher(teacher_id) {
        const [rows] = await db.query(
            `SELECT * FROM exams 
            WHERE teacher_id = ? 
            ORDER BY created_at DESC`,
            [teacher_id]
        );
        return rows;
    },

    // Cập nhật bài thi
    async update(id, updateData) {
        const { title, description, duration_minutes, start_time, end_time, status } = updateData;
        
        const [result] = await db.query(
            `UPDATE exams 
            SET title = COALESCE(?, title),
                description = COALESCE(?, description),
                duration_minutes = COALESCE(?, duration_minutes),
                start_time = COALESCE(?, start_time),
                end_time = COALESCE(?, end_time),
                status = COALESCE(?, status)
            WHERE id = ?`,
            [title, description, duration_minutes, start_time, end_time, status, id]
        );

        return result.affectedRows > 0;
    },

    // Xóa bài thi
    async delete(id) {
        const [result] = await db.query('DELETE FROM exams WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    // Đếm tổng số bài thi
    async count() {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM exams');
        return rows[0].total;
    }
};

module.exports = Exam;