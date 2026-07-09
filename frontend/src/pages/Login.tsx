import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login(email, password);

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-950/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 font-black text-xl text-white shadow-lg shadow-blue-500/20 mb-3">
            I
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Enterprise IMS
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to access the Enterprise Inventory Management System
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm mb-2 text-slate-300">Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@enterprise.com"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-slate-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 font-semibold"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <div className="text-xs text-slate-500 space-y-1">
            <p>Development Accounts</p>

            <p>Admin → admin@enterprise.com / Admin@123</p>

            <p>Manager → manager@enterprise.com / Manager@123</p>

            <p>Operator → operator@enterprise.com / Operator@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};
