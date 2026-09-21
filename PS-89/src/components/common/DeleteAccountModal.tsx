import React, { useState } from "react";
import { AlertTriangle, Trash2, X, ShieldAlert, Loader2, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { user, deleteAccount } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your account password to confirm deletion.");
      return;
    }

    setIsDeleting(true);
    setError(null);

    const result = await deleteAccount(password);
    if (result.success) {
      setIsDeleted(true);
      setTimeout(() => {
        onClose();
        window.location.href = "/";
      }, 1500);
    } else {
      setError(result.error || "Failed to delete account. Incorrect password or verification failed.");
      setIsDeleting(false);
    }
  };

  return (
    <div
      id="modal-delete-account"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-[#0B1F3A] border border-red-200 dark:border-red-900/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-left">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1E3A5F] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify your password to permanently delete your account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDeleted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Account Deleted</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your account and associated records have been permanently removed. Redirecting...
            </p>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>Security Verification Required</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-700/90 dark:text-red-300/90">
                Deleting your account will immediately remove your credentials, profile, active sessions, and unlink
                your registered email ({user?.email}) and phone number ({user?.phone}).
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-confirm-delete-account-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  required
                  autoFocus
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-xl bg-white dark:bg-[#102A46] text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-red-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Enter the password for your account to authorize permanent deletion.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-[#1E3A5F]">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-account-submit"
                type="submit"
                disabled={!password.trim() || isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
