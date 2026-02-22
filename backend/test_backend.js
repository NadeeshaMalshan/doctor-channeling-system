const pool = require('./config/db');

async function testBackend() {
    try {
        console.log('--- Testing Backend DB ---');
        const [rows] = await pool.execute('SELECT * FROM patients');
        console.log('Total patients:', rows.length);

        if (rows.length > 0) {
            const patient = rows[0];
            console.log('Testing update for patient:', patient.id);

            const [updateResult] = await pool.execute(
                'UPDATE patients SET first_name = ? WHERE id = ?',
                [patient.first_name + '_test', patient.id]
            );
            console.log('Update successful:', updateResult.affectedRows === 1);

            // Revert update
            await pool.execute(
                'UPDATE patients SET first_name = ? WHERE id = ?',
                [patient.first_name, patient.id]
            );
            console.log('Revert successful');
        } else {
            console.log('No patients found to test.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Backend test failed:', err);
        process.exit(1);
    }
}

testBackend();
