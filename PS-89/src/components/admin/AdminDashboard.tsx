import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Booking, Worker, User } from "../../types";
import { DemandIntelligenceView } from "./DemandIntelligenceView";
import { AllotWorkerModal } from "./AllotWorkerModal";
import {
  Shield,
  Users,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  Award,
  Layers,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  HeartHandshake,
  Activity,
  FileText,
  KeyRound,
  Send,
  RefreshCw,
  Mail,
  UserCheck,
  Building2
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "roster" | "bookings" | "intelligence" | "welfare" | "audit">("overview");
  const [workers, setWorkers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [inspectingWorker, setInspectingWorker] = useState<any | null>(null);
  const [allottingBooking, setAllottingBooking] = useState<Booking | null>(null);

  // Filters
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerStatusFilter, setWorkerStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "SUSPENDED">("ALL");
  const [bookingFilterZone, setBookingFilterZone] = useState("ALL");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<"ALL" | "PENDING_ALLOTMENT" | "ACTIVE" | "COMPLETED" | "CANCELLED">("ALL");
  const [bookingSearch, setBookingSearch] = useState("");

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const [wRes, bRes, aRes] = await Promise.all([
        fetch("/api/admin/workers", { headers }).catch(() => fetch("/api/workers")),
        fetch("/api/bookings", { headers }),
        fetch("/api/admin/audit-logs", { headers }).catch(() => null)
      ]);

      if (wRes.ok) {
        const wData = await wRes.json();
        setWorkers(wData.workers || []);
      } else {
        const fallback = await fetch("/api/workers");
        if (fallback.ok) {
          const fbData = await fallback.json();
          setWorkers(fbData.workers || []);
        }
      }

      if (bRes.ok) {
        const bData = await bRes.json();
        setBookings(bData.bookings || []);
      }

      if (aRes && aRes.ok) {
        const aData = await aRes.json();
        setAuditLogs(aData.auditLogs || []);
      }
    } catch (e) {
      console.error("Failed to load admin dataset:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleApproveWorker = async (workerId: string) => {
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setFeedback({
          type: "success",
          message: "Worker approved successfully! Login is now active with the registered credentials."
        });
        if (inspectingWorker && ((inspectingWorker.worker?.id || inspectingWorker.id) === workerId)) {
          setInspectingWorker(null);
        }
        await fetchData();
      } else {
        const data = await res.json();
        setFeedback({ type: "error", message: data.error || "Failed to approve worker." });
      }
    } catch (e) {
      console.error("Failed to approve worker:", e);
      setFeedback({ type: "error", message: "Network error approving worker application." });
    }
  };

  const handleRejectWorker = async (workerId: string) => {
    const reason = window.prompt("Reason for application rejection:", "Identity verification failed or trade credentials incomplete");
    if (!reason) return;
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setFeedback({ type: "success", message: "Worker application rejected." });
        await fetchData();
      }
    } catch (e) {
      console.error("Failed to reject worker:", e);
    }
  };

  const handleSuspendWorker = async (workerId: string) => {
    const reason = window.prompt("Reason for suspension:", "Quality standard review or cooperative compliance check");
    if (!reason) return;
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setFeedback({ type: "success", message: "Worker suspended. Login access revoked immediately." });
        await fetchData();
      }
    } catch (e) {
      console.error("Failed to suspend worker:", e);
    }
  };

  const handleReactivateWorker = async (workerId: string) => {
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/reactivate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setFeedback({ type: "success", message: "Worker reactivated. Cooperative status restored." });
        await fetchData();
      }
    } catch (e) {
      console.error("Failed to reactivate worker:", e);
    }
  };

  const handleToggleVerification = async (workerId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error("Failed to update verification:", e);
    }
  };

  // Cooperative Service Request Actions
  const handleAcceptRequest = async (bookingId: string) => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/admin/requests/${bookingId}/accept`, { method: "POST", headers });
      if (res.ok) {
        setFeedback({ type: "success", message: "Request accepted into cooperative allotment queue." });
        await fetchData();
      }
    } catch (e) {
      console.error("Accept request error:", e);
    }
  };

  const handleRejectRequest = async (bookingId: string) => {
    const reason = window.prompt(
      "Please enter the reason for declining this cooperative service request:",
      "All trade specialists currently deployed in this zone"
    );
    if (reason === null) return;

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/admin/requests/${bookingId}/reject`, {
        method: "POST",
        headers,
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setFeedback({ type: "success", message: "Request rejected and customer notified." });
        await fetchData();
      }
    } catch (e) {
      console.error("Reject request error:", e);
    }
  };

  // Metrics
  const totalCompletedBookings = bookings.filter(b => b.status === "COMPLETED");
  const totalGrossEarnings = totalCompletedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalWelfareFund = totalCompletedBookings.reduce((sum, b) => sum + (b.cooperativeFee || 0), 0);
  const activeBookingsCount = bookings.filter(b => !["COMPLETED", "CANCELLED"].includes(b.status)).length;
  const emergencyBookingsCount = bookings.filter(b => b.isEmergency).length;
  const pendingWorkersCount = workers.filter(
    w => (w.worker?.applicationStatus || w.applicationStatus) === "PENDING"
  ).length;
  const pendingAllotmentCount = bookings.filter(
    b => ["REQUESTED", "ACCEPTED", "SUBMITTED", "UNDER_REVIEW", "WORKERS_BEING_ALLOCATED"].includes(b.status)
  ).length;

  const filteredWorkers = workers.filter(w => {
    const workerObj = w.worker || w;
    const appStatus = workerObj.applicationStatus || w.applicationStatus || "APPROVED";
    if (workerStatusFilter !== "ALL" && appStatus !== workerStatusFilter) {
      return false;
    }
    const q = workerSearch.toLowerCase();
    const userName = (w.user?.name || "").toLowerCase();
    const zoneName = (workerObj.zone || w.currentZone || w.allocatedZone || "").toLowerCase();
    const skillsList: any[] = workerObj.skills || w.skills || [];
    return (
      userName.includes(q) ||
      zoneName.includes(q) ||
      skillsList.some((s: any) =>
        (typeof s === "string" ? s : s?.categoryId || s?.name || "").toLowerCase().includes(q)
      )
    );
  });

  const filteredBookings = bookings.filter(b => {
    const matchZone = bookingFilterZone === "ALL" || b.customerZone === bookingFilterZone;
    const q = bookingSearch.toLowerCase();
    const matchSearch =
      b.customerName.toLowerCase().includes(q) ||
      (b.workerName || "").toLowerCase().includes(q) ||
      (b.cooperativeName || "").toLowerCase().includes(q) ||
      b.bookingNumber.toLowerCase().includes(q) ||
      b.categoryName.toLowerCase().includes(q) ||
      (b.assignments || []).some(a => a.workerName.toLowerCase().includes(q));

    let matchStatus = true;
    if (bookingStatusFilter === "PENDING_ALLOTMENT") {
      matchStatus = ["REQUESTED", "ACCEPTED", "SUBMITTED", "UNDER_REVIEW", "WORKERS_BEING_ALLOCATED"].includes(b.status);
    } else if (bookingStatusFilter === "ACTIVE") {
      matchStatus = [
        "WORKER_ALLOTTED",
        "WORKERS_ALLOCATED",
        "ACCEPTED",
        "ON_THE_WAY",
        "WORKERS_ON_THE_WAY",
        "REACHED",
        "WORKERS_REACHED",
        "IN_PROGRESS",
        "WORK_STARTED"
      ].includes(b.status);
    } else if (bookingStatusFilter === "COMPLETED") {
      matchStatus = b.status === "COMPLETED";
    } else if (bookingStatusFilter === "CANCELLED") {
      matchStatus = b.status === "CANCELLED";
    }

    return matchZone && matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Top Banner & Cooperative Federation Info */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F3B66] text-white border border-[#144473] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#144473] text-cyan-300 text-xs font-bold mb-1 border border-[#1E4E7A]">
            <Shield className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Cooperative Governance & Capacity Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Shramik Sahakari Federation Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Administrator: <strong className="text-white">{user?.name || "Dr. Srinivas Rao"}</strong> • Reg ID: COOP-BLR-042 • 4 Operational Zones
          </p>
        </div>

        {/* Global KPI stats */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-[#144473]/80 border border-[#1E4E7A] text-center">
            <div className="text-xs font-semibold text-slate-200">Active Workers</div>
            <div className="text-xl font-extrabold text-[#06B6D4] mt-0.5">{workers.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#144473]/80 border border-[#1E4E7A] text-center">
            <div className="text-xs font-semibold text-slate-200">Active Jobs</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{activeBookingsCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#144473]/80 border border-[#1E4E7A] text-center">
            <div className="text-xs font-semibold text-slate-200">Welfare Pool</div>
            <div className="text-xl font-extrabold text-white mt-0.5">₹{Math.round(totalWelfareFund)}</div>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-4 font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1E3A5F] gap-6 text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === "overview"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Operational Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("intelligence")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === "intelligence"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>Demand Intelligence & Allocation</span>
        </button>

        <button
          onClick={() => setActiveTab("roster")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === "roster"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Worker Verification & Credentials ({workers.length})</span>
          {pendingWorkersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {pendingWorkersCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === "bookings"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Real-Time Booking Monitor ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("welfare")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === "welfare"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Welfare Pool</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
            activeTab === "audit"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Shield className="w-4 h-4 text-indigo-500" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Certified Workers
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{workers.length}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                ✓ 100% NSQF Accredited
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                All-Time Services
              </span>
              <div className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400 mt-2">{bookings.length}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                {totalCompletedBookings.length} completed ({emergencyBookingsCount} emergencies)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Completion SLA Rate
              </span>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">98.6%</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Average arrival: 22 minutes
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Member Payouts (95%)
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                ₹{Math.round(totalGrossEarnings * 0.95)}
              </div>
              <div className="text-[11px] text-blue-600 dark:text-cyan-400 font-semibold mt-1">
                Zero commission deduction
              </div>
            </div>
          </div>

          {/* Quick jump banner to Demand Intelligence */}
          <div className="p-6 rounded-2xl bg-blue-50 dark:bg-[#102A46] border border-blue-200 dark:border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-800 dark:text-cyan-300 uppercase tracking-wider">
                Predictive Capacity Alert Active
              </span>
              <h3 className="text-base font-extrabold text-blue-950 dark:text-white">
                Weekend Demand Surge Expected (+24% in Zone A Plumbing)
              </h3>
              <p className="text-xs text-blue-800 dark:text-slate-300">
                Workforce capacity intelligence recommends moving 4 plumbers from Zone B to Zone A to maintain 100% SLA.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("intelligence")}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer self-start sm:self-center"
            >
              Open Intelligence Planner →
            </button>
          </div>

          {/* Recent Bookings Activity List */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Service Activity</h3>
              <button
                onClick={() => setActiveTab("bookings")}
                className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300"
              >
                View all bookings
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#1E3A5F]">
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {b.categoryName} — {b.customerName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      Worker: {b.workerName} • Zone: {b.customerZone}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === "COMPLETED"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                          : b.status === "IN_PROGRESS"
                          ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {b.status}
                    </span>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-bold mt-0.5">
                      ₹{b.totalAmount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Demand Intelligence */}
      {activeTab === "intelligence" && <DemandIntelligenceView />}

      {/* Tab 3: Worker Roster & Verification */}
      {activeTab === "roster" && (
        <div className="space-y-6">
          {/* Pending Applications Alert Banner */}
          {pendingWorkersCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                    Cooperative Scrutiny Queue: {pendingWorkersCount} Worker Application(s) Pending Review
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300">
                    To maintain cooperative safety and ethics, pending workers cannot log in or receive customer dispatches until approved by the Federation Scrutiny Committee.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWorkerStatusFilter("PENDING")}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                Review Pending ({pendingWorkersCount})
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={workerSearch}
                  onChange={e => setWorkerSearch(e.target.value)}
                  placeholder="Search by name, zone, skill..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-xl outline-hidden bg-white dark:bg-[#102A46] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#102A46] border border-slate-200 dark:border-[#1E3A5F]">
                <button
                  type="button"
                  onClick={() => setWorkerStatusFilter("ALL")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    workerStatusFilter === "ALL"
                      ? "bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  All ({workers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerStatusFilter("PENDING")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    workerStatusFilter === "PENDING"
                      ? "bg-amber-500 text-white shadow-2xs"
                      : "text-amber-700 dark:text-amber-400 hover:text-amber-800"
                  }`}
                >
                  Pending ({pendingWorkersCount})
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerStatusFilter("APPROVED")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    workerStatusFilter === "APPROVED"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Approved
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerStatusFilter("SUSPENDED")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    workerStatusFilter === "SUSPENDED"
                      ? "bg-red-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Suspended
                </button>
              </div>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredWorkers.length} workers
            </span>
          </div>

          <div className="bg-white dark:bg-[#0B1F3A] rounded-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-[#102A46] text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#1E3A5F]">
                  <tr>
                    <th className="py-3 px-4">Worker & Identity</th>
                    <th className="py-3 px-4">Contact & Location</th>
                    <th className="py-3 px-4">Skills & Exp</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Login Access</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1E3A5F]">
                  {filteredWorkers.map(w => {
                    const workerObj = w.worker || w;
                    const userObj = w.user || { name: "Worker", phone: "+91 98000 00000", email: "", avatarUrl: "" };
                    const workerId = workerObj.id || w.id;
                    const zone = workerObj.zone || w.currentZone || w.allocatedZone || "Zone A";
                    const skills = (workerObj.skills || w.skills || []).map((s: any) =>
                      typeof s === "string" ? s : s?.categoryId || s?.skillName || s?.name || ""
                    );
                    const experienceYears = workerObj.experienceYears ?? w.experienceYears ?? 0;
                    const appStatus = workerObj.applicationStatus || w.applicationStatus || "APPROVED";
                    const isVerified = workerObj.isVerified ?? workerObj.isCooperativeVerified ?? w.isCooperativeVerified ?? false;
                    const idProofType = workerObj.idProofType || "Govt ID";
                    const idProofNumber = workerObj.idProofNumber || "Verified in record";
                    const loginEnabled = workerObj.loginEnabled ?? (appStatus === "APPROVED");

                    return (
                      <tr key={workerId} className="hover:bg-slate-50/70 dark:hover:bg-[#102A46]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={userObj.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                              alt={userObj.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-[#1E3A5F] shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{userObj.name}</span>
                                {isVerified && (
                                  <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-900">
                                    ✓ Verified
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                Badge: {workerObj.badgeNumber || workerId}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                {idProofType}: {idProofNumber}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{userObj.phone || "—"}</span>
                          </div>
                          {userObj.email && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[140px]">{userObj.email}</span>
                            </div>
                          )}
                          <div className="text-[11px] text-blue-600 dark:text-cyan-400 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{zone}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {skills.slice(0, 2).map((s: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize"
                              >
                                {s.replace("cat-", "")}
                              </span>
                            ))}
                            {skills.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{skills.length - 2}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {experienceYears} {experienceYears === 1 ? "yr" : "yrs"} experience
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              appStatus === "APPROVED"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                : appStatus === "PENDING"
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                                : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                            }`}
                          >
                            {appStatus === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                            {appStatus === "PENDING" && <Clock className="w-3 h-3" />}
                            {appStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              loginEnabled
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1E3A5F]"
                            }`}
                          >
                            <KeyRound className="w-3 h-3" />
                            {loginEnabled ? "ENABLED" : "DISABLED"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectingWorker(w)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#102A46] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#153456] transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="View full worker application details"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                              <span>View Details</span>
                            </button>

                            {appStatus === "PENDING" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveWorker(workerId)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectWorker(workerId)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-200 transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            ) : appStatus === "APPROVED" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleVerification(workerId, isVerified)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-[#102A46] text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                                >
                                  {isVerified ? "Revoke Badge" : "Grant Badge"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSuspendWorker(workerId)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                                >
                                  Suspend
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleReactivateWorker(workerId)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                              >
                                Reactivate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Booking Monitor & Cooperative Allotment */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          {/* Pending Allotments Alert Banner */}
          {pendingAllotmentCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                    Cooperative Allotment Queue: {pendingAllotmentCount} Service Request(s) Awaiting Worker Assignment
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300">
                    Customers have selected your regional cooperative. Match and allot certified, available workers according to skill certification and proximity.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookingStatusFilter("PENDING_ALLOTMENT")}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                Allot Pending ({pendingAllotmentCount})
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={e => setBookingSearch(e.target.value)}
                  placeholder="Search by ID, customer, worker, coop..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-xl outline-hidden bg-white dark:bg-[#102A46] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#102A46] border border-slate-200 dark:border-[#1E3A5F]">
                <button
                  type="button"
                  onClick={() => setBookingStatusFilter("ALL")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    bookingStatusFilter === "ALL"
                      ? "bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  All ({bookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingStatusFilter("PENDING_ALLOTMENT")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    bookingStatusFilter === "PENDING_ALLOTMENT"
                      ? "bg-amber-500 text-white shadow-2xs"
                      : "text-amber-700 dark:text-amber-400 hover:text-amber-800"
                  }`}
                >
                  Awaiting Allotment ({pendingAllotmentCount})
                </button>
                <button
                  type="button"
                  onClick={() => setBookingStatusFilter("ACTIVE")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    bookingStatusFilter === "ACTIVE"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Active Dispatches
                </button>
                <button
                  type="button"
                  onClick={() => setBookingStatusFilter("COMPLETED")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    bookingStatusFilter === "COMPLETED"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={bookingFilterZone}
                onChange={e => setBookingFilterZone(e.target.value)}
                className="text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-xl px-3 py-2 bg-white dark:bg-[#102A46] text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Zones</option>
                <option value="Zone A">Zone A</option>
                <option value="Zone B">Zone B</option>
                <option value="Zone C">Zone C</option>
                <option value="Zone D">Zone D</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B1F3A] rounded-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-[#102A46] text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#1E3A5F]">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Service & Zone</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Assigned Worker / Coop</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Allotment & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1E3A5F]">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        No service bookings match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => {
                      const isPendingAllotment = ["REQUESTED", "ACCEPTED", "SUBMITTED", "UNDER_REVIEW", "WORKERS_BEING_ALLOCATED"].includes(b.status);
                      const requiredWorkers = b.manpowerRequired || 1;

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-[#102A46]/60 transition-colors">
                          <td className="py-3 px-4 font-bold text-blue-600 dark:text-cyan-400">
                            #{b.bookingNumber}
                            {b.isEmergency && (
                              <span className="block text-[9px] text-red-600 dark:text-red-400 font-extrabold uppercase">
                                Emergency
                              </span>
                            )}
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 inline-flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              <span>{requiredWorkers} worker{requiredWorkers > 1 ? "s" : ""}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{b.categoryName}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.customerZone}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500">{b.scheduledDate} {b.scheduledTime}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{b.customerName}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.customerPhone}</div>
                          </td>
                          <td className="py-3 px-4">
                            {isPendingAllotment ? (
                              <div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                                  <Clock className="w-3 h-3" />
                                  <span>Unallotted ({requiredWorkers} needed)</span>
                                </span>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  Coop: {b.cooperativeName || "Regional"}
                                </div>
                              </div>
                            ) : (
                              <div>
                                {b.assignments && b.assignments.length > 0 ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 font-bold text-xs text-slate-800 dark:text-slate-200">
                                      <Users className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                                      <span>{b.assignments.length} Worker{b.assignments.length > 1 ? "s" : ""}:</span>
                                    </div>
                                    <div className="space-y-0.5">
                                      {b.assignments.map(a => (
                                        <div key={a.id} className="text-[11px] flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
                                          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[110px]">{a.workerName}</span>
                                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                            a.status === "COMPLETED" ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300" :
                                            a.status === "IN_PROGRESS" || a.status === "WORK_STARTED" ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300" :
                                            a.status === "ON_THE_WAY" || a.status === "APPROACHED" || a.status === "REACHED" ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300" :
                                            "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                          }`}>
                                            {a.status}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="font-semibold text-slate-800 dark:text-slate-200">{b.workerName || "Worker Assigned"}</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.workerPhone || "—"}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                            ₹{b.totalAmount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                                b.status === "COMPLETED"
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                  : b.status === "CANCELLED"
                                  ? "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                                  : b.status === "REQUESTED"
                                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                                  : b.status === "ACCEPTED"
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                  : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300"
                              }`}
                            >
                              {b.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {b.status === "REQUESTED" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptRequest(b.id)}
                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Accept Request</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectRequest(b.id)}
                                    className="px-2 py-1 rounded-lg text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : isPendingAllotment ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setAllottingBooking(b)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Allot ({requiredWorkers})</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectRequest(b.id)}
                                    className="px-2 py-1 rounded-lg text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : !["COMPLETED", "CANCELLED"].includes(b.status) ? (
                                <button
                                  type="button"
                                  onClick={() => setAllottingBooking(b)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-[#102A46] text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer inline-flex items-center gap-1"
                                >
                                  <UserCheck className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                                  <span>Re-allot ({requiredWorkers})</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Archived</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Welfare Pool & Audits */}
      {activeTab === "welfare" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cooperative Collective Fund Overview (5% Allocation)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every completed job allocates 5% towards the collective member welfare fund. This ensures guaranteed social security without burdening workers with private insurance costs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-[#102A46] border border-blue-100 dark:border-[#1E3A5F]">
                <span className="text-xs text-blue-800 dark:text-cyan-300 font-bold block">Current Pool Balance</span>
                <div className="text-2xl font-black text-blue-900 dark:text-white mt-1">
                  ₹{Math.round(totalWelfareFund)}
                </div>
                <span className="text-[10px] text-blue-600 dark:text-cyan-400 mt-0.5 block">Audit Status: Verified</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60">
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block">Ayushman Premiums Paid</span>
                <div className="text-2xl font-black text-emerald-900 dark:text-white mt-1">₹42,000</div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 block">280 workers covered</span>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/60">
                <span className="text-xs text-purple-800 dark:text-purple-300 font-bold block">Tool Grant Reserves</span>
                <div className="text-2xl font-black text-purple-900 dark:text-white mt-1">₹18,500</div>
                <span className="text-[10px] text-purple-700 dark:text-purple-400 mt-0.5 block">Next disbursement: Nov 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Audit Logs */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>Administrative Security & Lifecycle Audit Trail</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Immutable record of all worker approvals, credential transmissions, account suspensions, and governance actions.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchData}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#102A46] text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1E3A5F]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-[#102A46] text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#1E3A5F]">
                  <tr>
                    <th className="py-3 px-4">Timestamp (DD/MM/YYYY)</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4">Target Worker</th>
                    <th className="py-3 px-4">Administrator / Actor</th>
                    <th className="py-3 px-4">Audit Details & Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1E3A5F]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                        No audit records captured yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-[#102A46]/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {formatDateTime(log.createdAt || log.timestamp)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.action?.includes("APPROVED")
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                : log.action?.includes("CREDENTIAL")
                                ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300"
                                : log.action?.includes("SUSPEND")
                                ? "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {log.workerName || log.targetId || "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {log.adminName || log.actor || "Federation Admin"}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                          {log.details ? (typeof log.details === "object" ? JSON.stringify(log.details) : log.details) : "Verified in system"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Worker Application Details Modal */}
      {inspectingWorker && (() => {
        const workerObj = inspectingWorker.worker || inspectingWorker;
        const userObj = inspectingWorker.user || { name: "Worker", phone: "—", email: "—", avatarUrl: "" };
        const workerId = workerObj.id || inspectingWorker.id;
        const zone = workerObj.zone || inspectingWorker.currentZone || inspectingWorker.allocatedZone || "Zone A";
        const skills = (workerObj.skills || inspectingWorker.skills || []).map((s: any) =>
          typeof s === "string" ? s : s?.categoryId || s?.skillName || s?.name || ""
        );
        const certs = workerObj.certifications || inspectingWorker.certifications || [];
        const experienceYears = workerObj.experienceYears ?? inspectingWorker.experienceYears ?? 0;
        const appStatus = workerObj.applicationStatus || inspectingWorker.applicationStatus || "APPROVED";
        const isVerified = workerObj.isVerified ?? workerObj.isCooperativeVerified ?? inspectingWorker.isCooperativeVerified ?? false;
        const idProofType = workerObj.idProofType || inspectingWorker.idProofType || "Govt ID";
        const idProofNumber = workerObj.idProofNumber || inspectingWorker.idProofNumber || "Verified in record";
        const loginEnabled = workerObj.loginEnabled ?? (appStatus === "APPROVED");
        const availability = workerObj.availability || "Full-time Cooperative Roster";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1E3A5F] pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={userObj.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                    alt={userObj.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-[#1E3A5F]"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{userObj.name}</span>
                      {isVerified && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                          ✓ Verified
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Badge: {workerObj.badgeNumber || workerId}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectingWorker(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-[#102A46] p-3 rounded-xl border border-slate-200/60 dark:border-[#1E3A5F]">
                  <span className="text-slate-400 block text-[11px]">Mobile Phone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{userObj.phone || "—"}</span>
                </div>
                <div className="bg-slate-50 dark:bg-[#102A46] p-3 rounded-xl border border-slate-200/60 dark:border-[#1E3A5F]">
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 truncate block">{userObj.email || "—"}</span>
                </div>
                <div className="bg-slate-50 dark:bg-[#102A46] p-3 rounded-xl border border-slate-200/60 dark:border-[#1E3A5F]">
                  <span className="text-slate-400 block text-[11px]">Assigned Zone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{zone}</span>
                </div>
                <div className="bg-slate-50 dark:bg-[#102A46] p-3 rounded-xl border border-slate-200/60 dark:border-[#1E3A5F]">
                  <span className="text-slate-400 block text-[11px]">Experience</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{experienceYears} Years</span>
                </div>
                <div className="bg-slate-50 dark:bg-[#102A46] p-3 rounded-xl border border-slate-200/60 dark:border-[#1E3A5F]">
                  <span className="text-slate-400 block text-[11px]">Govt ID ({idProofType})</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">{idProofNumber}</span>
                </div>
                <div className="bg-slate-50 dark:bg-[#102A46] p-3 rounded-xl border border-slate-200/60 dark:border-[#1E3A5F]">
                  <span className="text-slate-400 block text-[11px]">Availability</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{availability}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Trade Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.length > 0 ? skills.map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-900 capitalize"
                    >
                      {s.replace("cat-", "")}
                    </span>
                  )) : (
                    <span className="text-xs text-slate-400 italic">No specific trades listed</span>
                  )}
                </div>
              </div>

              {certs.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Certifications</span>
                  <div className="space-y-1">
                    {certs.map((c: any, idx: number) => (
                      <div key={idx} className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#102A46] px-3 py-1.5 rounded-lg">
                        • {c.name || c.title || JSON.stringify(c)} ({c.issuer || "Verified"})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brief Explanation of Work & Tools */}
              {(workerObj.briefExplanation || workerObj.bio) && (
                <div className="bg-slate-50 dark:bg-[#102A46] p-3 rounded-xl border border-slate-200 dark:border-[#1E3A5F] text-xs space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">
                    Brief Explanation of Experience, Tools & Capacity
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                    {workerObj.briefExplanation || workerObj.bio}
                  </p>
                </div>
              )}

              {/* Uploaded Verification Documents */}
              {workerObj.documents && workerObj.documents.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Uploaded Verification Documents ({workerObj.documents.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {workerObj.documents.map((doc: any, dIdx: number) => (
                      <div
                        key={dIdx}
                        className="bg-slate-50 dark:bg-[#102A46] p-2.5 rounded-xl border border-slate-200 dark:border-[#1E3A5F] text-xs flex items-center justify-between"
                      >
                        <div className="truncate mr-2">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {doc.name || `Document ${dIdx + 1}`}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                            {doc.documentNumber || doc.fileName || "Verified File"}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 shrink-0">
                          ✓ File Attached
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-[#102A46] p-3 rounded-xl border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Application Status</span>
                  <span className={`font-bold ${appStatus === "APPROVED" ? "text-emerald-600 dark:text-emerald-400" : appStatus === "PENDING" ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                    {appStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Login Status</span>
                  <span className={`font-bold ${loginEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {loginEnabled ? "Active (Login Enabled)" : "Pending Review (Login Inactive)"}
                  </span>
                </div>
              </div>

              {appStatus === "PENDING" && (
                <div className="bg-blue-50/70 dark:bg-[#102A46]/80 p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-cyan-300">
                  <p>
                    <strong>Credential Security:</strong> The applicant created their secure password during registration. Approving will immediately activate their account and enable login access. No temporary password generation or credential dispatch is required.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#1E3A5F]">
                <button
                  type="button"
                  onClick={() => setInspectingWorker(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
                {appStatus === "PENDING" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleRejectWorker(workerId);
                        setInspectingWorker(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/60 hover:bg-red-200 transition-colors cursor-pointer"
                    >
                      Reject Application
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveWorker(workerId)}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                    >
                      Approve & Enable Login
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Worker Allotment Modal */}
      {allottingBooking && (
        <AllotWorkerModal
          booking={allottingBooking}
          token={token}
          onClose={() => setAllottingBooking(null)}
          onWorkerAllotted={async () => {
            setFeedback({ type: "success", message: `Worker successfully allotted to booking #${allottingBooking.bookingNumber}` });
            await fetchData();
          }}
        />
      )}
    </div>
  );
};
