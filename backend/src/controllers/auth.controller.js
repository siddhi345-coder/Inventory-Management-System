const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
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

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const userResult = await new Promise((resolve, reject) => {
            db.query('SELECT id, name FROM users WHERE email = ?', [email], (err, result) => {
                if (err) reject(err); else resolve(result);
            });
        });

        if (userResult.length === 0) {
            return res.status(404).json({ message: 'No account found with that email' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
                [token, expires, email],
                (err, result) => { if (err) reject(err); else resolve(result); }
            );
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        await transporter.sendMail({
            from: `"Laptop IMS" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <p>Hi ${userResult[0].name},</p>
                <p>You requested a password reset. Click the link below to set a new password:</p>
                <a href="${resetLink}" style="background:#667eea;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0">Reset Password</a>
                <p>This link expires in <strong>1 hour</strong>.</p>
                <p>If you did not request this, ignore this email.</p>
            `
        });

        res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Failed to send reset email' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const userResult = await new Promise((resolve, reject) => {
            db.query(
                'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
                [token],
                (err, result) => { if (err) reject(err); else resolve(result); }
            );
        });

        if (userResult.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const hash = await bcrypt.hash(newPassword, 10);

        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
                [hash, userResult[0].id],
                (err, result) => { if (err) reject(err); else resolve(result); }
            );
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
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