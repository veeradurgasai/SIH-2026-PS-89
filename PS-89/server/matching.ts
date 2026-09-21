import { db, WorkerProfile, User, Certification, WorkerSkill } from "./db";

export interface MatchingCriteria {
  categoryId: string;
  latitude: number;
  longitude: number;
  zone: string;
  preferredDate?: string;
  preferredTime?: string;
  isEmergency?: boolean;
}

export interface MatchingWeights {
  skillCompatibility: number; // default 0.30
  distance: number;           // default 0.20
  availability: number;       // default 0.15
  certification: number;      // default 0.15
  rating: number;             // default 0.10
  workload: number;           // default 0.05
  responseRate: number;       // default 0.05
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  skillCompatibility: 0.30,
  distance: 0.20,
  availability: 0.15,
  certification: 0.15,
  rating: 0.10,
  workload: 0.05,
  responseRate: 0.05
};

export interface MatchReason {
  label: string;
  score: number;
  highlight: boolean;
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

// Haversine distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal point
}

export function rankWorkersForRequest(
  criteria: MatchingCriteria,
  weights: MatchingWeights = DEFAULT_WEIGHTS
): RankedWorker[] {
  const allWorkers = db.workerProfiles;
  const rankedList: RankedWorker[] = [];

  for (const worker of allWorkers) {
    const user = db.users.find(u => u.id === worker.userId);
    if (!user) continue;

    // Security & Eligibility: Only approved, active, certified cooperative workers can be matched
    if (worker.applicationStatus && worker.applicationStatus !== "APPROVED") continue;
    if (worker.isCooperativeVerified === false) continue;
    if (user.isActive === false) continue;

    // Check if worker has matching skill
    const skills = db.workerSkills.filter(ws => ws.workerId === worker.id);
    const hasCategorySkill = skills.some(s => s.categoryId === criteria.categoryId);
    
    // Compute distance
    const distKm = calculateDistanceKm(
      criteria.latitude,
      criteria.longitude,
      worker.latitude,
      worker.longitude
    );

    // 1. Skill Compatibility Score (0 - 100)
    let skillScore = 0;
    const primaryMatch = skills.find(s => s.categoryId === criteria.categoryId && s.isPrimary);
    const secondaryMatch = skills.find(s => s.categoryId === criteria.categoryId && !s.isPrimary);
    if (primaryMatch) {
      skillScore = 90 + Math.min(10, primaryMatch.yearsExperience);
    } else if (secondaryMatch) {
      skillScore = 75 + Math.min(10, secondaryMatch.yearsExperience);
    } else {
      // If emergency and no exact match, allow nearby certified technicians with lower compatibility
      skillScore = criteria.isEmergency ? 30 : 10;
    }

    // 2. Distance Score (0 - 100)
    // Closer is better. Under 2 km = 100; 15 km or more = 10
    const maxRadiusKm = 20;
    const distanceScore = Math.max(10, Math.min(100, Math.round(100 - (distKm / maxRadiusKm) * 90)));

    // 3. Availability Score (0 - 100)
    let availabilityScore = 30;
    if (worker.status === "available") {
      availabilityScore = 100;
    } else if (worker.status === "busy" && worker.currentWorkload < 3) {
      availabilityScore = 60;
    } else if (worker.status === "on_trip") {
      availabilityScore = 40;
    } else {
      availabilityScore = 10;
    }

    // 4. Certification Score (0 - 100)
    const certs = db.certifications.filter(c => c.workerId === worker.id);
    const validCerts = certs.filter(c => c.status === "verified");
    let certificationScore = 50;
    if (validCerts.length >= 2) {
      certificationScore = 100;
    } else if (validCerts.length === 1) {
      certificationScore = 85;
    } else if (certs.some(c => c.status === "pending")) {
      certificationScore = 60;
    }

    // 5. Rating Score (0 - 100)
    // 5.0 = 100, 4.0 = 80, etc.
    const ratingScore = Math.min(100, Math.max(0, Math.round((worker.rating / 5) * 100)));

    // 6. Workload Score (0 - 100)
    // 0 active jobs = 100, 1 = 85, 2 = 60, 3+ = 30
    let workloadScore = 100;
    if (worker.currentWorkload === 1) workloadScore = 85;
    else if (worker.currentWorkload === 2) workloadScore = 60;
    else if (worker.currentWorkload >= 3) workloadScore = 30;

    // 7. Response Rate Score (0 - 100)
    const responseRateScore = worker.responseRate || 90;

    // Calculate total weighted score
    const overallScore = Math.round(
      skillScore * weights.skillCompatibility +
      distanceScore * weights.distance +
      availabilityScore * weights.availability +
      certificationScore * weights.certification +
      ratingScore * weights.rating +
      workloadScore * weights.workload +
      responseRateScore * weights.responseRate
    );

    // Explainable reasoning generation
    const reasons: string[] = [];
    if (primaryMatch) {
      reasons.push(`Primary skill matches request (${primaryMatch.skillName})`);
    } else if (secondaryMatch) {
      reasons.push(`Cross-trained in ${secondaryMatch.skillName} (${secondaryMatch.yearsExperience} yrs exp)`);
    }

    if (validCerts.length > 0) {
      reasons.push(`Cooperative verified & certified (${validCerts[0].title.slice(0, 35)}...)`);
    }

    if (worker.status === "available") {
      reasons.push("Available immediately for dispatch");
    }

    if (distKm <= 3.5) {
      reasons.push(`Close proximity: only ${distKm} km from your address`);
    } else {
      reasons.push(`Covers your zone (${distKm} km travel range)`);
    }

    if (worker.rating >= 4.8) {
      reasons.push(`Outstanding track record (${worker.rating.toFixed(2)}★ from ${worker.completedJobsCount} jobs)`);
    } else if (worker.completedJobsCount > 50) {
      reasons.push(`Experienced worker with ${worker.completedJobsCount} successful services`);
    }

    if (worker.currentWorkload === 0) {
      reasons.push("Zero active queue; prompt immediate attention guaranteed");
    }

    const primarySkillName = primaryMatch?.skillName || skills[0]?.skillName || "General Specialist";

    rankedList.push({
      worker,
      user,
      primarySkill: primarySkillName,
      certifications: certs,
      distanceKm: distKm,
      overallScore,
      rank: 1, // updated after sort
      reasons,
      scoreBreakdown: {
        skillScore,
        distanceScore,
        availabilityScore,
        certificationScore,
        ratingScore,
        workloadScore,
        responseRateScore
      }
    });
  }

  // Sort descending by overall score
  rankedList.sort((a, b) => b.overallScore - a.overallScore);

  // Assign ranks
  rankedList.forEach((item, index) => {
    item.rank = index + 1;
  });

  return rankedList;
}
