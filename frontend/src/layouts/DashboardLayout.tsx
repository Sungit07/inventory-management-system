import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  RefreshCw,
  BarChart3,
  History,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "MANAGER", "OPERATOR"],
    },
    {
      name: "Products",
      path: "/products",
      icon: Package,
      roles: ["ADMIN", "MANAGER", "OPERATOR"],
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: Boxes,
      roles: ["ADMIN", "MANAGER", "OPERATOR"],
    },
    {
      name: "Orders",
      path: "/orders",
      icon: ShoppingCart,
      roles: ["ADMIN", "MANAGER", "OPERATOR"],
    },
    {
      name: "Returns",
      path: "/returns",
      icon: RefreshCw,
      roles: ["ADMIN", "MANAGER", "OPERATOR"],
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Audit Logs",
      path: "/audit-logs",
      icon: History,
      roles: ["ADMIN"],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const getPageTitle = () => {
    const active = navItems.find((item) => item.path === location.pathname);
    return active ? active.name : "System";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-shrink-0 flex-col w-64 bg-slate-900 border-r border-slate-800">
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-605 flex items-center justify-center font-bold text-white shadow-lg bg-blue-600 shadow-blue-500/20">
              I
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Enterprise IMS
            </span>
          </div>
        </div>

        <div className="p-4 mx-4 my-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">
              {user?.displayName}
            </p>
            <p className="text-xs text-blue-500 font-medium tracking-wide">
              {user?.role}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-md shadow-blue-600/5"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-slate-400"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar for Mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />

          <aside className="relative flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                  I
                </div>
                <span className="text-lg font-bold">Enterprise IMS</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 mx-4 my-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.displayName}</p>
                <p className="text-xs text-blue-500 font-medium">
                  {user?.role}
                </p>
              </div>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-slate-900 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-200">
                {user?.displayName}
              </span>
              <span className="text-xs text-slate-400">{user?.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-blue-400">
              {user?.displayName
                ? user.displayName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                : "U"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
