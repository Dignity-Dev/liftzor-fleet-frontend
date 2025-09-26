const axios = require('axios');

// ====================== Render Dashboard Page ======================
exports.renderDashboard = async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/sign-in');
    }

    try {
        // Fetch dashboard data
        const { data: { data: dash } } = await axios.get(
            `${process.env.APP_URI}/fleet/dashboard`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Fetch orders data for chart
        const { data: { data: orders } } = await axios.get(
            `${process.env.APP_URI}/fleet/orders`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!dash) {
            return res.status(404).render('fleet/components/dashboard', {
                dash: null,
                orders: null,
                error: 'Dashboard not found.'
            });
        }

        res.render('fleet/components/dashboard', { dash, orders, error: null });

    } catch (error) {
        const { response } = error;

        if (response) {
            if (response.status === 404) {
                return res.status(404).render('fleet/components/dashboard', {
                    dash: null,
                    orders: null,
                    error: 'Dashboard not found.'
                });
            }
            if (response.status === 401) {
                return res.redirect('/sign-in');
            }
        }

        console.error('Dashboard Error:', error.message);
        res.status(500).render('fleet/components/dashboard', {
            dash: null,
            orders: null,
            error: 'Failed to fetch dashboard data.'
        });
    }
};


// ====================== Render Fleet Profile Page ======================
exports.renderProfile = async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/sign-in');
    }

    try {
        const { data } = await axios.get(
            `${process.env.APP_URI}/fleet/getMyProfile`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const profile = data?.data?.[0] || null;
        console.log('Profile Data:', profile);
        if (!profile) {
            return res.render('fleet/components/profile', {
                profile: null,
                error: 'No profile data found!',
                success: null
            });
        }

        res.render('fleet/components/profile', {
            profile,
            error: null,
            success: null
        });

    } catch (error) {
        console.error('Profile Error:', error.message);
        res.render('fleet/components/profile', {
            profile: null,
            error: 'Something went wrong while fetching profile!',
            success: null
        });
    }
};


// ====================== Change Password ======================
exports.changePassword = async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).render('fleet/components/sign-in', {
            error: 'Unauthorized access. Please log in.'
        });
    }

    try {
        const response = await axios.put(
            `${process.env.APP_URI}/fleet/changePassword`,
            req.body,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const successMessage = response?.data?.message || 'Password changed successfully!';

        res.render('fleet/components/profile', {
            profile: null, // keep consistent
            success: successMessage,
            error: null
        });

    } catch (error) {
        console.error('Password Change Error:', error.response ? error.response.data : error.message);

        const errorMessage = error.response?.data?.message || 'Failed to change password';

        res.status(400).render('fleet/components/profile', {
            profile: null, // keep consistent
            error: errorMessage,
            success: null
        });
    }
};

