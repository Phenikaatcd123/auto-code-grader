const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const submissionController = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const submitValidation = [
    body('exam_id').notEmpty().isUUID(),
    body('question_id').notEmpty().isUUID(),
    body('code').notEmpty()
];

const draftValidation = [
    body('exam_id').notEmpty().isUUID(),
    body('question_id').notEmpty().isUUID(),
    body('code').notEmpty()
];

// ==================== STUDENT ROUTES ====================
// Nộp bài
router.post('/submit', protect, submitValidation, submissionController.submitCode);

// Lưu draft (auto-save)
router.post('/draft', protect, draftValidation, submissionController.saveDraft);

// Lấy draft đã lưu
router.get('/draft/:exam_id/:question_id', protect, submissionController.getDraft);

// Lấy lịch sử nộp bài
router.get('/history', protect, submissionController.getSubmissionHistory);

// Lấy kết quả bài nộp theo ID
router.get('/:submissionId', protect, submissionController.getSubmissionResult);

// Lấy trạng thái job grading
router.get('/job/:jobId', protect, submissionController.getJobStatus);

// ==================== TEACHER ROUTES ====================
// Lấy tất cả bài nộp của một exam
router.get('/exam/:exam_id', protect, authorize('teacher', 'admin'), submissionController.getExamSubmissions);

// Chấm điểm thủ công (ghi đè)
router.put('/:submissionId/grade', protect, authorize('teacher', 'admin'), submissionController.manualGrade);

// ==================== TEST ROUTES ====================
// Test AI grading (chỉ cho teacher/admin)
router.post('/test-ai-grading', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { code, language, questionTitle, questionDescription } = req.body;
        
        const GradingOrchestrator = require('../services/grading');
        const orchestrator = new GradingOrchestrator();
        
        // Tạo question giả
        const question = {
            title: questionTitle || 'Test Question',
            description: questionDescription || 'Write a function to solve the problem',
            language: language || 'python',
            max_score: 100
        };
        
        // Test cases mẫu
        const testCases = [
            { input: '5\n3', expected_output: '8', is_hidden: false },
            { input: '10\n20', expected_output: '30', is_hidden: false }
        ];
        
        // Tạo submission giả
        const submission = {
            id: 'test-' + Date.now(),
            code: code
        };
        
        // Test AI grading
        const result = await orchestrator.gradeSubmission(submission, question, testCases);
        
        res.json(result);
        
    } catch (error) {
        console.error('Test AI grading error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;