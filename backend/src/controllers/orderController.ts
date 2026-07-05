import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { db, Order, OrderItem } from "../services/db";
import { z } from "zod";

const OrderCreateSchema = z.object({
  customerId: z.string().min(2),
  customerName: z.string().min(2),
  shippingAddress: z.object({
    street: z.string().min(2),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(2),
    country: z.string().min(2)
  }),
  items: z.array(z.object({
    sku: z.string().min(3),
    quantity: z.number().positive()
  })).min(1)
});

const OrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingNumber: z.string().optional()
});

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.query;
  let list = Array.from(db.orders.values());

  if (status) {
    list = list.filter(o => o.status === status);
  }

  res.json({ orders: list });
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  const order = db.orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.json(order);
};

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  const result = OrderCreateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.format() });
  }

  const { customerId, customerName, shippingAddress, items } = result.data;

  const resolvedItems: OrderItem[] = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = db.products.get(item.sku);
    if (!product) {
      return res.status(404).json({ error: `Product SKU ${item.sku} does not exist.` });
    }

    const invItems = Array.from(db.inventory.values()).filter(i => i.sku === item.sku);
    const totalAvailable = invItems.reduce((acc, curr) => acc + curr.quantity, 0);

    if (totalAvailable < item.quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock for SKU ${item.sku}. Available: ${totalAvailable}, Requested: ${item.quantity}` 
      });
    }

    resolvedItems.push({
      sku: item.sku,
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.baseSellingPrice,
      totalPrice: product.baseSellingPrice * item.quantity
    });

    totalAmount += product.baseSellingPrice * item.quantity;
  }

  for (const item of items) {
    let remainingToDeduct = item.quantity;
    const invItems = Array.from(db.inventory.values()).filter(i => i.sku === item.sku && i.quantity > 0);

    for (const inv of invItems) {
      if (remainingToDeduct <= 0) break;
      const deduct = Math.min(inv.quantity, remainingToDeduct);
      inv.quantity -= deduct;
      inv.status = inv.quantity === 0 ? "OUT_OF_STOCK" : inv.quantity <= inv.reorderLevel ? "LOW_STOCK" : "IN_STOCK";
      inv.updatedAt = new Date().toISOString();
      db.inventory.set(inv.id, inv);
      remainingToDeduct -= deduct;
    }
  }

  const orderId = "ord_" + Math.random().toString(36).substring(2, 11).toUpperCase();
  const orderNumber = "ORD-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    customerId,
    customerName,
    status: "PENDING",
    items: resolvedItems,
    totalAmount,
    shippingAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.set(orderId, newOrder);
  db.logAction(
    req.user!.id,
    req.user!.email,
    "CREATE_ORDER",
    orderId,
    "ORDER",
    { order: newOrder }
  );

  res.status(201).json(newOrder);
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  const order = db.orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const result = OrderStatusSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.format() });
  }

  const { status, trackingNumber } = result.data;
  const oldStatus = order.status;
  
  order.status = status;
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }
  order.updatedAt = new Date().toISOString();

  db.orders.set(order.id, order);
  db.logAction(
    req.user!.id,
    req.user!.email,
    "UPDATE_ORDER_STATUS",
    order.id,
    "ORDER",
    { oldStatus, newStatus: status, trackingNumber }
  );

  res.json(order);
};
