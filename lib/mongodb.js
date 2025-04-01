import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

if (!MONGODB_DB) {
  throw new Error(
    "Please define the MONGODB_DB environment variable inside .env.local"
  );
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  console.log("Starting database connection...");

  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    console.log("Using cached database connection");
    return { client: cachedClient, db: cachedDb };
  }

  console.log("Creating new database connection...");

  // Set connection options
  const opts = {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 25000,
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    tlsCAFile: undefined,
    minVersion: "TLS1_2",
    maxVersion: "TLS1_3",
  };

  try {
    // Connect to cluster
    const startTime = Date.now();
    const client = await MongoClient.connect(MONGODB_URI, opts);
    const db = client.db(MONGODB_DB);
    const connectionTime = Date.now() - startTime;

    console.log(`MongoDB connected successfully in ${connectionTime}ms`);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("MongoDB connection error:", {
      error: error.message,
      code: error.code,
      name: error.name,
    });
    throw new Error(`Failed to connect to database: ${error.message}`);
  }
}
