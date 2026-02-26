const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all staff members
exports.getAllStaff = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, username, role, account_status, phone_number, email, created_at FROM staff');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ message: 'Server error while fetching staff' });
    }
};

// Create a new staff member
exports.createStaff = async (req, res) => {
    const { username, password, role, phone_number, email, account_status } = req.body;

    try {
        if (!username || !password || !role) {
            return res.status(400).json({ message: 'Username, password, and role are required' });
        }

        // Check if username already exists
        const [existing] = await db.execute('SELECT * FROM staff WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into database
        const [result] = await db.execute(
            'INSERT INTO staff (username, password_hash, role, account_status, phone_number, email) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, role, account_status || 'Active', phone_number || null, email || null]
        );

        res.status(201).json({ message: 'Staff created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({ message: 'Server error while creating staff' });
    }
};

// Update an existing staff member
exports.updateStaff = async (req, res) => {
    const id = req.params.id;
    const { username, password, role, phone_number, email, account_status } = req.body;

    try {
        // Fetch current staff member
        const [staff] = await db.execute('SELECT * FROM staff WHERE id = ?', [id]);
        if (staff.length === 0) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        let updateQuery = 'UPDATE staff SET username = ?, role = ?, account_status = ?, phone_number = ?, email = ?';
        let queryParams = [username, role, account_status, phone_number, email];

        // Only update password if provided
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateQuery += ', password_hash = ?';
            queryParams.push(hashedPassword);
        }

        updateQuery += ' WHERE id = ?';
        queryParams.push(id);

        await db.execute(updateQuery, queryParams);

        res.status(200).json({ message: 'Staff updated successfully' });
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({ message: 'Server error while updating staff' });
    }
};

// Delete a staff member
exports.deleteStaff = async (req, res) => {
    const id = req.params.id;

    try {
        const [result] = await db.execute('DELETE FROM staff WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        res.status(200).json({ message: 'Staff deleted successfully' });
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({ message: 'Server error while deleting staff' });
    }
};
