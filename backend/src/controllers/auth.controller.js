const db = require('../config/db');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/jwt');

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