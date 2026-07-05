import { Router } from "express";
import { getOrders, getOrderById, createOrder, updateOrderStatus } from "../controllers/orderController";
import { authMiddleware } from "../middleware/auth";
import { authorizeRoles } from "../middleware/rbac";

const router = Router();

router.get("/", authMiddleware, authorizeRoles("ADMIN", "MANAGER", "OPERATOR"), getOrders);
router.get("/:id", authMiddleware, authorizeRoles("ADMIN", "MANAGER", "OPERATOR"), getOrderById);
router.post("/", authMiddleware, authorizeRoles("ADMIN", "MANAGER", "OPERATOR"), createOrder);
router.put("/:id/status", authMiddleware, authorizeRoles("ADMIN", "MANAGER", "OPERATOR"), updateOrderStatus);

export default router;
