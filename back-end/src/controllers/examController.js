const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { validationResult } = require('express-validator');

const examController = {
    // Tạo bài thi mới
    async createExam(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, description, duration_minutes, start_time, end_time } = req.body;
            
            const examId = await Exam.create({
                title,
                description,
                teacher_id: req.user.id, // Lấy từ token
                duration_minutes,
                start_time,
                end_time,
                status: 'draft'
            });

            const exam = await Exam.findById(examId);
            
            res.status(201).json({
                message: 'Exam created successfully',
                exam
            });
        } catch (error) {
            console.error('Create exam error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Lấy tất cả bài thi
    async getAllExams(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const exams = await Exam.findAll(limit, offset);
            const total = await Exam.count();

            res.json({
                exams,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get exams error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Lấy bài thi theo ID
    async getExamById(req, res) {
        try {
            const { id } = req.params;
            
            const exam = await Exam.findById(id);
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found' });
            }

            // Lấy danh sách câu hỏi của bài thi
            const questions = await Question.findByExam(id);
            exam.questions = questions;

            res.json(exam);
        } catch (error) {
            console.error('Get exam error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Cập nhật bài thi
    async updateExam(req, res) {
        try {
            const { id } = req.params;
            const { title, description, duration_minutes, start_time, end_time, status } = req.body;

            // Kiểm tra bài thi tồn tại
            const exam = await Exam.findById(id);
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found' });
            }

            // Kiểm tra quyền (chỉ teacher tạo bài thi mới được sửa)
            if (exam.teacher_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to update this exam' });
            }

            await Exam.update(id, {
                title,
                description,
                duration_minutes,
                start_time,
                end_time,
                status
            });

            const updatedExam = await Exam.findById(id);
            
            res.json({
                message: 'Exam updated successfully',
                exam: updatedExam
            });
        } catch (error) {
            console.error('Update exam error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Xóa bài thi
    async deleteExam(req, res) {
        try {
            const { id } = req.params;

            const exam = await Exam.findById(id);
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found' });
            }

            // Kiểm tra quyền
            if (exam.teacher_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to delete this exam' });
            }

            // Xóa tất cả câu hỏi trước
            await Question.deleteByExam(id);
            // Xóa bài thi
            await Exam.delete(id);

            res.json({ message: 'Exam deleted successfully' });
        } catch (error) {
            console.error('Delete exam error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Thêm câu hỏi vào bài thi
    async addQuestion(req, res) {
        try {
            const { exam_id } = req.params;
            const { title, description, language, max_score, order_index } = req.body;

            // Kiểm tra bài thi tồn tại
            const exam = await Exam.findById(exam_id);
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found' });
            }

            // Kiểm tra quyền
            if (exam.teacher_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }

            const questionId = await Question.create({
                exam_id,
                title,
                description,
                language,
                max_score,
                order_index
            });

            const question = await Question.findById(questionId);

            res.status(201).json({
                message: 'Question added successfully',
                question
            });
        } catch (error) {
            console.error('Add question error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Lấy danh sách câu hỏi của bài thi
    async getQuestions(req, res) {
        try {
            const { exam_id } = req.params;

            const exam = await Exam.findById(exam_id);
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found' });
            }

            const questions = await Question.findByExam(exam_id);
            
            res.json(questions);
        } catch (error) {
            console.error('Get questions error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = examController;