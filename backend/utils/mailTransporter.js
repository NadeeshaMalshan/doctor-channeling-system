const nodemailer = require('nodemailer');

/** Trim and strip accidental wrapping quotes from .env values */
function envVal(key) {
    let v = String(process.env[key] || '').trim();
    if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
    ) {
        v = v.slice(1, -1);
    }
    return v;
}

function isReceiptEmailConfigured() {
    return Boolean(envVal('SMTP_USER') && envVal('SMTP_PASS'));
}

function getTransporter() {
    if (!isReceiptEmailConfigured()) return null;
    const host = envVal('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(envVal('SMTP_PORT') || 587);
    const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
    return nodemailer.createTransport({
        host,
        port,
        secure,
        requireTLS: !secure && port === 587,
        tls: { minVersion: 'TLSv1.2' },
        auth: {
            user: envVal('SMTP_USER'),
            pass: envVal('SMTP_PASS')
        }
    });
}

module.exports = { getTransporter, isReceiptEmailConfigured, envVal };
