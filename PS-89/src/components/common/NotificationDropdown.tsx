import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, Clock, ShieldAlert, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markNotificationRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#0B1F3A] rounded-lg transition-colors cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#071426] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3.5 bg-slate-50 dark:bg-[#102A46] border-b border-slate-100 dark:border-[#1E3A5F] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Live Network Feed</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1E3A5F]/70">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
                No active notifications
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => markNotificationRead(item.id)}
                  className={`p-3.5 hover:bg-slate-50/80 dark:hover:bg-[#102A46]/80 transition-colors cursor-pointer text-left ${
                    !item.read ? "bg-blue-50/40 dark:bg-blue-950/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {item.type === "ALERT" ? (
                        <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      ) : item.type === "BOOKING" ? (
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
