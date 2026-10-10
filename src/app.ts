import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth";
import { bookingRouter } from "./routes/bookings";

// Builds the app and stops. It never opens a port or touches the
// database -- server.ts does both.
export const app = express();

// Lets the Vite app on 5173 call this one from the browser.
app.use(cors());

// Puts a JSON request body on req.body. Without it req.body is undefined.
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRouter);
app.use("/api/bookings", bookingRouter);

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
