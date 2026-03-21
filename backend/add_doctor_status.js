const db = require('./config/db');

async function addDoctorStatus() {
    try {
        console.log('Adding status column to doctors table...');
        
        // Add status column
        await db.execute(`
            ALTER TABLE doctors 
            ADD COLUMN status ENUM('approved', 'pending', 'rejected', 'canceled') DEFAULT 'pending'
        `);
        console.log('Successfully added status column to doctors table');

    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Status column already exists.');
        } else {
            console.error('Error modifying doctors table:', error);
        }
    } finally {
        process.exit();
    }
}

addDoctorStatus();
