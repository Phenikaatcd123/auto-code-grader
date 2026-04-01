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

            const question = await Question.findById(question_id);
            if (!question) {
                return res.status(404).json({ message: 'Question not found' });
            }

            let submission = await Submission.findByStudentAndQuestion(
                student_id, exam_id, question_id
            );

            if (submission && submission.status === 'submitted') {
                return res.status(400).json({ 
                    message: 'You have already submitted this question' 
                });
            }

            const submissionId = await Submission.create({
                student_id,
                exam_id,
                question_id,
                code,
                status: 'submitted'
            });

            await Draft.delete(student_id, exam_id, question_id);

            const job = await gradingQueue.add({
                submissionId,
                questionId: question_id
            }, {
                priority: 1,
                attempts: 3
            });

            console.log(`📦 Added grading job ${job.id} for submission ${submissionId}`);

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

    // ============= THÊM CÁC FUNCTION CÒN THIẾU =============

    // Lấy draft
    async getDraft(req, res) {
        try {
            const { exam_id, question_id } = req.params;
            const student_id = req.user.id;

            const draft = await Draft.findByStudentAndQuestion(
                student_id, exam_id, question_id
            );

            if (!draft) {
                return res.status(404).json({ message: 'No draft found' });
            }

            res.json(draft);

        } catch (error) {
            console.error('Get draft error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Lấy lịch sử nộp bài
    async getSubmissionHistory(req, res) {
        try {
            const student_id = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const submissions = await Submission.getStudentHistory(
                student_id, limit, offset
            );

            res.json({
                submissions,
                pagination: {
                    page,
                    limit,
                    hasMore: submissions.length === limit
                }
            });

        } catch (error) {
            console.error('Get history error:', error);
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

            if (submission.student_id !== student_id && req.user.role !== 'teacher') {
                return res.status(403).json({ message: 'Not authorized' });
            }

            if (submission.test_results) {
                submission.test_results = JSON.parse(submission.test_results);
            }

            res.json(submission);

        } catch (error) {
            console.error('Get result error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Lấy tất cả bài nộp của exam (cho giáo viên)
    async getExamSubmissions(req, res) {
        try {
            const { exam_id } = req.params;
            
            if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }

            const submissions = await Submission.findByExam(exam_id);

            const groupedByStudent = submissions.reduce((acc, sub) => {
                if (!acc[sub.student_id]) {
                    acc[sub.student_id] = {
                        student_id: sub.student_id,
                        student_name: sub.student_name,
                        student_email: sub.student_email,
                        submissions: []
                    };
                }
                acc[sub.student_id].submissions.push(sub);
                return acc;
            }, {});

            res.json(Object.values(groupedByStudent));

        } catch (error) {
            console.error('Get exam submissions error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Chấm điểm thủ công
    async manualGrade(req, res) {
        try {
            const { submissionId } = req.params;
            const { score, feedback } = req.body;

            if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }

            const submission = await Submission.findById(submissionId);
            if (!submission) {
                return res.status(404).json({ message: 'Submission not found' });
            }

            await Submission.updateGrade(submissionId, score, feedback, submission.test_results);

            res.json({
                message: 'Grade updated successfully',
                submissionId,
                score,
                feedback
            });

        } catch (error) {
            console.error('Manual grade error:', error);
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
    }
};

module.exports = submissionController;