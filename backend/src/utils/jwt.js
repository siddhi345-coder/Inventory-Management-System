const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not found');
        }
        return jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
    } catch (error) {
        console.error('JWT generation error:', error.message);
        throw error;
    }
};

module.exports = generateToken;