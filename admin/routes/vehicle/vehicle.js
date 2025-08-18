// routes/driver/driver.js
const express = require('express');
const router = express.Router();
const upload = require('../../../utils/middleware/uploadMiddleware');
const vehicleController = require('../../controller/vehicle/vehicle');
const authorize = require('../../../utils/middleware/adminMiddleware');

// Apply the authorization middleware to all routes within this router
router.use(authorize);

// Routes
// router.post('/new-vehicle', vehicleController.getNewVehicleForm);
// Use upload.single('file') to handle file uploads from the form
router.post('/new-vehicle', upload.fields([{ name: 'vehiclePhoto' }, { name: 'vehicleDocuments' }]), vehicleController.getNewVehicleForm);

router.get('/new-vehicle', vehicleController.renderNewVehicleForm);
router.get('/manage-vehicle', vehicleController.getAllVehicle);
router.get('/vehicle/:id', vehicleController.getvehicleById);
router.post('/assign-vehicle', vehicleController.assignVehicleToDriver);
router.post('/unpair-vehicle', vehicleController.unpairVehicleToDriver);

router.get('/edit-vehicle/:id', vehicleController.editVehicle);

router.post('/edit-vehicle', vehicleController.updateVehicle);

router.post('/delete-vehicle/:id', vehicleController.deleteVehicle);

module.exports = router;
