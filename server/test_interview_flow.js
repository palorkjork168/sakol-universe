// test_interview_flow.js
require("dotenv").config();
const BASE_URL = "http://127.0.0.1:5000/api";

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log("==================================================");
  console.log("STARTING INTERVIEW MANAGEMENT E2E & SECURITY TESTS");
  console.log("==================================================\n");

  const timestamp = Date.now();

  // 1. SETUP USERS & BASE DATA
  console.log("--- 1. Setting up Test Users & Roles ---");
  const {
    User,
    Role,
    UserRole,
    Company,
    Job,
    Application,
    Interview,
  } = require("./src/models");
  const bcrypt = require("bcryptjs");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const employerRole = await Role.findOne({ where: { name: "EMPLOYER" } });
  const jobSeekerRole = await Role.findOne({ where: { name: "JOB_SEEKER" } });
  const adminRole = await Role.findOne({ where: { name: "ADMIN" } });

  // Employer A
  const empAEmail = `emp_a_iv_${timestamp}@test.com`;
  const [empA] = await User.findOrCreate({
    where: { email: empAEmail },
    defaults: { first_name: "Boss", last_name: "Alpha", email: empAEmail, password_hash: passwordHash },
  });
  await UserRole.findOrCreate({ where: { user_id: empA.id, role_id: employerRole.id } });

  // Employer B
  const empBEmail = `emp_b_iv_${timestamp}@test.com`;
  const [empB] = await User.findOrCreate({
    where: { email: empBEmail },
    defaults: { first_name: "Boss", last_name: "Beta", email: empBEmail, password_hash: passwordHash },
  });
  await UserRole.findOrCreate({ where: { user_id: empB.id, role_id: employerRole.id } });

  // Job Seeker A
  const seekerAEmail = `seeker_a_iv_${timestamp}@test.com`;
  const [seekerA] = await User.findOrCreate({
    where: { email: seekerAEmail },
    defaults: { first_name: "Alice", last_name: "Candidate", email: seekerAEmail, password_hash: passwordHash },
  });
  await UserRole.findOrCreate({ where: { user_id: seekerA.id, role_id: jobSeekerRole.id } });

  // Job Seeker B
  const seekerBEmail = `seeker_b_iv_${timestamp}@test.com`;
  const [seekerB] = await User.findOrCreate({
    where: { email: seekerBEmail },
    defaults: { first_name: "Bob", last_name: "Outsider", email: seekerBEmail, password_hash: passwordHash },
  });
  await UserRole.findOrCreate({ where: { user_id: seekerB.id, role_id: jobSeekerRole.id } });

  // Admin
  const adminEmail = `admin_iv_${timestamp}@test.com`;
  const [adminUser] = await User.findOrCreate({
    where: { email: adminEmail },
    defaults: { first_name: "System", last_name: "Admin", email: adminEmail, password_hash: passwordHash },
  });
  await UserRole.findOrCreate({ where: { user_id: adminUser.id, role_id: adminRole.id } });

  // Log in all actors
  const loginA = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: empAEmail, password: "Password123!" }),
  });
  const tokenA = loginA.data.data.token;

  const loginB = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: empBEmail, password: "Password123!" }),
  });
  const tokenB = loginB.data.data.token;

  const loginSeekerA = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: seekerAEmail, password: "Password123!" }),
  });
  const tokenSeekerA = loginSeekerA.data.data.token;

  const loginSeekerB = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: seekerBEmail, password: "Password123!" }),
  });
  const tokenSeekerB = loginSeekerB.data.data.token;

  const loginAdmin = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: adminEmail, password: "Password123!" }),
  });
  const tokenAdmin = loginAdmin.data.data.token;

  console.log("✓ All 5 test actor accounts authenticated.");

  // 2. COMPANY, JOB & APPLICATION SETUP
  console.log("\n--- 2. Setting up Company, Job & Application ---");
  const compRes = await apiRequest("/companies", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      name: "Innovate Tech",
      description: "Leading AI and Cloud firm.",
      city: "Phnom Penh",
      country: "Cambodia",
    }),
  });
  const companyA = compRes.data.data.company;

  const jobRes = await apiRequest("/jobs", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      company_id: companyA.id,
      title: "Senior Full Stack Architect",
      description: "Looking for an exceptional architect with 5+ years experience building cloud applications.",
      employment_type: "FULL_TIME",
      location: "Phnom Penh",
      status: "PUBLISHED",
    }),
  });
  const jobA = jobRes.data.data.job;

  // Job Seeker A applies to Job A
  const appRes = await apiRequest(`/applications/jobs/${jobA.id}/apply`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenSeekerA}` },
    body: JSON.stringify({
      cover_letter: "I would love to interview for the Senior Architect role.",
    }),
  });
  const appA = appRes.data.data.application;
  console.log("✓ Candidate applied to Job A, application ID:", appA.id, "initial status:", appA.status);

  // Employer A sets application to REVIEWING
  await apiRequest(`/applications/${appA.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: "REVIEWING" }),
  });
  console.log("✓ Application status updated to REVIEWING.");

  // 3. SCHEDULE INTERVIEW & AUTO-STATUS ADVANCE
  console.log("\n--- 3. Schedule Interview & Automatic Status Progression ---");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const scheduleRes = await apiRequest("/interviews", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      application_id: appA.id,
      scheduled_at: tomorrow.toISOString(),
      duration_minutes: 45,
      interview_type: "VIDEO",
      meeting_link: "https://meet.google.com/sakol-test-room",
      notes: "Initial technical screening with Lead Architect",
    }),
  });
  if (!scheduleRes.ok) {
    throw new Error(`Failed to schedule interview: ${JSON.stringify(scheduleRes.data)}`);
  }
  const interview1 = scheduleRes.data.data.interview;
  console.log("✓ Interview scheduled successfully, ID:", interview1.id);
  console.log("  - Scheduled At:", interview1.scheduled_at);
  console.log("  - Format:", interview1.interview_type);
  console.log("  - Status:", interview1.status);

  // Verify Application.status automatically advanced to INTERVIEW
  const checkApp = await Application.findByPk(appA.id);
  if (checkApp.status !== "INTERVIEW") {
    throw new Error(`AUTOMATIC STATUS FAILURE: Expected status 'INTERVIEW', got '${checkApp.status}'`);
  }
  console.log("✓ TRANSACTION VERIFIED: Application status automatically advanced to INTERVIEW!");

  // 4. MULTI-TENANT AUTHORIZATION TESTS
  console.log("\n--- 4. Multi-Tenant Authorization Boundaries ---");
  // Employer B attempts to schedule interview on Employer A's application -> 403
  const badSchedule = await apiRequest("/interviews", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      application_id: appA.id,
      scheduled_at: tomorrow.toISOString(),
      duration_minutes: 30,
      interview_type: "VIDEO",
    }),
  });
  if (badSchedule.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B scheduled interview on A's app! Status: ${badSchedule.status}`);
  }
  console.log("✓ SECURITY PASS: Employer B scheduling on Employer A's application blocked (403 Forbidden).");

  // Employer B attempts to view Employer A's interview -> 403
  const badView = await apiRequest(`/interviews/${interview1.id}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  if (badView.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B viewed Employer A's interview! Status: ${badView.status}`);
  }
  console.log("✓ SECURITY PASS: Employer B viewing Employer A's interview blocked (403 Forbidden).");

  // Employer B attempts to update Employer A's interview -> 403
  const badUpdate = await apiRequest(`/interviews/${interview1.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ duration_minutes: 90 }),
  });
  if (badUpdate.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B updated Employer A's interview! Status: ${badUpdate.status}`);
  }
  console.log("✓ SECURITY PASS: Employer B updating Employer A's interview blocked (403 Forbidden).");

  // Employer B attempts to cancel Employer A's interview -> 403
  const badCancel = await apiRequest(`/interviews/${interview1.id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  if (badCancel.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B cancelled Employer A's interview! Status: ${badCancel.status}`);
  }
  console.log("✓ SECURITY PASS: Employer B cancelling Employer A's interview blocked (403 Forbidden).");

  // Employer B attempts to complete Employer A's interview -> 403
  const badComplete = await apiRequest(`/interviews/${interview1.id}/complete`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  if (badComplete.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B completed Employer A's interview! Status: ${badComplete.status}`);
  }
  console.log("✓ SECURITY PASS: Employer B completing Employer A's interview blocked (403 Forbidden).");

  // Job Seeker A views own interview -> 200 OK
  const seekerAView = await apiRequest(`/interviews/${interview1.id}`, {
    headers: { Authorization: `Bearer ${tokenSeekerA}` },
  });
  if (!seekerAView.ok) {
    throw new Error("Job Seeker A failed to view own interview");
  }
  console.log("✓ SECURITY PASS: Job Seeker A can view own interview (200 OK).");

  // Job Seeker B (outsider) attempts to view Job Seeker A's interview -> 403
  const seekerBView = await apiRequest(`/interviews/${interview1.id}`, {
    headers: { Authorization: `Bearer ${tokenSeekerB}` },
  });
  if (seekerBView.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Job Seeker B accessed Seeker A's interview! Status: ${seekerBView.status}`);
  }
  console.log("✓ SECURITY PASS: Job Seeker B accessing Seeker A's interview blocked (403 Forbidden).");

  // Job Seeker A attempts to update/cancel/complete interview -> 403
  const seekerUpdate = await apiRequest(`/interviews/${interview1.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${tokenSeekerA}` },
    body: JSON.stringify({ duration_minutes: 60 }),
  });
  if (seekerUpdate.status !== 403) {
    throw new Error("Job Seeker was able to call PUT /api/interviews/:id!");
  }

  const seekerCancel = await apiRequest(`/interviews/${interview1.id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenSeekerA}` },
  });
  if (seekerCancel.status !== 403) {
    throw new Error("Job Seeker was able to call PATCH /api/interviews/:id/cancel!");
  }
  console.log("✓ SECURITY PASS: Job Seeker cannot modify or cancel interviews (403 Forbidden).");

  // Admin views interview -> 200 OK
  const adminView = await apiRequest(`/interviews/${interview1.id}`, {
    headers: { Authorization: `Bearer ${tokenAdmin}` },
  });
  if (!adminView.ok) {
    throw new Error("Admin failed to access interview details");
  }
  console.log("✓ SECURITY PASS: Admin can view interview details (200 OK).");

  // 5. EMPLOYER & JOB SEEKER INTERVIEW LISTINGS
  console.log("\n--- 5. Portal Listings & Isolation ---");
  // Employer A views employer interviews
  const empAList = await apiRequest("/interviews/employer/my", {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  if (!empAList.ok || !empAList.data.data.interviews.some((i) => i.id === interview1.id)) {
    throw new Error("Interview 1 missing from Employer A's interview list");
  }
  console.log("✓ Employer A lists own scheduled interviews (count: " + empAList.data.data.interviews.length + ").");

  // Employer B views employer interviews (must NOT see Interview 1)
  const empBList = await apiRequest("/interviews/employer/my", {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  if (empBList.data.data.interviews.some((i) => i.id === interview1.id)) {
    throw new Error("CRITICAL BUG: Employer B saw Employer A's interview in /interviews/employer/my!");
  }
  console.log("✓ Employer B's interview list isolates only their own jobs.");

  // Job Seeker A views my interviews
  const seekerAList = await apiRequest("/interviews/my", {
    headers: { Authorization: `Bearer ${tokenSeekerA}` },
  });
  if (!seekerAList.ok || !seekerAList.data.data.interviews.some((i) => i.id === interview1.id)) {
    throw new Error("Interview 1 missing from Job Seeker A's interview list");
  }
  console.log("✓ Job Seeker A lists own interviews (count: " + seekerAList.data.data.interviews.length + ").");

  // Job Seeker B views my interviews (must NOT see Interview 1)
  const seekerBList = await apiRequest("/interviews/my", {
    headers: { Authorization: `Bearer ${tokenSeekerB}` },
  });
  if (seekerBList.data.data.interviews.some((i) => i.id === interview1.id)) {
    throw new Error("CRITICAL BUG: Job Seeker B saw Job Seeker A's interview in /interviews/my!");
  }
  console.log("✓ Job Seeker B's interview list isolates only their own applications.");

  // 6. UPDATE INTERVIEW (RESCHEDULE)
  console.log("\n--- 6. Update / Reschedule Interview ---");
  const newDate = new Date(tomorrow.getTime() + 2 * 3600 * 1000); // 2 hours later
  const updateRes = await apiRequest(`/interviews/${interview1.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      scheduled_at: newDate.toISOString(),
      duration_minutes: 60,
      notes: "Updated agenda: React architecture & system design.",
    }),
  });
  if (!updateRes.ok) {
    throw new Error(`Failed to update interview: ${JSON.stringify(updateRes.data)}`);
  }
  console.log("✓ Employer A rescheduled interview to:", newDate.toISOString(), "duration: 60m");

  // Verify Job Seeker A sees updated time
  const verifySeeker = await apiRequest(`/interviews/${interview1.id}`, {
    headers: { Authorization: `Bearer ${tokenSeekerA}` },
  });
  if (verifySeeker.data.data.interview.duration_minutes !== 60) {
    throw new Error("Job Seeker did not receive updated interview duration");
  }
  console.log("✓ Job Seeker verified updated interview time & duration.");

  // 7. COMPLETE INTERVIEW
  console.log("\n--- 7. Complete Interview & Status Integrity ---");
  const completeRes = await apiRequest(`/interviews/${interview1.id}/complete`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      notes: "Candidate demonstrated outstanding technical depth. Strong hire recommendation.",
    }),
  });
  if (!completeRes.ok) {
    throw new Error(`Failed to complete interview: ${JSON.stringify(completeRes.data)}`);
  }
  console.log("✓ Employer A marked interview as COMPLETED.");

  // Verify Application.status remains INTERVIEW
  const appAfterComplete = await Application.findByPk(appA.id);
  if (appAfterComplete.status !== "INTERVIEW") {
    throw new Error(`STATUS INTEGRITY BUG: Application status changed to '${appAfterComplete.status}' instead of remaining 'INTERVIEW'`);
  }
  console.log("✓ STATUS INTEGRITY PASS: Application remains INTERVIEW after interview completion.");

  // Verify completed interview cannot be edited
  const editCompleted = await apiRequest(`/interviews/${interview1.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ duration_minutes: 45 }),
  });
  if (editCompleted.status !== 400) {
    throw new Error(`EDGE CASE FAIL: Modifying completed interview should return 400, got ${editCompleted.status}`);
  }
  console.log("✓ EDGE CASE PASS: Cannot modify an already completed interview (400 Bad Request).");

  // 8. CANCEL INTERVIEW FLOW
  console.log("\n--- 8. Cancel Interview Flow ---");
  // Employer A creates a second interview
  const schedule2 = await apiRequest("/interviews", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      application_id: appA.id,
      scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString(),
      duration_minutes: 30,
      interview_type: "IN_PERSON",
      location: "Phnom Penh HQ, Room 302",
    }),
  });
  const interview2 = schedule2.data.data.interview;
  console.log("✓ Scheduled follow-up Interview 2, ID:", interview2.id);

  // Cancel Interview 2
  const cancelRes = await apiRequest(`/interviews/${interview2.id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  if (!cancelRes.ok) {
    throw new Error("Failed to cancel Interview 2");
  }
  console.log("✓ Interview 2 successfully cancelled, status: CANCELLED.");

  // Completing a cancelled interview must fail
  const completeCancelled = await apiRequest(`/interviews/${interview2.id}/complete`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  if (completeCancelled.status !== 400) {
    throw new Error(`EDGE CASE FAIL: Completing cancelled interview should return 400, got ${completeCancelled.status}`);
  }
  console.log("✓ EDGE CASE PASS: Cannot complete a cancelled interview (400 Bad Request).");

  // 9. EXPLICIT HIRING DECISION
  console.log("\n--- 9. Explicit Hiring Decision by Employer ---");
  const acceptRes = await apiRequest(`/applications/${appA.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: "ACCEPTED" }),
  });
  if (!acceptRes.ok) {
    throw new Error("Failed to advance application to ACCEPTED");
  }
  console.log("✓ Employer A explicitly advanced application to ACCEPTED.");

  // Verify Job Seeker A sees ACCEPTED
  const seekerApps = await apiRequest("/applications/my", {
    headers: { Authorization: `Bearer ${tokenSeekerA}` },
  });
  const finalApp = seekerApps.data.data.applications.find((a) => a.id === appA.id);
  if (!finalApp || finalApp.status !== "ACCEPTED") {
    throw new Error(`Application status mismatch in seeker portal: ${finalApp?.status}`);
  }
  console.log("✓ Job Seeker verified final status is ACCEPTED.");

  console.log("\n==================================================");
  console.log("ALL INTERVIEW MANAGEMENT E2E & SECURITY TESTS PASSED!");
  console.log("==================================================\n");

  process.exit(0);
}

runTests().catch((err) => {
  console.error("\n❌ TEST FAILED:", err.message);
  process.exit(1);
});
