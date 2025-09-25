// routes/driver/driver.js
const express = require('express');
const router = express.Router();
const authController = require('../../controller/auth/auth');

// Routes
// Render the signin page
router.get('/', authController.renderSignIn);

// Handle the login
router.get('/sign-in', authController.renderSignIn);
router.post('/sign-in', authController.signin);

// Render the signout
router.get('/logout', authController.signOut);

// resetpassword
router.get('/reset-password', authController.renderPasswordRecovery);
router.post('/reset-password', authController.requestPasswordReset);



module.exports = router;
