const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const examController = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const examValidation = [
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('duration_minutes').optional().isInt({ min: 1 }),
    body('start_time').optional().isISO8601(),
    body('end_time').optional().isISO8601()
];

const questionValidation = [
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('language').optional().isIn(['python', 'javascript', 'java', 'c', 'cpp']),
    body('max_score').optional().isInt({ min: 1, max: 1000 }),
    body('order_index').isInt({ min: 0 })
];

// Exam routes
router.route('/')
    .get(protect, examController.getAllExams)
    .post(protect, authorize('teacher', 'admin'), examValidation, examController.createExam);

router.route('/:id')
    .get(protect, examController.getExamById)
    .put(protect, authorize('teacher', 'admin'), examValidation, examController.updateExam)
    .delete(protect, authorize('teacher', 'admin'), examController.deleteExam);

// Question routes
router.route('/:exam_id/questions')
    .get(protect, examController.getQuestions)
    .post(protect, authorize('teacher', 'admin'), questionValidation, examController.addQuestion);

module.exports = router;