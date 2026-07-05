import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[ERROR HANDLER]:", err);

  const status = err.status || 500;
  const message = err.message || "An unexpected error occurred.";

  res.status(status).json({
    error: message,
    details: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};
