const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Draft = {
    // Tạo hoặc cập nhật draft
    async save(draftData) {
        const { 
            id = uuidv4(),
            student_id,
            exam_id,
            question_id,
            code
        } = draftData;

        // Kiểm tra draft đã tồn tại chưa
        const existing = await this.findByStudentAndQuestion(student_id, exam_id, question_id);
        
        if (existing) {
            // Cập nhật draft cũ
            const [result] = await db.query(
                `UPDATE drafts 
                SET code = ?, last_auto_save = NOW()
                WHERE student_id = ? AND exam_id = ? AND question_id = ?`,
                [code, student_id, exam_id, question_id]
            );
            return existing.id;
        } else {
            // Tạo draft mới
            const [result] = await db.query(
                `INSERT INTO drafts (id, student_id, exam_id, question_id, code) 
                VALUES (?, ?, ?, ?, ?)`,
                [id, student_id, exam_id, question_id, code]
            );
            return id;
        }
    },

    // Tìm draft theo student và question
    async findByStudentAndQuestion(student_id, exam_id, question_id) {
        const [rows] = await db.query(
            `SELECT * FROM drafts 
            WHERE student_id = ? AND exam_id = ? AND question_id = ?`,
            [student_id, exam_id, question_id]
        );
        return rows[0];
    },

    // Lấy tất cả drafts của sinh viên trong một exam
    async findByStudentAndExam(student_id, exam_id) {
        const [rows] = await db.query(
            `SELECT d.*, q.title as question_title
            FROM drafts d
            LEFT JOIN questions q ON d.question_id = q.id
            WHERE d.student_id = ? AND d.exam_id = ?`,
            [student_id, exam_id]
        );
        return rows;
    },

    // Xóa draft sau khi nộp bài
    async delete(student_id, exam_id, question_id) {
        const [result] = await db.query(
            `DELETE FROM drafts 
            WHERE student_id = ? AND exam_id = ? AND question_id = ?`,
            [student_id, exam_id, question_id]
        );
        return result.affectedRows > 0;
    },

    // Xóa tất cả drafts của sinh viên trong exam (khi kết thúc exam)
    async deleteByStudentAndExam(student_id, exam_id) {
        const [result] = await db.query(
            'DELETE FROM drafts WHERE student_id = ? AND exam_id = ?',
            [student_id, exam_id]
        );
        return result.affectedRows;
    },

    // Tự động xóa các drafts cũ (cron job)
    async deleteOldDrafts(hours = 24) {
        const [result] = await db.query(
            'DELETE FROM drafts WHERE last_auto_save < NOW() - INTERVAL ? HOUR',
            [hours]
        );
        return result.affectedRows;
    }
};

module.exports = Draft;