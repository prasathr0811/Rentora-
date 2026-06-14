const Order = require('../models/Order');
const Rental = require('../models/Rental');
const path = require('path');
const fs = require('fs');
const { generateReceiptPDF } = require('../services/pdfService');

// @desc    Download PDF Receipt file
// @route   GET /api/receipts/download/:transactionId
// @access  Public (So emails can link to it directly)
const downloadReceipt = async (req, res, next) => {
  const { transactionId } = req.params;

  try {
    const dirPath = path.join(__dirname, '../public/receipts');
    const filePath = path.join(dirPath, `${transactionId}.pdf`);

    // If file already exists, send it
    if (fs.existsSync(filePath)) {
      return res.download(filePath, `Rentora_Receipt_${transactionId.substring(0, 8)}.pdf`);
    }

    // Otherwise find the record and generate it on-the-fly
    let item = await Order.findOne({ transactionId })
      .populate('user', 'name email')
      .populate('product', 'name category buyPrice');
    let type = 'buy';

    if (!item) {
      item = await Rental.findOne({ transactionId })
        .populate('user', 'name email')
        .populate('product', 'name category rentPricePerDay securityDeposit');
      type = 'rent';
    }

    if (!item) {
      res.status(404);
      throw new Error('Transaction record not found');
    }

    // Generate the PDF
    const newFilePath = await generateReceiptPDF(item, type);
    res.download(newFilePath, `Rentora_Receipt_${transactionId.substring(0, 8)}.pdf`);
  } catch (error) {
    next(error);
  }
};

// @desc    Get receipt JSON details for web presentation
// @route   GET /api/receipts/details/:transactionId
// @access  Private
const getReceiptDetails = async (req, res, next) => {
  const { transactionId } = req.params;

  try {
    let item = await Order.findOne({ transactionId })
      .populate('user', 'name email')
      .populate('product', 'name category buyPrice images');
    let type = 'buy';

    if (!item) {
      item = await Rental.findOne({ transactionId })
        .populate('user', 'name email')
        .populate('product', 'name category rentPricePerDay securityDeposit images');
      type = 'rent';
    }

    if (!item) {
      res.status(404);
      throw new Error('Transaction details not found');
    }

    res.json({
      type,
      details: item,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadReceipt,
  getReceiptDetails,
};
