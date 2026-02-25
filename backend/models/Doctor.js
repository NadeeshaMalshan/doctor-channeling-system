const db = require('../config/db');

const Doctor = {
    findAll: async () => {
        try {
            const [rows] = await db.query('SELECT id, name, specialization, slmc_id AS slmc_no, nic, email, phone, hospital FROM doctors');
            return rows;
        } catch (error) {
            throw error;
        }
    },

    deleteById: async (id) => {
        try {
            const [result] = await db.execute('DELETE FROM doctors WHERE id = ?', [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = Doctor;
