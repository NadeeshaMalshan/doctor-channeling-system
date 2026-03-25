'use strict';

const { buildRefundEmailHtml, buildRefundEmailText } = require('./refundEmailHtml');

function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatAmountLKR(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return '—';
    return x.toFixed(2);
}

/**
 * Patient submitted refund request — awaiting cashier.
 */
function buildRefundRequestSubmittedHtml(ctx) {
    const name = esc(ctx.patientName);
    const doctor = esc(ctx.doctorName);
    const amt = esc(formatAmountLKR(ctx.amount));
    const ref = esc(ctx.orderRef);
    const apptDate = esc(ctx.scheduleDateLabel || '—');

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Inter',-apple-system,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:480px;background:#fff;border-radius:14px;border:1px solid #E2E8F0;padding:36px 32px;">
<tr><td>
<h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#0F172A;">Refund request received</h1>
<p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#64748B;">Hi ${name}, we have received your refund request for your NCC eCare booking. Our cashier will review and process it according to our refund policy.</p>
<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:18px 20px;margin-bottom:24px;text-align:left;font-size:13px;color:#334155;line-height:1.6;">
<p style="margin:0 0 8px;"><strong>Doctor:</strong> ${doctor}</p>
<p style="margin:0 0 8px;"><strong>Appointment date:</strong> ${apptDate}</p>
<p style="margin:0 0 8px;"><strong>Amount:</strong> LKR ${amt}</p>
<p style="margin:0;"><strong>Payment reference:</strong> <span style="font-family:monospace;font-size:12px;">${ref}</span></p>
</div>
<p style="margin:0 0 20px;font-size:13px;color:#64748B;">You will receive another email when your refund has been completed.</p>
<p style="margin:0;font-size:12px;color:#94A3B8;">Questions? <a href="mailto:narammalachannelcenterandhospi@gmail.com" style="color:#2563EB;">narammalachannelcenterandhospi@gmail.com</a> · 0372 249 959</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function buildRefundRequestSubmittedText(ctx) {
    const lines = [
        'Refund request received — NCC eCare',
        '',
        `Hi ${ctx.patientName},`,
        '',
        'We have received your refund request. Our cashier will review and process it.',
        '',
        `Doctor: ${ctx.doctorName}`,
        `Appointment date: ${ctx.scheduleDateLabel || '—'}`,
        `Amount: LKR ${formatAmountLKR(ctx.amount)}`,
        `Payment reference: ${ctx.orderRef}`,
        '',
        'You will receive another email when your refund has been completed.',
        '',
        'narammalachannelcenterandhospi@gmail.com · 0372 249 959'
    ];
    return lines.join('\n');
}

function colomboDateTimeLabel() {
    try {
        return new Date().toLocaleString('en-GB', {
            timeZone: 'Asia/Colombo',
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    } catch {
        return new Date().toISOString();
    }
}

/**
 * Reuse receipt-style refund email after cashier processed PayHere refund.
 */
function buildRefundProcessedPatientEmail(ctx) {
    const processedLabel = ctx.processedDateLabel || colomboDateTimeLabel();
    const htmlCtx = {
        patientName: ctx.patientName,
        paymentRef: ctx.orderRef,
        refundAmountFormatted: formatAmountLKR(ctx.refundAmount),
        originalAmountFormatted: formatAmountLKR(ctx.originalAmount ?? ctx.refundAmount),
        doctorName: ctx.doctorName,
        dateTime: ctx.scheduleDateLabel,
        reasonLabel: 'Refund processed (cashier)',
        processedDateLabel: processedLabel
    };
    return {
        html: buildRefundEmailHtml(htmlCtx),
        text: buildRefundEmailText(htmlCtx),
        subject: 'Your refund has been processed — NCC eCare'
    };
}

module.exports = {
    buildRefundRequestSubmittedHtml,
    buildRefundRequestSubmittedText,
    buildRefundProcessedPatientEmail,
    formatAmountLKR,
    colomboDateTimeLabel
};
