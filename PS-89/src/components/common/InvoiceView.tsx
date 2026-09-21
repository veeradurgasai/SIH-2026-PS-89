import React from "react";
import { Booking } from "../../types";
import { Logo } from "./Logo";
import { Printer, Download, CheckCircle2, ShieldCheck, ArrowLeft, X } from "lucide-react";

interface InvoiceViewProps {
  booking: Booking;
  onClose: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B1F3A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden my-8 text-left transition-colors">
        {/* Top action bar */}
        <div className="bg-slate-100 dark:bg-[#102A46] px-6 py-3 border-b border-slate-200 dark:border-[#1E3A5F] flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Booking</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0B1F3A] border border-slate-300 dark:border-[#1E3A5F] hover:bg-slate-50 dark:hover:bg-[#153457] text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save PDF</span>
            </button>
            <button
              onClick={onClose}
              title="Close Invoice Window"
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-[#153457] hover:bg-slate-300 dark:hover:bg-[#1E3A5F] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#1E3A5F]">
            <div>
              <Logo size="md" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Shramik Sahakari Federation • Reg No: COOP/BLR/2019/8841<br />
                Central Cooperative District Office, Bengaluru Urban, Karnataka
              </p>
            </div>
            <div className="sm:text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Official Digital Receipt
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                INV-{booking.bookingNumber}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Date: {new Date(booking.paidAt || booking.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </div>
            </div>
          </div>

          {/* Party details */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div>
              <span className="font-extrabold uppercase text-slate-400 dark:text-slate-400 tracking-wider">
                Billed To (Customer)
              </span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-1">{booking.customerName}</div>
              <div className="text-slate-600 dark:text-slate-300 mt-0.5">{booking.customerAddress}</div>
              <div className="text-slate-600 dark:text-slate-300">Contact: {booking.customerPhone}</div>
              <div className="text-slate-500 dark:text-slate-400">Service Zone: {booking.customerZone}</div>
            </div>

            <div>
              <span className="font-extrabold uppercase text-slate-400 dark:text-slate-400 tracking-wider">
                Assigned Cooperative Worker
              </span>
              <div className="font-bold text-slate-900 dark:text-white text-sm mt-1">{booking.workerName}</div>
              <div className="text-slate-600 dark:text-slate-300 mt-0.5">Contact: {booking.workerPhone}</div>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md mt-1 border border-blue-200 dark:border-blue-800">
                <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                Cooperative Verified Member
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#1E3A5F]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-[#102A46] text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#1E3A5F]">
                <tr>
                  <th className="py-2.5 px-4">Service Description</th>
                  <th className="py-2.5 px-4 text-center">Workforce</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1E3A5F]">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    <div>{booking.description}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{booking.categoryName}</div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                    {booking.manpowerRequired || (booking.assignments?.length || 1)} Worker{(booking.manpowerRequired || 1) > 1 ? "s" : ""}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                    ₹{booking.baseAmount.toFixed(2)}
                  </td>
                </tr>
                {booking.emergencyFee > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 text-amber-700 dark:text-amber-400 font-medium">
                      Emergency Dispatch & Immediate Arrival Surcharge
                    </td>
                    <td className="py-2.5 px-4 text-center text-amber-700 dark:text-amber-400">Priority</td>
                    <td className="py-2.5 px-4 text-right font-bold text-amber-800 dark:text-amber-300">
                      ₹{booking.emergencyFee.toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Clean customer total summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#102A46] border border-slate-200/80 dark:border-[#1E3A5F] text-[11px] space-y-1.5 max-w-sm">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Federation Certified Service Guarantee</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Service delivered under standardized cooperative labor federation norms. All assigned personnel are identity-verified and safety-certified.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Standard Tariff</span>
                <span>₹{booking.baseAmount.toFixed(2)}</span>
              </div>
              {booking.emergencyFee > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Priority Surcharge</span>
                  <span>₹{booking.emergencyFee.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 dark:border-[#1E3A5F] pt-2 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                <span>Total Paid</span>
                <span className="text-blue-600 dark:text-cyan-400">₹{booking.totalAmount.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 text-right">
                Payment Status: <strong className="text-emerald-600 dark:text-emerald-400">PAID</strong> ({booking.paymentMethod || "DEMO_UPI"})
              </div>
              {booking.paymentTransactionId && (
                <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right font-mono">
                  Txn: {booking.paymentTransactionId}
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-200 dark:border-[#1E3A5F] text-center text-[10px] text-slate-400 dark:text-slate-500">
            Thank you for supporting community-owned labor. Certified under Karnataka Cooperative Societies Framework.
          </div>
        </div>
      </div>
    </div>
  );
};
