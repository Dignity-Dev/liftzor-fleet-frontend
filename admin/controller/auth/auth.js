// const axios = require('axios');
// const jwt = require('jsonwebtoken');

// // Render Sign-in Page
// exports.renderSignIn = (req, res) => {
//     res.render('fleet/components/sign-in', { error: null });
// };

// // Handle Sign-in
// exports.signin = async(req, res) => {
//     try {
//         // Send POST request to the login API
//         const response = await axios.post(`${process.env.APP_URI}/fleet/login`, req.body);

//         // Extract the accessToken from the response data
//         const accessToken = response.data.data.accessToken;

//         // Decode the JWT token to get user info (for display only, not for verification)
//         const decodedToken = jwt.decode(accessToken); // Decoding without verification

//         // Log decoded user info for debugging purposes
//         const userInfo = {
//             id: decodedToken.userID,
//             userType: decodedToken.userType,
//             emailAddress: decodedToken.emailAddress || 'N/A',
//             fullName: decodedToken.fullName || 'N/A',
//             issuedAt: new Date(decodedToken.iat * 1000),
//             expiresAt: new Date(decodedToken.exp * 1000)
//         };

//         // Store the token in a cookie
//         res.cookie('token', accessToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             maxAge: 24 * 60 * 60 * 1000 // 1 day
//         });

//         // Redirect to the dashboard
//         return res.redirect('/dashboard');

//     } catch (error) {
//         console.error('Error:', error.response ? error.response.data : error.message);

//         const errorMessage = (error.response && error.response.data && error.response.data.message) ?
//             error.response.data.message :
//             'Login failed';

//         return res.status(401).json({
//             success: false,
//             message: errorMessage
//         });
//     }
// };

// // Logout Route
// exports.signOut = (req, res) => {
//     res.clearCookie('token');
//     res.redirect('/sign-in');
//     console.log('User logged out');
// };



const axios = require('axios');
const jwt = require('jsonwebtoken');

// Render Sign-in Page
exports.renderSignIn = (req, res) => {
    res.render('fleet/components/sign-in', { error: null });
};

// Handle Sign-in
exports.signin = async(req, res) => {
    try {
        // Send POST request to the login API
        const response = await axios.post(`${process.env.APP_URI}/fleet/login`, req.body);

        // Extract the accessToken from the response data
        const {
            accessToken
        } = response.data.data;
        // if (!user) {
        //     throw new Error("User data missing from response");
        // }
        // Store the token in a cookie
        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // Store user details in session
        // req.session.user = user;


        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);

        const errorMessage = (error.response && error.response.data && error.response.data.message) ?
            error.response.data.message :
            'Login failed';

        // Ensure only one response is sent
        res.status(401).render('fleet/components/sign-in', { error: errorMessage });
    }
};


// Logout Route
exports.signOut = (req, res) => {
    res.clearCookie('token');
    res.redirect('/sign-in');
    console.log('User logged out');
};
