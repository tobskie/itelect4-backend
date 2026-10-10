import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserDoc } from "../types/index";

// The Session 1 TutoringUser interface, written a second time as a schema.
const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["tutor", "tutee", "admin"],
      default: "tutee",
    },
    isActive: { type: Boolean, default: true },
    bio: { type: String, trim: true },
    subjects: { type: [String], default: undefined },

    // Not in the frontend's interface. select: false keeps it out of
    // every query unless asked for with .select("+password").
    password: { type: String, required: true, minlength: 8, select: false },
  },
  { timestamps: true },
);

// Runs on every .save(): the plain password is never what gets written.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// The frontend reads .id, so rename _id here rather than change it.
userSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const User = model<UserDoc>("User", userSchema);
