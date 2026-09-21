import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { UserRole } from "../../types";
import {
  X,
  ArrowRight,
  UserCheck,
  Wrench,
  Shield,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  KeyRound,
  FileCheck,
  AlertCircle,
  Clock,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  Check,
  Edit2,
  ShieldCheck,
  UploadCloud,
  FileText,
  Trash2,
  FilePlus,
  Paperclip
} from "lucide-react";

interface AuthModalProps {
  onSuccessRole: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccessRole }) => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, authModalRole, t } = useApp();
  const {
    login,
    sendOtp,
    verifyOtpCode,
    registerCustomer,
    applyWorker,
    registerAdmin,
    requestPasswordReset,
    resetPassword,
    loading
  } = useAuth();

  // Mode: "login" | "register" | "forgot_password"
  const [mode, setMode] = useState<"login" | "register" | "forgot_password">(authModalMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(authModalRole);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginAdminSecretCode, setLoginAdminSecretCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);

  // Common Registration state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [zone, setZone] = useState("Zone A");
  const [address, setAddress] = useState("");

  // OTP State (Message Central VerifyNow)
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verificationId, setVerificationId] = useState<string>("");
  const [verificationToken, setVerificationToken] = useState<string>("");
  const [formattedMobile, setFormattedMobile] = useState<string>("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Worker Application Specific
  const [idProofType, setIdProofType] = useState("Aadhaar Card");
  const [idProofNumber, setIdProofNumber] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["cat-plumbing"]);
  const [experienceYears, setExperienceYears] = useState("4");
  const [hourlyRate, setHourlyRate] = useState("350");
  const [bio, setBio] = useState("");

  const toggleWorkerSkill = (skillId: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillId)) {
        if (prev.length === 1) return prev; // At least one trade profession must be selected
        return prev.filter(s => s !== skillId);
      } else {
        return [...prev, skillId];
      }
    });
  };

  // Problem 3: Mandatory Document Slots & Brief Explanation for Worker
  const [docSlotsCount, setDocSlotsCount] = useState<number>(3);
  const [briefExplanation, setBriefExplanation] = useState<string>("");
  const [isWorkerPendingNotice, setIsWorkerPendingNotice] = useState<boolean>(false);
  const [uploadSlots, setUploadSlots] = useState<{
    id: string;
    title: string;
    category: string;
    docNumber: string;
    fileName: string;
    fileSize: string;
    isUploaded: boolean;
  }[]>([
    {
      id: "slot-1",
      title: "Government Identity Proof (Aadhaar / Voter ID / PAN)",
      category: "GOVERNMENT_ID",
      docNumber: "",
      fileName: "",
      fileSize: "",
      isUploaded: false
    },
    {
      id: "slot-2",
      title: "Trade Qualification / Skill Certificate / ITI",
      category: "SKILL_CERTIFICATE",
      docNumber: "",
      fileName: "",
      fileSize: "",
      isUploaded: false
    },
    {
      id: "slot-3",
      title: "Residential Address / Police Clearance",
      category: "ADDRESS_PROOF",
      docNumber: "",
      fileName: "",
      fileSize: "",
      isUploaded: false
    },
    {
      id: "slot-4",
      title: "Work Experience / Tools Ownership Proof",
      category: "EXPERIENCE_LETTER",
      docNumber: "",
      fileName: "",
      fileSize: "",
      isUploaded: false
    }
  ]);

  const handleSlotFileChange = (index: number, file: File | null) => {
    if (!file) return;
    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setUploadSlots(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        fileName: file.name,
        fileSize: formattedSize,
        isUploaded: true
      };
      return copy;
    });
  };

  const handleSlotDocNumberChange = (index: number, val: string) => {
    setUploadSlots(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], docNumber: val };
      return copy;
    });
    if (index === 0) {
      setIdProofNumber(val);
    }
  };

  const handleRemoveSlotFile = (index: number) => {
    setUploadSlots(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        fileName: "",
        fileSize: "",
        isUploaded: false
      };
      return copy;
    });
  };

  const handleQuickFillStandardDocs = () => {
    const defaultDocNum = idProofNumber.trim() || "9845-2311-8842";
    if (!idProofNumber) setIdProofNumber("9845-2311-8842");
    setUploadSlots([
      {
        id: "slot-1",
        title: "Government Identity Proof (Aadhaar / Voter ID / PAN)",
        category: "GOVERNMENT_ID",
        docNumber: defaultDocNum,
        fileName: "aadhaar_card_scanned_verified.pdf",
        fileSize: "1.4 MB",
        isUploaded: true
      },
      {
        id: "slot-2",
        title: "Trade Qualification / Skill Certificate / ITI",
        category: "SKILL_CERTIFICATE",
        docNumber: "ITI-KA-BLR-2021-994",
        fileName: "vocational_trade_certificate_iti.pdf",
        fileSize: "2.1 MB",
        isUploaded: true
      },
      {
        id: "slot-3",
        title: "Residential Address / Police Clearance",
        category: "ADDRESS_PROOF",
        docNumber: "BESCOM-RR-684210",
        fileName: "residential_electricity_bill_verified.pdf",
        fileSize: "850 KB",
        isUploaded: true
      },
      {
        id: "slot-4",
        title: "Work Experience / Tools Ownership Proof",
        category: "EXPERIENCE_LETTER",
        docNumber: "COOP-EXP-2022-44",
        fileName: "prior_trade_experience_letter.pdf",
        fileSize: "1.1 MB",
        isUploaded: true
      }
    ]);
    if (!briefExplanation.trim()) {
      setBriefExplanation("ITI certified technician with 4+ years of hands-on experience in residential plumbing and pipefitting. Owns industrial threading machine, high-pressure test gauge, and complete toolkit. Committed to transparent, union-regulated service delivery.");
    }
  };

  // Admin Specific
  const [adminAccessCode, setAdminAccessCode] = useState("");
  const [adminCooperativeId, setAdminCooperativeId] = useState("coop-blr-central");

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotVerificationId, setForgotVerificationId] = useState("");
  const [forgotOtpCode, setForgotOtpCode] = useState("");
  const [forgotVerificationToken, setForgotVerificationToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotCooldown, setForgotCooldown] = useState(0);

  // Status feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [workerSubmittedNotice, setWorkerSubmittedNotice] = useState<string | null>(null);

  // Synchronize modal state with global AppContext triggers
  useEffect(() => {
    if (authModalMode === "login" || authModalMode === "register") {
      setMode(authModalMode);
    }
    if (authModalRole) {
      setSelectedRole(authModalRole);
      if (authModalRole === "admin" && authModalMode === "login") {
        setLoginEmail("demo.admin@example.com");
        setLoginPassword("Shramik@2026");
        setLoginAdminSecretCode("");
        setSuccessMsg("Demo admin credentials loaded. Enter Admin's code to login.");
      }
    }
  }, [authModalMode, authModalRole, isAuthModalOpen]);

  // Cooldown countdown timer for registration OTP
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Cooldown countdown timer for forgot password OTP
  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const timer = setInterval(() => {
      setForgotCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  // WebOTP API: automatically capture incoming SMS OTP when supported by browser
  useEffect(() => {
    if (!otpSent || mobileVerified || typeof window === "undefined") return;

    if ("OTPCredential" in window && (window as any).navigator?.credentials) {
      const abortController = new AbortController();
      (navigator.credentials as any)
        ?.get({
          otp: { transport: ["sms"] },
          signal: abortController.signal
        })
        .then((credential: any) => {
          if (credential && credential.code) {
            const clean = credential.code.replace(/\D/g, "").slice(0, 6);
            setOtpCode(clean);
          }
        })
        .catch(() => {
          // Graceful fallback to manual entry when WebOTP is unsupported or aborted
        });

      return () => abortController.abort();
    }
  }, [otpSent, mobileVerified]);

  // WebOTP for Forgot Password OTP
  useEffect(() => {
    if (forgotStep !== 2 || typeof window === "undefined") return;

    if ("OTPCredential" in window && (window as any).navigator?.credentials) {
      const abortController = new AbortController();
      (navigator.credentials as any)
        ?.get({
          otp: { transport: ["sms"] },
          signal: abortController.signal
        })
        .then((credential: any) => {
          if (credential && credential.code) {
            const clean = credential.code.replace(/\D/g, "").slice(0, 6);
            setForgotOtpCode(clean);
          }
        })
        .catch(() => {});

      return () => abortController.abort();
    }
  }, [forgotStep]);

  if (!isAuthModalOpen) return null;

  // Select login role and clear all previous login credentials
  const handleSelectLoginRole = (role: UserRole) => {
    setSelectedRole(role);
    setLoginEmail("");
    setLoginPassword("");
    setLoginAdminSecretCode("");
    setError(null);
    setSuccessMsg(null);
  };

  // Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!selectedRole) {
      setError("Please select a login role (Customer, Worker, or Admin).");
      return;
    }

    if (!loginEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!loginPassword) {
      setError("Please enter your password.");
      return;
    }

    if (selectedRole === "admin" && !loginAdminSecretCode.trim()) {
      setError("Please enter Admin's code.");
      return;
    }

    const res = await login(
      loginEmail.trim(),
      loginPassword,
      selectedRole,
      selectedRole === "admin" ? loginAdminSecretCode.trim() : undefined
    );

    if (res.success) {
      closeAuthModal();
      onSuccessRole(selectedRole);
    } else {
      if (
        res.applicationStatus === "PENDING" ||
        res.error?.toLowerCase().includes("under review") ||
        res.error?.toLowerCase().includes("pending")
      ) {
        setIsWorkerPendingNotice(true);
      }
      setError(res.error || "Invalid credentials. Please check your details and try again.");
      // Security standard: Clear password, keep email field editable so user can retry immediately
      setLoginPassword("");
    }
  };

  // Send real SMS OTP for registration (Message Central VerifyNow)
  const handleSendRegisterOtp = async () => {
    if (!phone) {
      setError("Please enter your 10-digit Indian mobile number to receive an SMS verification code.");
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setOtpSending(true);

    const purpose = selectedRole === "worker" ? "worker_register" : "customer_register";
    const res = await sendOtp(phone, purpose);
    setOtpSending(false);

    if (res.success && res.verificationId) {
      setOtpSent(true);
      setVerificationId(res.verificationId);
      setFormattedMobile(res.formattedMobile || phone);
      setOtpCooldown(res.resendCooldownSeconds || 45);
      setSuccessMsg(`Verification code dispatched via SMS to ${res.formattedMobile || phone}.`);
    } else {
      setError(res.error || "Unable to dispatch SMS verification code. Please check your number.");
      if (res.waitSeconds) {
        setOtpCooldown(res.waitSeconds);
      }
    }
  };

  // Verify OTP for registration
  const handleVerifyRegisterOtp = async () => {
    if (!verificationId) {
      setError("Please request a verification code first.");
      return;
    }
    const cleanOtp = otpCode.replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code sent via SMS.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setOtpVerifying(true);

    const purpose = selectedRole === "worker" ? "worker_register" : "customer_register";
    const res = await verifyOtpCode(verificationId, cleanOtp, purpose);
    setOtpVerifying(false);

    if (res.success && res.verificationToken) {
      setMobileVerified(true);
      setVerificationToken(res.verificationToken);
      setSuccessMsg("Mobile number verified successfully! Please complete your account details below.");
    } else {
      setError(res.error || "Invalid verification code. Please check and try again.");
    }
  };

  // Customer Registration Submit
  const handleCustomerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!mobileVerified || !verificationToken) {
      setError("Please verify your mobile number with SMS OTP before submitting registration.");
      return;
    }

    if (!name || !phone || !email || !password || !confirmPassword) {
      setError("Please fill in all mandatory profile fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const res = await registerCustomer({
      name,
      phone,
      email,
      password,
      confirmPassword,
      zone,
      address,
      verificationId,
      verificationToken
    });

    if (res.success) {
      closeAuthModal();
      onSuccessRole("customer");
    } else {
      setError(res.error || "Customer registration failed.");
    }
  };

  // Worker Application Submit (Worker creates password here; account is PENDING until approved)
  const handleWorkerApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!mobileVerified || !verificationToken) {
      setError("Please verify your mobile number with SMS OTP before submitting your application.");
      return;
    }

    if (!name || !phone || !email || !password || !confirmPassword) {
      setError("Full name, phone, email, and password are mandatory.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Problem 3: Enforce mandatory document slots and document numbers
    const activeSlots = uploadSlots.slice(0, docSlotsCount);
    const incompleteSlot = activeSlots.find(s => !s.isUploaded || !s.docNumber.trim());
    if (incompleteSlot) {
      setError(`All ${docSlotsCount} document slots are mandatory. Please provide a document/registration number and upload a file for: ${incompleteSlot.title}.`);
      return;
    }

    // Problem 3: Enforce mandatory brief explanation
    const cleanExplanation = briefExplanation.trim();
    if (!cleanExplanation || cleanExplanation.length < 15) {
      setError("A brief explanation of your trade experience, equipment owned, and work background (minimum 15 characters) is mandatory.");
      return;
    }

    const documentsToSubmit = activeSlots.map((s, idx) => ({
      slotNumber: idx + 1,
      name: s.title,
      type: s.category,
      documentNumber: s.docNumber,
      fileName: s.fileName,
      fileSize: s.fileSize,
      uploadedAt: new Date().toISOString()
    }));

    const res = await applyWorker({
      name,
      phone,
      email,
      password,
      confirmPassword,
      zone,
      address,
      skills: selectedSkills,
      experienceYears: Number(experienceYears) || 3,
      hourlyRate: Number(hourlyRate) || 350,
      idProofType,
      idProofNumber: activeSlots[0]?.docNumber || idProofNumber || "DOC-VERIFIED",
      bio: cleanExplanation,
      briefExplanation: cleanExplanation,
      documents: documentsToSubmit,
      documentCount: documentsToSubmit.length,
      verificationId,
      verificationToken
    });

    if (res.success) {
      setWorkerSubmittedNotice(res.message || "Application submitted for cooperative administrative review.");
    } else {
      setError(res.error || "Worker application submission failed.");
    }
  };

  // Admin Registration Submit
  const handleAdminRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !phone || !email || !password || !confirmPassword || !adminAccessCode) {
      setError("All fields including the Administrative Access Code are mandatory.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const res = await registerAdmin({
      name,
      phone,
      email,
      password,
      confirmPassword,
      adminAccessCode,
      cooperativeId: adminCooperativeId
    });

    if (res.success) {
      closeAuthModal();
      onSuccessRole("admin");
    } else {
      setError(res.error || "Admin registration authorization failed.");
    }
  };

  // Forgot Password: Step 1 Send SMS OTP
  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!forgotIdentifier) {
      setError("Please enter your registered mobile number or email.");
      return;
    }
    const res = await requestPasswordReset(forgotIdentifier);
    if (res.success && res.verificationId) {
      setForgotVerificationId(res.verificationId);
      setForgotStep(2);
      setForgotCooldown(res.resendCooldownSeconds || 45);
      setSuccessMsg(`Verification code dispatched via SMS to ${res.formattedMobile || forgotIdentifier}.`);
    } else {
      setError(res.error || "No account found matching this mobile number or email.");
    }
  };

  // Forgot Password: Step 2 Verify OTP
  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = forgotOtpCode.replace(/\D/g, "");
    if (clean.length !== 6) {
      setError("Please enter the complete 6-digit verification code sent via SMS.");
      return;
    }
    const res = await verifyOtpCode(forgotVerificationId, clean, "forgot_password");
    if (res.success && res.verificationToken) {
      setForgotVerificationToken(res.verificationToken);
      setForgotStep(3);
      setSuccessMsg("Identity confirmed. Please set your new account password.");
    } else {
      setError(res.error || "Invalid or expired verification code.");
    }
  };

  // Forgot Password: Step 3 Reset Password
  const handleForgotStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || !confirmNewPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    const res = await resetPassword(
      forgotIdentifier,
      forgotVerificationToken,
      newPassword,
      confirmNewPassword
    );
    if (res.success) {
      setSuccessMsg("Password reset successfully! You can now sign in.");
      setTimeout(() => {
        setMode("login");
        setForgotStep(1);
        setLoginEmail(forgotIdentifier);
        setLoginPassword(newPassword);
      }, 1200);
    } else {
      setError(res.error || "Password reset failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-white dark:bg-[#0B1F3A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E3A5F] overflow-hidden transition-colors">
        
        {/* Header Banner */}
        <div className="bg-[#0B1F3A] dark:bg-[#071426] text-white px-6 py-5 flex items-center justify-between border-b border-transparent dark:border-[#1E3A5F]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold mb-1 border border-cyan-500/30">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cooperative Trust & Identity Gateway</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">
              {mode === "login"
                ? "ShramConnect Secure Login"
                : mode === "forgot_password"
                ? "Account Recovery & Password Reset"
                : selectedRole === "worker"
                ? "Worker Cooperative Application"
                : selectedRole === "admin"
                ? "Federation Administrator Access"
                : "Register Customer Account"}
            </h3>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Login and Register */}
        <div className="flex border-b border-slate-200 dark:border-[#1E3A5F] bg-slate-50/70 dark:bg-[#102A46]">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccessMsg(null);
              setWorkerSubmittedNotice(null);
            }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors cursor-pointer ${
              mode === "login"
                ? "text-blue-600 dark:text-cyan-400 border-b-2 border-blue-600 dark:border-cyan-400 bg-white dark:bg-[#0B1F3A]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Secure Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
              setSuccessMsg(null);
              setWorkerSubmittedNotice(null);
            }}
            className={`flex-1 py-3 text-xs font-bold text-center transition-colors cursor-pointer ${
              mode === "register"
                ? "text-blue-600 dark:text-cyan-400 border-b-2 border-blue-600 dark:border-cyan-400 bg-white dark:bg-[#0B1F3A]"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Create Account / Apply
          </button>
        </div>

        <div className="p-6">
          {/* Notifications / Feedback */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* Special Worker Submitted Notice Screen */}
          {workerSubmittedNotice && (
            <div className="p-6 rounded-2xl bg-blue-50 dark:bg-[#102A46] border border-blue-200 dark:border-[#1E3A5F] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                Application Received for Cooperative Verification
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {workerSubmittedNotice}
              </p>
              <div className="p-3 rounded-xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] text-left text-xs space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">What happens next:</div>
                <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Administrative committee verifies Government ID ({idProofType})</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Once approved in the Admin Roster, login is enabled using the password you set during registration</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setWorkerSubmittedNotice(null);
                  setMode("login");
                }}
                className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          )}

          {/* Mode 1: Login */}
          {!workerSubmittedNotice && mode === "login" && (
            <div>
              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    LOGIN AS
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      id="role-btn-customer"
                      onClick={() => handleSelectLoginRole("customer")}
                      className={`py-2 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                        selectedRole === "customer"
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 dark:bg-[#102A46] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E3A5F] hover:bg-slate-100 dark:hover:bg-[#1E3A5F]"
                      }`}
                    >
                      CUSTOMER
                    </button>
                    <button
                      type="button"
                      id="role-btn-worker"
                      onClick={() => handleSelectLoginRole("worker")}
                      className={`py-2 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                        selectedRole === "worker"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-50 dark:bg-[#102A46] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E3A5F] hover:bg-slate-100 dark:hover:bg-[#1E3A5F]"
                      }`}
                    >
                      WORKER
                    </button>
                    <button
                      type="button"
                      id="role-btn-admin"
                      onClick={() => handleSelectLoginRole("admin")}
                      className={`py-2 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                        selectedRole === "admin"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-50 dark:bg-[#102A46] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E3A5F] hover:bg-slate-100 dark:hover:bg-[#1E3A5F]"
                      }`}
                    >
                      ADMIN
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      autoComplete="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder={
                        selectedRole === "worker"
                          ? "worker@cooperative.org"
                          : selectedRole === "admin"
                          ? "admin@cooperative.org"
                          : "customer@example.com"
                      }
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-white dark:bg-[#102A46] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot_password");
                        setForgotStep(1);
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                    <input
                      id="login-password-input"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-white dark:bg-[#102A46] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mandatory Admin's Code for Administrator Login */}
                {selectedRole === "admin" && (
                  <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Admin's Code *</span>
                      </label>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded border border-amber-300/60 dark:border-amber-700/50">
                        Mandatory
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5" />
                      <input
                        id="login-admin-secret-code-input"
                        type={showAdminSecret ? "text" : "password"}
                        required
                        autoComplete="off"
                        value={loginAdminSecretCode}
                        onChange={e => setLoginAdminSecretCode(e.target.value)}
                        placeholder="Enter Admin's code"
                        className="w-full pl-9 pr-9 py-2 text-xs font-mono font-bold tracking-wider border border-indigo-300 dark:border-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white placeholder-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminSecret(!showAdminSecret)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showAdminSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Worker Approval Notice & Link to Application / Documents */}
                {selectedRole === "worker" && (
                  <div className="space-y-2 pt-1">
                    {isWorkerPendingNotice ? (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs space-y-1.5 animate-in fade-in">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>Application Under Administrator Scrutiny</span>
                        </div>
                        <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                          Your worker application, document slots, and brief explanation are currently under administrative review. Under cooperative rules, you can log in with these exact credentials once an administrator verifies and approves your account.
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <div className="text-[11px] leading-relaxed">
                          <span className="font-bold block text-emerald-950 dark:text-emerald-200">Admin Approval Mandate</span>
                          Worker accounts require administrative verification. Once approved, log in with your registered email and password.
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setSelectedRole("worker");
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/50 hover:bg-emerald-200/70 dark:hover:bg-emerald-900/50 border border-emerald-300/70 dark:border-emerald-700/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FilePlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>New Worker? Submit Application & Mandatory Documents →</span>
                    </button>
                  </div>
                )}

                <button
                  id="login-submit-button"
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 text-xs font-bold text-white rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                    selectedRole === "customer"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : selectedRole === "worker"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? "Authenticating..." : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Access / Restored Demos */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-[#1E3A5F]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>{t.demoAccount} / 1-Click Test Access</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Auto-fills & logs in
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Demo Customer */}
                  <button
                    type="button"
                    id="demo-customer-login-btn"
                    onClick={async () => {
                      setSelectedRole("customer");
                      setLoginEmail("demo.customer@example.com");
                      setLoginPassword("Shramik@2026");
                      setError(null);
                      setSuccessMsg("Logging in as Demo Customer...");
                      const res = await login("demo.customer@example.com", "Shramik@2026", "customer");
                      if (res.success) {
                        closeAuthModal();
                        onSuccessRole("customer");
                      } else {
                        setError(res.error || "Login failed");
                        setSuccessMsg(null);
                      }
                    }}
                    className="p-2.5 text-left rounded-xl bg-blue-50/80 dark:bg-blue-950/30 hover:bg-blue-100/90 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900/60 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Customer</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 font-semibold">Demo</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-1">
                      demo.customer@example.com
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold mt-1 group-hover:underline flex items-center gap-0.5">
                      <span>Sign In</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </button>

                  {/* Demo Worker */}
                  <button
                    type="button"
                    id="demo-worker-login-btn"
                    onClick={async () => {
                      setSelectedRole("worker");
                      setLoginEmail("demo.worker@example.com");
                      setLoginPassword("Shramik@2026");
                      setError(null);
                      setSuccessMsg("Logging in as Demo Worker...");
                      const res = await login("demo.worker@example.com", "Shramik@2026", "worker");
                      if (res.success) {
                        closeAuthModal();
                        onSuccessRole("worker");
                      } else {
                        setError(res.error || "Login failed");
                        setSuccessMsg(null);
                      }
                    }}
                    className="p-2.5 text-left rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-900/60 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Worker</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-semibold">Demo</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-1">
                      demo.worker@example.com
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 group-hover:underline flex items-center gap-0.5">
                      <span>Sign In (Ravi)</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </button>

                  {/* Demo Admin */}
                  <button
                    type="button"
                    id="demo-admin-login-btn"
                    onClick={() => {
                      setSelectedRole("admin");
                      setLoginEmail("demo.admin@example.com");
                      setLoginPassword("Shramik@2026");
                      setLoginAdminSecretCode("");
                      setError(null);
                      setSuccessMsg("Demo admin credentials loaded. Enter Admin's code to login.");
                      setTimeout(() => {
                        document.getElementById("login-admin-secret-code-input")?.focus();
                      }, 100);
                    }}
                    className="p-2.5 text-left rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 hover:bg-indigo-100/90 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-900/60 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Admin</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 font-semibold">Demo</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-1">
                      demo.admin@example.com
                    </div>
                    <div className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">
                      Admin's code required
                    </div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 group-hover:underline flex items-center gap-0.5">
                      <span>Enter Code & Sign In</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </button>
                </div>

                <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 text-center flex flex-wrap items-center justify-center gap-1.5">
                  <span>Demo Password: <span className="font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#102A46] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#1E3A5F]">Shramik@2026</span></span>
                  <span className="text-slate-400">•</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">Admin login strictly requires Admin's code</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Register (Customer & Worker use SMS OTP; Admin uses Access Code) */}
          {!workerSubmittedNotice && mode === "register" && (
            <div>
              {/* Account Type Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Account Registration Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("customer");
                      setError(null);
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                      selectedRole === "customer"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 dark:bg-[#102A46] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E3A5F]"
                    }`}
                  >
                    Customer
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("worker");
                      setError(null);
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                      selectedRole === "worker"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 dark:bg-[#102A46] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E3A5F]"
                    }`}
                  >
                    Worker Application
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("admin");
                      setError(null);
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                      selectedRole === "admin"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 dark:bg-[#102A46] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E3A5F]"
                    }`}
                  >
                    Federation Admin
                  </button>
                </div>
              </div>

              {/* Step 1 for Customer & Worker: Mobile SMS OTP Verification */}
              {selectedRole !== "admin" && !mobileVerified && (
                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-[#102A46] border border-blue-100 dark:border-[#1E3A5F] space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-cyan-300 font-bold text-xs">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                    <span>Mobile SMS Verification (Message Central VerifyNow)</span>
                  </div>

                  {!otpSent ? (
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Enter your 10-digit Indian mobile number to receive a one-time verification code via SMS:
                      </p>
                      <div className="flex gap-2">
                        <div className="flex items-center px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-[#0B1F3A] border border-slate-300 dark:border-[#1E3A5F] rounded-lg text-slate-700 dark:text-slate-200 shrink-0">
                          🇮🇳 +91
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          maxLength={14}
                          className="flex-1 px-3 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleSendRegisterOtp}
                          disabled={otpSending || !phone.trim()}
                          className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                        >
                          {otpSending ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Send OTP</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* OTP Verification Screen */
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white">
                            Verify your mobile number
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400">
                            Enter the 6-digit verification code sent to {formattedMobile || phone}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode("");
                            setError(null);
                          }}
                          className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Change Number</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={otpCode}
                            onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                          />
                          {otpCode.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setOtpCode("")}
                              className="absolute right-3 top-2.5 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={handleSendRegisterOtp}
                            disabled={otpCooldown > 0 || otpSending}
                            className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${otpSending ? "animate-spin" : ""}`} />
                            <span>
                              {otpCooldown > 0 ? `Resend code in ${otpCooldown}s` : "Didn't receive code? Resend OTP"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={handleVerifyRegisterOtp}
                            disabled={otpVerifying || otpCode.replace(/\D/g, "").length !== 6}
                            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            {otpVerifying ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Verify Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Verified Mobile Status Chip */}
              {selectedRole !== "admin" && mobileVerified && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Mobile Verified: {formattedMobile || phone}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                    SMS Confirmed
                  </span>
                </div>
              )}

              {/* Registration Form (Visible when Mobile is Verified, or for Admin) */}
              {(mobileVerified || selectedRole === "admin") && (
                <form
                  onSubmit={
                    selectedRole === "worker"
                      ? handleWorkerApplySubmit
                      : selectedRole === "admin"
                      ? handleAdminRegisterSubmit
                      : handleCustomerRegisterSubmit
                  }
                  className="space-y-3"
                >
                  {/* Name & Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Suresh Gowda"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        readOnly={selectedRole !== "admin"}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 00000"
                        className={`w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg text-slate-900 dark:text-white ${
                          selectedRole !== "admin" ? "bg-slate-100 dark:bg-[#0B1F3A]/70 cursor-not-allowed" : "bg-white dark:bg-[#102A46]"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="suresh@example.com"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Passwords */}
                  <div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? "text" : "password"}
                            required
                            minLength={6}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Min. 6 chars"
                            className="w-full px-3 pr-8 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type={showRegPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    {selectedRole === "worker" && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Workers use this password to sign in once approved by cooperative administrators.
                      </p>
                    )}
                  </div>

                  {/* Worker Specific Vetting, Document Slots & Brief Explanation (Problem 3) */}
                  {selectedRole === "worker" && (
                    <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-[#102A46] border border-emerald-200 dark:border-[#1E3A5F] space-y-4">
                      <div className="flex items-center justify-between pb-1 border-b border-emerald-200/60 dark:border-[#1E3A5F]">
                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                          <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Cooperative Vetting & Mandatory Verification Slots</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleQuickFillStandardDocs}
                          className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 px-2 py-1 rounded-md border border-emerald-300/70 dark:border-emerald-700/60 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Autofill Verified Docs (Quick Test)</span>
                        </button>
                      </div>

                      {/* Trade and Profession Multi-Selection (Problem 2) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            Registered Profession(s) / Works <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                            {selectedSkills.length} Work{selectedSkills.length > 1 ? "s" : ""} Selected
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Select one or more works as your profession:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5">
                          {[
                            { id: "cat-plumbing", name: "Plumbing" },
                            { id: "cat-electrical", name: "Electrical" },
                            { id: "cat-carpentry", name: "Carpentry" },
                            { id: "cat-painting", name: "Painting" },
                            { id: "cat-cleaning", name: "Cleaning" },
                            { id: "cat-caregiving", name: "Caregiving" },
                            { id: "cat-driving", name: "Driving" },
                            { id: "cat-gardening", name: "Gardening" },
                            { id: "cat-technician", name: "Technician Services" }
                          ].map(trade => {
                            const isChecked = selectedSkills.includes(trade.id);
                            return (
                              <button
                                key={trade.id}
                                type="button"
                                onClick={() => toggleWorkerSkill(trade.id)}
                                className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-left transition-all border flex items-center justify-between gap-1 cursor-pointer ${
                                  isChecked
                                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                    : "bg-slate-50 dark:bg-[#0B1F3A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E3A5F] hover:border-slate-300"
                                }`}
                              >
                                <span className="truncate">{trade.name}</span>
                                {isChecked ? (
                                  <span className="text-[10px] font-black bg-white/25 rounded-full px-1">✓</span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">+</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Experience and Rate */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Experience (Years) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={40}
                            value={experienceYears}
                            onChange={e => setExperienceYears(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Expected Daily Rate (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={150}
                            max={2000}
                            value={hourlyRate}
                            onChange={e => setHourlyRate(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Operating Ward */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Operating Cooperative Ward <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={zone}
                          onChange={e => setZone(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white"
                        >
                          <option value="Zone A">Zone A (Central / MG Road)</option>
                          <option value="Zone B">Zone B (South / Jayanagar)</option>
                          <option value="Zone C">Zone C (East / Indiranagar)</option>
                          <option value="Zone D">Zone D (North / Hebbal)</option>
                        </select>
                      </div>

                      {/* Document Slots Configuration (Problem 3) */}
                      <div className="pt-2 border-t border-emerald-200/50 dark:border-[#1E3A5F]/70 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-white">
                              Number of Verification Documents to Upload <span className="text-red-500">*</span>
                            </label>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Upload mandatory ID, certifications & address proof for cooperative verification.
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[2, 3, 4].map(num => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setDocSlotsCount(num)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                  docSlotsCount === num
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                    : "bg-white dark:bg-[#0B1F3A] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1E3A5F] hover:bg-slate-50"
                                }`}
                              >
                                {num} Slots
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Designated Document Upload Slots */}
                        <div className="space-y-3 pt-1">
                          {uploadSlots.slice(0, docSlotsCount).map((slot, index) => (
                            <div
                              key={slot.id}
                              className="p-3 rounded-xl bg-white dark:bg-[#0B1F3A] border border-slate-200 dark:border-[#1E3A5F] shadow-xs space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center">
                                    {index + 1}
                                  </span>
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    {slot.title}
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
                                  Mandatory
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                                    Document / License / ID Number <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={slot.docNumber}
                                    onChange={e => handleSlotDocNumberChange(index, e.target.value)}
                                    placeholder={
                                      index === 0
                                        ? "e.g. 9845-2311-8842"
                                        : index === 1
                                        ? "e.g. ITI-KA-BLR-2021-994"
                                        : index === 2
                                        ? "e.g. BESCOM-RR-684210"
                                        : "e.g. COOP-REF-2022-44"
                                    }
                                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-slate-50 dark:bg-[#102A46] text-slate-900 dark:text-white font-mono"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                                    Upload Document File <span className="text-red-500">*</span>
                                  </label>

                                  {slot.isUploaded ? (
                                    <div className="p-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-1.5 text-xs">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <span className="text-[11px] font-medium text-slate-900 dark:text-white truncate">
                                          {slot.fileName}
                                        </span>
                                        <span className="text-[9px] text-slate-400 shrink-0 font-mono">
                                          ({slot.fileSize})
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSlotFile(index)}
                                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                                        title="Remove file"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-dashed border-slate-300 dark:border-[#1E3A5F] bg-slate-50 dark:bg-[#102A46] hover:bg-slate-100 dark:hover:bg-[#1E3A5F] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
                                      <UploadCloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span className="text-[11px]">Select File (PDF, JPG, PNG)</span>
                                      <input
                                        type="file"
                                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                                        className="hidden"
                                        onChange={e => {
                                          if (e.target.files && e.target.files[0]) {
                                            handleSlotFileChange(index, e.target.files[0]);
                                          }
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Brief Explanation of Work Experience, Tools Owned & Capacity (Mandatory) */}
                      <div className="pt-2 border-t border-emerald-200/50 dark:border-[#1E3A5F]/70 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-900 dark:text-white">
                            Brief Explanation of Work Experience & Tools Owned <span className="text-red-500">*</span>
                          </label>
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              briefExplanation.trim().length >= 15
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {briefExplanation.trim().length}/15 chars min
                            {briefExplanation.trim().length >= 15 && " ✓"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Mandatory: Detail your vocational background, years in field, specialized tools owned, and service commitment.
                        </p>
                        <textarea
                          required
                          rows={3}
                          value={briefExplanation}
                          onChange={e => setBriefExplanation(e.target.value)}
                          placeholder="e.g. ITI certified technician with 4+ years field experience in residential wiring & repairs. Owns standard multimeters, crimping tools, and high-voltage safety kit. Available for emergency shifts in Zone A."
                          className="w-full p-2.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-xl bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                        />
                        {briefExplanation.trim().length > 0 && briefExplanation.trim().length < 15 && (
                          <p className="text-[10px] text-red-500 font-semibold">
                            Please write at least {15 - briefExplanation.trim().length} more characters.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Customer Specific Location Fields */}
                  {selectedRole === "customer" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          City Zone / Ward
                        </label>
                        <select
                          value={zone}
                          onChange={e => setZone(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                        >
                          <option value="Zone A">Zone A (Central Bengaluru)</option>
                          <option value="Zone B">Zone B (South Bengaluru)</option>
                          <option value="Zone C">Zone C (East Bengaluru)</option>
                          <option value="Zone D">Zone D (North Bengaluru)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Service Address
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          placeholder="e.g. 12th Main, Indiranagar"
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Admin Specific Access Code and Cooperative Selection */}
                  {selectedRole === "admin" && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Affiliated Cooperative Society <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={adminCooperativeId}
                          onChange={e => setAdminCooperativeId(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                        >
                          <option value="coop-blr-central">Central Bengaluru Artisan Cooperative (Zone A)</option>
                          <option value="coop-blr-south">South Bengaluru Trades & Craft Cooperative (Zone B)</option>
                          <option value="coop-blr-east">East Bengaluru Labour Cooperative (Zone C)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200 text-xs font-bold">
                          <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Admin's Code *</span>
                        </div>
                        <p className="text-[11px] text-indigo-800 dark:text-indigo-300">
                          Admin registration is restricted to authorized federation officers. Enter Admin's code.
                        </p>
                        <input
                          type="password"
                          required
                          value={adminAccessCode}
                          onChange={e => setAdminAccessCode(e.target.value)}
                          placeholder="Enter Admin's code"
                          className="w-full px-3 py-1.5 text-xs font-mono border border-indigo-300 dark:border-indigo-700 rounded-lg bg-white dark:bg-[#0B1F3A] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 text-xs font-bold text-white rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                      selectedRole === "worker"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : selectedRole === "admin"
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? (
                      "Processing Registration..."
                    ) : selectedRole === "worker" ? (
                      <>
                        <span>Submit Application for Administrative Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : selectedRole === "admin" ? (
                      <>
                        <span>Authorize Administrator Account</span>
                        <Shield className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Create Customer Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Mode 3: Forgot Password with Message Central VerifyNow */}
          {mode === "forgot_password" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-[#102A46] border border-blue-100 dark:border-[#1E3A5F] text-xs">
                <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>Secure Account Credential Recovery</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  {forgotStep === 1
                    ? "Enter your registered Indian mobile number or email to receive a real SMS verification code."
                    : forgotStep === 2
                    ? `Enter the 6-digit verification code sent via SMS to ${forgotIdentifier}.`
                    : "Create and confirm your new secure password."}
                </div>
              </div>

              {/* Step 1: Request OTP */}
              {forgotStep === 1 && (
                <form onSubmit={handleForgotStep1} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Registered Mobile Number or Email
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={e => setForgotIdentifier(e.target.value)}
                      placeholder="e.g. 98765 43210 or email@example.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? "Sending SMS OTP..." : "Send Verification Code"}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP */}
              {forgotStep === 2 && (
                <form onSubmit={handleForgotStep2} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      6-Digit SMS Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={forgotOtpCode}
                      onChange={e => setForgotOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      disabled={forgotCooldown > 0}
                      onClick={handleForgotStep1}
                      className="font-semibold text-blue-600 dark:text-cyan-400 hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {forgotCooldown > 0 ? `Resend in ${forgotCooldown}s` : "Didn't receive SMS? Resend"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || forgotOtpCode.replace(/\D/g, "").length !== 6}
                    className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? "Verifying Code..." : "Verify & Continue"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Step 3: Set New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleForgotStep3} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      New Password (Min. 6 characters)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#102A46] text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? "Resetting Password..." : "Update Password & Return to Login"}
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setForgotStep(1);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
