const Wishlist = require('../models/Wishlist');

// @desc    Get the current user's wishlist (with populated product data)
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      'products',
      'name images buyPrice rentPricePerDay rating category subCategory stock'
    );

    if (!wishlist) {
      // Return empty wishlist if none exists yet
      return res.json({ products: [] });
    }

    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle a product in the current user's wishlist (add/remove)
// @route   POST /api/wishlist/:productId
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      // Create a new wishlist and add the product
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });
      return res.json({ wishlisted: true, message: 'Added to wishlist' });
    }

    const alreadyWishlisted = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (alreadyWishlisted) {
      // Remove from wishlist
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
      );
      await wishlist.save();
      return res.json({ wishlisted: false, message: 'Removed from wishlist' });
    } else {
      // Add to wishlist
      wishlist.products.push(productId);
      await wishlist.save();
      return res.json({ wishlisted: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, toggleWishlist };
