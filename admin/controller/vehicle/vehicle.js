const axios = require('axios');
const FormData = require('form-data');
// const fs = require('fs');


exports.getAllVehicle = async(req, res) => {
    try {
        const token = req.cookies.token;
        const response = await axios.get(`${process.env.APP_URI}/admin/getallvehicles`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // console.log(token);
        // Check if the API call was successful (status code 200)
        if (response.status === 200) {
            const vehicle = response.data.data;

            if (!vehicle || vehicle.length === 0) {
                return res.render('fleet/components/vehicle/vehicle', { vehicle: [], error: 'No vehicle available.' });
            }
            return res.render('fleet/components/vehicle/vehicle', { vehicle, error: null });
        } else {
            // If the status code isn't 200, consider it an error
            return res.render('fleet/components/vehicle/vehicle', { vehicle: [], error: 'Error fetching vehicle.' });
        }

    } catch (error) {
        if (error.response) {
            // Handle specific errors based on status code
            if (error.response.status === 401) {
                return res.redirect('/sign-in');
            }
            if (error.response.status === 404) {
                return res.render('fleet/components/vehicle/vehicle', { vehicle: [], error: 'No vehicle available.' });
            }
        }

        // Default error handling for other issues
        res.render('fleet/components/vehicle/vehicle', { vehicle: [], error: 'Error fetching vehicle.' });
    }
};

exports.getvehicleById = async(req, res) => {
    let vehicleId; // Declare vehicleId outside the try block so it's accessible everywhere

    try {
        vehicleId = req.params.id; // Get vehicle ID from the route parameters
        const token = req.cookies.token; // Extract token from cookies

        // console.log('Fetching vehicle with ID:', vehicleId); // Debug log for vehicle ID

        // Fetch vehicle data from the external API using query parameters
        const response = await axios.get(`${process.env.APP_URI}/fleet/get-one-vehicle/${vehicleId}`, {
            headers: {
                Authorization: `Bearer ${token}`, // Pass token in the headers
            },
            params: {
                userID: vehicleId, // Send userID as a query parameter
            }
        });

        const vehicle = response.data.data; // Access the vehicle data

        if (!vehicle || vehicle.length === 0) {
            // console.log(`vehicle with ID: ${vehicleId} not found.`);
            return res.status(404).render('fleet/components/vehicle/view-vehicle', { vehicle: null, error: 'vehicle not found.' });
        }

        // Render the vehicle details page with the retrieved data
        // console.log('vehicle fetched successfully:', vehicle);
        res.render('fleet/components/vehicle/view-vehicle', { vehicle, error: null });

    } catch (error) {
        console.error('Error fetching vehicle:', error.response ? error.response.data : error.message);

        if (error.response && error.response.status === 404) {
            // console.log(`vehicle with ID: ${vehicleId} not found.`); // vehicle ID will now be accessible
            return res.status(404).render('fleet/components/vehicle/view-vehicle', { vehicle: null, error: 'vehicle not found.' });
        }

        // Handle token-related errors, such as expiration or invalid token
        if (error.response && error.response.status === 401) {
            // console.log('Invalid or expired token, redirecting to sign-in page.');
            return res.redirect('/sign-in');
        }

        // Handle other API errors
        res.status(500).render('fleet/components/vehicle/view-vehicle', { vehicle: null, error: 'Error fetching vehicle details.' });
    }
};

exports.getNewVehicleForm = async(req, res) => {
    try {
        const token = req.cookies.token;

        // console.log('Request Body:', req.body);
        // console.log('Uploaded File:', req.file);

        if (!req.files) {
            return res.status(400).json({ success: false, message: 'File is required' });
        }

        // Prepare FormData
        const formData = new FormData();
        Object.keys(req.body).forEach((key) => {
            formData.append(key, req.body[key]);
        });

        // Attach file (using the correct field name expected by the backend)
       if (req.files.vehiclePhoto && req.files.vehiclePhoto[0]) {
        const photo = req.files.vehiclePhoto[0];
        formData.append('vehiclePhoto', photo.buffer, {
            filename: photo.originalname,
            contentType: photo.mimetype,
        });
        }

            // Append vehicle documents (can be multiple)
            if (req.files.vehicleDocuments) {
            req.files.vehicleDocuments.forEach((doc) => {
                formData.append('vehicleDocuments', doc.buffer, {
                filename: doc.originalname,
                contentType: doc.mimetype,
                });
            });
            }

        // formData.append('vehicleDocuments', req.file.buffer, {
        //     filename: req.file.originalname,
        //     contentType: req.file.mimetype,
        // });

        // console.log('Sending FormData to API...');

        // Send request to backend
        const response = await axios.post(`${process.env.APP_URI}/fleet/create-vehicle`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...formData.getHeaders(),
            },
        });


        const successMessage = response.data && response.data.message ?
            response.data.message :
            'Vehicle successfully registered';
        return res.render('fleet/components/vehicle/new-vehicle', {
            success: successMessage,
        });

    } catch (error) {
        console.error("Error details:", error.response ? error.response.data : error.message);
        const errorMessage = error.response && error.response.data && error.response.data.message ?
            error.response.data.message :
            'Vehicle registration failed';
        return res.render('fleet/components/vehicle/new-vehicle', {
            error: errorMessage,
        });
    }
};

exports.renderNewVehicleForm = (req, res) => {
    const token = req.cookies.token;
    // console.log(token);
    res.render('fleet/components/vehicle/new-vehicle', { error: null });
};

exports.assignVehicleToDriver = async(req, res) => {
    try {
        const { vehicleID, userID } = req.body;
        if (!vehicleID || !userID) {
            return res.status(400).json({ error: 'Both Vehicle ID and User ID are required.' });
        }

        // Construct the API endpoint
        const apiUrl = `${process.env.APP_URI}/admin/pairvehicle?vehicleID=${vehicleID}&userID=${userID}`;

        // Assign driver to vehicle using a PUT request
        await axios.put(apiUrl, {});

        // Redirect to the manage vehicles page after successful assignment
        return res.redirect('/manage-vehicle'); // Adjust this path as necessary

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'Vehicle or driver not found.' });
        }

        return res.status(500).json({ error: 'Failed to assign driver to the vehicle.' });
    }
};


exports.unpairVehicleToDriver = async(req, res) => {
    try {
        const {userID } = req.body;
        if (!userID) {
            return res.status(400).json({ error: 'Both Vehicle ID and User ID are required.' });
        }

        const apiUrl = `${process.env.APP_URI}/fleet/unpair-vehicle`;
        const token = req.cookies.token;
        await axios.put(apiUrl, {userID}, {
             headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        return res.redirect('/manage-vehicle');

    } catch (error) {
        if(error.status == 400) {
            // alert of Vechicle is not pair with driver before
            return res.redirect('/manage-vehicle');
        }
        console.error('Error unpairing vehicle:', error.message);
        // return res.status(500).json({ error: 'Failed to unpair vehicle. Please try again later.' });
        return res.redirect('/manage-vehicle');
    }
};

exports.deleteVehicle = async(req, res) => {
    let vehicleId
    try {
        vehicleId = req.params.id;
        const token = req.cookies.token;

        const response = await axios.delete(`${process.env.APP_URI}/fleet/deleteVehicle/${vehicleId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Vehicle with ID ${vehicleId} deleted successfully.`);

        // Redirect to manage-vehicle page with a success message
        return res.redirect('/manage-vehicle?status=success&message=Vehicle successfully deleted');

    } catch (error) {
        console.error('Error deleting vehicle:', error.response ? error.response.data : error.message);

        const errorMessage = error.response && error.response.data && error.response.data.message ?
            error.response.data.message :
            'An error occurred while deleting the vehicle.';

        return res.redirect(`/manage-vehicle?status=error&message=${encodeURIComponent(errorMessage)}`);
    }
};

exports.editVehicle = async(req, res) => {
     let vehicleId;

    try {
        vehicleId = req.params.id;
        const token = req.cookies.token;

        const response = await axios.get(`${process.env.APP_URI}/fleet/get-one-vehicle/${vehicleId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        const vehicle = response.data.data;

        if (!vehicle || vehicle.length === 0) {
            return res.status(404).render('fleet/components/vehicle/update-vehicle', { vehicle: null, error: 'vehicle not found.' });
        }
        res.render('fleet/components/vehicle/update-vehicle', { vehicle, error: null });

    } catch (error) {
        console.error('Error fetching vehicle:', error.response ? error.response.data : error.message);

        if (error.response && error.response.status === 404) {
            return res.status(404).render('fleet/components/vehicle/update-vehicle', { vehicle: null, error: 'vehicle not found.' });
        }

        if (error.response && error.response.status === 401) {
            return res.redirect('/sign-in');
        }
        res.status(500).render('fleet/components/vehicle/update-vehicle', { vehicle: null, error: 'Error fetching vehicle details.' });
    }
}

exports.updateVehicle = async(req, res) => {
    try {

        const token = req.cookies.token

        const { vehicleName, vehicleColor, vehicleType, vehicleModel, vehicleRegNo, vehicleID } = req.body

        const formData = { vehicleName, vehicleColor, vehicleID }
        const response = await axios.put(`${process.env.APP_URI}/fleet/edit-vehicle/${vehicleID}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return res.redirect(`edit-vehicle/${vehicleID}`)
        // res.send(response.data)

    } catch (error) {
         console.error("Error details:", error.response ? error.response.data : error.message);
            return res.redirect(`edit-vehicle/${vehicleID}`)
    }
}

// Render edit vehicle form with current vehicle details
// exports.getUpdatevehicleForm = async(req, res) => {
//     try {
//         const vehicleId = req.params.id; // Get vehicle ID from the route parameters
//         const token = req.cookies.token; // Extract token from cookies

//         // Fetch current vehicle data from the external API
//         const response = await axios.get(`${process.env.APP_URI}/admin/vehicle/${vehicleId}`, {
//             headers: {
//                 Authorization: `Bearer ${token}`, // Pass token in headers
//             }
//         });

//         const vehicle = response.data.data; // Access the vehicle data

//         if (!vehicle) {
//             return res.status(404).render('fleet/vehicle/update-vehicle', { vehicle: null, error: 'vehicle not found.' });
//         }

//         // Render the edit vehicle form with the current vehicle details
//         res.render('fleet/vehicle/update-vehicle', { vehicle, error: null });

//     } catch (error) {
//         console.error('Error fetching vehicle for editing:', error.response ? error.response.data : error.message);

//         if (error.response && error.response.status === 404) {
//             return res.status(404).render('fleet/vehicle/update-vehicle', { vehicle: null, error: 'vehicle not found.' });
//         }

//         // Handle other errors
//         res.status(500).render('fleet/vehicle/update-vehicle', { vehicle: null, error: 'Error fetching vehicle details.' });
//     }
// };

// Update vehicle details
// exports.updatevehicle = async(req, res) => {
//     try {
//         const vehicleId = req.params.id; // Get vehicle ID from the route parameters
//         const token = req.cookies.token; // Extract token from cookies

//         // Update vehicle data through the external API
//         const response = await axios.patch(`${process.env.APP_URI}/admin/vehicle/${vehicleId}`, req.body, {
//             headers: {
//                 Authorization: `Bearer ${token}`, // Pass token in headers
//             }
//         });

//         // Assuming the update was successful and you want to redirect back to vehicle details
//         res.redirect(`/vehicle/${vehicleId}`); // Redirect to the vehicle's detail page after successful update

//     } catch (error) {
//         console.error('Error updating vehicle:', error.response ? error.response.data : error.message);

//         // Handle token-related errors
//         if (error.response && error.response.status === 401) {
//             console.log('Invalid or expired token, redirecting to sign-in page.');
//             return res.redirect('/sign-in');
//         }

//         // Handle other API errors
//         res.status(500).render('fleet/vehicle/update-vehicle', { vehicle: req.body, error: 'Error updating vehicle details.' });
//     }
// };

// Delete vehicle by ID
// exports.deletevehicle = async(req, res) => {
//     try {
//         const vehicleId = req.params.id; // Get vehicle ID from the route parameters
//         const token = req.cookies.token; // Extract token from cookies

//         // Send DELETE request to the external API to delete the vehicle
//         await axios.delete(`${process.env.APP_URI}/admin/vehicle/${vehicleId}`, {
//             headers: {
//                 Authorization: `Bearer ${token}`, // Pass token in headers
//             }
//         });

//         // Redirect to the vehicle list page after successful deletion
//         res.redirect('/manage-vehicle'); // Redirect to the list of vehicle after deletion

//     } catch (error) {
//         console.error('Error deleting vehicle:', error.response ? error.response.data : error.message);

//         // Handle token-related errors
//         if (error.response && error.response.status === 401) {
//             console.log('Invalid or expired token, redirecting to sign-in page.');
//             return res.redirect('/sign-in');
//         }

//         // Handle other API errors
//         res.status(500).render('fleet/vehicle/vehicle', { error: 'Error deleting vehicle.' });
//     }
// };
