const axios = require('axios');


exports.getAllCustomers = async(req, res) => {
    try {
        const token = req.cookies.token;
        const response = await axios.get(`${process.env.APP_URI}/fleet/customers`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const customers = response.data.data;

        res.render('fleet/components/customer/customer', { customers, error: null });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return res.redirect('/sign-in');
        }

        res.render('fleet/components/customer/customer', { customers: [], error: 'No customer Found.' });
    }
};



exports.getCustomerById = async(req, res) => {
    let customerId; // Declare customerId outside the try block so it's accessible everywhere

    try {
        customerId = req.params.id; // Get customer ID from the route parameters
        const token = req.cookies.token; // Extract token from cookies

        const response = await axios.get(`${process.env.APP_URI}/fleet/getOneCustomer/${customerId}`, {
            headers: {
                Authorization: `Bearer ${token}`, // Pass token in the headers
            },
        });

        const customer = response.data.data; // Access the customer data
        if (!customer || customer.length === 0) {
            // console.log(`customer with ID: ${customerId} not found.`);
            return res.status(404).render('fleet/components/customer/view-customer', { customer: null, error: 'customer not found.' });
        }

        // Render the customer details page with the retrieved data
        // console.log('customer fetched successfully:', customer);
        res.render('fleet/components/customer/view-customer', { customer, error: null });

    } catch (error) {
        console.error('Error fetching customer:', error.response ? error.response.data : error.message);

        if (error.response && error.response.status === 404) {
            // console.log(`customer with ID: ${customerId} not found.`); // customer ID will now be accessible
            return res.status(404).render('fleet/components/customer/view-customer', { customer: null, error: 'customer not found.' });
        }

        // Handle token-related errors, such as expiration or invalid token
        if (error.response && error.response.status === 401) {
            // console.log('Invalid or expired token, redirecting to sign-in page.');
            return res.redirect('/sign-in');
        }

        // Handle other API errors
        res.status(500).render('fleet/components/customer/view-customer', { customer: null, error: 'Error fetching customer details.' });
    }
};
