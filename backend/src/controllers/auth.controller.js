const db = require('../config/db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const generateToken = require('../utils/jwt');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hash = await bcrypt.hash(password, 10);

        const result = await new Promise((resolve, reject) => {
            db.query(
                'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
                [name, email, hash, role],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        // Get the newly created user
        const userResult = await new Promise((resolve, reject) => {
            db.query(
                'SELECT id, name, email, role FROM users WHERE id = ?',
                [result.insertId],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        const user = userResult[0];
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
};

exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const userResult = await new Promise((resolve, reject) => {
            db.query('SELECT id, name FROM users WHERE email = ?', [email], (err, result) => {
                if (err) reject(err); else resolve(result);
            });
        });

        if (userResult.length === 0)
            return res.status(404).json({ message: 'No account found with that email' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?',
                [otp, expires, email],
                (err, result) => { if (err) reject(err); else resolve(result); }
            );
        });

        await transporter.sendMail({
            from: `"Laptop IMS" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Password Reset OTP',
            html: `
                <div style="font-family:sans-serif;max-width:400px;margin:auto">
                    <h2 style="color:#667eea">Password Reset OTP</h2>
                    <p>Hi ${userResult[0].name},</p>
                    <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
                    <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#764ba2;padding:16px;background:#f3f0ff;border-radius:8px;text-align:center">${otp}</div>
                    <p style="color:#718096;font-size:13px;margin-top:16px">If you did not request this, ignore this email.</p>
                </div>
            `
        });

        res.json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

exports.verifyOtpAndReset = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const userResult = await new Promise((resolve, reject) => {
            db.query(
                'SELECT id FROM users WHERE email = ? AND otp = ? AND otp_expires > NOW()',
                [email, otp],
                (err, result) => { if (err) reject(err); else resolve(result); }
            );
        });

        if (userResult.length === 0)
            return res.status(400).json({ message: 'Invalid or expired OTP' });

        const hash = await bcrypt.hash(newPassword, 10);

        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE users SET password = ?, otp = NULL, otp_expires = NULL WHERE id = ?',
                [hash, userResult[0].id],
                (err, result) => { if (err) reject(err); else resolve(result); }
            );
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Failed to reset password' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const userResult = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        if (userResult.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = userResult[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken({ id: user.id, name: user.name, email: user.email, role: user.role });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};