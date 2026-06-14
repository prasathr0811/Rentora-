const Product = require('../models/Product');
const Review = require('../models/Review');

// @desc    Get all products with filters, sorting & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 12;
    const page = parseInt(req.query.page) || 1;

    const query = {};

    // Search query (keyword)
    if (req.query.keyword) {
      query.name = {
        $regex: req.query.keyword,
        $options: 'i',
      };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Subcategory filter
    if (req.query.subCategory) {
      query.subCategory = req.query.subCategory;
    }

    // Min / Max Price Filter
    // Supporting filter on both buyPrice and rentPrice
    if (req.query.minPrice || req.query.maxPrice) {
      const priceFilter = {};
      if (req.query.minPrice) {
        priceFilter.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        priceFilter.$lte = Number(req.query.maxPrice);
      }

      if (req.query.priceType === 'rent') {
        query.rentPricePerDay = priceFilter;
      } else {
        query.buyPrice = priceFilter;
      }
    }

    // Sorting
    let sort = {};
    if (req.query.sortBy === 'priceLowToHigh') {
      sort = { buyPrice: 1 };
    } else if (req.query.sortBy === 'priceHighToLow') {
      sort = { buyPrice: -1 };
    } else if (req.query.sortBy === 'mostPopular') {
      sort = { rating: -1 };
    } else if (req.query.sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else {
      sort = { createdAt: -1 }; // default sorting
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sort);

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
      res.json({ product, reviews });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: product._id,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed by this user');
    }

    const review = await Review.create({
      user: req.user._id,
      userName: req.user.name,
      product: product._id,
      rating: Number(rating),
      comment,
    });

    // Recalculate average rating for product
    const productReviews = await Review.find({ product: product._id });
    const totalRating = productReviews.reduce((acc, item) => item.rating + acc, 0);
    product.rating = totalRating / productReviews.length;

    await product.save();

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unique categories and subcategories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categoriesData = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          subCategories: { $addToSet: '$subCategory' },
        },
      },
    ]);
    res.json(categoriesData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProductReview,
  getProductReviews,
  getCategories,
};
