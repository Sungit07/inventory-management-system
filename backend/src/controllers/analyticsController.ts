import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { db } from "../services/db";

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response) => {
  const inventoryList = Array.from(db.inventory.values());
  const ordersList = Array.from(db.orders.values());
  const returnsList = Array.from(db.returns.values());

  const totalInventoryValuation = inventoryList.reduce((acc, curr) => {
    return acc + (curr.quantity * curr.sellingPrice);
  }, 0);

  const lowStockCount = inventoryList.filter(item => item.status === "LOW_STOCK").length;
  const pendingOrders = ordersList.filter(o => o.status === "PENDING" || o.status === "PROCESSING").length;
  
  const refundReturns = returnsList.filter(r => r.status === "REFUNDED").length;
  const totalCompletedOrders = ordersList.filter(o => o.status === "DELIVERED").length;
  const returnsRatePercentage = totalCompletedOrders > 0 
    ? (refundReturns / totalCompletedOrders) * 100 
    : 0;

  res.json({
    totalInventoryValuation,
    lowStockCount,
    pendingOrders,
    returnsRatePercentage: parseFloat(returnsRatePercentage.toFixed(2)),
    lastUpdated: new Date().toISOString()
  });
};

export const getSalesTrend = async (req: AuthenticatedRequest, res: Response) => {
  const labels = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"];
  const salesAmount = [4500.00, 3200.50, 6800.00, 1500.00, 9999.90];
  const orderCount = [5, 4, 7, 2, 10];

  res.json({
    labels,
    salesAmount,
    orderCount
  });
};
