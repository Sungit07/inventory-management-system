import { Router } from "express";
import { getReturns, createReturn, inspectReturn } from "../controllers/returnController";
import { authMiddleware } from "../middleware/auth";
import { authorizeRoles } from "../middleware/rbac";

const router = Router();

router.get("/", authMiddleware, authorizeRoles("ADMIN", "MANAGER", "OPERATOR"), getReturns);
router.post("/", authMiddleware, authorizeRoles("ADMIN", "MANAGER", "OPERATOR"), createReturn);
router.put("/:id/inspect", authMiddleware, authorizeRoles("ADMIN", "MANAGER"), inspectReturn);

export default router;
