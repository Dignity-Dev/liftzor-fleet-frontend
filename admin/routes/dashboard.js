const express = require('express');
const router = express.Router();
const dashboardRouter = require("../controller/dashboard");
const authorize = require('../../utils/middleware/adminMiddleware');

// Render to dashboard

router.get('/dashboard', authorize, dashboardRouter.renderDashboard);
router.get('/update-profile', authorize, dashboardRouter.renderProfile);
// router.get('/settings', authorize, dashboardRouter.renderSettings);

module.exports = router;
