import { Schema, model } from "mongoose";
import type { SessionDoc } from "../types/index";

// The Session 1 Session interface, written a second time as a schema.
// This is what the booking form's dropdown reads.
const sessionSchema = new Schema<SessionDoc>({
  // "101", not an ObjectId -- every booking's sessionId already holds
  // one of these, so the join keeps working without a migration.
  _id: { type: String, required: true, trim: true },

  // The _id of a Tutor document. Nothing here belongs to a logged-in
  // user, which is why these routes need no token.
  tutorId: {
    type: String,
    ref: "Tutor",
    required: [true, "tutorId is required"],
  },

  subject: { type: String, required: [true, "subject is required"], trim: true },
  description: { type: String, required: true, trim: true },
  scheduledAt: { type: Date, required: true },

  // An interface can say "a number". Only a schema can say "at least 15
  // minutes" or "at least one slot".
  durationMinutes: { type: Number, required: true, min: 15, max: 480 },
  maxSlots: { type: Number, required: true, min: 1 },
});

sessionSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Session = model<SessionDoc>("Session", sessionSchema);
