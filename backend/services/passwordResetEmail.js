'use strict';

const { getTransporter, isReceiptEmailConfigured, envVal } = require('../utils/mailTransporter');

/**
 * @param {string} toEmail
 * @param {string} otpCode
 * @returns {Promise<{ ok: boolean }>}
 */
async function sendPasswordResetOtpEmail(toEmail, otpCode) {
    if (!isReceiptEmailConfigured()) {
        return { ok: false };
    }
    const transporter = getTransporter();
    if (!transporter) {
        return { ok: false };
    }
    const fromAddr = envVal('SMTP_FROM_EMAIL') || envVal('SMTP_USER');
    const subject = 'Password reset verification code';
    const text = [
        `Your password reset code is: ${otpCode}`,
        '',
        'This code expires in 15 minutes.',
        'If you did not request a password reset, you can ignore this email.'
    ].join('\n');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;font-family:Inter,Segoe UI,sans-serif;background:#f8fafc;color:#0f172a;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
    <h1 style="margin:0 0 12px;font-size:20px;">Password reset</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#475569;">Use this code to continue resetting your password:</p>
    <p style="margin:0 0 24px;font-size:28px;font-weight:700;letter-spacing:0.2em;color:#1e3a5f;">${otpCode}</p>
    <p style="margin:0;font-size:13px;color:#94a3b8;">Expires in 15 minutes. If you did not request this, ignore this message.</p>
  </div>
</body>
</html>`;

    await transporter.sendMail({
        from: fromAddr,
        to: toEmail,
        subject,
        text,
        html
    });
    return { ok: true };
}

module.exports = { sendPasswordResetOtpEmail };
