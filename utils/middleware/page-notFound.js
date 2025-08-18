const notfound = (req, res) => res.status(404).json({Msg: 'Page Not Found'})
module.exports = notfound;