const Doctor = require('../models/Doctor');

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findAll();
        res.status(200).json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Server error while fetching doctors' });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Doctor.deleteById(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        console.error('Error deleting doctor:', error);
        res.status(500).json({ message: 'Server error while deleting doctor' });
    }
};
