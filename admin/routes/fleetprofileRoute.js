const express = require('express');
const router = express.Router();
const fleetUserController = require('../controller/fleetprofileController');
const authorize = require('../../utils/middleware/adminMiddleware');

router.use(authorize);
// Show form to add bank account
router.get('/add-account', fleetUserController.renderAddAccountPage);

// Handle add bank account POST
router.post('/add-account', fleetUserController.addAccountDetails);

// Withdraw page and handler
router.get('/withdraw', fleetUserController.renderWithdrawPage);
router.post('/withdraw', fleetUserController.withdrawFunds);

// Show all withdrawals
router.get('/all-withdrawal', fleetUserController.getWithdrawals);

// View account info
router.get('/account', fleetUserController.viewAccountDetails);

module.exports = router;
