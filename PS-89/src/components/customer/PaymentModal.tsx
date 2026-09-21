import React, { useState } from "react";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  X,
  Building2,
  Sparkles,
  Smartphone,
  Wallet
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  totalAmount: number;
  categoryName: string;
  cooperativeName?: string;
  manpowerRequired: number;
  onClose: () => void;
  onPaymentComplete: (paymentDetails: {
    paymentMethod: string;
    paymentTransactionId: string;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  totalAmount,
  categoryName,
  cooperativeName = "Regional Artisan Cooperative",
  manpowerRequired = 1,
  onClose,
  onPaymentComplete
}) => {
  const [activeTab, setActiveTab] = useState<"upi" | "card" | "wallet">("upi");
  const [upiId, setUpiId] = useState("user@okaxis");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentDone(true);
      setTimeout(() => {
        const txnId = `UPI/SC/${Date.now().toString().slice(-8)}`;
        onPaymentComplete({
          paymentMethod: activeTab === "upi" ? "UPI_INSTANT" : activeTab === "card" ? "DEBIT_CARD" : "COOP_WALLET",
          paymentTransactionId: txnId
        });
      }, 700);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs text-left animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0B1F3A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F3B66] dark:bg-[#071426] text-white p-5 flex items-center justify-between border-b border-transparent dark:border-[#1E3A5F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase text-cyan-400 tracking-wider">
                Pre-Booking Payment
              </span>
              <h3 className="text-lg font-black text-white">
                Cooperative Escrow Checkout
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Service Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#102A46] border border-slate-200 dark:border-[#1E3A5F] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {categoryName} Request
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {cooperativeName} • {manpowerRequired} worker{manpowerRequired > 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due</span>
              <span className="text-2xl font-black text-blue-600 dark:text-cyan-400">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Tabs */}
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-2">
              Select Payment Option
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("upi")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "upi"
                    ? "bg-blue-50 dark:bg-blue-950/80 border-blue-600 dark:border-cyan-500 text-blue-700 dark:text-cyan-300 shadow-xs ring-2 ring-blue-500/20"
                    : "bg-white dark:bg-[#0B1F3A] border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#153457]"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI Instant</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("card")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "card"
                    ? "bg-blue-50 dark:bg-blue-950/80 border-blue-600 dark:border-cyan-500 text-blue-700 dark:text-cyan-300 shadow-xs ring-2 ring-blue-500/20"
                    : "bg-white dark:bg-[#0B1F3A] border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#153457]"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Debit / Card</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("wallet")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "wallet"
                    ? "bg-blue-50 dark:bg-blue-950/80 border-blue-600 dark:border-cyan-500 text-blue-700 dark:text-cyan-300 shadow-xs ring-2 ring-blue-500/20"
                    : "bg-white dark:bg-[#0B1F3A] border-slate-200 dark:border-[#1E3A5F] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#153457]"
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* Active Tab Content */}
          {activeTab === "upi" && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#102A46] border border-slate-200 dark:border-[#1E3A5F] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Instant UPI Payment (GPay, PhonePe, Paytm)
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Zero Surcharge
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Enter UPI VPA ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi or username@okaxis"
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Escrow secured by Cooperative Federation Trust Protocol</span>
              </div>
            </div>
          )}

          {activeTab === "card" && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#102A46] border border-slate-200 dark:border-[#1E3A5F] space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  disabled
                  value="•••• •••• •••• 4242"
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white/60 dark:bg-[#0B1F3A]/60 text-slate-700 dark:text-slate-300 outline-hidden font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Valid Thru
                  </label>
                  <input
                    type="text"
                    disabled
                    value="12/28"
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white/60 dark:bg-[#0B1F3A]/60 text-slate-700 dark:text-slate-300 outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    disabled
                    value="•••"
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white/60 dark:bg-[#0B1F3A]/60 text-slate-700 dark:text-slate-300 outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#102A46] border border-slate-200 dark:border-[#1E3A5F] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Select Bank / Net Banking
                </span>
                <span className="text-[11px] text-blue-600 dark:text-cyan-400 font-semibold">
                  SBI, HDFC, ICICI, Axis
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct secure tokenized bank transfer authorized with 2-Factor OTP verification.
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {paymentDone ? (
              <div className="py-3 px-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Payment Confirmed! Finalizing your service request...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing Secure Payment...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pay ₹{totalAmount.toFixed(2)} & Done</span>
                  </>
                )}
              </button>
            )}
            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2">
              By pressing Pay / Done, your payment is escrowed safely until your work order is completed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
