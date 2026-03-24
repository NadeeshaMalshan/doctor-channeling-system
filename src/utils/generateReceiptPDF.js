import jsPDF from 'jspdf';
import LogoHospital from '../images/LogoHospital.png';
import { getReceiptDetailRows, RECEIPT_CONDITIONS } from './receiptModel';

// Color helpers
const rgb = (r, g, b) => [r, g, b];
const NAVY       = rgb(30,  58,  95);
const ACCENT     = rgb(37,  99, 235);
const TEXT_DARK  = rgb(15,  23,  42);
const TEXT_MID   = rgb(71,  85, 105);
const TEXT_LIGHT = rgb(148, 163, 184);
const BORDER     = rgb(226, 232, 240);
const BG_LIGHT   = rgb(248, 250, 252);
const WHITE      = rgb(255, 255, 255);

const applyText  = (doc, c) => doc.setTextColor(c[0], c[1], c[2]);
const applyDraw  = (doc, c) => doc.setDrawColor(c[0], c[1], c[2]);
const applyFill  = (doc, c) => doc.setFillColor(c[0], c[1], c[2]);

// Load image as data URL
const loadImage = (src) =>
    new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width  = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.src = src;
    });

export const generateReceiptPDF = async (data) => {
    const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W    = 210;
    const H    = 297;
    const M    = 18;     // margin
    const CW   = W - M * 2; // content width
    const PAD  = 8;      // inner padding for boxes
    let   y    = M;

    // ─── HEADER ──────────────────────────────────────────────────────
    // Logo
    try {
        const logoData = await loadImage(LogoHospital);
        doc.addImage(logoData, 'PNG', M, y, 18, 18);
    } catch (_) { /* skip logo if load fails */ }

    // Company info — right side
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    applyText(doc, NAVY);
    doc.text('NCC eCare', W - M, y + 4, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    applyText(doc, TEXT_MID);
    doc.text('Narammala Channeling Center',             W - M, y + 9,  { align: 'right' });
    doc.text('Narammala, Sri Lanka',                    W - M, y + 14, { align: 'right' });
    doc.text('narammalachannelcenterandhospi@gmail.com  |  0372 249 959', W - M, y + 19, { align: 'right' });

    y += 24;

    // Divider
    applyDraw(doc, BORDER);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 7;

    // Receipt label + issue date
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    applyText(doc, TEXT_DARK);
    doc.text('PAYMENT RECEIPT', M, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    applyText(doc, TEXT_LIGHT);
    const now = new Date();
    doc.text(
        `Issued: ${now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        W - M, y + 4, { align: 'right' }
    );

    y += 12;

    // ─── BILL INFO BOX ────────────────────────────────────────────────
    const rows = getReceiptDetailRows(data);

    const ROW_H = 9;
    const DIV_H = 6;
    const dataRows    = rows.filter(r => r !== null).length;
    const divRows     = rows.filter(r => r === null).length;
    const boxH        = PAD * 2 + dataRows * ROW_H + divRows * DIV_H + 2;

    applyFill(doc, BG_LIGHT);
    applyDraw(doc, BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, boxH, 3, 3, 'FD');

    let ry = y + PAD + 5;

    for (const row of rows) {
        if (row === null) {
            applyDraw(doc, BORDER);
            doc.setLineWidth(0.2);
            doc.line(M + PAD, ry, W - M - PAD, ry);
            ry += DIV_H;
            continue;
        }

        // Label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(row.mono ? 7.5 : 8.5);
        applyText(doc, TEXT_LIGHT);
        doc.text(row.label, M + PAD, ry);

        // Value
        const fs = row.large ? 11 : row.mono ? 7.5 : 8.5;
        doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
        doc.setFontSize(fs);

        if (row.accent)       applyText(doc, ACCENT);
        else if (row.bold)    applyText(doc, TEXT_DARK);
        else                  applyText(doc, TEXT_MID);

        if (row.mono) {
            // monospace-style for payment ID — use courier
            doc.setFont('courier', 'normal');
        }
        doc.text(row.value, W - M - PAD, ry, { align: 'right' });

        ry += ROW_H;
    }

    y += boxH + 10;

    // ─── GREETING ─────────────────────────────────────────────────────
    applyFill(doc, rgb(239, 246, 255));
    applyDraw(doc, rgb(191, 219, 254));
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, 14, 3, 3, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    applyText(doc, ACCENT);
    doc.text(
        'Thank you for choosing NCC eCare. We wish you good health.',
        W / 2, y + 9, { align: 'center' }
    );

    y += 22;

    // ─── CONDITIONS BOX ───────────────────────────────────────────────
    const conditions = RECEIPT_CONDITIONS;

    // Measure total text height
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    let totalTextH = 0;
    const wrappedLines = conditions.map(c => {
        const lines = doc.splitTextToSize(`• ${c}`, CW - PAD * 2);
        totalTextH += lines.length * 4.5;
        return lines;
    });
    totalTextH += conditions.length * 2; // spacing between items

    const condBoxH = PAD * 2 + 8 + totalTextH;

    applyFill(doc, NAVY);
    applyDraw(doc, NAVY);
    doc.setLineWidth(0);
    doc.roundedRect(M, y, CW, condBoxH, 3, 3, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    applyText(doc, WHITE);
    doc.text('TERMS & CONDITIONS', M + PAD, y + PAD + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    applyText(doc, rgb(148, 163, 184));

    let cy = y + PAD + 11;
    for (const lines of wrappedLines) {
        doc.text(lines, M + PAD, cy);
        cy += lines.length * 4.5 + 2;
    }

    y += condBoxH + 10;

    // ─── FOOTER ───────────────────────────────────────────────────────
    // If content overflows, add page (simple check)
    if (y > H - 15) y = H - 15;

    applyDraw(doc, BORDER);
    doc.setLineWidth(0.2);
    doc.line(M, y, W - M, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    applyText(doc, TEXT_LIGHT);
    doc.text('NCC eCare — Narammala Channeling Center', M, y + 5);
    doc.text(
        `Generated: ${now.toLocaleString('en-US')}`,
        W - M, y + 5, { align: 'right' }
    );

    // Save
    doc.save(`NCC-Receipt-${data.paymentID || Date.now()}.pdf`);
};
