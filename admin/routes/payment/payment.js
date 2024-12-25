// routes/driver/driver.js
const express = require('express');
const router = express.Router();
const paymentController = require('../../controller/payment/payment');
const authorize = require('../../../utils/middleware/adminMiddleware');

// Apply the authorization middleware to all routes within this router
router.use(authorize);

// Routes
router.get('/manage-payment', paymentController.getAllPayment);
// router.get('/new-driver', driverController.getNewDriverForm);
router.get('/payment/:id', paymentController.getPaymentById);
// router.get('/update-driver/:id', driverController.getUpdateDriverForm);
// router.patch('/drivers/:id', driverController.updateDriver);
// router.delete('/drivers/:id', driverController.deleteDriver);

module.exports = router;
