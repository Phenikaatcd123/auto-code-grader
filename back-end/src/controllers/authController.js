const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const authController = {
    // Đăng ký user mới
    async register(req, res) {
        try {
            // Kiểm tra validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, full_name, role } = req.body;

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            // Tạo user mới
            const userId = uuidv4();
            await User.create({
                id: userId,
                email,
                password_hash,
                full_name,
                role: role || 'student'
            });

            // Tạo JWT token
            const token = jwt.sign(
                { id: userId, email, role: role || 'student' },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            // Lấy thông tin user vừa tạo
            const newUser = await User.findById(userId);

            res.status(201).json({
                message: 'User created successfully',
                token,
                user: newUser
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Đăng nhập
    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Tìm user bằng email
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Kiểm tra password
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Kiểm tra tài khoản active
            if (!user.is_active) {
                return res.status(403).json({ message: 'Account is disabled' });
            }

            // Tạo token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            // Không trả về password_hash
            delete user.password_hash;

            res.json({
                message: 'Login successful',
                token,
                user
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Lấy thông tin user hiện tại
    async getMe(req, res) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            console.error('Get me error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = authController;