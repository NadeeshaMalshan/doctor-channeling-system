const pool = require('./backend/config/db');

async function testUpdate() {
    try {
        // Get first patient
        const [patients] = await pool.execute('SELECT id FROM patients LIMIT 1');
        if (patients.length === 0) {
            console.log('No patients found.');
            process.exit(0);
        }

        const id = patients[0].id;
        console.log(`Updating patient ID: ${id}`);

        const firstName = 'TestUpdated';
        const secondName = 'UserUpdated';
        const phone = '0771234567';

        const [result] = await pool.execute(
            'UPDATE patients SET first_name = ?, second_name = ?, phone = ? WHERE id = ?',
            [firstName, secondName, phone, id]
        );

        console.log('Update result:', result);

        const [updated] = await pool.execute('SELECT * FROM patients WHERE id = ?', [id]);
        console.log('Updated patient:', updated[0]);

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testUpdate();
