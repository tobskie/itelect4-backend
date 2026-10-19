import { Router, type Request, type Response } from "express";
import { Session } from "../models/Session";

export const sessionRouter = Router();

// Public, like tutors.ts: no requireAuth, because the schedule and the
// booking form's dropdown are both read before anyone has logged in.

interface IdParam {
  id: string;
}

// GET /api/sessions
sessionRouter.get("/", async (_req: Request, res: Response) => {
  const sessions = await Session.find().sort({ scheduledAt: 1 });
  res.json(sessions);
});

// GET /api/sessions/101
sessionRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404).json({
        message: `No session with id "${req.params.id}"`,
      });
      return;
    }

    res.json(session);
  },
);
