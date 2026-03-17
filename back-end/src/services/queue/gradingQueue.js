// src/services/queue/gradingQueue.js
const Queue = require('bull');
const GradingOrchestrator = require('../grading');
const Submission = require('../../models/Submission');
const Question = require('../../models/Question');
const Testcase = require('../../models/Testcase');

// Tạo queue
const gradingQueue = new Queue('grading', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || ''
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

// Xử lý job
gradingQueue.process(async (job, done) => {
    const { submissionId, questionId } = job.data;
    
    try {
        console.log(`🔄 Processing grading job for submission ${submissionId}`);

        // Lấy thông tin submission
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            throw new Error('Submission not found');
        }

        // Lấy thông tin question
        const question = await Question.findById(questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        // Lấy test cases
        const testCases = await Testcase.findByQuestion(questionId, true);

        // Khởi tạo grading orchestrator
        const orchestrator = new GradingOrchestrator();

        // Thực hiện grading
        const result = await orchestrator.gradeSubmission(
            submission,
            question,
            testCases
        );

        // Cập nhật kết quả
        await Submission.updateGrade(
            submissionId,
            result.score,
            result.feedback,
            JSON.stringify({
                testResults: result.testResults,
                aiEvaluation: result.aiEvaluation
            })
        );

        console.log(`✅ Grading completed for submission ${submissionId}`);

        // Trả về kết quả
        done(null, result);

    } catch (error) {
        console.error(`❌ Grading failed for submission ${submissionId}:`, error);
        
        // Cập nhật trạng thái lỗi
        await Submission.update(submissionId, {
            status: 'submitted',
            feedback: 'Grading failed. Please try again or contact teacher.'
        });

        done(error);
    }
});

// Event listeners
gradingQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed for submission ${job.data.submissionId}`);
});

gradingQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
});

gradingQueue.on('stalled', (job) => {
    console.warn(`Job ${job.id} stalled, will be retried`);
});

// Clean old jobs periodically
setInterval(async () => {
    await gradingQueue.clean(24 * 3600 * 1000, 'completed'); // Clean completed jobs after 24h
    await gradingQueue.clean(24 * 3600 * 1000, 'failed'); // Clean failed jobs after 24h
}, 60 * 60 * 1000); // Run every hour

module.exports = gradingQueue;