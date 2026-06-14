const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProductReview,
  getProductReviews,
  getCategories,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getProducts);
router.route('/categories').get(getCategories);
router.route('/:id').get(getProductById);
router.route('/:id/reviews').get(getProductReviews).post(protect, createProductReview);

module.exports = router;
