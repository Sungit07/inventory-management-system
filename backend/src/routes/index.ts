import { Router } from "express";
import productRoutes from "./productRoutes";
import inventoryRoutes from "./inventoryRoutes";
import orderRoutes from "./orderRoutes";
import returnRoutes from "./returnRoutes";
import analyticsRoutes from "./analyticsRoutes";
import auditRoutes from "./auditRoutes";

const router = Router();

router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/orders", orderRoutes);
router.use("/returns", returnRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/audit", auditRoutes);

export default router;
