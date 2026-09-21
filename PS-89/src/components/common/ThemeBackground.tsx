import React from "react";

export const ThemeBackground: React.FC = () => {
  return (
    <div
      id="theme-background-system"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-colors duration-500"
    >
      {/* =========================================================================
          LIGHT MODE ATMOSPHERE (Active when not .dark)
          Non-stretched, resolution-independent vector geometry and soft sky tones
          ========================================================================= */}
      <div className="absolute inset-0 block dark:hidden transition-opacity duration-500">
        {/* Base Celestial Sky-Blue Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#EDF5FF] via-[#F5FAFF] to-[#E5F1FF]" />

        {/* Ambient Top Light Glow - Proportional & Centered */}
        <div
          className="absolute -top-24 sm:-top-32 left-1/2 -translate-x-1/2 w-[90vw] max-w-[900px] h-[350px] sm:h-[500px] rounded-full opacity-50 sm:opacity-60 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(191, 219, 254, 0.55) 0%, rgba(224, 242, 254, 0.25) 50%, transparent 80%)"
          }}
        />

        {/* Top-Right Soft Arc Contour - Scaled & Non-distorted */}
        <div className="absolute -top-16 -right-16 sm:-top-24 sm:-right-24 w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] rounded-full border border-blue-200/50 pointer-events-none opacity-40 bg-gradient-to-br from-white/40 to-blue-100/20" />

        {/* Top-Left Soft Arc Contour - Scaled & Non-distorted */}
        <div className="absolute -top-14 -left-14 sm:-top-20 sm:-left-20 w-[240px] sm:w-[380px] h-[240px] sm:h-[380px] rounded-full border border-blue-200/40 pointer-events-none opacity-30 bg-gradient-to-br from-white/30 to-blue-100/10" />

        {/* Left Side Calligraphy Watermark: "Better Work Brighter Tomorrow" */}
        <div className="absolute left-3 sm:left-6 lg:left-8 bottom-16 sm:bottom-28 lg:bottom-36 pointer-events-none opacity-25 sm:opacity-35 lg:opacity-50 -rotate-6 z-0">
          <div
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-['Caveat',cursive] font-bold text-blue-600/50 leading-[0.95] tracking-tight"
            style={{ textShadow: "0 2px 10px rgba(59, 130, 246, 0.12)" }}
          >
            <div>Better</div>
            <div>Work</div>
            <div>Brighter</div>
            <div>Tomorrow</div>
          </div>
        </div>

        {/* Right Side Calligraphy Watermark: "People Power Progress" */}
        <div className="absolute right-3 sm:right-6 lg:right-10 top-24 sm:top-36 lg:top-48 pointer-events-none opacity-25 sm:opacity-35 lg:opacity-50 -rotate-6 z-0">
          <div
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-['Caveat',cursive] font-bold text-blue-600/50 leading-[0.95] tracking-tight text-right"
            style={{ textShadow: "0 2px 10px rgba(59, 130, 246, 0.12)" }}
          >
            <div>People</div>
            <div>Power</div>
            <div>Progress</div>
          </div>
        </div>

        {/* Dot Matrix Grids (Left & Right margins) */}
        <div className="hidden sm:block absolute left-4 lg:left-6 top-1/3 opacity-25">
          <svg width="60" height="120" viewBox="0 0 60 120" fill="none">
            {Array.from({ length: 24 }).map((_, i) => (
              <circle
                key={i}
                cx={10 + (i % 4) * 14}
                cy={10 + Math.floor(i / 4) * 18}
                r="1.5"
                fill="#2563EB"
              />
            ))}
          </svg>
        </div>
        <div className="hidden sm:block absolute right-4 lg:right-6 top-1/2 opacity-25">
          <svg width="60" height="120" viewBox="0 0 60 120" fill="none">
            {Array.from({ length: 24 }).map((_, i) => (
              <circle
                key={i}
                cx={10 + (i % 4) * 14}
                cy={10 + Math.floor(i / 4) * 18}
                r="1.5"
                fill="#2563EB"
              />
            ))}
          </svg>
        </div>

        {/* Bottom Flowing Waves Layer - Scalable with slice preservation (Never stretched) */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-36 sm:h-56 lg:h-72 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 320"
            fill="none"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="lightWaveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="lightWaveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="lightWaveGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Back Wave */}
            <path
              d="M0,192 C240,96 480,256 720,180 C960,104 1200,240 1440,160 L1440,320 L0,320 Z"
              fill="url(#lightWaveGrad1)"
            />
            {/* Middle Wave */}
            <path
              d="M0,224 C320,160 560,280 840,210 C1120,140 1320,260 1440,210 L1440,320 L0,320 Z"
              fill="url(#lightWaveGrad2)"
            />
            {/* Front Wave */}
            <path
              d="M0,260 C280,210 600,290 920,240 C1240,190 1380,270 1440,250 L1440,320 L0,320 Z"
              fill="url(#lightWaveGrad3)"
            />
          </svg>
        </div>

        {/* Bottom Right Skyline Silhouette */}
        <div className="hidden md:block absolute bottom-0 right-0 w-72 lg:w-96 h-36 lg:h-48 opacity-25 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMax meet" fill="none">
            <defs>
              <linearGradient id="lightCityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <rect x="20" y="80" width="30" height="120" fill="url(#lightCityGrad)" rx="2" />
            <rect x="55" y="50" width="35" height="150" fill="url(#lightCityGrad)" rx="2" />
            <rect x="95" y="100" width="25" height="100" fill="url(#lightCityGrad)" rx="2" />
            <rect x="125" y="30" width="40" height="170" fill="url(#lightCityGrad)" rx="2" />
            <rect x="170" y="70" width="30" height="130" fill="url(#lightCityGrad)" rx="2" />
            <rect x="205" y="40" width="45" height="160" fill="url(#lightCityGrad)" rx="2" />
            <rect x="255" y="90" width="35" height="110" fill="url(#lightCityGrad)" rx="2" />
            <rect x="295" y="60" width="40" height="140" fill="url(#lightCityGrad)" rx="2" />
            <rect x="340" y="75" width="50" height="125" fill="url(#lightCityGrad)" rx="2" />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          DARK MODE ATMOSPHERE (Active when .dark)
          Deep Midnight Obsidian & Sapphire Base with Neon Waves & Crisp Typography
          ========================================================================= */}
      <div className="absolute inset-0 hidden dark:block transition-opacity duration-500">
        {/* Deep Midnight Obsidian & Sapphire Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020817] via-[#041026] to-[#020714]" />

        {/* Central Ambient Deep Sapphire Radial Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 35%, rgba(14, 42, 85, 0.45) 0%, rgba(3, 11, 28, 0.8) 65%, #020817 100%)"
          }}
        />

        {/* Top-Left Glowing Orbital Arc - Proportional without stretch */}
        <div className="absolute -top-24 -left-24 sm:-top-36 sm:-left-36 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full pointer-events-none">
          <div
            className="w-full h-full rounded-full border border-blue-400/20"
            style={{
              background: "radial-gradient(circle at 40% 40%, rgba(37, 99, 235, 0.15) 0%, rgba(15, 23, 42, 0.05) 60%, transparent 80%)",
              boxShadow: "inset 0 0 60px rgba(59, 130, 246, 0.08), 0 0 80px rgba(37, 99, 235, 0.12)"
            }}
          />
        </div>

        {/* Top-Right Glowing Orbital Arc - Proportional without stretch */}
        <div className="absolute -top-28 -right-28 sm:-top-40 sm:-right-40 w-[360px] sm:w-[600px] h-[360px] sm:h-[600px] rounded-full pointer-events-none">
          <div
            className="w-full h-full rounded-full border border-blue-400/15"
            style={{
              background: "radial-gradient(circle at 60% 40%, rgba(6, 182, 212, 0.12) 0%, rgba(15, 23, 42, 0.05) 60%, transparent 80%)",
              boxShadow: "inset 0 0 70px rgba(6, 182, 212, 0.06), 0 0 90px rgba(30, 58, 138, 0.15)"
            }}
          />
        </div>

        {/* Dot Matrix Grids (Left Margin) */}
        <div className="hidden sm:block absolute left-3 sm:left-4 lg:left-6 top-36 sm:top-48 opacity-30 sm:opacity-40">
          <svg width="70" height="150" viewBox="0 0 70 150" fill="none">
            {Array.from({ length: 48 }).map((_, i) => (
              <circle
                key={i}
                cx={8 + (i % 4) * 16}
                cy={8 + Math.floor(i / 4) * 12}
                r="1.5"
                fill="#38BDF8"
              />
            ))}
          </svg>
        </div>

        {/* Dot Matrix Grids (Right Margin) */}
        <div className="hidden sm:block absolute right-3 sm:right-4 lg:right-6 top-48 sm:top-60 opacity-30 sm:opacity-40">
          <svg width="70" height="150" viewBox="0 0 70 150" fill="none">
            {Array.from({ length: 48 }).map((_, i) => (
              <circle
                key={i}
                cx={8 + (i % 4) * 16}
                cy={8 + Math.floor(i / 4) * 12}
                r="1.5"
                fill="#38BDF8"
              />
            ))}
          </svg>
        </div>

        {/* Left Side Calligraphy Watermark: "Better Work Brighter Tomorrow" */}
        <div className="absolute left-3 sm:left-6 lg:left-8 bottom-16 sm:bottom-28 lg:bottom-36 pointer-events-none opacity-20 sm:opacity-30 lg:opacity-45 -rotate-6 z-0">
          <div
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-['Caveat',cursive] font-bold text-blue-300/60 leading-[0.95] tracking-tight"
            style={{ textShadow: "0 0 15px rgba(56, 189, 248, 0.3)" }}
          >
            <div>Better</div>
            <div>Work</div>
            <div>Brighter</div>
            <div>Tomorrow</div>
          </div>
        </div>

        {/* Right Side Calligraphy Watermark: "People Power Progress" */}
        <div className="absolute right-3 sm:right-6 lg:right-10 top-24 sm:top-36 lg:top-48 pointer-events-none opacity-20 sm:opacity-30 lg:opacity-45 -rotate-6 z-0">
          <div
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-['Caveat',cursive] font-bold text-blue-300/60 leading-[0.95] tracking-tight text-right"
            style={{ textShadow: "0 0 15px rgba(56, 189, 248, 0.3)" }}
          >
            <div>People</div>
            <div>Power</div>
            <div>Progress</div>
          </div>
        </div>

        {/* Bottom Luminous Electric Waves - Scaled with slice preservation (Never stretched) */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-40 sm:h-64 lg:h-80 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 380"
            fill="none"
            preserveAspectRatio="xMidYMax slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="neonGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="neonGlowBlue" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="darkWaveGradDeep" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#0F172A" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#020817" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="darkWaveGradMid" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#0369A1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="darkWaveGradFront" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                <stop offset="40%" stopColor="#0891B2" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#020817" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="neonRimGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                <stop offset="25%" stopColor="#60A5FA" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.95" />
                <stop offset="85%" stopColor="#60A5FA" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.2" />
              </linearGradient>

              <linearGradient id="neonRimGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.2" />
                <stop offset="35%" stopColor="#38BDF8" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#60A5FA" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Layer 1: Back Wave */}
            <path
              d="M0,230 C280,140 520,320 800,240 C1080,160 1300,290 1440,200 L1440,380 L0,380 Z"
              fill="url(#darkWaveGradDeep)"
            />
            {/* Layer 1 Neon Rim */}
            <path
              d="M0,230 C280,140 520,320 800,240 C1080,160 1300,290 1440,200"
              stroke="url(#neonRimGrad1)"
              strokeWidth="2.5"
              fill="none"
              filter="url(#neonGlowCyan)"
            />

            {/* Layer 2: Mid Wave with Electric Glow */}
            <path
              d="M0,280 C340,210 620,330 920,260 C1200,190 1360,300 1440,260 L1440,380 L0,380 Z"
              fill="url(#darkWaveGradMid)"
            />
            {/* Layer 2 Neon Rim */}
            <path
              d="M0,280 C340,210 620,330 920,260 C1200,190 1360,300 1440,260"
              stroke="url(#neonRimGrad2)"
              strokeWidth="3"
              fill="none"
              filter="url(#neonGlowCyan)"
            />

            {/* Layer 3: Front Low Subtle Wave */}
            <path
              d="M0,320 C260,280 580,350 880,310 C1180,270 1340,340 1440,310 L1440,380 L0,380 Z"
              fill="url(#darkWaveGradFront)"
            />
            <path
              d="M0,320 C260,280 580,350 880,310 C1180,270 1340,340 1440,310"
              stroke="#60A5FA"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              fill="none"
              filter="url(#neonGlowBlue)"
            />
          </svg>
        </div>

        {/* Night City Skyline Silhouette */}
        <div className="hidden md:block absolute bottom-0 right-0 w-72 lg:w-96 h-36 lg:h-48 opacity-35 pointer-events-none">
          <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMax meet" fill="none">
            <defs>
              <linearGradient id="darkCityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#0B1F3A" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#020817" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <rect x="20" y="80" width="30" height="120" fill="url(#darkCityGrad)" rx="2" />
            <rect x="55" y="50" width="35" height="150" fill="url(#darkCityGrad)" rx="2" />
            <circle cx="65" cy="70" r="1.5" fill="#FBBF24" opacity="0.8" />
            <circle cx="75" cy="70" r="1.5" fill="#FBBF24" opacity="0.8" />
            <circle cx="65" cy="90" r="1.5" fill="#38BDF8" opacity="0.8" />
            <rect x="95" y="100" width="25" height="100" fill="url(#darkCityGrad)" rx="2" />
            <rect x="125" y="30" width="40" height="170" fill="url(#darkCityGrad)" rx="2" />
            <circle cx="138" cy="45" r="1.5" fill="#FBBF24" opacity="0.9" />
            <circle cx="150" cy="45" r="1.5" fill="#FBBF24" opacity="0.9" />
            <circle cx="138" cy="65" r="1.5" fill="#FBBF24" opacity="0.7" />
            <rect x="170" y="70" width="30" height="130" fill="url(#darkCityGrad)" rx="2" />
            <rect x="205" y="40" width="45" height="160" fill="url(#darkCityGrad)" rx="2" />
            <circle cx="220" cy="55" r="1.5" fill="#FBBF24" opacity="0.85" />
            <circle cx="235" cy="55" r="1.5" fill="#38BDF8" opacity="0.85" />
            <rect x="255" y="90" width="35" height="110" fill="url(#darkCityGrad)" rx="2" />
            <rect x="295" y="60" width="40" height="140" fill="url(#darkCityGrad)" rx="2" />
            <rect x="340" y="75" width="50" height="125" fill="url(#darkCityGrad)" rx="2" />
          </svg>
        </div>

        {/* Subtle Bottom Ambient Floor Light */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-20 sm:h-24 pointer-events-none opacity-40"
          style={{
            background: "radial-gradient(ellipse at center bottom, rgba(56, 189, 248, 0.25) 0%, rgba(37, 99, 235, 0.15) 40%, transparent 80%)"
          }}
        />
      </div>
    </div>
  );
};
