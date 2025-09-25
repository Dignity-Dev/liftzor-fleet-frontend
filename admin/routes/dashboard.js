const express = require('express');
const router = express.Router();
const dashboardRouter = require("../controller/dashboard");
const authorize = require('../../utils/middleware/adminMiddleware');

// Render to dashboard

router.get('/dashboard', authorize, dashboardRouter.renderDashboard);
router.get('/update-profile', authorize, dashboardRouter.renderProfile);

// change password
// router.get('/change-password', authorize, dashboardRouter.renderChangePasswordPage);
router.post('/change-password', authorize, dashboardRouter.changePassword);

module.exports = router;
