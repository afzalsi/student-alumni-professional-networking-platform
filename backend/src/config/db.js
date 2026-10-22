const mongoose = require('mongoose');
const config = require('./env');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Connection Notice]: Could not connect to external MongoDB (${error.message}).`);
    console.log(`[MongoDB Fallback]: Starting embedded MongoDB instance...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'alumni_portal',
        }
      });

      const uri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[Embedded MongoDB Connected]: ${uri}`);

      // Auto-seed if database is brand new
      const User = require('../models/User');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Auto-Seed]: Initializing demo database with seed accounts and jobs...');
        const seed = require('../scripts/seed');
        if (typeof seed === 'function') {
          await seed();
        }
      }
      return conn;
    } catch (fallbackError) {
      console.error(`[Embedded MongoDB Error]: ${fallbackError.message}`);
      if (config.nodeEnv === 'production') {
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
