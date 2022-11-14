import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error(
    `Error: Expected MONGODB_URI environment variable to be URI to MongoDB database, received: ${MONGODB_URI}.`
  );
  process.exit(1);
}

mongoose.connect(
  MONGODB_URI,
  () => {
    console.log(`Connected to MongoDB database at ${MONGODB_URI}`);
  },
  (e) => {
    console.error(e);
  }
);

export default mongoose;
