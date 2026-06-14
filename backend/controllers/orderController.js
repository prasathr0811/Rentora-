const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const { generateReceiptPDF } = require('../services/pdfService');
const { sendReceiptEmail, sendCancellationEmail } = require('../services/emailService');

// @desc    Create new buy order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  const { productId, quantity, shippingAddress, contactNumber } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      res.status(400);
      throw new Error(`Insufficient stock. Only ${product.stock} items left.`);
    }

    const totalAmount = product.buyPrice * quantity;
    const transactionId = `TXN-BUY-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create the order
    const order = new Order({
      user: req.user._id,
      product: productId,
      quantity,
      totalAmount,
      shippingAddress,
      contactNumber,
      transactionId,
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
    });

    const createdOrder = await order.save();

    // Deduct stock
    product.stock -= quantity;
    await product.save();

    // Create payment entry
    await Payment.create({
      user: req.user._id,
      amount: totalAmount,
      transactionId,
      type: 'buy',
      status: 'Successful',
    });

    // Populate user and product for receipt generation
    const populatedOrder = await Order.findById(createdOrder._id)
      .populate('user', 'name email')
      .populate('product', 'name category buyPrice');

    // Generate PDF receipt and trigger email
    try {
      const pdfPath = await generateReceiptPDF(populatedOrder, 'buy');
      await sendReceiptEmail(populatedOrder, 'buy', pdfPath);
    } catch (pdfErr) {
      console.error('Failed to generate PDF receipt or send email:', pdfErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: createdOrder,
      transactionId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('product', 'name images buyPrice category')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    if (order.orderStatus === 'Cancelled') {
      res.status(400);
      throw new Error('Order is already cancelled');
    }

    if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
      res.status(400);
      throw new Error(`Cannot cancel order after it has been ${order.orderStatus.toLowerCase()}`);
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    // Restore stock
    const product = await Product.findById(order.product);
    if (product) {
      product.stock += order.quantity;
      await product.save();
    }

    // Send cancellation email
    try {
      const populatedOrder = await Order.findById(order._id)
        .populate('user', 'name email')
        .populate('product', 'name category buyPrice');
      await sendCancellationEmail(populatedOrder, 'buy');
    } catch (emailErr) {
      console.error('Failed to send order cancellation email:', emailErr.message);
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return order
// @route   PUT /api/orders/:id/return
// @access  Private
const returnOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to return this order');
    }

    if (order.orderStatus === 'Returned') {
      res.status(400);
      throw new Error('Order is already returned');
    }

    if (order.orderStatus === 'Cancelled') {
      res.status(400);
      throw new Error('Cancelled orders cannot be returned');
    }

    order.orderStatus = 'Returned';
    await order.save();

    // Restore stock
    const product = await Product.findById(order.product);
    if (product) {
      product.stock += order.quantity;
      await product.save();
    }

    res.json({
      success: true,
      message: 'Order returned successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  cancelOrder,
  returnOrder,
};
