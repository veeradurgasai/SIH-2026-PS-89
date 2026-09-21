import React, { useState, useEffect } from "react";
import { Booking, Worker } from "../../types";
import {
  X,
  UserCheck,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  Sparkles,
  AlertTriangle,
  Briefcase,
  Phone,
  CheckCircle2,
  Users,
  Check,
  DollarSign
} from "lucide-react";

interface AllotWorkerModalProps {
  booking: Booking;
  token?: string | null;
  onClose: () => void;
  onWorkerAllotted: () => void;
}

export const AllotWorkerModal: React.FC<AllotWorkerModalProps> = ({
  booking,
  token,
  onClose,
  onWorkerAllotted
}) => {
  const [loading, setLoading] = useState(true);
  const [recommendedWorkers, setRecommendedWorkers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requiredCount = booking.manpowerRequired || 1;
  const initialSelected = (booking.assignments && booking.assignments.length > 0)
    ? booking.assignments.map(a => a.workerId)
    : booking.workerId
    ? [booking.workerId]
    : [];

  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>(initialSelected);

  // Financial calculations for Cooperative Admin review
  const totalAmount = booking.customerTotalAmount || booking.totalAmount || 0;
  const federationCommission = Math.round(totalAmount * 0.10 * 100) / 100;
  const netWorkerPool = Math.round((totalAmount - federationCommission) * 100) / 100;
  const perWorkerPayout = requiredCount > 0 ? Math.round((netWorkerPool / requiredCount) * 100) / 100 : 0;

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch(`/api/admin/requests/${booking.id}/recommended-workers`, { headers });
        if (!res.ok) {
          throw new Error("Failed to load worker recommendations for this request.");
        }
        const data = await res.json();
        const rawList = data.recommendations || data.recommendedWorkers || [];
        // Problem 2: The newly registered worker must be below the list while alloting workers for a work
        const sorted = [...rawList].sort((a, b) => {
          const workerA = a.worker || a;
          const workerB = b.worker || b;
          const aIsNew =
            workerA.isNew === true ||
            workerA.isNewEmployee === true ||
            (workerA.completedJobsCount ?? workerA.completedJobs ?? 0) === 0 ||
            !workerA.rating ||
            (workerA.ratingCount ?? 0) === 0;
          const bIsNew =
            workerB.isNew === true ||
            workerB.isNewEmployee === true ||
            (workerB.completedJobsCount ?? workerB.completedJobs ?? 0) === 0 ||
            !workerB.rating ||
            (workerB.ratingCount ?? 0) === 0;

          if (!aIsNew && bIsNew) return -1; // Experienced worker above
          if (aIsNew && !bIsNew) return 1;  // Newly registered worker below
          const scoreA = Math.round(a.score ?? a.matchScore ?? 80);
          const scoreB = Math.round(b.score ?? b.matchScore ?? 80);
          return scoreB - scoreA;
        });
        setRecommendedWorkers(sorted);
      } catch (err: any) {
        setError(err.message || "Failed to load recommended workers.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [booking.id, token]);

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkerIds(prev => {
      if (prev.includes(workerId)) {
        return prev.filter(id => id !== workerId);
      } else {
        if (requiredCount === 1) {
          return [workerId];
        }
        if (prev.length >= requiredCount) {
          setError(`You have already selected ${requiredCount} workers. Deselect a worker first to choose another.`);
          return prev;
        }
        setError(null);
        return [...prev, workerId];
      }
    });
  };

  const handleAllotSubmit = async () => {
    if (selectedWorkerIds.length !== requiredCount) {
      setError(`Please select exactly ${requiredCount} worker${requiredCount > 1 ? "s" : ""} to fulfill this request (${selectedWorkerIds.length}/${requiredCount} selected).`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/admin/requests/${booking.id}/allot-workers`, {
        method: "POST",
        headers,
        body: JSON.stringify({ workerIds: selectedWorkerIds })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to allot workers to request.");
      }

      const data = await res.json();
      setSuccessMessage(data.message || `Successfully allotted ${selectedWorkerIds.length} worker(s)!`);
      setTimeout(() => {
        onWorkerAllotted();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Allotment failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150 text-left">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B1F3A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden my-8 transition-colors">
        {/* Header */}
        <div className="bg-[#0B1F3A] dark:bg-[#071426] text-white px-6 py-4 flex items-center justify-between border-b border-transparent dark:border-[#1E3A5F]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400">
                Booking #{booking.bookingNumber}
              </span>
              {booking.isEmergency && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  Emergency Priority
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-white mt-0.5">
              Allot Certified Workers ({requiredCount} Required)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Overview Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#102A46] border border-slate-200 dark:border-[#1E3A5F] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase text-slate-400 tracking-wider">
                Service Request Summary
              </span>
              <span className="font-bold text-blue-600 dark:text-cyan-400">
                {booking.categoryName} • Zone {booking.customerZone}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Customer:</span>
                <span className="font-bold text-slate-900 dark:text-white">{booking.customerName}</span> ({booking.customerPhone})
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Scheduled Time:</span>
                <span className="font-bold text-slate-900 dark:text-white">{booking.scheduledDate} at {booking.scheduledTime}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Required Manpower:</span>
                <span className="font-extrabold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>{requiredCount} Worker{requiredCount > 1 ? "s" : ""}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Customer Payable:</span>
                <span className="font-black text-slate-900 dark:text-white">₹{totalAmount}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 dark:text-slate-500 block">Address & Details:</span>
                <span>{booking.customerAddress}</span>
                <p className="text-slate-500 dark:text-slate-400 italic mt-0.5">&quot;{booking.description}&quot;</p>
              </div>
            </div>
          </div>

          {/* Internal Financial Distribution (Admin View Only) */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#102A46]/80 border border-blue-200 dark:border-[#1E3A5F] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-blue-700 dark:text-cyan-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Internal Financial Allocation Ledger</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Cooperative Admin Confidential
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
              <div className="p-2 bg-white dark:bg-[#0B1F3A] rounded-lg border border-slate-200 dark:border-[#1E3A5F]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Billed</div>
                <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">₹{totalAmount}</div>
              </div>
              <div className="p-2 bg-white dark:bg-[#0B1F3A] rounded-lg border border-slate-200 dark:border-[#1E3A5F]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Coop / Welfare (10%)</div>
                <div className="font-extrabold text-blue-700 dark:text-cyan-400 mt-0.5">₹{federationCommission}</div>
              </div>
              <div className="p-2 bg-white dark:bg-[#0B1F3A] rounded-lg border border-slate-200 dark:border-[#1E3A5F]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Worker Pool (90%)</div>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{netWorkerPool}</div>
              </div>
              <div className="p-2 bg-white dark:bg-[#0B1F3A] rounded-lg border border-slate-200 dark:border-[#1E3A5F]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Payout / Worker</div>
                <div className="font-black text-slate-900 dark:text-white mt-0.5">₹{perWorkerPayout} each</div>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Recommended Workers List */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>Domain Roster: {booking.categoryName} ({requiredCount} Required)</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Strict domain filter: Only workers certified in <strong>{booking.categoryName}</strong> who are not currently assigned to active jobs are displayed.
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 self-start sm:self-auto ${
                selectedWorkerIds.length === requiredCount
                  ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300"
              }`}>
                {selectedWorkerIds.length} of {requiredCount} Selected
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs">Finding available certified workers in domain &quot;{booking.categoryName}&quot;...</span>
              </div>
            ) : recommendedWorkers.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-[#102A46] rounded-xl border border-slate-200 dark:border-[#1E3A5F] text-xs text-slate-500 dark:text-slate-400 px-4">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No free workers found for domain &quot;{booking.categoryName}&quot; in {booking.customerZone}.</p>
                <p className="mt-1 text-[11px]">Workers in this domain are either currently assigned to an ongoing work or offline. Workers from other domains cannot be allotted to this request.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {recommendedWorkers.map((item, idx) => {
                  const worker = item.worker || item;
                  const isSelected = selectedWorkerIds.includes(worker.id);

                  // Calculate definitive match score for every worker in the list
                  const workerScore = Math.round(
                    item.score ??
                    item.matchScore ??
                    item.compositeScore ??
                    item.matchPercentage ??
                    (item.overallScore ? item.overallScore * 10 : 85)
                  );

                  // Determine if worker is a newly registered worker / employee
                  const isNewWorker =
                    worker.isNew === true ||
                    worker.isNewEmployee === true ||
                    !worker.rating ||
                    worker.rating === 0 ||
                    worker.completedJobs === 0 ||
                    worker.completedJobs === undefined ||
                    worker.completedJobs === null ||
                    worker.ratingCount === 0 ||
                    worker.ratingCount === undefined;

                  return (
                    <div
                      key={worker.id}
                      onClick={() => toggleWorkerSelection(worker.id)}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer shadow-2xs ${
                        isSelected
                          ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20"
                          : "bg-white dark:bg-[#102A46] border-slate-200 dark:border-[#1E3A5F] hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0B1F3A]"
                        }`}>
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {worker.name || worker.user?.name || "Trade Specialist"}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                              <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                              <span>Badge: {worker.badgeNumber || worker.id.slice(0, 8)}</span>
                            </span>

                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Domain: {booking.categoryName}</span>
                            </span>

                            {/* Show score on EVERY worker in the list */}
                            {idx === 0 ? (
                              <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Top Recommendation ({workerScore}%)</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                <span>Match Score: {workerScore}%</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            {/* In place of rating for new workers, show "New Worker / Employee" */}
                            {isNewWorker ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>New Worker / Employee</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                {worker.rating ? worker.rating.toFixed(1) : "4.9"} rating
                              </span>
                            )}

                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5" />
                              {isNewWorker ? "0 completed (New Entrant)" : `${worker.completedJobs || 0} completed`}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Active jobs: <strong>{worker.activeWorkload || 0}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {worker.zone || booking.customerZone}
                            </span>
                          </div>

                          {/* 4-Factor Weighted Requirement Tally */}
                          {item.tally && (
                            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-[#1E3A5F]/60">
                              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                                <span>Cooperative Match Tally</span>
                                <span className="text-blue-600 dark:text-cyan-400 font-extrabold">Score: {Math.round(item.compositeScore || 0)} / 100</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                                {item.tally.map((t: any, tidx: number) => (
                                  <div key={tidx} className="bg-slate-100/70 dark:bg-[#071426]/70 p-1.5 rounded-lg border border-slate-200/60 dark:border-[#1E3A5F]">
                                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold">
                                      <span className="truncate">{t.factor}</span>
                                      <span className="text-[9px] text-slate-400 font-mono">{t.weight}</span>
                                    </div>
                                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{t.score}</div>
                                    <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{t.note}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold transition-all inline-block ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-[#0B1F3A] text-slate-700 dark:text-slate-300"
                        }`}>
                          {isSelected ? "Selected" : "Select Worker"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {selectedWorkerIds.length === requiredCount ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Ready to dispatch {requiredCount} worker(s)
                </span>
              ) : (
                <span>Select {requiredCount - selectedWorkerIds.length} more worker(s) to fulfill quota</span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#102A46] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAllotSubmit}
                disabled={isSubmitting || selectedWorkerIds.length !== requiredCount}
                className="w-1/2 sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Confirm Allotment ({selectedWorkerIds.length}/{requiredCount})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
