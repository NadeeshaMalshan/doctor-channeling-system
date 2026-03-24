/**
 * Live DB check using backend/.env + config/db.js (SSL). Run: node db_live_check.js
 */
const db = require('./config/db');

async function main() {
  const [[ver]] = await db.query('SELECT VERSION() AS v, DATABASE() AS db');
  console.log('Connected OK');
  console.log('  MySQL:', ver.v);
  console.log('  Database:', ver.db);

  const [tables] = await db.query('SHOW TABLES');
  const names = tables.map((r) => Object.values(r)[0]);
  console.log('\nTables (' + names.length + '):', names.join(', '));

  for (const t of names) {
    if (!/^[a-zA-Z0-9_]+$/.test(t)) continue;
    const [[row]] = await db.query('SELECT COUNT(*) AS c FROM `' + t + '`');
    console.log('  ' + t + ': ' + row.c + ' rows');
  }

  console.log('\n--- Duplicate / consistency ---');
  const dupPatientEmail = await db.query(
    'SELECT email, COUNT(*) cnt FROM patients GROUP BY email HAVING cnt > 1'
  );
  console.log('Duplicate patient emails:', dupPatientEmail[0].length || 'none');

  const dupAppt = await db.query(
    'SELECT schedule_id, patient_ID, COUNT(*) cnt FROM appointments GROUP BY schedule_id, patient_ID HAVING cnt > 1 LIMIT 20'
  );
  console.log('Same schedule+patient multiple appointments:', dupAppt[0].length ? dupAppt[0] : 'none');

  const payMismatch = await db.query(
    `SELECT COUNT(*) AS c FROM payments p
     JOIN appointments a ON a.id = p.appointment_id
     WHERE p.patient_id <> a.patient_ID OR p.doctor_id <> a.doctor_id OR p.appointment_schedule_id <> a.schedule_id`
  );
  console.log('Payments not matching linked appointment:', payMismatch[0][0].c);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('DB check failed:', e.message);
    process.exit(1);
  });
