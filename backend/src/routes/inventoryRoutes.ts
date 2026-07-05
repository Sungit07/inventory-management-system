import { Router } from "express";
import { getInventory, getInventoryById, createInventory, adjustStock } from "../controllers/inventoryController";
import { authMiddleware } from "../middleware/auth";
import { authorizeRoles } from "../middleware/rbac";

const router = Router();

router.get("/", authMiddleware, authorizeRoles("ADMIN", "MANAGER", "OPERATOR"), getInventory);
router.get("/:id", authMiddleware, authorizeRoles("ADMIN", "MANAGER", "OPERATOR"), getInventoryById);
router.post("/", authMiddleware, authorizeRoles("ADMIN", "MANAGER"), createInventory);
router.put("/:id/stock", authMiddleware, authorizeRoles("ADMIN", "MANAGER", "OPERATOR"), adjustStock);

export default router;
