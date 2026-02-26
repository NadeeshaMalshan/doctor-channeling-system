const Doctor = require('./models/Doctor');
const db = require('./config/db');

async function test() {
    try {
        const doctors = await Doctor.findAll();
        if (doctors.length > 0) {
            const keys = Object.keys(doctors[0]);
            console.log('Fields found:', keys.join(', '));
            if (keys.includes('slmc_no')) {
                console.log('SUCCESS: slmc_no field exists');
            } else {
                console.log('FAILURE: slmc_no field missing');
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        db.end();
    }
}

test();
