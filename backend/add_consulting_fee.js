const db = require('./config/db');

async function addConsultingFee() {
    try {
        console.log('Adding consulting_fee column to doctors table...');
        
        // Add consulting_fee column
        await db.execute(`
            ALTER TABLE doctors 
            ADD COLUMN consulting_fee DECIMAL(10,2) DEFAULT 1000.00
            AFTER password_hash
        `);
        console.log('Successfully added consulting_fee column to doctors table');

    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('consulting_fee column already exists.');
        } else {
            console.error('Error modifying doctors table:', error);
        }
    } finally {
        process.exit();
    }
}

addConsultingFee();
