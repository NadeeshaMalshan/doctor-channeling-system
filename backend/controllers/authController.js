const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.registerPatient = async (req, res) => {
    const { firstName, secondName, email, phone, nic, password } = req.body;

    try {
        // Validation
        if (!firstName || !secondName || !email || !phone || !nic || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM patients WHERE email = ? OR nic = ?',
            [email, nic]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'User with this email or NIC already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await db.execute(
            'INSERT INTO patients (first_name, second_name, email, phone, nic, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
            [firstName, secondName, email, phone, nic, hashedPassword]
        );

        res.status(201).json({ message: 'Patient registered successfully', userId: result.insertId });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};
