import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Express's Request has no userId field. This adds one, for this project
// only, so req.userId type-checks everywhere.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// What goes inside the token at login, and comes back out on verify.
export interface TokenPayload {
  userId: string;
}

// FROM SESSION 6: ProtectedRoute guards the SCREEN. This guards the
// DATA, and it is the one that matters -- anyone can call this API
// without the app.
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "No token. Send Authorization: Bearer <token>",
    });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    // Checks the signature AND the expiry; either failure throws.
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({
      message: "Token is invalid or has expired",
    });
  }
}
