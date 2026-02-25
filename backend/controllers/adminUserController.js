const db = require('../config/db');

// Get all users (patients)
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, first_name, second_name, email, phone, nic FROM patients');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
};

// Delete a user (patient)
exports.deleteUser = async (req, res) => {
    const id = req.params.id;

    try {
        const [result] = await db.execute('DELETE FROM patients WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
};
