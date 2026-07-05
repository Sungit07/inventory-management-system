import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { db } from "../services/db";

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  const { createdMonth } = req.query;
  let list = db.auditLogs;

  if (createdMonth) {
    list = list.filter(log => log.createdMonth === createdMonth);
  }

  res.json({ logs: list });
};
