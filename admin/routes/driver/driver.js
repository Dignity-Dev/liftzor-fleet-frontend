// routes/driver/driver.js
const express = require('express');
const router = express.Router();
const authorize = require('../../../utils/middleware/adminMiddleware');
const driverController = require('../../controller/driver/driver');

// Apply the authorization middleware to all routes within this router
router.use(authorize);

// Routes
router.get('/manage-driver', driverController.getAllDrivers);

// Add new driver form route
router.get('/new-driver', driverController.renderNewDriverForm);
router.post('/new-driver', driverController.getNewDriverForm);
router.get('/driver/:id', driverController.getDriverById);
router.post('/delete-driver/:id', driverController.deleteDriver);
router.get('/update-driver/:id', driverController.getUpdateDriverForm);
router.post('/update-driver/:id', driverController.updateDriver);


module.exports = router;
