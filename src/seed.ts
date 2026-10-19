import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Tutor } from "./models/Tutor";
import { Session } from "./models/Session";
import { TUTORS, SESSIONS } from "./data/reference";

// npm run seed. Run it once after the database is created, and again
// after anything that empties it. Nothing else in the project writes a
// tutor or a session.
async function seed() {
  await connectDB();

  // upsert: update the row with this _id, or insert it if there is none.
  // Running this a second time leaves three of each, not six. The _id
  // goes in the filter only -- upsert copies it into a new row itself.
  for (const { _id, ...tutor } of TUTORS) {
    await Tutor.updateOne({ _id }, tutor, { upsert: true, runValidators: true });
  }

  for (const { _id, ...session } of SESSIONS) {
    await Session.updateOne({ _id }, session, { upsert: true, runValidators: true });
  }

  console.log(
    `${TUTORS.length} tutors and ${SESSIONS.length} sessions in ${mongoose.connection.name}`,
  );

  // Without this the script never ends: the connection is an open socket,
  // and Node keeps running while one is still open.
  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
