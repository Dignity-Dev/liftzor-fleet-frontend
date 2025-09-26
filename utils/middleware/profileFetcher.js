const axios = require("axios");

async function profileFetcher(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.locals.profile = null; // No user logged in
      return next();
    }

    // Fetch profile data
    const { data } = await axios.get(`${process.env.APP_URI}/fleet/getMyProfile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Attach profile to res.locals so it’s available in all views
    res.locals.profile = data?.data?.[0] || null;

    next();
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.locals.profile = null;
    next();
  }
}

module.exports = profileFetcher;
