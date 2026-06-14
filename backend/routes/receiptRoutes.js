const express = require('express');
const router = express.Router();
const { downloadReceipt, getReceiptDetails } = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');

router.route('/download/:transactionId').get(downloadReceipt);
router.route('/details/:transactionId').get(protect, getReceiptDetails);

module.exports = router;
