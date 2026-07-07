import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import {
  TrendingUp,
  AlertTriangle,
  Boxes,
  ShoppingCart,
  Percent,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface SummaryMetrics {
  totalInventoryValuation: number;
  lowStockCount: number;
  pendingOrders: number;
  returnsRatePercentage: number;
  lastUpdated: string;
}

interface SalesTrend {
  labels: string[];
  salesAmount: number[];
  orderCount: number[];
}

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null);
  const [trend, setTrend] = useState<SalesTrend | null>(null);
  const [criticalStock, setCriticalStock] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const summaryRes = await API.get("/analytics/dashboard-summary");
      setMetrics(summaryRes.data);

      const trendRes = await API.get("/analytics/sales-trend");
      setTrend(trendRes.data);

      const invRes = await API.get("/inventory");
      const filtered = invRes.data.data.filter(
        (item: any) =>
          item.status === "LOW_STOCK" || item.status === "OUT_OF_STOCK",
      );
      setCriticalStock(filtered.slice(0, 5));
    } catch (err: any) {
      console.error(err);

      if (err.response?.status === 403) {
        setError("You do not have permission to view dashboard analytics.");
      } else {
        setError("Failed to connect to backend server.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const { user } = useAuth();
  useEffect(() => {
    if (user?.role === "OPERATOR") {
      setIsLoading(false);
      return;
    }

    fetchData();
  }, [user]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            Loading system metrics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Connection Error</h3>
        <p className="text-sm text-slate-300 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const maxSale = trend ? Math.max(...trend.salesAmount) : 1;
  if (user?.role === "OPERATOR") {
    return (
      <div className="space-y-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950 border border-slate-800">
          <h2 className="text-2xl font-bold text-white">
            Welcome {user.displayName}
          </h2>
          <p className="text-slate-400 mt-2">Operator Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/inventory"
            className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800"
          >
            <h3 className="text-xl font-bold text-white">Inventory</h3>
            <p className="text-slate-400 mt-2">View and update stock.</p>
          </Link>

          <Link
            to="/orders"
            className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800"
          >
            <h3 className="text-xl font-bold text-white">Orders</h3>
            <p className="text-slate-400 mt-2">Process customer orders.</p>
          </Link>

          <Link
            to="/returns"
            className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800"
          >
            <h3 className="text-xl font-bold text-white">Returns</h3>
            <p className="text-slate-400 mt-2">Manage returned products.</p>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white">
            System Health Overview
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time status of your global product inventory, order queues, and
            return rates.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium text-slate-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Inventory Valuation
            </span>
            <h3 className="text-2xl font-bold text-white mt-1">
              $
              {metrics?.totalInventoryValuation.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium mt-2 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
              <TrendingUp className="w-3.5 h-3.5" /> +4.2% this week
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
            <Boxes className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <h3 className="text-2xl font-bold mt-1 text-amber-500">
              {metrics?.lowStockCount}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium mt-2 bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/10">
              Needs Immediate Reorder
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-600/10 flex items-center justify-center border border-amber-500/20">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Order Queue
            </span>
            <h3 className="text-2xl font-bold text-white mt-1">
              {metrics?.pendingOrders}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-medium mt-2 bg-blue-500/5 px-2 py-0.5 rounded-full border border-blue-500/10">
              Pending Fulfillment
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Completed Return Rate
            </span>
            <h3 className="text-2xl font-bold text-white mt-1">
              {metrics?.returnsRatePercentage}%
            </h3>
            <span className="inline-flex items-center gap-1 text-xs text-indigo-400 font-medium mt-2 bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
              Target &lt; 2.0%
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
            <Percent className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Daily Sales Volumes
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Reflects gross daily orders in USD ($)
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between h-48 gap-3 sm:gap-6 border-b border-slate-800 pb-2">
            {trend?.labels.map((label, idx) => {
              const amount = trend.salesAmount[idx];
              const pct = (amount / maxSale) * 100;
              return (
                <div
                  key={label}
                  className="flex-1 flex flex-col items-center group"
                >
                  <span className="text-xs font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md mb-2 -translate-y-1">
                    ${amount.toLocaleString()}
                  </span>
                  <div
                    style={{ height: `${pct}%` }}
                    className="w-full bg-blue-600 rounded-t-md hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 min-h-[4px]"
                  />
                  <span className="text-[10px] text-slate-500 mt-3 font-medium truncate max-w-full">
                    {new Date(label).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Stock Warnings</h3>
            <p className="text-xs text-slate-400 mt-1">
              SKUs with critical stock shortages requiring actions.
            </p>
          </div>

          <div className="mt-6 flex-1 space-y-3">
            {criticalStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                No active stock warnings!
              </div>
            ) : (
              criticalStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-850"
                >
                  <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-300">
                      {item.quantity} units
                    </p>
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                        item.status === "OUT_OF_STOCK"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-850">
            <Link
              to="/inventory"
              className="flex items-center justify-center gap-2 w-full text-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Manage Inventory Stock
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
