import { Router, type Request, type Response } from "express";
import { Tutor } from "../models/Tutor";

export const tutorRouter = Router();

// There is no requireAuth line in this file, and that is the point.
// bookings.ts puts one at the top so every route below it is private;
// the tutor directory is what the app shows before anybody has logged
// in, so these two are public on purpose.

interface IdParam {
  id: string;
}

// GET /api/tutors
tutorRouter.get("/", async (_req: Request, res: Response) => {
  const tutors = await Tutor.find().sort({ _id: 1 });
  res.json(tutors);
});

// GET /api/tutors/1
tutorRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const tutor = await Tutor.findById(req.params.id);

    // json-server answered 404 here too, so the frontend's error branch
    // already expects it -- now with a message worth showing.
    if (!tutor) {
      res.status(404).json({
        message: `No tutor with id "${req.params.id}"`,
      });
      return;
    }

    res.json(tutor);
  },
);
