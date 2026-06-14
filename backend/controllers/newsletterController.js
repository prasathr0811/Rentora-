const emailService = require('../services/emailService');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter
// @access  Public
const subscribeNewsletter = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    return next(new Error('Please provide an email address'));
  }

  // We are not saving it to DB yet as per current requirement, just sending a welcome email.
  try {
    await emailService.sendMail({
      to: email,
      subject: 'Welcome to Rentora Weekly!',
      text: 'Thanks for subscribing to our newsletter! You will now receive the latest listings and exclusive discounts directly in your inbox.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Welcome to Rentora Weekly!</h2>
          <p>Hi there,</p>
          <p>Thanks for subscribing to our newsletter! You will now receive the latest listings, promotional discounts, and exclusive rental guides directly in your inbox.</p>
          <p>Stay tuned for our upcoming updates.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The Rentora Team</strong></p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Subscribed successfully. Please check your email.' });
  } catch (error) {
    console.error('Newsletter email error:', error);
    res.status(500);
    next(new Error('Failed to send subscription email. Please try again later.'));
  }
};

module.exports = {
  subscribeNewsletter,
};
