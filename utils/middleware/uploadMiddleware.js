const multer = require('multer');

// Use memory storage to avoid saving files locally
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Export correctly
module.exports = upload;
