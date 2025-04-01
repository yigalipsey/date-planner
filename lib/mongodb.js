import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return { client: mongoose.connection, db: mongoose.connection.db };
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: "majority",
    });

    isConnected = true;
    console.log("MongoDB connected successfully");

    return { client: mongoose.connection, db: mongoose.connection.db };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export { connectToDatabase };
