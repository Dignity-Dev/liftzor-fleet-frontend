const jwt = require('jsonwebtoken');

exports.verifyUser = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET); // Ensure you use the correct secret
        res.locals.user = decoded.user; // Assuming `user` object is in the token payload
    } catch (error) {
        res.locals.user = null;
    }

    next();
};
