import React, { useState, useEffect } from "react";
import { Booking, BookingStatus } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { InvoiceView } from "../common/InvoiceView";
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  CreditCard,
  Star,
  FileText,
  AlertCircle,
  Truck,
  Wrench,
  Sparkles,
  Users,
  RefreshCw,
  Award,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
  onStatusUpdated: () => void;
}

const TIMELINE_STEPS: { statusKey: string; label: string; icon: any }[] = [
  { statusKey: "REQUESTED", label: "Requested", icon: Clock },
  { statusKey: "APPROVED_BY_FEDERATION", label: "Approved", icon: ShieldCheck },
  { statusKey: "WORKERS_ALLOCATED", label: "Allotted", icon: Users },
  { statusKey: "WORKERS_ON_THE_WAY", label: "Approached", icon: Truck },
  { statusKey: "WORKERS_REACHED", label: "Reached", icon: MapPin },
  { statusKey: "IN_PROGRESS", label: "In Progress", icon: Wrench },
  { statusKey: "RESOLVED", label: "Resolved", icon: CheckCircle2 },
  { statusKey: "COMPLETED", label: "Completed", icon: Award }
];

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking: initialBooking,
  onClose,
  onStatusUpdated
}) => {
  const { token, user } = useAuth();
  const { bookingRefreshKey } = useApp();

  const [booking, setBooking] = useState<Booking>(initialBooking);
  const [showInvoice, setShowInvoice] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirmingCompletion, setIsConfirmingCompletion] = useState(false);

  // Rating form state
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [serviceQuality, setServiceQuality] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  // Payment processing state
  const [isPaying, setIsPaying] = useState(false);

  const refreshBooking = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
          setBooking(data.booking);
          onStatusUpdated();
        }
      }
    } catch (err) {
      console.error("Failed to refresh booking:", err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  // Instant refresh on SSE realtime broadcast from other devices
  useEffect(() => {
    refreshBooking(true);
  }, [bookingRefreshKey]);

  // High-frequency polling fallback (2.5 seconds) for multi-device sync
  useEffect(() => {
    const timer = setInterval(() => {
      refreshBooking(true);
    }, 2500);
    return () => clearInterval(timer);
  }, [booking.id, token]);

  const getStatusStepIndex = (st: BookingStatus) => {
    switch (st) {
      case "SUBMITTED":
      case "UNDER_REVIEW":
      case "REQUESTED":
      case "MATCHED":
        return 0;
      case "ACCEPTED":
      case "APPROVED_BY_FEDERATION":
        return 1;
      case "WORKER_ALLOTTED":
      case "WORKERS_ALLOCATED":
      case "SENDING_WORKERS":
      case "WE_ARE_COMING":
        return 2;
      case "ON_THE_WAY":
      case "WORKERS_ON_THE_WAY":
        return 3;
      case "REACHED":
      case "WORKERS_REACHED":
        return 4;
      case "IN_PROGRESS":
      case "WORK_STARTED":
        return 5;
      case "RESOLVED":
        return 6;
      case "COMPLETED":
        return 7;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStatusStepIndex(booking.status);

  // Customer proceed to confirmation
  const handleConfirmCompletion = async () => {
    setIsConfirmingCompletion(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/confirm-completion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ customerId: user?.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
          setBooking(data.booking);
        }
        onStatusUpdated();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Confirm completion failed:", errData);
      }
    } catch (err) {
      console.error("Failed to confirm completion:", err);
    } finally {
      setIsConfirmingCompletion(false);
    }
  };

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, paymentMethod: "DEMO_UPI" })
      });
      if (res.ok) {
        const data = await res.json();
        setBooking(data.booking);
        onStatusUpdated();
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        setShowInvoice(true);
      }
    } catch (e) {
      console.error("Payment error:", e);
    } finally {
      setIsPaying(false);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          overallRating: serviceQuality,
          serviceQuality,
          punctuality,
          professionalism,
          comment: ratingComment || "Punctual, cooperative verified professional. Great experience!"
        })
      });
      if (res.ok) {
        setRatingSubmitted(true);
        setShowRatingForm(false);
        onStatusUpdated();
      }
    } catch (e) {
      console.error("Rating error:", e);
    }
  };

  if (showInvoice) {
    return <InvoiceView booking={booking} onClose={() => setShowInvoice(false)} />;
  }

  const assignedWorkers = booking.assignments && booking.assignments.length > 0
    ? booking.assignments
    : booking.workerId
    ? [{
        id: "asgn-legacy",
        bookingId: booking.id,
        workerId: booking.workerId,
        workerName: booking.workerName || "Assigned Worker",
        workerPhone: booking.workerPhone || "Verified Contact",
        workerBadgeNumber: "COOP-CERT",
        status: (booking.status === "ON_THE_WAY" ? "ON_THE_WAY" : booking.status === "IN_PROGRESS" ? "WORK_STARTED" : booking.status === "COMPLETED" ? "RESOLVED" : "ACCEPTED") as any,
        allottedAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150 text-left">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B1F3A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden my-8 transition-colors">
        {/* Header */}
        <div className="bg-[#0B1F3A] dark:bg-[#071426] text-white px-6 py-4 flex items-center justify-between border-b border-transparent dark:border-[#1E3A5F]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400">
                Request #{booking.bookingNumber || booking.id}
              </span>
              {booking.isEmergency && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  Emergency Priority
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-white mt-0.5">
              {booking.categoryName} Service Tracker
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshBooking(false)}
              disabled={isRefreshing}
              title="Refresh real-time status from database"
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Timeline Stepper */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#102A46] border border-slate-200 dark:border-[#1E3A5F]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Service Request Lifecycle
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Reflecting authoritative database progress
                </span>
              </div>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300">
                {booking.status.replace(/_/g, " ")}
              </span>
            </div>

            {/* Stepper bar */}
            <div className="relative flex items-center justify-between pt-2 pb-1">
              <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-[#1E3A5F] z-0" />
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 h-1 bg-blue-600 dark:bg-cyan-500 transition-all duration-500 z-0"
                style={{ width: `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
              />

              {TIMELINE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.statusKey} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-cyan-900/50 scale-110"
                          : isPassed
                          ? "bg-blue-600 dark:bg-cyan-600 text-white"
                          : "bg-white dark:bg-[#0B1F3A] text-slate-400 dark:text-slate-500 border-2 border-slate-300 dark:border-[#1E3A5F]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-[9px] sm:text-[10px] mt-1.5 font-bold text-center max-w-[55px] sm:max-w-[70px] ${
                        isCurrent
                          ? "text-blue-600 dark:text-cyan-400 font-extrabold"
                          : isPassed
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allocated Workforce Section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E3A5F] bg-white dark:bg-[#102A46] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span className="font-extrabold uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                  Allocated Workforce ({assignedWorkers.length} of {booking.manpowerRequired || 1} Deployed)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-cyan-300">
                {booking.cooperativeName || "Cooperative Assigned"}
              </span>
            </div>

            {assignedWorkers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {assignedWorkers.map(asgn => (
                  <div
                    key={asgn.id || asgn.workerId}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 flex items-center justify-center font-bold text-sm shrink-0">
                      {(asgn.workerName || "W").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {asgn.workerName}
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase shrink-0">
                          {asgn.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{asgn.workerPhone || "Cooperative Verified Contact"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-cyan-400 font-semibold mt-0.5">
                        <Award className="w-3 h-3" />
                        <span>Badge: {asgn.workerBadgeNumber || "COOP-CERT"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center space-y-1 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 p-4">
                <div className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Awaiting Cooperative Workforce Allocation</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  The Cooperative Administrator is currently reviewing trade requirements to allot {booking.manpowerRequired || 1} accredited workers.
                </p>
              </div>
            )}
          </div>

          {/* Schedule and Location */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E3A5F] bg-white dark:bg-[#102A46] space-y-2 text-xs">
            <span className="font-extrabold uppercase text-slate-400 tracking-wider">
              Service Details & Location
            </span>
            <div className="flex items-start gap-2 pt-1 text-slate-800 dark:text-slate-200">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-cyan-400 mt-0.5 shrink-0" />
              <span>{booking.customerAddress} ({booking.customerZone})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Scheduled: {booking.scheduledDate} at {booking.scheduledTime}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 italic mt-1">"{booking.description}"</p>
          </div>

          {/* Admin Note if available */}
          {booking.adminNote && (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs">
              <div className="font-bold text-blue-900 dark:text-cyan-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Message from Cooperative Federation Admin:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-200">{booking.adminNote}</p>
            </div>
          )}

          {/* Citizen Confirmation / Proceed to Complete Service */}
          {booking.status !== "COMPLETED" && (
            booking.status === "RESOLVED" ||
            booking.status === "IN_PROGRESS" ||
            booking.status === "WORK_STARTED" ||
            (booking.assignments && booking.assignments.some(a => a.status === "RESOLVED" || a.status === "WORK_STARTED"))
          ) && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 dark:border-emerald-500/60 shadow-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                    {booking.status === "RESOLVED" 
                      ? "Work Has Been Resolved! Are you satisfied with the service?" 
                      : "Service in Progress / Nearing Completion"}
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                    Cooperative artisans are deployed on your service order. Once you are satisfied with the work done, press proceed to confirm completion.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  Authoritative citizen sign-off protocol
                </span>
                <button
                  id="btn-proceed-service-completion"
                  onClick={handleConfirmCompletion}
                  disabled={isConfirmingCompletion}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isConfirmingCompletion ? "Recording Confirmation..." : "Proceed & Confirm Completion"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Completed State Banner */}
          {booking.status === "COMPLETED" && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-extrabold text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Service Order Completed & Verified by Citizen!</span>
              </div>
              <button
                onClick={() => setShowInvoice(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Invoice</span>
              </button>
            </div>
          )}

          {/* Pricing & Invoicing - STRICT SINGLE FINAL AMOUNT FOR CUSTOMER */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#102A46] border border-blue-100 dark:border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Total Service Payable Amount</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                ₹{(booking.customerTotalAmount || booking.totalAmount || 0).toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                All-inclusive standardized cooperative tariff ({booking.manpowerRequired || 1} worker{(booking.manpowerRequired || 1) > 1 ? "s" : ""})
              </div>
            </div>

            <div className="flex items-center gap-2">
              {booking.paymentStatus === "PAID" ? (
                <button
                  onClick={() => setShowInvoice(true)}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#0B1F3A] border border-blue-300 dark:border-cyan-800 hover:bg-blue-50 dark:hover:bg-[#153457] text-blue-700 dark:text-cyan-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Official Invoice</span>
                </button>
              ) : booking.status === "COMPLETED" ? (
                <button
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isPaying ? "Settling..." : `Pay Now (₹${(booking.customerTotalAmount || booking.totalAmount || 0).toFixed(2)})`}</span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0B1F3A] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E3A5F]">
                  Payment due on completion
                </span>
              )}
            </div>
          </div>

          {/* Rating Section (If Completed) */}
          {booking.status === "COMPLETED" && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E3A5F] bg-slate-50/50 dark:bg-[#102A46]">
              {booking.ratingId || ratingSubmitted ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Thank you! Your feedback has been recorded and updated the cooperative network.</span>
                </div>
              ) : !showRatingForm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Rate Cooperative Service
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Your rating directly impacts worker welfare points and cooperative quality rankings.
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRatingForm(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Rate Service</span>
                  </button>
                </div>
              ) : (
                /* Rating Form */
                <form onSubmit={handleRatingSubmit} className="space-y-3 pt-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Submit Cooperative Feedback
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Service Quality</label>
                      <select
                        value={serviceQuality}
                        onChange={e => setServiceQuality(Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-300 dark:border-[#1E3A5F] rounded-md bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white text-xs"
                      >
                        <option value={5}>5 ★ - Outstanding</option>
                        <option value={4}>4 ★ - Very Good</option>
                        <option value={3}>3 ★ - Acceptable</option>
                        <option value={2}>2 ★ - Needs Improvement</option>
                        <option value={1}>1 ★ - Unsatisfactory</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Punctuality</label>
                      <select
                        value={punctuality}
                        onChange={e => setPunctuality(Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-300 dark:border-[#1E3A5F] rounded-md bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white text-xs"
                      >
                        <option value={5}>5 ★ - Exact Time</option>
                        <option value={4}>4 ★ - 5-10m Delay</option>
                        <option value={3}>3 ★ - Delayed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Professionalism</label>
                      <select
                        value={professionalism}
                        onChange={e => setProfessionalism(Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-300 dark:border-[#1E3A5F] rounded-md bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white text-xs"
                      >
                        <option value={5}>5 ★ - Highly Courteous</option>
                        <option value={4}>4 ★ - Good Demeanor</option>
                        <option value={3}>3 ★ - Neutral</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Comments</label>
                    <input
                      type="text"
                      value={ratingComment}
                      onChange={e => setRatingComment(e.target.value)}
                      placeholder="e.g. Arrived on time with proper tools. Cleaned up afterwards."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg outline-hidden bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRatingForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#153457] rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer"
                    >
                      Submit Rating
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
