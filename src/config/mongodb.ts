import mongoose, { Mongoose } from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };

global.mongooseCache = cached;

export const connectDB = async (url: string): Promise<Mongoose> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(url, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log('[database]: MongoDB connected');
        return mongooseInstance;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
};
