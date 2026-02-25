const db = require('../config/db');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const verifyRecaptcha = async (token) => {
    if (!token) return false;

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
        );
        return response.data.success;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
    }
};

exports.registerPatient = async (req, res) => {
    const { firstName, secondName, email, phone, nic, password, recaptchaToken } = req.body;

    try {
        // Validation
        if (!firstName || !secondName || !email || !phone || !nic || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Verify reCAPTCHA
        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
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

exports.staffLogin = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Validation
        if (!username || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const [staffMembers] = await db.execute(
            'SELECT * FROM staff WHERE username = ?',
            [username]
        );

        if (staffMembers.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const staff = staffMembers[0];

        // Check Role
        if (staff.role !== role) {
            return res.status(401).json({ message: 'Invalid role for this user' });
        }

        // Check Account Status
        if (staff.account_status !== 'Active') {
            return res.status(403).json({ message: 'Account is not active. Please contact administrator.' });
        }

        // Verify Password
        const isMatch = await bcrypt.compare(password, staff.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return success (In a real app, you'd generate a JWT token here)
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: staff.id,
                username: staff.username,
                role: staff.role
            }
        });

    } catch (error) {
        console.error('Staff login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.registerDoctor = async (req, res) => {
    const { name, specialization, slmcId, nic, email, phone, hospital, password, recaptchaToken } = req.body;

    try {
        // Validation
        if (!name || !specialization || !slmcId || !nic || !email || !phone || !password) {
            return res.status(400).json({ message: 'Required fields are missing' });
        }

        // Verify reCAPTCHA
        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
        }

        // Check if doctor already exists
        const [existingDoctors] = await db.execute(
            'SELECT * FROM doctors WHERE email = ? OR nic = ? OR slmc_id = ?',
            [email, nic, slmcId]
        );

        if (existingDoctors.length > 0) {
            return res.status(409).json({ message: 'Doctor with this email, NIC, or SLMC ID already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new doctor
        const [result] = await db.execute(
            'INSERT INTO doctors (name, specialization, slmc_id, nic, email, phone, hospital, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, specialization, slmcId, nic, email, phone, hospital || null, hashedPassword]
        );

        res.status(201).json({ message: 'Doctor registered successfully', doctorId: result.insertId });

    } catch (error) {
        console.error('Doctor registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    const { email, password, recaptchaToken } = req.body;

    try {
        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Verify reCAPTCHA
        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
        }

        // Check patients table first
        const [patients] = await db.execute(
            'SELECT * FROM patients WHERE email = ?',
            [email]
        );

        if (patients.length > 0) {
            const patient = patients[0];
            const isMatch = await bcrypt.compare(password, patient.password_hash);

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            return res.status(200).json({
                message: 'Login successful',
                userType: 'patient',
                user: {
                    id: patient.id,
                    first_name: patient.first_name,
                    second_name: patient.second_name,
                    email: patient.email,
                    phone: patient.phone,
                    nic: patient.nic
                }
            });
        }

        // Check doctors table
        const [doctors] = await db.execute(
            'SELECT * FROM doctors WHERE email = ?',
            [email]
        );

        if (doctors.length > 0) {
            const doctor = doctors[0];
            const isMatch = await bcrypt.compare(password, doctor.password_hash);

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            return res.status(200).json({
                message: 'Login successful',
                userType: 'doctor',
                user: {
                    id: doctor.id,
                    name: doctor.name,
                    email: doctor.email,
                    specialization: doctor.specialization
                }
            });
        }

        // No user found
        return res.status(401).json({ message: 'Invalid credentials' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const { name, specialization } = req.query;

        let query = 'SELECT id, name, specialization, email, phone, hospital FROM doctors WHERE 1=1';
        const params = [];

        if (name && name.trim() !== '') {
            query += ' AND name LIKE ?';
            params.push(`%${name.trim()}%`);
        }

        if (specialization && specialization.trim() !== '') {
            query += ' AND specialization = ?';
            params.push(specialization.trim());
        }

        // Use db.query (not db.execute) for dynamically built queries
        // db.execute uses server-side prepared statement caching which breaks dynamic queries
        const [doctors] = await db.query(query, params);

        res.status(200).json({
            message: 'Doctors fetched successfully',
            doctors: doctors
        });

    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Server error while fetching doctors' });
    }
};


exports.getSpecializations = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT DISTINCT specialization FROM doctors ORDER BY specialization ASC'
        );
        const specializations = rows.map(r => r.specialization);
        res.status(200).json({ specializations });
    } catch (error) {
        console.error('Error fetching specializations:', error);
        res.status(500).json({ message: 'Server error while fetching specializations' });
    }
};
