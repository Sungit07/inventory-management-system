import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { db, InventoryItem } from "../services/db";
import { z } from "zod";

const InventoryCreateSchema = z.object({
  sku: z.string().min(3),
  warehouseId: z.string().min(2),
  location: z.string().min(2),
  quantity: z.number().nonnegative(),
  reorderLevel: z.number().nonnegative(),
  costPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
});

const StockAdjustmentSchema = z.object({
  adjustmentType: z.enum(["RECEIPT", "ISSUE", "CORRECTION"]),
  quantity: z.number().nonnegative(),
  reason: z.string().min(3),
});

export const getInventory = async (req: AuthenticatedRequest, res: Response) => {
  let list = Array.from(db.inventory.values()).map(item => {
    const product = db.products.get(item.sku);
    return {
      ...item,
      name: product ? product.name : "Unknown Product"
    };
  });

  const { search, warehouseId, status } = req.query;

  if (search) {
    const s = (search as string).toLowerCase();
    list = list.filter(item => 
      item.sku.toLowerCase().includes(s) || 
      item.name.toLowerCase().includes(s)
    );
  }

  if (warehouseId) {
    list = list.filter(item => item.warehouseId === warehouseId);
  }

  if (status) {
    list = list.filter(item => item.status === status);
  }

  res.json({ data: list });
};

export const getInventoryById = async (req: AuthenticatedRequest, res: Response) => {
  const item = db.inventory.get(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Inventory item not found" });
  }
  const product = db.products.get(item.sku);
  res.json({
    ...item,
    name: product ? product.name : "Unknown Product",
    description: product ? product.description : "",
    category: product ? product.category : "",
    barcode: product ? product.barcode : ""
  });
};

export const createInventory = async (req: AuthenticatedRequest, res: Response) => {
  const result = InventoryCreateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.format() });
  }

  const { sku, warehouseId, location, quantity, reorderLevel, costPrice, sellingPrice } = result.data;

  if (!db.products.has(sku)) {
    return res.status(404).json({ error: `Product SKU ${sku} does not exist in master catalog.` });
  }

  const id = `inv_${warehouseId}_${sku}`;
  if (db.inventory.has(id)) {
    return res.status(409).json({ error: "Inventory slot already exists. Use Stock Adjustment instead." });
  }

  const status = quantity === 0 ? "OUT_OF_STOCK" : quantity <= reorderLevel ? "LOW_STOCK" : "IN_STOCK";

  const newItem: InventoryItem = {
    id,
    sku,
    warehouseId,
    location,
    quantity,
    reorderLevel,
    costPrice,
    sellingPrice,
    status,
    lastStockTakeDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: req.user!.id
  };

  db.inventory.set(id, newItem);
  db.logAction(
    req.user!.id,
    req.user!.email,
    "CREATE_INVENTORY",
    id,
    "INVENTORY",
    { inventory: newItem }
  );

  res.status(201).json(newItem);
};

export const adjustStock = async (req: AuthenticatedRequest, res: Response) => {
  const item = db.inventory.get(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Inventory item not found" });
  }

  const result = StockAdjustmentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.format() });
  }

  const { adjustmentType, quantity, reason } = result.data;
  const oldQuantity = item.quantity;
  let newQuantity = item.quantity;

  if (adjustmentType === "RECEIPT") {
    newQuantity += quantity;
  } else if (adjustmentType === "ISSUE") {
    if (item.quantity < quantity) {
      return res.status(400).json({ error: `Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}` });
    }
    newQuantity -= quantity;
  } else if (adjustmentType === "CORRECTION") {
    newQuantity = quantity;
  }

  const status = newQuantity === 0 ? "OUT_OF_STOCK" : newQuantity <= item.reorderLevel ? "LOW_STOCK" : "IN_STOCK";

  item.quantity = newQuantity;
  item.status = status;
  item.updatedAt = new Date().toISOString();
  item.updatedBy = req.user!.id;

  db.inventory.set(item.id, item);
  db.logAction(
    req.user!.id,
    req.user!.email,
    "ADJUST_STOCK",
    item.id,
    "INVENTORY",
    {
      adjustmentType,
      quantity,
      reason,
      oldQuantity,
      newQuantity
    }
  );

  res.json({
    id: item.id,
    sku: item.sku,
    oldQuantity,
    newQuantity,
    status
  });
};
