const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a clean, well-aligned PDF receipt for a Buy Order or Rent Rental.
 * Saves it inside backend/public/receipts/ and returns the file path.
 */
const generateReceiptPDF = (item, type) => {
  return new Promise((resolve, reject) => {
    try {
      const dirPath = path.join(__dirname, '../public/receipts');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const fileName = `${item.transactionId}.pdf`;
      const filePath = path.join(dirPath, fileName);

      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        info: {
          Title: `Rentora Receipt - ${item.transactionId}`,
          Author: 'Rentora',
        }
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // ─── PAGE DIMENSIONS ─────────────────────────────────────
      const pageW = doc.page.width;   // 595
      const margin = 50;
      const contentW = pageW - margin * 2; // 495

      // ─── HEADER BAND ─────────────────────────────────────────
      // Background header rectangle
      doc.save();
      doc.rect(0, 0, pageW, 110).fill('#4f46e5');
      doc.restore();

      // RENTORA brand
      doc
        .fillColor('#ffffff')
        .fontSize(26)
        .font('Helvetica-Bold')
        .text('RENTORA', margin, 30);

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('rgba(255,255,255,0.75)')
        .text('Unified Buy & Rental Marketplace', margin, 60)
        .text('support@rentora.com', margin, 73);

      // Invoice label (right side)
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#ffffff')
        .text('INVOICE / RECEIPT', margin, 30, { align: 'right', width: contentW });

      const invoiceDate = new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      const invNo = `INV-${item.transactionId.substring(0, 8).toUpperCase()}`;

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('rgba(255,255,255,0.8)')
        .text(invNo, margin, 55, { align: 'right', width: contentW })
        .text(`Date: ${invoiceDate}`, margin, 68, { align: 'right', width: contentW })
        .text(`Type: ${type.toUpperCase()}`, margin, 81, { align: 'right', width: contentW });

      // ─── BILL TO / PAYMENT INFO SECTION ───────────────────────
      const sectionTop = 130;

      // Left column: Billed To
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#9ca3af')
        .text('BILLED TO', margin, sectionTop);

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#111827')
        .text(item.user.name, margin, sectionTop + 14);

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#4b5563')
        .text(item.user.email, margin, sectionTop + 28)
        .text(`Phone: ${item.contactNumber || 'N/A'}`, margin, sectionTop + 41)
        .text(`Address: ${item.shippingAddress || 'N/A'}`, margin, sectionTop + 54, {
          width: 220,
          lineBreak: true,
        });

      // Right column: Payment Details
      const rightCol = margin + contentW / 2 + 20;
      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#9ca3af')
        .text('PAYMENT DETAILS', rightCol, sectionTop);

      const payRows = [
        ['Transaction ID:', item.transactionId],
        ['Status:', 'SUCCESSFUL'],
        ['Gateway:', 'Rentora Pay'],
        ['Payment Type:', type === 'buy' ? 'One-Time Purchase' : 'Rental Payment'],
      ];

      let currentY = sectionTop + 14;
      payRows.forEach((row) => {
        doc.fontSize(9);
        const valHeight = doc.font('Helvetica').heightOfString(row[1], { width: 125 });

        doc
          .font('Helvetica-Bold')
          .fillColor('#6b7280')
          .text(row[0], rightCol, currentY, { width: 95 });

        doc
          .font('Helvetica')
          .fillColor('#111827')
          .text(row[1], rightCol + 100, currentY, { width: 125 });

        currentY += Math.max(14, valHeight + 3);
      });

      // Calculate the bottom of left and right columns to position the divider dynamically
      const addressText = item.shippingAddress || 'N/A';
      const addressHeight = doc.font('Helvetica').fontSize(9).heightOfString(`Address: ${addressText}`, { width: 220 });
      const leftColBottom = sectionTop + 54 + addressHeight;
      const rightColBottom = currentY;

      // ─── DIVIDER ──────────────────────────────────────────────
      const divY = Math.max(leftColBottom, rightColBottom) + 15;
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(margin, divY)
        .lineTo(pageW - margin, divY)
        .stroke();

      // ─── RENTAL DATES (if applicable) ─────────────────────────
      let tableTop = divY + 20;

      if (type === 'rent') {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        const diffDays = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));

        // Rental dates ribbon
        doc.save();
        doc.roundedRect(margin, tableTop, contentW, 36, 6).fill('#eff6ff');
        doc.restore();

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#1d4ed8')
          .text('RENTAL PERIOD', margin + 12, tableTop + 6);

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#1e40af')
          .text(
            `${start.toLocaleDateString('en-IN')}  to  ${end.toLocaleDateString('en-IN')}   (${diffDays} day${diffDays !== 1 ? 's' : ''})`,
            margin + 12,
            tableTop + 19,
          );

        tableTop += 52;
      }

      // ─── ITEMS TABLE HEADER ────────────────────────────────────
      // Column widths
      const col = {
        desc: margin,
        descW: 200,
        cat: margin + 205,
        catW: 90,
        unit: margin + 300,
        unitW: 80,
        qty: margin + 385,
        qtyW: 40,
        amt: margin + 430,
        amtW: 65,
      };

      doc.save();
      doc.rect(margin, tableTop, contentW, 22).fill('#f8fafc');
      doc.restore();

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#6b7280');

      doc.text('ITEM DESCRIPTION', col.desc + 4, tableTop + 7, { width: col.descW });
      doc.text('CATEGORY', col.cat, tableTop + 7, { width: col.catW });
      doc.text('UNIT PRICE', col.unit, tableTop + 7, { width: col.unitW, align: 'right' });
      doc.text('QTY', col.qty, tableTop + 7, { width: col.qtyW, align: 'right' });
      doc.text('AMOUNT', col.amt, tableTop + 7, { width: col.amtW, align: 'right' });

      // ─── TABLE ROW ─────────────────────────────────────────────
      const rowY = tableTop + 28;
      const productName = item.product.name || 'Product';
      const productCategory = item.product.category || '';

      let unitPriceLabel = '';
      let qtyDaysLabel = '';
      let itemAmount = 0;

      if (type === 'buy') {
        unitPriceLabel = `INR ${(item.product.buyPrice || 0).toLocaleString('en-IN')}`;
        qtyDaysLabel = `${item.quantity || 1}`;
        itemAmount = item.totalAmount || 0;
      } else {
        const start2 = new Date(item.startDate);
        const end2 = new Date(item.endDate);
        const diffDays2 = Math.max(1, Math.ceil(Math.abs(end2 - start2) / (1000 * 60 * 60 * 24)));
        unitPriceLabel = `INR ${(item.product.rentPricePerDay || 0).toLocaleString('en-IN')}/day`;
        qtyDaysLabel = `${diffDays2}d`;
        itemAmount = item.rentCost || 0;
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#111827')
        .text(productName, col.desc + 4, rowY, { width: col.descW - 4 });

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#4b5563')
        .text(productCategory, col.cat, rowY, { width: col.catW })
        .text(unitPriceLabel, col.unit, rowY, { width: col.unitW, align: 'right' })
        .text(qtyDaysLabel, col.qty, rowY, { width: col.qtyW, align: 'right' })
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .text(`INR ${itemAmount.toLocaleString('en-IN')}`, col.amt, rowY, { width: col.amtW, align: 'right' });

      // Row separator
      const rowBottomY = rowY + 30;
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(0.5)
        .moveTo(margin, rowBottomY)
        .lineTo(pageW - margin, rowBottomY)
        .stroke();

      // ─── TOTALS BLOCK ──────────────────────────────────────────
      let totalsY = rowBottomY + 16;
      const totalsLeft = margin + contentW - 200;
      const totalsRight = margin + contentW;

      const drawTotalRow = (label, value, bold = false, color = '#4b5563') => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 10 : 9).fillColor(color);
        doc.text(label, totalsLeft, totalsY, { width: 130, align: 'left' });
        doc.text(value, totalsLeft + 130, totalsY, { width: 70, align: 'right' });
        totalsY += bold ? 18 : 14;
      };

      if (type === 'buy') {
        drawTotalRow('Subtotal:', `INR ${(item.totalAmount || 0).toLocaleString('en-IN')}`);
        drawTotalRow('Shipping:', 'FREE');
        // Separator line
        doc.strokeColor('#d1d5db').lineWidth(0.5)
          .moveTo(totalsLeft, totalsY).lineTo(totalsRight, totalsY).stroke();
        totalsY += 8;
        drawTotalRow('Grand Total:', `INR ${(item.totalAmount || 0).toLocaleString('en-IN')}`, true, '#4f46e5');
      } else {
        drawTotalRow('Rental Charges:', `INR ${(item.rentCost || 0).toLocaleString('en-IN')}`);
        drawTotalRow('Security Deposit:', `INR ${(item.securityDeposit || 0).toLocaleString('en-IN')}`);
        // Separator line
        doc.strokeColor('#d1d5db').lineWidth(0.5)
          .moveTo(totalsLeft, totalsY).lineTo(totalsRight, totalsY).stroke();
        totalsY += 8;
        drawTotalRow('Grand Total:', `INR ${(item.totalPaid || 0).toLocaleString('en-IN')}`, true, '#4f46e5');
      }

      // Grand total highlight box
      totalsY -= (type === 'buy' ? 26 : 26);
      // (The grand total row was already drawn above, just highlight it)

      // ─── FOOTER ────────────────────────────────────────────────
      const footerY = doc.page.height - 80;

      doc
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(margin, footerY - 20)
        .lineTo(pageW - margin, footerY - 20)
        .stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#4f46e5')
        .text('RENTORA', margin, footerY, { align: 'center', width: contentW });

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#9ca3af')
        .text(
          'Thank you for choosing Rentora! This is your official payment confirmation receipt.',
          margin,
          footerY + 13,
          { align: 'center', width: contentW }
        );

      doc
        .fontSize(7)
        .fillColor('#d1d5db')
        .text(`Transaction ID: ${item.transactionId}`, margin, footerY + 26, {
          align: 'center',
          width: contentW,
        });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateReceiptPDF };
