import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || '';

const mongoOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
};

// Global cache to prevent connection exhaustion in serverless & development
const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

if (uri) {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, mongoOptions);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
}

let indexesTriggered = false;

export async function getDb(dbName = 'bunny') {
  if (!uri || !clientPromise) {
    return null;
  }
  try {
    const connectedClient = await clientPromise;
    const db = connectedClient.db(dbName);
    if (!indexesTriggered) {
      indexesTriggered = true;
      import('./ensureIndexes')
        .then((m) => m.ensureIndexesOnce())
        .catch((err) => console.error('Background index initialization error:', err));
    }
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return null;
  }
}
