import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    console.log("Creating new MongoDB client connection...");
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  console.log("Attempting to connect to MongoDB...");
  try {
    const client = await clientPromise;
    console.log("MongoDB client connected successfully");

    const db = client.db(process.env.MONGODB_DB);
    console.log("Using database:", process.env.MONGODB_DB);

    return { client, db };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    console.error("Connection details:", {
      uri: uri.replace(/:[^:]*@/, ":****@"), // Hide password
      dbName: process.env.MONGODB_DB,
    });
    throw error;
  }
}
