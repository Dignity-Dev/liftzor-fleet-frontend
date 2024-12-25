const axios = require('axios');

exports.getAllDrivers = async(req, res) => {
    try {
        const token = req.cookies.token;
        const response = await axios.get(`${process.env.APP_URI}/fleet/drivers`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const drivers = response.data.data;

        if (!drivers || drivers.length === 0) {
            return res.render('fleet/components/driver/driver', { drivers: [], error: 'No drivers available.' });
        }

        // Sort the drivers by 'registerDate' (either ascending or descending)
        const sortedDrivers = drivers.sort((a, b) => {
            // Assuming registerDate is in ISO format. Adjust if it's a different format.
            return new Date(b.registerDate) - new Date(a.registerDate); // descending order
        });

        res.render('fleet/components/driver/driver', { drivers: sortedDrivers, error: null });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return res.redirect('/sign-in');
        }

        res.render('fleet/components/driver/driver', { drivers: [], error: 'Error fetching drivers.' });
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

// exports.deleteDriver = async(req, res) => {
//     try {
//         // Extract driver ID from the route parameters
//         const driverId = req.params.id;

//         // Extract token from cookies
//         const token = req.cookies.token;
//         if (!token) {
//             console.error('Authorization token is missing.');
//             return res.send(`
//                 <script>
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Unauthorized',
//                         text: 'Your session has expired. Please sign in again.',
//                         confirmButtonText: 'OK'
//                     }).then(() => {
//                         window.location.href = '/sign-in';
//                     });
//                 </script>
//             `);
//         }

//         // Send DELETE request to the external API to delete the driver
//         await axios.delete(`${process.env.APP_URI}/fleet/deleteDriver/${driverId}`, {
//             headers: {
//                 Authorization: `Bearer ${token}`, // Pass token in headers
//             },
//         });

//         console.log(`Driver with ID ${driverId} deleted successfully.`);
//         // Show success alert and redirect to the drivers list page
//         return res.send(`
//             <script>
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'Driver Deleted',
//                     text: 'The driver has been successfully deleted.',
//                     confirmButtonText: 'OK'
//                 }).then(() => {
//                     window.location.href = '/manage-driver';
//                 });
//             </script>
//         `);

//     } catch (error) {
//         console.error('Error deleting driver:', error.response ? error.response.data : error.message);

//         // Handle token-related errors
//         if (error.response && error.response.status === 401) {
//             console.log('Invalid or expired token, redirecting to sign-in page.');
//             return res.send(`
//                 <script>
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Session Expired',
//                         text: 'Your session has expired. Please sign in again.',
//                         confirmButtonText: 'OK'
//                     }).then(() => {
//                         window.location.href = '/sign-in';
//                     });
//                 </script>
//             `);
//         }

//         // Handle other API errors
//         const errorMessage = error.response && error.response.data && error.response.data.message ?
//             error.response.data.message :
//             'An error occurred while deleting the driver.';

//         return res.send(`
//             <script>
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Error',
//                     text: '${errorMessage}',
//                     confirmButtonText: 'OK'
//                 }).then(() => {
//                     window.location.href = '/manage-driver';
//                 });
//             </script>
//         `);
//     }
// };

exports.deleteOneDriver = async(req, res) => {
    try {
        // Extract driver ID from the route parameters
        const driverId = req.params.id; // Ensure this matches the frontend
        // Extract token from cookies
        const token = req.cookies.token;
        console.log('token: ' + token);
        console.log("Deleting driver with ID:", driverId);

        // Send DELETE request to the external API to delete the driver
        const response = await axios.delete(`${process.env.APP_URI}/fleet/deleteDriver/${driverId}`, {
            headers: {
                Authorization: `Bearer ${token}`, // Pass token in headers
            },
        });

        console.log(`Driver with ID ${driverId} deleted successfully.`);

        // Show success alert and redirect to the drivers list page
        return res.send(`
            <script>
                Swal.fire({
                    icon: 'success',
                    title: 'Driver Deleted',
                    text: 'The driver has been successfully deleted.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = '/manage-driver';
                });
            </script>
        `);

    } catch (error) {
        console.error('Error deleting driver:', error.response ? error.response.data : error.message);

        // Handle token-related errors
        if (error.response && error.response.status === 401) {
            console.log('Invalid or expired token, redirecting to sign-in page.');
            return res.send(`
                <script>
                    Swal.fire({
                        icon: 'error',
                        title: 'Session Expired',
                        text: 'Your session has expired. Please sign in again.',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        window.location.href = '/sign-in';
                    });
                </script>
            `);
        }

        // Handle other API errors
        const errorMessage = error.response && error.response.data && error.response.data.message ?
            error.response.data.message :
            'An error occurred while deleting the driver.';

        return res.send(`
            <script>
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: '${errorMessage}',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = '/manage-driver';
                });
            </script>
        `);
    }
};
exports.getUpdateDriverForm = async(req, res) => {
    try {
        // Render the update driver form
        res.render('fleet/driver/update-driver', { driver: {} });
    } catch (error) {
        // Display error using SweetAlert
        return res.send(`
            <script>
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while rendering the update driver form.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = '/manage-driver';
                });
            </script>
        `);
    }
};

exports.updateDriver = async(req, res) => {
    try {
        // Make a PATCH request to update driver details
        await axios.patch(`${process.env.APP_URI}/fleet/drivers/${req.params.id}`, req.body, {
            headers: {
                Authorization: `Bearer ${req.cookies.token}`
            }
        });

        // Show success alert and redirect to the manage-driver page
        return res.send(`
            <script>
                Swal.fire({
                    icon: 'success',
                    title: 'Driver Updated',
                    text: 'Driver details updated successfully.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = '/manage-driver';
                });
            </script>
        `);

    } catch (error) {
        console.error('Error updating driver:', error.response ? error.response.data : error.message);

        // Handle API errors
        const errorMessage = error.response && error.response.data && error.response.data.message ?
            error.response.data.message :
            'An error occurred while updating the driver.';

        // Show error alert with message
        return res.send(`
            <script>
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: '${errorMessage}',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = '/manage-driver';
                });
            </script>
        `);
    }
};
