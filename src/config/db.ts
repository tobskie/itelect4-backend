import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // Fail here, with a sentence, rather than later with a connection
  // timeout that does not mention .env at all.
  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and fill it in.",
    );
  }

  // Without this, a wrong or unreachable URI hangs for ~30 seconds
  // before failing. Five is enough for a real Atlas connection.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log("MongoDB connected:", mongoose.connection.name);
}
