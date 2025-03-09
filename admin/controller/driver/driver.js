const axios = require('axios');

exports.getAllDrivers = async(req, res) => {
    try {
        const token = req.cookies.token;

        // Allow axios to handle specific status codes (e.g., 404) as a valid response
        const response = await axios.get(`${process.env.APP_URI}/fleet/drivers`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            validateStatus: (status) => {
                // Accept status codes 200 and 404 as valid responses
                return status === 200 || status === 404;
            }
        });

        if (response.status === 404 && Array.isArray(response.data.data) && response.data.data.length === 0) {
            // Handle empty data case
            return res.render('fleet/components/driver/driver', {
                drivers: [],
                error: 'No drivers available.'
            });
        }

        const drivers = response.data.data;

        if (!drivers || drivers.length === 0) {
            return res.render('fleet/components/driver/driver', {
                drivers: [],
                error: 'No drivers available.'
            });
        }

        // Sort the drivers by 'registerDate' (assuming ISO format)
        const sortedDrivers = drivers.sort((a, b) => {
            return new Date(b.registerDate) - new Date(a.registerDate); // descending order
        });

        res.render('fleet/components/driver/driver', { drivers: sortedDrivers, error: null });
    } catch (error) {
        // Handle unauthorized error
        if (error.response && error.response.status === 401) {
            return res.redirect('/sign-in');
        }

        // Handle other errors
        const errorMessage = error.response && error.response.data && error.response.data.message ?
            error.response.data.message :
            'An unexpected error occurred while fetching drivers.';
        res.render('fleet/components/driver/driver', {
            drivers: [],
            error: errorMessage
        });
    }
};



exports.getNewDriverForm = async(req, res) => {
    try {
        // Extract token from cookies
        const token = req.cookies.token;
        // Make a request to register the driver
        const response = await axios.post(`${process.env.APP_URI}/fleet/create-driver`, req.body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // console.log("API Response:", response.data);

        // Success message from the API response
        const successMessage = response.data && response.data.message ?
            response.data.message :
            'Driver successfully registered';

        // Pass success message to the frontend
        return res.render('fleet/components/driver/new-driver', {
            success: successMessage,
        });

    } catch (error) {
        console.error("Error details:", error.response ? error.response.data : error.message);

        // Error message from the API response
        const errorMessage = error.response && error.response.data && error.response.data.message ?
            error.response.data.message :
            'Driver registration failed';

        // Pass error message to the frontend
        return res.render('fleet/components/driver/new-driver', {
            error: errorMessage,
        });
    }
};


exports.renderNewDriverForm = (req, res) => {
    const token = req.cookies.token;
    // console.log(token);
    res.render('fleet/components/driver/new-driver', { error: null });
};


exports.getDriverById = async(req, res) => {
    let driverId; // Declare driverId outside the try block so it's accessible everywhere

    try {
        driverId = req.params.id; // Get driver ID from the route parameters
        const token = req.cookies.token; // Extract token from cookies

        // console.log('Fetching driver with ID:', driverId); // Debug log for driver ID

        // Fetch driver data from the external API using query parameters
        const response = await axios.get(`${process.env.APP_URI}/fleet/getOneDriver/${driverId}`, {
            headers: {
                Authorization: `Bearer ${token}`, // Pass token in the headers
            },
        });

        const driver = response.data.data; // Access the driver data

        if (!driver || driver.length === 0) {
            // console.log(`Driver with ID: ${driverId} not found.`);
            return res.status(404).render('fleet/components/driver/view-driver', { driver: null, error: 'Driver not found.' });
        }

        // Render the driver details page with the retrieved data
        // console.log('Driver fetched successfully:', driver);
        res.render('fleet/components/driver/view-driver', { driver, error: null });

    } catch (error) {
        console.error('Error fetching driver:', error.response ? error.response.data : error.message);

        if (error.response && error.response.status === 404) {
            // console.log(`Driver with ID: ${driverId} not found.`); // Driver ID will now be accessible
            return res.status(404).render('fleet/components/driver/view-driver', { driver: null, error: 'Driver not found.' });
        }

        // Handle token-related errors, such as expiration or invalid token
        if (error.response && error.response.status === 401) {
            // console.log('Invalid or expired token, redirecting to sign-in page.');
            return res.redirect('/sign-in');
        }

        // Handle other API errors
        res.status(500).render('fleet/components/driver/view-driver', { driver: null, error: 'Error fetching driver details.' });
    }
};


exports.getUpdateDriverForm = async(req, res) => {
    let driverId; // Declare driverId outside the try block so it's accessible everywhere

    try {
        driverId = req.params.id; // Get driver ID from the route parameters
        const token = req.cookies.token; // Extract token from cookies
        // Fetch driver data from the external API using query parameters
        const response = await axios.get(`${process.env.APP_URI}/fleet/getOneDriver/${driverId}`, {
            headers: {
                Authorization: `Bearer ${token}`, // Pass token in the headers
            },
        });

        const driver = response.data.data; // Access the driver data

        if (!driver || driver.length === 0) {
            return res.status(404).render('fleet/components/driver/update-driver', { driver: null, error: 'Driver not found.' });
        }
        res.render('fleet/components/driver/update-driver', { driver, error: null });

    } catch (error) {
        console.error('Error fetching driver:', error.response ? error.response.data : error.message);

        if (error.response && error.response.status === 404) {
            return res.status(404).render('fleet/components/driver/update-driver', { driver: null, error: 'Driver not found.' });
        }

        if (error.response && error.response.status === 401) {
            return res.redirect('/driver');
        }

        // Handle other API errors
        res.status(500).render('fleet/components/driver/update-driver', { driver: null, error: 'Error fetching driver details.' });
    }
};

exports.updateDriver = async(req, res) => {
    try {
        // Make a PATCH request to update driver details
        const driverId = req.params.id;
        const token = req.cookies.token;

        const response = await axios.patch(`${process.env.APP_URI}/fleet/drivers/${driverId}`, req.body, {
            headers: {
                Authorization: `Bearer ${req.cookies.token}`
            }
        });

        console.log(`Driver with ID ${driverId} updated successfully.`);

        // Redirect to manage-driver page with a success message
        return res.redirect('/manage-driver?status=success&message=Driver successfully updated');

    } catch (error) {
        console.error('Error updating driver:', error.response ? error.response.data : error.message);

        const errorMessage = error.response && error.response.data && error.response.data.message ?
            error.response.data.message :
            'An error occurred while updating the driver.';

        return res.redirect(`/manage-driver?status=error&message=${encodeURIComponent(errorMessage)}`);
    }
};

exports.deleteDriver = async(req, res) => {
    try {
        const driverId = req.params.id;
        const token = req.cookies.token;

        const response = await axios.delete(`${process.env.APP_URI}/fleet/deleteDriver/${driverId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Driver with ID ${driverId} deleted successfully.`);

        // Redirect to manage-driver page with a success message
        return res.redirect('/manage-driver?status=success&message=Driver successfully deleted');

    } catch (error) {
        console.error('Error deleting driver:', error.response ? error.response.data : error.message);

        const errorMessage = error.response && error.response.data && error.response.data.message ?
            error.response.data.message :
            'An error occurred while deleting the driver.';

        return res.redirect(`/manage-driver?status=error&message=${encodeURIComponent(errorMessage)}`);
    }
};
