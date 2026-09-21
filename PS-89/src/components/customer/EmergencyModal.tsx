import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { AlertTriangle, X, ShieldAlert, Zap, Wrench, Cpu, Sparkles, Clock, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export const EmergencyModal: React.FC = () => {
  const { isEmergencyModalOpen, closeEmergencyModal, triggerBookingRefresh, setSelectedBookingForDetail } = useApp();
  const { user } = useAuth();

  const [selectedTrade, setSelectedTrade] = useState<string>("cat-plumbing");
  const [zone, setZone] = useState<string>("Zone A");
  const [address, setAddress] = useState<string>("Flat 402, Green Glen Layout, Bellandur, Zone A");
  const [description, setDescription] = useState<string>("Burst water pipe in bathroom. Water leaking rapidly onto wooden flooring.");
  const [loading, setLoading] = useState<boolean>(false);
  const [matchedEmergencyWorker, setMatchedEmergencyWorker] = useState<any>(null);

  if (!isEmergencyModalOpen) return null;

  const handleInstantDispatch = async () => {
    setLoading(true);
    try {
      // 1. Fetch nearest available worker for this trade
      const matchRes = await fetch("/api/matching/find-workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedTrade,
          zone,
          isEmergency: true
        })
      });
      const matchData = await matchRes.json();
      const topWorker = matchData.workers?.[0];

      if (!topWorker) {
        alert("No workers currently available in this zone. Please call emergency hotline +91 80 2664 1900.");
        setLoading(false);
        return;
      }

      setMatchedEmergencyWorker(topWorker);

      // 2. Automatically create the emergency booking
      const bookRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: topWorker.worker.id,
          categoryId: selectedTrade,
          description: `[EMERGENCY DISPATCH] ${description}`,
          isEmergency: true,
          customerAddress: address,
          customerZone: zone,
          scheduledDate: new Date().toISOString().split("T")[0],
          scheduledTime: "IMMEDIATE (Within 30 mins)",
          matchScore: topWorker.overallScore,
          matchReasons: [
            "Emergency rapid responder",
            `Proximity: ${topWorker.distanceKm} km away`,
            "NSQF Certified",
            "Highest rated available in zone"
          ]
        })
      });

      if (bookRes.ok) {
        const bookData = await bookRes.json();
        triggerBookingRefresh();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
        setTimeout(() => {
          closeEmergencyModal();
          setSelectedBookingForDetail(bookData.booking);
        }, 1500);
      }
    } catch (err) {
      console.error("Emergency booking failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 text-left">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0B1F3A] rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/50 overflow-hidden transition-colors">
        {/* Emergency Red Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-200">
                Priority Dispatch
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Cooperative Emergency Assistance
              </h3>
            </div>
          </div>
          <button
            onClick={closeEmergencyModal}
            className="p-1.5 text-rose-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {matchedEmergencyWorker ? (
            <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Emergency Responder Dispatched!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>{matchedEmergencyWorker.user.name}</strong> ({matchedEmergencyWorker.primarySkill}) has accepted your emergency request and is en route ({matchedEmergencyWorker.distanceKm} km away).
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold text-xs">
                Estimated Arrival: 18 - 25 mins
              </span>
            </div>
          ) : (
            <>
              {/* Trade selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Emergency Service Type
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "cat-plumbing", label: "Plumbing Leak", icon: Wrench },
                    { id: "cat-electrical", label: "Electrical Spark", icon: Zap },
                    { id: "cat-technician", label: "Appliance Hazard", icon: Cpu }
                  ].map(tItem => {
                    const Icon = tItem.icon;
                    return (
                      <button
                        key={tItem.id}
                        type="button"
                        onClick={() => setSelectedTrade(tItem.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedTrade === tItem.id
                            ? "bg-red-50 dark:bg-red-950/40 border-red-500 ring-2 ring-red-500/20 text-red-900 dark:text-red-200"
                            : "bg-slate-50 dark:bg-[#102A46] border-slate-200 dark:border-[#1E3A5F] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#153457]"
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1.5 text-red-600 dark:text-red-400" />
                        <div className="text-xs font-bold">{tItem.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Zone
                  </label>
                  <select
                    value={zone}
                    onChange={e => setZone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                  >
                    <option value="Zone A">Zone A (Central & Tech)</option>
                    <option value="Zone B">Zone B (South Residential)</option>
                    <option value="Zone C">Zone C (East Suburbs)</option>
                    <option value="Zone D">Zone D (North Growth)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Arrival
                  </label>
                  <div className="px-3 py-2 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Under 30 Minutes</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Accurate Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Describe the Emergency
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg resize-none bg-white dark:bg-[#102A46] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Dispatch Action Button */}
              <button
                type="button"
                onClick={handleInstantDispatch}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-extrabold shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Contacting Nearest Worker in {zone}...</span>
                ) : (
                  <>
                    <span>Dispatch Nearest Verified Worker Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Transparent emergency tariff: 1.5x standard rate, zero gouging.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
