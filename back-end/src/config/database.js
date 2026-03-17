const mysql = require('mysql2');
require('dotenv').config();

// Tạo connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Kiểm tra kết nối
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('👉 Please make sure MySQL server is running');
        }
        return;
    }
    console.log('✅ Connected to MySQL database successfully!');
    connection.release();
});

// Chuyển đổi pool sang dạng Promise để dễ sử dụng với async/await
const promisePool = pool.promise();

module.exports = promisePool;