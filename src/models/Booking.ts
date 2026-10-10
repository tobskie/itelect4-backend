import { Schema, model } from "mongoose";
import { BookingStatus, type BookingDoc } from "../types/index";

// Today at midnight -- a booking for later today is still fine.
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const bookingSchema = new Schema<BookingDoc>({
  // The owner. Holds the _id of a User document; set from the token,
  // never from the request body.
  tuteeId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // RULE: required -- the same rule as Session 8's "Choose a session".
  sessionId: {
    type: String,
    required: [true, "sessionId is required"],
    trim: true,
  },

  // RULE: min/max -- only the four BookingStatus values, 0 to 3.
  status: {
    type: Number,
    min: [BookingStatus.Requested, "status must be between 0 and 3"],
    max: [BookingStatus.Cancelled, "status must be between 0 and 3"],
    default: BookingStatus.Requested,
  },

  requestedAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
  completedAt: { type: Date },

  // Same limits as the Zod schema in the frontend's bookingSchema.ts.
  notes: {
    type: String,
    trim: true,
    minlength: [10, "notes must be at least 10 characters"],
    maxlength: [200, "notes must be under 200 characters"],
  },

  // RULE: match -- the browser checks this with z.email(); this is the
  // check Postman cannot skip.
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "contactEmail must be a valid email address"],
  },

  // Same as the Zod .refine(): not in the past.
  preferredDate: {
    type: Date,
    validate: {
      validator: (value: Date) => value >= startOfToday(),
      message: "preferredDate has already passed",
    },
  },
});

// FROM SESSION 7: the frontend's ApiBooking expects a string id, so _id
// becomes id here and the frontend keeps reading .id.
bookingSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Booking = model<BookingDoc>("Booking", bookingSchema);
