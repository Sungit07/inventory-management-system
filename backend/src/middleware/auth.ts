import { Request, Response, NextFunction } from "express";
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
  // 1. Check for standard Authorization Header (Entra ID integration)
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    
    // Test tokens
    if (token === "admin-token") {
      req.user = { id: "usr_admin", email: "admin@enterprise.com", displayName: "Admin User", role: "ADMIN" };
      return next();
    } else if (token === "manager-token") {
      req.user = { id: "usr_manager", email: "manager@enterprise.com", displayName: "Manager User", role: "MANAGER" };
      return next();
    } else if (token === "operator-token") {
      req.user = { id: "usr_operator", email: "operator@enterprise.com", displayName: "Operator User", role: "OPERATOR" };
      return next();
    }
    
    try {
      // Decode a simulated JSON-base64 token for custom local payloads
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      req.user = {
        id: decoded.oid || decoded.id || "usr_unknown",
        email: decoded.email || decoded.upn || "unknown@enterprise.com",
        displayName: decoded.name || "Default User",
        role: (decoded.roles && decoded.roles[0]) || "OPERATOR"
      };
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token format." });
    }
  }

  // 2. Local Fallback Headers (helps simple dev testing using Postman)
  const mockUserId = req.headers["x-mock-user-id"] as string;
  const mockUserRole = req.headers["x-mock-user-role"] as string;

  if (mockUserId && mockUserRole) {
    const localUser = db.users.get(mockUserId);
    if (localUser) {
      req.user = {
        id: localUser.id,
        email: localUser.email,
        displayName: localUser.displayName,
        role: mockUserRole as any
      };
      return next();
    }
  }

  return res.status(401).json({ error: "Access denied. Authentication token or mock headers required." });
};
