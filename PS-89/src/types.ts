export type UserRole = "customer" | "worker" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive?: boolean;
  isPhoneVerified?: boolean;
  avatarUrl?: string;
  cooperativeId?: string;
  zone: string;
  createdAt: string;
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

export type Worker = any;

export type WorkerApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

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

export interface WorkerProfile {
  id: string;
  userId: string;
  cooperativeId: string;
  badgeNumber: string;
  isCooperativeVerified: boolean;
  loginEnabled?: boolean;
  applicationStatus?: WorkerApplicationStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  submittedAt?: string;
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
  acceptanceRate: number;
  responseRate: number;
  currentWorkload: number;
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
  user?: User;
  skills?: {
    id: string;
    workerId: string;
    categoryId: string;
    skillName: string;
    yearsExperience: number;
    isPrimary: boolean;
  }[];
  certifications?: Certification[];
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
  // Lifecycle aliases
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
  manpowerRequired: number;
  assignments?: WorkAssignment[];
  isEmergency: boolean;
  scheduledDate: string;
  scheduledTime: string;
  status: BookingStatus;
  statusHistory: { status: BookingStatus; timestamp: string; note?: string }[];
  baseAmount: number;
  emergencyFee: number;
  cooperativeFee: number;
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
  adminNote?: string;
  completedByCustomerId?: string;
  approvedBy?: string;
  approvedAt?: string;
  declinedBy?: string;
  declinedAt?: string;
  declineReason?: string;
  acceptedBy?: string;
  acceptedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  allottedAt?: string;
  allottedBy?: string;
  matchScore?: number;
  matchReasons?: string[];
  photos?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface Review {
  id: string;
  serviceRequestId: string;
  customerId: string;
  customerName?: string;
  overallRating: number;
  comment: string;
  createdAt: string;
}

export interface WorkerReviewRating {
  id: string;
  reviewId: string;
  serviceRequestId: string;
  workerId: string;
  rating: number;
  createdAt: string;
}

export interface RequirementTallyRow {
  requirement: "Skill" | "Availability" | "Distance" | "Rating";
  customerRequirement: string;
  workerDetails: string;
  result: "Matched" | "Not Matched";
}

export interface RankedWorker {
  worker: WorkerProfile;
  user: User;
  primarySkill: string;
  certifications: Certification[];
  distanceKm: number;
  overallScore: number;
  rank: number;
  reasons: string[];
  scoreBreakdown: {
    skillScore: number;
    distanceScore: number;
    availabilityScore: number;
    certificationScore: number;
    ratingScore: number;
    workloadScore: number;
    responseRateScore: number;
  };
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

export interface Rating {
  id: string;
  bookingId: string;
  workerId: string;
  customerId: string;
  serviceQuality: number;
  punctuality: number;
  professionalism: number;
  overallRating: number;
  comment: string;
  createdAt: string;
}

export interface ZoneForecast {
  zone: string;
  zoneName: string;
  totalHistoricalBookings: number;
  predictedDemandNext7Days: number;
  currentAvailableWorkers: number;
  currentActiveWorkload: number;
  capacityIndex: number;
  shortageOrSurplus: number;
  serviceBreakdown: {
    categoryId: string;
    categoryName: string;
    predictedDemand: number;
    availableWorkers: number;
    shortageOrSurplus: number;
    growthPercent: number;
  }[];
}

export interface DemandSummary {
  period: string;
  overallGrowthPercent: number;
  topSurgingCategory: string;
  topSurgingGrowth: number;
  criticalZoneAlert?: {
    zone: string;
    category: string;
    shortageCount: number;
    message: string;
  };
  zoneForecasts: ZoneForecast[];
  dailyForecastNext7Days: {
    date: string;
    dayName: string;
    predictedTotal: number;
    plumbing: number;
    electrical: number;
    cleaning: number;
    other: number;
  }[];
  categoryTrends: {
    id: string;
    name: string;
    icon: string;
    predictedVolume: number;
    growthPercent: number;
    trend: "RISING" | "STABLE" | "FALLING";
  }[];
  activeAllocations: {
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
  }[];
  aiStrategicInsights?: string;
}

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: "BOOKING" | "ALERT" | "EARNING" | "WELFARE";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
