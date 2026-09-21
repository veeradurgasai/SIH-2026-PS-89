import React, { useState, useEffect } from "react";
import { ServiceCategory, RankedWorker } from "../../types";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  HeartHandshake,
  Car,
  Flower2,
  Cpu,
  Calendar,
  Clock,
  MapPin,
  Upload,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Users,
  Minus,
  Plus
} from "lucide-react";

interface FindServiceViewProps {
  initialCategory?: ServiceCategory | null;
  onMatched?: (category: ServiceCategory, criteria: any, workers: RankedWorker[]) => void;
  onContinueToCooperatives?: (category: ServiceCategory, criteria: any) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  "cat-plumbing": Wrench,
  "cat-electrical": Zap,
  "cat-carpentry": Hammer,
  "cat-painting": Paintbrush,
  "cat-cleaning": Sparkles,
  "cat-caregiving": HeartHandshake,
  "cat-driving": Car,
  "cat-gardening": Flower2,
  "cat-technician": Cpu
};

export const FindServiceView: React.FC<FindServiceViewProps> = ({
  initialCategory,
  onMatched,
  onContinueToCooperatives
}) => {
  const { categories = [], selectedCategoryForBooking } = useApp();
  const { user } = useAuth();

  const [selectedCat, setSelectedCat] = useState<ServiceCategory | null>(() => {
    return (
      initialCategory ||
      selectedCategoryForBooking ||
      (categories && categories.length > 0 ? categories[0] : null)
    );
  });
  const [description, setDescription] = useState("Kitchen sink faucet is leaking and water pressure is low.");
  const [zone, setZone] = useState(user?.zone || "Zone A");
  const [address, setAddress] = useState(user?.address || "Flat 304, Palm Meadows, Whitefield");
  const [dateOption, setDateOption] = useState<"today" | "tomorrow" | "custom">("today");
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 12:00 PM");
  const [isEmergency, setIsEmergency] = useState(false);
  const [manpowerRequired, setManpowerRequired] = useState<number>(1);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCategoryForBooking) {
      setSelectedCat(selectedCategoryForBooking);
    } else if (!selectedCat && categories && categories.length > 0) {
      setSelectedCat(categories[0]);
    }
  }, [selectedCategoryForBooking, categories]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setUploadedPhotos(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Price calculations based on manpower and emergency
  const durationHours = selectedCat?.avgDurationHours || 1.5;
  const baseRatePerHour = selectedCat?.baseRatePerHour || 350;
  const validManpower = Math.max(1, Math.floor(Number(manpowerRequired) || 1));
  const calculatedBasePrice = Math.round(baseRatePerHour * durationHours * validManpower);
  const calculatedEmergencySurcharge = isEmergency ? Math.round(calculatedBasePrice * 0.4) : 0;
  const customerTotalPayablePrice = calculatedBasePrice + calculatedEmergencySurcharge;

  const handleFindWorkers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat) {
      setError("Please select a service category");
      return;
    }

    const validatedCount = Math.floor(Number(manpowerRequired));
    if (isNaN(validatedCount) || validatedCount < 1) {
      setError("Manpower requirement must be a positive whole number (minimum 1 worker).");
      return;
    }

    setLoading(true);
    setError(null);

    const scheduledDate =
      dateOption === "today"
        ? new Date().toISOString().split("T")[0]
        : dateOption === "tomorrow"
        ? new Date(Date.now() + 86400000).toISOString().split("T")[0]
        : customDate;

    const criteria = {
      description,
      zone,
      scheduledDate,
      scheduledTime: isEmergency ? "IMMEDIATE (Within 30 mins)" : timeSlot,
      isEmergency,
      customerAddress: address,
      manpowerRequired: validatedCount,
      photos: uploadedPhotos
    };

    if (onContinueToCooperatives) {
      setLoading(false);
      onContinueToCooperatives(selectedCat, criteria);
      return;
    }

    try {
      const res = await fetch("/api/matching/find-workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCat.id,
          zone,
          scheduledDate,
          scheduledTime: isEmergency ? "IMMEDIATE (Within 30 mins)" : timeSlot,
          isEmergency,
          customerAddress: address,
          manpowerRequired: validatedCount
        })
      });

      if (!res.ok) {
        throw new Error("Failed to find workers");
      }

      const data = await res.json();
      if (onMatched) {
        onMatched(
          selectedCat,
          criteria,
          data.workers || []
        );
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while finding matching workers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Request a Cooperative Service
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
          Select your requirements below. Our matching engine will rank the nearest verified workers based on skills, certification, customer ratings, and current workload.
        </p>
      </div>

      <form onSubmit={handleFindWorkers} className="space-y-6">
        {/* Step 1: Category Selection */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3">
            1. Select Trade / Service Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {(categories || []).map(cat => {
              const IconComp = CATEGORY_ICONS[cat.id] || Wrench;
              const isSelected = selectedCat?.id === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-cyan-400 ring-2 ring-blue-600/10 dark:ring-cyan-400/20 text-slate-900 dark:text-white"
                      : "bg-white dark:bg-[#102A46]/60 border-slate-200 dark:border-[#1E3A5F] hover:border-slate-300 dark:hover:border-cyan-500/40 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#102A46]"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{cat.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      ₹{cat.baseRatePerHour}/day
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Problem Description & Photo Upload */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            2. Describe Your Requirement
          </label>
          <div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue or task in detail (e.g. leaking pipe under kitchen sink, needs replacement washer)"
              className="w-full p-3 text-xs sm:text-sm border border-slate-300 dark:border-[#1E3A5F] rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-white dark:bg-[#102A46] text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Photo upload dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Upload Photos (Optional - Helps worker bring the right replacement parts)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-[#1E3A5F] hover:border-blue-500 dark:hover:border-cyan-400 bg-slate-50 dark:bg-[#102A46] hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                <Upload className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>Upload Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Supports JPG, PNG up to 5MB
              </span>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {uploadedPhotos.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-[#1E3A5F]">
                    <img src={src} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploadedPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Location, Schedule & Priority */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            3. Location & Scheduling
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cooperative Zone
              </label>
              <select
                value={zone}
                onChange={e => setZone(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-xl bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
              >
                <option value="Zone A">Zone A (Central & Tech Corridor)</option>
                <option value="Zone B">Zone B (South Residential Hub)</option>
                <option value="Zone C">Zone C (East Suburbs)</option>
                <option value="Zone D">Zone D (North Growth Zone)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Service Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="House / Flat No, Street, Landmark"
                className="w-full p-2.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-xl outline-hidden bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Service Date
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDateOption("today")}
                  className={`py-2 text-xs font-bold rounded-lg border text-center cursor-pointer transition-colors ${
                    dateOption === "today"
                      ? "bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 border-blue-600 dark:border-cyan-500"
                      : "bg-white dark:bg-[#102A46] border-slate-200 dark:border-[#1E3A5F] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#153457]"
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateOption("tomorrow")}
                  className={`py-2 text-xs font-bold rounded-lg border text-center cursor-pointer transition-colors ${
                    dateOption === "tomorrow"
                      ? "bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 border-blue-600 dark:border-cyan-500"
                      : "bg-white dark:bg-[#102A46] border-slate-200 dark:border-[#1E3A5F] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#153457]"
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setDateOption("custom")}
                  className={`py-2 text-xs font-bold rounded-lg border text-center cursor-pointer transition-colors ${
                    dateOption === "custom"
                      ? "bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 border-blue-600 dark:border-cyan-500"
                      : "bg-white dark:bg-[#102A46] border-slate-200 dark:border-[#1E3A5F] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#153457]"
                  }`}
                >
                  Custom
                </button>
              </div>

              {dateOption === "custom" && (
                <input
                  type="date"
                  value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                  className="w-full mt-2 p-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Time Slot
              </label>
              <select
                disabled={isEmergency}
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-xl bg-white dark:bg-[#102A46] text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400"
              >
                <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                <option value="01:00 PM - 03:00 PM">01:00 PM - 03:00 PM</option>
                <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM</option>
              </select>
            </div>
          </div>

          {/* Emergency Priority Toggle */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#1E3A5F]">
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={e => setIsEmergency(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-red-600 focus:ring-red-500"
              />
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Mark as Emergency Service (Arrival Under 30 Minutes)</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  Top available workers in {zone} will receive an instant priority dispatch notification. Emergency rate multiplier applies (+40%).
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Step 4: Required Manpower (Number of Workers) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                4. Manpower Requirement (Number of Workers)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Specify the exact number of certified workers required (e.g. 1 plumber, 2 electricians, 4 cleaners).
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900 shrink-0">
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Multi-Worker Supported</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setManpowerRequired(prev => Math.max(1, (Number(prev) || 1) - 1))}
                disabled={manpowerRequired <= 1}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#102A46] hover:bg-slate-200 dark:hover:bg-[#153457] text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
                title="Decrease worker count"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="relative">
                <input
                  type="number"
                  id="input-manpower-required"
                  min={1}
                  step={1}
                  value={manpowerRequired}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setManpowerRequired(isNaN(val) ? 1 : Math.max(1, val));
                  }}
                  className="w-24 text-center font-black text-lg py-2 border border-slate-300 dark:border-[#1E3A5F] rounded-xl bg-white dark:bg-[#102A46] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <button
                type="button"
                onClick={() => setManpowerRequired(prev => (Number(prev) || 1) + 1)}
                className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg cursor-pointer transition-colors border border-blue-200 dark:border-blue-800"
                title="Increase worker count"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">
                {validManpower} {selectedCat ? selectedCat.name.replace(/s$/, "") : "Worker"}{validManpower > 1 ? "s" : ""}
              </span>{" "}
              will be allocated by the Cooperative Admin for this job (Daily engagement per specialist).
            </div>
          </div>
        </div>

        {/* Customer Single Final Price Display */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#0c2444] dark:to-[#0f2e54] border border-blue-200 dark:border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Customer Total Service Price
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              ₹{customerTotalPayablePrice}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Standard Daily Tariff for {validManpower} specialist{validManpower > 1 ? "s" : ""}
              {isEmergency && <span className="text-red-600 dark:text-red-400 font-semibold"> • Includes emergency arrival guarantee</span>}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Transparent Fixed Price • No Hidden Middleman Fees</span>
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Submit & Match Action */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span>Loading Cooperatives...</span>
          ) : (
            <>
              <span>Choose Regional Cooperative & Submit Request</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
