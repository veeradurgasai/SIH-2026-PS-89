import React from "react";
import { LogOut, AlertTriangle } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="logout-confirm-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      <div className="bg-white dark:bg-[#0B1F3A] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-[#1E3A5F] text-center space-y-4 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <LogOut className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 id="logout-title" className="text-base font-bold text-slate-900 dark:text-white">
            Are you sure you want to logout?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your active session will be ended securely. You will need to sign in again to access your portal.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            id="logout-cancel-btn"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#102A46] hover:bg-slate-200 dark:hover:bg-[#153556] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="logout-confirm-btn"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
