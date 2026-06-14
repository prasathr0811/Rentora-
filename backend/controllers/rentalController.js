const Rental = require('../models/Rental');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const { generateReceiptPDF } = require('../services/pdfService');
const { sendReceiptEmail, sendCancellationEmail } = require('../services/emailService');

// @desc    Create new rental order
// @route   POST /api/rentals
// @access  Private
const createRental = async (req, res, next) => {
  const { productId, startDate, endDate, shippingAddress, contactNumber } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate rent days duration
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const rentCost = product.rentPricePerDay * diffDays;
    const securityDeposit = product.securityDeposit;
    const totalPaid = rentCost + securityDeposit;

    const transactionId = `TXN-RENT-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create the rental record
    const rental = new Rental({
      user: req.user._id,
      product: productId,
      startDate: start,
      endDate: end,
      rentCost,
      securityDeposit,
      totalPaid,
      shippingAddress,
      contactNumber,
      transactionId,
      status: 'Active',
    });

    const createdRental = await rental.save();

    // Create payment entry
    await Payment.create({
      user: req.user._id,
      amount: totalPaid,
      transactionId,
      type: 'rent',
      status: 'Successful',
    });

    // Populate user and product details for invoicing
    const populatedRental = await Rental.findById(createdRental._id)
      .populate('user', 'name email')
      .populate('product', 'name category rentPricePerDay securityDeposit');

    // Generate PDF receipt and trigger email
    try {
      const pdfPath = await generateReceiptPDF(populatedRental, 'rent');
      await sendReceiptEmail(populatedRental, 'rent', pdfPath);
    } catch (pdfErr) {
      console.error('Failed to generate PDF receipt or send email:', pdfErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Product rented successfully',
      rental: createdRental,
      transactionId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user rentals
// @route   GET /api/rentals/myrentals
// @access  Private
const getMyRentals = async (req, res, next) => {
  try {
    const rentals = await Rental.find({ user: req.user._id })
      .populate('product', 'name images rentPricePerDay securityDeposit category')
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel rental
// @route   PUT /api/rentals/:id/cancel
// @access  Private
const cancelRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      res.status(404);
      throw new Error('Rental record not found');
    }

    if (rental.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this rental');
    }

    if (rental.status === 'Cancelled') {
      res.status(400);
      throw new Error('Rental is already cancelled');
    }

    if (rental.status === 'Returned') {
      res.status(400);
      throw new Error('Completed rentals cannot be cancelled');
    }

    rental.status = 'Cancelled';
    await rental.save();

    // Send cancellation email
    try {
      const populatedRental = await Rental.findById(rental._id)
        .populate('user', 'name email')
        .populate('product', 'name category rentPricePerDay securityDeposit');
      await sendCancellationEmail(populatedRental, 'rent');
    } catch (emailErr) {
      console.error('Failed to send rental cancellation email:', emailErr.message);
    }

    res.json({
      success: true,
      message: 'Rental cancelled successfully',
      rental,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRental,
  getMyRentals,
  cancelRental,
};
