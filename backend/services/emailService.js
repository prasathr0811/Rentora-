const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Cached transporter (reuse across requests)
let cachedTransporter = null;
let transporterType = null; // 'gmail', 'smtp', 'ethereal'

/**
 * Create SMTP transporter from .env config or auto-create Ethereal test account
 */
const getTransporter = async () => {
  if (cachedTransporter) return { transporter: cachedTransporter, type: transporterType };

  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Check if real credentials are configured (not placeholders)
  const isConfigured =
    host && port && user && pass &&
    !user.includes('your_') &&
    !pass.includes('your_') &&
    user.trim() !== '' &&
    pass.trim() !== '';

  if (isConfigured) {
    // Gmail setup
    if (host.includes('gmail')) {
      cachedTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
      transporterType = 'gmail';
      console.log('📧 Email: Using Gmail SMTP');
    } else {
      cachedTransporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: parseInt(port) === 465,
        auth: { user, pass },
      });
      transporterType = 'smtp';
      console.log(`📧 Email: Using SMTP (${host})`);
    }
  } else {
    // Auto-create Ethereal test account (works without any config!)
    try {
      const testAccount = await nodemailer.createTestAccount();
      cachedTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      transporterType = 'ethereal';
      console.log('📧 Email: Using Ethereal test account (auto-generated)');
      console.log(`   Ethereal credentials: ${testAccount.user} / ${testAccount.pass}`);
    } catch (err) {
      console.error('❌ Failed to create Ethereal test account:', err.message);
      return { transporter: null, type: null };
    }
  }

  return { transporter: cachedTransporter, type: transporterType };
};

/**
 * Sends order/rental receipt email to user
 * @param {Object} item - Order or Rental document (populated with user and product)
 * @param {String} type - 'buy' or 'rent'
 * @param {String} pdfPath - Absolute path to the generated PDF receipt
 */
const sendReceiptEmail = async (item, type, pdfPath) => {
  const userEmail = item.user.email;
  const userName = item.user.name;
  const productName = item.product.name;
  const transId = item.transactionId;
  const orderId = item._id.toString();
  const date = new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
  const receiptLink = `${serverUrl}/api/receipts/download/${transId}`;

  let totalAmount = 0;
  let customRentalHTML = '';

  if (type === 'buy') {
    totalAmount = item.totalAmount;
  } else {
    totalAmount = item.totalPaid;
    customRentalHTML = `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Rental Start Date:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${new Date(item.startDate).toLocaleDateString('en-IN')}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Rental End Date:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${new Date(item.endDate).toLocaleDateString('en-IN')}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Security Deposit:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">INR ${item.securityDeposit.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #7c3aed; text-decoration: none; }
        .title { font-size: 20px; color: #1f2937; font-weight: 600; margin-top: 10px; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .btn { display: inline-block; background-color: #7c3aed; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-align: center; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; line-height: 1.5; }
        .success-badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="#" class="logo">RENTORA</a>
          <div class="title">Payment Confirmation</div>
          <span class="success-badge">✓ Payment Successful</span>
        </div>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Thank you for choosing Rentora! Your payment was processed successfully. Below are your transaction details:</p>
        
        <table class="details-table">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Transaction Type:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right; text-transform: capitalize;">${type === 'buy' ? 'Purchase' : 'Rental'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Product Name:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Order ID:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right; font-family: monospace;">${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Transaction ID:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right; font-family: monospace;">${transId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Date:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${date}</td>
          </tr>
          ${customRentalHTML}
          <tr>
            <td style="padding: 10px 0; border-top: 2px solid #1f2937; color: #1f2937; font-weight: bold; font-size: 16px;"><strong>Amount Paid:</strong></td>
            <td style="padding: 10px 0; border-top: 2px solid #1f2937; color: #7c3aed; font-weight: bold; font-size: 16px; text-align: right;">INR ${totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <div style="text-align: center;">
          <a href="${receiptLink}" class="btn" target="_blank">View / Download PDF Receipt</a>
        </div>

        <div class="footer">
          <p>Thank you for shopping with Rentora. This receipt is your official transaction confirmation.</p>
          <p>&copy; 2026 Rentora. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const { transporter, type: tType } = await getTransporter();

  if (!transporter) {
    console.log('❌ No email transporter available. Skipping email.');
    return;
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@rentora.com';

  const mailOptions = {
    from: `"Rentora" <${fromAddress}>`,
    to: userEmail,
    subject: `Rentora – Payment Confirmed: ${productName}`,
    html: htmlContent,
  };

  if (pdfPath && fs.existsSync(pdfPath)) {
    mailOptions.attachments = [
      {
        filename: `Rentora_Receipt_${transId.substring(0, 8)}.pdf`,
        path: pdfPath,
      },
    ];
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${userEmail} (Message ID: ${info.messageId})`);

    // If using Ethereal, log the preview URL so you can view the email in browser
    if (tType === 'ethereal') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`🔗 Preview email: ${previewUrl}`);
    }
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
  }
};

/**
 * Sends order/rental cancellation email to user
 * @param {Object} item - Order or Rental document (populated with user and product)
 * @param {String} type - 'buy' or 'rent'
 */
const sendCancellationEmail = async (item, type) => {
  const userEmail = item.user.email;
  const userName = item.user.name;
  const productName = item.product.name;
  const transId = item.transactionId;
  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  let customHTML = '';
  let title = '';

  if (type === 'buy') {
    title = 'Order Cancellation Confirmation';
    customHTML = `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Refund Amount:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #dc2626; text-align: right; font-weight: bold;">INR ${item.totalAmount.toLocaleString('en-IN')}</td>
      </tr>
    `;
  } else {
    title = 'Rental Lease Cancellation';
    customHTML = `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Lease Refund:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">INR ${item.rentCost.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Deposit Refund:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #16a34a; text-align: right; font-weight: bold;">INR ${item.securityDeposit.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Total Refunded:</strong></td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #dc2626; text-align: right; font-weight: bold;">INR ${item.totalPaid.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #dc2626; text-decoration: none; }
        .title { font-size: 20px; color: #1f2937; font-weight: 600; margin-top: 10px; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; line-height: 1.5; }
        .cancel-badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="#" class="logo">RENTORA</a>
          <div class="title">${title}</div>
          <span class="cancel-badge">✗ Transaction Cancelled</span>
        </div>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Your transaction cancellation has been processed. The details of the cancelled order/lease are listed below:</p>
        
        <table class="details-table">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Transaction Type:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right; text-transform: capitalize;">${type === 'buy' ? 'Purchase Cancellation' : 'Rental Cancellation'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Product Name:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Transaction ID:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right; font-family: monospace;">${transId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #4b5563;"><strong>Cancellation Date:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-align: right;">${date}</td>
          </tr>
          ${customHTML}
        </table>

        <p style="font-size: 13px; color: #4b5563; line-height: 1.6;">
          <strong>Refund Information:</strong> The refund of your payment will be credited back to your original payment method within 3-5 business days. 
        </p>

        <div class="footer">
          <p>This is an automated transaction cancellation notification from Rentora.</p>
          <p>&copy; 2026 Rentora. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const { transporter, type: tType } = await getTransporter();

  if (!transporter) {
    console.log('❌ No email transporter available. Skipping cancellation email.');
    return;
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@rentora.com';

  const mailOptions = {
    from: `"Rentora" <${fromAddress}>`,
    to: userEmail,
    subject: `Rentora – Transaction Cancelled: ${productName}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Cancellation email sent to ${userEmail} (Message ID: ${info.messageId})`);
    if (tType === 'ethereal') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`🔗 Preview email: ${previewUrl}`);
    }
  } catch (err) {
    console.error('❌ Failed to send cancellation email:', err.message);
  }
};

/**
 * Sends a generic email
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendMail = async (options) => {
  const { transporter, type: tType } = await getTransporter();

  if (!transporter) {
    console.log('❌ No email transporter available. Skipping generic email.');
    return;
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@rentora.com';

  const mailOptions = {
    from: `"Rentora" <${fromAddress}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.to} (Message ID: ${info.messageId})`);
    if (tType === 'ethereal') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`🔗 Preview email: ${previewUrl}`);
    }
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    throw err;
  }
};

module.exports = { sendReceiptEmail, sendCancellationEmail, sendMail };
