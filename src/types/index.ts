import type { Types } from "mongoose";

// FROM SESSION 1: copied from itelect4-project's src/types/index.ts. The
// schemas in src/models/ are these interfaces again, written a second
// time in a form the database can enforce.

// Requested -> Confirmed -> Completed, or Cancelled at any point
export enum BookingStatus {
  Requested, // 0  tutee has sent the request
  Confirmed, // 1  tutor accepted
  Completed, // 2  session was held
  Cancelled, // 3  either party cancelled
}

export interface TutoringUser {
  id: number;
  name: string;
  email: string;
  role: "tutor" | "tutee" | "admin";
  isActive: boolean;
  bio?: string;
  subjects?: string[];
}

export interface Session {
  id: number;
  tutorId: number;
  subject: string;
  description: string;
  scheduledAt: Date;
  durationMinutes: number;
  maxSlots: number;
}

export interface Booking {
  id: number;
  sessionId: number;
  tuteeId: number;
  status: BookingStatus;
  requestedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  notes?: string;
  contactEmail?: string;
  preferredDate?: Date;
}

// ---------------------------------------------------------------------
// What the database actually stores.
//
// Session 1 wrote `id: number` because the mock array numbered its own
// rows. MongoDB makes its own 24-character ids, so these types are
// DERIVED with Omit -- the interfaces above stay the single source of
// truth.
// ---------------------------------------------------------------------

export type UserDoc = Omit<TutoringUser, "id"> & {
  password: string;
};

// sessionId stays a string: sessions are not stored in MongoDB yet, so
// it holds the frontend's session id ("101") rather than an ObjectId.
// tuteeId is the _id of a User document.
export type BookingDoc = Omit<Booking, "id" | "sessionId" | "tuteeId"> & {
  sessionId: string;
  tuteeId: Types.ObjectId;
};

// The body a client sends to create one. No id, no tuteeId (read off the
// token) and no status (every booking starts as Requested).
export type NewBookingBody = Pick<
  BookingDoc,
  "sessionId" | "notes" | "contactEmail" | "preferredDate"
>;

// The body a client sends to edit one. tuteeId is deliberately absent --
// a booking cannot be handed to another user.
export type BookingPatchBody = Partial<
  Pick<BookingDoc, "status" | "notes" | "contactEmail" | "preferredDate">
>;

// ---------------------------------------------------------------------
// SESSION 10: the reference data -- tutors and the sessions they offer.
//
// Nobody creates these through the API; they go in once from src/seed.ts.
// Unlike User and Booking they keep the ids db.json gave them ("1",
// "101"), stored AS the _id, because every booking already holds a
// sessionId like "101" and the frontend links to /tutors/1.
// ---------------------------------------------------------------------

// A tutor in the public directory. Not a User: tutors here have no
// password and cannot log in -- they are rows the site lists.
export type TutorDoc = Omit<TutoringUser, "id"> & {
  _id: string;
};

// tutorId points at a Tutor's _id, so it is a string too.
export type SessionDoc = Omit<Session, "id" | "tutorId"> & {
  _id: string;
  tutorId: string;
};
