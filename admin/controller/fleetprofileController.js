const axios = require('axios');

// Show Add Account Page
exports.renderAddAccountPage = async (req, res) => {
    // Save the session messages and clear them immediately
    const successMessage = req.session.success;
    const errorMessage = req.session.error;
    req.session.success = null;
    req.session.error = null;

    try {
      const token = req.cookies.token;

      const { data } = await axios.get(`${process.env.APP_URI}/user/getBankList`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const banks = Array.isArray(data.data) ? data.data : [];

      res.render('fleet/components/profile/add-account', {
        banks,
        success: successMessage,
        error: errorMessage
      });

    } catch (error) {
      res.render('fleet/components/profile/add-account', {
        banks: [],
        success: successMessage,
        error: errorMessage || 'Could not fetch banks'
      });
    }
  };


// Submit Account Details
exports.addAccountDetails = async (req, res) => {
  try {
    const token = req.cookies.token;

    await axios.post(`${process.env.APP_URI}/fleet/addAccountDetails`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    req.session.success = 'Bank account added successfully!';
    res.redirect('/add-account');

  } catch (error) {
    req.session.error = error?.response?.data?.message || 'Something went wrong while adding account!';
    res.redirect('/add-account');
  }
};

// Show Withdraw Page
exports.renderWithdrawPage = (req, res) => {
  res.render('fleet/components/profile/withdraw', {
    success: req.session.success || null,
    error: req.session.error || null,
  });

  req.session.success = null;
  req.session.error = null;
};

// Handle Withdraw Request
exports.withdrawFunds = async (req, res) => {
  try {
    const token = req.cookies.token;

    await axios.post(`${process.env.APP_URI}/profile/withdraw`, req.body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    req.session.success = 'Withdrawal successful!';
    res.redirect('/all-withdrawal');

  } catch (error) {
    req.session.error = error?.response?.data?.message || 'Withdraw failed';
    res.redirect('/withdraw');
  }
};

// List Withdrawals
exports.getWithdrawals = async (req, res) => {
  try {
    const token = req.cookies.token;

    const { data } = await axios.get(`${process.env.APP_URI}/fleet/allwithdrawals`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.render('fleet/components/profile/all-withdrawal', {
      withdrawals: data,
      success: req.session.success || null,
      error: req.session.error || null,
    });

    req.session.success = null;
    req.session.error = null;

  } catch (error) {
    res.render('fleet/components/profile/all-withdrawal', {
      withdrawals: [],
      success: null,
      error: 'Failed to load withdrawals',
    });
  }
};

// Show Bank Account Info
// View Account Details
exports.viewAccountDetails = async (req, res) => {
  try {
    const token = req.cookies.token;
    const { data } = await axios.get(`${process.env.APP_URI}/fleet/getMyProfile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const accountData = data.data; // <<< take the array directly

    //console.log('Account Data:', accountData); // good for debugging

    res.render('fleet/components/profile/account', {
      account: accountData, // pass array directly
      success: req.session.success || null,
      error: req.session.error || null
    });

    req.session.success = null;
    req.session.error = null;

  } catch (error) {
    console.log('Error fetching account:', error?.response?.data || error.message);
    res.render('fleet/components/profile/account', {
      account: [],
      success: null,
      error: 'Account not found!'
    });
  }
};
