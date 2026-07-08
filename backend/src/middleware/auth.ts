import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../services/db";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: "ADMIN" | "MANAGER" | "OPERATOR";
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Dev-only convenience for testing protected routes from Postman
    // without generating a real JWT. Disabled automatically in production.
    if (process.env.NODE_ENV !== "production") {
      const mockUserId = req.headers["x-mock-user-id"] as string;
      if (mockUserId) {
        const localUser = db.users.get(mockUserId);
        if (localUser) {
          req.user = {
            id: localUser.id,
            email: localUser.email,
            displayName: localUser.displayName,
            role: localUser.role,
          };
          return next();
        }
      }
    }
    return res.status(401).json({ error: "Access denied. No authentication token provided." });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ error: "Server misconfiguration: JWT_SECRET is not set." });
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: "ADMIN" | "MANAGER" | "OPERATOR";
    };

    const user = db.users.get(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Account not found or deactivated." });
    }

    req.user = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};