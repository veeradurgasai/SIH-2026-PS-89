import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", inverted = false }) => {
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11"
  };

  const textClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Network Cooperative Symbol: Hexagonal node mesh with central nexus */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
          {/* Background hexagonal shield */}
          <rect x="2" y="2" width="32" height="32" rx="8" fill={inverted ? "#0B1F3A" : "#2563EB"} />
          
          {/* Cooperative network connecting paths */}
          <path d="M10 18L18 10M18 10L26 18M18 10V26M10 18L18 26M26 18L18 26" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Worker node points */}
          <circle cx="10" cy="18" r="2.5" fill="#06B6D4" />
          <circle cx="26" cy="18" r="2.5" fill="#06B6D4" />
          <circle cx="18" cy="10" r="2.5" fill="#FFFFFF" />
          <circle cx="18" cy="26" r="2.5" fill="#FFFFFF" />
          
          {/* Central cooperative hub */}
          <circle cx="18" cy="18" r="3.2" fill="#FFFFFF" />
          <circle cx="18" cy="18" r="1.5" fill="#2563EB" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-extrabold tracking-tight font-sans ${textClasses[size]} ${inverted ? "text-white" : "text-slate-900 dark:text-white"}`}>
          SHRAM<span className="text-blue-600 dark:text-blue-400">CONNECT</span>
        </span>
        <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 dark:text-slate-400 -mt-1">
          Cooperative Workforce Network
        </span>
      </div>
    </div>
  );
};
