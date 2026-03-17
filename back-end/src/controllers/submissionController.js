// src/controllers/submissionController.js
const Submission = require('../models/Submission');
const Draft = require('../models/Draft');
const Question = require('../models/Question');
const Testcase = require('../models/Testcase');
const gradingQueue = require('../services/queue/gradingQueue');
const { validationResult } = require('express-validator');

let socketService; // Will be set from server.js

const submissionController = {
    // Set socket service
    setSocketService(service) {
        socketService = service;
    },

    // Nộp bài
    async submitCode(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { exam_id, question_id, code } = req.body;
            const student_id = req.user.id;

            // Kiểm tra question tồn tại
            const question = await Question.findById(question_id);
            if (!question) {
                return res.status(404).json({ message: 'Question not found' });
            }

            // Kiểm tra đã nộp chưa
            let submission = await Submission.findByStudentAndQuestion(
                student_id, exam_id, question_id
            );

            if (submission && submission.status === 'submitted') {
                return res.status(400).json({ 
                    message: 'You have already submitted this question' 
                });
            }

            // Lưu bài nộp
            const submissionId = await Submission.create({
                student_id,
                exam_id,
                question_id,
                code,
                status: 'submitted'
            });

            // Xóa draft nếu có
            await Draft.delete(student_id, exam_id, question_id);

            // Thêm vào queue để xử lý grading
            const job = await gradingQueue.add({
                submissionId,
                questionId: question_id
            }, {
                priority: 1,
                attempts: 3
            });

            console.log(`📦 Added grading job ${job.id} for submission ${submissionId}`);

            // Thông báo cho teacher qua socket
            if (socketService) {
                const submission = await Submission.findById(submissionId);
                socketService.notifyNewSubmission(submission, exam_id);
            }

            res.status(201).json({
                message: 'Code submitted successfully',
                submissionId,
                jobId: job.id,
                status: 'queued',
                estimatedTime: '30-60 seconds'
            });

        } catch (error) {
            console.error('Submit error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Lưu draft (auto-save)
    async saveDraft(req, res) {
        try {
            const { exam_id, question_id, code } = req.body;
            const student_id = req.user.id;

            const draftId = await Draft.save({
                student_id,
                exam_id,
                question_id,
                code
            });

            // Thông báo auto-save thành công
            if (socketService) {
                socketService.notifyAutoSave(student_id, exam_id, question_id, new Date());
            }

            res.json({
                message: 'Draft saved successfully',
                draftId,
                last_auto_save: new Date()
            });

        } catch (error) {
            console.error('Save draft error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Lấy kết quả bài nộp
    async getSubmissionResult(req, res) {
        try {
            const { submissionId } = req.params;
            const student_id = req.user.id;

            const submission = await Submission.findById(submissionId);

            if (!submission) {
                return res.status(404).json({ message: 'Submission not found' });
            }

            // Kiểm tra quyền
            if (submission.student_id !== student_id && req.user.role !== 'teacher') {
                return res.status(403).json({ message: 'Not authorized' });
            }

            // Parse test results nếu có
            if (submission.test_results) {
                submission.test_results = JSON.parse(submission.test_results);
            }

            res.json(submission);

        } catch (error) {
            console.error('Get result error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Lấy trạng thái job
    async getJobStatus(req, res) {
        try {
            const { jobId } = req.params;
            
            const job = await gradingQueue.getJob(jobId);
            
            if (!job) {
                return res.status(404).json({ message: 'Job not found' });
            }

            const state = await job.getState();
            const progress = job.progress();

            res.json({
                jobId,
                state,
                progress,
                data: job.data,
                attempts: job.attemptsMade,
                timestamp: job.timestamp
            });

        } catch (error) {
            console.error('Get job status error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // ... các methods khác giữ nguyên
};

module.exports = submissionController;