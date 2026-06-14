const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
    },
    subCategory: {
      type: String,
      required: [true, 'Please add a subcategory'],
      trim: true,
    },
    buyPrice: {
      type: Number,
      required: [true, 'Please add a buying price'],
    },
    rentPricePerDay: {
      type: Number,
      required: [true, 'Please add a rental price per day'],
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Please add a security deposit'],
    },
    images: {
      type: [String],
      required: [true, 'Please add at least one image URL'],
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      default: 10,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    specs: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
