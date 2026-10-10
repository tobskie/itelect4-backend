import { Router, type Request, type Response } from "express";
import { Booking } from "../models/Booking";
import { requireAuth } from "../middleware/auth";
import {
  BookingStatus,
  type BookingDoc,
  type BookingPatchBody,
  type NewBookingBody,
} from "../types/index";

export const bookingRouter = Router();

// Every route below this line needs a valid Authorization header.
bookingRouter.use(requireAuth);

interface IdParam {
  id: string;
}

// GET /api/bookings -- only the ones belonging to this token
bookingRouter.get("/", async (req: Request, res: Response) => {
  const bookings = await Booking.find({
    tuteeId: req.userId,
  }).sort({ requestedAt: -1 });
  res.json(bookings);
});

// GET /api/bookings/:id
bookingRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    // The right row AND the right owner. Without tuteeId here, changing
    // the id in the URL reads someone else's booking.
    const booking = await Booking.findOne({
      _id: req.params.id,
      tuteeId: req.userId,
    });

    if (!booking) {
      res.status(404).json({ message: "No booking with that id" });
      return;
    }

    res.json(booking);
  },
);

// POST /api/bookings
bookingRouter.post(
  "/",
  async (
    req: Request<unknown, unknown, NewBookingBody>,
    res: Response,
  ) => {
    // Only the fields a tutee may set. status starts at Requested from
    // the schema default, and the owner comes off the verified token.
    const { sessionId, notes, contactEmail, preferredDate } = req.body;

    const booking = await Booking.create({
      sessionId,
      notes,
      contactEmail,
      preferredDate,
      tuteeId: req.userId,
    });

    res.status(201).json(booking);
  },
);

// PATCH /api/bookings/:id
bookingRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, BookingPatchBody>,
    res: Response,
  ) => {
    // Copy only the editable fields, so a body carrying tuteeId cannot
    // hand the booking to another user.
    const { status, notes, contactEmail, preferredDate } = req.body;
    const update: Partial<BookingDoc> = { status, notes, contactEmail, preferredDate };

    // Stamp the lifecycle dates when the status moves forward.
    if (status === BookingStatus.Confirmed) update.confirmedAt = new Date();
    if (status === BookingStatus.Completed) update.completedAt = new Date();

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, tuteeId: req.userId },
      update,
      // returnDocument: return the row AFTER the change. (The guide's
      // `new: true` does the same, but Mongoose 9 deprecates it.)
      // runValidators: schema rules are skipped on updates otherwise.
      { returnDocument: "after", runValidators: true },
    );

    if (!booking) {
      res.status(404).json({ message: "No booking with that id" });
      return;
    }

    res.json(booking);
  },
);

// DELETE /api/bookings/:id
bookingRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      tuteeId: req.userId,
    });

    if (!booking) {
      res.status(404).json({ message: "No booking with that id" });
      return;
    }

    // 204: done, and deliberately no body.
    res.status(204).send();
  },
);
