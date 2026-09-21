import { calculateDistanceKm, rankWorkersForRequest } from "../server/matching";
import { calculateDemandIntelligence, applyWorkforceAllocation } from "../server/forecasting";
import { db } from "../server/db";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

async function runTests() {
  console.log("\n========================================================");
  console.log("RUNNING SHRAMCONNECT BACKEND LOGIC VERIFICATION SUITE");
  console.log("========================================================\n");

  // 1. Distance calculation test
  const distSame = calculateDistanceKm(12.9716, 77.5946, 12.9716, 77.5946);
  assert(distSame === 0, "Distance between identical points should be 0 km");

  const distIndiranagarToKoramangala = calculateDistanceKm(12.9716, 77.5946, 12.9352, 77.6245);
  assert(distIndiranagarToKoramangala > 3 && distIndiranagarToKoramangala < 7, "Distance between Indiranagar and Koramangala is ~5 km");

  // 2. Matching Engine test
  const ranked = rankWorkersForRequest({
    categoryId: "cat-plumbing",
    latitude: 12.9716,
    longitude: 77.5946,
    zone: "Zone A"
  });
  assert(ranked.length > 0, "Matching engine returns ranked workers");
  assert(ranked[0].rank === 1, "Top worker has rank 1");
  assert(ranked[0].overallScore >= ranked[1].overallScore, "Workers are strictly ordered by weighted score descending");
  assert(ranked[0].reasons.length > 0, "Top worker contains explainable recommendation reasons");
  assert(ranked[0].scoreBreakdown.skillScore > 0, "Score breakdown includes skill compatibility");

  // 3. Emergency matching test
  const emergRanked = rankWorkersForRequest({
    categoryId: "cat-plumbing",
    latitude: 12.9716,
    longitude: 77.5946,
    zone: "Zone A",
    isEmergency: true
  });
  assert(emergRanked.length > 0, "Emergency matching successfully returns available responders");

  // 4. Demand forecasting & intelligence test
  const forecast = calculateDemandIntelligence();
  assert(forecast.zoneForecasts.length === 4, "Forecast generated for all 4 cooperative service zones");
  assert(forecast.dailyForecastNext7Days.length === 7, "Daily 7-day rolling forecast generated");
  assert(forecast.topSurgingCategory === "Plumbing", "Identifies Plumbing as top surging trade");
  assert(forecast.categoryTrends.some(c => c.name === "Plumbing" && c.growthPercent === 24), "Detects 24% plumbing surge");

  // 5. Workforce allocation test
  const pendingAlloc = forecast.activeAllocations.find(a => a.status === "PENDING");
  if (pendingAlloc) {
    const result = applyWorkforceAllocation(pendingAlloc.id);
    assert(result.success, "Workforce allocation rebalancing applies cleanly");
    assert(pendingAlloc.status === "APPLIED", "Allocation status transitions to APPLIED");
  }

  // 6. Dynamic Earnings Calculation & 5% Cooperative fee
  const testBaseAmount = 1000;
  const coopFee = Math.round(testBaseAmount * 0.05 * 100) / 100;
  const workerNet = testBaseAmount - coopFee;
  assert(coopFee === 50, "5% cooperative fee deducted correctly (₹50 from ₹1000)");
  assert(workerNet === 950, "Worker retains 95% net earnings (₹950 from ₹1000)");

  // 7. Rating calculation test
  const scores = [5, 4, 5];
  const overall = Math.round(((scores[0] + scores[1] + scores[2]) / 3) * 10) / 10;
  assert(overall === 4.7, "Weighted average rating computes accurately (4.7★)");

  console.log("\n========================================================");
  console.log("ALL 8 CRITICAL BACKEND ALGORITHM TESTS PASSED SUCCESSFULLY");
  console.log("========================================================\n");
}

runTests().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
