import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { ServiceCategory } from "../../types";
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
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users,
  Building2,
  Inbox,
  BarChart3,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  ChevronRight,
  Activity,
  Layers,
  ArrowUpRight
} from "lucide-react";

interface LandingPageProps {
  onSelectCategory: (cat: ServiceCategory) => void;
  onNavigateView: (view: "public" | "customer" | "worker" | "admin") => void;
}

const SERVICE_ITEMS = [
  { id: "cat-plumbing", name: "Plumbing", icon: Wrench, desc: "Leaks, sanitary fittings, pipe lines & emergency drainage", rate: "₹350/day", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "cat-electrical", name: "Electrical", icon: Zap, desc: "Wiring, circuit boards, switches & home appliance repair", rate: "₹400/day", color: "text-amber-600", bg: "bg-amber-50" },
  { id: "cat-carpentry", name: "Carpentry", icon: Hammer, desc: "Modular furniture, door locks, hinges & custom woodcraft", rate: "₹450/day", color: "text-orange-600", bg: "bg-orange-50" },
  { id: "cat-painting", name: "Painting", icon: Paintbrush, desc: "Waterproofing, exterior finish, interior emulsion & texture", rate: "₹500/day", color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "cat-cleaning", name: "Cleaning", icon: Sparkles, desc: "Deep kitchen sanitization, water tank scrub & floor polish", rate: "₹300/day", color: "text-cyan-600", bg: "bg-cyan-50" },
  { id: "cat-caregiving", name: "Caregiving", icon: HeartHandshake, desc: "Elderly assistance, post-surgery mobility aid & patient care", rate: "₹350/day", color: "text-rose-600", bg: "bg-rose-50" },
  { id: "cat-driving", name: "Driving", icon: Car, desc: "Verified commercial chauffeurs for local & intercity travel", rate: "₹300/day", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "cat-gardening", name: "Gardening", icon: Flower2, desc: "Balcony garden pruning, organic pest relief & landscape", rate: "₹280/day", color: "text-green-600", bg: "bg-green-50" },
  { id: "cat-technician", name: "Technician Services", icon: Cpu, desc: "RO purifiers, inverters, geysers & washing machine diagnostics", rate: "₹450/day", color: "text-blue-700", bg: "bg-sky-50" }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectCategory, onNavigateView }) => {
  const { t, openAuthModal, openEmergencyModal, setSelectedCategoryForBooking } = useApp();
  const { user } = useAuth();
  const [activeNetworkZone, setActiveNetworkZone] = useState<string>("Zone A");

  const handleCategoryClick = (catItem: typeof SERVICE_ITEMS[0]) => {
    const cat: ServiceCategory = {
      id: catItem.id,
      name: catItem.name,
      slug: catItem.id.replace("cat-", ""),
      icon: catItem.name,
      description: catItem.desc,
      baseRatePerHour: parseInt(catItem.rate.replace(/[^0-9]/g, "")),
      emergencyMultiplier: 1.4,
      avgDurationHours: 1.5
    };
    setSelectedCategoryForBooking(cat);
    onSelectCategory(cat);
  };

  return (
    <div className="w-full min-h-screen bg-transparent text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors duration-300">
      {/* =========================================================================
          SECTION 1: HERO SECTION & INTERACTIVE WORKFORCE NETWORK VISUALIZATION
          ========================================================================= */}
      <section className="relative pt-6 pb-16 lg:pt-12 lg:pb-24 border-b border-slate-200/60 dark:border-blue-900/30 overflow-hidden bg-transparent">
        {/* Subtle background network grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#2563EB 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-500/30 text-blue-700 dark:text-cyan-300 text-xs font-bold tracking-wide shadow-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>Cooperative-Owned Digital Workforce Network</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Skilled people.<br />
                <span className="text-blue-600 dark:text-blue-400">Right work.</span><br />
                Stronger communities.
              </h1>

              {/* Supporting Line */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                ShramConnect connects trusted cooperative workers with the households and businesses that need them — while empowering cooperatives to intelligently manage workforce capacity and anticipate local demand.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  id="hero-find-service-btn"
                  onClick={() => {
                    const el = document.getElementById("services");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-sm font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>{t.findServiceBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-join-worker-btn"
                  onClick={() => openAuthModal("register", "worker")}
                  className="px-6 py-3.5 rounded-full bg-white/90 dark:bg-[#0B1F3A]/90 hover:bg-slate-100 dark:hover:bg-[#102A46] border border-slate-300 dark:border-[#1E3A5F] text-slate-800 dark:text-slate-200 text-sm font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>{t.joinWorkerBtn}</span>
                </button>

                <button
                  id="hero-emergency-btn"
                  onClick={openEmergencyModal}
                  className="px-4 py-3.5 rounded-full bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Need Help Now?</span>
                </button>
              </div>

              {/* 4 Stats Grid Matching Official Design */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 border-t border-slate-200/80 dark:border-blue-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/50">
                    <Users className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">12,500+</div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Verified Workers</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/50">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">320+</div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Cooperative Societies</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/50">
                    <Inbox className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">1,200+</div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Household Requests</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/50">
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">98%</div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Customer Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Sophisticated Interactive Workforce Visualization */}
            <div className="lg:col-span-6">
              <div className="relative p-5 sm:p-7 rounded-3xl bg-white/85 dark:bg-[#07162c]/85 backdrop-blur-xl border border-slate-200/90 dark:border-blue-500/25 shadow-2xl shadow-blue-950/10 dark:shadow-blue-950/50">
                {/* Header bar of visualizer */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/80 dark:border-[#1E3A5F]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Live Cooperative Network State
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#102A46] p-0.5 rounded-lg text-[11px] font-bold">
                    {["Zone A", "Zone B", "Zone C"].map(z => (
                      <button
                        key={z}
                        onClick={() => setActiveNetworkZone(z)}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          activeNetworkZone === z
                            ? "bg-white dark:bg-[#132F4F] text-blue-600 dark:text-cyan-300 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Network Map / Node Flow */}
                <div className="relative bg-slate-950/95 rounded-2xl p-5 sm:p-6 text-white overflow-hidden border border-slate-800/80 dark:border-blue-900/40">
                  {/* Decorative faint grid lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

                  {/* Top: Cooperative Federation Hub */}
                  <div className="relative z-10 flex flex-col items-center mb-5">
                    <div className="px-4 py-1.5 rounded-full bg-blue-600/90 border border-blue-400 text-xs font-bold tracking-wide shadow-md flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Shramik Sahakari Federation Hub</span>
                    </div>
                    <div className="h-5 w-0.5 bg-gradient-to-b from-blue-400 to-cyan-400 my-1" />
                  </div>

                  {/* Middle Layer: Specialized Skill Guilds */}
                  <div className="relative z-10 grid grid-cols-3 gap-2 text-center mb-5">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
                      <div className="text-[10px] uppercase font-bold text-cyan-400">Plumbing Guild</div>
                      <div className="text-sm font-extrabold text-white mt-0.5">38 Workers</div>
                      <div className="text-[10px] text-emerald-400 font-medium mt-0.5">✓ 98% Available</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
                      <div className="text-[10px] uppercase font-bold text-amber-400">Electrical Guild</div>
                      <div className="text-sm font-extrabold text-white mt-0.5">42 Workers</div>
                      <div className="text-[10px] text-emerald-400 font-medium mt-0.5">✓ 94% Available</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
                      <div className="text-[10px] uppercase font-bold text-purple-400">Carpentry & Tech</div>
                      <div className="text-sm font-extrabold text-white mt-0.5">34 Workers</div>
                      <div className="text-[10px] text-emerald-400 font-medium mt-0.5">✓ 92% Available</div>
                    </div>
                  </div>

                  {/* Active Nodes: Connected Workers & Community Demand */}
                  <div className="relative z-10 p-3.5 rounded-xl bg-blue-950/70 border border-blue-500/30">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-300 font-medium">Real-Time Demand in {activeNetworkZone}</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +24% Surge
                      </span>
                    </div>

                    {/* Progress representation */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full w-[78%]" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>42 Expected Household Requests</span>
                      <span className="text-white font-semibold">31 Local Capacity</span>
                    </div>

                    {/* Predictive action highlight */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        AI Rebalancing: +5 plumbers allocated
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 font-bold">
                        100% Guaranteed SLA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explanatory footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    Zero commission gouging
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    Cooperative welfare certified
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    Verified & trained workforce
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: TRUSTED SERVICES DISCOVERY
          ========================================================================= */}
      <section id="services" className="py-20 bg-white/80 dark:bg-[#071426]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E3A5F] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Certified Workforce Services</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Transparent services by trusted professionals
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
                Every booking is matched with cooperative-certified workers. Fair standardized daily rates, direct accountability, and guaranteed satisfaction.
              </p>
            </div>
            <button
              onClick={() => openAuthModal("register", "customer")}
              className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-300 transition-colors"
            >
              <span>Explore all services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid of 9 services */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICE_ITEMS.map(service => {
              const IconComp = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={() => handleCategoryClick(service)}
                  className="group p-6 rounded-2xl bg-white/90 dark:bg-[#0B1F3A]/90 backdrop-blur-sm border border-slate-200 dark:border-[#1E3A5F] hover:border-blue-400 dark:hover:border-cyan-500/50 hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${service.bg} dark:bg-opacity-20 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <IconComp className={`w-6 h-6 ${service.color}`} />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#102A46] px-2.5 py-1 rounded-full">
                        {service.rate}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between text-xs font-bold text-blue-600 dark:text-cyan-400">
                    <span>Find Available Workers</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HOW SHRAMCONNECT WORKS (4-STEP VISUAL FLOW)
          ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-slate-50/70 dark:bg-[#0B1F3A]/30 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E3A5F] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Seamless Cooperative Fulfillment</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How ShramConnect Works
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            A simple 4-step workflow connecting community demand with guaranteed cooperative craft.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {[
              { num: "01", title: t.step1, desc: "Select your requirement, specify address, and choose standard or emergency priority.", icon: Wrench },
              { num: "02", title: t.step2, desc: "Our engine ranks nearby verified workers based on skills, certification, rating, and proximity.", icon: ShieldCheck },
              { num: "03", title: t.step3, desc: "Worker accepts prompt dispatch, arrives with tools, and executes work to cooperative safety standards.", icon: Clock },
              { num: "04", title: t.step4, desc: "Transparent digital settlement, GST-compliant cooperative invoice, and mutual reputation ratings.", icon: Award }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="p-6 rounded-2xl bg-white/90 dark:bg-[#0B1F3A]/90 backdrop-blur-sm border border-slate-200 dark:border-[#1E3A5F] text-left relative overflow-hidden group hover:border-blue-400 dark:hover:border-cyan-500/50 transition-colors"
                >
                  <span className="text-4xl font-extrabold text-blue-100 dark:text-blue-900/40 group-hover:text-blue-200 dark:group-hover:text-blue-800/60 transition-colors select-none">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-cyan-400 my-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: WORKFORCE NETWORK: FROM GIG TO COOPERATIVE NETWORK
          ========================================================================= */}
      <section className="py-20 bg-white/80 dark:bg-[#071426]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E3A5F] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-cyan-300 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>The Cooperative Advantage</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                From Isolated Gig Marketplace to Coordinated Cooperative Network
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Conventional gig platforms isolate workers, extract high commissions, and leave both workers and consumers vulnerable.
              </p>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                In ShramConnect, workers are certified members of an organized cooperative federation. They share tools, access group health coverage, receive ongoing skills upgrades, and coordinate capacity dynamically.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Workers keep 95% of their hard-earned labor; 5% directly funds member welfare.",
                  "Cooperative-backed social security: Ayushman health cover, pension, and equipment insurance.",
                  "Transparent standardized pricing without exploitative surge pricing for citizens."
                ].map((pt, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Node Card */}
            <div className="lg:col-span-6">
              <div className="p-7 rounded-2xl bg-[#0B1F3A] text-white border border-slate-800 shadow-xl">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
                  Coordinated Architecture
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">ONE COOPERATIVE FEDERATION</div>
                      <div className="text-[11px] text-slate-400">Democratic governance & collective bargaining</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-bold">Nexus</span>
                  </div>

                  <div className="flex justify-center -my-2">
                    <div className="w-0.5 h-6 bg-cyan-500" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">MULTIPLE SERVICE AREAS (ZONES)</div>
                      <div className="text-[11px] text-slate-400">Geographic coverage & intelligent capacity sharing</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-bold">4 Zones</span>
                  </div>

                  <div className="flex justify-center -my-2">
                    <div className="w-0.5 h-6 bg-cyan-500" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">CONNECTED CERTIFIED WORKERS</div>
                      <div className="text-[11px] text-slate-400">NSQF Level 4, background verified, equipped</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">280+ Active</span>
                  </div>

                  <div className="flex justify-center -my-2">
                    <div className="w-0.5 h-6 bg-cyan-500" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-600/90 border border-blue-400 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">RELIABLE COMMUNITY SERVICE</div>
                      <div className="text-[11px] text-blue-100">Households & institutions receive guaranteed quality</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-white text-blue-900 font-bold">Fulfilled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: DEMAND INTELLIGENCE: "DON'T WAIT FOR DEMAND. PREPARE FOR IT."
          ========================================================================= */}
      <section className="py-20 bg-slate-50/70 dark:bg-[#071426]/75 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E3A5F] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Predictive Workforce Operations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Don’t wait for demand. Prepare for it.
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2">
              Our cooperative engine analyzes past booking velocity, weather signals, and seasonal spikes to forecast demand 7 days in advance — preventing shortages before they happen.
            </p>
          </div>

          {/* Intelligence Visual Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-[#0B1F3A]/90 backdrop-blur-sm border border-slate-200 dark:border-[#1E3A5F] shadow-xl max-w-5xl mx-auto">
            {/* Top Stat Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-[#102A46] border border-blue-100 dark:border-[#1E3A5F]">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Plumbing Demand</div>
                <div className="text-2xl font-extrabold text-blue-600 dark:text-cyan-400 mt-1 flex items-center gap-1">
                  +24% <TrendingUp className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">High weekend surge in Zone A</div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-[#102A46] border border-amber-100 dark:border-[#1E3A5F]">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Electrical Demand</div>
                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  +16% <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Air conditioner & wiring service</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-[#102A46] border border-emerald-100 dark:border-[#1E3A5F]">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Cleaning Demand</div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  +9% <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Water tank & residential hygiene</div>
              </div>
            </div>

            {/* Capacity Alert Banner */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    Predictive Capacity Alert
                  </div>
                  <div className="text-sm font-semibold text-amber-950 dark:text-amber-200 mt-0.5">
                    Zone A may require 5 additional plumbers this weekend.
                  </div>
                  <div className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                    Zone B currently has a surplus of 8 available certified plumbers.
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (user && user.role === "admin") {
                    onNavigateView("admin");
                  } else {
                    openAuthModal("login", "admin");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold tracking-wide transition-colors whitespace-nowrap cursor-pointer"
              >
                Review & Apply Allocation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: FOR CUSTOMERS & FOR WORKERS (SIDE-BY-SIDE VALUE)
          ========================================================================= */}
      <section id="for-workers" className="py-20 bg-white/80 dark:bg-[#071426]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E3A5F] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Customers */}
            <div className="p-8 rounded-2xl bg-white/90 dark:bg-[#0B1F3A]/90 backdrop-blur-sm border border-slate-200 dark:border-[#1E3A5F] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">For Households & Institutions</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 mb-4">
                  Reliable service without predatory markups
                </h3>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">100% Verified Workers:</strong> Background verified, identity checked, cooperative endorsed.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Standardized Daily Tariffs:</strong> Zero surprise charges or dynamic surge gouging during rains or weekends.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Digital Cooperative Receipts:</strong> Official GST-compliant invoices for insurance & tax records.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-[#1E3A5F]">
                <button
                  onClick={() => openAuthModal("register", "customer")}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Create Customer Account
                </button>
              </div>
            </div>

            {/* For Workers */}
            <div className="p-8 rounded-2xl bg-blue-900/95 dark:bg-[#102A46]/95 backdrop-blur-sm text-white border border-blue-800 dark:border-[#1E3A5F] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">For Skilled Workers</span>
                <h3 className="text-2xl font-extrabold text-white mt-2 mb-4">
                  Dignified labor, fair pay & social security
                </h3>
                <ul className="space-y-3 text-sm text-blue-100">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span><strong>95% Net Retention:</strong> You keep 95% of every rupee earned. Only 5% supports collective welfare.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span><strong>Ayushman & Health Insurance:</strong> Hospitalization coverage up to ₹5,00,000 for your family.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span><strong>Skill Certifications:</strong> Free NSQF level upgrading and tool equipment replacement grants.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-800 dark:border-[#1E3A5F]">
                <button
                  onClick={() => openAuthModal("register", "worker")}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-blue-900 text-xs font-bold cursor-pointer transition-colors"
                >
                  Join Cooperative as Worker
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FOR COOPERATIVES (CONTROL CENTER)
          ========================================================================= */}
      <section id="for-cooperatives" className="py-20 bg-slate-50/70 dark:bg-[#071426]/75 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E3A5F] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0F3B66]/95 to-[#0A2744]/95 backdrop-blur-md text-white border border-[#144473] shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#144473] text-cyan-300 text-xs font-bold border border-[#1E4E7A]">
                  <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Enterprise Workforce Control Center</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Empowering cooperatives with intelligence & real-time governance
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Transform traditional manual labor registries into a smart, predictive digital ecosystem. Track member earnings, audit welfare compliance, monitor regional capacity, and dynamically rebalance workforces.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (user && user.role === "admin") {
                        onNavigateView("admin");
                      } else {
                        openAuthModal("login", "admin");
                      }
                    }}
                    className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Launch Cooperative Dashboard</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-3.5 text-left">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700">
                  <div className="text-2xl font-extrabold text-cyan-400">4 Zones</div>
                  <div className="text-xs text-slate-300 mt-1">Live balanced network</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700">
                  <div className="text-2xl font-extrabold text-emerald-400">100%</div>
                  <div className="text-xs text-slate-300 mt-1">Direct digital audits</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700">
                  <div className="text-2xl font-extrabold text-amber-400">7 Days</div>
                  <div className="text-xs text-slate-300 mt-1">Rolling AI forecast</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700">
                  <div className="text-2xl font-extrabold text-blue-400">₹18.4L</div>
                  <div className="text-xs text-slate-300 mt-1">Member payouts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: EMERGENCY SERVICES HIGHLIGHT
          ========================================================================= */}
      <section className="py-14 bg-gradient-to-r from-blue-700/90 via-blue-600/90 to-indigo-700/90 backdrop-blur-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">
                {t.emergencyTitle}
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                {t.emergencySub}
              </p>
            </div>
          </div>

          <button
            onClick={openEmergencyModal}
            className="px-6 py-3.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 active:scale-98 text-xs font-extrabold shadow-lg transition-all whitespace-nowrap cursor-pointer"
          >
            {t.emergencyBtn}
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: TRUST, SAFETY & TRANSPARENCY
          ========================================================================= */}
      <section id="trust" className="py-20 bg-white/80 dark:bg-[#071426]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E3A5F] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Verified Cooperative Standard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built on Trust, Transparency & Human Dignity
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Our cooperative foundation guarantees higher safety, honest pricing, and verified quality for every booking.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
            <div className="p-6 rounded-2xl bg-[#F7FAFF] dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F]">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Verified Skill Certifications</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Workers undergo NSQF technical validation, background verification, and identity audits before being dispatched.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7FAFF] dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F]">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Social Security Integration</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Every service completed directly funds worker insurance, accidental coverage, and health protection schemes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7FAFF] dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F]">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Transparent Digital Auditing</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Full digital invoice generation, clear pricing breakdown, and tamper-proof service records for every citizen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: FINAL CTA SECTION
          ========================================================================= */}
      <section className="py-20 bg-[#0F3B66] text-white text-center transition-colors duration-300 border-t border-[#144473]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#144473] border border-[#1E4E7A] text-cyan-300 text-xs font-bold tracking-wide mb-6">
            <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
            <span>Trusted Services • Stronger Communities • Brighter Futures</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Work should find the right people.<br />
            <span className="text-[#06B6D4]">People should find the right work.</span>
          </h2>
          <p className="text-slate-200 text-sm sm:text-base mt-4 max-w-xl mx-auto">
            Experience the new standard in cooperative workforce networks. Get started today as a household or join as a skilled worker.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              onClick={() => {
                const el = document.getElementById("services");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-sm font-bold shadow-md cursor-pointer transition-colors"
            >
              {t.findServiceBtn}
            </button>
            <button
              onClick={() => openAuthModal("register", "worker")}
              className="px-6 py-3.5 rounded-xl bg-[#144473] hover:bg-[#1A528B] border border-[#1E4E7A] text-white text-sm font-bold cursor-pointer transition-colors"
            >
              {t.joinWorkerBtn}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
