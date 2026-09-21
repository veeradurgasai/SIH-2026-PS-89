import fs from "fs";
import path from "path";
import { hashPassword } from "./security";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "worker" | "admin";
  passwordHash?: string;
  passwordSalt?: string;
  isPhoneVerified?: boolean;
  isActive?: boolean;
  avatarUrl?: string;
  cooperativeId?: string;
  zone: string;
  createdAt: string;
}

export interface Cooperative {
  id: string;
  name: string;
  code: string;
  registrationNumber: string;
  district: string;
  state: string;
  serviceArea: string; // e.g. "Zone A"
  description: string;
  totalWorkers: number;
  activeWorkers: number;
  contactEmail: string;
  contactPhone: string;
  rating: number;
  startingPrice: number;
  supportedCategories: string[];
  avgResponseMinutes: number;
  adminId?: string;
  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;
  distanceKm?: number;
  commissionPercentage?: number;
  commissionName?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  baseRatePerHour: number;
  emergencyMultiplier: number;
  avgDurationHours: number;
}

export interface WorkerSkill {
  id: string;
  workerId: string;
  categoryId: string;
  skillName: string;
  yearsExperience: number;
  isPrimary: boolean;
}

export interface Certification {
  id: string;
  workerId: string;
  title: string;
  issuingBody: string;
  issuedDate: string;
  expiryDate: string;
  certificateNumber: string;
  status: "verified" | "pending" | "expired";
}

export interface WorkerDocument {
  id: string;
  slotNumber: number;
  slotName: string;
  name: string;
  type: string;
  documentNumber?: string;
  fileName?: string;
  fileSize?: string;
  fileData?: string;
  uploadedAt: string;
  status: "verified" | "pending" | "rejected";
}

export type WorkerApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface WorkerProfile {
  id: string;
  userId: string;
  cooperativeId: string;
  badgeNumber: string;
  isCooperativeVerified: boolean;
  applicationStatus: WorkerApplicationStatus;
  loginEnabled?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  submittedAt?: string;
  serviceArea?: string;
  availability?: string;
  idProofType?: string;
  idProofNumber?: string;
  status: "available" | "busy" | "on_trip" | "offline";
  currentZone: string;
  homeZone: string;
  latitude: number;
  longitude: number;
  rating: number;
  ratingCount: number;
  completedJobsCount: number;
  acceptanceRate: number; // 0-100%
  responseRate: number; // 0-100%
  currentWorkload: number; // current active bookings
  languages: string[];
  experienceYears: number;
  hourlyRate: number;
  bio: string;
  briefExplanation?: string;
  documents?: WorkerDocument[];
  documentCount?: number;
  isNew?: boolean;
  isNewEmployee?: boolean;
  welfareStatus: "active" | "pending" | "expiring_soon";
  allocatedZone?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action:
    | "WORKER_APPROVED"
    | "WORKER_REJECTED"
    | "WORKER_SUSPENDED"
    | "WORKER_REACTIVATED"
    | "CREDENTIAL_SETUP_SENT"
    | "ADMIN_CREATED"
    | "PASSWORD_RESET"
    | "REQUEST_ACCEPTED"
    | "REQUEST_REJECTED"
    | "WORKER_ALLOTTED";
  targetId?: string;
  targetName?: string;
  details: string;
  timestamp: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  address: string;
  zone: string;
  latitude?: number;
  longitude?: number;
  emergencyContact?: string;
}

export type BookingStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "APPROVED_BY_FEDERATION"
  | "SENDING_WORKERS"
  | "WORKERS_BEING_ALLOCATED"
  | "WORKERS_ALLOCATED"
  | "WORKERS_ON_THE_WAY"
  | "WORKERS_REACHED"
  | "WORK_STARTED"
  | "IN_PROGRESS"
  | "GOING_ON"
  | "RESOLVED"
  | "COMPLETED"
  | "REJECTED"
  | "DECLINED"
  | "CANCELLED"
  // Legacy aliases
  | "WORKER_ALLOTTED"
  | "ON_THE_WAY"
  | "APPROACHED"
  | "WE_ARE_COMING"
  | "REACHED"
  | "REQUESTED"
  | "MATCHED";

export type AssignmentStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "REJECTED"
  | "ON_THE_WAY"
  | "APPROACHED"
  | "WE_ARE_COMING"
  | "REACHED"
  | "WORK_STARTED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "COMPLETED"
  | "CANCELLED";

export interface WorkAssignment {
  id: string;
  bookingId: string;
  serviceRequestId?: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  workerAvatarUrl?: string;
  workerBadgeNumber: string;
  primarySkill?: string;
  rating?: number;
  assignedAt: string;
  status: AssignmentStatus;
  statusHistory: { status: AssignmentStatus; timestamp: string; note?: string }[];
  workerAmount: number;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  startedTravelAt?: string;
  reachedAt?: string;
  startedWorkAt?: string;
  completedAt?: string;
}

export interface PaymentAllocation {
  id: string;
  serviceRequestId: string;
  workerId?: string;
  workerName?: string;
  amount: number;
  allocationType: "WORKER_FARE" | "FEDERATION_COMMISSION";
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerZone: string;
  cooperativeId?: string;
  cooperativeName?: string;
  adminId?: string;
  adminName?: string;
  workerId?: string;
  workerName?: string;
  workerPhone?: string;
  workerAvatarUrl?: string;
  workerBadgeNumber?: string;
  categoryId: string;
  categoryName: string;
  description: string;
  manpowerRequired?: number;
  assignments?: WorkAssignment[];
  isEmergency: boolean;
  scheduledDate: string;
  scheduledTime: string;
  status: BookingStatus;
  statusHistory: { status: BookingStatus; timestamp: string; note?: string }[];
  baseAmount: number;
  emergencyFee: number;
  cooperativeFee: number; // 5-10%
  workerNetEarnings: number;
  totalAmount: number;
  customerTotalAmount?: number;
  commissionPercentage?: number;
  commissionAmount?: number;
  workerPoolAmount?: number;
  workerEarnings?: number;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  paymentMethod?: string;
  paymentTransactionId?: string;
  paidAt?: string;
  ratingId?: string;
  acceptedBy?: string;
  acceptedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  declinedBy?: string;
  declinedAt?: string;
  declineReason?: string;
  adminNote?: string;
  completedByCustomerId?: string;
  allottedAt?: string;
  allottedBy?: string;
  matchScore?: number;
  matchReasons?: string[];
  photos?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface Rating {
  id: string;
  bookingId: string;
  workerId: string;
  customerId: string;
  serviceQuality: number; // 1-5
  punctuality: number; // 1-5
  professionalism: number; // 1-5
  overallRating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface WelfareRecord {
  id: string;
  workerId: string;
  schemeName: string;
  type: "INSURANCE" | "PENSION" | "TRAINING" | "EDUCATION" | "EQUIPMENT";
  policyOrRegNumber: string;
  provider: string;
  status: "ACTIVE" | "PENDING" | "EXPIRING_SOON" | "NOT_ENROLLED";
  coverageAmount?: number;
  renewalDate: string;
  description: string;
}

export interface DemandRecord {
  id: string;
  date: string;
  zone: string;
  categoryId: string;
  categoryName: string;
  bookingCount: number;
  completedCount: number;
}

export interface WorkforceAllocation {
  id: string;
  recommendationDate: string;
  categoryId: string;
  categoryName: string;
  sourceZone: string;
  targetZone: string;
  recommendedWorkerCount: number;
  reason: string;
  status: "PENDING" | "APPLIED" | "REJECTED";
  appliedAt?: string;
  confidenceScore: number;
}

export interface Notification {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: "BOOKING" | "ALERT" | "EARNING" | "WELFARE";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Zones in our cooperative service network
export const ZONES = [
  { id: "Zone A", name: "Zone A (Central & Tech Corridor)", centerLat: 12.9716, centerLng: 77.5946 },
  { id: "Zone B", name: "Zone B (South Residential Hub)", centerLat: 12.9250, centerLng: 77.5897 },
  { id: "Zone C", name: "Zone C (East Suburbs & Industrial)", centerLat: 12.9860, centerLng: 77.7200 },
  { id: "Zone D", name: "Zone D (North Growth Belt)", centerLat: 13.0358, centerLng: 77.5970 }
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "cat-plumbing", name: "Plumbing", slug: "plumbing", icon: "Wrench", description: "Leak repairs, pipe installations, sanitary ware & fittings", baseRatePerHour: 350, emergencyMultiplier: 1.5, avgDurationHours: 1.5 },
  { id: "cat-electrical", name: "Electrical", slug: "electrical", icon: "Zap", description: "Wiring, switchboard fixes, short-circuits, appliance setup", baseRatePerHour: 400, emergencyMultiplier: 1.5, avgDurationHours: 1.5 },
  { id: "cat-carpentry", name: "Carpentry", slug: "carpentry", icon: "Hammer", description: "Furniture repair, lock replacements, modular fittings", baseRatePerHour: 450, emergencyMultiplier: 1.3, avgDurationHours: 2.0 },
  { id: "cat-painting", name: "Painting", slug: "painting", icon: "Paintbrush", description: "Wall touch-ups, waterproof coatings, interior repaint", baseRatePerHour: 500, emergencyMultiplier: 1.2, avgDurationHours: 4.0 },
  { id: "cat-cleaning", name: "Cleaning", slug: "cleaning", icon: "Sparkles", description: "Deep kitchen sanitization, water tank cleaning, floor buffing", baseRatePerHour: 300, emergencyMultiplier: 1.3, avgDurationHours: 2.5 },
  { id: "cat-caregiving", name: "Caregiving", slug: "caregiving", icon: "HeartHandshake", description: "Elder assistance, mobility support, patient aid", baseRatePerHour: 350, emergencyMultiplier: 1.4, avgDurationHours: 4.0 },
  { id: "cat-driving", name: "Driving", slug: "driving", icon: "Car", description: "Verified cooperative drivers for local & outstation trips", baseRatePerHour: 300, emergencyMultiplier: 1.3, avgDurationHours: 3.0 },
  { id: "cat-gardening", name: "Gardening", slug: "gardening", icon: "Flower2", description: "Lawn pruning, balcony garden care, organic pest treatment", baseRatePerHour: 280, emergencyMultiplier: 1.2, avgDurationHours: 2.0 },
  { id: "cat-technician", name: "Technician Services", slug: "technician", icon: "Cpu", description: "RO water purifier, inverter repair, washing machine servicing", baseRatePerHour: 450, emergencyMultiplier: 1.4, avgDurationHours: 1.5 }
];

class Database {
  private dataDir = path.join(process.cwd(), "data");
  private dbFile = path.join(process.cwd(), "data", "database.json");

  public users: User[] = [];
  public cooperatives: Cooperative[] = [];
  public categories: ServiceCategory[] = SERVICE_CATEGORIES;
  public workerSkills: WorkerSkill[] = [];
  public certifications: Certification[] = [];
  public workerProfiles: WorkerProfile[] = [];
  public customerProfiles: CustomerProfile[] = [];
  public bookings: Booking[] = [];
  public ratings: Rating[] = [];
  public welfareRecords: WelfareRecord[] = [];
  public demandHistory: DemandRecord[] = [];
  public allocations: WorkforceAllocation[] = [];
  public paymentAllocations: PaymentAllocation[] = [];
  public notifications: Notification[] = [];
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (e) {
        console.warn("Could not create data dir, using in-memory store", e);
      }
    }

    if (fs.existsSync(this.dbFile)) {
      try {
        const raw = fs.readFileSync(this.dbFile, "utf-8");
        const parsed = JSON.parse(raw);
        this.users = parsed.users || [];
        this.cooperatives = parsed.cooperatives || [];
        this.categories = parsed.categories || SERVICE_CATEGORIES;
        this.workerSkills = parsed.workerSkills || [];
        this.certifications = parsed.certifications || [];
        this.workerProfiles = parsed.workerProfiles || [];
        this.customerProfiles = parsed.customerProfiles || [];
        this.bookings = parsed.bookings || [];
        this.ratings = parsed.ratings || [];
        this.welfareRecords = parsed.welfareRecords || [];
        this.demandHistory = parsed.demandHistory || [];
        this.allocations = parsed.allocations || [];
        this.paymentAllocations = parsed.paymentAllocations || [];
        this.notifications = parsed.notifications || [];
        this.auditLogs = parsed.auditLogs || [];

        if (this.users.length > 0 && this.workerProfiles.length >= 10) {
          this.migrateSecurity();
          console.log(`Database loaded from file with ${this.workerProfiles.length} workers, ${this.bookings.length} bookings.`);
          return;
        }
      } catch (err) {
        console.warn("Error reading db file, regenerating seed data:", err);
      }
    }

    // Seed comprehensive database
    this.seed();
    this.migrateSecurity();
    this.save();
  }

  /**
   * Migrate and ensure all records have security hashes, phone verification, and application statuses.
   */
  public migrateSecurity() {
    const defaultCredentials = hashPassword("Shramik@2026");

    // 1. First ensure worker profiles have coherent status
    for (const wp of this.workerProfiles) {
      if (!wp.applicationStatus) {
        wp.applicationStatus = wp.isCooperativeVerified ? "APPROVED" : "PENDING";
      }
      if (wp.loginEnabled === undefined) {
        wp.loginEnabled = wp.applicationStatus === "APPROVED";
      }
      if (wp.applicationStatus === "APPROVED") {
        wp.loginEnabled = true;
        if (!wp.approvedAt) {
          wp.approvedAt = "2024-01-01T10:00:00Z";
          wp.approvedBy = "Cooperative Scrutiny Committee";
        }
      } else {
        wp.loginEnabled = false;
      }
    }

    // 2. Ensure users have password hashes and synced isActive state based on role/approval
    for (const u of this.users) {
      if (!u.passwordHash || !u.passwordSalt || u.email.toLowerCase() === "sunil.worker@example.com") {
        u.passwordHash = defaultCredentials.hash;
        u.passwordSalt = defaultCredentials.salt;
      }
      if (u.isPhoneVerified === undefined) {
        u.isPhoneVerified = true;
      }
      if (u.role === "worker") {
        const wp = this.workerProfiles.find(w => w.userId === u.id);
        u.isActive = wp?.applicationStatus === "APPROVED" && wp?.loginEnabled === true;
      } else {
        u.isActive = true;
      }
    }

    // Ensure initial audit logs exist
    if (this.auditLogs.length === 0) {
      const admin = this.users.find(u => u.role === "admin");
      this.auditLogs.push({
        id: `audit-init-01`,
        adminId: admin?.id || "usr-admin-1",
        adminName: admin?.name || "Dr. K. Srinivas Murthy",
        action: "ADMIN_CREATED",
        targetId: admin?.id || "usr-admin-1",
        targetName: admin?.name || "Dr. K. Srinivas Murthy",
        details: "Cooperative Federation Administrator account initialized with high-trust credentials.",
        timestamp: "2024-01-01T08:00:00.000Z"
      });
      this.auditLogs.push({
        id: `audit-init-02`,
        adminId: admin?.id || "usr-admin-1",
        adminName: admin?.name || "Dr. K. Srinivas Murthy",
        action: "WORKER_APPROVED",
        targetId: "wkr-plumb-1",
        targetName: "Ravi Kumar",
        details: "Worker application verified and approved. Cooperative badge SK-PL-01 issued.",
        timestamp: "2024-01-02T10:30:00.000Z"
      });
    }

    // Ensure pending worker exists for verification testing
    const hasPendingWorker = this.workerProfiles.some(w => w.applicationStatus === "PENDING");
    if (!hasPendingWorker) {
      const pendingUserId = "usr-pending-sunil";
      const pendingWorkerId = "wkr-pending-sunil";
      
      const pendingUser: User = {
        id: pendingUserId,
        name: "Sunil Verma",
        email: "sunil.worker@example.com",
        phone: "+91 98112 23344",
        role: "worker",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        zone: "Zone B",
        isPhoneVerified: true,
        isActive: false, // Pending approval: Login is disabled!
        passwordHash: defaultCredentials.hash,
        passwordSalt: defaultCredentials.salt,
        cooperativeId: "coop-blr-central",
        createdAt: new Date().toISOString()
      };

      const pendingProfile: WorkerProfile = {
        id: pendingWorkerId,
        userId: pendingUserId,
        cooperativeId: "coop-blr-central",
        badgeNumber: "SK-EL-PENDING-04",
        isCooperativeVerified: false,
        applicationStatus: "PENDING",
        submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        idProofType: "Aadhaar Card",
        idProofNumber: "XXXX-XXXX-8821",
        status: "offline",
        currentZone: "Zone B",
        homeZone: "Zone B",
        latitude: 12.9260,
        longitude: 77.5910,
        rating: 5.0,
        ratingCount: 0,
        completedJobsCount: 0,
        acceptanceRate: 100,
        responseRate: 100,
        currentWorkload: 0,
        languages: ["Kannada", "Hindi", "English"],
        experienceYears: 4,
        hourlyRate: 380,
        bio: "Experienced residential and commercial wireman seeking cooperative accreditation. Holds ITI certificate in Electrical Installation.",
        welfareStatus: "pending"
      };

      this.users.push(pendingUser);
      this.workerProfiles.push(pendingProfile);
      this.workerSkills.push({
        id: `ws-${pendingWorkerId}-1`,
        workerId: pendingWorkerId,
        categoryId: "cat-electrical",
        skillName: "Electrical Wiring & Distribution",
        yearsExperience: 4,
        isPrimary: true
      });
      this.certifications.push({
        id: `cert-${pendingWorkerId}-1`,
        workerId: pendingWorkerId,
        title: "Industrial Training Institute (ITI) Electrician Trade Certificate",
        issuingBody: "Directorate of Industrial Training",
        issuedDate: "2022-06-15",
        expiryDate: "2032-06-15",
        certificateNumber: "ITI-KA-2022-8902",
        status: "pending"
      });
    }

    // Ensure 3 regional cooperatives are seeded with complete metadata
    if (!this.cooperatives || this.cooperatives.length < 3) {
      this.cooperatives = [
        {
          id: "coop-blr-central",
          name: "Central Bengaluru Shramik Sahakari Sangha",
          code: "SSS-BLR-042",
          registrationNumber: "COOP/BLR/2019/8841",
          district: "Bengaluru Urban",
          state: "Karnataka",
          serviceArea: "Zone A",
          description: "Apex cooperative federation serving Central Bengaluru, Indiranagar, Bellandur, and Outer Ring Road tech corridor with certified trade specialists.",
          totalWorkers: 320,
          activeWorkers: 285,
          contactEmail: "central@shramikcoop.org",
          contactPhone: "+91 80 2664 1900",
          rating: 4.88,
          startingPrice: 350,
          avgResponseMinutes: 15,
          supportedCategories: ["cat-plumbing", "cat-electrical", "cat-carpentry", "cat-painting", "cat-cleaning", "cat-technician"]
        },
        {
          id: "coop-blr-south",
          name: "South Bengaluru Karma Sahakari Federation",
          code: "KBR-SOU-109",
          registrationNumber: "COOP/BLR/2020/9214",
          district: "Bengaluru Urban",
          state: "Karnataka",
          serviceArea: "Zone B",
          description: "Community-governed cooperative union serving Jayanagar, JP Nagar, BTM, and Koramangala households with certified household trades.",
          totalWorkers: 210,
          activeWorkers: 195,
          contactEmail: "south@shramikcoop.org",
          contactPhone: "+91 80 2668 3322",
          rating: 4.82,
          startingPrice: 320,
          avgResponseMinutes: 20,
          supportedCategories: ["cat-plumbing", "cat-electrical", "cat-cleaning", "cat-caregiving", "cat-gardening", "cat-painting"]
        },
        {
          id: "coop-blr-east",
          name: "East Corridor Pragati Shramik Society",
          code: "EPSS-EAS-204",
          registrationNumber: "COOP/BLR/2021/1105",
          district: "Bengaluru Rural / East",
          state: "Karnataka",
          serviceArea: "Zone C",
          description: "Democratically organized workforce network serving Whitefield, Marathahalli, Kadugodi, and Mahadevapura residential and business clusters.",
          totalWorkers: 180,
          activeWorkers: 162,
          contactEmail: "east@shramikcoop.org",
          contactPhone: "+91 80 2845 5566",
          rating: 4.79,
          startingPrice: 340,
          avgResponseMinutes: 25,
          supportedCategories: ["cat-plumbing", "cat-electrical", "cat-carpentry", "cat-technician", "cat-driving", "cat-cleaning"]
        }
      ];
    }

    // Ensure all 3 cooperatives have serviceArea, rating, startingPrice, commission
    this.cooperatives = this.cooperatives.map(c => {
      if (!c.serviceArea) {
        c.serviceArea = c.id.includes("south") ? "Zone B" : c.id.includes("east") ? "Zone C" : "Zone A";
      }
      if (!c.rating) c.rating = 4.85;
      if (!c.startingPrice) c.startingPrice = 350;
      if (!c.avgResponseMinutes) c.avgResponseMinutes = 18;
      if (!c.commissionPercentage) c.commissionPercentage = 10;
      if (!c.commissionName) c.commissionName = "Federation Service Commission";
      if (!c.supportedCategories || c.supportedCategories.length === 0) {
        c.supportedCategories = ["cat-plumbing", "cat-electrical", "cat-carpentry", "cat-painting", "cat-cleaning", "cat-technician", "cat-caregiving", "cat-driving", "cat-gardening"];
      }
      return c;
    });

    // Ensure dedicated verified active cooperative admin accounts exist for all cooperatives
    const adminAccounts = [
      {
        id: "usr-demo-admin",
        name: "Dr. K. Srinivas Murthy",
        email: "demo.admin@example.com",
        phone: "+91 98450 11223",
        role: "admin" as const,
        cooperativeId: "coop-blr-central",
        zone: "Zone A"
      },
      {
        id: "usr-admin-south",
        name: "Smt. Lakshmi Devi",
        email: "south.admin@shramikcoop.org",
        phone: "+91 98450 22334",
        role: "admin" as const,
        cooperativeId: "coop-blr-south",
        zone: "Zone B"
      },
      {
        id: "usr-admin-east",
        name: "Sri R. Venkatraman",
        email: "east.admin@shramikcoop.org",
        phone: "+91 98450 33445",
        role: "admin" as const,
        cooperativeId: "coop-blr-east",
        zone: "Zone C"
      }
    ];

    for (const adm of adminAccounts) {
      const existing = this.users.find(u => u.email === adm.email || u.id === adm.id);
      if (existing) {
        existing.role = "admin";
        existing.cooperativeId = adm.cooperativeId;
        existing.zone = adm.zone;
        existing.isActive = true;
        existing.isPhoneVerified = true;
        if (!existing.passwordHash) {
          existing.passwordHash = defaultCredentials.hash;
          existing.passwordSalt = defaultCredentials.salt;
        }
      } else {
        this.users.push({
          id: adm.id,
          name: adm.name,
          email: adm.email,
          phone: adm.phone,
          role: "admin",
          cooperativeId: adm.cooperativeId,
          zone: adm.zone,
          isActive: true,
          isPhoneVerified: true,
          passwordHash: defaultCredentials.hash,
          passwordSalt: defaultCredentials.salt,
          createdAt: "2024-01-01T08:00:00Z"
        });
      }
    }

    // Ensure all bookings have cooperativeId, cooperativeName, manpowerRequired, and pricing
    for (const b of this.bookings) {
      if (!b.cooperativeId) {
        b.cooperativeId = b.customerZone === "Zone B" ? "coop-blr-south" : b.customerZone === "Zone C" ? "coop-blr-east" : "coop-blr-central";
      }
      if (!b.cooperativeName) {
        const coop = this.cooperatives.find(c => c.id === b.cooperativeId);
        b.cooperativeName = coop?.name || "Central Bengaluru Shramik Sahakari Sangha";
      }
      if (b.status === "MATCHED" || b.status === "REQUESTED") {
        b.status = "SUBMITTED";
      }
      if (!b.manpowerRequired || b.manpowerRequired < 1) {
        b.manpowerRequired = 1;
      }
      if (!b.customerTotalAmount) {
        b.customerTotalAmount = b.totalAmount;
      }
      if (!b.commissionPercentage) {
        b.commissionPercentage = 10;
      }
      if (!b.commissionAmount) {
        b.commissionAmount = Math.round((b.totalAmount * 0.1) * 100) / 100;
      }
      if (!b.workerPoolAmount) {
        b.workerPoolAmount = Math.round((b.totalAmount - b.commissionAmount) * 100) / 100;
      }
      if (!b.workerEarnings) {
        b.workerEarnings = Math.round((b.workerPoolAmount / b.manpowerRequired) * 100) / 100;
      }

      // Backfill assignments if already allotted
      if ((b.workerId || b.status === "WORKER_ALLOTTED" || b.status === "IN_PROGRESS" || b.status === "COMPLETED") && (!b.assignments || b.assignments.length === 0)) {
        const assignedWId = b.workerId || this.workerProfiles[0]?.id;
        const workerProf = this.workerProfiles.find(w => w.id === assignedWId);
        const wUser = workerProf ? this.users.find(u => u.id === workerProf.userId) : null;
        const nowStr = b.allottedAt || b.createdAt;
        const initialStatus: AssignmentStatus = b.status === "COMPLETED" ? "COMPLETED" : b.status === "IN_PROGRESS" ? "IN_PROGRESS" : "ASSIGNED";
        b.assignments = [
          {
            id: `asgn-${b.id}-${assignedWId}`,
            bookingId: b.id,
            serviceRequestId: b.id,
            workerId: assignedWId,
            workerName: b.workerName || wUser?.name || "Allotted Artisan",
            workerPhone: b.workerPhone || wUser?.phone || "",
            workerAvatarUrl: b.workerAvatarUrl || wUser?.avatarUrl,
            workerBadgeNumber: b.workerBadgeNumber || workerProf?.badgeNumber || "SK-01",
            primarySkill: b.categoryName,
            rating: workerProf?.rating || 4.8,
            assignedAt: nowStr,
            status: initialStatus,
            statusHistory: [{ status: initialStatus, timestamp: nowStr, note: "Initial allotment" }],
            workerAmount: b.workerEarnings
          }
        ];
      }
    }

    // Ensure all workers have cooperativeId
    for (const wp of this.workerProfiles) {
      if (!wp.cooperativeId) {
        wp.cooperativeId = wp.currentZone === "Zone B" ? "coop-blr-south" : wp.currentZone === "Zone C" ? "coop-blr-east" : "coop-blr-central";
      }
      if (wp.currentWorkload === undefined) {
        const activeCount = this.bookings.filter(b => 
          (b.workerId === wp.id || b.assignments?.some(a => a.workerId === wp.id)) && 
          (b.status === "WORKER_ALLOTTED" || b.status === "WORKERS_ALLOCATED" || b.status === "IN_PROGRESS" || b.status === "ON_THE_WAY" || b.status === "WORKERS_ON_THE_WAY")
        ).length;
        wp.currentWorkload = activeCount;
      }
    }

    // Ensure all admin users have cooperativeId
    for (const u of this.users) {
      if (u.role === "admin" && !u.cooperativeId) {
        u.cooperativeId = "coop-blr-central";
      }
    }

    this.save();
  }

  public getCooperatives(): Cooperative[] {
    return this.cooperatives;
  }

  public getCooperativeById(id: string): Cooperative | undefined {
    return this.cooperatives.find(c => c.id === id);
  }

  public acceptRequest(bookingId: string, adminId: string, adminName: string): { success: boolean; booking?: Booking; message?: string } {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Request not found" };

    const now = new Date().toISOString();
    booking.status = "APPROVED_BY_FEDERATION";
    booking.adminId = adminId;
    booking.approvedBy = adminName;
    booking.approvedAt = now;
    booking.acceptedBy = adminName;
    booking.acceptedAt = now;
    booking.statusHistory.push({
      status: "APPROVED_BY_FEDERATION",
      timestamp: now,
      note: `Request accepted and approved by Cooperative Admin ${adminName}. Awaiting workforce allocation.`
    });

    this.addAuditLog({
      adminId,
      adminName,
      action: "REQUEST_ACCEPTED" as any,
      targetId: booking.id,
      targetName: booking.bookingNumber,
      details: `Service request ${booking.bookingNumber} approved by admin. Ready for worker allocation.`
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}-c`,
      recipientUserId: booking.customerId,
      title: "Request Approved by Federation",
      message: `Your service request for ${booking.categoryName} was reviewed and approved by ${booking.cooperativeName}. The administrator is currently assigning certified cooperative workers.`,
      type: "BOOKING",
      read: false,
      createdAt: now
    });

    this.save();
    return { success: true, booking };
  }

  public rejectRequest(bookingId: string, reason: string, adminId: string, adminName: string): { success: boolean; booking?: Booking; message?: string } {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Request not found" };

    const now = new Date().toISOString();
    booking.status = "DECLINED";
    booking.rejectionReason = reason;
    booking.declineReason = reason;
    booking.declinedBy = adminName;
    booking.declinedAt = now;
    booking.rejectedBy = adminName;
    booking.rejectedAt = now;
    booking.adminId = adminId;
    booking.statusHistory.push({
      status: "DECLINED",
      timestamp: now,
      note: `Request declined by Cooperative Admin ${adminName}. Reason: ${reason}`
    });

    this.addAuditLog({
      adminId,
      adminName,
      action: "REQUEST_REJECTED" as any,
      targetId: booking.id,
      targetName: booking.bookingNumber,
      details: `Service request ${booking.bookingNumber} declined. Reason: ${reason}`
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}-c`,
      recipientUserId: booking.customerId,
      title: "Request Declined by Cooperative",
      message: `Your service request for ${booking.categoryName} was declined by ${booking.cooperativeName}: ${reason}`,
      type: "BOOKING",
      read: false,
      createdAt: now
    });

    this.save();
    return { success: true, booking };
  }

  public sendWorkers(bookingId: string, adminId: string, adminName: string): { success: boolean; booking?: Booking; message?: string } {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Request not found" };

    const now = new Date().toISOString();
    booking.status = "SENDING_WORKERS";
    booking.statusHistory.push({
      status: "SENDING_WORKERS",
      timestamp: now,
      note: `Cooperative Admin ${adminName} initiated deployment: Workers are being arranged and sent to your location.`
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}-send`,
      recipientUserId: booking.customerId,
      title: "Workers Being Dispatched",
      message: `Workers are being arranged and sent to your location by ${booking.cooperativeName}.`,
      type: "BOOKING",
      read: false,
      createdAt: now
    });

    this.save();
    return { success: true, booking };
  }

  public setAdminNote(bookingId: string, note: string, adminId: string, adminName: string): { success: boolean; booking?: Booking; message?: string } {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Request not found" };

    const now = new Date().toISOString();
    booking.adminNote = note.trim();
    booking.statusHistory.push({
      status: booking.status,
      timestamp: now,
      note: `Message from Cooperative Admin: ${note.trim()}`
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}-adm-note`,
      recipientUserId: booking.customerId,
      title: "Message from Cooperative Admin",
      message: note.trim(),
      type: "BOOKING",
      read: false,
      createdAt: now
    });

    this.save();
    return { success: true, booking };
  }

  public allotWorkers(
    bookingId: string,
    workerIds: string[],
    adminId: string,
    adminName: string
  ): { success: boolean; booking?: Booking; message?: string } {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Request not found" };

    const requiredCount = booking.manpowerRequired || 1;
    if (!Array.isArray(workerIds) || workerIds.length !== requiredCount) {
      return {
        success: false,
        message: `Please allocate exactly ${requiredCount} worker(s) as requested by the citizen.`
      };
    }

    // Check duplicate IDs
    const uniqueIds = Array.from(new Set(workerIds));
    if (uniqueIds.length !== workerIds.length) {
      return { success: false, message: "Cannot allocate duplicate workers." };
    }

    // Verify all workers exist, are approved, belong to the booking domain, and are not already assigned to active work
    const selectedWorkers: { profile: WorkerProfile; user?: User }[] = [];
    for (const wId of workerIds) {
      const worker = this.workerProfiles.find(w => w.id === wId || w.userId === wId);
      if (!worker) {
        return { success: false, message: `Worker ${wId} not found in cooperative roster.` };
      }
      const user = this.users.find(u => u.id === worker.userId);

      // 1. Problem 3: Strict Domain Check
      const skills = this.workerSkills.filter(s => s.workerId === worker.id);
      const bCatId = (booking.categoryId || "").toLowerCase().trim();
      const bCatName = (booking.categoryName || "").toLowerCase().trim();
      const hasDomain = skills.some(s => {
        const sCatId = (s.categoryId || "").toLowerCase().trim();
        const sSkillName = (s.skillName || "").toLowerCase().trim();
        return (
          (bCatId && (sCatId === bCatId || sCatId.includes(bCatId) || bCatId.includes(sCatId))) ||
          (bCatName && (sSkillName === bCatName || sSkillName.includes(bCatName) || bCatName.includes(sSkillName))) ||
          (bCatName && sCatId.includes(bCatName)) ||
          (bCatId && sSkillName.includes(bCatId))
        );
      });

      if (!hasDomain) {
        return {
          success: false,
          message: `Worker ${user?.name || worker.badgeNumber} is not certified in the "${booking.categoryName}" domain. Only workers belonging to this domain can be allotted.`
        };
      }

      // 2. Problem 2: Prevent Allotment of Already Assigned Workers
      const isAlreadyAssigned = this.bookings.some(b => {
        if (b.id === bookingId) return false;
        const isFinished = ["RESOLVED", "COMPLETED", "REJECTED", "DECLINED", "CANCELLED"].includes(b.status);
        if (isFinished) return false;
        const isDirect = b.workerId === worker.id || (user && b.workerId === user.id);
        const isAssigned = b.assignments?.some(a => 
          (a.workerId === worker.id || (user && a.workerId === user.id)) &&
          !["REJECTED", "CANCELLED", "RESOLVED", "COMPLETED"].includes(a.status)
        );
        return Boolean(isDirect || isAssigned);
      });

      if (isAlreadyAssigned || worker.status === "busy" || worker.status === "on_trip") {
        return {
          success: false,
          message: `Worker ${user?.name || worker.badgeNumber} is already assigned to an ongoing work. A worker cannot be allotted to a second work while an active job is ongoing.`
        };
      }

      if (worker.applicationStatus !== "APPROVED") {
        worker.applicationStatus = "APPROVED";
        worker.loginEnabled = true;
        worker.isCooperativeVerified = true;
      }
      if (user) user.isActive = true;
      selectedWorkers.push({ profile: worker, user });
    }

    // Calculate internal financial distribution
    const totalAmount = booking.totalAmount || (booking.baseAmount + (booking.emergencyFee || 0));
    const coop = this.cooperatives.find(c => c.id === booking.cooperativeId) || this.cooperatives[0];
    const commissionPercentage = coop.commissionPercentage || 10;
    const commissionAmount = Math.round((totalAmount * (commissionPercentage / 100)) * 100) / 100;
    const workerPoolAmount = Math.round((totalAmount - commissionAmount) * 100) / 100;
    const perWorkerAmount = Math.round((workerPoolAmount / requiredCount) * 100) / 100;

    booking.customerTotalAmount = totalAmount;
    booking.commissionPercentage = commissionPercentage;
    booking.commissionAmount = commissionAmount;
    booking.workerPoolAmount = workerPoolAmount;
    booking.workerEarnings = perWorkerAmount;
    booking.cooperativeFee = commissionAmount;
    booking.workerNetEarnings = workerPoolAmount;

    // Create Work Assignments for each allocated worker
    const now = new Date().toISOString();
    const assignments: WorkAssignment[] = selectedWorkers.map(({ profile, user }) => {
      const primarySkill =
        this.workerSkills.find(s => s.workerId === profile.id && s.isPrimary)?.skillName ||
        this.workerSkills.find(s => s.workerId === profile.id)?.skillName ||
        booking.categoryName;
      return {
        id: `asgn-${booking.id}-${profile.id}`,
        bookingId: booking.id,
        serviceRequestId: booking.id,
        workerId: profile.id,
        workerName: user?.name || "Cooperative Artisan",
        workerPhone: user?.phone || "",
        workerAvatarUrl: user?.avatarUrl,
        workerBadgeNumber: profile.badgeNumber,
        primarySkill,
        rating: profile.rating,
        assignedAt: now,
        status: "ASSIGNED" as AssignmentStatus,
        statusHistory: [
          {
            status: "ASSIGNED" as AssignmentStatus,
            timestamp: now,
            note: `Assigned by Cooperative Admin ${adminName}`
          }
        ],
        workerAmount: perWorkerAmount
      };
    });

    booking.assignments = assignments;
    booking.workerId = selectedWorkers[0].profile.id;
    booking.workerName = selectedWorkers.map(s => s.user?.name || "Artisan").join(", ");
    booking.workerPhone = selectedWorkers[0].user?.phone || "";
    booking.workerAvatarUrl = selectedWorkers[0].user?.avatarUrl;
    booking.workerBadgeNumber = selectedWorkers.map(s => s.profile.badgeNumber).join(", ");
    booking.adminId = adminId;
    booking.allottedBy = adminName;
    booking.allottedAt = now;
    booking.status = "WORKERS_ALLOCATED";

    booking.statusHistory.push({
      status: "WORKERS_ALLOCATED",
      timestamp: now,
      note: `Allotted ${requiredCount} cooperative worker(s) (${booking.workerName}) by Admin ${adminName}.`
    });

    // Save Payment Allocation records
    this.paymentAllocations.push({
      id: `pa-comm-${booking.id}-${Date.now()}`,
      serviceRequestId: booking.id,
      amount: commissionAmount,
      allocationType: "FEDERATION_COMMISSION",
      createdAt: now
    });

    for (const asgn of assignments) {
      this.paymentAllocations.push({
        id: `pa-wkr-${booking.id}-${asgn.workerId}`,
        serviceRequestId: booking.id,
        workerId: asgn.workerId,
        workerName: asgn.workerName,
        amount: perWorkerAmount,
        allocationType: "WORKER_FARE",
        createdAt: now
      });
    }

    // Increment worker workloads and set status to busy
    for (const { profile } of selectedWorkers) {
      profile.currentWorkload = (profile.currentWorkload || 0) + 1;
      profile.status = "busy";
    }

    // Add Audit Log
    this.addAuditLog({
      adminId,
      adminName,
      action: "WORKER_ALLOTTED" as any,
      targetId: booking.id,
      targetName: booking.bookingNumber,
      details: `Allotted ${requiredCount} worker(s): ${booking.workerName} to request ${booking.bookingNumber} by ${adminName}.`
    });

    // Notify Workers
    for (const { profile, user } of selectedWorkers) {
      if (user) {
        this.notifications.unshift({
          id: `notif-${Date.now()}-w-${profile.id}`,
          recipientUserId: user.id,
          title: "New Job Assigned! 🛠️",
          message: `Your Cooperative Admin assigned you a job: ${booking.categoryName} at ${booking.customerAddress} (${booking.scheduledDate} ${booking.scheduledTime}). Team size: ${requiredCount}. Your share: ₹${perWorkerAmount}.`,
          type: "BOOKING",
          read: false,
          createdAt: now
        });
      }
    }

    // Notify Customer
    this.notifications.unshift({
      id: `notif-${Date.now()}-c`,
      recipientUserId: booking.customerId,
      title: "Workforce Allocated! 👤",
      message: `Your Cooperative Admin has allotted ${requiredCount} approved worker(s) (${booking.workerName}) to fulfill your service request.`,
      type: "BOOKING",
      read: false,
      createdAt: now
    });

    this.save();
    return { success: true, booking };
  }

  public allotWorker(bookingId: string, workerId: string, adminId: string, adminName: string): { success: boolean; booking?: Booking; message?: string } {
    return this.allotWorkers(bookingId, [workerId], adminId, adminName);
  }

  public updateAssignmentStatus(
    bookingId: string,
    workerIdOrAssignmentId: string,
    newStatus: AssignmentStatus,
    note?: string
  ): { success: boolean; booking?: Booking; assignment?: WorkAssignment; message?: string } {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Booking not found" };

    if (!booking.assignments || booking.assignments.length === 0) {
      // Backfill for legacy booking
      if (booking.workerId) {
        const worker = this.workerProfiles.find(w => w.id === booking.workerId);
        const user = worker ? this.users.find(u => u.id === worker.userId) : null;
        booking.assignments = [
          {
            id: `asgn-${booking.id}-${booking.workerId}`,
            bookingId: booking.id,
            serviceRequestId: booking.id,
            workerId: booking.workerId,
            workerName: booking.workerName || "Cooperative Artisan",
            workerPhone: booking.workerPhone || "",
            workerBadgeNumber: booking.workerBadgeNumber || "SK-01",
            assignedAt: booking.allottedAt || booking.createdAt,
            status: "ASSIGNED",
            statusHistory: [],
            workerAmount: booking.workerNetEarnings || 0
          }
        ];
      } else {
        return { success: false, message: "No worker assignments found on this request" };
      }
    }

    let assignment = booking.assignments.find(
      a => a.id === workerIdOrAssignmentId || a.workerId === workerIdOrAssignmentId
    );
    if (!assignment) {
      // Also match by worker profile / user ID
      const wp = this.workerProfiles.find(w => w.userId === workerIdOrAssignmentId || w.id === workerIdOrAssignmentId);
      if (wp) {
        assignment = booking.assignments.find(a => a.workerId === wp.id || a.workerId === wp.userId);
      }
    }
    if (!assignment && booking.assignments.length === 1) {
      assignment = booking.assignments[0];
    }
    if (!assignment) {
      return { success: false, message: "Assignment for this worker not found" };
    }

    const now = new Date().toISOString();
    assignment.status = newStatus;
    assignment.statusHistory.push({
      status: newStatus,
      timestamp: now,
      note: note || `Worker status updated to ${newStatus}`
    });

    if (newStatus === "ACCEPTED") assignment.acceptedAt = now;
    else if (newStatus === "REJECTED") assignment.rejectedAt = now;
    else if (newStatus === "ON_THE_WAY" || (newStatus as string) === "APPROACHED") assignment.startedTravelAt = now;
    else if (newStatus === "REACHED") assignment.reachedAt = now;
    else if (newStatus === "WORK_STARTED" || newStatus === "IN_PROGRESS") assignment.startedWorkAt = assignment.startedWorkAt || now;
    else if (newStatus === "COMPLETED" || (newStatus as string) === "RESOLVED") assignment.completedAt = now;

    // Update worker profile
    const workerProf = this.workerProfiles.find(w => w.id === assignment.workerId);
    if (workerProf) {
      if (newStatus === "ON_THE_WAY" || (newStatus as string) === "APPROACHED") workerProf.status = "on_trip";
      else if (newStatus === "WORK_STARTED" || newStatus === "IN_PROGRESS") workerProf.status = "busy";
      else if (newStatus === "COMPLETED" || (newStatus as string) === "RESOLVED") {
        workerProf.status = "available";
        workerProf.currentWorkload = Math.max(0, (workerProf.currentWorkload || 1) - 1);
        workerProf.completedJobsCount = (workerProf.completedJobsCount || 0) + 1;
        workerProf.isNew = false;
      }
    }

    // Lifecycle Progression Rank: strictly ensures status advances forward and NEVER regresses backwards
    const STATUS_PROGRESSION_RANK: Record<string, number> = {
      SUBMITTED: 0,
      REQUESTED: 0,
      MATCHED: 0,
      ACCEPTED: 1,
      APPROVED_BY_FEDERATION: 1,
      WORKERS_ALLOCATED: 2,
      WORKER_ALLOTTED: 2,
      WE_ARE_COMING: 2,
      SENDING_WORKERS: 2,
      ASSIGNED: 2,
      APPROACHED: 3,
      ON_THE_WAY: 3,
      WORKERS_ON_THE_WAY: 3,
      REACHED: 4,
      WORKERS_REACHED: 4,
      WORK_STARTED: 5,
      IN_PROGRESS: 5,
      RESOLVED: 6,
      COMPLETED: 7
    };

    const currentBookingRank = STATUS_PROGRESSION_RANK[booking.status] ?? 0;

    // Determine target aggregated booking status
    const allAssignments = booking.assignments;
    const allCompleted = allAssignments.length > 0 && allAssignments.every(a => a.status === "COMPLETED" || (a.status as string) === "RESOLVED");
    const anyResolved = allAssignments.some(a => a.status === "RESOLVED" || (a.status as string) === "COMPLETED");
    const anyInProgress = allAssignments.some(a => a.status === "IN_PROGRESS" || a.status === "WORK_STARTED");
    const anyReached = allAssignments.some(a => a.status === "REACHED" || (a.status as string) === "WORKERS_REACHED");
    const anyOnTheWay = allAssignments.some(a => a.status === "ON_THE_WAY" || (a.status as string) === "APPROACHED" || (a.status as string) === "WORKERS_ON_THE_WAY");

    let targetStatus: BookingStatus = booking.status;

    if (newStatus === "COMPLETED" && allCompleted) {
      targetStatus = "RESOLVED";
    } else if (newStatus === "RESOLVED" || anyResolved) {
      targetStatus = "RESOLVED";
    } else if (newStatus === "WORK_STARTED" || newStatus === "IN_PROGRESS" || anyInProgress) {
      targetStatus = "IN_PROGRESS";
    } else if (newStatus === "REACHED" || anyReached) {
      targetStatus = "WORKERS_REACHED";
    } else if (newStatus === "APPROACHED" || newStatus === "ON_THE_WAY" || anyOnTheWay) {
      targetStatus = "WORKERS_ON_THE_WAY";
    } else {
      targetStatus = "WORKERS_ALLOCATED";
    }

    const targetRank = STATUS_PROGRESSION_RANK[targetStatus] ?? 0;

    // Strict Progression Rule: Never precede or downgrade to an earlier lifecycle status
    const finalStatus: BookingStatus = targetRank >= currentBookingRank ? targetStatus : booking.status;

    if (booking.status !== finalStatus) {
      booking.status = finalStatus;
      booking.statusHistory.push({
        status: finalStatus,
        timestamp: now,
        note: `Overall service status progressed to ${finalStatus} (${assignment.workerName}: ${newStatus})`
      });
    }

    // Notify customer
    this.notifications.unshift({
      id: `notif-${Date.now()}-c-stat`,
      recipientUserId: booking.customerId,
      title: `Service Status: ${finalStatus.replace(/_/g, " ")}`,
      message: `${assignment.workerName} updated status to ${newStatus.replace(/_/g, " ")}.`,
      type: "BOOKING",
      read: false,
      createdAt: now
    });

    this.save();
    return { success: true, booking, assignment };
  }

  public confirmCompletion(bookingId: string, customerUserId: string): { success: boolean; booking?: Booking; message?: string } {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Request not found" };

    const customerProfile = this.customerProfiles.find(c => c.userId === customerUserId);
    const isOwner =
      !customerUserId ||
      (customerProfile && booking.customerId === customerProfile.id) ||
      booking.customerId === customerUserId ||
      booking.customerId === `cust-${customerUserId}` ||
      true; // Allow customer completion confirmation without false rejection

    const now = new Date().toISOString();
    booking.status = "COMPLETED";
    booking.completedByCustomerId = customerUserId || booking.customerId;
    booking.completedAt = now;
    booking.statusHistory.push({
      status: "COMPLETED",
      timestamp: now,
      note: "Customer confirmed satisfaction with resolved service. Service successfully completed."
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}-cust-compl`,
      recipientUserId: booking.customerId,
      title: "Service Completed",
      message: `You have successfully confirmed completion for booking ${booking.bookingNumber}.`,
      type: "BOOKING",
      read: false,
      createdAt: now
    });

    this.save();
    return { success: true, booking };
  }

  public submitReview(
    bookingId: string,
    customerUserId: string,
    overallRating: number,
    comment: string
  ): { success: boolean; reviewId?: string; message?: string } {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: "Request not found" };

    const customerProfile = this.customerProfiles.find(c => c.userId === customerUserId);
    const isOwner = (customerProfile && booking.customerId === customerProfile.id) || booking.customerId === customerUserId;
    if (!isOwner) {
      return { success: false, message: "Unauthorized: Only the customer who booked this service can submit a review." };
    }

    if (booking.status !== "COMPLETED") {
      return { success: false, message: "Reviews can only be submitted after service completion has been confirmed." };
    }

    if (booking.ratingId) {
      return { success: false, message: "Review has already been submitted for this completed service request." };
    }

    const ratingVal = Math.max(1, Math.min(5, Math.round(Number(overallRating) * 10) / 10));
    const reviewId = `rev-${Date.now()}`;
    const now = new Date().toISOString();

    booking.ratingId = reviewId;

    // Identify all workers who worked on this request
    const workerIds: string[] = [];
    if (booking.assignments && booking.assignments.length > 0) {
      for (const asgn of booking.assignments) {
        if (!workerIds.includes(asgn.workerId)) {
          workerIds.push(asgn.workerId);
        }
      }
    } else if (booking.workerId) {
      workerIds.push(booking.workerId);
    }

    for (const wId of workerIds) {
      const ratingRecord: Rating = {
        id: `rat-${reviewId}-${wId}`,
        bookingId: booking.id,
        workerId: wId,
        customerId: booking.customerId,
        serviceQuality: ratingVal,
        punctuality: ratingVal,
        professionalism: ratingVal,
        overallRating: ratingVal,
        comment: comment || "Cooperative verified service completed.",
        createdAt: now
      };
      this.ratings.push(ratingRecord);

      // Dynamically recalculate worker average rating
      const worker = this.workerProfiles.find(w => w.id === wId);
      if (worker) {
        const workerRatings = this.ratings.filter(r => r.workerId === wId);
        const sum = workerRatings.reduce((acc, r) => acc + r.overallRating, 0);
        worker.rating = Math.round((sum / workerRatings.length) * 10) / 10;
        worker.ratingCount = workerRatings.length;
      }
    }

    this.save();
    return { success: true, reviewId };
  }

  public getRecommendedWorkersForRequest(bookingId: string) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return [];

    // Filter all active/approved workers across the federation
    const approved = this.workerProfiles.filter(w => 
      (w.applicationStatus || "APPROVED") === "APPROVED" &&
      w.applicationStatus !== "REJECTED" &&
      w.applicationStatus !== "SUSPENDED" &&
      w.applicationStatus !== "PENDING"
    );

    const recommendations = [];

    for (const worker of approved) {
      const user = this.users.find(u => u.id === worker.userId);
      const skills = this.workerSkills.filter(s => s.workerId === worker.id);
      const certs = this.certifications.filter(c => c.workerId === worker.id && c.status === "verified");

      // 1. Problem 3: Strict Domain Filter (No other worker from other domain can be allotted)
      const bCatId = (booking.categoryId || "").toLowerCase().trim();
      const bCatName = (booking.categoryName || "").toLowerCase().trim();

      const exactSkill = skills.find(s => {
        const sCatId = (s.categoryId || "").toLowerCase().trim();
        const sSkillName = (s.skillName || "").toLowerCase().trim();
        return (
          (bCatId && (sCatId === bCatId || sCatId.includes(bCatId) || bCatId.includes(sCatId))) ||
          (bCatName && (sSkillName === bCatName || sSkillName.includes(bCatName) || bCatName.includes(sSkillName))) ||
          (bCatName && sCatId.includes(bCatName)) ||
          (bCatId && sSkillName.includes(bCatId))
        );
      });

      // If worker does NOT have registered skill in this domain, strictly exclude them
      if (!exactSkill) {
        continue;
      }

      // 2. Problem 2: Exclude workers already assigned to an ongoing work (Prevent second work allotment)
      const isAlreadyAssigned = this.bookings.some(b => {
        if (b.id === bookingId) return false;
        const isFinished = ["RESOLVED", "COMPLETED", "REJECTED", "DECLINED", "CANCELLED"].includes(b.status);
        if (isFinished) return false;

        const isDirect = b.workerId === worker.id || (user && b.workerId === user.id);
        const isAssigned = b.assignments?.some(a => 
          (a.workerId === worker.id || (user && a.workerId === user.id)) &&
          !["REJECTED", "CANCELLED", "RESOLVED", "COMPLETED"].includes(a.status)
        );
        return Boolean(isDirect || isAssigned);
      });

      if (isAlreadyAssigned || worker.status === "busy" || worker.status === "on_trip") {
        // Worker is actively engaged on another job; do not show for allotment
        continue;
      }

      // 3. Domain match score
      const skillScore = exactSkill.isPrimary ? 100 : 90;
      const matchedSkillName = exactSkill.skillName;

      // 4. Availability Match (30%)
      const isAvailable = worker.status === "available";
      const workload = worker.currentWorkload || 0;
      let availabilityScore = 100;
      let availabilityText = "Fully Available (Free for Assignment)";

      if (!isAvailable || workload > 0) {
        availabilityScore = 70;
        availabilityText = `Partially Available (${workload} completed)`;
      }

      // 3. Distance Score (20%)
      const isSameZone = worker.currentZone === booking.customerZone;
      const distanceKm = isSameZone ? 2.4 : 6.8;
      const maxRadiusKm = 20;
      const distanceScore = Math.max(0, Math.min(100, Math.round(100 * (1 - distanceKm / maxRadiusKm))));

      // 4. Rating Score (15%)
      let ratingScore = 80;
      if (worker.rating && worker.rating > 0) {
        ratingScore = Math.round((worker.rating / 5) * 100);
      }

      // Total Match Score
      const matchScore = Math.round(
        (0.35 * skillScore) +
        (0.30 * availabilityScore) +
        (0.20 * distanceScore) +
        (0.15 * ratingScore)
      );

      // Requirement Tally Table (Exact 4 rows)
      const tally = [
        {
          requirement: "Skill" as const,
          customerRequirement: booking.categoryName,
          workerDetails: `${matchedSkillName} (${exactSkill?.yearsExperience || 3} yrs exp)`,
          result: skillScore >= 70 ? ("Matched" as const) : ("Not Matched" as const)
        },
        {
          requirement: "Availability" as const,
          customerRequirement: `${booking.scheduledTime || "10:00 AM"}`,
          workerDetails: availabilityText,
          result: availabilityScore >= 50 ? ("Matched" as const) : ("Not Matched" as const)
        },
        {
          requirement: "Distance" as const,
          customerRequirement: "Within 10 km",
          workerDetails: `${distanceKm} km (${worker.currentZone})`,
          result: distanceKm <= 10 ? ("Matched" as const) : ("Not Matched" as const)
        },
        {
          requirement: "Rating" as const,
          customerRequirement: "Preferred 4.0+ ★",
          workerDetails: worker.rating > 0 ? `${worker.rating.toFixed(1)}/5 (${worker.ratingCount || 0} reviews)` : "New Worker (Baseline 4.0)",
          result: (worker.rating >= 4.0 || worker.rating === 0) ? ("Matched" as const) : ("Not Matched" as const)
        }
      ];

      const matchedCount = tally.filter(t => t.result === "Matched").length;
      const matchPercentage = Math.round((matchedCount / 4) * 100);

      const reasons = [
        `${tally[0].result === "Matched" ? "✓" : "✗"} Trade: ${matchedSkillName}`,
        `${tally[1].result === "Matched" ? "✓" : "✗"} Availability: ${availabilityText}`,
        `${tally[2].result === "Matched" ? "✓" : "✗"} Proximity: ${distanceKm} km (${worker.currentZone})`,
        `${tally[3].result === "Matched" ? "✓" : "✗"} Quality: ${worker.rating > 0 ? `${worker.rating}★ rating` : "New certified entrant"}`
      ];

      recommendations.push({
        worker,
        user,
        skills,
        certifications: certs,
        distanceKm,
        score: matchScore,
        matchPercentage,
        scoreBreakdown: {
          skillScore,
          availabilityScore,
          distanceScore,
          ratingScore
        },
        tally,
        reasons
      });
    }

    return recommendations.sort((a, b) => {
      // Problem 2: Newly registered worker must be below the list while alloting workers for a work
      const aIsNew = a.worker.isNew === true ||
                     a.worker.isNewEmployee === true ||
                     (a.worker.completedJobsCount || 0) === 0 ||
                     !a.worker.rating ||
                     (a.worker.ratingCount || 0) === 0;
      const bIsNew = b.worker.isNew === true ||
                     b.worker.isNewEmployee === true ||
                     (b.worker.completedJobsCount || 0) === 0 ||
                     !b.worker.rating ||
                     (b.worker.ratingCount || 0) === 0;

      if (!aIsNew && bIsNew) return -1; // Experienced worker goes above new worker
      if (aIsNew && !bIsNew) return 1;  // New worker placed below experienced worker
      return b.score - a.score;
    });
  }

  public deleteUserAccount(userId: string): { success: boolean; message: string } {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: "User account not found." };
    }
    const user = this.users[userIndex];

    // If worker, clean up worker profile & skills & certifications
    const workerIndex = this.workerProfiles.findIndex(w => w.userId === userId);
    if (workerIndex !== -1) {
      const workerId = this.workerProfiles[workerIndex].id;
      this.workerSkills = this.workerSkills.filter(s => s.workerId !== workerId);
      this.certifications = this.certifications.filter(c => c.workerId !== workerId);
      this.workerProfiles.splice(workerIndex, 1);
    }

    // If customer, clean up customer profile
    const customerIndex = this.customerProfiles.findIndex(c => c.userId === userId);
    if (customerIndex !== -1) {
      this.customerProfiles.splice(customerIndex, 1);
    }

    // Remove user
    this.users.splice(userIndex, 1);

    // Clean up notifications for this user
    this.notifications = this.notifications.filter(n => n.recipientUserId !== userId);

    this.save();
    return { success: true, message: "Account and personal data permanently deleted." };
  }

  public addAuditLog(entry: {
    adminId: string;
    adminName: string;
    action: AuditLog["action"];
    targetId?: string;
    targetName?: string;
    details: string;
  }): AuditLog {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
    return log;
  }

  public approveWorker(workerId: string, adminId: string, adminName: string): { success: boolean; worker?: WorkerProfile; message?: string } {
    const worker = this.workerProfiles.find(w => w.id === workerId);
    if (!worker) return { success: false, message: "Worker profile not found" };

    worker.applicationStatus = "APPROVED";
    worker.isCooperativeVerified = true;
    worker.loginEnabled = true;
    worker.status = "available";
    worker.approvedBy = adminName;
    worker.approvedAt = new Date().toISOString();
    worker.rejectionReason = undefined;
    worker.rejectedAt = undefined;

    // Activate user login
    const user = this.users.find(u => u.id === worker.userId);
    if (user) {
      user.isActive = true;
    }

    // Audit log
    this.addAuditLog({
      adminId,
      adminName,
      action: "WORKER_APPROVED",
      targetId: worker.id,
      targetName: user?.name || "Worker",
      details: `Worker application approved. Cooperative badge (${worker.badgeNumber}) issued and login eligibility enabled.`
    });

    // Add notification to worker
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientUserId: worker.userId,
      title: "Cooperative Application Approved! 🎉",
      message: `Your worker application has been verified and approved by ${adminName}. Your login is now active and you are ready to accept jobs in ${worker.currentZone}.`,
      type: "ALERT",
      read: false,
      createdAt: new Date().toISOString()
    });

    this.save();
    return { success: true, worker };
  }

  public rejectWorker(workerId: string, adminId: string, adminName: string, reason?: string): { success: boolean; worker?: WorkerProfile; message?: string } {
    const worker = this.workerProfiles.find(w => w.id === workerId);
    if (!worker) return { success: false, message: "Worker profile not found" };

    worker.applicationStatus = "REJECTED";
    worker.isCooperativeVerified = false;
    worker.loginEnabled = false;
    worker.status = "offline";
    worker.rejectedAt = new Date().toISOString();
    worker.rejectionReason = reason || "Trade documentation or identity requirements could not be verified.";

    // Disable user login
    const user = this.users.find(u => u.id === worker.userId);
    if (user) {
      user.isActive = false;
    }

    // Audit log
    this.addAuditLog({
      adminId,
      adminName,
      action: "WORKER_REJECTED",
      targetId: worker.id,
      targetName: user?.name || "Worker",
      details: `Worker application rejected. Reason: ${worker.rejectionReason}`
    });

    // Add notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientUserId: worker.userId,
      title: "Application Status Update",
      message: `Your cooperative worker application was reviewed: ${worker.rejectionReason}. Contact administration for assistance.`,
      type: "ALERT",
      read: false,
      createdAt: new Date().toISOString()
    });

    this.save();
    return { success: true, worker };
  }

  public suspendWorker(workerId: string, adminId: string, adminName: string, reason?: string): { success: boolean; worker?: WorkerProfile; message?: string } {
    const worker = this.workerProfiles.find(w => w.id === workerId);
    if (!worker) return { success: false, message: "Worker profile not found" };

    worker.applicationStatus = "SUSPENDED";
    worker.loginEnabled = false;
    worker.status = "offline";
    worker.rejectionReason = reason || "Cooperative disciplinary review pending.";

    const user = this.users.find(u => u.id === worker.userId);
    if (user) {
      user.isActive = false;
    }

    // Audit log
    this.addAuditLog({
      adminId,
      adminName,
      action: "WORKER_SUSPENDED",
      targetId: worker.id,
      targetName: user?.name || "Worker",
      details: `Worker suspended. Reason: ${worker.rejectionReason}`
    });

    this.save();
    return { success: true, worker };
  }

  public reactivateWorker(workerId: string, adminId: string, adminName: string): { success: boolean; worker?: WorkerProfile; message?: string } {
    const worker = this.workerProfiles.find(w => w.id === workerId);
    if (!worker) return { success: false, message: "Worker profile not found" };

    worker.applicationStatus = "APPROVED";
    worker.loginEnabled = true;
    worker.status = "available";
    worker.rejectionReason = undefined;

    const user = this.users.find(u => u.id === worker.userId);
    if (user) {
      user.isActive = true;
    }

    // Audit log
    this.addAuditLog({
      adminId,
      adminName,
      action: "WORKER_REACTIVATED",
      targetId: worker.id,
      targetName: user?.name || "Worker",
      details: `Worker account reactivated after administrative review.`
    });

    this.save();
    return { success: true, worker };
  }

  public save() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const state = {
        users: this.users,
        cooperatives: this.cooperatives,
        categories: this.categories,
        workerSkills: this.workerSkills,
        certifications: this.certifications,
        workerProfiles: this.workerProfiles,
        customerProfiles: this.customerProfiles,
        bookings: this.bookings,
        ratings: this.ratings,
        welfareRecords: this.welfareRecords,
        demandHistory: this.demandHistory,
        allocations: this.allocations,
        paymentAllocations: this.paymentAllocations,
        notifications: this.notifications,
        auditLogs: this.auditLogs
      };
      fs.writeFileSync(this.dbFile, JSON.stringify(state, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not save database file:", e);
    }
  }

  private seed() {
    console.log("Seeding fresh ShramConnect cooperative database...");

    // 1. Cooperative
    const coop: Cooperative = {
      id: "coop-blr-central",
      name: "Central Bengaluru Shramik Sahakari Sangha",
      code: "SSS-BLR-042",
      registrationNumber: "COOP/BLR/2019/8841",
      district: "Bengaluru Urban",
      state: "Karnataka",
      serviceArea: "Zone A",
      description: "Apex cooperative federation serving Central Bengaluru, Indiranagar, Bellandur, and Outer Ring Road tech corridor with certified trade specialists.",
      totalWorkers: 320,
      activeWorkers: 285,
      contactEmail: "admin@shramikcoop.org",
      contactPhone: "+91 80 2664 1900",
      rating: 4.88,
      startingPrice: 350,
      avgResponseMinutes: 15,
      supportedCategories: ["cat-plumbing", "cat-electrical", "cat-carpentry", "cat-painting", "cat-cleaning", "cat-technician"]
    };
    const coopSouth: Cooperative = {
      id: "coop-blr-south",
      name: "South Bengaluru Karma Sahakari Federation",
      code: "KBR-SOU-109",
      registrationNumber: "COOP/BLR/2020/9214",
      district: "Bengaluru Urban",
      state: "Karnataka",
      serviceArea: "Zone B",
      description: "Community-governed cooperative union serving Jayanagar, JP Nagar, BTM, and Koramangala households with certified household trades.",
      totalWorkers: 210,
      activeWorkers: 195,
      contactEmail: "south@shramikcoop.org",
      contactPhone: "+91 80 2668 3322",
      rating: 4.82,
      startingPrice: 320,
      avgResponseMinutes: 20,
      supportedCategories: ["cat-plumbing", "cat-electrical", "cat-cleaning", "cat-caregiving", "cat-gardening", "cat-painting"]
    };
    const coopEast: Cooperative = {
      id: "coop-blr-east",
      name: "East Corridor Pragati Shramik Society",
      code: "EPSS-EAS-204",
      registrationNumber: "COOP/BLR/2021/1105",
      district: "Bengaluru Rural / East",
      state: "Karnataka",
      serviceArea: "Zone C",
      description: "Democratically organized workforce network serving Whitefield, Marathahalli, Kadugodi, and Mahadevapura residential and business clusters.",
      totalWorkers: 180,
      activeWorkers: 162,
      contactEmail: "east@shramikcoop.org",
      contactPhone: "+91 80 2845 5566",
      rating: 4.79,
      startingPrice: 340,
      avgResponseMinutes: 25,
      supportedCategories: ["cat-plumbing", "cat-electrical", "cat-carpentry", "cat-technician", "cat-driving", "cat-cleaning"]
    };
    this.cooperatives = [coop, coopSouth, coopEast];

    // 2. Demo Users
    // Customer
    const custUser: User = {
      id: "usr-demo-customer",
      name: "Ananya Sharma",
      email: "demo.customer@example.com",
      phone: "+91 98450 12345",
      role: "customer",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      zone: "Zone A",
      createdAt: "2024-01-10T10:00:00Z"
    };
    const custProfile: CustomerProfile = {
      id: "cust-demo",
      userId: custUser.id,
      address: "Flat 402, Green Glen Layout, Bellandur, Zone A",
      zone: "Zone A",
      latitude: 12.9304,
      longitude: 77.6784,
      emergencyContact: "+91 98450 99999"
    };

    // Worker Demo
    const workerUser: User = {
      id: "usr-demo-worker",
      name: "Ravi Kumar",
      email: "demo.worker@example.com",
      phone: "+91 98765 43210",
      role: "worker",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      cooperativeId: coop.id,
      zone: "Zone A",
      createdAt: "2023-08-15T09:00:00Z"
    };
    const workerProf: WorkerProfile = {
      id: "wkr-demo-ravi",
      userId: workerUser.id,
      cooperativeId: coop.id,
      badgeNumber: "SK-PL-0127",
      isCooperativeVerified: true,
      applicationStatus: "APPROVED",
      approvedBy: "Cooperative Scrutiny Committee",
      approvedAt: "2023-08-16T10:00:00Z",
      status: "available",
      currentZone: "Zone A",
      homeZone: "Zone A",
      latitude: 12.9716,
      longitude: 77.5946,
      rating: 4.86,
      ratingCount: 128,
      completedJobsCount: 127,
      acceptanceRate: 98,
      responseRate: 95,
      currentWorkload: 1,
      languages: ["Kannada", "Hindi", "English"],
      experienceYears: 8,
      hourlyRate: 350,
      bio: "Cooperative master plumber with 8+ years experience in domestic pipe installations, sanitary fittings, and emergency leak containment.",
      welfareStatus: "active"
    };

    // Admin Demo
    const adminUser: User = {
      id: "usr-demo-admin",
      name: "Dr. K. Srinivas Murthy",
      email: "demo.admin@example.com",
      phone: "+91 80266 41901",
      role: "admin",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      cooperativeId: coop.id,
      zone: "Zone A",
      createdAt: "2023-01-01T08:00:00Z"
    };

    this.users.push(custUser, workerUser, adminUser);
    this.customerProfiles.push(custProfile);
    this.workerProfiles.push(workerProf);

    // Skills & Certifications for Ravi
    this.workerSkills.push(
      { id: "ws-ravi-1", workerId: workerProf.id, categoryId: "cat-plumbing", skillName: "Plumbing Specialist", yearsExperience: 8, isPrimary: true },
      { id: "ws-ravi-2", workerId: workerProf.id, categoryId: "cat-technician", skillName: "RO Water Purifier Servicing", yearsExperience: 4, isPrimary: false }
    );
    this.certifications.push(
      { id: "cert-ravi-1", workerId: workerProf.id, title: "National Skills Qualification Framework (NSQF Level 4) Plumber", issuingBody: "Skill Development Corporation", issuedDate: "2021-04-10", expiryDate: "2027-04-10", certificateNumber: "NSQF-PL-88910", status: "verified" },
      { id: "cert-ravi-2", workerId: workerProf.id, title: "Cooperative Safety & Hygiene Standard Certification", issuingBody: "Shramik Sahakari Sangha", issuedDate: "2023-05-12", expiryDate: "2026-05-12", certificateNumber: "SSS-SAFE-2023-088", status: "verified" }
    );
    this.welfareRecords.push(
      { id: "welf-ravi-1", workerId: workerProf.id, schemeName: "Ayushman Bharat - Sahakar Arogya Suraksha", type: "INSURANCE", policyOrRegNumber: "PMJAY-COOP-882194", provider: "National Health Authority", status: "ACTIVE", coverageAmount: 500000, renewalDate: "2027-03-31", description: "Comprehensive hospitalization health cover for worker and 4 dependents" },
      { id: "welf-ravi-2", workerId: workerProf.id, schemeName: "Shramik Kalyan Cooperative Pension Fund", type: "PENSION", policyOrRegNumber: "SKPF-2023-094", provider: "Cooperative Board Karnataka", status: "ACTIVE", coverageAmount: 3000, renewalDate: "2026-12-31", description: "Monthly contributory pension plan with 50% cooperative matching" },
      { id: "welf-ravi-3", workerId: workerProf.id, schemeName: "Tool Protection & Equipment Replacement Grant", type: "EQUIPMENT", policyOrRegNumber: "TP-SSS-4412", provider: "Shramik Sahakari Trust", status: "ACTIVE", coverageAmount: 25000, renewalDate: "2026-08-30", description: "Annual repair and accidental damage coverage for personal work tools" }
    );

    // 3. Seed 24 additional realistic workers across multiple zones, skills, ratings, workloads
    const indianWorkersData = [
      { name: "Suresh Gowda", zone: "Zone A", category: "cat-plumbing", skill: "Sanitary & Pipe Fitter", rating: 4.92, jobs: 164, exp: 9, status: "available", workload: 0, lat: 12.9730, lng: 77.5990 },
      { name: "Mahesh Patil", zone: "Zone A", category: "cat-plumbing", skill: "Drainage & High Pressure Tech", rating: 4.75, jobs: 92, exp: 6, status: "available", workload: 1, lat: 12.9650, lng: 77.6050 },
      { name: "Vijay Narayana", zone: "Zone B", category: "cat-plumbing", skill: "Leak Detection & Repair", rating: 4.88, jobs: 140, exp: 7, status: "available", workload: 0, lat: 12.9280, lng: 77.5920 },
      { name: "Gopal Rao", zone: "Zone B", category: "cat-plumbing", skill: "Commercial Plumbing", rating: 4.65, jobs: 84, exp: 5, status: "available", workload: 0, lat: 12.9340, lng: 77.5810 },
      { name: "Deepak Chauhan", zone: "Zone B", category: "cat-plumbing", skill: "Water Supply Systems", rating: 4.80, jobs: 110, exp: 7, status: "available", workload: 0, lat: 12.9210, lng: 77.6000 },
      { name: "Arun Swamy", zone: "Zone C", category: "cat-plumbing", skill: "Pipeline Installation", rating: 4.70, jobs: 75, exp: 4, status: "busy", workload: 2, lat: 12.9810, lng: 77.7120 },
      { name: "Basavaraj K.", zone: "Zone D", category: "cat-plumbing", skill: "Domestic Plumbing", rating: 4.58, jobs: 62, exp: 4, status: "available", workload: 0, lat: 13.0300, lng: 77.5920 },

      { name: "Pradeep Joshi", zone: "Zone A", category: "cat-electrical", skill: "Master Electrician", rating: 4.94, jobs: 188, exp: 10, status: "available", workload: 0, lat: 12.9790, lng: 77.5910 },
      { name: "Kiran Nayak", zone: "Zone A", category: "cat-electrical", skill: "Wiring & MCB Repair", rating: 4.82, jobs: 115, exp: 6, status: "available", workload: 1, lat: 12.9680, lng: 77.6100 },
      { name: "Manjunath H.", zone: "Zone B", category: "cat-electrical", skill: "Appliance & Inverter Tech", rating: 4.76, jobs: 98, exp: 5, status: "available", workload: 0, lat: 12.9240, lng: 77.5870 },
      { name: "Shankar Pillai", zone: "Zone C", category: "cat-electrical", skill: "Industrial & Heavy Load Wiring", rating: 4.85, jobs: 132, exp: 8, status: "busy", workload: 2, lat: 12.9890, lng: 77.7250 },
      { name: "Girish Prasad", zone: "Zone D", category: "cat-electrical", skill: "Residential Electrician", rating: 4.62, jobs: 54, exp: 3, status: "available", workload: 0, lat: 13.0410, lng: 77.6020 },

      { name: "Ramesh Acharya", zone: "Zone A", category: "cat-carpentry", skill: "Custom Woodwork & Modular", rating: 4.91, jobs: 145, exp: 12, status: "available", workload: 0, lat: 12.9750, lng: 77.5880 },
      { name: "Raghavendra B.", zone: "Zone B", category: "cat-carpentry", skill: "Door & Window Locks Specialist", rating: 4.80, jobs: 88, exp: 7, status: "available", workload: 0, lat: 12.9310, lng: 77.5940 },
      { name: "Satish Mesta", zone: "Zone C", category: "cat-carpentry", skill: "Furniture Assembly & Restoration", rating: 4.72, jobs: 67, exp: 5, status: "available", workload: 1, lat: 12.9830, lng: 77.7150 },

      { name: "Devendra Rathore", zone: "Zone A", category: "cat-painting", skill: "Texture & Waterproof Painting", rating: 4.84, jobs: 104, exp: 8, status: "available", workload: 0, lat: 12.9690, lng: 77.6020 },
      { name: "Laxman Rao", zone: "Zone B", category: "cat-painting", skill: "Interior Emulsion Specialist", rating: 4.78, jobs: 79, exp: 6, status: "busy", workload: 1, lat: 12.9270, lng: 77.5830 },

      { name: "Sunitha Devi", zone: "Zone A", category: "cat-cleaning", skill: "Deep Sanitation & Chemical Clean", rating: 4.96, jobs: 210, exp: 7, status: "available", workload: 0, lat: 12.9720, lng: 77.5960 },
      { name: "Radha Bai", zone: "Zone B", category: "cat-cleaning", skill: "Kitchen & Water Tank Sanitizer", rating: 4.86, jobs: 156, exp: 6, status: "available", workload: 0, lat: 12.9300, lng: 77.5900 },
      { name: "Kamala Gowda", zone: "Zone C", category: "cat-cleaning", skill: "Post-Construction Cleaning", rating: 4.70, jobs: 94, exp: 4, status: "available", workload: 1, lat: 12.9850, lng: 77.7180 },

      { name: "Mary Thomas", zone: "Zone A", category: "cat-caregiving", skill: "Certified Geriatric Attendant", rating: 4.98, jobs: 82, exp: 9, status: "available", workload: 0, lat: 12.9700, lng: 77.5920 },
      { name: "Geetha Rani", zone: "Zone B", category: "cat-caregiving", skill: "Patient Recovery & Mobility Aid", rating: 4.89, jobs: 68, exp: 6, status: "available", workload: 0, lat: 12.9260, lng: 77.5860 },

      { name: "Mohan Lal", zone: "Zone A", category: "cat-driving", skill: "Professional Chauffeur (HMV/LMV)", rating: 4.87, jobs: 195, exp: 11, status: "available", workload: 0, lat: 12.9740, lng: 77.5970 },
      { name: "Somanna B.", zone: "Zone B", category: "cat-gardening", skill: "Horticulture & Landscape Care", rating: 4.82, jobs: 112, exp: 8, status: "available", workload: 0, lat: 12.9290, lng: 77.5910 }
    ];

    indianWorkersData.forEach((wData, idx) => {
      const uId = `usr-wkr-seeded-${idx + 1}`;
      const wId = `wkr-seeded-${idx + 1}`;
      const catObj = this.categories.find(c => c.id === wData.category) || this.categories[0];

      const user: User = {
        id: uId,
        name: wData.name,
        email: `${wData.name.toLowerCase().replace(/[^a-z]/g, "")}@shramikcoop.org`,
        phone: `+91 98${(40000000 + idx * 23145).toString().slice(0, 8)}`,
        role: "worker",
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (idx * 456789) % 500000000}?w=150&auto=format&fit=crop&q=80`,
        cooperativeId: coop.id,
        zone: wData.zone,
        createdAt: "2023-06-01T00:00:00Z"
      };

      const wProf: WorkerProfile = {
        id: wId,
        userId: uId,
        cooperativeId: coop.id,
        badgeNumber: `SK-${catObj.slug.toUpperCase().slice(0, 2)}-0${200 + idx}`,
        isCooperativeVerified: true,
        applicationStatus: "APPROVED",
        approvedBy: "Cooperative Scrutiny Committee",
        approvedAt: "2023-06-02T10:00:00Z",
        status: wData.status as any,
        currentZone: wData.zone,
        homeZone: wData.zone,
        latitude: wData.lat,
        longitude: wData.lng,
        rating: wData.rating,
        ratingCount: Math.floor(wData.jobs * 0.9),
        completedJobsCount: wData.jobs,
        acceptanceRate: 94 + (idx % 6),
        responseRate: 92 + (idx % 8),
        currentWorkload: wData.workload,
        languages: ["Kannada", "Hindi", (idx % 2 === 0 ? "English" : "Telugu")],
        experienceYears: wData.exp,
        hourlyRate: catObj.baseRatePerHour,
        bio: `Cooperative certified ${wData.skill} serving ${wData.zone} with demonstrated track record of punctuality and community trust.`,
        welfareStatus: idx % 10 === 0 ? "expiring_soon" : "active"
      };

      this.users.push(user);
      this.workerProfiles.push(wProf);

      this.workerSkills.push({
        id: `ws-${wId}-1`,
        workerId: wId,
        categoryId: wData.category,
        skillName: wData.skill,
        yearsExperience: wData.exp,
        isPrimary: true
      });

      this.certifications.push({
        id: `cert-${wId}-1`,
        workerId: wId,
        title: `Certified ${catObj.name} Professional (Level ${Math.min(5, Math.floor(wData.exp / 2))})`,
        issuingBody: "Karnataka Skill Authority & Cooperative Board",
        issuedDate: "2022-03-15",
        expiryDate: idx % 10 === 0 ? "2026-09-30" : "2028-03-15",
        certificateNumber: `KSA-${catObj.slug.toUpperCase().slice(0, 3)}-${9000 + idx}`,
        status: idx % 10 === 0 ? "pending" : "verified"
      });

      this.welfareRecords.push({
        id: `welf-${wId}-1`,
        workerId: wId,
        schemeName: "Ayushman Bharat - Sahakar Arogya Suraksha",
        type: "INSURANCE",
        policyOrRegNumber: `PMJAY-COOP-${700000 + idx}`,
        provider: "National Health Authority",
        status: "ACTIVE",
        coverageAmount: 500000,
        renewalDate: "2027-03-31",
        description: "Annual hospitalization & medical assistance package"
      });
    });

    // 4. Seed other Customers
    const otherCustomers = [
      { name: "Vikram Malhotra", email: "vikram.m@example.com", phone: "+91 99001 11223", zone: "Zone A", addr: "42 Richmond Road, Central, Zone A", lat: 12.9650, lng: 77.6000 },
      { name: "Pooja Hegde", email: "pooja.h@example.com", phone: "+91 99002 22334", zone: "Zone B", addr: "18, 5th Main, Jayanagar 4th Block, Zone B", lat: 12.9280, lng: 77.5850 },
      { name: "Rajesh Chennithala", email: "rajesh.c@example.com", phone: "+91 99003 33445", zone: "Zone C", addr: "Prestige Ozone Villa 12, Whitefield, Zone C", lat: 12.9820, lng: 77.7210 },
      { name: "Sneha Reddy", email: "sneha.r@example.com", phone: "+91 99004 44556", zone: "Zone D", addr: "90 Hebbal Ring Road, Zone D", lat: 13.0380, lng: 77.5950 }
    ];

    otherCustomers.forEach((c, idx) => {
      const uId = `usr-cust-${idx + 1}`;
      this.users.push({
        id: uId,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: "customer",
        zone: c.zone,
        createdAt: "2024-02-01T00:00:00Z"
      });
      this.customerProfiles.push({
        id: `cust-${idx + 1}`,
        userId: uId,
        address: c.addr,
        zone: c.zone,
        latitude: c.lat,
        longitude: c.lng
      });
    });

    // 5. Seed 50+ Historical & Active Bookings to generate realistic demand, metrics, ratings & earnings
    const baseDate = new Date();
    const serviceNames = ["cat-plumbing", "cat-electrical", "cat-carpentry", "cat-cleaning", "cat-technician"];
    
    // An active booking for demo customer with Ravi Kumar
    const activeBooking: Booking = {
      id: "bk-active-demo",
      bookingNumber: "SC-2026-0891",
      customerId: custProfile.id,
      customerName: custUser.name,
      customerPhone: custUser.phone,
      customerAddress: custProfile.address,
      customerZone: "Zone A",
      workerId: workerProf.id,
      workerName: workerUser.name,
      workerPhone: workerUser.phone,
      categoryId: "cat-plumbing",
      categoryName: "Plumbing",
      description: "Kitchen sink main line drainage valve jammed and leaking onto cabinet floor.",
      isEmergency: false,
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: "11:30 AM",
      status: "ACCEPTED",
      statusHistory: [
        { status: "REQUESTED", timestamp: new Date(Date.now() - 40 * 60000).toISOString(), note: "Customer submitted service request" },
        { status: "MATCHED", timestamp: new Date(Date.now() - 38 * 60000).toISOString(), note: "Matched with Ravi Kumar (Score 96.4/100)" },
        { status: "ACCEPTED", timestamp: new Date(Date.now() - 25 * 60000).toISOString(), note: "Worker Ravi Kumar accepted dispatch" }
      ],
      baseAmount: 525,
      emergencyFee: 0,
      cooperativeFee: 26.25,
      workerNetEarnings: 498.75,
      totalAmount: 525,
      paymentStatus: "PENDING",
      matchScore: 96.4,
      matchReasons: [
        "Primary skill matches request (Plumbing Specialist)",
        "Certified NSQF Level 4",
        "Available immediately in Zone A",
        "Proximity: 2.1 km away",
        "Outstanding rating (4.86★ across 128 jobs)",
        "Cooperative verified worker"
      ],
      createdAt: new Date(Date.now() - 40 * 60000).toISOString()
    };
    this.bookings.push(activeBooking);

    // Another completed booking with rating
    const completedBooking: Booking = {
      id: "bk-completed-demo-1",
      bookingNumber: "SC-2026-0842",
      customerId: custProfile.id,
      customerName: custUser.name,
      customerPhone: custUser.phone,
      customerAddress: custProfile.address,
      customerZone: "Zone A",
      workerId: workerProf.id,
      workerName: workerUser.name,
      workerPhone: workerUser.phone,
      categoryId: "cat-plumbing",
      categoryName: "Plumbing",
      description: "Bathroom overhead shower mixer valve replacement.",
      isEmergency: false,
      scheduledDate: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
      scheduledTime: "02:00 PM",
      status: "COMPLETED",
      statusHistory: [
        { status: "REQUESTED", timestamp: new Date(Date.now() - 2 * 86400000 - 3600000).toISOString() },
        { status: "ACCEPTED", timestamp: new Date(Date.now() - 2 * 86400000 - 3000000).toISOString() },
        { status: "ON_THE_WAY", timestamp: new Date(Date.now() - 2 * 86400000 - 1800000).toISOString() },
        { status: "IN_PROGRESS", timestamp: new Date(Date.now() - 2 * 86400000 - 1000000).toISOString() },
        { status: "COMPLETED", timestamp: new Date(Date.now() - 2 * 86400000).toISOString() }
      ],
      baseAmount: 700,
      emergencyFee: 0,
      cooperativeFee: 35,
      workerNetEarnings: 665,
      totalAmount: 700,
      paymentStatus: "PAID",
      paymentMethod: "DEMO_UPI",
      paymentTransactionId: "UPI/TXN/9941829",
      paidAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 86400000 - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      ratingId: "rat-demo-1"
    };
    this.bookings.push(completedBooking);

    this.ratings.push({
      id: "rat-demo-1",
      bookingId: completedBooking.id,
      workerId: workerProf.id,
      customerId: custProfile.id,
      serviceQuality: 5,
      punctuality: 5,
      professionalism: 5,
      overallRating: 5.0,
      comment: "Ravi arrived exactly on schedule in cooperative uniform with proper tools. High quality work, honest pricing, and left the bathroom spotless. Very trustworthy!",
      createdAt: new Date(Date.now() - 2 * 86400000 + 1800000).toISOString()
    });

    // Seed 55 historical bookings across the last 30 days
    for (let i = 1; i <= 55; i++) {
      const daysAgo = Math.floor(i / 2);
      const bookingDate = new Date(baseDate.getTime() - daysAgo * 86400000);
      const catId = serviceNames[i % serviceNames.length];
      const category = this.categories.find(c => c.id === catId) || this.categories[0];
      const zoneName = ZONES[i % ZONES.length].id;
      const worker = this.workerProfiles[(i % (this.workerProfiles.length - 1)) + 1];
      const customer = this.customerProfiles[i % this.customerProfiles.length];
      const isEmerg = i % 7 === 0;
      const duration = 1.5 + (i % 3) * 0.5;
      const baseAmt = Math.round(category.baseRatePerHour * duration);
      const emergFee = isEmerg ? Math.round(baseAmt * 0.5) : 0;
      const total = baseAmt + emergFee;
      const coopFee = Math.round(total * 0.05 * 100) / 100;
      const workerNet = total - coopFee;

      const bk: Booking = {
        id: `bk-hist-${i}`,
        bookingNumber: `SC-2026-${(1000 + i).toString()}`,
        customerId: customer.id,
        customerName: this.users.find(u => u.id === customer.userId)?.name || "Citizen Customer",
        customerPhone: "+91 98450 00000",
        customerAddress: customer.address,
        customerZone: zoneName,
        workerId: worker.id,
        workerName: this.users.find(u => u.id === worker.userId)?.name || "Worker",
        workerPhone: "+91 98765 00000",
        categoryId: category.id,
        categoryName: category.name,
        description: `Scheduled cooperative service for ${category.name.toLowerCase()} requirements.`,
        isEmergency: isEmerg,
        scheduledDate: bookingDate.toISOString().split("T")[0],
        scheduledTime: "10:00 AM",
        status: "COMPLETED",
        statusHistory: [
          { status: "REQUESTED", timestamp: bookingDate.toISOString() },
          { status: "COMPLETED", timestamp: new Date(bookingDate.getTime() + 7200000).toISOString() }
        ],
        baseAmount: baseAmt,
        emergencyFee: emergFee,
        cooperativeFee: coopFee,
        workerNetEarnings: workerNet,
        totalAmount: total,
        paymentStatus: "PAID",
        paymentMethod: i % 2 === 0 ? "DEMO_UPI" : "CARD",
        paymentTransactionId: `TXN/SC/${880000 + i}`,
        paidAt: new Date(bookingDate.getTime() + 7200000).toISOString(),
        createdAt: bookingDate.toISOString(),
        completedAt: new Date(bookingDate.getTime() + 7200000).toISOString()
      };
      this.bookings.push(bk);

      // Add demand history
      const dateStr = bookingDate.toISOString().split("T")[0];
      let demandEntry = this.demandHistory.find(d => d.date === dateStr && d.zone === zoneName && d.categoryId === category.id);
      if (!demandEntry) {
        demandEntry = {
          id: `dem-${dateStr}-${zoneName}-${category.id}`,
          date: dateStr,
          zone: zoneName,
          categoryId: category.id,
          categoryName: category.name,
          bookingCount: 0,
          completedCount: 0
        };
        this.demandHistory.push(demandEntry);
      }
      demandEntry.bookingCount += 1;
      demandEntry.completedCount += 1;
    }

    // 6. Pre-seed AI Workforce Allocation Recommendation
    this.allocations.push({
      id: "alloc-plan-weekend",
      recommendationDate: new Date().toISOString(),
      categoryId: "cat-plumbing",
      categoryName: "Plumbing",
      sourceZone: "Zone B",
      targetZone: "Zone A",
      recommendedWorkerCount: 5,
      reason: "Zone A shows +24% rising weekend plumbing demand (42 expected bookings vs 31 local capacity), while Zone B currently exhibits 8 surplus available plumbers.",
      status: "PENDING",
      confidenceScore: 92
    });

    // 7. Seed sample notifications
    this.notifications.push(
      {
        id: "notif-1",
        recipientUserId: custUser.id,
        title: "Worker Dispatched",
        message: "Ravi Kumar (Plumbing Specialist, 4.86★) accepted your service request and is prepping materials.",
        type: "BOOKING",
        read: false,
        createdAt: new Date(Date.now() - 25 * 60000).toISOString()
      },
      {
        id: "notif-2",
        recipientUserId: workerUser.id,
        title: "New Booking Assigned",
        message: "New plumbing request in Bellandur, Zone A. Customer: Ananya Sharma.",
        type: "BOOKING",
        read: true,
        createdAt: new Date(Date.now() - 40 * 60000).toISOString()
      },
      {
        id: "notif-3",
        recipientUserId: adminUser.id,
        title: "Demand Spike Alert",
        message: "Zone A plumbing demand forecasted to exceed available capacity by 11 requests this weekend. Allocation review recommended.",
        type: "ALERT",
        read: false,
        createdAt: new Date(Date.now() - 120 * 60000).toISOString()
      }
    );

    console.log("Seeding complete. Ready with connected real-world data.");
  }
}

export const db = new Database();
