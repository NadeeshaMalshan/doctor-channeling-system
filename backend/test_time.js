const fetch = require('node-fetch');

async function testBackendValidation() {
    const payload = {
        doctor_id: 1, // dummy
        schedule_date: '2030-01-01',
        start_time: '14:30',
        end_time: '14:00', // invalid: end time before start time
        max_patients: 10,
        price: 1500
    };

    try {
        const response = await fetch('http://localhost:5000/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Body:', data);
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}

testBackendValidation();
