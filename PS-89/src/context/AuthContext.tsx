import React, { createContext, useContext, useState, useEffect } from "react";
import { User, WorkerProfile, CustomerProfile, UserRole } from "../types";

export interface AuthResponse {
  success: boolean;
  error?: string;
  message?: string;
  applicationStatus?: string;
  token?: string;
  verificationId?: string;
  verificationToken?: string;
  formattedMobile?: string;
  expiresInSeconds?: number;
  resendCooldownSeconds?: number;
  waitSeconds?: number;
  remainingAttempts?: number;
  resetToken?: string;
}

interface AuthContextType {
  user: User | null;
  workerProfile: WorkerProfile | null;
  customerProfile: CustomerProfile | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string, role: UserRole, secretCode?: string) => Promise<AuthResponse>;
  sendOtp: (identifier: string, purpose?: string) => Promise<AuthResponse>;
  verifyOtpCode: (verificationId: string, code: string, purpose?: string) => Promise<AuthResponse>;
  registerCustomer: (data: any) => Promise<AuthResponse>;
  applyWorker: (data: any) => Promise<AuthResponse>;
  registerAdmin: (data: any) => Promise<AuthResponse>;
  requestPasswordReset: (identifier: string) => Promise<AuthResponse>;
  resetPassword: (identifier: string, resetToken: string, newPassword: string, confirmPassword: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshAuth: () => Promise<void>;
  updateWorkerAvailability: (status: "available" | "busy" | "offline") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("sc_token"));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshAuth = async () => {
    const savedToken = localStorage.getItem("sc_token");
    if (!savedToken) {
      setUser(null);
      setWorkerProfile(null);
      setCustomerProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${savedToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          setWorkerProfile(data.workerProfile);
          setCustomerProfile(data.customerProfile);
        } else {
          localStorage.removeItem("sc_token");
          setToken(null);
          setUser(null);
        }
      } else {
        localStorage.removeItem("sc_token");
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.warn("Auth check failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (
    identifier: string,
    password: string,
    role: UserRole,
    secretCode?: string
  ): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role, secretCode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("sc_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setWorkerProfile(data.workerProfile);
        setCustomerProfile(data.customerProfile);
        return { success: true, token: data.token };
      }
      return {
        success: false,
        error: data.error || "Authentication failed",
        applicationStatus: data.applicationStatus
      };
    } catch (err: any) {
      console.error("Login error:", err);
      return { success: false, error: err.message || "Network error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (identifier: string, purpose = "customer_register"): Promise<AuthResponse> => {
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: identifier, identifier, purpose })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          verificationId: data.verificationId,
          formattedMobile: data.formattedMobile,
          expiresInSeconds: data.expiresInSeconds,
          resendCooldownSeconds: data.resendCooldownSeconds
        };
      }
      return {
        success: false,
        error: data.error || data.message || "Failed to send SMS OTP",
        waitSeconds: data.waitSeconds
      };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error while sending OTP" };
    }
  };

  const verifyOtpCode = async (verificationId: string, code: string, purpose = "customer_register"): Promise<AuthResponse> => {
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId, otp: code, code, purpose })
      });
      const data = await res.json();
      if (res.ok && data.success && data.verified) {
        return {
          success: true,
          verificationToken: data.verificationToken,
          message: data.message || "Mobile number verified successfully."
        };
      }
      return {
        success: false,
        error: data.error || data.message || "Invalid OTP verification code",
        remainingAttempts: data.remainingAttempts
      };
    } catch (e: any) {
      return { success: false, error: e.message || "Verification request failed" };
    }
  };

  const registerCustomer = async (data: any): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        localStorage.setItem("sc_token", resData.token);
        setToken(resData.token);
        setUser(resData.user);
        setCustomerProfile(resData.customerProfile);
        return { success: true };
      }
      return { success: false, error: resData.error || "Registration failed" };
    } catch (err: any) {
      return { success: false, error: err.message || "Registration error" };
    } finally {
      setLoading(false);
    }
  };

  const applyWorker = async (data: any): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/worker/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        return {
          success: true,
          message: resData.message,
          applicationStatus: resData.applicationStatus
        };
      }
      return { success: false, error: resData.error || "Application submission failed" };
    } catch (err: any) {
      return { success: false, error: err.message || "Application error" };
    } finally {
      setLoading(false);
    }
  };

  const registerAdmin = async (data: any): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        localStorage.setItem("sc_token", resData.token);
        setToken(resData.token);
        setUser(resData.user);
        return { success: true, message: resData.message };
      }
      return { success: false, error: resData.error || "Admin authorization failed" };
    } catch (err: any) {
      return { success: false, error: err.message || "Admin registration error" };
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (identifier: string): Promise<AuthResponse> => {
    try {
      const res = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, mobileNumber: identifier })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          verificationId: data.verificationId,
          formattedMobile: data.formattedMobile,
          expiresInSeconds: data.expiresInSeconds,
          resendCooldownSeconds: data.resendCooldownSeconds
        };
      }
      return {
        success: false,
        error: data.error || data.message || "Failed to send reset verification code",
        waitSeconds: data.waitSeconds
      };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error occurred" };
    }
  };

  const resetPassword = async (
    identifier: string,
    resetToken: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          mobileNumber: identifier,
          resetToken,
          verificationToken: resetToken,
          newPassword,
          confirmPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || "Failed to reset password" };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error during reset" };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem("sc_token");
    setToken(null);
    setUser(null);
    setWorkerProfile(null);
    setCustomerProfile(null);
  };

  const deleteAccount = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem("sc_token");
        setToken(null);
        setUser(null);
        setWorkerProfile(null);
        setCustomerProfile(null);
        return { success: true };
      }
      return { success: false, error: data.error || data.message || "Failed to delete account" };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error deleting account" };
    }
  };

  const updateWorkerAvailability = async (status: "available" | "busy" | "offline") => {
    if (!token) return;
    try {
      const res = await fetch("/api/worker/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success && workerProfile) {
        setWorkerProfile({ ...workerProfile, status: data.status });
      }
    } catch (err) {
      console.error("Failed to update availability:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workerProfile,
        customerProfile,
        token,
        loading,
        login,
        sendOtp,
        verifyOtpCode,
        registerCustomer,
        applyWorker,
        registerAdmin,
        requestPasswordReset,
        resetPassword,
        logout,
        deleteAccount,
        refreshAuth,
        updateWorkerAvailability
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
