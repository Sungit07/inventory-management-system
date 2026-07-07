import React, { useEffect, useState } from "react";
import API from "../services/api";
import {
  DollarSign,
  Boxes,
  ShoppingCart,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  PackageSearch,
} from "lucide-react";

interface DashboardSummary {
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

const Analytics: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sales, setSales] = useState<SalesTrend | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");

      const [summaryRes, salesRes] = await Promise.all([
        API.get("/analytics/dashboard-summary"),
        API.get("/analytics/sales-trend"),
      ]);

      setSummary(summaryRes.data);
      setSales(salesRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <h2 className="text-red-400 text-xl font-bold">{error}</h2>

        <button
          onClick={refresh}
          className="mt-5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const highestSales = sales ? Math.max(...sales.salesAmount) : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Business Analytics</h1>

          <p className="text-slate-400 mt-2">
            Enterprise inventory insights and business KPIs.
          </p>
        </div>

        <button
          onClick={refresh}
          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-3"
        >
          <RefreshCw
            className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-slate-400 text-sm">Inventory Value</p>

              <h2 className="text-3xl font-bold mt-2">
                ${summary?.totalInventoryValuation.toLocaleString()}
              </h2>
            </div>

            <DollarSign className="text-green-400" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-slate-400 text-sm">Low Stock</p>

              <h2 className="text-3xl font-bold mt-2">
                {summary?.lowStockCount}
              </h2>
            </div>

            <PackageSearch className="text-orange-400" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pending Orders</p>

              <h2 className="text-3xl font-bold mt-2">
                {summary?.pendingOrders}
              </h2>
            </div>

            <ShoppingCart className="text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-slate-400 text-sm">Return %</p>

              <h2 className="text-3xl font-bold mt-2">
                {summary?.returnsRatePercentage}%
              </h2>
            </div>

            <RotateCcw className="text-purple-400" />
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Sales Trend
          </h2>

          <div className="space-y-4">
            {sales?.labels.map((label, index) => {
              const value = sales.salesAmount[index];

              const width =
                highestSales && highestSales > 0
                  ? (value / highestSales) * 100
                  : 0;

              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>

                    <span className="font-semibold">
                      ${value.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-xl font-semibold mb-6">Daily Orders</h2>

          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3">Date</th>

                <th className="text-center py-3">Orders</th>

                <th className="text-right py-3">Revenue</th>
              </tr>
            </thead>

            <tbody>
              {sales?.labels.map((label, index) => (
                <tr
                  key={label}
                  className="border-b border-slate-800 hover:bg-slate-800/40"
                >
                  <td className="py-4">{label}</td>

                  <td className="text-center">{sales.orderCount[index]}</td>

                  <td className="text-right font-semibold text-green-400">
                    ${sales.salesAmount[index].toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <Boxes className="text-blue-400 mb-3" />

          <h3 className="text-lg font-semibold">Inventory Health</h3>

          <p className="text-slate-400 mt-2">
            Inventory valuation currently stands at
            <span className="text-white font-semibold">
              {" "}
              ${summary?.totalInventoryValuation.toLocaleString()}
            </span>
            .
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <ShoppingCart className="text-orange-400 mb-3" />

          <h3 className="text-lg font-semibold">Order Pipeline</h3>

          <p className="text-slate-400 mt-2">
            There are currently
            <span className="text-white font-semibold">
              {" "}
              {summary?.pendingOrders}
            </span>{" "}
            orders awaiting fulfillment.
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <RotateCcw className="text-purple-400 mb-3" />

          <h3 className="text-lg font-semibold">Return Performance</h3>

          <p className="text-slate-400 mt-2">
            Current return rate is
            <span className="text-white font-semibold">
              {" "}
              {summary?.returnsRatePercentage}%
            </span>
            .
          </p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">System Status</h2>

          <span className="text-green-400 font-medium">Operational</span>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-5">
          <div>
            <p className="text-slate-400">Last Analytics Refresh</p>

            <h3 className="mt-2 text-lg font-semibold">
              {summary?.lastUpdated
                ? new Date(summary.lastUpdated).toLocaleString()
                : "--"}
            </h3>
          </div>

          <div>
            <p className="text-slate-400">Overall Business Status</p>

            <h3 className="mt-2 text-green-400 text-lg font-semibold">
              Healthy
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
