const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

// Import middleware
const setupMiddleware = require('./utils/middleware/middleware');
const profileFetcher = require('./utils/middleware/profileFetcher');

// Set up middleware
setupMiddleware(app);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
// Static folder for assets
app.use(express.static(path.join(__dirname, 'assets')));

// profileFetcher
app.use(profileFetcher);

// Import Routes
const authRoutes = require('./admin/routes/auth/auth');
const dashboardRoutes = require('./admin/routes/dashboard');
const driverRoutes = require('./admin/routes/driver/driver');
const customerRoutes = require('./admin/routes/customer/customer');
const orderRoutes = require('./admin/routes/order/order');
const vehicleRoutes = require('./admin/routes/vehicle/vehicle');
const paymentRoutes = require('./admin/routes/payment/payment');
// const fleetRoutes = require('./admin/routes/fleet/fleet');
const fleetProfileRoutes = require('./admin/routes/fleetprofileRoute');


// Use Routes
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/', driverRoutes);
app.use('/', customerRoutes);
app.use('/', orderRoutes);
app.use('/', vehicleRoutes);
app.use('/', paymentRoutes);
// app.use('/', fleetRoutes);
app.use('/', fleetProfileRoutes);
// end of admin route


// Error handling middleware
const errorHandler = require('./utils/middleware/errorHandler');
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// app.use((req, res, next) => {
//     res.locals.user = req.session.user || null;
//     next();
// });
