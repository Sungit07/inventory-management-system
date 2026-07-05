import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";

export const authorizeRoles = (...allowedRoles: Array<"ADMIN" | "MANAGER" | "OPERATOR">) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. User session missing." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. You do not have the required role permissions." });
    }

    next();
  };
};
