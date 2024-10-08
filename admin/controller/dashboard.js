const axios = require('axios');

// Render dashboard Page
exports.renderDashboard = async(req, res) => {
    const token = req.cookies.token;

    try {
        const { data: { data: dash } } = await axios.get(`${process.env.APP_URI}/fleet/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!dash) {
            return res.status(404).render('fleet/components/dashboard', { dash: null, error: 'Dashboard not found.' });
        }

        res.render('fleet/components/dashboard', { dash, error: null });
    } catch (error) {
        const { response } = error;

        if (response) {
            if (response.status === 404) {
                return res.status(404).render('fleet/components/dashboard', { dash: null, error: 'Dashboard not found.' });
            }
            if (response.status === 401) {
                return res.redirect('/sign-in');
            }
        }

        res.status(500).render('fleet/components/dashboard', { dash: null, error: 'Failed to fetch dashboard data.' });
    }
};