import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import {
  Search,
  RefreshCw,
  Calendar,
  User,
  ClipboardList,
  Eye,
} from "lucide-react";

interface AuditLog {
  id: string;
  createdMonth: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  entityId: string;
  entityType: string;
  changes: any;
  ipAddress: string;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    try {
      setError("");

      const res = await API.get("/audit/logs", {
        params: month ? { createdMonth: month } : {},
      });

      setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [month]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const text = (
        log.action +
        log.entityType +
        log.entityId +
        log.userEmail
      ).toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [logs, search]);

  const refresh = () => {
    setRefreshing(true);
    loadLogs();
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
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-red-400 font-bold text-xl">{error}</h2>

        <button
          onClick={refresh}
          className="mt-5 px-5 py-2 bg-blue-600 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const badgeColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-500/20 text-green-400";

    if (action.includes("UPDATE")) return "bg-blue-500/20 text-blue-400";

    if (action.includes("DELETE")) return "bg-red-500/20 text-red-400";

    if (action.includes("RETURN")) return "bg-purple-500/20 text-purple-400";

    return "bg-slate-700 text-white";
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>

          <p className="text-slate-400 mt-2">
            Enterprise activity history and compliance logs.
          </p>
        </div>

        <button
          onClick={refresh}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <RefreshCw
            className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, entity or user..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800"
          />
        </div>
      </div>
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="text-left px-6 py-4">Action</th>

              <th className="text-left px-6 py-4">Entity</th>

              <th className="text-left px-6 py-4">User</th>

              <th className="text-left px-6 py-4">Time</th>

              <th className="text-center px-6 py-4">View</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-slate-400">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-slate-800 hover:bg-slate-800/40"
                >
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor(
                        log.action,
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-semibold">{log.entityType}</span>

                      <span className="text-slate-400 text-sm">
                        {log.entityId}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>

                      <div>
                        <p className="font-medium">{log.userEmail}</p>

                        <p className="text-xs text-slate-400">{log.userId}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-slate-300">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-blue-400" />
                Audit Log Details
              </h2>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
              >
                Close
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-slate-400 mb-1">Action</p>

                <p className="font-semibold">{selectedLog.action}</p>
              </div>

              <div>
                <p className="text-slate-400 mb-1">Entity</p>

                <p className="font-semibold">{selectedLog.entityType}</p>
              </div>

              <div>
                <p className="text-slate-400 mb-1">Entity ID</p>

                <p className="font-semibold">{selectedLog.entityId}</p>
              </div>

              <div>
                <p className="text-slate-400 mb-1">User</p>

                <p className="font-semibold">{selectedLog.userEmail}</p>
              </div>

              <div>
                <p className="text-slate-400 mb-1">Created</p>

                <p className="font-semibold">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <h3 className="font-semibold mb-3">Metadata</h3>

            <pre className="bg-slate-950 rounded-xl p-5 overflow-auto text-sm border border-slate-800">
              {JSON.stringify(selectedLog.changes, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
