import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Booking, Worker, User } from "../../types";
import {
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  HeartHandshake,
  DollarSign,
  AlertTriangle,
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import confetti from "canvas-confetti";

export const WorkerDashboard: React.FC = () => {
  const { user, token } = useAuth();

  const [workerData, setWorkerData] = useState<Worker | null>(null);
  const [workerBookings, setWorkerBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"jobs" | "earnings" | "welfare" | "profile">("jobs");

  // Status toggle
  const [isAvailable, setIsAvailable] = useState(true);

  // Multi-profession state (Problem 2: Worker can set one or more works as profession)
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [isSavingProfessions, setIsSavingProfessions] = useState(false);
  const [professionSuccessMsg, setProfessionSuccessMsg] = useState<string | null>(null);

  // New skill input
  const [newSkillName, setNewSkillName] = useState("");

  const fetchWorkerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const authHeaders: Record<string, string> = {};
      if (token) authHeaders["Authorization"] = `Bearer ${token}`;

      // First try dedicated /api/worker/me endpoint
      try {
        const meRes = await fetch("/api/worker/me", { headers: authHeaders });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.worker) {
            setWorkerData(meData.worker);
            setIsAvailable(meData.worker.status === "available");
          }
        }
      } catch (e) {
        // Fallback below
      }

      if (!workerData) {
        const res = await fetch("/api/workers");
        if (res.ok) {
          const data = await res.json();
          const workersList = Array.isArray(data.workers) ? data.workers : [];
          const found = workersList.find((w: any) => 
            w?.user?.id === user.id || 
            w?.userId === user.id || 
            w?.worker?.userId === user.id
          );
          if (found) {
            const targetWorker = found.worker || found;
            setWorkerData(targetWorker);
            setIsAvailable(targetWorker?.status === "available");
          } else if (workersList.length > 0) {
            // fallback to first worker for demonstration if needed
            const firstWorker = workersList[0]?.worker || workersList[0];
            if (firstWorker) {
              setWorkerData(firstWorker);
              setIsAvailable(firstWorker?.status === "available");
            }
          }
        }
      }

      // Fetch bookings for this worker
      const bookRes = await fetch(`/api/bookings?workerId=${user.id}`, { headers: authHeaders });
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setWorkerBookings(bookData.bookings || []);
      }
    } catch (e) {
      console.error("Failed to fetch worker information:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, [user, token]);

  useEffect(() => {
    if (workerData?.skills && workerData.skills.length > 0) {
      setSelectedProfessions(workerData.skills);
    }
  }, [workerData]);

  const toggleProfession = (profId: string) => {
    setSelectedProfessions(prev => {
      if (prev.includes(profId)) {
        if (prev.length === 1) return prev; // At least one trade profession must be maintained
        return prev.filter(p => p !== profId);
      } else {
        return [...prev, profId];
      }
    });
  };

  const handleSaveProfessions = async () => {
    setIsSavingProfessions(true);
    setProfessionSuccessMsg(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/worker/professions", {
        method: "POST",
        headers,
        body: JSON.stringify({ skillIds: selectedProfessions })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfessionSuccessMsg("Professions successfully updated! Your cooperative profile is synchronized.");
        if (workerData) {
          setWorkerData({
            ...workerData,
            skills: selectedProfessions
          });
        }
        setTimeout(() => setProfessionSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error("Failed to update professions:", e);
    } finally {
      setIsSavingProfessions(false);
    }
  };

  const toggleAvailability = async () => {
    if (!workerData) return;
    const newStatus = isAvailable ? "busy" : "available";
    setIsAvailable(!isAvailable);
    try {
      await fetch(`/api/workers/${workerData.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      setWorkerData({ ...workerData, status: newStatus });
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Call secure assignment-status endpoint
      const res = await fetch(`/api/bookings/${bookingId}/assignment-status`, {
        method: "POST",
        headers,
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        await fetch(`/api/bookings/${bookingId}/status`, {
          method: "POST",
          headers,
          body: JSON.stringify({ status, note: `Worker transitioned status to ${status}` })
        });
      }

      if (status === "RESOLVED" || status === "COMPLETED") {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      }
      await fetchWorkerData();
    } catch (e) {
      console.error("Error updating booking:", e);
    }
  };

  // Categorize jobs
  const requestedJobs = workerBookings.filter(b => 
    b.status === "REQUESTED" || b.status === "MATCHED" || b.status === "APPROVED_BY_FEDERATION"
  );
  const activeJobs = workerBookings.filter(b => 
    [
      "ACCEPTED",
      "WORKER_ALLOTTED",
      "WORKERS_ALLOCATED",
      "SENDING_WORKERS",
      "WE_ARE_COMING",
      "ON_THE_WAY",
      "WORKERS_ON_THE_WAY",
      "APPROACHED",
      "REACHED",
      "WORKERS_REACHED",
      "IN_PROGRESS",
      "WORK_STARTED",
      "RESOLVED"
    ].includes(b.status)
  );
  const completedJobs = workerBookings.filter(b => b.status === "COMPLETED");

  // Earnings calculations
  const totalGross = completedJobs.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalNet = completedJobs.reduce((sum, b) => sum + (b.workerNetEarnings || 0), 0);
  const totalCoopContribution = completedJobs.reduce((sum, b) => sum + (b.cooperativeFee || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Top Banner & Worker Status Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F3B66] text-white border border-[#144473] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#144473] text-cyan-300 text-xs font-bold border border-[#1E4E7A]">
              <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
              <span>Cooperative Certified Member</span>
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Shramik Sahakari Sangha (Bengaluru)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {user?.name || "Ravi Kumar"} • Master Plumber
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-200 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-white">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {workerData?.rating ? workerData.rating.toFixed(2) : "4.92"} Rating
            </span>
            <span>•</span>
            <span>{workerData?.completedJobsCount || completedJobs.length} Jobs Completed</span>
            <span>•</span>
            <span>Assigned Area: <strong className="text-cyan-300">{workerData?.zone || user?.zone || "Zone A"}</strong></span>
          </div>
        </div>

        {/* Availability Toggle & Quick Metrics */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          {/* Toggle pill */}
          <button
            onClick={toggleAvailability}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer shadow-xs ${
              isAvailable
                ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60"
                : "bg-amber-950/60 border-amber-500/60 text-amber-300 hover:bg-amber-900/60"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span>{isAvailable ? "Status: Available for Work" : "Status: Busy / On Break"}</span>
          </button>

          <div className="p-3 rounded-2xl bg-[#144473]/80 border border-[#1E4E7A] text-center min-w-[120px]">
            <span className="text-[11px] font-semibold text-slate-200">Net Take-Home</span>
            <div className="text-lg font-black text-[#06B6D4]">₹{Math.round(totalNet)}</div>
            <span className="text-[10px] text-emerald-400 font-bold">95% Retained</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1E3A5F] gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === "jobs"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Active & New Jobs ({requestedJobs.length + activeJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("earnings")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === "earnings"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Earnings & Payouts (95%)</span>
        </button>

        <button
          onClick={() => setActiveTab("welfare")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === "welfare"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Cooperative Welfare & Insurance</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === "profile"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Skills & Certifications</span>
        </button>
      </div>

      {/* Tab 1: Active & New Jobs */}
      {activeTab === "jobs" && (
        <div className="space-y-6">
          {/* Section: Incoming Job Requests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Incoming Job Requests</span>
                {requestedJobs.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    {requestedJobs.length}
                  </span>
                )}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Matched based on your zone, skills and certification
              </span>
            </div>

            {requestedJobs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0B1F3A] rounded-2xl border border-slate-200 dark:border-[#1E3A5F] text-slate-500 dark:text-slate-400 text-xs">
                No new pending job requests. You will be notified immediately when a nearby household requests your craft.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requestedJobs.map(job => (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-blue-300 dark:border-[#1E3A5F] shadow-sm space-y-4 hover:border-blue-500 dark:hover:border-cyan-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">
                            #{job.bookingNumber}
                          </span>
                          {job.isEmergency && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Emergency
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base mt-1">
                          {job.categoryName} Service
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          ₹{job.workerNetEarnings.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Net Payout</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#102A46] p-2.5 rounded-xl border border-slate-100 dark:border-[#1E3A5F]/60">
                      "{job.description}"
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{job.customerAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Schedule: {job.scheduledDate} ({job.scheduledTime})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span>Customer: {job.customerName} ({job.customerPhone})</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateBookingStatus(job.id, "ACCEPTED")}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Job</span>
                      </button>
                      <button
                        onClick={() => updateBookingStatus(job.id, "CANCELLED")}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#102A46] hover:bg-slate-200 dark:hover:bg-[#153457] text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Active Ongoing Jobs */}
          <div className="pt-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Active Ongoing Jobs ({activeJobs.length})
            </h3>

            {activeJobs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0B1F3A] rounded-2xl border border-slate-200 dark:border-[#1E3A5F] text-slate-500 dark:text-slate-400 text-xs">
                You have no active ongoing jobs in progress.
              </div>
            ) : (
              <div className="space-y-4">
                {activeJobs.map(job => (
                  <div
                    key={job.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#1E3A5F]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">
                            #{job.bookingNumber}
                          </span>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300">
                            {job.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                          {job.categoryName} — {job.customerName}
                        </h4>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Earnings</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{job.workerNetEarnings.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300">
                      <div>
                        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                          Location
                        </span>
                        <div className="flex items-start gap-1.5 font-medium">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                          <span className="text-slate-800 dark:text-slate-200">{job.customerAddress} ({job.customerZone})</span>
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                          Customer Phone & Note
                        </span>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-800 dark:text-slate-200">{job.customerPhone}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 italic mt-1">"{job.description}"</p>
                      </div>
                    </div>

                    {/* Progression Action Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-[#1E3A5F] flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Current Step: <strong className="text-slate-800 dark:text-slate-200">{job.status.replace(/_/g, " ")}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {(["WORKER_ALLOTTED", "WORKERS_ALLOCATED", "SENDING_WORKERS", "WE_ARE_COMING", "ACCEPTED"].includes(job.status)) && (
                          <button
                            onClick={() => updateBookingStatus(job.id, "APPROACHED")}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                          >
                            Mark "Approached" (On The Way)
                          </button>
                        )}
                        {(["APPROACHED", "ON_THE_WAY", "WORKERS_ON_THE_WAY"].includes(job.status)) && (
                          <button
                            onClick={() => updateBookingStatus(job.id, "REACHED")}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                          >
                            Mark "Reached Location"
                          </button>
                        )}
                        {(["REACHED", "WORKERS_REACHED"].includes(job.status)) && (
                          <button
                            onClick={() => updateBookingStatus(job.id, "WORK_STARTED")}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                          >
                            Start Service (Work Started)
                          </button>
                        )}
                        {(["WORK_STARTED", "IN_PROGRESS"].includes(job.status)) && (
                          <button
                            onClick={() => updateBookingStatus(job.id, "RESOLVED")}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark Work Resolved</span>
                          </button>
                        )}
                        {job.status === "RESOLVED" && (
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Resolved (Awaiting Citizen Confirmation)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Earnings & Payouts (95%) */}
      {activeTab === "earnings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Gross Billed
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                ₹{totalGross.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across all completed services</p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Net Disbursed (95%)
              </span>
              <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">
                ₹{totalNet.toFixed(2)}
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">Directly into bank account via DBT</p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 shadow-xs">
              <span className="text-xs font-bold text-blue-800 dark:text-cyan-300 uppercase tracking-wider">
                Cooperative Welfare Fund (5%)
              </span>
              <div className="text-3xl font-extrabold text-blue-700 dark:text-cyan-400 mt-2">
                ₹{totalCoopContribution.toFixed(2)}
              </div>
              <p className="text-xs text-blue-700 dark:text-cyan-300 mt-1">Supports health insurance & tools</p>
            </div>
          </div>

          {/* Transparent Ledger Table */}
          <div className="bg-white dark:bg-[#0B1F3A] rounded-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-200 dark:border-[#1E3A5F] flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Completed Service Ledger</h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">100% transparent cooperative ledger</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-[#102A46] text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#1E3A5F]">
                  <tr>
                    <th className="py-3 px-4">Booking</th>
                    <th className="py-3 px-4">Service & Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Gross Total</th>
                    <th className="py-3 px-4 text-right">Coop Fee (5%)</th>
                    <th className="py-3 px-4 text-right">Net Payout (95%)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1E3A5F]">
                  {completedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">
                        No completed jobs yet. Accept bookings to start accumulating earnings!
                      </td>
                    </tr>
                  ) : (
                    completedJobs.map(job => (
                      <tr key={job.id} className="hover:bg-slate-50/70 dark:hover:bg-[#102A46]/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-blue-600 dark:text-cyan-400">#{job.bookingNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{job.categoryName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{job.customerName}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{job.scheduledDate}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                          ₹{job.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-blue-600 dark:text-cyan-400 font-medium">
                          -₹{job.cooperativeFee.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                          ₹{job.workerNetEarnings.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            Disbursed
                          </span>
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

      {/* Tab 3: Cooperative Welfare & Benefits */}
      {activeTab === "welfare" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <HeartHandshake className="w-7 h-7 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  Cooperative Member Social Protection
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  As a cooperative member, you are protected by comprehensive health, pension, and emergency relief funds funded by our 5% collective pool.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ayushman Health Insurance</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Hospitalization coverage up to ₹5,00,000 for your family across empaneled hospitals.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Policy Active (No: AB-COOP-8821)</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cooperative Pension Reserve</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Accumulated savings with interest from cooperative matching contributions.
              </p>
              <div className="pt-2 text-xs font-bold text-blue-600 dark:text-cyan-400">
                Current Balance: ₹14,250.00
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tool Replacement Grant</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Annual ₹5,000 grant for upgrading power tools, safety kits, and measurement equipment.
              </p>
              <div className="pt-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                Grant Eligible for 2026
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Skills & Certifications */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-4">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Verified Technical Certifications
            </h4>
            <div className="space-y-3">
              {[
                { title: "NSQF Level 4 - Master Plumbing Specialist", issuer: "National Skill Development Corporation (NSDC)", date: "Valid until Dec 2027" },
                { title: "Water Supply & High-Pressure Drainage Certified", issuer: "Karnataka Skill Commission", date: "Verified" },
                { title: "Cooperative Ethical Service & Customer Safety Standards", issuer: "Shramik Sahakari Sangha", date: "Lifetime" }
              ].map((cert, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-[#102A46] border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{cert.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{cert.issuer}</div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 dark:text-cyan-300 bg-blue-100 dark:bg-blue-950/80 px-2.5 py-1 rounded-md">
                    {cert.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Problem 2: Worker can set one or more works as his or her profession */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1E3A5F] pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                  <span>My Registered Professions & Works</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Set one or more works as your recognized profession. You will only be allotted to jobs matching your registered domains.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveProfessions}
                disabled={isSavingProfessions}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
              >
                {isSavingProfessions ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Professions</span>
                  </>
                )}
              </button>
            </div>

            {professionSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{professionSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                { id: "cat-plumbing", name: "Plumbing", desc: "Pipes, faucets, leakages, sanitary works" },
                { id: "cat-electrical", name: "Electrical", desc: "Wiring, fixtures, short circuits, switchboards" },
                { id: "cat-carpentry", name: "Carpentry", desc: "Furniture, hinges, wooden frames, door repair" },
                { id: "cat-painting", name: "Painting", desc: "Interior, exterior wall painting & touchups" },
                { id: "cat-cleaning", name: "Cleaning", desc: "Deep cleaning, sanitization & housekeeping" },
                { id: "cat-caregiving", name: "Caregiving", desc: "Elderly support, nursing & patient care" },
                { id: "cat-driving", name: "Driving", desc: "Chauffeur, vehicle transit & parcel deliveries" },
                { id: "cat-gardening", name: "Gardening", desc: "Lawn care, pruning & terrace gardening" },
                { id: "cat-technician", name: "Technician", desc: "AC, refrigerator, washing machine & appliances" }
              ].map(trade => {
                const isSelected = selectedProfessions.includes(trade.id);
                return (
                  <button
                    key={trade.id}
                    type="button"
                    onClick={() => toggleProfession(trade.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 dark:border-cyan-500 shadow-xs"
                        : "bg-slate-50 dark:bg-[#102A46] border-slate-200 dark:border-[#1E3A5F] hover:border-slate-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? "text-blue-900 dark:text-cyan-300" : "text-slate-700 dark:text-slate-300"}`}>
                        {trade.name}
                      </span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                      }`}>
                        {isSelected ? "Active" : "+ Add"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                      {trade.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
