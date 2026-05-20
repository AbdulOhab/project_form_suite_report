require('dotenv').config();

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/instancereport';

module.exports = dbUri;




// MONGODB_URI=mongodb://<username>:<password>@localhost:27017/<database>?authSource=admin

// MONGODB_URI=mongodb://<username>:<password>@localhost:27017/<database>?authSource=admin
// MONGODB_URI=mongodb://<username>:<password>@localhost:27017/<database>?authSource=admin
