import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return { client: mongoose, db: mongoose.connection.db };
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
      ssl: true,
      tls: true,
      tlsInsecure: true,
      directConnection: true,
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
    return { client: mongoose, db: mongoose.connection.db };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export default connectDB;
