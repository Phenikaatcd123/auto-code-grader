// src/services/grading/aiGradingService.js
const axios = require('axios');

class AIGradingService {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    async gradeSubmission(question, studentCode, testResults) {
        try {
            const prompt = this.buildPrompt(question, studentCode, testResults);
            
            const response = await axios.post(
                `${this.apiUrl}?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 1024
                    }
                }
            );

            return this.parseAIResponse(response.data, testResults);
        } catch (error) {
            console.error('AI Grading error:', error.response?.data || error.message);
            return this.getFallbackGrading(testResults);
        }
    }

    buildPrompt(question, studentCode, testResults) {
        return `Bạn là giáo viên chấm bài lập trình. Hãy phân tích code sau:

THÔNG TIN BÀI TẬP:
Tiêu đề: ${question.title}
Mô tả: ${question.description}
Ngôn ngữ: ${question.language}
Điểm tối đa: ${question.max_score}

CODE CỦA SINH VIÊN:
\`\`\`${question.language}
${studentCode}
\`\`\`

KẾT QUẢ TEST:
Đúng ${testResults.passed}/${testResults.total} test cases
${testResults.details?.map(t => `- Input: ${t.input} | Output: ${t.actual} | Expected: ${t.expected} | ${t.passed ? '✅' : '❌'}`).join('\n')}

Hãy đánh giá theo các tiêu chí sau:
1. TÍNH ĐÚNG ĐẮN (0-10): Code có giải đúng bài toán không?
2. CHẤT LƯỢNG CODE (0-10): Tên biến, cấu trúc, comment, best practices?
3. HIỆU SUẤT (0-10): Code có tối ưu không? Độ phức tạp?
4. LỖI LOGIC: Có lỗi tiềm ẩn không? Edge cases?
5. GỢI Ý CẢI THIỆN: Cách làm code tốt hơn?

Trả về KẾT QUẢ dạng JSON:
{
    "correctness": number,
    "quality": number,
    "performance": number,
    "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
    "weaknesses": ["điểm yếu 1", "điểm yếu 2"],
    "suggestions": ["gợi ý 1", "gợi ý 2"],
    "summary": "nhận xét tổng quan ngắn gọn"
}`;
    }

    parseAIResponse(response, testResults) {
        try {
            const text = response.candidates[0].content.parts[0].text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                const aiResult = JSON.parse(jsonMatch[0]);
                
                // Tính điểm tổng hợp (70% test cases, 30% AI)
                const testScore = (testResults.passed / testResults.total) * 70;
                const aiScore = (aiResult.correctness + aiResult.quality + aiResult.performance) / 30 * 30;
                const totalScore = Math.round((testScore + aiScore) * 100) / 100;
                
                return {
                    ...aiResult,
                    testScore: testResults.passed / testResults.total * 70,
                    aiScore: aiScore,
                    totalScore: totalScore,
                    feedback: this.generateDetailedFeedback(aiResult, testResults)
                };
            }
        } catch (e) {
            console.error('Parse AI response error:', e);
        }
        
        return this.getFallbackGrading(testResults);
    }

    generateDetailedFeedback(aiResult, testResults) {
        const feedback = [];
        
        // Test results
        if (testResults.passed === testResults.total) {
            feedback.push('✅ Tất cả test cases đều đúng!');
        } else {
            feedback.push(`⚠️ Đúng ${testResults.passed}/${testResults.total} test cases.`);
        }
        
        // AI strengths
        if (aiResult.strengths?.length) {
            feedback.push('\n🌟 Điểm mạnh:');
            aiResult.strengths.forEach(s => feedback.push(`  • ${s}`));
        }
        
        // AI weaknesses
        if (aiResult.weaknesses?.length) {
            feedback.push('\n📝 Cần cải thiện:');
            aiResult.weaknesses.forEach(w => feedback.push(`  • ${w}`));
        }
        
        // Suggestions
        if (aiResult.suggestions?.length) {
            feedback.push('\n💡 Gợi ý cải thiện:');
            aiResult.suggestions.forEach(s => feedback.push(`  • ${s}`));
        }
        
        // Summary
        if (aiResult.summary) {
            feedback.push(`\n📌 ${aiResult.summary}`);
        }
        
        return feedback.join('\n');
    }

    getFallbackGrading(testResults) {
        const percentage = testResults.passed / testResults.total * 100;
        
        return {
            correctness: percentage / 10,
            quality: 5,
            performance: 5,
            strengths: ['Code đã chạy được'],
            weaknesses: ['Cần cải thiện thêm'],
            suggestions: ['Xem lại các test cases failed', 'Tối ưu code'],
            summary: `Đúng ${testResults.passed}/${testResults.total} test cases`,
            totalScore: percentage,
            feedback: `Đúng ${testResults.passed}/${testResults.total} test cases. ${percentage}%`
        };
    }
}

module.exports = AIGradingService;