const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Submission = {
    // Tạo bài nộp mới
    async create(submissionData) {
        const { 
            id = uuidv4(),
            student_id,
            exam_id,
            question_id,
            code,
            status = 'draft',
            score = null,
            feedback = null,
            execution_time = null,
            memory_used = null,
            test_results = null
        } = submissionData;

        const [result] = await db.query(
            `INSERT INTO submissions 
            (id, student_id, exam_id, question_id, code, status, score, feedback, 
             execution_time, memory_used, test_results, submitted_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, student_id, exam_id, question_id, code, status, score, feedback,
             execution_time, memory_used, test_results, status === 'submitted' ? new Date() : null]
        );

        return id;
    },

    // Tìm bài nộp theo ID
    async findById(id) {
        const [rows] = await db.query(
            `SELECT s.*, u.full_name as student_name, q.title as question_title, e.title as exam_title
            FROM submissions s
            LEFT JOIN users u ON s.student_id = u.id
            LEFT JOIN questions q ON s.question_id = q.id
            LEFT JOIN exams e ON s.exam_id = e.id
            WHERE s.id = ?`,
            [id]
        );
        return rows[0];
    },

    // Tìm bài nộp của sinh viên cho một question trong exam
    async findByStudentAndQuestion(student_id, exam_id, question_id) {
        const [rows] = await db.query(
            `SELECT * FROM submissions 
            WHERE student_id = ? AND exam_id = ? AND question_id = ?
            ORDER BY created_at DESC LIMIT 1`,
            [student_id, exam_id, question_id]
        );
        return rows[0];
    },

    // Lấy tất cả bài nộp của sinh viên trong một exam
    async findByStudentAndExam(student_id, exam_id) {
        const [rows] = await db.query(
            `SELECT s.*, q.title as question_title, q.max_score
            FROM submissions s
            LEFT JOIN questions q ON s.question_id = q.id
            WHERE s.student_id = ? AND s.exam_id = ?
            ORDER BY q.order_index ASC`,
            [student_id, exam_id]
        );
        return rows;
    },

    // Lấy tất cả bài nộp của một exam (cho giáo viên)
    async findByExam(exam_id) {
        const [rows] = await db.query(
            `SELECT s.*, u.full_name as student_name, u.email as student_email,
                    q.title as question_title
            FROM submissions s
            LEFT JOIN users u ON s.student_id = u.id
            LEFT JOIN questions q ON s.question_id = q.id
            WHERE s.exam_id = ?
            ORDER BY s.created_at DESC`,
            [exam_id]
        );
        return rows;
    },

    // Cập nhật bài nộp
    async update(id, updateData) {
        const { 
            code, 
            status, 
            score, 
            feedback, 
            execution_time, 
            memory_used, 
            test_results 
        } = updateData;

        const [result] = await db.query(
            `UPDATE submissions 
            SET code = COALESCE(?, code),
                status = COALESCE(?, status),
                score = COALESCE(?, score),
                feedback = COALESCE(?, feedback),
                execution_time = COALESCE(?, execution_time),
                memory_used = COALESCE(?, memory_used),
                test_results = COALESCE(?, test_results),
                submitted_at = CASE WHEN ? = 'submitted' AND status != 'submitted' 
                                   THEN NOW() ELSE submitted_at END
            WHERE id = ?`,
            [code, status, score, feedback, execution_time, memory_used, 
             test_results, status, id]
        );

        return result.affectedRows > 0;
    },

    // Cập nhật điểm và feedback sau khi chấm
    async updateGrade(id, score, feedback, test_results) {
        const [result] = await db.query(
            `UPDATE submissions 
            SET score = ?, feedback = ?, test_results = ?, status = 'graded'
            WHERE id = ?`,
            [score, feedback, test_results, id]
        );
        return result.affectedRows > 0;
    },

    // Lấy thống kê bài nộp của sinh viên
    async getStudentStats(student_id, exam_id) {
        const [rows] = await db.query(
            `SELECT 
                COUNT(*) as total_questions,
                SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded_count,
                SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted_count,
                SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
                AVG(score) as average_score,
                SUM(score) as total_score
            FROM submissions
            WHERE student_id = ? AND exam_id = ?`,
            [student_id, exam_id]
        );
        return rows[0];
    },

    // Lấy lịch sử nộp bài của sinh viên (có phân trang)
    async getStudentHistory(student_id, limit = 20, offset = 0) {
        const [rows] = await db.query(
            `SELECT s.*, e.title as exam_title, q.title as question_title
            FROM submissions s
            LEFT JOIN exams e ON s.exam_id = e.id
            LEFT JOIN questions q ON s.question_id = q.id
            WHERE s.student_id = ?
            ORDER BY s.created_at DESC
            LIMIT ? OFFSET ?`,
            [student_id, limit, offset]
        );
        return rows;
    }
};

module.exports = Submission;