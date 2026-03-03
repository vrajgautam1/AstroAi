//db.js

import { MongoClient } from 'mongodb';

let dbInstance;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MongoDB connection failed: MONGO_URI is not defined");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    // Verify connection by pinging the db
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connected successfully");

    dbInstance = client.db("astroai");

    try {
      await dbInstance.collection("users").createIndex({ email: 1 }, { unique: true });
      console.log("Users collection index created successfully");
    } catch (indexError) {
      console.error("Failed to create unique index on users collection:", indexError);
      process.exit(1);
    }

    return dbInstance;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

function getUsersCollection() {
  if (!dbInstance) {
    throw new Error("Database not initialized");
  }
  return dbInstance.collection("users");
}
export { connectDB, getUsersCollection };
