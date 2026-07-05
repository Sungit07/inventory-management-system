import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, Search, Tag } from "lucide-react";

interface Product {
  sku: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  barcode: string;
  baseSellingPrice: number;
  isActive: boolean;
}

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [brand, setBrand] = useState("");
  const [sellingPrice, setSellingPrice] = useState(0);
  const [weight, setWeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [depth, setDepth] = useState(0);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await API.get("/products");
      setProducts(res.data.products);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load products catalogue.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        sku,
        name,
        description,
        category,
        brand,
        baseSellingPrice: Number(sellingPrice),
        dimensions: {
          weightKg: Number(weight),
          widthCm: Number(width),
          heightCm: Number(height),
          depthCm: Number(depth)
        }
      };

      await API.post("/products", payload);
      setIsModalOpen(false);
      
      setSku("");
      setName("");
      setDescription("");
      setBrand("");
      setSellingPrice(0);
      setWeight(0);
      setWidth(0);
      setHeight(0);
      setDepth(0);

      fetchProducts();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create product");
    }
  };

  const filteredProducts = products.filter(p => 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by SKU, name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading products...</div>
      ) : error ? (
        <div className="text-center py-12 text-rose-400">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No products found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.sku} className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/5 px-2.5 py-0.5 rounded-full border border-blue-500/10">
                    <Tag className="w-3 h-3" /> {product.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 font-mono">SKU: {product.sku}</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mt-3 truncate">{product.name}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2 h-10">{product.description}</p>
                
                <div className="mt-4 flex items-center justify-between border-t border-slate-850 pt-4">
                  <div>
                    <span className="text-xxs text-slate-500 block uppercase font-medium">Brand</span>
                    <span className="text-sm text-slate-300 font-semibold">{product.brand}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xxs text-slate-500 block uppercase font-medium">Price</span>
                    <span className="text-sm text-emerald-400 font-bold">${product.baseSellingPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-mono">
                  Barcode: {product.barcode}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 text-[10px] font-bold">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Add New Catalog Product</h3>
              <p className="text-xs text-slate-400 mt-1">This enters the item description to the global system database catalog.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-350 block mb-1.5">SKU (Stock Keeping Unit)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., ELEC-LAP-002"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350 block mb-1.5">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Enterprise Laptop v15"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350 block mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350 block mb-1.5">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., ProTech"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-350 block mb-1.5">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.99"
                    value={sellingPrice || ""}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-350 block mb-1.5">Description</label>
                <textarea
                  required
                  placeholder="Describe the product details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 h-20 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="border-t border-slate-850 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Product Dimensions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Weight (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight || ""}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Width (Cm)</label>
                    <input
                      type="number"
                      value={width || ""}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Height (Cm)</label>
                    <input
                      type="number"
                      value={height || ""}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Depth (Cm)</label>
                    <input
                      type="number"
                      value={depth || ""}
                      onChange={(e) => setDepth(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/10 transition-colors"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
