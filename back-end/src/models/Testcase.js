const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Testcase = {
    // Tạo test case mới
    async create(testcaseData) {
        const { 
            id = uuidv4(),
            question_id,
            input_data,
            expected_output,
            is_hidden = false,
            order_index = 0,
            description = ''
        } = testcaseData;

        const [result] = await db.query(
            `INSERT INTO testcases 
            (id, question_id, input_data, expected_output, is_hidden, order_index, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, question_id, input_data, expected_output, is_hidden, order_index, description]
        );

        return id;
    },

    // Lấy test cases theo question
    async findByQuestion(question_id, includeHidden = false) {
        let query = 'SELECT * FROM testcases WHERE question_id = ?';
        if (!includeHidden) {
            query += ' AND is_hidden = false';
        }
        query += ' ORDER BY order_index ASC';
        
        const [rows] = await db.query(query, [question_id]);
        return rows;
    },

    // Lấy test case theo ID
    async findById(id) {
        const [rows] = await db.query('SELECT * FROM testcases WHERE id = ?', [id]);
        return rows[0];
    },

    // Cập nhật test case
    async update(id, updateData) {
        const { input_data, expected_output, is_hidden, order_index, description } = updateData;

        const [result] = await db.query(
            `UPDATE testcases 
            SET input_data = COALESCE(?, input_data),
                expected_output = COALESCE(?, expected_output),
                is_hidden = COALESCE(?, is_hidden),
                order_index = COALESCE(?, order_index),
                description = COALESCE(?, description)
            WHERE id = ?`,
            [input_data, expected_output, is_hidden, order_index, description, id]
        );

        return result.affectedRows > 0;
    },

    // Xóa test case
    async delete(id) {
        const [result] = await db.query('DELETE FROM testcases WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    // Xóa tất cả test cases của một question
    async deleteByQuestion(question_id) {
        const [result] = await db.query('DELETE FROM testcases WHERE question_id = ?', [question_id]);
        return result.affectedRows;
    },

    // Đếm số test cases của question
    async countByQuestion(question_id) {
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM testcases WHERE question_id = ?',
            [question_id]
        );
        return rows[0].total;
    },

    // Lấy hidden test cases (cho giáo viên)
    async findHiddenByQuestion(question_id) {
        const [rows] = await db.query(
            'SELECT * FROM testcases WHERE question_id = ? AND is_hidden = true ORDER BY order_index ASC',
            [question_id]
        );
        return rows;
    }
};

module.exports = Testcase;