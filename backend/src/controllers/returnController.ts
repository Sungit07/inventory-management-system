import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { db, Return, ReturnItem } from "../services/db";
import { z } from "zod";

const ReturnCreateSchema = z.object({
  orderNumber: z.string().min(2),
  items: z
    .array(
      z.object({
        sku: z.string().min(3),
        quantity: z.number().positive(),
        reason: z.string().min(3),
      }),
    )
    .min(1),
});

const ReturnInspectSchema = z.object({
  status: z.enum(["RECEIVED", "REJECTED", "REFUNDED"]),
  condition: z.enum(["RESELLABLE", "DAMAGED", "REFURBISHABLE"]),
  inspectionNotes: z.string().min(3),
  action: z.enum(["RETURN_TO_STOCK", "WRITE_OFF", "REFURBISH"]),
});

export const getReturns = async (req: AuthenticatedRequest, res: Response) => {
  const returnsList = Array.from(db.returns.values());
  res.json({ returns: returnsList });
};

export const createReturn = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const result = ReturnCreateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.issues,
    });
  }

  const { orderNumber, items } = result.data;

  const order = Array.from(db.orders.values()).find(
    (o) => o.orderNumber === orderNumber,
  );

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const returnedItems: ReturnItem[] = [];
  let refundAmount = 0;

  for (const item of items) {
    const orderLine = order.items.find((i) => i.sku === item.sku);
    if (!orderLine) {
      return res.status(400).json({
        error: `Product SKU ${item.sku} was not part of the original order.`,
      });
    }

    if (orderLine.quantity < item.quantity) {
      return res.status(400).json({
        error: `Cannot return more items than purchased. Ordered: ${orderLine.quantity}, Return Request: ${item.quantity}`,
      });
    }

    returnedItems.push({
      sku: item.sku,
      quantity: item.quantity,
      reason: item.reason,
      condition: "RESELLABLE",
    });

    refundAmount += orderLine.unitPrice * item.quantity;
  }

  const returnId =
    "ret_" + Math.random().toString(36).substring(2, 11).toUpperCase();
  const returnNumber =
    "RET-" +
    new Date().getFullYear() +
    "-" +
    Math.floor(10000 + Math.random() * 90000);

  const newReturn: Return = {
    id: returnId,
    returnNumber,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    status: "INITIATED",
    items: returnedItems,
    refundAmount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.returns.set(returnId, newReturn);
  db.logAction(
    req.user!.id,
    req.user!.email,
    "CREATE_RETURN",
    returnId,
    "RETURN",
    { return: newReturn },
  );

  res.status(201).json(newReturn);
};

export const inspectReturn = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const ret = db.returns.get(req.params.id);
  if (!ret) {
    return res.status(404).json({ error: "Return record not found" });
  }

  const result = ReturnInspectSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: result.error.format() });
  }

  const { status, condition, inspectionNotes, action } = result.data;
  const oldStatus = ret.status;

  ret.status = status;
  ret.inspectionNotes = inspectionNotes;
  ret.inspectedBy = req.user!.id;
  ret.updatedAt = new Date().toISOString();

  if (status === "RECEIVED" || status === "REFUNDED") {
    for (const item of ret.items) {
      item.condition = condition;

      if (action === "RETURN_TO_STOCK") {
        const defaultWhId = "WH-EAST-01";
        const invId = `inv_${defaultWhId}_${item.sku}`;
        const inv = db.inventory.get(invId);
        if (inv) {
          inv.quantity += item.quantity;
          inv.status =
            inv.quantity === 0
              ? "OUT_OF_STOCK"
              : inv.quantity <= inv.reorderLevel
                ? "LOW_STOCK"
                : "IN_STOCK";
          inv.updatedAt = new Date().toISOString();
          db.inventory.set(invId, inv);
        }
      }
    }
  }

  db.returns.set(ret.id, ret);
  db.logAction(
    req.user!.id,
    req.user!.email,
    "INSPECT_RETURN",
    ret.id,
    "RETURN",
    { oldStatus, newStatus: status, condition, action, inspectionNotes },
  );

  res.json(ret);
};
