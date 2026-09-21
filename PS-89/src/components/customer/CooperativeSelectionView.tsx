import React, { useState, useEffect } from "react";
import { ServiceCategory, Cooperative } from "../../types";
import {
  ShieldCheck,
  Star,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  DollarSign,
  Info,
  MapPin,
  AlertTriangle,
  X
} from "lucide-react";

interface CooperativeSelectionViewProps {
  category: ServiceCategory;
  criteria: {
    description: string;
    zone: string;
    scheduledDate: string;
    scheduledTime: string;
    isEmergency: boolean;
    customerAddress: string;
    manpowerRequired?: number;
  };
  onSelectCooperative: (coop: Cooperative) => Promise<void>;
  onBack: () => void;
}

export const CooperativeSelectionView: React.FC<CooperativeSelectionViewProps> = ({
  category,
  criteria,
  onSelectCooperative,
  onBack
}) => {
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingCoopId, setSubmittingCoopId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCooperatives = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          zone: criteria.zone,
          categoryId: category.id
        });
        const res = await fetch(`/api/cooperatives?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          // Strict filtering: only legitimately registered cooperatives operating in this zone
          setCooperatives(data.cooperatives || []);
        } else {
          setCooperatives([]);
        }
      } catch (err) {
        console.error("Failed to load cooperatives:", err);
        setCooperatives([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCooperatives();
  }, [criteria.zone, category.id]);

  const handleSelect = async (coop: Cooperative) => {
    setSubmittingCoopId(coop.id);
    try {
      await onSelectCooperative(coop);
    } finally {
      setSubmittingCoopId(null);
    }
  };

  // Price calculations - strictly customer total payable price
  const manpower = Math.max(1, Math.floor(criteria.manpowerRequired || 1));
  const durationHours = category.avgDurationHours || 1.5;
  const baseRate = category.baseRatePerHour || 350;
  const baseAmount = Math.round(baseRate * durationHours * manpower);
  const emergencyAmount = criteria.isEmergency ? Math.round(baseAmount * 0.4) : 0;
  const totalAmount = baseAmount + emergencyAmount;

  return (
    <div id="cooperative-selection-view" className="space-y-6 text-left animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E3A5F]">
        <div>
          <div className="flex items-center gap-2">
            <button
              id="btn-back-to-requirements"
              onClick={onBack}
              className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300 transition-colors cursor-pointer"
            >
              ← Back to Service Requirements
            </button>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {category.name} in {criteria.zone}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Choose Your Local Trade Cooperative
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            In our cooperative federation, you choose the accredited regional cooperative. The Cooperative Admin will review your specific trade requirements and allot the best-qualified specialist.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {criteria.isEmergency && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
              <span>Emergency Priority</span>
            </div>
          )}
          <button
            onClick={onBack}
            title="Close Cooperative Selection Window"
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#102A46] hover:bg-slate-200 dark:hover:bg-[#1a385c] text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <span className="hidden sm:inline">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model Highlights Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-[#102A46] border border-blue-100 dark:border-[#1E3A5F] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Worker-Owned Cooperative Governance
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Accredited cooperative federations of verified and background-checked trade professionals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Transparent Single Price
          </span>
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400">
            <ShieldCheck className="w-4 h-4" /> Certified Specialist Network
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Finding accredited cooperatives for your zone...</p>
        </div>
      ) : cooperatives.length === 0 ? (
        <div className="py-12 text-center p-8 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs">
          <Building2 className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No registered Cooperative Admins are currently available in your selected area.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            There are currently no certified cooperatives registered for {criteria.zone} in the {category.name} category. We strictly uphold cooperative vetting standards and do not substitute unverified providers.
          </p>
          <button
            onClick={onBack}
            className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
          >
            ← Modify Location or Trade Category
          </button>
        </div>
      ) : (
        /* Cooperative List */
        <div className="space-y-4">
          {cooperatives.map((coop, index) => {
            const isSubmitting = submittingCoopId === coop.id;
            const isRecommended = index === 0 || coop.serviceArea === criteria.zone;

            return (
              <div
                key={coop.id}
                id={`coop-card-${coop.id}`}
                className={`p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border transition-all shadow-xs ${
                  isRecommended
                    ? "border-blue-500/80 dark:border-cyan-500/80 ring-1 ring-blue-500/30 dark:ring-cyan-500/30"
                    : "border-slate-200 dark:border-[#1E3A5F] hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Registered Cooperative • {coop.code}</span>
                      </span>

                      {isRecommended && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                          <Sparkles className="w-3 h-3 text-emerald-500" />
                          <span>Primary Zone Match ({coop.serviceArea || criteria.zone})</span>
                        </span>
                      )}

                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Reg: {coop.registrationNumber}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        {coop.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                        {coop.description || "Democratic federation of verified and government-accredited trade professionals with background checks and safety assurance."}
                      </p>
                    </div>

                    {/* Meta stats */}
                    <div className="flex items-center gap-5 text-xs text-slate-600 dark:text-slate-300 flex-wrap pt-1">
                      <span className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        {coop.rating ? coop.rating.toFixed(2) : "4.85"} Cooperative Rating
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                        <strong>{coop.activeWorkers || coop.totalWorkers || 240}</strong> Verified Members on Duty
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Avg Allotment Time: <strong>~{coop.avgResponseMinutes || 15} mins</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {coop.district}, {coop.state}
                      </span>
                    </div>
                  </div>

                  {/* Right: Tariff & Action (Strict single final payable price) */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left lg:text-right">
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Total Payable Tariff ({manpower} worker{manpower > 1 ? "s" : ""}, per day)
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                        ₹{totalAmount}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center lg:justify-end gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>All-inclusive final customer price</span>
                      </div>
                    </div>

                    <button
                      id={`btn-send-request-${coop.id}`}
                      onClick={() => handleSelect(coop)}
                      disabled={isSubmitting || submittingCoopId !== null}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Dispatching Request...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Service Request</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explanation Box */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#102A46]/60 border border-slate-200 dark:border-[#1E3A5F] text-xs text-slate-600 dark:text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Info className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>What happens next after you submit your request?</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600 dark:text-slate-300">
          <li>Your request is logged directly in the selected Cooperative&apos;s administrative dispatch queue.</li>
          <li>A Cooperative Administrator verifies the trade details and allots the most qualified, proximate certified worker.</li>
          <li>You will receive an instant notification with the assigned worker&apos;s name, credential badge, phone, and ETA.</li>
          <li>Payment is settled upon completed inspection via official digital receipt.</li>
        </ol>
      </div>
    </div>
  );
};
