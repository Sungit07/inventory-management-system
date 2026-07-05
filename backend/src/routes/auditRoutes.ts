import { Router } from "express";
import { getAuditLogs } from "../controllers/auditController";
import { authMiddleware } from "../middleware/auth";
import { authorizeRoles } from "../middleware/rbac";

const router = Router();

router.get("/logs", authMiddleware, authorizeRoles("ADMIN"), getAuditLogs);

export default router;
