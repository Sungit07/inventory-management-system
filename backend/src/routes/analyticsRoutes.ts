import { Router } from "express";
import { getDashboardSummary, getSalesTrend } from "../controllers/analyticsController";
import { authMiddleware } from "../middleware/auth";
import { authorizeRoles } from "../middleware/rbac";

const router = Router();

router.get("/dashboard-summary", authMiddleware, authorizeRoles("ADMIN", "MANAGER"), getDashboardSummary);
router.get("/sales-trend", authMiddleware, authorizeRoles("ADMIN", "MANAGER"), getSalesTrend);

export default router;
