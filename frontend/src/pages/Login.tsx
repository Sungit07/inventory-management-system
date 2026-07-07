import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Briefcase, UserCheck } from "lucide-react";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: "ADMIN" | "MANAGER" | "OPERATOR") => {
    login(role);
    navigate("/dashboard");
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
            Select a role profile to access the inventory system
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect("ADMIN")}
            className="flex items-center gap-4 w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all duration-200 group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
              <Shield className="w-5 h-5 text-blue-400 group-hover:text-white" />
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                Admin Profile
              </p>
              <p className="text-xs text-slate-400">
                Full operations, user controls, and system logs
              </p>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("MANAGER")}
            className="flex items-center gap-4 w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-600/5 transition-all duration-200 group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
              <Briefcase className="w-5 h-5 text-emerald-400 group-hover:text-white" />
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                Manager Profile
              </p>
              <p className="text-xs text-slate-400">
                Inventory control, order processing, and analytics
              </p>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect("OPERATOR")}
            className="flex items-center gap-4 w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-600/5 transition-all duration-200 group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-600/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
              <UserCheck className="w-5 h-5 text-purple-400 group-hover:text-white" />
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                Operator (Staff) Profile
              </p>
              <p className="text-xs text-slate-400">
                Stock updates, barcode scans, and return intake
              </p>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500">
            Enterprise Cloud Auth (Azure Entra ID SSO) is bypassed in local
            development mode.
          </p>
        </div>
      </div>
    </div>
  );
};
