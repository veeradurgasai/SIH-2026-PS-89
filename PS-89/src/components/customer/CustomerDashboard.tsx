import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { Booking, ServiceCategory, RankedWorker, Cooperative } from "../../types";
import { FindServiceView } from "./FindServiceView";
import { CooperativeSelectionView } from "./CooperativeSelectionView";
import { MatchingView } from "./MatchingView";
import { BookingDetailModal } from "./BookingDetailModal";
import { PaymentModal } from "./PaymentModal";
import { InvoiceView } from "../common/InvoiceView";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  FileText,
  CreditCard,
  Star,
  PlusCircle,
  Briefcase,
  History,
  ShieldCheck,
  RotateCcw,
  Building2,
  Wallet,
  X
} from "lucide-react";
import confetti from "canvas-confetti";

export const CustomerDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { categories, selectedBookingForDetail, setSelectedBookingForDetail, bookingRefreshKey } = useApp();

  const [activeTab, setActiveTab] = useState<"book" | "active" | "history" | "payments">("book");
  const [subView, setSubView] = useState<"form" | "cooperatives" | "matching">("form");

  // Matching results state
  const [matchingCategory, setMatchingCategory] = useState<ServiceCategory | null>(null);
  const [matchingCriteria, setMatchingCriteria] = useState<any>(null);
  const [rankedWorkers, setRankedWorkers] = useState<RankedWorker[]>([]);

  // Bookings list state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeInvoiceBooking, setActiveInvoiceBooking] = useState<Booking | null>(null);
  const [successPopupBooking, setSuccessPopupBooking] = useState<Booking | null>(null);

  // Pre-booking payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingBookingPayload, setPendingBookingPayload] = useState<{
    type: "coop" | "worker";
    target: any;
    category: ServiceCategory;
    criteria: any;
    totalAmount: number;
  } | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    setLoadingBookings(true);
    try {
      const res = await fetch(`/api/bookings?customerId=${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error("Failed to load customer bookings:", e);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Synchronize immediately on user, token, and realtime SSE broadcast
  useEffect(() => {
    fetchBookings();
  }, [user, token, bookingRefreshKey]);

  // Handle cooperative selection with mandatory pre-booking payment
  const handleSelectCooperative = async (coop: Cooperative) => {
    if (!matchingCategory || !matchingCriteria) return;

    const manpower = Math.max(1, Math.floor(matchingCriteria.manpowerRequired || 1));
    const durationHours = matchingCategory.avgDurationHours || 1.5;
    const baseAmt = Math.round(matchingCategory.baseRatePerHour * durationHours * manpower);
    const emergFee = matchingCriteria.isEmergency ? Math.round(baseAmt * 0.4) : 0;
    const total = baseAmt + emergFee;

    setPendingBookingPayload({
      type: "coop",
      target: coop,
      category: matchingCategory,
      criteria: matchingCriteria,
      totalAmount: total
    });
    setIsPaymentModalOpen(true);
  };

  // Handle worker selection from MatchingView with mandatory pre-booking payment
  const handleSelectWorker = async (worker: RankedWorker) => {
    if (!matchingCategory || !matchingCriteria) return;

    const manpower = Math.max(1, Math.floor(matchingCriteria.manpowerRequired || 1));
    const durationHours = matchingCategory.avgDurationHours || 1.5;
    const baseAmt = Math.round(matchingCategory.baseRatePerHour * durationHours * manpower);
    const emergFee = matchingCriteria.isEmergency ? Math.round(baseAmt * 0.4) : 0;
    const total = baseAmt + emergFee;

    setPendingBookingPayload({
      type: "worker",
      target: worker,
      category: matchingCategory,
      criteria: matchingCriteria,
      totalAmount: total
    });
    setIsPaymentModalOpen(true);
  };

  // Complete payment and finalize the booking without disturbing the remaining process
  const handlePaymentComplete = async (paymentDetails: { paymentMethod: string; paymentTransactionId: string }) => {
    if (!pendingBookingPayload) return;
    setIsPaymentModalOpen(false);

    const { type, target, category, criteria } = pendingBookingPayload;

    try {
      const body: any = {
        categoryId: category.id,
        description: criteria.description,
        customerAddress: criteria.customerAddress,
        customerZone: criteria.zone,
        scheduledDate: criteria.scheduledDate,
        scheduledTime: criteria.scheduledTime,
        isEmergency: criteria.isEmergency,
        manpowerRequired: criteria.manpowerRequired || 1,
        photos: criteria.photos,
        paymentStatus: "PAID",
        paymentMethod: paymentDetails.paymentMethod,
        paymentTransactionId: paymentDetails.paymentTransactionId
      };

      if (type === "coop") {
        body.cooperativeId = target.id;
      } else {
        body.workerId = target.worker.id;
        body.matchScore = target.overallScore;
        body.matchReasons = target.reasons;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
        await fetchBookings();
        setSubView("form");
        if (data.booking) {
          setSuccessPopupBooking(data.booking);
        }
      }
    } catch (e) {
      console.error("Booking creation error after payment:", e);
    } finally {
      setPendingBookingPayload(null);
    }
  };

  const activeBookings = bookings.filter(
    b => b.status !== "COMPLETED" && b.status !== "CANCELLED"
  );
  const completedBookings = bookings.filter(b => b.status === "COMPLETED");

  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const filteredBookings = bookings.filter(b => {
    const workerLabel = b.workerName || b.cooperativeName || "Cooperative Assigned";
    const matchSearch =
      b.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workerLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Top Banner & Profile Overview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F3B66] text-white border border-[#144473] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#144473] text-cyan-300 text-xs font-bold mb-1 border border-[#1E4E7A]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Verified Citizen Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Primary Area: <strong className="text-white">{user?.zone || "Zone A"}</strong> • Address: {user?.address || "Registered Address"}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-[#144473]/80 border border-[#1E4E7A] text-center">
            <div className="text-xs font-semibold text-slate-200">Active</div>
            <div className="text-xl font-extrabold text-[#06B6D4] mt-0.5">{activeBookings.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#144473]/80 border border-[#1E4E7A] text-center">
            <div className="text-xs font-semibold text-slate-200">Completed</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{completedBookings.length}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#144473]/80 border border-[#1E4E7A] text-center">
            <div className="text-xs font-semibold text-slate-200">Total Spent</div>
            <div className="text-xl font-extrabold text-white mt-0.5">₹{Math.round(totalSpent)}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1E3A5F] gap-6 text-sm font-bold">
        <button
          onClick={() => {
            setActiveTab("book");
            setSubView("form");
          }}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === "book"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Request New Service</span>
        </button>

        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === "active"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Active Bookings ({activeBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === "history"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Booking History & Invoices</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === "payments"
              ? "text-blue-600 dark:text-cyan-400 border-blue-600 dark:border-cyan-400"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payments & Escrow</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === "book" ? (
        subView === "form" ? (
          <FindServiceView
            onContinueToCooperatives={(cat, criteria) => {
              setMatchingCategory(cat);
              setMatchingCriteria(criteria);
              setSubView("cooperatives");
            }}
            onMatched={(cat, criteria, workers) => {
              setMatchingCategory(cat);
              setMatchingCriteria(criteria);
              setRankedWorkers(workers);
              setSubView("matching");
            }}
          />
        ) : subView === "cooperatives" ? (
          matchingCategory && matchingCriteria && (
            <CooperativeSelectionView
              category={matchingCategory}
              criteria={matchingCriteria}
              onSelectCooperative={handleSelectCooperative}
              onBack={() => setSubView("form")}
            />
          )
        ) : (
          matchingCategory && matchingCriteria && (
            <MatchingView
              category={matchingCategory}
              criteria={matchingCriteria}
              rankedWorkers={rankedWorkers}
              onSelectWorker={handleSelectWorker}
              onBack={() => setSubView("form")}
            />
          )
        )
      ) : activeTab === "active" ? (
        /* Active Bookings Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E3A5F]">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ongoing Services & Tracking</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">Live cooperative tracking</span>
            </div>
            <button
              onClick={() => {
                setActiveTab("book");
                setSubView("form");
              }}
              title="Close Tracking Tab"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#102A46] hover:bg-slate-200 dark:hover:bg-[#1a385c] text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {activeBookings.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0B1F3A] rounded-2xl border border-slate-200 dark:border-[#1E3A5F] space-y-3">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No active bookings right now</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Need help with plumbing, electrical, carpentry or cleaning? Request a verified cooperative worker now.
              </p>
              <button
                onClick={() => {
                  setActiveTab("book");
                  setSubView("form");
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Book a Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBookings.map(b => {
                const isPendingAllotment = b.status === "SUBMITTED" || b.status === "UNDER_REVIEW";

                return (
                  <div
                    key={b.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-blue-200 dark:border-[#1E3A5F] shadow-xs hover:border-blue-400 dark:hover:border-cyan-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 dark:text-cyan-400">
                          #{b.bookingNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            isPendingAllotment
                              ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              : b.status === "WORKER_ALLOTTED"
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                              : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300"
                          }`}
                        >
                          {isPendingAllotment ? "Awaiting Worker Allotment" : b.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {b.categoryName} Service
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                          {b.description}
                        </p>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <div className="flex items-center gap-1.5">
                          {isPendingAllotment ? (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-amber-500" />
                              <span>
                                Cooperative: <strong className="text-slate-800 dark:text-slate-200">{b.cooperativeName || "Regional Cooperative"}</strong>
                                <span className="text-[11px] text-amber-600 dark:text-amber-400 block sm:inline sm:ml-1 font-semibold">
                                  (Allotment in progress)
                                </span>
                              </span>
                            </>
                          ) : (
                            <>
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                Worker: <strong className="text-slate-800 dark:text-slate-200">{b.workerName}</strong>
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Schedule: {b.scheduledDate} at {b.scheduledTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{b.customerAddress}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Total Tariff</span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          ₹{b.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedBookingForDetail(b)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Track & Manage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === "history" ? (
        /* History Tab */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E3A5F]">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Service History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Review past service tickets, invoices and ratings</p>
            </div>
            <button
              onClick={() => {
                setActiveTab("book");
                setSubView("form");
              }}
              title="Close History Tab"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#102A46] hover:bg-slate-200 dark:hover:bg-[#1a385c] text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <span>Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by worker, service or ID..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-xl outline-hidden bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-xl px-3 py-2 bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table / Cards */}
          <div className="bg-white dark:bg-[#0B1F3A] rounded-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-200 dark:divide-[#1E3A5F]">
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  No matching service history found.
                </div>
              ) : (
                filteredBookings.map(b => (
                  <div
                    key={b.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-[#102A46]/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {b.categoryName}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">#{b.bookingNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.status === "COMPLETED"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              : b.status === "CANCELLED"
                              ? "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                              : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{b.description}</p>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span>Worker: {b.workerName}</span>
                        <span>•</span>
                        <span>Date: {b.scheduledDate}</span>
                        <span>•</span>
                        <span>Total: ₹{b.totalAmount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {b.paymentStatus === "PAID" && (
                        <button
                          onClick={() => setActiveInvoiceBooking(b)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1E3A5F] hover:bg-slate-100 dark:hover:bg-[#102A46] text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                          <span>Invoice</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedBookingForDetail(b)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Payments & Escrow Ledger Tab */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F]">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <span>Cooperative Escrow & Payments Ledger</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every service payment is locked in escrow until you confirm satisfactory resolution of the trade work.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Escrow Protected</span>
              </span>
              <button
                onClick={() => {
                  setActiveTab("book");
                  setSubView("form");
                }}
                title="Close Payments Tab"
                className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-[#102A46] hover:bg-slate-300 dark:hover:bg-[#1a385c] text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Pre-Authorized</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ₹{bookings.reduce((sum, b) => sum + (b.paymentStatus === "PAID" ? (b.totalAmount || 0) : 0), 0).toFixed(2)}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                {bookings.filter(b => b.paymentStatus === "PAID").length} transaction(s) verified
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Escrow Held for Active Jobs</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                ₹{activeBookings.reduce((sum, b) => sum + (b.paymentStatus === "PAID" ? (b.totalAmount || 0) : 0), 0).toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                Released upon your final sign-off
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">Completed Payouts</span>
              <div className="text-2xl font-black text-blue-600 dark:text-cyan-400 mt-1">
                ₹{completedBookings.reduce((sum, b) => sum + (b.paymentStatus === "PAID" ? (b.totalAmount || 0) : 0), 0).toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                Direct to cooperative trade fund
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B1F3A] rounded-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-[#1E3A5F] font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Payment Transactions
            </div>
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No payment transactions found</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-[#1E3A5F]">
                {bookings.map(b => (
                  <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-[#102A46] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          #{b.bookingNumber} • {b.categoryName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                        }`}>
                          {b.paymentStatus === "PAID" ? "Paid & Escrowed" : "Pending"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Txn ID: <span className="font-mono text-slate-700 dark:text-slate-300">{b.paymentTransactionId || "PENDING"}</span> • Method: {b.paymentMethod || "UPI Instant"}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        ₹{(b.totalAmount || 0).toFixed(2)}
                      </span>
                      {b.paymentStatus === "PAID" && (
                        <button
                          onClick={() => setActiveInvoiceBooking(b)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#1E3A5F] hover:bg-slate-100 dark:hover:bg-[#102A46] text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pre-Booking Escrow Payment Modal */}
      {isPaymentModalOpen && pendingBookingPayload && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          totalAmount={pendingBookingPayload.totalAmount}
          categoryName={pendingBookingPayload.category.name}
          cooperativeName={
            pendingBookingPayload.type === "coop"
              ? pendingBookingPayload.target.name
              : "Cooperative Direct Allocation"
          }
          manpowerRequired={pendingBookingPayload.criteria.manpowerRequired || 1}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPendingBookingPayload(null);
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Requirement 7 & 8: Success Popup */}
      {successPopupBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E2744] border border-emerald-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-2xl shrink-0">
                ✓
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                  YOUR REQUEST WAS COMPLETED SUCCESSFULLY
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Your service request has been sent successfully to the cooperative.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#102A46] rounded-xl p-4 space-y-2.5 border border-slate-200 dark:border-[#1E3A5F] text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Request ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {successPopupBooking.bookingNumber || successPopupBooking.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Cooperative</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {successPopupBooking.cooperativeName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                  Requested
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Manpower Required</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {successPopupBooking.manpowerRequired || 1} Worker{(successPopupBooking.manpowerRequired || 1) > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <button
              id="btn-track-request-success"
              type="button"
              onClick={() => {
                const b = successPopupBooking;
                setSuccessPopupBooking(null);
                setActiveTab("active");
                setSelectedBookingForDetail(b);
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Track Request</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Selected Booking Timeline & Interaction Modal */}
      {selectedBookingForDetail && (
        <BookingDetailModal
          booking={selectedBookingForDetail}
          onClose={() => setSelectedBookingForDetail(null)}
          onStatusUpdated={() => fetchBookings()}
        />
      )}

      {/* Dedicated Invoice Modal */}
      {activeInvoiceBooking && (
        <InvoiceView
          booking={activeInvoiceBooking}
          onClose={() => setActiveInvoiceBooking(null)}
        />
      )}
    </div>
  );
};
