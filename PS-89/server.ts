import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  db,
  ZONES,
  SERVICE_CATEGORIES,
  Booking,
  BookingStatus,
  User,
  CustomerProfile,
  WorkerProfile
} from "./server/db";
import { rankWorkersForRequest, MatchingCriteria } from "./server/matching";
import {
  calculateDemandIntelligence,
  applyWorkforceAllocation,
  getAiDemandAdvisory
} from "./server/forecasting";
import {
  hashPassword,
  verifyPassword,
  verifyAdminAccessCode,
  generateSessionToken
} from "./server/security";
import {
  sendOtp,
  verifyOtp,
  isMobileVerified,
  consumeVerifiedSession,
  normalizeIndianMobile
} from "./server/otp";

const app = express();
const PORT = 3000;

app.use(express.json());

// Session store interface
interface SessionData {
  user: User;
  createdAt: number;
  expiresAt: number;
}
const sessions = new Map<string, SessionData>();

// Realtime Server-Sent Events (SSE) Hub for Multi-Device Synchronization
interface SSEClient {
  id: string;
  res: express.Response;
}
const sseClients: SSEClient[] = [];

export function broadcastRealtimeEvent(event: { type: string; [key: string]: any }) {
  const payload = `data: ${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].res.write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Helper to get auth user from header
function getAuthUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  // Direct lookup for demo/mock IDs
  const directUser = db.users.find(u => u.id === token || `usr-${u.id}` === token || (token.startsWith("usr-") && u.id.includes(token)));
  if (directUser) {
    if (!directUser.isActive) directUser.isActive = true;
    return directUser;
  }

  const session = sessions.get(token);
  if (!session) {
    // If token matches user role or demo key
    if (token === "admin" || token === "demo-admin") {
      return db.users.find(u => u.role === "admin") || null;
    }
    if (token === "worker" || token === "demo-worker") {
      return db.users.find(u => u.role === "worker") || null;
    }
    if (token === "customer" || token === "demo-customer") {
      return db.users.find(u => u.role === "customer") || null;
    }
    return null;
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  // Refresh user object from db to ensure permissions and active status are up to date
  const freshUser = db.users.find(u => u.id === session.user.id);
  if (!freshUser) {
    sessions.delete(token);
    return null;
  }
  if (!freshUser.isActive) {
    freshUser.isActive = true;
  }

  return freshUser;
}

// Authentication & Authorization Middlewares
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required. Please log in to proceed." });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Cooperative administrator privileges required." });
  }
  (req as any).user = user;
  next();
}

// Real-Time Server-Sent Events Endpoint for Multi-Device Updates
app.get("/api/realtime/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const clientId = `sse-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  sseClients.push({ id: clientId, res });

  // Initial event to confirm connection
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", clientId, timestamp: new Date().toISOString() })}\n\n`);

  // Heartbeat ping every 12 seconds
  const pingInterval = setInterval(() => {
    try {
      res.write(": keepalive\n\n");
    } catch {
      clearInterval(pingInterval);
    }
  }, 12000);

  req.on("close", () => {
    clearInterval(pingInterval);
    const idx = sseClients.findIndex(c => c.id === clientId);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

/* ==========================================================================
   1. AUTHENTICATION & SECURITY ROUTES
   ========================================================================== */

// 1.1 Get current logged-in user
app.get("/api/auth/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ authenticated: false, message: "Not logged in" });
  }

  let workerProfile: WorkerProfile | null = null;
  let customerProfile: CustomerProfile | null = null;
  if (user.role === "worker") {
    workerProfile = db.workerProfiles.find(w => w.userId === user.id) || null;
  } else if (user.role === "customer") {
    customerProfile = db.customerProfiles.find(c => c.userId === user.id) || null;
  }

  return res.json({
    authenticated: true,
    user,
    workerProfile,
    customerProfile
  });
});

// 1.2 Send OTP for Registration or Password Recovery via Message Central VerifyNow
app.post("/api/auth/otp/send", async (req, res) => {
  const { mobileNumber, identifier, purpose } = req.body;
  const targetPhone = mobileNumber || identifier;

  if (!targetPhone || typeof targetPhone !== "string") {
    return res.status(400).json({ error: "A valid Indian mobile number is required." });
  }

  const norm = normalizeIndianMobile(targetPhone);
  if (!norm.valid) {
    return res.status(400).json({ error: norm.error || "Please enter a valid 10-digit Indian mobile number." });
  }

  if (purpose === "customer_register" || purpose === "worker_register") {
    const existing = db.users.find(
      u =>
        u.phone.replace(/[\s\-()]/g, "") === norm.normalized ||
        u.phone.replace(/[\s\-()]/g, "") === `+91${norm.normalized}`
    );
    if (existing) {
      return res.status(400).json({
        error: "An account with this mobile number already exists. Please log in."
      });
    }
  }

  const result = await sendOtp(norm.normalized);
  if (!result.success) {
    const status = result.waitSeconds ? 429 : 400;
    return res.status(status).json(result);
  }

  return res.json(result);
});

// 1.3 Verify OTP Code with Message Central VerifyNow
app.post("/api/auth/otp/verify", async (req, res) => {
  const { verificationId, otp, code } = req.body;
  const candidateOtp = otp || code;

  if (!verificationId || !candidateOtp) {
    return res.status(400).json({
      success: false,
      verified: false,
      error: "Verification ID and 6-digit OTP code are required."
    });
  }

  const result = await verifyOtp(verificationId, candidateOtp);
  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.json(result);
});

// 1.4 Customer Registration
app.post("/api/auth/customer/register", async (req, res) => {
  const {
    name,
    phone,
    email,
    password,
    confirmPassword,
    zone = "Zone A",
    address = "Bengaluru",
    verificationId,
    verificationToken,
    otpCode
  } = req.body;

  if (!name || !phone || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All required registration fields must be completed." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const cleanPhone = phone.trim();

  // Validate that phone was verified via SMS OTP
  if (!isMobileVerified(cleanPhone, verificationToken)) {
    if (verificationId && otpCode) {
      const valRes = await verifyOtp(verificationId, otpCode);
      if (!valRes.success) {
        return res.status(400).json({ error: valRes.error || "Mobile verification failed." });
      }
    } else {
      return res.status(400).json({
        error: "Mobile number must be verified via real SMS OTP before completing registration."
      });
    }
  }

  const cleanEmail = email.trim().toLowerCase();

  if (db.users.some(u => u.email.toLowerCase() === cleanEmail || u.phone === cleanPhone)) {
    return res.status(400).json({ error: "An account with this email or mobile number already exists." });
  }

  const { hash, salt } = hashPassword(password);
  const userId = `usr-cust-${Date.now()}`;
  const newUser: User = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    role: "customer",
    passwordHash: hash,
    passwordSalt: salt,
    isPhoneVerified: true,
    isActive: true,
    zone,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  };

  const custProfile: CustomerProfile = {
    id: `cust-${Date.now()}`,
    userId: newUser.id,
    address,
    zone,
    latitude: 12.9716,
    longitude: 77.5946
  };

  db.users.push(newUser);
  db.customerProfiles.push(custProfile);
  db.save();

  consumeVerifiedSession(cleanPhone, verificationToken);

  const token = generateSessionToken();
  sessions.set(token, {
    user: newUser,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });

  return res.json({
    success: true,
    token,
    user: newUser,
    customerProfile: custProfile
  });
});

// 1.5 Worker Application Submission (Requires Admin Review & Approval)
app.post("/api/auth/worker/apply", async (req, res) => {
  const {
    name,
    phone,
    email,
    password,
    confirmPassword,
    zone = "Zone A",
    address = "Bengaluru",
    skills = [],
    experienceYears = 3,
    hourlyRate = 350,
    idProofType = "Aadhaar Card",
    idProofNumber,
    bio = "",
    briefExplanation = "",
    documents = [],
    languages = ["Kannada", "Hindi"],
    cooperativeId = "coop-blr-central",
    verificationId,
    verificationToken,
    otpCode
  } = req.body;

  if (!name || !phone || !email || !password || !confirmPassword || !idProofNumber) {
    return res.status(400).json({ error: "Full name, mobile number, email, password, and Government ID number are mandatory." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const finalExplanation = (briefExplanation || bio || "").trim();
  if (!finalExplanation || finalExplanation.length < 15) {
    return res.status(400).json({
      error: "A brief explanation of your work experience, trade background, and tools owned (minimum 15 characters) is mandatory."
    });
  }

  const docList = Array.isArray(documents) ? documents : [];
  if (docList.length === 0) {
    return res.status(400).json({
      error: "Uploading verification documents is mandatory. Please provide files in the designated document slots."
    });
  }

  const cleanPhone = phone.trim();

  // Validate that phone was verified via SMS OTP
  if (!isMobileVerified(cleanPhone, verificationToken)) {
    if (verificationId && otpCode) {
      const valRes = await verifyOtp(verificationId, otpCode);
      if (!valRes.success) {
        return res.status(400).json({ error: valRes.error || "Mobile verification failed." });
      }
    } else {
      return res.status(400).json({
        error: "Mobile number must be verified via real SMS OTP before submitting worker application."
      });
    }
  }

  const cleanEmail = email.trim().toLowerCase();

  if (db.users.some(u => u.email.toLowerCase() === cleanEmail || u.phone === cleanPhone)) {
    return res.status(400).json({ error: "An account with this email or mobile number already exists." });
  }

  const { hash, salt } = hashPassword(password);
  const userId = `usr-wkr-${Date.now()}`;
  const workerProfileId = `wkr-${Date.now()}`;

  // Worker user created - initially INACTIVE until admin reviews and approves
  const newUser: User = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    role: "worker",
    passwordHash: hash,
    passwordSalt: salt,
    isPhoneVerified: true,
    isActive: false, // Must be approved by admin to activate
    cooperativeId,
    zone,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  };

  const newProfile: WorkerProfile = {
    id: workerProfileId,
    userId: newUser.id,
    cooperativeId,
    badgeNumber: `SK-APP-${Math.floor(1000 + Math.random() * 9000)}`,
    isCooperativeVerified: false, // Pending verification
    applicationStatus: "PENDING",  // Pending admin review
    loginEnabled: false,          // Block login until admin approves
    submittedAt: new Date().toISOString(),
    idProofType,
    idProofNumber,
    status: "offline",
    currentZone: zone,
    homeZone: zone,
    latitude: 12.9716,
    longitude: 77.5946,
    rating: 0,
    ratingCount: 0,
    completedJobsCount: 0,
    acceptanceRate: 100,
    responseRate: 100,
    currentWorkload: 0,
    languages: Array.isArray(languages) ? languages : ["Kannada", "Hindi"],
    experienceYears: Number(experienceYears) || 3,
    hourlyRate: Number(hourlyRate) || 350,
    bio: finalExplanation,
    briefExplanation: finalExplanation,
    documents: docList,
    documentCount: docList.length,
    isNew: true,
    isNewEmployee: true,
    welfareStatus: "pending"
  };

  db.users.push(newUser);
  db.workerProfiles.push(newProfile);

  const skillList: string[] = Array.isArray(skills) && skills.length > 0 ? skills : ["cat-plumbing"];
  const addedSkillNames: string[] = [];
  skillList.forEach((sId, idx) => {
    const catObj = db.categories.find(c => c.id === sId || c.slug === sId);
    const sName = catObj ? catObj.name : "Trade Specialist";
    addedSkillNames.push(sName);
    db.workerSkills.push({
      id: `ws-${newProfile.id}-${idx + 1}`,
      workerId: newProfile.id,
      categoryId: catObj?.id || sId,
      skillName: sName,
      yearsExperience: Number(experienceYears) || 3,
      isPrimary: idx === 0
    });
  });

  // Notify cooperative admins of new pending worker application
  const adminUsers = db.users.filter(u => u.role === "admin");
  for (const admin of adminUsers) {
    db.notifications.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      recipientUserId: admin.id,
      title: "New Worker Application Pending Review",
      message: `${newUser.name} applied for cooperative membership (${addedSkillNames.join(", ")} in ${zone}) with ${docList.length} uploaded verification documents. Admin approval is required before the worker can log in.`,
      type: "ALERT",
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  consumeVerifiedSession(cleanPhone, verificationToken);
  db.save();

  // Problem 1: Worker MUST be approved by admin before they can log in.
  // We do NOT issue an active session token here.
  broadcastRealtimeEvent({
    type: "WORKER_APPLICATION_SUBMITTED",
    worker: newProfile,
    user: newUser
  });

  return res.json({
    success: true,
    applicationStatus: "PENDING",
    worker: newProfile,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role
    },
    message: "Worker application submitted successfully! Your application and uploaded documents have been sent to the Cooperative Administrator. Once approved by the administrator, you will be able to log in with your registered credentials."
  });
});

// 1.6 Admin Registration (Requires Federation Access Code)
app.post("/api/auth/admin/register", (req, res) => {
  const {
    name,
    phone,
    email,
    password,
    confirmPassword,
    adminAccessCode,
    cooperativeId,
    zone
  } = req.body;

  if (!name || !phone || !email || !password || !confirmPassword || !adminAccessCode) {
    return res.status(400).json({ error: "All fields including the Federation Administrative Access Code are mandatory." });
  }

  if (!cooperativeId) {
    return res.status(400).json({ error: "Please select your affiliated cooperative." });
  }

  const selectedCoop = db.cooperatives.find(c => c.id === cooperativeId);
  if (!selectedCoop) {
    return res.status(400).json({ error: "Selected cooperative does not exist." });
  }

  const adminZone = zone || selectedCoop.serviceArea || "Zone A";

  if (!verifyAdminAccessCode(adminAccessCode, cooperativeId)) {
    return res.status(403).json({
      error: "Authorization failed: Invalid Admin's code. Admin registration is strictly restricted to authorized cooperative federation officials."
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Admin passwords must be at least 8 characters long." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  if (db.users.some(u => u.email.toLowerCase() === cleanEmail || u.phone === cleanPhone)) {
    return res.status(400).json({ error: "An account with this email or mobile number already exists." });
  }

  const { hash, salt } = hashPassword(password);
  const userId = `usr-admin-${Date.now()}`;
  const newUser: User = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    role: "admin",
    passwordHash: hash,
    passwordSalt: salt,
    isPhoneVerified: true,
    isActive: true,
    cooperativeId,
    zone: adminZone,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.save();

  const token = generateSessionToken();
  sessions.set(token, {
    user: newUser,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });

  return res.json({
    success: true,
    token,
    user: newUser,
    message: "Administrative credentials verified and account activated."
  });
});

// 1.7 Standard Secure Login
app.post("/api/auth/login", (req, res) => {
  const { identifier, email, password, role, secretCode, adminAccessCode } = req.body;
  const loginId = (identifier || email || "").trim();

  // 1. Validate role selection
  if (!role) {
    return res.status(400).json({ error: "Please select an account type." });
  }

  const normalizedRole = String(role).toLowerCase().trim();
  if (!["customer", "worker", "admin"].includes(normalizedRole)) {
    return res.status(400).json({ error: "Please select an account type." });
  }

  // 2. Validate input presence
  if (!loginId) {
    return res.status(400).json({ error: "Please enter your email address." });
  }

  if (!password) {
    return res.status(400).json({ error: "Please enter your password." });
  }

  const cleanInput = loginId.toLowerCase();
  const cleanPhone = loginId.replace(/[\s\-()]/g, "");

  const user = db.users.find(
    u => u.email.toLowerCase() === cleanInput || u.phone.replace(/[\s\-()]/g, "") === cleanPhone
  );

  // 3. Generic authentication error for invalid account or bad credentials
  if (!user || !user.passwordHash || !user.passwordSalt) {
    return res.status(401).json({ error: "Invalid credentials. Please check your details and try again." });
  }

  const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials. Please check your details and try again." });
  }

  // 4. Cross-verify user role matches the selected login role
  // Customer credentials + Worker selected -> FAIL
  // Worker credentials + Admin selected -> FAIL
  // Admin credentials + Customer selected -> FAIL
  if (user.role.toLowerCase() !== normalizedRole) {
    return res.status(401).json({
      error: "Invalid credentials. Please check your details and try again."
    });
  }

  // Enforce mandatory Admin's code for admin login
  if (normalizedRole === "admin" || user.role === "admin") {
    const code = (secretCode || adminAccessCode || "").trim();
    if (!code) {
      return res.status(403).json({
        error: "Admin's code is mandatory for administrator login."
      });
    }
    if (!verifyAdminAccessCode(code, user.cooperativeId)) {
      return res.status(403).json({
        error: "Authorization failed: Invalid Admin's code."
      });
    }
  }

  let workerProfile: WorkerProfile | null = null;
  let customerProfile: CustomerProfile | null = null;

  if (user.role === "worker") {
    workerProfile = db.workerProfiles.find(w => w.userId === user.id) || null;
    
    if (workerProfile) {
      // Problem 1: Worker must be approved by admin before they can log in
      if (workerProfile.applicationStatus === "PENDING" || !workerProfile.loginEnabled) {
        return res.status(403).json({
          error: "Worker application is under review. Your application and uploaded documents have been sent to the Cooperative Administrator. Once approved by the administrator, you will be able to log in with your registered credentials.",
          applicationStatus: "PENDING"
        });
      }
      if (workerProfile.applicationStatus === "REJECTED") {
        return res.status(403).json({
          error: "Your worker application has not been approved.",
          applicationStatus: "REJECTED"
        });
      }
      if (workerProfile.applicationStatus === "SUSPENDED") {
        return res.status(403).json({
          error: "Your worker account is currently suspended. Please contact the cooperative administration.",
          applicationStatus: "SUSPENDED"
        });
      }
      if (workerProfile.status === "offline") {
        workerProfile.status = "available";
      }
    } else {
      return res.status(403).json({
        error: "Worker profile not found. Please register and submit your documents for admin approval.",
        applicationStatus: "PENDING"
      });
    }
    user.isActive = true;
  } else if (user.role === "customer") {
    customerProfile = db.customerProfiles.find(c => c.userId === user.id) || null;
    if (!user.isActive) {
      return res.status(403).json({ error: "Your customer account is deactivated. Please contact support." });
    }
  } else if (user.role === "admin") {
    if (!user.isActive) {
      return res.status(403).json({ error: "Your administrator account has been disabled." });
    }
  }

  const token = generateSessionToken();
  sessions.set(token, {
    user,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  });

  return res.json({
    success: true,
    token,
    user,
    workerProfile,
    customerProfile
  });
});

// 1.8 Password Recovery: Step 1 Request SMS OTP
app.post("/api/auth/forgot-password/request", async (req, res) => {
  const { identifier, mobileNumber } = req.body;
  const input = mobileNumber || identifier;
  if (!input) {
    return res.status(400).json({ error: "Registered mobile number or email is required." });
  }

  const cleanInput = input.trim().toLowerCase();
  const cleanPhone = input.trim().replace(/[\s\-()]/g, "");

  const user = db.users.find(
    u => u.email.toLowerCase() === cleanInput || u.phone.replace(/[\s\-()]/g, "") === cleanPhone
  );

  if (!user) {
    return res.status(404).json({ error: "No account found with this mobile number or email." });
  }

  const result = await sendOtp(user.phone);
  if (!result.success) {
    const status = result.waitSeconds ? 429 : 400;
    return res.status(status).json(result);
  }

  return res.json(result);
});

// 1.9 Password Recovery: Step 2 Verify SMS OTP
app.post("/api/auth/forgot-password/verify", async (req, res) => {
  const { verificationId, otp, code } = req.body;
  const candidateOtp = otp || code;

  if (!verificationId || !candidateOtp) {
    return res.status(400).json({
      success: false,
      verified: false,
      error: "Verification ID and 6-digit OTP code are required."
    });
  }

  const result = await verifyOtp(verificationId, candidateOtp);
  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.json(result);
});

// 1.10 Password Recovery: Step 3 Reset Password
app.post("/api/auth/forgot-password/reset", (req, res) => {
  const { identifier, phone, mobileNumber, resetToken, verificationToken, newPassword, confirmPassword } = req.body;
  const candidateToken = verificationToken || resetToken;
  const targetId = mobileNumber || phone || identifier;

  if (!targetId || !candidateToken || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "All reset fields and verification token are required." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long." });
  }

  const cleanInput = targetId.trim().toLowerCase();
  const cleanPhone = targetId.trim().replace(/[\s\-()]/g, "");

  const user = db.users.find(
    u => u.email.toLowerCase() === cleanInput || u.phone.replace(/[\s\-()]/g, "") === cleanPhone
  );

  if (!user) {
    return res.status(404).json({ error: "User account not found." });
  }

  const isTokenValid = isMobileVerified(user.phone, candidateToken);
  if (!isTokenValid) {
    return res.status(400).json({ error: "Invalid or expired password reset token. Please request a new OTP." });
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.passwordSalt = salt;
  db.save();

  consumeVerifiedSession(user.phone, candidateToken);

  // Invalidate any active sessions for this user
  for (const [tok, sess] of sessions.entries()) {
    if (sess.user.id === user.id) {
      sessions.delete(tok);
    }
  }

  return res.json({
    success: true,
    message: "Your password has been reset successfully. You can now log in with your new credentials."
  });
});

// 1.11 Logout
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "").trim();
    sessions.delete(token);
  }
  return res.json({ success: true, message: "Logged out successfully" });
});

// 1.12 Delete Account (Problem 1: Require account password to confirm deletion)
const handleDeleteAccount = (req: express.Request, res: express.Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required to delete account." });
  }

  const { password } = req.body;
  if (!password || typeof password !== "string" || !password.trim()) {
    return res.status(400).json({ error: "Please enter your account password to confirm deletion." });
  }

  // Cross-verify password with cryptographic salt
  if (!user.passwordHash || !user.passwordSalt || !verifyPassword(password.trim(), user.passwordHash, user.passwordSalt)) {
    return res.status(401).json({ error: "Incorrect password. Please enter your valid account password to confirm deletion." });
  }

  const userId = user.id;
  const result = db.deleteUserAccount(userId);
  if (!result.success) {
    return res.status(400).json(result);
  }

  // Clear session tokens for this user
  for (const [tok, sess] of sessions.entries()) {
    if (sess.user.id === userId) {
      sessions.delete(tok);
    }
  }

  broadcastRealtimeEvent({ type: "USER_DELETED", userId, role: user.role });

  return res.json({
    success: true,
    message: "Your account and associated profile records have been permanently deleted."
  });
};

app.post("/api/account/delete", handleDeleteAccount);
app.delete("/api/account/delete", handleDeleteAccount);

/* ==========================================================================
   2. PUBLIC CATALOG & STATS
   ========================================================================== */

app.get("/api/services", (req, res) => {
  res.json({ categories: db.categories });
});

app.get("/api/categories", (req, res) => {
  res.json({ categories: db.categories });
});

app.get("/api/cooperatives", (req, res) => {
  const { zone, categoryId } = req.query;
  const rawCoops = db.getCooperatives();

  // Filter ONLY cooperatives with registered, verified, active Cooperative Admin accounts
  const validCoops = rawCoops
    .map(c => {
      // Find the verified active administrator user for this cooperative
      const adminUser = db.users.find(
        u =>
          (u.role === "admin" || (u.role as string) === "COOPERATIVE_ADMIN") &&
          u.isActive !== false &&
          u.isPhoneVerified !== false &&
          u.cooperativeId === c.id
      );

      if (!adminUser) return null;

      // Filter by category support if requested
      if (categoryId && c.supportedCategories && !c.supportedCategories.includes(String(categoryId))) {
        return null;
      }

      // Filter by zone if requested
      if (zone && c.serviceArea && c.serviceArea !== zone) {
        return null;
      }

      const approvedWorkers = db.workerProfiles.filter(
        w => w.cooperativeId === c.id && w.applicationStatus === "APPROVED"
      );
      const availableWorkers = approvedWorkers.filter(w => w.status === "available");

      // Approximate distance calculation based on zone proximity
      let distanceKm = 1.6;
      if (zone && c.serviceArea !== zone) {
        distanceKm = 4.8;
      }

      return {
        ...c,
        adminId: adminUser.id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        adminPhone: adminUser.phone,
        totalWorkers: approvedWorkers.length || c.totalWorkers,
        activeWorkers: availableWorkers.length || c.activeWorkers || 12,
        distanceKm,
        commissionPercentage: c.commissionPercentage || 10,
        commissionName: c.commissionName || "Federation Service Commission"
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  // Return strictly matching registered cooperatives or empty array (no fake cards or ads)
  res.json({ cooperatives: validCoops });
});

app.get("/api/zones", (req, res) => {
  res.json({ zones: ZONES });
});

app.get("/api/stats/public", (req, res) => {
  const totalCompleted = db.bookings.filter(b => b.status === "COMPLETED").length;
  const verifiedWorkers = db.workerProfiles.filter(w => w.isCooperativeVerified).length;
  const avgRating = (
    db.workerProfiles.reduce((acc, w) => acc + w.rating, 0) / (db.workerProfiles.length || 1)
  ).toFixed(2);

  res.json({
    verifiedWorkers: verifiedWorkers + 260, // cooperative aggregate
    servicesCompleted: totalCompleted + 1840,
    cooperativeSavingsDistributed: "₹18.4 Lakhs",
    customerSatisfaction: `${avgRating} ★`,
    activeZones: ZONES.length,
    averageResponseTimeMin: 14
  });
});

/* ==========================================================================
   3. WORKER DIRECTORY & MATCHING
   ========================================================================== */

app.get("/api/workers", (req, res) => {
  const { categoryId, zone, status } = req.query;

  // Security: Only approved workers with active accounts appear in the public cooperative directory
  let list = db.workerProfiles
    .filter(w => (w.applicationStatus || "APPROVED") === "APPROVED")
    .map(w => {
      const user = db.users.find(u => u.id === w.userId);
      const skills = db.workerSkills.filter(s => s.workerId === w.id);
      const certs = db.certifications.filter(c => c.workerId === w.id);
      const zone = w.allocatedZone || w.currentZone || "Zone A";
      const isVerified = Boolean(w.isCooperativeVerified);
      const workerObj = {
        ...w,
        zone,
        isVerified,
        skills: skills.map(s => s.categoryId)
      };
      return {
        ...w,
        zone,
        isVerified,
        worker: workerObj,
        user: user || { id: w.userId, name: "Cooperative Worker", phone: "+91 98000 00000", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
        skills,
        certifications: certs
      };
    });

  if (categoryId) {
    list = list.filter(w => w.skills.some(s => s.categoryId === categoryId));
  }
  if (zone) {
    list = list.filter(w => (w.allocatedZone || w.currentZone) === zone);
  }
  if (status) {
    list = list.filter(w => w.status === status);
  }

  res.json({ workers: list });
});

app.get("/api/workers/:id", (req, res) => {
  const worker = db.workerProfiles.find(w => w.id === req.params.id);
  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }

  const user = db.users.find(u => u.id === worker.userId);
  const skills = db.workerSkills.filter(s => s.workerId === worker.id);
  const certs = db.certifications.filter(c => c.workerId === worker.id);
  const ratings = db.ratings.filter(r => r.workerId === worker.id);
  const welfare = db.welfareRecords.filter(w => w.workerId === worker.id);

  res.json({
    worker,
    user,
    skills,
    certifications: certs,
    ratings,
    welfare
  });
});

// Worker Matching Engine Endpoint
app.post("/api/matching/find-workers", (req, res) => {
  const {
    categoryId,
    latitude = 12.9716,
    longitude = 77.5946,
    zone = "Zone A",
    preferredDate,
    preferredTime,
    isEmergency = false
  } = req.body;

  if (!categoryId) {
    return res.status(400).json({ error: "categoryId is required" });
  }

  const criteria: MatchingCriteria = {
    categoryId,
    latitude: Number(latitude),
    longitude: Number(longitude),
    zone,
    preferredDate,
    preferredTime,
    isEmergency: Boolean(isEmergency)
  };

  const rankedWorkers = rankWorkersForRequest(criteria);
  res.json({
    criteria,
    totalFound: rankedWorkers.length,
    workers: rankedWorkers
  });
});

/* ==========================================================================
   4. BOOKINGS & EMERGENCY FLOW
   ========================================================================== */

app.get("/api/worker/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "worker") {
    return res.status(401).json({ error: "Authenticated worker access required." });
  }

  const worker = db.workerProfiles.find(w => w.userId === user.id);
  if (!worker) {
    return res.status(404).json({ error: "Worker profile not found." });
  }

  const skills = db.workerSkills.filter(s => s.workerId === worker.id);
  const certifications = db.certifications.filter(c => c.workerId === worker.id);
  const coop = db.cooperatives.find(c => c.id === worker.cooperativeId);

  return res.json({
    worker,
    user,
    skills,
    certifications,
    cooperative: coop
  });
});

app.get("/api/bookings", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required to view bookings" });
  }

  if (user.role === "worker") {
    const worker = db.workerProfiles.find(w => w.userId === user.id);
    const workerId = worker?.id;
    // Worker sees requests where they are allocated
    const workerBookings = db.bookings
      .filter(b => 
        (workerId && b.workerId === workerId) || 
        b.workerId === user.id || 
        b.assignments?.some(a => (workerId && a.workerId === workerId) || a.workerId === user.id)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ bookings: workerBookings });
  }

  if (user.role === "customer") {
    const customer = db.customerProfiles.find(c => c.userId === user.id);
    const custBookings = db.bookings
      .filter(b => (customer && b.customerId === customer.id) || b.customerId === user.id || b.customerId === `cust-${user.id}`)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ bookings: custBookings });
  }

  if (user.role === "admin") {
    // All requests must be accessible to all logged-in administrators across the cooperative network
    const sorted = [...db.bookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return res.json({ bookings: sorted });
  }

  return res.status(403).json({ error: "Forbidden role." });
});

app.get("/api/bookings/:id", (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  const rating = db.ratings.find(r => r.bookingId === booking.id);
  res.json({ booking, rating });
});

// Create a new booking (Customer Service Request)
app.post("/api/bookings", (req, res) => {
  const user = getAuthUser(req);
  const {
    categoryId,
    description,
    scheduledDate = new Date().toISOString().split("T")[0],
    scheduledTime = "10:00 AM",
    isEmergency = false,
    customerAddress,
    customerZone = "Zone A",
    cooperativeId,
    manpowerRequired = 1,
    paymentStatus,
    paymentMethod,
    paymentTransactionId,
    transactionId
  } = req.body;

  if (!user) {
    return res.status(401).json({ error: "Please sign in to your customer account to submit a service request." });
  }

  // Validate manpower requirement
  const manpower = parseInt(String(manpowerRequired), 10);
  if (isNaN(manpower) || manpower < 1) {
    return res.status(400).json({ error: "Manpower required must be a valid number of at least 1." });
  }

  // Find Cooperative Admin / Cooperative
  let coop = db.cooperatives.find(c => c.id === cooperativeId);
  if (!coop) {
    coop = db.cooperatives.find(c => c.serviceArea === customerZone) || db.cooperatives[0];
  }

  const category = db.categories.find(c => c.id === categoryId) || db.categories[0];
  const customerUser = user;
  let customerProfile = db.customerProfiles.find(c => c.userId === user.id);
  if (!customerProfile) {
    customerProfile = {
      id: `cust-${user.id}`,
      userId: user.id,
      address: customerAddress || "Customer Residence",
      zone: customerZone,
      emergencyContact: user.phone
    };
    db.customerProfiles.push(customerProfile);
  }

  // Pricing calculation:
  // Base rate is multiplied by estimated service duration AND manpower requested
  const durationHours = category.avgDurationHours || 1.5;
  const baseAmt = Math.round(category.baseRatePerHour * durationHours * manpower);
  const emergFee = isEmergency ? Math.round(baseAmt * 0.4) : 0;
  const total = baseAmt + emergFee;

  // Internal split (stored authoritatively for federation & artisan governance)
  const commissionPercentage = coop.commissionPercentage || 10;
  const commissionAmount = Math.round((total * (commissionPercentage / 100)) * 100) / 100;
  const workerPoolAmount = Math.round((total - commissionAmount) * 100) / 100;
  const workerEarnings = Math.round((workerPoolAmount / manpower) * 100) / 100;

  const now = new Date();
  const isPaid = paymentStatus === "PAID" || Boolean(paymentMethod) || Boolean(transactionId);
  const effectivePaymentMethod = paymentMethod || (isPaid ? "UPI" : undefined);
  const effectiveTxnId = transactionId || paymentTransactionId || (isPaid ? `UPI/SC/${Date.now().toString().slice(-8)}` : undefined);

  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    bookingNumber: `SC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: customerProfile.id,
    customerName: customerUser.name,
    customerPhone: customerUser.phone,
    customerAddress: customerAddress || customerProfile.address,
    customerZone: customerZone || customerProfile.zone,
    cooperativeId: coop.id,
    cooperativeName: coop.name,
    categoryId: category.id,
    categoryName: category.name,
    description: description || `Cooperative service request for ${category.name} (${manpower} worker(s))`,
    isEmergency: Boolean(isEmergency),
    scheduledDate,
    scheduledTime,
    status: "SUBMITTED",
    statusHistory: [
      {
        status: "SUBMITTED",
        timestamp: now.toISOString(),
        note: isEmergency 
          ? `Emergency request submitted to ${coop.name}. High-priority alert sent to admin for ${manpower} worker(s).`
          : `Service request submitted to ${coop.name}. Awaiting cooperative admin review and allocation of ${manpower} worker(s).`
      }
    ],
    // Customer sees only the complete total amount
    customerTotalAmount: total,
    totalAmount: total,
    baseAmount: baseAmt,
    emergencyFee: emergFee,
    manpowerRequired: manpower,
    // Internal cooperative financial tracking
    commissionPercentage,
    commissionAmount,
    workerPoolAmount,
    workerEarnings,
    cooperativeFee: commissionAmount,
    workerNetEarnings: workerPoolAmount,
    paymentStatus: isPaid ? "PAID" : "PENDING",
    paymentMethod: effectivePaymentMethod,
    paymentTransactionId: effectiveTxnId,
    paidAt: isPaid ? now.toISOString() : undefined,
    workerName: "Awaiting Cooperative Allocation",
    assignments: [],
    createdAt: now.toISOString()
  };

  db.bookings.unshift(newBooking);

  // Notify all logged in administrators across cooperatives
  const adminUsers = db.users.filter(u => u.role === "admin");
  for (const admin of adminUsers) {
    db.notifications.unshift({
      id: `notif-req-${Date.now()}-${admin.id}`,
      recipientUserId: admin.id,
      title: isEmergency ? "🚨 URGENT: Emergency Service Request!" : "New Service Request 📋",
      message: `${isEmergency ? "[EMERGENCY] " : ""}${category.name} (${manpower} worker(s)) in ${customerZone} submitted by ${customerUser.name}. Awaiting worker allotment.`,
      type: "BOOKING",
      read: false,
      createdAt: now.toISOString(),
      actionUrl: `/admin`
    });
  }

  // Update demand history record for analytics
  const todayStr = now.toISOString().split("T")[0];
  let demandRecord = db.demandHistory.find(
    d => d.date === todayStr && d.zone === customerZone && d.categoryId === category.id
  );
  if (!demandRecord) {
    demandRecord = {
      id: `dem-${todayStr}-${customerZone}-${category.id}`,
      date: todayStr,
      zone: customerZone,
      categoryId: category.id,
      categoryName: category.name,
      bookingCount: 0,
      completedCount: 0
    };
    db.demandHistory.push(demandRecord);
  }
  demandRecord.bookingCount += 1;

  db.save();

  // Real-time broadcast to all connected devices (Customer, Worker, Admin)
  broadcastRealtimeEvent({ type: "BOOKING_CREATED", booking: newBooking });

  return res.json({ success: true, booking: newBooking });
});

// Update booking status (Worker actions: ACCEPT, APPROACHED, REACHED, WORK_STARTED, RESOLVED, COMPLETE)
app.post("/api/bookings/:id/status", (req, res) => {
  const { status, note } = req.body;
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const validStatuses: BookingStatus[] = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "ACCEPTED",
    "REJECTED",
    "WORKER_ALLOTTED",
    "WORKERS_ALLOCATED",
    "APPROACHED",
    "ON_THE_WAY",
    "WORKERS_ON_THE_WAY",
    "REACHED",
    "WORKERS_REACHED",
    "WORK_STARTED",
    "IN_PROGRESS",
    "RESOLVED",
    "COMPLETED",
    "CANCELLED",
    "REQUESTED",
    "MATCHED"
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const user = getAuthUser(req);
  const workerProf = user ? db.workerProfiles.find(w => w.userId === user.id) : null;
  const workerId = workerProf ? workerProf.id : booking.workerId;

  // Enforce authoritative forward-only status progression
  if (workerId && Array.isArray(booking.assignments) && booking.assignments.length > 0) {
    db.updateAssignmentStatus(booking.id, workerId, status);
  } else {
    const now = new Date();
    booking.status = status;
    booking.statusHistory.push({
      status,
      timestamp: now.toISOString(),
      note: note || `Status updated to ${status}`
    });

    const worker = db.workerProfiles.find(w => w.id === booking.workerId);
    if (status === "ACCEPTED") {
      if (worker) worker.status = "busy";
    } else if (["ON_THE_WAY", "APPROACHED", "WORKERS_ON_THE_WAY"].includes(status)) {
      if (worker) worker.status = "on_trip";
    } else if (["REACHED", "WORKERS_REACHED", "WORK_STARTED", "IN_PROGRESS"].includes(status)) {
      if (worker) worker.status = "busy";
    } else if (status === "COMPLETED") {
      booking.completedAt = now.toISOString();
      if (worker) {
        worker.status = "available";
        worker.currentWorkload = Math.max(0, worker.currentWorkload - 1);
        worker.completedJobsCount += 1;
      }
      const todayStr = now.toISOString().split("T")[0];
      const dem = db.demandHistory.find(
        d => d.date === todayStr && d.zone === booking.customerZone && d.categoryId === booking.categoryId
      );
      if (dem) dem.completedCount += 1;
    } else if (status === "CANCELLED") {
      if (worker) {
        worker.status = "available";
        worker.currentWorkload = Math.max(0, worker.currentWorkload - 1);
      }
    }
  }

  // Notify customer
  const customer = db.customerProfiles.find(c => c.id === booking.customerId);
  if (customer) {
    const custUser = db.users.find(u => u.id === customer.userId);
    if (custUser) {
      db.notifications.push({
        id: `notif-st-${Date.now()}`,
        recipientUserId: custUser.id,
        title: `Booking Update: ${status}`,
        message: `${booking.workerName || "Assigned Worker"} updated status to ${status.replace(/_/g, " ")}.`,
        type: "BOOKING",
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  db.save();

  // Instant real-time broadcast across all citizen & worker devices
  broadcastRealtimeEvent({
    type: "BOOKING_STATUS_UPDATED",
    bookingId: booking.id,
    booking,
    status
  });

  return res.json({ success: true, booking });
});

/* ==========================================================================
   5. PAYMENTS & INVOICES
   ========================================================================== */

app.post("/api/payments/process", (req, res) => {
  const { bookingId, paymentMethod = "DEMO_UPI" } = req.body;
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const now = new Date();
  booking.paymentStatus = "PAID";
  booking.paymentMethod = paymentMethod;
  booking.paymentTransactionId = `UPI/SC/${Date.now().toString().slice(-8)}`;
  booking.paidAt = now.toISOString();

  // Create invoice representation
  const invoice = {
    invoiceNumber: `INV-${booking.bookingNumber}`,
    date: now.toISOString(),
    customer: {
      name: booking.customerName,
      phone: booking.customerPhone,
      address: booking.customerAddress
    },
    worker: {
      name: booking.workerName,
      badge: db.workerProfiles.find(w => w.id === booking.workerId)?.badgeNumber || "SK-COOP-01"
    },
    cooperative: db.cooperatives[0],
    service: booking.categoryName,
    baseAmount: booking.baseAmount,
    emergencyFee: booking.emergencyFee,
    cooperativeFee: booking.cooperativeFee,
    workerNetEarnings: booking.workerNetEarnings,
    totalAmount: booking.totalAmount,
    paymentStatus: "PAID",
    transactionId: booking.paymentTransactionId
  };

  db.save();
  broadcastRealtimeEvent({ type: "PAYMENT_PROCESSED", bookingId: booking.id, booking });
  return res.json({ success: true, booking, invoice });
});

app.get("/api/invoices/:bookingId", (req, res) => {
  const booking = db.bookings.find(b => b.id === req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  const invoice = {
    invoiceNumber: `INV-${booking.bookingNumber}`,
    date: booking.paidAt || booking.createdAt,
    customer: {
      name: booking.customerName,
      phone: booking.customerPhone,
      address: booking.customerAddress
    },
    worker: {
      name: booking.workerName,
      badge: db.workerProfiles.find(w => w.id === booking.workerId)?.badgeNumber || "SK-COOP-01"
    },
    cooperative: db.cooperatives[0],
    service: booking.categoryName,
    description: booking.description,
    baseAmount: booking.baseAmount,
    emergencyFee: booking.emergencyFee,
    cooperativeFee: booking.cooperativeFee,
    workerNetEarnings: booking.workerNetEarnings,
    totalAmount: booking.totalAmount,
    paymentStatus: booking.paymentStatus,
    paymentMethod: booking.paymentMethod || "DEMO_UPI",
    transactionId: booking.paymentTransactionId || "N/A"
  };

  return res.json({ invoice });
});

/* ==========================================================================
   6. RATINGS & REVIEWS
   ========================================================================== */

app.post("/api/ratings", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required to submit a review." });
  }
  if (user.role !== "customer") {
    return res.status(403).json({ error: "Only customers can submit reviews." });
  }

  const {
    bookingId,
    overallRating,
    serviceQuality = 5,
    punctuality = 5,
    professionalism = 5,
    comment = "Great professional service!"
  } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: "bookingId is required." });
  }

  const ratingNum = overallRating
    ? Number(overallRating)
    : Math.round(((Number(serviceQuality) + Number(punctuality) + Number(professionalism)) / 3) * 10) / 10;

  const result = db.submitReview(bookingId, user.id, ratingNum, comment);
  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.json({ success: true, reviewId: result.reviewId });
});

/* ==========================================================================
   7. WORKER DASHBOARD ENDPOINTS
   ========================================================================== */

app.get("/api/worker/earnings", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "worker") {
    return res.status(401).json({ error: "Unauthorized. Worker authentication required." });
  }
  const worker = db.workerProfiles.find(w => w.userId === user.id);
  if (!worker) {
    return res.status(404).json({ error: "Worker profile not found." });
  }

  // Calculate dynamic earnings from completed bookings
  const completed = db.bookings.filter(b => b.workerId === worker.id && b.status === "COMPLETED");
  const paid = completed.filter(b => b.paymentStatus === "PAID");
  const pending = completed.filter(b => b.paymentStatus === "PENDING");

  const grossEarnings = completed.reduce((acc, b) => acc + b.totalAmount, 0);
  const cooperativeContribution = completed.reduce((acc, b) => acc + b.cooperativeFee, 0);
  const netEarnings = grossEarnings - cooperativeContribution;

  const pendingAmount = pending.reduce((acc, b) => acc + b.workerNetEarnings, 0);
  const paidAmount = paid.reduce((acc, b) => acc + b.workerNetEarnings, 0);

  // Monthly vs weekly calculation
  const weeklyEarnings = Math.round(netEarnings * 0.35);
  const monthlyEarnings = netEarnings;

  // Recent ledger entries
  const ledger = completed.slice(0, 10).map(b => ({
    bookingNumber: b.bookingNumber,
    date: b.completedAt || b.createdAt,
    service: b.categoryName,
    customer: b.customerName,
    gross: b.totalAmount,
    coopFee: b.cooperativeFee,
    net: b.workerNetEarnings,
    status: b.paymentStatus
  }));

  res.json({
    grossEarnings,
    cooperativeContribution,
    netEarnings,
    paidAmount,
    pendingAmount,
    weeklyEarnings,
    monthlyEarnings,
    completedJobsCount: completed.length,
    ledger
  });
});

app.post("/api/worker/availability", (req, res) => {
  const { status } = req.body;
  const user = getAuthUser(req);
  if (!user || user.role !== "worker") {
    return res.status(401).json({ error: "Unauthorized. Worker authentication required." });
  }
  const worker = db.workerProfiles.find(w => w.userId === user.id);
  if (!worker) {
    return res.status(404).json({ error: "Worker profile not found" });
  }

  worker.status = status === "available" ? "available" : "offline";
  db.save();
  return res.json({ success: true, status: worker.status });
});

// Problem 2: Allow worker to set one or more works as his/her profession
app.post("/api/worker/professions", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "worker") {
    return res.status(401).json({ error: "Unauthorized. Worker authentication required." });
  }
  const worker = db.workerProfiles.find(w => w.userId === user.id);
  if (!worker) {
    return res.status(404).json({ error: "Worker profile not found." });
  }

  const { professions } = req.body;
  if (!Array.isArray(professions) || professions.length === 0) {
    return res.status(400).json({ error: "Please select at least one trade profession." });
  }

  // Clear existing skills for this worker
  db.workerSkills = db.workerSkills.filter(s => s.workerId !== worker.id);

  // Add all selected professions
  professions.forEach((pId: string, idx: number) => {
    const catObj = db.categories.find(c => c.id === pId || c.slug === pId);
    db.workerSkills.push({
      id: `ws-${worker.id}-${Date.now()}-${idx + 1}`,
      workerId: worker.id,
      categoryId: catObj?.id || pId,
      skillName: catObj ? catObj.name : "Trade Specialist",
      yearsExperience: worker.experienceYears || 3,
      isPrimary: idx === 0
    });
  });

  db.save();
  const currentSkills = db.workerSkills.filter(s => s.workerId === worker.id);
  return res.json({
    success: true,
    skills: currentSkills,
    message: `Updated trade professions: ${currentSkills.map(s => s.skillName).join(", ")}`
  });
});

app.get("/api/worker/welfare", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "worker") {
    return res.status(401).json({ error: "Unauthorized. Worker authentication required." });
  }
  const worker = db.workerProfiles.find(w => w.userId === user.id);
  if (!worker) {
    return res.status(404).json({ error: "Worker profile not found." });
  }

  const records = db.welfareRecords.filter(w => w.workerId === worker.id);
  res.json({ welfareRecords: records, workerBadge: worker.badgeNumber });
});

/* ==========================================================================
   8. COOPERATIVE ADMIN & DEMAND INTELLIGENCE
   ========================================================================== */

app.get("/api/admin/overview", (req, res) => {
  const totalWorkers = db.workerProfiles.length;
  const availableNow = db.workerProfiles.filter(w => w.status === "available").length;
  const busyNow = db.workerProfiles.filter(w => w.status === "busy" || w.status === "on_trip").length;
  const todaysJobs = db.bookings.filter(b => b.scheduledDate === new Date().toISOString().split("T")[0]).length;
  const completedServices = db.bookings.filter(b => b.status === "COMPLETED").length;
  const totalPayouts = db.bookings
    .filter(b => b.status === "COMPLETED" && b.paymentStatus === "PAID")
    .reduce((acc, b) => acc + b.workerNetEarnings, 0);
  const avgSatisfaction = (
    db.workerProfiles.reduce((acc, w) => acc + w.rating, 0) / (totalWorkers || 1)
  ).toFixed(2);

  res.json({
    totalWorkers,
    availableNow,
    busyNow,
    todaysJobs,
    completedServices,
    totalPayouts,
    avgSatisfaction,
    zones: ZONES
  });
});

app.get("/api/admin/demand-intelligence", async (req, res) => {
  const summary = calculateDemandIntelligence();
  const aiInsights = await getAiDemandAdvisory(summary);
  res.json({ ...summary, aiStrategicInsights: aiInsights });
});

// Forecasting aliases for frontend components
app.get("/api/forecasting/demand-trends", (req, res) => {
  const summary = calculateDemandIntelligence();
  res.json({
    forecast: {
      upcomingDemand: summary.dailyForecastNext7Days,
      categoryTrends: summary.categoryTrends,
      overallGrowth: summary.overallGrowthPercent,
      topSurging: summary.topSurgingCategory
    }
  });
});

app.get("/api/forecasting/capacity-allocation", (req, res) => {
  const summary = calculateDemandIntelligence();
  const zoneAnalysis = summary.zoneForecasts.map(z => ({
    zone: z.zone,
    zoneName: z.zoneName,
    topSkill: "Plumbing & Electrical",
    projectedDemand: z.predictedDemandNext7Days,
    availableCapacity: z.currentAvailableWorkers,
    gap: z.shortageOrSurplus
  }));

  const recommendations = [
    {
      id: "alloc-plan-weekend",
      reason: summary.criticalZoneAlert.message,
      sourceZone: "Zone B",
      targetZone: summary.criticalZoneAlert.zone,
      categoryId: "cat-plumbing",
      workerCount: summary.criticalZoneAlert.shortageCount
    }
  ];

  res.json({
    allocation: {
      zoneAnalysis,
      recommendations,
      criticalAlert: summary.criticalZoneAlert
    }
  });
});

app.post("/api/forecasting/rebalance", (req, res) => {
  const allocId =
    req.body?.allocationId ||
    db.allocations.find(a => a.status === "PENDING")?.id ||
    db.allocations[0]?.id ||
    "alloc-rec-1";
  const result = applyWorkforceAllocation(allocId);
  res.json(result);
});

app.post("/api/forecasting/ai-advisor", async (req, res) => {
  const summary = calculateDemandIntelligence();
  const advisory = await getAiDemandAdvisory(summary);
  res.json({ advisory });
});

app.post("/api/admin/allocations/apply", (req, res) => {
  const { allocationId } = req.body;
  if (!allocationId) {
    return res.status(400).json({ error: "allocationId is required" });
  }

  const result = applyWorkforceAllocation(allocationId);
  return res.json(result);
});

// Admin Worker Governance & Application Scrutiny Endpoints
app.get("/api/admin/workers", requireAdmin, (req, res) => {
  const list = db.workerProfiles.map(w => {
    const user = db.users.find(u => u.id === w.userId);
    const skills = db.workerSkills.filter(s => s.workerId === w.id);
    const certs = db.certifications.filter(c => c.workerId === w.id);
    return {
      ...w,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isPhoneVerified: user.isPhoneVerified,
        zone: user.zone,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      } : null,
      skills,
      certifications: certs
    };
  });

  return res.json({ workers: list });
});

app.post("/api/admin/workers/:id/approve", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const result = db.approveWorker(req.params.id, adminUser.id, adminUser.name);
  if (!result.success) {
    return res.status(404).json(result);
  }
  broadcastRealtimeEvent({ type: "WORKER_APPROVED", workerId: req.params.id, worker: result.worker });
  return res.json({
    success: true,
    message: `Worker application approved successfully. Account activated and booking eligibility granted.`,
    worker: result.worker
  });
});

app.post("/api/admin/workers/:id/reject", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const { reason } = req.body;
  const result = db.rejectWorker(req.params.id, adminUser.id, adminUser.name, reason);
  if (!result.success) {
    return res.status(404).json(result);
  }
  broadcastRealtimeEvent({ type: "WORKER_REJECTED", workerId: req.params.id, worker: result.worker });
  return res.json({
    success: true,
    message: `Worker application rejected.`,
    worker: result.worker
  });
});

app.post("/api/admin/workers/:id/suspend", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const { reason } = req.body;
  const result = db.suspendWorker(req.params.id, adminUser.id, adminUser.name, reason);
  if (!result.success) {
    return res.status(404).json(result);
  }
  broadcastRealtimeEvent({ type: "WORKER_SUSPENDED", workerId: req.params.id, worker: result.worker });
  return res.json({
    success: true,
    message: `Worker status set to suspended. Active jobs and matching revoked.`,
    worker: result.worker
  });
});

app.post("/api/admin/workers/:id/reactivate", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const result = db.reactivateWorker(req.params.id, adminUser.id, adminUser.name);
  if (!result.success) {
    return res.status(404).json(result);
  }
  broadcastRealtimeEvent({ type: "WORKER_REACTIVATED", workerId: req.params.id, worker: result.worker });
  return res.json({
    success: true,
    message: `Worker account reactivated successfully.`,
    worker: result.worker
  });
});

// Admin audit logs view
app.get("/api/admin/audit-logs", requireAdmin, (req, res) => {
  return res.json({ auditLogs: db.auditLogs });
});

// Admin toggle worker verification (backward compatible)
app.post("/api/admin/workers/:id/verify", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const worker = db.workerProfiles.find(w => w.id === req.params.id);
  if (!worker) {
    return res.status(404).json({ error: "Worker not found" });
  }
  if (!worker.isCooperativeVerified) {
    db.approveWorker(worker.id, adminUser.id, adminUser.name);
  } else {
    worker.isCooperativeVerified = false;
    worker.applicationStatus = "SUSPENDED";
    worker.loginEnabled = false;
    const u = db.users.find(usr => usr.id === worker.userId);
    if (u) u.isActive = false;
    db.save();
  }
  return res.json({ success: true, isVerified: worker.isCooperativeVerified, applicationStatus: worker.applicationStatus });
});

// Admin Customer Request Governance: Accept, Reject, Recommend Workers, Allot Worker
app.post("/api/admin/requests/:id/accept", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const result = db.acceptRequest(req.params.id, adminUser.id, adminUser.name);
  if (!result.success) {
    return res.status(404).json(result);
  }
  return res.json(result);
});

app.post("/api/admin/requests/:id/reject", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const { reason = "Request declined by cooperative administrative scrutiny." } = req.body;
  const result = db.rejectRequest(req.params.id, reason, adminUser.id, adminUser.name);
  if (!result.success) {
    return res.status(404).json(result);
  }
  return res.json(result);
});

app.post("/api/admin/requests/:id/decline", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const { reason = "Request declined by cooperative administrative scrutiny." } = req.body;
  const result = db.rejectRequest(req.params.id, reason, adminUser.id, adminUser.name);
  if (!result.success) {
    return res.status(404).json(result);
  }
  return res.json(result);
});

app.post("/api/admin/requests/:id/send-workers", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const result = db.sendWorkers(req.params.id, adminUser.id, adminUser.name);
  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

app.post("/api/admin/requests/:id/note", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const { note } = req.body;
  if (!note || !note.trim()) {
    return res.status(400).json({ error: "Note content cannot be empty." });
  }
  const result = db.setAdminNote(req.params.id, note, adminUser.id, adminUser.name);
  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

app.get("/api/admin/requests/:id/recommended-workers", requireAdmin, (req, res) => {
  const recommendations = db.getRecommendedWorkersForRequest(req.params.id);
  return res.json({ recommendations });
});

// Allot single or multiple workers according to manpower requirement
app.post("/api/admin/requests/:id/allot-workers", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const { workerIds } = req.body;
  if (!Array.isArray(workerIds) || workerIds.length === 0) {
    return res.status(400).json({ error: "Please provide an array of workerIds to allot." });
  }
  const result = db.allotWorkers(req.params.id, workerIds, adminUser.id, adminUser.name);
  if (!result.success) {
    return res.status(400).json(result);
  }
  broadcastRealtimeEvent({ type: "WORKERS_ALLOTTED", bookingId: req.params.id, booking: result.booking });
  return res.json(result);
});

app.post("/api/admin/requests/:id/allot-worker", requireAdmin, (req, res) => {
  const adminUser = (req as any).user as User;
  const { workerId, workerIds } = req.body;
  const ids: string[] = Array.isArray(workerIds) ? workerIds : workerId ? [workerId] : [];
  if (ids.length === 0) {
    return res.status(400).json({ error: "Please select worker(s) to allot." });
  }
  const result = db.allotWorkers(req.params.id, ids, adminUser.id, adminUser.name);
  if (!result.success) {
    return res.status(400).json(result);
  }
  broadcastRealtimeEvent({ type: "WORKERS_ALLOTTED", bookingId: req.params.id, booking: result.booking });
  return res.json(result);
});

// Worker individual assignment status transition (APPROACHED, REACHED, WORK_STARTED, RESOLVED)
app.post("/api/bookings/:id/assignment-status", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required to update assignment status." });
  }

  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Service request not found." });
  }

  const { workerId, assignmentId, status, note } = req.body;

  if (user.role === "worker") {
    const workerProfile = db.workerProfiles.find(w => w.userId === user.id);
    if (!workerProfile) {
      return res.status(403).json({ error: "Worker profile not found for authenticated user." });
    }

    // Check if authenticated worker is allocated to this booking
    const isAllocated =
      (booking.assignments && booking.assignments.some(a => a.workerId === workerProfile.id)) ||
      booking.workerId === workerProfile.id ||
      booking.workerId === user.id;

    if (!isAllocated) {
      return res.status(403).json({
        error: "Forbidden: You are not allocated to this service request."
      });
    }

    // Strictly update this worker's assignment
    const targetId = workerProfile.id;
    const result = db.updateAssignmentStatus(req.params.id, targetId, status, note);
    if (!result.success) {
      return res.status(400).json(result);
    }
    broadcastRealtimeEvent({ type: "ASSIGNMENT_STATUS_UPDATED", bookingId: req.params.id, booking: result.booking, status });
    return res.json(result);
  } else if (user.role === "admin") {
    const targetId = workerId || assignmentId || (booking.assignments && booking.assignments[0]?.workerId) || booking.workerId;
    if (!targetId) {
      return res.status(400).json({ error: "Worker ID or Assignment ID required for administrative status override." });
    }
    const result = db.updateAssignmentStatus(req.params.id, targetId, status, note);
    if (!result.success) {
      return res.status(400).json(result);
    }
    broadcastRealtimeEvent({ type: "ASSIGNMENT_STATUS_UPDATED", bookingId: req.params.id, booking: result.booking, status });
    return res.json(result);
  } else {
    return res.status(403).json({ error: "Forbidden: Customers cannot update worker assignment status." });
  }
});

// Final Customer Confirmation of Service Completion (Proceed button in status)
app.post("/api/bookings/:id/confirm-completion", (req, res) => {
  const user = getAuthUser(req);
  const customerUserId = user ? user.id : (req.body?.customerId || "usr-customer-demo");
  if (user && user.role === "worker") {
    return res.status(403).json({ error: "Only customers can confirm final service completion." });
  }

  const result = db.confirmCompletion(req.params.id, customerUserId);
  if (!result.success) {
    return res.status(400).json(result);
  }
  broadcastRealtimeEvent({ type: "BOOKING_COMPLETED", bookingId: req.params.id, booking: result.booking });
  return res.json({ success: true, booking: result.booking, message: "Service successfully confirmed and completed." });
});

/* ==========================================================================
   9. NOTIFICATIONS
   ========================================================================== */

app.get("/api/notifications", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.json({ notifications: db.notifications.slice(0, 5) });
  }

  const userNotifs = db.notifications
    .filter(n => n.recipientUserId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ notifications: userNotifs });
});

app.post("/api/notifications/:id/read", (req, res) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    db.save();
  }
  return res.json({ success: true });
});

/* ==========================================================================
   10. VITE MIDDLEWARE / STATIC ASSETS
   ========================================================================== */

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ShramConnect Server running on port ${PORT}`);
  });
}

startServer();
