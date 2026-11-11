import mongoose from 'mongoose';

export interface DatabaseStatus {
  connected: boolean;
  uri: string;
  databaseName: string;
  mode: 'mongodb' | 'memory_fallback';
  lastError?: string;
}

const status: DatabaseStatus = {
  connected: false,
  uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/max_ai',
  databaseName: 'max_ai',
  mode: 'memory_fallback',
};

export async function connectDB(): Promise<DatabaseStatus> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('[MAX AI DB] No MONGODB_URI set in environment. Running with resilient local persistent memory store.');
    status.connected = false;
    status.mode = 'memory_fallback';
    return status;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    status.connected = true;
    status.mode = 'mongodb';
    status.uri = mongoUri.replace(/\/\/.*@/, '//***:***@'); // hide credentials in logs
    status.databaseName = mongoose.connection.name || 'max_ai';
    console.log(`[MAX AI DB] Connected to MongoDB database: ${status.databaseName}`);
  } catch (err: any) {
    status.connected = false;
    status.mode = 'memory_fallback';
    status.lastError = err.message || String(err);
    console.warn(`[MAX AI DB] Could not connect to MongoDB (${err.message}). Seamlessly operating with resilient memory store.`);
  }

  return status;
}

export function getDatabaseStatus(): DatabaseStatus {
  return {
    ...status,
    connected: mongoose.connection.readyState === 1,
    mode: mongoose.connection.readyState === 1 ? 'mongodb' : 'memory_fallback',
  };
}
