'use strict';

/**
 * Email HTML aligned with src/Components/ComponentsCss/paymentSummerry.css (Inter palette, success card).
 * Full line-item receipt is only in the attached PDF (no duplicate "Full receipt" block in email).
 */
function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildReceiptEmailHtml(data) {
    const amt = Number(data.totalAmount || 0).toFixed(2);
    const issued = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const summaryRows = [
        ['Patient', esc(data.patientName || 'N/A')],
        ['Doctor', esc(data.doctorName || 'N/A')],
        ['Specialization', esc(data.specialization || 'N/A')],
        ['Date & time', esc(data.dateTime || 'N/A')],
        ['Appointment no.', esc(String(data.appointmentNo != null ? data.appointmentNo : 'N/A'))],
        ['Payment reference', esc(String(data.paymentID || 'N/A'))]
    ];

    const summaryHtml = summaryRows
        .map(
            ([label, value]) => `
<tr>
<td style="padding:10px 0;font-size:12px;font-weight:500;color:#94A3B8;vertical-align:baseline;">${label}</td>
<td style="padding:10px 0;font-size:13px;font-weight:500;color:#1E293B;text-align:right;vertical-align:baseline;">${value}</td>
</tr>`
        )
        .join('');

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F1F5F9;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:480px;background:#FFFFFF;border-radius:14px;border:1px solid #E2E8F0;padding:40px 40px 36px;text-align:center;">
<tr><td>
<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 20px;">
<tr><td style="width:68px;height:68px;border-radius:50%;background:#DCFCE7;text-align:center;vertical-align:middle;font-size:28px;line-height:68px;color:#16A34A;font-weight:700;">&#10003;</td></tr>
</table>
<h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#0F172A;letter-spacing:-0.2px;font-family:'Inter',sans-serif;">Booking successful</h1>
<p style="margin:0 0 28px;font-size:13px;line-height:1.6;color:#64748B;font-family:'Inter',sans-serif;">Your payment was received and your appointment is confirmed. A detailed receipt is attached as a PDF (same as the download on the success page).</p>

<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:20px 24px;margin-bottom:28px;text-align:left;">
<h2 style="margin:0 0 16px;font-size:10px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.7px;font-family:'Inter',sans-serif;">Booking summary</h2>
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${summaryHtml}
<tr><td colspan="2" style="padding:7px 0;"><div style="height:1px;background:#E2E8F0;font-size:0;line-height:0;">&nbsp;</div></td></tr>
<tr>
<td style="padding:12px 0 0;font-size:12px;font-weight:500;color:#94A3B8;">Amount paid</td>
<td style="padding:12px 0 0;font-size:15px;font-weight:600;color:#0F172A;text-align:right;">LKR ${esc(amt)}</td>
</tr>
</table>
</div>

<p style="margin:0 0 20px;font-size:11px;color:#94A3B8;font-family:'Inter',sans-serif;">Issued: ${esc(issued)} · Full details are in the PDF attachment.</p>

<p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.5;font-family:'Inter',sans-serif;">Questions? <a href="mailto:narammalachannelcenterandhospi@gmail.com" style="color:#2563EB;font-weight:500;text-decoration:none;">narammalachannelcenterandhospi@gmail.com</a> · 0372 249 959</p>
<p style="margin:16px 0 0;font-size:11px;color:#94A3B8;">If you did not make this booking, contact support immediately.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function buildReceiptEmailText(data) {
    const amt = Number(data.totalAmount || 0).toFixed(2);
    const lines = [
        'Booking successful — NCC eCare',
        '',
        'Your payment was received and your appointment is confirmed.',
        '',
        'BOOKING SUMMARY',
        `Patient: ${data.patientName || 'N/A'}`,
        `Doctor: ${data.doctorName || 'N/A'}`,
        `Specialization: ${data.specialization || 'N/A'}`,
        `Date & time: ${data.dateTime || 'N/A'}`,
        `Appointment no.: ${data.appointmentNo != null ? data.appointmentNo : 'N/A'}`,
        `Payment reference: ${data.paymentID || 'N/A'}`,
        `Amount paid: LKR ${amt}`,
        '',
        'A PDF receipt (same as the success page download) is attached.',
        '',
        'narammalachannelcenterandhospi@gmail.com · 0372 249 959'
    ];
    return lines.join('\n');
}

module.exports = { buildReceiptEmailHtml, buildReceiptEmailText };
