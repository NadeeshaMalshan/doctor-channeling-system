const crypto = require('crypto');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sendPasswordResetOtpEmail } = require('../services/passwordResetEmail');
const { isReceiptEmailConfigured } = require('../utils/mailTransporter');

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
    const { username, password, role, recaptchaToken } = req.body;

    try {
        // Validation
        if (!username || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Verify reCAPTCHA
        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
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

        // Generate JWT token
        const token = jwt.sign(
            { id: staff.id, username: staff.username, role: staff.role },
            process.env.JWT_SECRET || 'fallback_dev_secret_change_in_production',
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
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
            const anyActive = existingDoctors.some(doc => doc.status !== 'canceled');
            if (anyActive) {
                return res.status(409).json({ message: 'Doctor with this email, NIC, or SLMC ID already exists' });
            } else {
                // All colliding records are canceled, we can safely overwrite the first one
                // with new details and set status back to pending
                const idToUpdate = existingDoctors[0].id;
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                
                await db.execute(
                    'UPDATE doctors SET name=?, specialization=?, slmc_id=?, nic=?, email=?, phone=?, hospital=?, password_hash=?, status=? WHERE id=?',
                    [name, specialization, slmcId, nic, email, phone, hospital || null, hashedPassword, 'pending', idToUpdate]
                );
                return res.status(201).json({ message: 'Doctor registered successfully', doctorId: idToUpdate });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new doctor
        const [result] = await db.execute(
            'INSERT INTO doctors (name, specialization, slmc_id, nic, email, phone, hospital, password_hash, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, specialization, slmcId, nic, email, phone, hospital || null, hashedPassword, 'pending']
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

            if (doctor.status === 'canceled') {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            return res.status(200).json({
                message: 'Login successful',
                userType: 'doctor',
                user: {
                    id: doctor.id,
                    name: doctor.name,
                    email: doctor.email,
                    specialization: doctor.specialization,
                    status: doctor.status
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

async function findAccountForPasswordReset(rawEmail) {
    const email = String(rawEmail || '').trim();
    if (!email) return null;

    const [patients] = await db.execute('SELECT email FROM patients WHERE email = ?', [email]);
    if (patients.length > 0) {
        return { userType: 'patient', email: patients[0].email };
    }

    const [doctors] = await db.execute('SELECT email, status FROM doctors WHERE email = ?', [email]);
    if (doctors.length > 0) {
        const st = doctors[0].status;
        if (st === 'rejected' || st === 'canceled') {
            return null;
        }
        return { userType: 'doctor', email: doctors[0].email };
    }

    return null;
}

/** Step 1: validate email, send OTP */
exports.requestPasswordReset = async (req, res) => {
    const { email, recaptchaToken } = req.body;

    try {
        if (!email || !String(email).trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
        }

        const account = await findAccountForPasswordReset(email);
        if (!account) {
            return res.status(404).json({ message: 'No account found with this email address' });
        }

        if (!isReceiptEmailConfigured()) {
            return res.status(503).json({
                message: 'Email is not configured on the server. Please contact support.'
            });
        }

        const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
        const salt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otp, salt);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await db.execute('DELETE FROM password_reset_otps WHERE email = ?', [account.email]);
        await db.execute(
            'INSERT INTO password_reset_otps (email, user_type, otp_hash, expires_at) VALUES (?, ?, ?, ?)',
            [account.email, account.userType, otpHash, expiresAt]
        );

        const sent = await sendPasswordResetOtpEmail(account.email, otp);
        if (!sent.ok) {
            return res.status(500).json({ message: 'Could not send email. Please try again later.' });
        }

        res.status(200).json({ message: 'Verification code sent to your email.' });
    } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.error(
                'password_reset_otps table missing. Run: backend/migrations/create_password_reset_otps.sql'
            );
            return res.status(503).json({ message: 'Password reset is unavailable. Please contact support.' });
        }
        console.error('requestPasswordReset error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/** Step 2: verify OTP, return short-lived reset token */
exports.verifyPasswordResetOtp = async (req, res) => {
    const { email, otp } = req.body;
    const emailTrim = String(email || '').trim();
    const otpTrim = String(otp || '').trim();

    try {
        if (!emailTrim || !otpTrim) {
            return res.status(400).json({ message: 'Email and verification code are required' });
        }

        const [rows] = await db.execute(
            `SELECT id, email, user_type, otp_hash, expires_at FROM password_reset_otps
             WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
            [emailTrim]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const row = rows[0];
        if (new Date(row.expires_at) < new Date()) {
            await db.execute('DELETE FROM password_reset_otps WHERE id = ?', [row.id]);
            return res.status(400).json({ message: 'Code has expired. Request a new code from the login page.' });
        }

        const match = await bcrypt.compare(otpTrim, row.otp_hash);
        if (!match) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        const secret = process.env.JWT_SECRET || 'fallback_dev_secret_change_in_production';
        const resetToken = jwt.sign(
            { pwdReset: true, email: row.email, userType: row.user_type },
            secret,
            { expiresIn: '20m' }
        );

        res.status(200).json({ message: 'Code verified', resetToken });
    } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(503).json({ message: 'Password reset is unavailable. Please contact support.' });
        }
        console.error('verifyPasswordResetOtp error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/** Step 3: set new password */
exports.completePasswordReset = async (req, res) => {
    const { resetToken, newPassword, confirmPassword } = req.body;

    try {
        if (!resetToken || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        if (String(newPassword).length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const secret = process.env.JWT_SECRET || 'fallback_dev_secret_change_in_production';
        let payload;
        try {
            payload = jwt.verify(resetToken, secret);
        } catch {
            return res.status(400).json({ message: 'Reset session expired. Please start again from the login page.' });
        }

        if (!payload.pwdReset || !payload.email || !payload.userType) {
            return res.status(400).json({ message: 'Invalid reset session' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        if (payload.userType === 'patient') {
            const [result] = await db.execute(
                'UPDATE patients SET password_hash = ? WHERE email = ?',
                [hashed, payload.email]
            );
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: 'Could not update password' });
            }
        } else if (payload.userType === 'doctor') {
            const [result] = await db.execute(
                'UPDATE doctors SET password_hash = ? WHERE email = ?',
                [hashed, payload.email]
            );
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: 'Could not update password' });
            }
        } else {
            return res.status(400).json({ message: 'Invalid reset session' });
        }

        await db.execute('DELETE FROM password_reset_otps WHERE email = ?', [payload.email]);
        res.status(200).json({ message: 'Password updated successfully. You can sign in now.' });
    } catch (error) {
        console.error('completePasswordReset error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

