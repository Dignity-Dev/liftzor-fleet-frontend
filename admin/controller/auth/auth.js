const axios = require('axios');
const jwt = require('jsonwebtoken');

// Render Sign-in Page
exports.renderSignIn = (req, res) => {
    res.render('fleet/components/sign-in', { error: null });
};

// Handle Sign-in
exports.signin = async(req, res) => {
    try {
        const response = await axios.post(`${process.env.APP_URI}/fleet/login`, req.body);
        const {
            accessToken
        } = response.data.data;
        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);

        const errorMessage = (error.response && error.response.data && error.response.data.message) ?
            error.response.data.message :
            'Login failed';

        res.status(401).render('fleet/components/sign-in', { error: errorMessage });
    }
};


// Logout Route
exports.signOut = (req, res) => {
    res.clearCookie('token');
    res.redirect('/sign-in');
    console.log('User logged out');
};
