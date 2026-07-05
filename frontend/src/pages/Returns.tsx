import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, Eye, ShieldAlert } from "lucide-react";

interface ReturnItem {
  sku: string;
  quantity: number;
  reason: string;
  condition: "RESELLABLE" | "DAMAGED" | "REFURBISHABLE";
}

interface Return {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  status: "INITIATED" | "IN_TRANSIT" | "RECEIVED" | "INSPECTED" | "REFUNDED" | "REJECTED";
  items: ReturnItem[];
  refundAmount: number;
  inspectionNotes?: string;
  inspectedBy?: string;
  createdAt: string;
}

export const Returns: React.FC = () => {
  const { user } = useAuth();
  const [returns, setReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [returnItems, setReturnItems] = useState<Array<{ sku: string; quantity: number; reason: string }>>([
    { sku: "", quantity: 1, reason: "" }
  ]);

  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [newStatus, setNewStatus] = useState<any>("RECEIVED");
  const [condition, setCondition] = useState<any>("RESELLABLE");
  const [action, setAction] = useState<any>("RETURN_TO_STOCK");
  const [notes, setNotes] = useState("");

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await API.get("/returns");
      setReturns(res.data.returns);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load returns sheet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const items = returnItems.filter(item => item.sku !== "");
      if (items.length === 0) {
        alert("Please add at least one item");
        return;
      }

      await API.post("/returns", {
        orderId,
        items
      });

      setIsCreateOpen(false);
      setOrderId("");
      setReturnItems([{ sku: "", quantity: 1, reason: "" }]);
      fetchReturns();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to initiate return");
    }
  };

  const handleInspectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    try {
      await API.put(`/returns/${selectedReturn.id}/inspect`, {
        status: newStatus,
        condition,
        inspectionNotes: notes,
        action
      });

      setSelectedReturn(null);
      setNotes("");
      fetchReturns();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to process inspection");
    }
  };

  const addReturnItemRow = () => {
    setReturnItems([...returnItems, { sku: "", quantity: 1, reason: "" }]);
  };

  const updateReturnItemRow = (idx: number, field: "sku" | "quantity" | "reason", val: any) => {
    const next = [...returnItems];
    next[idx] = { ...next[idx], [field]: val };
    setReturnItems(next);
  };

  const canInspect = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Return Request
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading returns...</div>
      ) : error ? (
        <div className="text-center py-12 text-rose-400">{error}</div>
      ) : returns.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No returns registered in system.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full border-collapse text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Return Number</th>
                <th className="px-6 py-4">Order Link</th>
                <th className="px-6 py-4 text-right">Refund Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-855">
              {returns.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-850/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-white">{ret.returnNumber}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-300">{ret.orderNumber}</span>
                    <div className="text-xs text-slate-500 mt-0.5">Order ID: {ret.orderId}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-400">
                    ${ret.refundAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      ret.status === "REFUNDED"
                        ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                        : ret.status === "RECEIVED" || ret.status === "INSPECTED"
                        ? "bg-blue-500/5 text-blue-400 border-blue-500/10"
                        : ret.status === "INITIATED" || ret.status === "IN_TRANSIT"
                        ? "bg-amber-500/5 text-amber-400 border-amber-500/10"
                        : "bg-rose-500/5 text-rose-400 border-rose-500/10"
                    }`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(ret.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedReturn(ret);
                        setNotes(ret.inspectionNotes || "");
                      }}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-white mb-2">Initiate Return Request</h3>
            <p className="text-xs text-slate-400 mb-6">File returned line items relative to an existing purchase order contract.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Original Order ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., ord_01J54XYZ"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="border-t border-slate-855 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Line Items returning</h4>
                  <button
                    type="button"
                    onClick={addReturnItemRow}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    + Add Item Row
                  </button>
                </div>
                
                <div className="space-y-3">
                  {returnItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center flex-wrap sm:flex-nowrap">
                      <div className="flex-1 min-w-[150px]">
                        <input
                          type="text"
                          required
                          placeholder="SKU (e.g., ELEC-LAP-001)"
                          value={item.sku}
                          onChange={(e) => updateReturnItemRow(idx, "sku", e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Qty"
                          value={item.quantity || ""}
                          onChange={(e) => updateReturnItemRow(idx, "quantity", Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="text"
                          required
                          placeholder="Reason (e.g., Backlight defective)"
                          value={item.reason}
                          onChange={(e) => updateReturnItemRow(idx, "reason", e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-855">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-855 hover:bg-slate-800 text-slate-400 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Log Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedReturn(null)} />
          
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-2">Inspect Return: {selectedReturn.returnNumber}</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Original Order: {selectedReturn.orderNumber} | Customer: {selectedReturn.customerId}</p>

            <div className="space-y-3 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-850">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Claim Details</h4>
              {selectedReturn.items.map((line, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-900 pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-slate-205 text-slate-200">SKU: {line.sku}</span>
                    <span className="text-xs text-slate-500 block">Reason: "{line.reason}"</span>
                  </div>
                  <span className="text-slate-300 font-semibold">{line.quantity} units</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-850">
                <span className="text-slate-300">Total Refund Liability</span>
                <span className="text-emerald-400">${selectedReturn.refundAmount.toFixed(2)}</span>
              </div>
            </div>

            {canInspect ? (
              <form onSubmit={handleInspectSubmit} className="space-y-4 pt-4 border-t border-slate-855">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">QA Evaluation & Actions</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">Claim Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none"
                    >
                      <option value="RECEIVED">RECEIVED</option>
                      <option value="REFUNDED">REFUNDED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">Condition Code</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none"
                    >
                      <option value="RESELLABLE">RESELLABLE</option>
                      <option value="REFURBISHABLE">REFURBISHABLE</option>
                      <option value="DAMAGED">DAMAGED</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">Action Taken</label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none"
                    >
                      <option value="RETURN_TO_STOCK">Restock Stock</option>
                      <option value="REFURBISH">Send to QA Refurb</option>
                      <option value="WRITE_OFF">Scrap / Write off</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Inspection Notes</label>
                  <textarea
                    required
                    placeholder="Enter visual QA verification outcome notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 h-20 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-855 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedReturn(null)}
                    className="px-4 py-2 bg-slate-855 hover:bg-slate-800 text-slate-400 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Log Evaluation
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 pt-4 border-t border-slate-855 flex flex-col items-center p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center">
                <ShieldAlert className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-xs font-bold text-slate-350">Inspection Locked</p>
                <p className="text-xxs text-slate-500 mt-1 max-w-xs">
                  Only User profiles holding "ADMIN" or "MANAGER" levels can process visual evaluations or write-off commands.
                </p>
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="px-4 py-1.5 mt-4 bg-slate-850 hover:bg-slate-800 text-slate-450 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
