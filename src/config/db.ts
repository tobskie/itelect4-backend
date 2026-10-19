import mongoose from "mongoose";

// ===== GT4 PART 1: connect, and log the database it landed in =========
// export async function connectDB() {
//   ...
//   await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
//   console.log("MongoDB connected:", mongoose.connection.name);
// }
//
// NOTE: On a laptop that runs once, at startup. On Vercel connectDB is
//       reached from a request, so it would connect once per request
//       instead of once per instance.
// ===== GT4 PART 2: the same connect, made to happen only once ==========

// The promise, kept. Not the connection -- the promise of one. The first
// caller starts the connect; every caller after it gets this same promise
// back and waits on the connection already being made.
let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  // Fail here, with a sentence, rather than later with a connection
  // timeout that does not mention .env at all.
  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and fill it in.",
    );
  }

  if (connection === null) {
    // Without this, a wrong or unreachable URI hangs for ~30 seconds
    // before failing. Five is enough for a real Atlas connection.
    connection = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then((m) => {
        console.log("MongoDB connected:", m.connection.name);
        return m;
      })
      .catch((err: unknown) => {
        // A failed attempt must not be what gets kept, or every request
        // from now on fails with this same error -- even after Atlas
        // comes back.
        connection = null;
        throw err;
      });
  }

  return connection;
}
