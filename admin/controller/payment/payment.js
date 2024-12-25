const axios = require('axios');


exports.getAllPayment = async(req, res) => {
    try {
        const token = req.cookies.token;
        // console.log(token);
        const response = await axios.get(`${process.env.APP_URI}/fleet/allwithdrawals`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // Check if the API call was successful (status code 200)
        if (response.status === 200 || response.status === 404) {
            const payment = response.data.data;

            if (!payment || payment.length === 0) {
                return res.render('fleet/components/payment/payment', { payment: [], error: 'No payment available.' });
            }
            return res.render('fleet/components/payment/payment', { payment, error: null });
        } else {
            // If the status code isn't 200, consider it an error
            return res.render('fleet/components/payment/payment', { payment: [], error: 'Error fetching payment.' });
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return res.redirect('/sign-in');
        }
        res.render('fleet/components/payment/payment', { payments: [], error: 'Error fetching payments.' });
    }
};


// exports.getNewpaymentForm = (req, res) => {
//     res.render('fleet/payment/new-payment');
// };

exports.getPaymentById = async(req, res) => {
    let paymentId; // Declare paymentId outside the try block so it's accessible everywhere

    try {
        paymentId = req.params.id; // Get payment ID from the route parameters
        const token = req.cookies.token; // Extract token from cookies

        // console.log('Fetching payment with ID:', paymentId); // Debug log for payment ID

        // Fetch payment data from the external API using query parameters
        const response = await axios.get(`${process.env.APP_URI}/fleet/getOnePayment/${paymentId}`, {
            headers: {
                Authorization: `Bearer ${token}`, // Pass token in the headers
            },
        });

        const payment = response.data.data; // Access the payment data
        if (!payment || payment.length === 0) {
            // console.log(`payment with ID: ${paymentId} not found.`);
            return res.status(404).render('fleet/components/payment/view-payment', { payment: null, error: 'payment not found.' });
        }

        // Render the payment details page with the retrieved data
        // console.log('payment fetched successfully:', payment);
        res.render('fleet/components/payment/view-payment', { payment, error: null });

    } catch (error) {
        console.error('Error fetching payment:', error.response ? error.response.data : error.message);

        if (error.response && error.response.status === 404) {
            // console.log(`payment with ID: ${paymentId} not found.`); // payment ID will now be accessible
            return res.status(404).render('fleet/components/payment/view-payment', { payment: null, error: 'payment not found.' });
        }

        // Handle token-related errors, such as expiration or invalid token
        if (error.response && error.response.status === 401) {
            // console.log('Invalid or expired token, redirecting to sign-in page.');
            return res.redirect('/sign-in');
        }

        // Handle other API errors
        res.status(500).render('fleet/components/payment/view-payment', { payment: null, error: 'Error fetching payment details.' });
    }
};
