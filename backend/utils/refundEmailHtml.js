'use strict';

/**
 * Same layout family as receiptEmailHtml.js / paymentSummerry.css — "failed" palette for refunds.
 */
function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function humanizeRefundReason(code) {
    const c = String(code || '').trim();
    if (c === 'duplicate') return 'Duplicate payment';
    if (c === 'fraudulent') return 'Fraudulent activity';
    return 'Requested by customer';
}

/**
 * @param {object} ctx
 * @param {string} ctx.patientName
 * @param {string} ctx.paymentRef
 * @param {string} ctx.refundAmountFormatted  e.g. "5000.00"
 * @param {string} ctx.originalAmountFormatted
 * @param {string} [ctx.doctorName]
 * @param {string} [ctx.dateTime]
 * @param {string} ctx.reasonLabel
 * @param {string} ctx.processedDateLabel
 */
function buildRefundEmailHtml(ctx) {
    const rows = [
        ['Patient', esc(ctx.patientName)],
        ['Payment reference', esc(ctx.paymentRef)],
        ['Refund amount', `<span style="color:#DC2626;font-weight:600;">LKR ${esc(ctx.refundAmountFormatted)}</span>`],
        ['Original payment', `LKR ${esc(ctx.originalAmountFormatted)}`],
        ['Reason', esc(ctx.reasonLabel)]
    ];
    if (ctx.doctorName) {
        rows.push(['Doctor', esc(ctx.doctorName)]);
    }
    if (ctx.dateTime) {
        rows.push(['Appointment date', esc(ctx.dateTime)]);
    }

    const summaryHtml = rows
        .map(
            ([label, valueHtml]) => `
<tr>
<td style="padding:10px 0;font-size:12px;font-weight:500;color:#94A3B8;vertical-align:baseline;">${label}</td>
<td style="padding:10px 0;font-size:13px;font-weight:500;color:#1E293B;text-align:right;vertical-align:baseline;">${valueHtml}</td>
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
<tr><td style="width:68px;height:68px;border-radius:50%;background:#FEE2E2;text-align:center;vertical-align:middle;font-size:30px;line-height:68px;color:#DC2626;font-weight:700;">&#8617;</td></tr>
</table>
<h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#0F172A;letter-spacing:-0.2px;font-family:'Inter',sans-serif;">Payment refunded</h1>
<p style="margin:0 0 28px;font-size:13px;line-height:1.6;color:#64748B;font-family:'Inter',sans-serif;">Your refund has been processed through our payment provider. Depending on your bank or card issuer, it may take a few business days to appear on your statement.</p>

<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:20px 24px;margin-bottom:28px;text-align:left;">
<h2 style="margin:0 0 16px;font-size:10px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.7px;font-family:'Inter',sans-serif;">Refund summary</h2>
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${summaryHtml}
</table>
</div>

<p style="margin:0 0 20px;font-size:11px;color:#94A3B8;font-family:'Inter',sans-serif;">Processed: ${esc(ctx.processedDateLabel)}</p>

<p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.5;font-family:'Inter',sans-serif;">Questions? <a href="mailto:narammalachannelcenterandhospi@gmail.com" style="color:#2563EB;font-weight:500;text-decoration:none;">narammalachannelcenterandhospi@gmail.com</a> · 0372 249 959</p>
<p style="margin:16px 0 0;font-size:11px;color:#94A3B8;">If you did not expect this refund, please contact us right away.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function buildRefundEmailText(ctx) {
    const lines = [
        'Payment refunded — NCC eCare',
        '',
        'Your refund has been processed. It may take a few business days to show on your statement.',
        '',
        'REFUND SUMMARY',
        `Patient: ${ctx.patientName}`,
        `Payment reference: ${ctx.paymentRef}`,
        `Refund amount: LKR ${ctx.refundAmountFormatted}`,
        `Original payment: LKR ${ctx.originalAmountFormatted}`,
        `Reason: ${ctx.reasonLabel}`,
        `Processed: ${ctx.processedDateLabel}`
    ];
    if (ctx.doctorName) lines.push(`Doctor: ${ctx.doctorName}`);
    if (ctx.dateTime) lines.push(`Appointment date: ${ctx.dateTime}`);
    lines.push('', 'narammalachannelcenterandhospi@gmail.com · 0372 249 959');
    return lines.join('\n');
}

module.exports = { buildRefundEmailHtml, buildRefundEmailText, humanizeRefundReason };
