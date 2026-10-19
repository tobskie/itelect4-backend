import { Schema, model } from "mongoose";
import type { TutorDoc } from "../types/index";

// The Session 1 TutoringUser interface again, for the public directory.
// Tutors are the one thing besides sessions that this API serves to
// somebody who is not logged in.
const tutorSchema = new Schema<TutorDoc>({
  // A String _id instead of an ObjectId: the id db.json gave this tutor
  // ("1") stays its id, so /tutors/1 in the frontend still means the
  // same person.
  _id: { type: String, required: true, trim: true },

  name: { type: String, required: [true, "name is required"], trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  role: {
    type: String,
    enum: ["tutor", "tutee", "admin"],
    default: "tutor",
  },
  isActive: { type: Boolean, default: true },
  bio: { type: String, trim: true },
  subjects: { type: [String], default: undefined },
});

// Same rename as User and Booking: the frontend reads .id.
tutorSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Tutor = model<TutorDoc>("Tutor", tutorSchema);
