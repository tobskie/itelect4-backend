import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { authRouter } from "./routes/auth";
import { tutorRouter } from "./routes/tutors";
import { sessionRouter } from "./routes/sessions";
import { bookingRouter } from "./routes/bookings";
import { aiRouter } from "./routes/ai";

// Builds the app and stops. It never opens a port -- server.ts does that
// locally, and on Vercel the default export at the bottom IS the server.
export const app = express();

// ===== GT4 PART 1: one line, and every website was allowed to call us ==
// app.use(cors());
//
// NOTE: Right for a laptop. Deployed, it means any page anywhere can send
//       a request with your user's token in it.
// ===== GT4 PART 2: only the origins this app is actually served from ===

// One environment variable, comma-separated, so the list differs on the
// laptop and on Vercel without the code knowing which it is. An origin is
// scheme + host + port only: no path, no trailing slash.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin !== "");

app.use(cors({ origin: ALLOWED_ORIGINS }));

// Puts a JSON request body on req.body. Without it req.body is undefined.
app.use(express.json());

// GT4 PART 2: deployed there is no startup step -- a request is the first
// thing that happens -- so the wait for the database moves here, in front
// of every route. After the first request this awaits a promise that has
// already resolved, which costs nothing.
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  await connectDB();
  next();
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRouter);
app.use("/api/tutors", tutorRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/bookings", bookingRouter);
// ===== SESSION 11: one more router, mounted like the other three ====
// Private, rate limited, and the only route that talks to Gemini.
app.use("/api/ai", aiRouter);

// Nothing above matched: answer in JSON, not Express's HTML page.
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

// Four parameters is what marks this as the error handler, so _next
// has to stay even though nothing calls it. Express 5 forwards errors
// thrown in async routes here on its own.
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((e) => e.message),
      });
      return;
    }

    // A string in the URL that is not a valid ObjectId at all.
    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({
        message: `"${err.value}" is not a valid id`,
      });
      return;
    }

    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  },
);

// Vercel looks for an Express app in src/app.ts (among other places) and
// wants a default export from it. That is the whole of the deployment
// config, which is why this repo has no vercel.json.
export default app;
