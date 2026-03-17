const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TestRunner {
    constructor() {
        this.tempDir = path.join(__dirname, '../../temp');
        this.timeout = 10000; // 10 seconds
    }

    async runTests(code, testCases, language) {
        // Tạo file tạm
        const fileName = `${uuidv4()}.${this.getExtension(language)}`;
        const filePath = path.join(this.tempDir, fileName);
        
        try {
            // Đảm bảo thư mục temp tồn tại
            await fs.mkdir(this.tempDir, { recursive: true });
            
            // Ghi code vào file
            await fs.writeFile(filePath, code);

            const results = {
                passed: 0,
                total: testCases.length,
                details: []
            };

            // Chạy từng test case
            for (const testCase of testCases) {
                const result = await this.runSingleTest(
                    filePath,
                    testCase,
                    language
                );
                results.details.push(result);
                if (result.passed) results.passed++;
            }

            return results;

        } catch (error) {
            console.error('Test runner error:', error);
            return {
                passed: 0,
                total: testCases.length,
                error: error.message,
                details: []
            };
        } finally {
            // Dọn dẹp file tạm
            try {
                await fs.unlink(filePath);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    }

    async runSingleTest(filePath, testCase, language) {
        const command = this.getCommand(filePath, language, testCase.input_data);
        
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            exec(command, { timeout: this.timeout }, (error, stdout, stderr) => {
                const executionTime = Date.now() - startTime;
                
                const result = {
                    input: testCase.input_data,
                    expected: testCase.expected_output,
                    actual: stdout.trim(),
                    error: stderr,
                    executionTime,
                    passed: false
                };

                if (error) {
                    result.error = error.message;
                } else {
                    // So sánh output (bỏ qua khoảng trắng thừa)
                    const normalizeOutput = (str) => str.trim().replace(/\s+/g, ' ');
                    result.passed = normalizeOutput(stdout) === normalizeOutput(testCase.expected_output);
                }

                resolve(result);
            });
        });
    }

    getExtension(language) {
        const extensions = {
            python: 'py',
            javascript: 'js',
            java: 'java',
            c: 'c',
            cpp: 'cpp'
        };
        return extensions[language] || 'txt';
    }

    getCommand(filePath, language, input) {
        const escapedInput = input.replace(/"/g, '\\"');
        
        const commands = {
            python: `echo "${escapedInput}" | python ${filePath}`,
            javascript: `echo "${escapedInput}" | node ${filePath}`,
            java: `echo "${escapedInput}" | java ${filePath}`,
            c: `gcc ${filePath} -o ${filePath}.out && echo "${escapedInput}" | ${filePath}.out`,
            cpp: `g++ ${filePath} -o ${filePath}.out && echo "${escapedInput}" | ${filePath}.out`
        };
        
        return commands[language] || commands.python;
    }
}

module.exports = TestRunner;