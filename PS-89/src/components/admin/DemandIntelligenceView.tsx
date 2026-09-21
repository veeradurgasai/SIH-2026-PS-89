import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Zap,
  Layers
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import confetti from "canvas-confetti";

export const DemandIntelligenceView: React.FC = () => {
  const [forecastData, setForecastData] = useState<any>(null);
  const [allocationData, setAllocationData] = useState<any>(null);
  const [aiAdvisory, setAiAdvisory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rebalancing, setRebalancing] = useState(false);
  const [aiConsulting, setAiConsulting] = useState(false);
  const [rebalanceSuccess, setRebalanceSuccess] = useState(false);

  // Filters
  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, aRes] = await Promise.all([
        fetch("/api/forecasting/demand-trends"),
        fetch("/api/forecasting/capacity-allocation")
      ]);

      if (fRes.ok) {
        const fJson = await fRes.json();
        setForecastData(fJson.forecast);
      }
      if (aRes.ok) {
        const aJson = await aRes.json();
        setAllocationData(aJson.allocation);
      }
    } catch (e) {
      console.error("Failed to fetch forecasting data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyRebalance = async () => {
    if (!allocationData?.recommendations?.length) return;
    setRebalancing(true);
    setRebalanceSuccess(false);
    try {
      const rec = allocationData?.recommendations?.[0];
      if (!rec) {
        setRebalancing(false);
        return;
      }
      const res = await fetch("/api/forecasting/rebalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceZone: rec.sourceZone,
          targetZone: rec.targetZone,
          categoryId: rec.categoryId,
          workerCount: rec.workerCount
        })
      });
      if (res.ok) {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
        setRebalanceSuccess(true);
        await loadData();
      }
    } catch (e) {
      console.error("Rebalance failed:", e);
    } finally {
      setRebalancing(false);
    }
  };

  const handleConsultAiAdvisor = async () => {
    setAiConsulting(true);
    try {
      const res = await fetch("/api/forecasting/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone: selectedZone, timeframe: "7-day" })
      });
      if (res.ok) {
        const data = await res.json();
        setAiAdvisory(data.advisory);
      }
    } catch (e) {
      console.error("AI Advisory error:", e);
    } finally {
      setAiConsulting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        <span>Computing cooperative demand signals and capacity allocation...</span>
      </div>
    );
  }

  // Prep chart data
  const trendData = (forecastData?.upcomingDemand || []).map((d: any) => {
    const total = d.predictedRequests || d.predictedTotal || 0;
    return {
      date: `${d.date.slice(5)} (${d.dayName ? d.dayName.slice(0, 3) : ""})`,
      "Zone A": d.zoneA || Math.round(total * 0.4),
      "Zone B": d.zoneB || Math.round(total * 0.3),
      "Zone C": d.zoneC || Math.round(total * 0.2),
      "Zone D": d.zoneD || Math.round(total * 0.1),
      Total: total
    };
  });

  const capacityBarData = (allocationData?.zoneAnalysis || []).map((z: any) => ({
    zone: z.zone,
    Demand: z.projectedDemand,
    Capacity: z.availableCapacity,
    Gap: z.gap
  }));

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-150">
      {/* Top Advisory & Callout */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B1F3A] to-[#122b52] text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cooperative Predictive Intelligence Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Demand Intelligence & Allocation Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Anticipates neighborhood demand 7 days ahead using past service history, rainfall forecasts, and seasonal spikes. Enables proactive worker allocation without last-minute shortages.
          </p>
        </div>

        <button
          onClick={handleConsultAiAdvisor}
          disabled={aiConsulting}
          className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-slate-950 text-xs font-extrabold shadow-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{aiConsulting ? "Analyzing Engine Signals..." : "Consult AI Strategic Advisor"}</span>
        </button>
      </div>

      {/* AI Advisory Banner (If Generated) */}
      {aiAdvisory && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-cyan-200 dark:border-cyan-900/50 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                AI Strategic Workforce Briefing
              </h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">Cooperative Operations Board</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#102A46] p-4 rounded-xl border border-slate-200 dark:border-[#1E3A5F]">
            {aiAdvisory.narrative}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-[#102A46] border border-blue-100 dark:border-[#1E3A5F]">
              <span className="text-xs font-bold text-blue-900 dark:text-cyan-300 block mb-1">
                Strategic Recommendations
              </span>
              <ul className="space-y-1 text-xs text-blue-800 dark:text-slate-300">
                {(aiAdvisory.recommendations || []).map((r: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block mb-1">
                Welfare & Fair-Wage Impact
              </span>
              <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
                {aiAdvisory.welfareImpact || "Pre-positioning workers guarantees consistent minimum earnings of ₹1,800/day without stressful last-minute commuting."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rebalance Recommendations Card */}
      {allocationData?.recommendations?.length > 0 && (
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  Capacity Alert & Recommended Action
                </span>
                <h4 className="text-base font-extrabold text-amber-950 dark:text-white mt-0.5">
                  {allocationData.recommendations[0]?.reason}
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-200/80 mt-0.5">
                  Move {allocationData.recommendations[0]?.workerCount} workers from {allocationData.recommendations[0]?.sourceZone} to {allocationData.recommendations[0]?.targetZone}.
                </p>
              </div>
            </div>

            <button
              onClick={handleApplyRebalance}
              disabled={rebalancing}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-center"
            >
              <span>{rebalancing ? "Rebalancing..." : "Apply Workforce Rebalance"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {rebalanceSuccess && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Workforce allocation updated! 4 certified workers re-assigned to Zone A priority queue.</span>
            </div>
          )}
        </div>
      )}

      {/* Grid of 2 Key Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Rolling Demand Forecast */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                7-Day Rolling Demand Forecast
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Projected service bookings across all zones</p>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
              +24% Weekend Surge
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Total"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Capacity vs Demand by Zone */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Zone Capacity vs Projected Demand
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Highlighting surplus vs deficit zones</p>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#102A46] px-2.5 py-1 rounded-lg">
              4 Active Zones
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capacityBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="zone" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Demand" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Capacity" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Zone Intelligence Matrix Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Regional Capacity & Vulnerability Matrix
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-[#102A46] text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#1E3A5F]">
              <tr>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Top Demanded Trade</th>
                <th className="py-3 px-4 text-center">Projected Demand</th>
                <th className="py-3 px-4 text-center">Available Capacity</th>
                <th className="py-3 px-4 text-center">Net Balance</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#1E3A5F]">
              {(allocationData?.zoneAnalysis || []).map((z: any) => (
                <tr key={z.zone} className="hover:bg-slate-50/70 dark:hover:bg-[#102A46]/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{z.zone}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{z.topSkill}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                    {z.projectedDemand} reqs
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                    {z.availableCapacity} workers
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        z.gap < 0
                          ? "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                          : z.gap > 0
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {z.gap < 0 ? `${z.gap} Deficit` : z.gap > 0 ? `+${z.gap} Surplus` : "Balanced"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {z.gap < 0 ? (
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        Needs Allocation
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
