// src/services/grading/index.js
const TestRunner = require('../testRunner');
const AIGradingService = require('./aiGradingService');

class GradingOrchestrator {
    constructor() {
        this.testRunner = new TestRunner();
        this.aiService = new AIGradingService(process.env.GEMINI_API_KEY);
    }

    async gradeSubmission(submission, question, testCases) {
        try {
            console.log(`🎯 Bắt đầu chấm bài cho submission ${submission.id}`);

            // Bước 1: Chạy test cases
            console.log('📊 Đang chạy test cases...');
            const testResults = await this.testRunner.runTests(
                submission.code,
                testCases,
                question.language
            );
            console.log(`✅ Hoàn thành test cases: ${testResults.passed}/${testResults.total}`);

            // Bước 2: Gọi AI để đánh giá
            console.log('🤖 Đang gọi AI đánh giá...');
            const aiResult = await this.aiService.gradeSubmission(
                question,
                submission.code,
                testResults
            );
            console.log('✅ AI đánh giá hoàn thành');

            // Bước 3: Tổng hợp kết quả
            const finalResult = {
                submissionId: submission.id,
                testResults: testResults,
                aiEvaluation: aiResult,
                score: aiResult.totalScore || (testResults.passed / testResults.total * question.max_score),
                feedback: aiResult.feedback,
                gradedAt: new Date().toISOString()
            };

            console.log(`📝 Kết quả: ${finalResult.score}/${question.max_score} điểm`);

            return finalResult;

        } catch (error) {
            console.error('❌ Grading error:', error);
            
            // Fallback grading
            return this.fallbackGrading(submission, question, testCases);
        }
    }

    async fallbackGrading(submission, question, testCases) {
        try {
            // Chỉ chạy test cases nếu AI lỗi
            const testResults = await this.testRunner.runTests(
                submission.code,
                testCases,
                question.language
            );
            
            const score = (testResults.passed / testResults.total) * question.max_score;
            
            return {
                submissionId: submission.id,
                testResults: testResults,
                aiEvaluation: null,
                score: score,
                feedback: this.generateBasicFeedback(testResults),
                gradedAt: new Date().toISOString(),
                note: 'Graded by test cases only (AI unavailable)'
            };
        } catch (error) {
            throw error;
        }
    }

    generateBasicFeedback(testResults) {
        const percentage = (testResults.passed / testResults.total) * 100;
        
        if (percentage === 100) {
            return '✅ Perfect! All test cases passed.';
        } else if (percentage >= 80) {
            return '👍 Good job! Most test cases passed.';
        } else if (percentage >= 50) {
            return '📝 You passed some test cases. Keep trying!';
        } else {
            return '⚠️ Most test cases failed. Please review your code.';
        }
    }
}

module.exports = GradingOrchestrator;