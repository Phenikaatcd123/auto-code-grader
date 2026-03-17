const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Question = {
    // Tạo câu hỏi mới
    async create(questionData) {
        const { 
            id = uuidv4(),
            exam_id,
            title,
            description,
            language = 'python',
            max_score = 100,
            order_index
        } = questionData;

        const [result] = await db.query(
            `INSERT INTO questions 
            (id, exam_id, title, description, language, max_score, order_index) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, exam_id, title, description, language, max_score, order_index]
        );

        return id;
    },

    // Lấy tất cả câu hỏi của một bài thi
    async findByExam(exam_id) {
        const [rows] = await db.query(
            `SELECT * FROM questions 
            WHERE exam_id = ? 
            ORDER BY order_index ASC`,
            [exam_id]
        );
        return rows;
    },

    // Lấy câu hỏi theo ID
    async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM questions WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Cập nhật câu hỏi
    async update(id, updateData) {
        const { title, description, language, max_score, order_index } = updateData;

        const [result] = await db.query(
            `UPDATE questions 
            SET title = COALESCE(?, title),
                description = COALESCE(?, description),
                language = COALESCE(?, language),
                max_score = COALESCE(?, max_score),
                order_index = COALESCE(?, order_index)
            WHERE id = ?`,
            [title, description, language, max_score, order_index, id]
        );

        return result.affectedRows > 0;
    },

    // Xóa câu hỏi
    async delete(id) {
        const [result] = await db.query('DELETE FROM questions WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    // Xóa tất cả câu hỏi của một bài thi
    async deleteByExam(exam_id) {
        const [result] = await db.query('DELETE FROM questions WHERE exam_id = ?', [exam_id]);
        return result.affectedRows;
    },

    // Đếm số câu hỏi của bài thi
    async countByExam(exam_id) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM questions WHERE exam_id = ?',
            [exam_id]
        );
        return rows[0].total;
    }
};

module.exports = Question;