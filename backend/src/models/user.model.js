const db = require('../config/db');

exports.createUser = (name, email, password, role) => {
    return db.promise().query(
        'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
        [name, email, password, role]
    );
};

exports.findUserByEmail = (email) => {
    return db.promise().query(
        'SELECT * FROM users WHERE email=?',
        [email]
    );
};