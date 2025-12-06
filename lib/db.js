import mongoose from 'mongoose';

const uri = "mongodb+srv://azizahmedreal_db_user:MWOHrowJn2IdWHff@hhc.zpdt8hp.mongodb.net/?retryWrites=true&w=majority&appName=HHC";

// Use a cached connection to avoid creating multiple connections in serverless/dev
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      // useUnifiedTopology and useNewUrlParser are default in mongoose v6+
    }).then((m) => {
      return m.connection;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
