const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { exec } = require('child_process');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Product = require('./models/Product');

// Route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets (for receipts)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Rentora Unified Buy & Rental Marketplace API' });
});

// Auto-seed check
// If the Product collection is empty, trigger the seed script in a child process
setTimeout(() => {
  Product.countDocuments()
    .then((count) => {
      if (count === 0) {
        console.log('Database empty! Triggering automatic product seeder...');
        exec('node seeders/seedProducts.js', (err, stdout, stderr) => {
          if (err) {
            console.error(`Auto-seeding failed: ${err.message}`);
          } else {
            console.log('Auto-seeding completed.');
            console.log(stdout);
          }
        });
      } else {
        console.log(`Database already populated with ${count} products.`);
      }
    })
    .catch((err) => {
      console.error(`Error checking product count: ${err.message}`);
    });
}, 2000); // Wait 2 seconds for DB connection to settle

// Fallback middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
