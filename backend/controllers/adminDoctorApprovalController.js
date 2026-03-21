const db = require('../config/db');

// GET /api/admin/doctor-requests
// Returns all doctors with status = 'pending'
exports.getPendingDoctors = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM doctors WHERE status = 'pending'");
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching pending doctors:', error);
        res.status(500).json({ message: 'Server error while fetching pending doctors' });
    }
};

// PUT /api/admin/doctor-requests/:id/approve
// Sets doctor status to 'approved'
exports.approveDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute(
            "UPDATE doctors SET status = 'approved' WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({ message: 'Doctor approved successfully' });
    } catch (error) {
        console.error('Error approving doctor:', error);
        res.status(500).json({ message: 'Server error while approving doctor' });
    }
};

// PUT /api/admin/doctor-requests/:id/reject
// Sets doctor status to 'rejected'
exports.rejectDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute(
            "UPDATE doctors SET status = 'rejected' WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({ message: 'Doctor rejected successfully' });
    } catch (error) {
        console.error('Error rejecting doctor:', error);
        res.status(500).json({ message: 'Server error while rejecting doctor' });
    }
};
