import { connect } from 'mongoose';

export const connectDB = async (uri: string) => {
  try {
    await connect(uri);
    console.log('\x1b[32m[database] Connection is set up with MongoDB\x1b[0m');
  } catch (error) {
    console.error({ error });
  }
};
