import "dotenv/config";
import { app } from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 4000;

// ===== GT4 PART 1: connect first, then listen ==========================
// connectDB()
//   .then(() => {
//     app.listen(PORT, () =>
//       console.log(`API on http://localhost:${PORT}`),
//     );
//   })
//   .catch((err: unknown) => {
//     console.error("Could not start:", err);
//     process.exit(1);
//   });
//
// NOTE: The app waits for the connection itself now -- the middleware in
//       app.ts -- so listening no longer has to be held back.
// ===== GT4 PART 2: start connecting, and listen either way =============

// Started immediately, so a wrong MONGODB_URI shows up in this terminal
// within five seconds instead of on the first request. connectDB hands
// out one connection however many times it is called, so this is the
// same one the middleware waits for.
connectDB().catch((err: unknown) => {
  // Logged, not exited: the failed request will say what happened.
  console.error("Could not connect to MongoDB:", err);
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
