// server.js
const app = require('./src/app');
const http = require('http');
const db = require('./src/config/database');
const SocketService = require('./src/services/socket/socketService');
const submissionController = require('./src/controllers/submissionController');

const PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 5001;

// Tạo HTTP server
const server = http.createServer(app);

// Khởi tạo Socket.io service
const socketService = new SocketService(server);

// Set socket service cho controller
submissionController.setSocketService(socketService);

// Khởi động server
server.listen(PORT, () => {
    console.log(`
    🚀 Server is running on port ${PORT}
    🔌 Socket.io is running on port ${SOCKET_PORT}
    📝 Environment: ${process.env.NODE_ENV || 'development'}
    🔗 http://localhost:${PORT}
    `);
});

// Kiểm tra kết nối database
db.getConnection()
    .then(() => {
        console.log('✅ Connected to MySQL database successfully!');
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// Xử lý graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('💤 Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('💤 Process terminated');
        process.exit(0);
    });
});