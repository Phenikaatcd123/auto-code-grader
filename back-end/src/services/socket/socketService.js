// src/services/socket/socketService.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                credentials: true
            },
            connectionStateRecovery: {
                maxDisconnectionDuration: 2 * 60 * 1000 // 2 minutes
            }
        });

        this.userSockets = new Map(); // userId -> socketId[]
        this.authenticate();
        this.setupEventHandlers();
    }

    authenticate() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication required'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.id;
                socket.userRole = decoded.role;
                
                next();
            } catch (error) {
                next(new Error('Invalid token'));
            }
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 User ${socket.userId} connected`);

            // Lưu socket ID
            if (!this.userSockets.has(socket.userId)) {
                this.userSockets.set(socket.userId, []);
            }
            this.userSockets.get(socket.userId).push(socket.id);

            // Join room theo role
            socket.join(`user:${socket.userId}`);
            socket.join(`role:${socket.userRole}`);

            // Xử lý disconnect
            socket.on('disconnect', () => {
                console.log(`🔌 User ${socket.userId} disconnected`);
                const sockets = this.userSockets.get(socket.userId);
                if (sockets) {
                    const index = sockets.indexOf(socket.id);
                    if (index > -1) {
                        sockets.splice(index, 1);
                    }
                    if (sockets.length === 0) {
                        this.userSockets.delete(socket.userId);
                    }
                }
            });

            // Xử lý join exam room
            socket.on('join-exam', (examId) => {
                socket.join(`exam:${examId}`);
                console.log(`User ${socket.userId} joined exam ${examId}`);
            });

            // Xử lý leave exam room
            socket.on('leave-exam', (examId) => {
                socket.leave(`exam:${examId}`);
                console.log(`User ${socket.userId} left exam ${examId}`);
            });
        });
    }

    // Gửi thông báo cho user cụ thể
    notifyUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }

    // Gửi thông báo cho nhiều user
    notifyUsers(userIds, event, data) {
        userIds.forEach(userId => {
            this.io.to(`user:${userId}`).emit(event, data);
        });
    }

    // Gửi thông báo cho tất cả user trong exam
    notifyExam(examId, event, data) {
        this.io.to(`exam:${examId}`).emit(event, data);
    }

    // Gửi thông báo cho tất cả user theo role
    notifyRole(role, event, data) {
        this.io.to(`role:${role}`).emit(event, data);
    }

    // Gửi thông báo grading completed
    notifyGradingCompleted(submissionId, studentId, result) {
        this.notifyUser(studentId, 'grading:completed', {
            submissionId,
            score: result.score,
            feedback: result.feedback,
            gradedAt: new Date().toISOString()
        });

        // Thông báo cho teacher (nếu cần)
        this.notifyRole('teacher', 'grading:completed', {
            submissionId,
            studentId,
            score: result.score
        });
    }

    // Gửi thông báo submission mới cho teacher
    notifyNewSubmission(submission, examId) {
        this.notifyExam(examId, 'submission:new', {
            submissionId: submission.id,
            studentId: submission.student_id,
            studentName: submission.student_name,
            questionId: submission.question_id,
            submittedAt: new Date().toISOString()
        });
    }

    // Gửi thông báo auto-save
    notifyAutoSave(studentId, examId, questionId, savedAt) {
        this.notifyUser(studentId, 'draft:saved', {
            examId,
            questionId,
            savedAt
        });
    }
}

module.exports = SocketService;