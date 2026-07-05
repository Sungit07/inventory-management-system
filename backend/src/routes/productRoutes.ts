import { Router } from "express";
import { getProducts, createProduct } from "../controllers/productController";
import { authMiddleware } from "../middleware/auth";
import { authorizeRoles } from "../middleware/rbac";

const router = Router();

router.get("/", authMiddleware, authorizeRoles("ADMIN", "MANAGER", "OPERATOR"), getProducts);
router.post("/", authMiddleware, authorizeRoles("ADMIN", "MANAGER"), createProduct);

export default router;
