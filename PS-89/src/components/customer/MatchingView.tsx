import React, { useState } from "react";
import { RankedWorker, ServiceCategory } from "../../types";
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Sparkles,
  Map as MapIcon,
  List,
  X
} from "lucide-react";

interface MatchingViewProps {
  category: ServiceCategory;
  criteria: {
    description: string;
    zone: string;
    scheduledDate: string;
    scheduledTime: string;
    isEmergency: boolean;
    customerAddress: string;
  };
  rankedWorkers: RankedWorker[];
  onSelectWorker: (worker: RankedWorker) => void;
  onBack: () => void;
}

export const MatchingView: React.FC<MatchingViewProps> = ({
  category,
  criteria,
  rankedWorkers = [],
  onSelectWorker,
  onBack
}) => {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedWorkerForMap, setSelectedWorkerForMap] = useState<RankedWorker | null>(
    (rankedWorkers && rankedWorkers.length > 0) ? rankedWorkers[0] : null
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E3A5F]">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300 transition-colors cursor-pointer"
            >
              ← Modify Search
            </button>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {category.name} in {criteria.zone}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Best workers for your request
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            Ranked by multi-factor cooperative matching algorithm: skill compatibility (30%), proximity (20%), availability (15%), certification (15%), rating (10%), and workload (10%).
          </p>
        </div>

        {/* View mode toggle & Close Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#102A46] p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#0B1F3A] text-blue-600 dark:text-cyan-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List ({rankedWorkers.length})</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "map"
                  ? "bg-white dark:bg-[#0B1F3A] text-blue-600 dark:text-cyan-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Network Map</span>
            </button>
          </div>

          <button
            onClick={onBack}
            title="Close Worker Selection Window"
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#102A46] hover:bg-slate-200 dark:hover:bg-[#1a385c] text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <span className="hidden sm:inline">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map View */}
      {viewMode === "map" && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Interactive Proximity Map ({criteria.zone})
            </span>
            <span className="text-xs text-blue-600 dark:text-cyan-400 font-medium">
              Demo Geodesic Coordinates & Radius Radar
            </span>
          </div>

          {/* Map canvas simulation with realistic coordinates */}
          <div className="relative w-full h-80 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
            {/* Grid background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
                backgroundSize: "20px 20px"
              }}
            />

            {/* Customer location marker in center */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping" />
                <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-white font-extrabold">
                  You
                </div>
              </div>
              <span className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-slate-200">
                {criteria.customerAddress.slice(0, 25)}...
              </span>
            </div>

            {/* Worker pins scattered by distance */}
            {rankedWorkers.slice(0, 8).map((rw, idx) => {
              const angle = (idx * (360 / Math.min(8, rankedWorkers.length))) * (Math.PI / 180);
              const distancePx = Math.min(120, Math.max(45, rw.distanceKm * 18));
              const x = Math.cos(angle) * distancePx;
              const y = Math.sin(angle) * distancePx;
              const isSelected = selectedWorkerForMap?.worker.id === rw.worker.id;

              return (
                <div
                  key={rw.worker.id}
                  onClick={() => setSelectedWorkerForMap(rw)}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className={`absolute z-20 cursor-pointer group transition-all duration-200 ${
                    isSelected ? "scale-125 z-30" : "hover:scale-110"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white shadow-md ${
                        rw.rank === 1
                          ? "bg-amber-500 border-white ring-2 ring-amber-400"
                          : "bg-blue-600 border-white"
                      }`}
                    >
                      #{rw.rank}
                    </div>
                    <span className="mt-0.5 px-1.5 py-0.5 rounded bg-slate-900/90 text-[9px] font-bold text-slate-200 whitespace-nowrap shadow-xs">
                      {(rw.user?.name || "Worker").split(" ")[0]} ({rw.distanceKm}km)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected worker card preview on map */}
          {selectedWorkerForMap && (
            <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-[#102A46] border border-blue-200 dark:border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedWorkerForMap.user.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                  alt={selectedWorkerForMap.user.name}
                  className="w-12 h-12 rounded-xl object-cover border border-blue-200 dark:border-[#1E3A5F]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {selectedWorkerForMap.user.name}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                      {selectedWorkerForMap.overallScore}% Match
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mt-1">
                    <span>{selectedWorkerForMap.primarySkill}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {selectedWorkerForMap.worker.rating.toFixed(2)}
                    </span>
                    <span>•</span>
                    <span>{selectedWorkerForMap.distanceKm} km away</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectWorker(selectedWorkerForMap)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Select {(selectedWorkerForMap?.user?.name || "Worker").split(" ")[0]}
              </button>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      <div className="space-y-4">
        {rankedWorkers.map((rw) => {
          const isTopMatch = rw.rank === 1;

          return (
            <div
              key={rw.worker.id}
              className={`p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border transition-all text-left ${
                isTopMatch
                  ? "border-blue-400 dark:border-cyan-500 shadow-md ring-2 ring-blue-500/10 dark:ring-cyan-500/20"
                  : "border-slate-200 dark:border-[#1E3A5F] hover:border-blue-300 dark:hover:border-cyan-500/50 hover:shadow-sm"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Worker Avatar & Core Profile */}
                <div className="lg:col-span-4 flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={
                        rw.user.avatarUrl ||
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                      }
                      alt={rw.user.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-[#1E3A5F]"
                    />
                    {isTopMatch && (
                      <span className="absolute -top-2 -left-2 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                        Top Rank #1
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {rw.user.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-cyan-800">
                        <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                        Cooperative Verified
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                      {rw.primarySkill}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        {rw.worker.rating.toFixed(2)}
                      </span>
                      <span>({rw.worker.completedJobsCount} jobs done)</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                        {rw.distanceKm} km away
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rw.worker.status === "available"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        ● {rw.worker.status === "available" ? "Available Today" : "Busy on Active Job"}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Workload: {rw.worker.currentWorkload} active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Explainable Reasoning (Why This Worker?) */}
                <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50/80 dark:bg-[#102A46] border border-slate-200/80 dark:border-[#1E3A5F]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                      Why this worker?
                    </span>
                    <span className="text-xs font-extrabold text-blue-700 dark:text-cyan-300 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-md">
                      {rw.overallScore}/100 Match
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {rw.reasons.slice(0, 4).map((reason, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>

                  {rw.certifications && rw.certifications.length > 0 && rw.certifications[0] && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-[#1E3A5F] text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="truncate">{rw.certifications[0]?.title || "Certified"}</span>
                    </div>
                  )}
                </div>

                {/* Right: Pricing & Booking Action */}
                <div className="lg:col-span-3 flex flex-col justify-between items-start lg:items-end gap-3 h-full">
                  <div className="text-left lg:text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Standard Daily Tariff</div>
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                      ₹{rw.worker.hourlyRate}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/day</span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Est. Total: ₹{rw.worker.hourlyRate} per day (incl. cooperative fee)
                    </div>
                  </div>

                  <button
                    id={`select-worker-${rw.worker.id}`}
                    onClick={() => onSelectWorker(rw)}
                    className="w-full lg:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Worker</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
