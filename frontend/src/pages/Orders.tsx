import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Plus, Eye, Truck } from "lucide-react";

interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: string;
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("USA");
  const [orderItems, setOrderItems] = useState<Array<{ sku: string; quantity: number }>>([{ sku: "", quantity: 1 }]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<any>("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError("");
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const res = await API.get("/orders", { params });
      setOrders(res.data.orders);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load orders history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const items = orderItems.filter(item => item.sku !== "");
      if (items.length === 0) {
        alert("Please add at least one item");
        return;
      }

      await API.post("/orders", {
        customerId,
        customerName,
        shippingAddress: {
          street,
          city,
          state,
          zipCode: zip,
          country
        },
        items
      });

      setIsCreateOpen(false);
      setCustomerName("");
      setCustomerId("");
      setStreet("");
      setCity("");
      setState("");
      setZip("");
      setOrderItems([{ sku: "", quantity: 1 }]);
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create order");
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await API.put(`/orders/${selectedOrder.id}/status`, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined
      });

      setSelectedOrder(null);
      setNewStatus("");
      setTrackingNumber("");
      fetchOrders();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update order status");
    }
  };

  const addItemRow = () => {
    setOrderItems([...orderItems, { sku: "", quantity: 1 }]);
  };

  const updateItemRow = (idx: number, field: "sku" | "quantity", val: any) => {
    const next = [...orderItems];
    next[idx] = { ...next[idx], [field]: val };
    setOrderItems(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm text-slate-200 focus:outline-none"
          >
            <option value="">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Order
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading orders...</div>
      ) : error ? (
        <div className="text-center py-12 text-rose-400">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No orders logged in system.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full border-collapse text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Order Code</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-855">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-850/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-white">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-300">{order.customerName}</span>
                    <div className="text-xs text-slate-500 mt-0.5">ID: {order.customerId}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-white">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                        : order.status === "SHIPPED"
                        ? "bg-blue-500/5 text-blue-400 border-blue-500/10"
                        : order.status === "PROCESSING"
                        ? "bg-indigo-500/5 text-indigo-400 border-indigo-500/10"
                        : order.status === "PENDING"
                        ? "bg-amber-500/5 text-amber-400 border-amber-500/10"
                        : "bg-rose-500/5 text-rose-400 border-rose-500/10"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                        setTrackingNumber(order.trackingNumber || "");
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
            <h3 className="text-lg font-bold text-white mb-2">Create New Purchase Order</h3>
            <p className="text-xs text-slate-400 mb-6">Stock checks and adjustments happen atomically upon submission.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Microsoft Corp"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Customer ID Reference</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., cust_microsoft_01"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-850 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Shipping Location</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="1 Microsoft Way"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Redmond"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">State</label>
                    <input
                      type="text"
                      required
                      placeholder="WA"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Zip Code</label>
                    <input
                      type="text"
                      required
                      placeholder="98052"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-850 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Line Items</h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    + Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="SKU (e.g., ELEC-LAP-001)"
                          value={item.sku}
                          onChange={(e) => updateItemRow(idx, "sku", e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Quantity"
                          value={item.quantity || ""}
                          onChange={(e) => updateItemRow(idx, "quantity", Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
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
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-2">Order Details: {selectedOrder.orderNumber}</h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Customer: {selectedOrder.customerName} | Address: {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}</p>

            <div className="space-y-3 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-850">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ordered Items</h4>
              {selectedOrder.items.map((line, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-900 pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-slate-200">{line.name}</span>
                    <span className="text-xs font-mono text-slate-500 block">SKU: {line.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-300 font-semibold">{line.quantity} units x ${line.unitPrice.toFixed(2)}</span>
                    <span className="text-xs text-emerald-400 block font-semibold">${line.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-850">
                <span className="text-slate-300">Total Order Valuation</span>
                <span className="text-emerald-400">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4 pt-4 border-t border-slate-850">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fulfillment Progression</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">Change Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                
                {newStatus === "SHIPPED" && (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1.5">Carrier Tracking Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 1Z999AA10..."
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {selectedOrder.trackingNumber && (
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-2 bg-slate-950 p-3 rounded-lg border border-slate-855">
                  <Truck className="w-4 h-4 text-blue-400" />
                  Active Tracking Number: <span className="font-mono text-slate-300">{selectedOrder.trackingNumber}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-855 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-lg text-sm font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Save Progression
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
