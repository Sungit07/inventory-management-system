import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, Search, Edit3, Filter } from "lucide-react";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  warehouseId: string;
  location: string;
  quantity: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  lastStockTakeDate: string;
}

export const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [whFilter, setWhFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjType, setAdjType] = useState<"RECEIPT" | "ISSUE" | "CORRECTION">("RECEIPT");
  const [adjQty, setAdjQty] = useState(0);
  const [adjReason, setAdjReason] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSku, setNewSku] = useState("");
  const [newWh, setNewWh] = useState("WH-EAST-01");
  const [newLoc, setNewLoc] = useState("");
  const [newQty, setNewQty] = useState(0);
  const [newReorder, setNewReorder] = useState(10);
  const [newCost, setNewCost] = useState(0);
  const [newSell, setNewSell] = useState(0);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setError("");
      const params: any = {};
      if (search) params.search = search;
      if (whFilter) params.warehouseId = whFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get("/inventory", { params });
      setInventory(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch inventory stock levels.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search, whFilter, statusFilter]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await API.put(`/inventory/${selectedItem.id}/stock`, {
        adjustmentType: adjType,
        quantity: Number(adjQty),
        reason: adjReason
      });

      setSelectedItem(null);
      setAdjQty(0);
      setAdjReason("");
      fetchInventory();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to adjust stock");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/inventory", {
        sku: newSku,
        warehouseId: newWh,
        location: newLoc,
        quantity: Number(newQty),
        reorderLevel: Number(newReorder),
        costPrice: Number(newCost),
        sellingPrice: Number(newSell)
      });

      setIsCreateOpen(false);
      setNewSku("");
      setNewLoc("");
      setNewQty(0);
      setNewCost(0);
      setNewSell(0);
      fetchInventory();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to assign inventory slot");
    }
  };

  const canAssign = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by SKU or Product Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={whFilter}
              onChange={(e) => setWhFilter(e.target.value)}
              className="bg-transparent text-sm text-slate-200 focus:outline-none"
            >
              <option value="">All Warehouses</option>
              <option value="WH-EAST-01">WH-EAST-01</option>
              <option value="WH-WEST-02">WH-WEST-02</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm text-slate-200 focus:outline-none"
            >
              <option value="">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          {canAssign && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Assign Slot
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading stock sheets...</div>
      ) : error ? (
        <div className="text-center py-12 text-rose-400">{error}</div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No inventory matches these filters.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full border-collapse text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Product details</th>
                <th className="px-6 py-4">Warehouse / Loc</th>
                <th className="px-6 py-4 text-center">Available Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Pricing</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-850/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-300">{item.warehouseId}</span>
                    <div className="text-xs text-slate-500 mt-0.5">{item.location}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-white">{item.quantity}</span>
                    <span className="text-xs text-slate-500 block">Min: {item.reorderLevel}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      item.status === "IN_STOCK"
                        ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                        : item.status === "LOW_STOCK"
                        ? "bg-amber-500/5 text-amber-400 border-amber-500/10"
                        : "bg-rose-500/5 text-rose-400 border-rose-500/10"
                    }`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-slate-350">Cost: ${item.costPrice.toFixed(2)}</div>
                    <div className="text-xs text-emerald-400 font-semibold mt-0.5">Sell: ${item.sellingPrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Adjust Stock"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
          
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 p-6">
            <h3 className="text-lg font-bold text-white mb-2">Adjust Quantity</h3>
            <p className="text-xs text-slate-400 mb-6">
              SKU: <span className="font-mono text-slate-300">{selectedItem.sku}</span> | Warehouse: <span className="text-slate-300">{selectedItem.warehouseId}</span>
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["RECEIPT", "ISSUE", "CORRECTION"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAdjType(type)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                        adjType === type
                          ? "bg-blue-600/10 text-blue-400 border-blue-600/30"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Quantity Change</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={adjQty || ""}
                  onChange={(e) => setAdjQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Audit Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Restock delivery / Damaged goods writeoff"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-850 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-slate-855 hover:bg-slate-800 text-slate-400 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Apply Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 p-6">
            <h3 className="text-lg font-bold text-white mb-2">Assign Product to Location</h3>
            <p className="text-xs text-slate-400 mb-6">Create a stock tracking instance for a catalog item in a warehouse.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Product SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., ELEC-LAP-001"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Warehouse ID</label>
                  <select
                    value={newWh}
                    onChange={(e) => setNewWh(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="WH-EAST-01">WH-EAST-01</option>
                    <option value="WH-WEST-02">WH-WEST-02</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Precise Location Coordinate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Aisle 5, Shelf A"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Initial Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newQty || ""}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Reorder Limit Warning</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newReorder || ""}
                    onChange={(e) => setNewReorder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="15.00"
                    value={newCost || ""}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.00"
                    value={newSell || ""}
                    onChange={(e) => setNewSell(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-850 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
