const mongoose = require('mongoose');
const env = require('./env');

async function connectDb() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('[DB] Connected to MongoDB');
  } catch (error) {
    console.error('[DB] Connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDb;
