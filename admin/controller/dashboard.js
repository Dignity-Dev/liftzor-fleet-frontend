const axios = require('axios');

// Render dashboard Page
exports.renderDashboard = async(req, res) => {
    const token = req.cookies.token;
    // console.log('Token:', token);
    try {
        // Fetch dashboard data
        const { data: { data: dash } } = await axios.get(`${process.env.APP_URI}/fleet/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Log dashboard data
        // console.log('Dashboard Data:', dash);

        // Fetch orders data for chart
        const { data: { data: orders } } = await axios.get(`${process.env.APP_URI}/fleet/orders`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Log orders data
        // console.log('Orders Data:', orders);

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


// Render Fleet Profile Page
exports.renderProfile = async (req, res) => {
    try {
      const token = req.cookies.token;

      // Call the API to get fleet profile
      const { data } = await axios.get(`${process.env.APP_URI}/fleet/getMyProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = data?.data?.[0]; // Safely get the first fleet profile

      if (!profile) {
        return res.render('fleet/components/profile', {
          profile: null,
          error: 'No profile data found!',
        });
      }

      res.render('fleet/components/profile', {
        profile,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching fleet profile:', error?.message || error);
      res.render('fleet/components/profile', {
        profile: null,
        error: 'Something went wrong while fetching profile!',
      });
    }
  };



//change password
exports.changePassword = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).render('fleet/components/sign-in', { error: 'Unauthorized access. Please log in.' });
        }
       const response = await axios.post(`${process.env.APP_URI}/fleet/changePassword`, req.body);
        const successMessage = (response.data && response.data.message) ? response.data.message : 'Password changed successfully!';
        res.render('fleet/components/profile', { success: successMessage, error: null });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        const errorMessage = (error.response && error.response.data && error.response.data.message) ?
            error.response.data.message :
            'Failed to change password';

        res.status(400).render('fleet/components/profile', { error: errorMessage, success: null });
    }
};
