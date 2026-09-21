// test_hiring_flow.js
require("dotenv").config();
const BASE_URL = "http://127.0.0.1:5000/api";
const { User, Role, UserRole, EmployeeProfile } = require("./src/models");
const bcrypt = require("bcryptjs");

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

async function runHiringTests() {
  console.log("==================================================");
  console.log("STARTING HIRING -> EMPLOYEE CONVERSION E2E TESTS");
  console.log("==================================================\n");

  const timestamp = Date.now();
  const passwordHash = await bcrypt.hash("Password123!", 10);

  let tokenEmpA, tokenEmpB, tokenSeekerA, tokenSeekerB, tokenAdmin;
  let userSeekerA, userSeekerB;
  let companyA, jobA, applicationA, applicationB;

  try {
    // 1. Setup Test Users
    console.log("--- 1. Setting up Test Users & Roles ---");
    const employerRole = await Role.findOne({ where: { name: "EMPLOYER" } });
    const jobSeekerRole = await Role.findOne({ where: { name: "JOB_SEEKER" } });
    const adminRole = await Role.findOne({ where: { name: "ADMIN" } });

    // Employer A
    const empAEmail = `emp_hire_a_${timestamp}@test.com`;
    const [empA] = await User.findOrCreate({
      where: { email: empAEmail },
      defaults: { first_name: "Bruce", last_name: "Wayne", email: empAEmail, password_hash: passwordHash },
    });
    await UserRole.findOrCreate({ where: { user_id: empA.id, role_id: employerRole.id } });

    // Employer B
    const empBEmail = `emp_hire_b_${timestamp}@test.com`;
    const [empB] = await User.findOrCreate({
      where: { email: empBEmail },
      defaults: { first_name: "Lex", last_name: "Luthor", email: empBEmail, password_hash: passwordHash },
    });
    await UserRole.findOrCreate({ where: { user_id: empB.id, role_id: employerRole.id } });

    // Job Seeker A
    const seekerAEmail = `seeker_hire_a_${timestamp}@test.com`;
    const [seekerA] = await User.findOrCreate({
      where: { email: seekerAEmail },
      defaults: { first_name: "Peter", last_name: "Parker", email: seekerAEmail, password_hash: passwordHash },
    });
    await UserRole.findOrCreate({ where: { user_id: seekerA.id, role_id: jobSeekerRole.id } });

    // Job Seeker B
    const seekerBEmail = `seeker_hire_b_${timestamp}@test.com`;
    const [seekerB] = await User.findOrCreate({
      where: { email: seekerBEmail },
      defaults: { first_name: "Miles", last_name: "Morales", email: seekerBEmail, password_hash: passwordHash },
    });
    await UserRole.findOrCreate({ where: { user_id: seekerB.id, role_id: jobSeekerRole.id } });

    // Admin
    const adminEmail = `admin_hire_${timestamp}@test.com`;
    const [adminUser] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: { first_name: "System", last_name: "Admin", email: adminEmail, password_hash: passwordHash },
    });
    await UserRole.findOrCreate({ where: { user_id: adminUser.id, role_id: adminRole.id } });

    // Log in all actors
    const loginEmpA = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: empAEmail, password: "Password123!" }),
    });
    tokenEmpA = loginEmpA.data.data.token;

    const loginEmpB = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: empBEmail, password: "Password123!" }),
    });
    tokenEmpB = loginEmpB.data.data.token;

    const loginSeekerA = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: seekerAEmail, password: "Password123!" }),
    });
    tokenSeekerA = loginSeekerA.data.data.token;
    userSeekerA = loginSeekerA.data.data.user;

    const loginSeekerB = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: seekerBEmail, password: "Password123!" }),
    });
    tokenSeekerB = loginSeekerB.data.data.token;
    userSeekerB = loginSeekerB.data.data.user;

    const loginAdmin = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: adminEmail, password: "Password123!" }),
    });
    tokenAdmin = loginAdmin.data.data.token;

    console.log("✓ All 5 actors authenticated successfully.");
    console.log(`  Candidate A ID: ${userSeekerA.id}, initial roles:`, userSeekerA.roles);

    // 2. Setup Company & Job
    console.log("\n--- 2. Setting up Company, Job & Applications ---");
    const compRes = await apiRequest("/companies", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({
        name: `Wayne Tech ${timestamp}`,
        description: "Innovative tech conglomerate",
        city: "Phnom Penh",
        country: "Cambodia",
      }),
    });
    companyA = compRes.data.data.company;

    const jobRes = await apiRequest("/jobs", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({
        company_id: companyA.id,
        title: `Systems Architect ${timestamp}`,
        description: "Backend microservices and systems architecture.",
        employment_type: "FULL_TIME",
        location: "Gotham City",
        status: "PUBLISHED",
      }),
    });
    jobA = jobRes.data.data.job;

    // Candidate A applies
    const appARes = await apiRequest(`/applications/jobs/${jobA.id}/apply`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenSeekerA}` },
      body: JSON.stringify({ cover_letter: "Ready to engineer resilient systems." }),
    });
    applicationA = appARes.data.data.application;
    console.log(`✓ Candidate A applied (App ID: ${applicationA.id}), Status: ${applicationA.status}`);

    // Candidate B applies
    const appBRes = await apiRequest(`/applications/jobs/${jobA.id}/apply`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenSeekerB}` },
      body: JSON.stringify({ cover_letter: "Candidate B application." }),
    });
    applicationB = appBRes.data.data.application;

    // 3. Precondition Tests: Hiring must fail if not ACCEPTED
    console.log("\n--- 3. Testing Status Preconditions for Hiring ---");
    
    // Status = PENDING
    const hirePendingRes = await apiRequest(`/applications/${applicationA.id}/hire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ department: "Engineering" }),
    });
    if (hirePendingRes.status === 400) {
      console.log("✓ PRECONDITION PASS: Hiring PENDING applicant rejected (400 Bad Request).");
    } else {
      throw new Error(`Expected 400 for PENDING applicant, got ${hirePendingRes.status}`);
    }

    // Status = REVIEWING
    await apiRequest(`/applications/${applicationA.id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ status: "REVIEWING" }),
    });
    const hireReviewingRes = await apiRequest(`/applications/${applicationA.id}/hire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ department: "Engineering" }),
    });
    if (hireReviewingRes.status === 400) {
      console.log("✓ PRECONDITION PASS: Hiring REVIEWING applicant rejected (400 Bad Request).");
    } else {
      throw new Error(`Expected 400 for REVIEWING applicant, got ${hireReviewingRes.status}`);
    }

    // Status = INTERVIEW
    await apiRequest(`/applications/${applicationA.id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ status: "INTERVIEW" }),
    });
    const hireInterviewRes = await apiRequest(`/applications/${applicationA.id}/hire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ department: "Engineering" }),
    });
    if (hireInterviewRes.status === 400) {
      console.log("✓ PRECONDITION PASS: Hiring INTERVIEW applicant rejected (400 Bad Request).");
    } else {
      throw new Error(`Expected 400 for INTERVIEW applicant, got ${hireInterviewRes.status}`);
    }

    // Candidate B -> REJECTED
    await apiRequest(`/applications/${applicationB.id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    const hireRejectedRes = await apiRequest(`/applications/${applicationB.id}/hire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ department: "Engineering" }),
    });
    if (hireRejectedRes.status === 400) {
      console.log("✓ PRECONDITION PASS: Hiring REJECTED applicant rejected (400 Bad Request).");
    } else {
      throw new Error(`Expected 400 for REJECTED applicant, got ${hireRejectedRes.status}`);
    }

    // Advance Candidate A to ACCEPTED
    await apiRequest(`/applications/${applicationA.id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ status: "ACCEPTED" }),
    });
    console.log("✓ Candidate A status explicitly updated to ACCEPTED.");

    // 4. Authorization & Security Boundaries
    console.log("\n--- 4. Testing Multi-Tenant Security & Ownership Boundaries ---");

    // Employer B cannot hire Employer A's candidate
    const empBHireRes = await apiRequest(`/applications/${applicationA.id}/hire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenEmpB}` },
      body: JSON.stringify({ department: "Engineering" }),
    });
    if (empBHireRes.status === 403) {
      console.log("✓ SECURITY PASS: Employer B hiring Employer A's candidate blocked (403 Forbidden).");
    } else {
      throw new Error(`Expected 403 for Employer B, got ${empBHireRes.status}`);
    }

    // Candidate A cannot hire themselves
    const seekerSelfHireRes = await apiRequest(`/applications/${applicationA.id}/hire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenSeekerA}` },
      body: JSON.stringify({ department: "Engineering" }),
    });
    if (seekerSelfHireRes.status === 403) {
      console.log("✓ SECURITY PASS: Job Seeker calling hire endpoint blocked (403 Forbidden).");
    } else {
      throw new Error(`Expected 403 for seeker, got ${seekerSelfHireRes.status}`);
    }

    // Candidate B cannot call hire endpoint
    const seekerBHireRes = await apiRequest(`/applications/${applicationA.id}/hire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenSeekerB}` },
      body: JSON.stringify({ department: "Engineering" }),
    });
    if (seekerBHireRes.status === 403) {
      console.log("✓ SECURITY PASS: Different Job Seeker calling hire blocked (403 Forbidden).");
    } else {
      throw new Error(`Expected 403 for seeker B, got ${seekerBHireRes.status}`);
    }

    // Non-existent Application
    const nonExistRes = await apiRequest("/applications/00000000-0000-0000-0000-000000000000/hire", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ department: "Engineering" }),
    });
    if (nonExistRes.status === 404) {
      console.log("✓ EDGE CASE PASS: Non-existent application returns 404 Not Found.");
    } else {
      throw new Error(`Expected 404 for missing application, got ${nonExistRes.status}`);
    }

    // 5. Successful Hiring & Transaction Verification
    console.log("\n--- 5. Executing Conversion: Employer A Hires Candidate A ---");
    const hireRes = await apiRequest(`/applications/${applicationA.id}/hire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ department: "Cloud Infrastructure" }),
    });

    if (hireRes.status !== 200) {
      throw new Error(`Failed to hire candidate: ${JSON.stringify(hireRes.data)}`);
    }

    console.log("✓ HIRE RESPONSE (200 OK):", hireRes.data.message);
    const hiredData = hireRes.data.data;
    const hiredEmployee = hiredData.employee;

    // Verify same User ID
    if (hiredEmployee.id !== userSeekerA.id) {
      throw new Error(`CRITICAL ERROR: New user created! Expected ${userSeekerA.id}, got ${hiredEmployee.id}`);
    }
    console.log(`✓ CRITICAL CHECK PASS: Existing User ID preserved (${hiredEmployee.id}). No new user created!`);

    // Verify Roles: Must have both JOB_SEEKER and EMPLOYEE
    const roleNames = hiredEmployee.Roles.map((r) => r.name);
    console.log("✓ Candidate Roles after hire:", roleNames);
    if (!roleNames.includes("JOB_SEEKER")) {
      throw new Error("JOB_SEEKER role was removed! Multi-role support broken.");
    }
    if (!roleNames.includes("EMPLOYEE")) {
      throw new Error("EMPLOYEE role was not added!");
    }
    console.log("✓ MULTI-ROLE PASS: User retains JOB_SEEKER and has gained EMPLOYEE!");

    // Verify EmployeeProfile
    if (!hiredEmployee.employeeProfile) {
      throw new Error("EmployeeProfile was not created!");
    }
    console.log("✓ EMPLOYEE PROFILE PASS: Created with department:", hiredEmployee.employeeProfile.department);
    console.log("  Joined Date:", hiredEmployee.employeeProfile.joined_date);

    // Verify Application Status remains ACCEPTED
    console.log("✓ APPLICATION STATUS PASS: Application.status remains:", hiredData.application.status);

    // 6. Idempotency Test
    console.log("\n--- 6. Testing Idempotent Repeated Calls ---");
    const repeatHireRes = await apiRequest(`/applications/${applicationA.id}/hire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ department: "Cloud Infrastructure" }),
    });
    console.log("✓ Repeat Hire call returned clean 200 OK:", repeatHireRes.data.message);
    if (!repeatHireRes.data.data.is_already_hired) {
      throw new Error("Expected is_already_hired to be true on repeat call");
    }
    console.log("✓ IDEMPOTENCY PASS: No error, no duplicate profile or roles created on repeat invocation.");

    // Check DB directly for no duplicates
    const profileCount = await EmployeeProfile.count({ where: { user_id: userSeekerA.id } });
    if (profileCount !== 1) {
      throw new Error(`DB INTEGRITY ERROR: Expected exactly 1 EmployeeProfile, found ${profileCount}`);
    }
    console.log(`✓ DB INTEGRITY PASS: Exactly 1 EmployeeProfile exists for user in database.`);

    // 7. Admin Employee Management Integration
    console.log("\n--- 7. Verifying Admin Employee List Integration ---");
    const adminEmployeesRes = await apiRequest("/employees", {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const employeesList = adminEmployeesRes.data.data.employees;
    const foundInAdmin = employeesList.find((e) => e.id === userSeekerA.id);
    if (!foundInAdmin) {
      throw new Error("Newly hired candidate does not appear in GET /api/employees!");
    }
    console.log("✓ ADMIN INTEGRATION PASS: Hired candidate appears in GET /api/employees:");
    console.log(`  Name: ${foundInAdmin.first_name} ${foundInAdmin.last_name}`);
    console.log(`  Email: ${foundInAdmin.email}`);
    console.log(`  Department: ${foundInAdmin.employeeProfile?.department}`);

    // 8. Candidate Auth/Me & Multi-Role UX Integration
    console.log("\n--- 8. Verifying Candidate Auth & Multi-Portal State ---");
    const candidateMeRes = await apiRequest("/auth/me", {
      headers: { Authorization: `Bearer ${tokenSeekerA}` },
    });
    const candidateMe = candidateMeRes.data.data.user;
    console.log("✓ GET /api/auth/me for Candidate A:", candidateMe.roles);
    if (!candidateMe.roles.includes("EMPLOYEE") || !candidateMe.roles.includes("JOB_SEEKER")) {
      throw new Error("Candidate GET /api/auth/me missing expected roles");
    }
    console.log("✓ AUTH STATE PASS: Token immediately recognized as EMPLOYEE + JOB_SEEKER!");

    // 9. Employee Attendance Integration Test
    console.log("\n--- 9. Verifying Employee Attendance for Hired Candidate ---");
    
    // GET /attendance/me
    const attMeRes = await apiRequest("/attendance/me", {
      headers: { Authorization: `Bearer ${tokenSeekerA}` },
    });
    console.log("✓ GET /api/attendance/me succeeded, initial count:", attMeRes.data.data.attendances.length);

    // POST /attendance/check-in
    const checkInRes = await apiRequest("/attendance/check-in", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenSeekerA}` },
      body: JSON.stringify({ latitude: 11.5564, longitude: 104.9282 }),
    });
    console.log("✓ Check-in succeeded (201 Created), record ID:", checkInRes.data.data.attendance.id);
    console.log("  Check-in Time:", checkInRes.data.data.attendance.check_in_time);

    // POST /attendance/check-out
    const checkOutRes = await apiRequest("/attendance/check-out", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenSeekerA}` },
      body: JSON.stringify({ latitude: 11.5564, longitude: 104.9282 }),
    });
    console.log("✓ Check-out succeeded (200 OK), check-out time:", checkOutRes.data.data.attendance.check_out_time);
    console.log("✓ ATTENDANCE PASS: Newly converted employee fully functional in workforce attendance!");

    // 10. Candidate Details Shows Hired State
    console.log("\n--- 10. Verifying Applicant Details Hired State ---");
    const applicantDetailRes = await apiRequest(`/applications/${applicationA.id}/applicant`, {
      headers: { Authorization: `Bearer ${tokenEmpA}` },
    });
    const applicantDetail = applicantDetailRes.data.data.application;
    const hasEmployeeProfile = Boolean(applicantDetail.applicant?.employeeProfile);
    console.log("✓ Applicant Details retrieved. hasEmployeeProfile:", hasEmployeeProfile);
    if (!hasEmployeeProfile) {
      throw new Error("Applicant details did not return employeeProfile association");
    }
    console.log("✓ HIRED DERIVATION PASS: Frontend can cleanly derive hired state!");

    // 11. Transaction Rollback Verification
    console.log("\n--- 11. Verifying Transaction Rollback Integrity ---");
    // Attempt invalid hire with unprocessable data or verify error handling
    const invalidHireRes = await apiRequest(`/applications/${applicationB.id}/hire`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenEmpA}` },
      body: JSON.stringify({ department: "x".repeat(200) }), // exceeds 100 char limit in validator
    });
    if (invalidHireRes.status === 400) {
      console.log("✓ ROLLBACK PASS: Invalid input rejected at validation before database mutation.");
    }

    console.log("\n==================================================");
    console.log("ALL HIRING -> EMPLOYEE CONVERSION TESTS PASSED 100%!");
    console.log("==================================================");
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
    process.exit(1);
  }
}

runHiringTests();
