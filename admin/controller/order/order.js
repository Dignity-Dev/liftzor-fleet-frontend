const axios = require('axios');

// Fetch all orders
exports.getAllOrders = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect('/sign-in');

    const { data: { data: orders = [] } } = await axios.get(
      `${process.env.APP_URI}/fleet/orders`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const sortedOrders = orders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.render('fleet/components/order/order', { orders: sortedOrders, error: null });
  } catch (error) {
    console.error("getAllOrders error:", error.response?.data || error.message);

    if (error.response?.status === 401) return res.redirect('/sign-in');
    res.render('fleet/components/order/order', { orders: [], error: 'No orders available.' });
  }
};

// Fetch an order by ID
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const token = req.cookies.token;
    if (!token) return res.redirect('/sign-in');

    const { data: { data: order } } = await axios.get(
      `${process.env.APP_URI}/fleet/getOneOrder/${orderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!order) throw new Error("Order not found");

    res.render('fleet/components/order/view-order', { order, error: null });
  } catch (error) {
    console.error("getOrderById error:", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message || 'An error occurred while fetching order, try again.';

    res.redirect(`/pending-order?status=error&message=${encodeURIComponent(errorMessage)}`);
  }
};

// Assign order to driver
exports.assignOrderToDriver = async (req, res) => {
  try {
    const { driverID, orderID } = req.body;
    const token = req.cookies.token;
    if (!token) return res.redirect('/sign-in');

    if (!driverID || !orderID) {
      return res.status(400).json({ error: 'Both Driver ID and Order ID are required.' });
    }

    const apiUrl = `${process.env.APP_URI}/fleet/pairDriver?orderID=${orderID}&driverID=${driverID}`;

    await axios.put(apiUrl, {}, { headers: { Authorization: `Bearer ${token}` } });

    return res.redirect('/pending-order');
  } catch (error) {
    console.error("assignOrderToDriver error:", error.response?.data || error.message);

    if (error.response?.status === 401) return res.redirect('/sign-in');
    if (error.response?.status === 404) return res.status(404).json({ error: 'Order or driver not found.' });

    return res.status(500).json({ error: 'Failed to assign driver to the order.' });
  }
};

// Fetch pending orders
exports.getPendingOrders = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect('/sign-in');

    const { data: { data: pendingOrders = [] } } = await axios.get(
      `${process.env.APP_URI}/fleet/pending`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const sortedOrders = pendingOrders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.render('fleet/components/order/pending-order', { orders: sortedOrders, error: null });
  } catch (error) {
    console.error("getPendingOrders error:", error.response?.data || error.message);

    if (error.response?.status === 401) return res.redirect('/sign-in');
    res.render('fleet/components/order/pending-order', { orders: [], error: 'No pending orders available.' });
  }
};

// Fetch assigned orders
exports.assignedOrders = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect('/sign-in');

    const { data: { data: orders = [] } } = await axios.get(
      `${process.env.APP_URI}/fleet/orders`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const assigned = orders
      .filter(order => order.status === 'assigned')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.render('fleet/components/order/assigned-order', { orders: assigned, error: null });
  } catch (error) {
    console.error("assignedOrders error:", error.response?.data || error.message);

    if (error.response?.status === 401) return res.redirect('/sign-in');
    res.render('fleet/components/order/assigned-order', { orders: [], error: 'No assigned orders available.' });
  }
};
