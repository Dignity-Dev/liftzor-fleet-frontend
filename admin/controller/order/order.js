const axios = require('axios');

// Fetch all orders from API
exports.getAllOrders = async(req, res) => {
    try {
        const token = req.cookies.token;
        const response = await axios.get(`${process.env.APP_URI}/fleet/orders`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const orders = response.data.data;
        if (!orders || orders.length === 0) {
            return res.render('fleet/components/order/order', { orders: [], error: 'No orders available.' });
        }
        // Sort the orders by 'createdAt' (either ascending or descending)
        const sortedOrders = orders.sort((a, b) => {
            // Assuming createdAt is in ISO format. Adjust if it's a different format.
            return new Date(b.createdAt) - new Date(a.createdAt); // descending order
        });
        res.render('fleet/components/order/order', { orders: sortedOrders, error: null });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return res.redirect('/sign-in');
        }
        res.render('fleet/components/order/order', { orders: [], error: 'Error fetching orders.' });
    }
};

// Fetch an order by ID
exports.getOrderById = async(req, res) => {
    let orderId;

    try {
        orderId = req.params.id; // Get order ID from the route parameters
        const token = req.cookies.token;
        const response = await axios.get(`${process.env.APP_URI}/fleet/getOneOrder/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const order = response.data.data;
        if (!order) {
            return res.status(404).render('fleet/components/order/view-order', { order: null, error: 'Order not found.' });
        }

        res.render('fleet/components/order/view-order', { order, error: null });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).render('fleet/components/order/view-order', { order: null, error: 'Order not found.' });
        }
        if (error.response && error.response.status === 401) {
            return res.redirect('/sign-in');
        }
        res.status(500).render('fleet/components/order/view-order', { order: null, error: 'Failed to fetch order.' });
    }
};

// Assign an order to a driver
exports.assignOrderToDriver = async(req, res) => {
    try {
        const { driverID, orderID } = req.body;
        if (!driverID || !orderID) {
            return res.status(400).json({ error: 'Both Driver ID and Order ID are required.' });
        }
        console.log('Driver ID: ' + driverID, 'order ID: ' + orderID);
        const token = req.cookies.token;
        if (!token) return res.redirect('/sign-in');

        // Construct the API endpoint
        const apiUrl = `${process.env.APP_URI}/fleet/pairDriver?orderID=${orderID}&driverID=${driverID}`;

        // Assign driver to order using a PUT request
        await axios.put(apiUrl, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });


        // Redirect to the manage orders page after successful assignment
        return res.redirect('/pending-order'); // Adjust this path as necessary

    } catch (error) {
        if (error.message === 'Authorization Expired') {
            return res.redirect('/sign-in');
        }


        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'Order or driver not found.' });
        }

        return res.status(500).json({ error: 'Failed to assign driver to the order.' });
    }
};

// Fetch pending orders from API
exports.getPendingOrders = async(req, res) => {
    try {
        // const token = req.cookies.token; // Extract token from cookies
        const response = await axios.get(`${process.env.APP_URI}/fleet/pending`);

        const pendingOrders = response.data.data;
        if (!pendingOrders || pendingOrders.length == 0) {
            return res.render('fleet/components/order/pending-order', { pendingOrders: [], error: 'No pending orders available.' });
        }

        // Sort the orders by 'createdAt' (either ascending or descending)
        const sortedOrders = pendingOrders.sort((a, b) => {
            // Assuming createdAt is in ISO format. Adjust if it's a different format.
            return new Date(b.createdAt) - new Date(a.createdAt); // descending order
        });
        res.render('fleet/components/order/order', { orders: sortedOrders, error: null });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return res.redirect('/sign-in'); // Redirect to sign-in on unauthorized access
        }

        res.render('fleet/components/order/pending-order', { pendingOrders: [], error: 'Error fetching pending orders.' });
    }
};

// Confirm an order (assuming this function is required)
exports.assignedOrders = async(req, res) => {
    try {
        const token = req.cookies.token; // Extract token from cookies
        const response = await axios.get(`${process.env.APP_URI}/fleet/orders`, {
            headers: {
                Authorization: `Bearer ${token}` // Pass token in the headers
            }
        });

        let orders = response.data.data;

        // Filter orders with status equal to "assigned"
        orders = orders.filter(order => order.status === 'assigned');

        // Sort orders by createdAt date in descending order (most recent first)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (!orders || orders.length === 0) {
            return res.render('fleet/components/order/assigned-order', { orders: [], error: 'No assigned orders available.' });
        }

        // Render the assigned orders page with the filtered and sorted data
        res.render('fleet/components/order/assigned-order', { orders, error: null });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return res.redirect('/sign-in'); // Redirect to sign-in on unauthorized access
        }

        res.render('fleet/components/order/assigned-order', { orders: [], error: 'Error fetching assigned orders.' });
    }
}
