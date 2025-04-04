const axios = require('axios');

// Render dashboard Page
exports.renderDashboard = async(req, res) => {
    const token = req.cookies.token;
    console.log('Token:', token);
    try {
        // Fetch dashboard data
        const { data: { data: dash } } = await axios.get(`${process.env.APP_URI}/fleet/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Log dashboard data
        console.log('Dashboard Data:', dash);

        // Fetch orders data for chart
        const { data: { data: orders } } = await axios.get(`${process.env.APP_URI}/fleet/orders`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Log orders data
        console.log('Orders Data:', orders);

        if (!dash) {
            return res.status(404).render('fleet/components/dashboard', { dash: null, orders: null, error: 'Dashboard not found.' });
        }

        // Pass both dashboard and orders data to the view
        res.render('fleet/components/dashboard', { dash, orders, error: null });
    } catch (error) {
        const { response } = error;

        if (response) {
            if (response.status === 404) {
                return res.status(404).render('fleet/components/dashboard', { dash: null, orders: null, error: 'Dashboard not found.' });
            }
            if (response.status === 401) {
                return res.redirect('/sign-in');
            }
        }

        res.status(500).render('fleet/components/dashboard', { dash: null, orders: null, error: 'Failed to fetch dashboard data.' });
    }
};


// Render profile Page
exports.renderProfile = async(req, res) => {
    const token = req.cookies.token;

    try {
        // Fetch profile data
        await axios.get(`${process.env.APP_URI}/fleet/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });


        if (!profile) {
            return res.status(404).render('fleet/components/profile', { profile: null, error: 'Profile not found.' });
        }

        // Pass profile data to the view
        res.render('fleet/components/profile', { profile, error: null });
    } catch (error) {
        const { response } = error;

        if (response) {
            if (response.status === 404) {
                return res.status(404).render('fleet/components/profile', { profile: null, error: 'Profile not found.' });
            }
            if (response.status === 401) {
                return res.redirect('/sign-in');
            }
        }

        res.status(500).render('fleet/components/profile', { profile: null, error: 'Failed to fetch profile data.' });
    }
};
