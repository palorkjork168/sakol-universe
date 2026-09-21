// test_employer_recruitment_flow.js
require("dotenv").config();
const BASE_URL = "http://127.0.0.1:5000/api";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  console.log("STARTING EMPLOYER & RECRUITMENT E2E & SECURITY TESTS");
  console.log("==================================================\n");

  const timestamp = Date.now();

  // 1. SETUP USERS DIRECTLY VIA DB / REGISTRATION
  console.log("--- 1. Setting up Test Users ---");
  const { User, Role, UserRole, UserProfile, UserSkill, Education, Experience } = require("./src/models");
  const bcrypt = require("bcryptjs");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const employerRole = await Role.findOne({ where: { name: "EMPLOYER" } });
  const jobSeekerRole = await Role.findOne({ where: { name: "JOB_SEEKER" } });
  const adminRole = await Role.findOne({ where: { name: "ADMIN" } });
  const employeeRole = await Role.findOne({ where: { name: "EMPLOYEE" } });

  // Employer A
  const employerAEmail = `emp_a_${timestamp}@test.com`;
  const [empA] = await User.findOrCreate({
    where: { email: employerAEmail },
    defaults: { first_name: "Employer", last_name: "Alpha", email: employerAEmail, password_hash: passwordHash },
  });
  await UserRole.findOrCreate({ where: { user_id: empA.id, role_id: employerRole.id } });

  // Employer B
  const employerBEmail = `emp_b_${timestamp}@test.com`;
  const [empB] = await User.findOrCreate({
    where: { email: employerBEmail },
    defaults: { first_name: "Employer", last_name: "Beta", email: employerBEmail, password_hash: passwordHash },
  });
  await UserRole.findOrCreate({ where: { user_id: empB.id, role_id: employerRole.id } });

  // Job Seeker 1
  const seeker1Email = `seeker1_${timestamp}@test.com`;
  const [seeker1] = await User.findOrCreate({
    where: { email: seeker1Email },
    defaults: { first_name: "Sarah", last_name: "Candidate", email: seeker1Email, password_hash: passwordHash },
  });
  await UserRole.findOrCreate({ where: { user_id: seeker1.id, role_id: jobSeekerRole.id } });

  // Job Seeker 2
  const seeker2Email = `seeker2_${timestamp}@test.com`;
  const [seeker2] = await User.findOrCreate({
    where: { email: seeker2Email },
    defaults: { first_name: "Tom", last_name: "Applicant", email: seeker2Email, password_hash: passwordHash },
  });
  await UserRole.findOrCreate({ where: { user_id: seeker2.id, role_id: jobSeekerRole.id } });

  // Add rich candidate profile for Seeker 1
  await UserProfile.findOrCreate({
    where: { user_id: seeker1.id },
    defaults: {
      user_id: seeker1.id,
      professional_title: "Full Stack Engineer",
      bio: "Passionate developer with 4 years building web services.",
      phone: "+855 12 345 678",
      city: "Phnom Penh",
      country: "Cambodia",
      resume_url: "https://example.com/resumes/sarah_candidate.pdf",
    },
  });

  await UserSkill.findOrCreate({
    where: { user_id: seeker1.id, skill_name: "Node.js" },
    defaults: { user_id: seeker1.id, skill_name: "Node.js", level: "ADVANCED" },
  });

  await Education.findOrCreate({
    where: { user_id: seeker1.id, institution: "Institute of Technology of Cambodia" },
    defaults: {
      user_id: seeker1.id,
      institution: "Institute of Technology of Cambodia",
      degree: "Bachelor of Computer Science",
      field_of_study: "Software Engineering",
      start_date: "2018-09-01",
      end_date: "2022-07-01",
    },
  });

  await Experience.findOrCreate({
    where: { user_id: seeker1.id, company_name: "Tech Solutions Cambodia" },
    defaults: {
      user_id: seeker1.id,
      company_name: "Tech Solutions Cambodia",
      position: "Junior Developer",
      employment_type: "FULL_TIME",
      start_date: "2022-08-01",
      end_date: "2024-05-01",
      description: "Built scalable web apps using React and Node.js",
    },
  });

  // Admin
  const adminEmail = `admin_${timestamp}@test.com`;
  const [adminUser] = await User.findOrCreate({
    where: { email: adminEmail },
    defaults: { first_name: "System", last_name: "Admin", email: adminEmail, password_hash: passwordHash },
  });
  await UserRole.findOrCreate({ where: { user_id: adminUser.id, role_id: adminRole.id } });

  // Multi-role User (EMPLOYER + EMPLOYEE)
  const multiEmail = `multi_${timestamp}@test.com`;
  const [multiUser] = await User.findOrCreate({
    where: { email: multiEmail },
    defaults: { first_name: "Multi", last_name: "RoleUser", email: multiEmail, password_hash: passwordHash },
  });
  await UserRole.findOrCreate({ where: { user_id: multiUser.id, role_id: employerRole.id } });
  await UserRole.findOrCreate({ where: { user_id: multiUser.id, role_id: employeeRole.id } });

  console.log("✓ Test users initialized in DB.");

  // 2. LOGIN TESTS & TOKEN RETRIEVAL
  console.log("\n--- 2. Login Tests & Role Token Generation ---");
  const loginEmpA = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: employerAEmail, password: "Password123!" }),
  });
  if (!loginEmpA.ok) throw new Error("Failed to login Employer A");
  const tokenA = loginEmpA.data.data.token;
  console.log("✓ Employer A logged in successfully.");

  const loginEmpB = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: employerBEmail, password: "Password123!" }),
  });
  if (!loginEmpB.ok) throw new Error("Failed to login Employer B");
  const tokenB = loginEmpB.data.data.token;
  console.log("✓ Employer B logged in successfully.");

  const loginSeeker1 = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: seeker1Email, password: "Password123!" }),
  });
  if (!loginSeeker1.ok) throw new Error("Failed to login Job Seeker 1");
  const tokenSeeker1 = loginSeeker1.data.data.token;
  console.log("✓ Job Seeker 1 logged in successfully.");

  const loginSeeker2 = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: seeker2Email, password: "Password123!" }),
  });
  if (!loginSeeker2.ok) throw new Error("Failed to login Job Seeker 2");
  const tokenSeeker2 = loginSeeker2.data.data.token;
  console.log("✓ Job Seeker 2 logged in successfully.");

  const loginAdmin = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: adminEmail, password: "Password123!" }),
  });
  if (!loginAdmin.ok) throw new Error("Failed to login Admin");
  const tokenAdmin = loginAdmin.data.data.token;
  console.log("✓ Admin logged in successfully.");

  const loginMulti = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: multiEmail, password: "Password123!" }),
  });
  if (!loginMulti.ok) throw new Error("Failed to login Multi-role user");
  const multiRoles = loginMulti.data.data.user.roles.map((r) => (typeof r === "string" ? r : r.name));
  if (!multiRoles.includes("EMPLOYER") || !multiRoles.includes("EMPLOYEE")) {
    throw new Error(`Multi-role user missing roles: ${multiRoles.join(", ")}`);
  }
  console.log("✓ Multi-role user logged in, roles:", multiRoles.join(", "));

  // 3. COMPANY CREATION & UPDATE (EMPLOYER A)
  console.log("\n--- 3. Company Management & Ownership Boundaries ---");
  const createCompanyRes = await apiRequest("/companies", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      name: `Alpha Corp ${timestamp}`,
      description: "Leading technology innovation enterprise in Phnom Penh.",
      website: "https://alphacorp.example.com",
      email: `contact@alphacorp${timestamp}.com`,
      phone: "+855 23 999 888",
      address: "123 Norodom Blvd",
      city: "Phnom Penh",
      country: "Cambodia",
      industry: "Software & IT",
      company_size: "51-200",
    }),
  });
  if (!createCompanyRes.ok) throw new Error(`Failed to create company: ${JSON.stringify(createCompanyRes.data)}`);
  const companyA = createCompanyRes.data.data.company;
  console.log("✓ Employer A created Company:", companyA.name, `(ID: ${companyA.id})`);

  // Verify Employer A can view company via GET /companies/my
  const myCompaniesRes = await apiRequest("/companies/my", {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  if (!myCompaniesRes.ok || !myCompaniesRes.data.data.companies.some((c) => c.id === companyA.id)) {
    throw new Error("Company A not found in Employer A my companies list");
  }
  console.log("✓ GET /api/companies/my verified for Employer A.");

  // Employer A updates Company A -> Allowed (200)
  const updateCompanyA = await apiRequest(`/companies/${companyA.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ description: "Updated description for Alpha Corp" }),
  });
  if (!updateCompanyA.ok) throw new Error(`Employer A failed to update own company: ${JSON.stringify(updateCompanyA.data)}`);
  console.log("✓ SECURITY TEST PASS: Employer A updated own company successfully.");

  // Employer B attempts to update Company A -> 403 Forbidden
  const badCompanyUpdate = await apiRequest(`/companies/${companyA.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ description: "Hacked by Employer B" }),
  });
  if (badCompanyUpdate.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B got status ${badCompanyUpdate.status} instead of 403`);
  }
  console.log("✓ SECURITY TEST PASS: Employer B updating Company A blocked with 403 Forbidden.");

  // Admin updates Company A -> Allowed
  const adminCompanyUpdate = await apiRequest(`/companies/${companyA.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${tokenAdmin}` },
    body: JSON.stringify({ address: "123 Norodom Blvd, Suite 400" }),
  });
  if (!adminCompanyUpdate.ok) throw new Error("Admin failed to update Company A");
  console.log("✓ SECURITY TEST PASS: Admin update Company A allowed.");

  // 4. JOB CREATION & DRAFT BEHAVIOR
  console.log("\n--- 4. Job Creation, Ownership & Visibility ---");
  // Employer B attempts to create job for Company A -> 403 Forbidden
  const badJobCreate = await apiRequest("/jobs", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      company_id: companyA.id,
      title: "Unauthorized Job Title",
      description: "This should be blocked by backend authorization.",
      employment_type: "FULL_TIME",
      location: "Phnom Penh",
    }),
  });
  if (badJobCreate.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B created job for Company A! Status: ${badJobCreate.status}`);
  }
  console.log("✓ SECURITY TEST PASS: Employer B creating job for Company A blocked with 403 Forbidden.");

  // Employer A creates job as DRAFT
  const createJobRes = await apiRequest("/jobs", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      company_id: companyA.id,
      title: `Senior Backend Engineer ${timestamp}`,
      description: "We are seeking an experienced Node.js backend developer to join our growing tech team in Phnom Penh.",
      requirements: "4+ years Node.js, PostgreSQL, Docker, Redis",
      responsibilities: "Architect backend APIs, lead database design, mentor junior devs",
      employment_type: "FULL_TIME",
      experience_level: "SENIOR",
      salary_min: 2000,
      salary_max: 3500,
      salary_currency: "USD",
      location: "Phnom Penh",
      is_remote: true,
      status: "DRAFT",
    }),
  });
  if (!createJobRes.ok) throw new Error(`Employer A failed to create job: ${JSON.stringify(createJobRes.data)}`);
  const jobA = createJobRes.data.data.job;
  console.log("✓ Employer A created job in DRAFT status:", jobA.title, `(ID: ${jobA.id})`);

  // 5. JOB SKILLS MANAGEMENT & SECURITY
  console.log("\n--- 5. Job Skills Management & Boundaries ---");
  // Employer A adds required skill -> 201
  const addSkill1 = await apiRequest(`/jobs/${jobA.id}/skills`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ skill_name: "Node.js", is_required: true }),
  });
  if (!addSkill1.ok) throw new Error(`Failed to add skill: ${JSON.stringify(addSkill1.data)}`);
  const skillNode = addSkill1.data.data.skill;
  console.log("✓ Employer A added required skill: Node.js");

  // Employer A adds preferred skill -> 201
  const addSkill2 = await apiRequest(`/jobs/${jobA.id}/skills`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ skill_name: "PostgreSQL", is_required: false }),
  });
  if (!addSkill2.ok) throw new Error("Failed to add preferred skill");
  const skillPg = addSkill2.data.data.skill;
  console.log("✓ Employer A added preferred skill: PostgreSQL");

  // Employer B attempts to add skill to Job A -> 403 Forbidden
  const badAddSkill = await apiRequest(`/jobs/${jobA.id}/skills`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ skill_name: "Hacking", is_required: true }),
  });
  if (badAddSkill.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B added skill to Job A! Status: ${badAddSkill.status}`);
  }
  console.log("✓ SECURITY TEST PASS: Employer B adding skill to Job A blocked with 403 Forbidden.");

  // Employer B attempts to delete skill from Job A -> 403 Forbidden
  const badDeleteSkill = await apiRequest(`/jobs/${jobA.id}/skills/${skillPg.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  if (badDeleteSkill.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B deleted skill from Job A! Status: ${badDeleteSkill.status}`);
  }
  console.log("✓ SECURITY TEST PASS: Employer B deleting skill from Job A blocked with 403 Forbidden.");

  // Public/all can view skills for Job A
  const getSkillsRes = await apiRequest(`/jobs/${jobA.id}/skills`);
  if (!getSkillsRes.ok || getSkillsRes.data.data.skills.length < 2) {
    throw new Error("Failed to retrieve skills for job");
  }
  console.log("✓ GET /api/jobs/:id/skills verified, count:", getSkillsRes.data.data.skills.length);

  // 6. DRAFT JOB VISIBILITY TEST
  console.log("\n--- 6. Public Visibility Check for DRAFT Job ---");
  const publicJobsDraft = await apiRequest("/jobs");
  const draftFoundInPublic = publicJobsDraft.data.data.jobs.some((j) => j.id === jobA.id);
  if (draftFoundInPublic) {
    throw new Error("CRITICAL BUG: DRAFT job is visible in public GET /api/jobs listing!");
  }
  console.log("✓ DRAFT job confirmed NOT visible in public job listings.");

  // Employer A sees the draft in GET /api/jobs/my
  const myJobsRes = await apiRequest("/jobs/my", {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  if (!myJobsRes.ok || !myJobsRes.data.data.jobs.some((j) => j.id === jobA.id)) {
    throw new Error("DRAFT job not found in Employer A's GET /api/jobs/my");
  }
  console.log("✓ DRAFT job confirmed visible in Employer A's GET /api/jobs/my.");

  // Employer B does NOT see Employer A's job in GET /api/jobs/my
  const employerBJobsRes = await apiRequest("/jobs/my", {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  if (employerBJobsRes.data.data.jobs.some((j) => j.id === jobA.id)) {
    throw new Error("CRITICAL BUG: Employer B saw Employer A's job in /api/jobs/my!");
  }
  console.log("✓ SECURITY TEST PASS: Employer B's /api/jobs/my isolates only their own jobs.");

  // 7. PUBLISHING THE JOB
  console.log("\n--- 7. Publishing Job & Verifying Public Availability ---");
  // Employer B attempts to publish Job A -> 403 Forbidden
  const badPublish = await apiRequest(`/jobs/${jobA.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ status: "PUBLISHED" }),
  });
  if (badPublish.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B published Job A! Status: ${badPublish.status}`);
  }
  console.log("✓ SECURITY TEST PASS: Employer B cannot publish Job A (403 Forbidden).");

  // Employer A publishes Job A -> Allowed (200)
  const publishRes = await apiRequest(`/jobs/${jobA.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: "PUBLISHED" }),
  });
  if (!publishRes.ok) throw new Error("Employer A failed to publish job");
  console.log("✓ Employer A published Job A successfully.");

  // Check public portal: Job A MUST appear now
  const publicJobsPublished = await apiRequest("/jobs");
  const publishedFoundInPublic = publicJobsPublished.data.data.jobs.some((j) => j.id === jobA.id);
  if (!publishedFoundInPublic) {
    throw new Error("BUG: PUBLISHED job did NOT appear in public GET /api/jobs listing!");
  }
  console.log("✓ PUBLISHED job successfully appeared in public job marketplace.");

  // 8. JOB SEEKER APPLICATION PIPELINE
  console.log("\n--- 8. Job Seeker Applications & Pipeline Progression ---");
  // Seeker 1 applies to Job A
  const apply1Res = await apiRequest(`/applications/jobs/${jobA.id}/apply`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenSeeker1}` },
    body: JSON.stringify({
      cover_letter: "I am thrilled to apply for the Senior Backend Engineer position at Alpha Corp. I have strong experience in Node.js and PostgreSQL.",
      cv_url: "https://example.com/resumes/sarah_candidate.pdf",
    }),
  });
  if (!apply1Res.ok) throw new Error(`Seeker 1 application failed: ${JSON.stringify(apply1Res.data)}`);
  const app1 = apply1Res.data.data.application;
  console.log("✓ Job Seeker 1 applied successfully, initial status:", app1.status, `(App ID: ${app1.id})`);

  // Seeker 2 applies to Job A (for Rejection test later)
  const apply2Res = await apiRequest(`/applications/jobs/${jobA.id}/apply`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenSeeker2}` },
    body: JSON.stringify({
      cover_letter: "Application from candidate 2.",
    }),
  });
  if (!apply2Res.ok) throw new Error(`Seeker 2 application failed: ${JSON.stringify(apply2Res.data)}`);
  const app2 = apply2Res.data.data.application;
  console.log("✓ Job Seeker 2 applied successfully (App ID: ${app2.id})");

  // 9. APPLICANT LIST & DETAILS AUTHORIZATION BOUNDARIES
  console.log("\n--- 9. Applicant List & Details Security Boundaries ---");
  // Employer B attempts to view applicants for Job A -> 403 Forbidden
  const badGetApplicants = await apiRequest(`/applications/job/${jobA.id}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  if (badGetApplicants.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B accessed Job A applicants! Status: ${badGetApplicants.status}`);
  }
  console.log("✓ SECURITY TEST PASS: Employer B viewing Job A applicants blocked with 403 Forbidden.");

  // Employer B attempts to view Applicant 1 Details -> 403 Forbidden
  const badGetApplicantDetails = await apiRequest(`/applications/${app1.id}/applicant`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  if (badGetApplicantDetails.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B accessed Applicant Details! Status: ${badGetApplicantDetails.status}`);
  }
  console.log("✓ SECURITY TEST PASS: Employer B accessing Applicant Details directly blocked with 403 Forbidden.");

  // Employer A views applicants for Job A -> Allowed (200)
  const getJobApplicantsRes = await apiRequest(`/applications/job/${jobA.id}`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  if (!getJobApplicantsRes.ok || getJobApplicantsRes.data.data.applications.length < 2) {
    throw new Error("Employer A failed to load applicants for Job A");
  }
  console.log("✓ Employer A retrieved applicants list, total count:", getJobApplicantsRes.data.data.applications.length);

  // Employer A views Applicant 1 Details -> Allowed (200)
  const getAppDetailsRes = await apiRequest(`/applications/${app1.id}/applicant`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  if (!getAppDetailsRes.ok) throw new Error("Employer A failed to get applicant details");
  const appDetails = getAppDetailsRes.data.data.application;
  console.log("✓ Employer A retrieved candidate details successfully:");
  console.log(`  - Candidate Name: ${appDetails.applicant.first_name} ${appDetails.applicant.last_name}`);
  console.log(`  - Professional Title: ${appDetails.applicant.UserProfile?.professional_title}`);
  console.log(`  - Phone: ${appDetails.applicant.UserProfile?.phone}`);
  console.log(`  - Skills count: ${appDetails.applicant.UserSkills?.length || 0}`);
  console.log(`  - Experience count: ${appDetails.applicant.Experiences?.length || 0}`);
  console.log(`  - Education count: ${(appDetails.applicant.Education || appDetails.applicant.Educations)?.length || 0}`);
  console.log(`  - Resume URL: ${appDetails.cv_url || appDetails.applicant.UserProfile?.resume_url}`);

  // 10. STATUS ADVANCEMENT PIPELINE
  console.log("\n--- 10. Status Advancement Pipeline ---");
  // Employer B attempts to update status -> 403 Forbidden
  const badStatusUpdate = await apiRequest(`/applications/${app1.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ status: "REVIEWING" }),
  });
  if (badStatusUpdate.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Employer B updated application status! Status: ${badStatusUpdate.status}`);
  }
  console.log("✓ SECURITY TEST PASS: Employer B updating application status blocked with 403 Forbidden.");

  // Step 1: PENDING -> REVIEWING
  const updateToReviewing = await apiRequest(`/applications/${app1.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: "REVIEWING" }),
  });
  if (!updateToReviewing.ok) throw new Error("Failed to update status to REVIEWING");
  console.log("✓ Employer A advanced status: PENDING → REVIEWING");

  // Verify Job Seeker 1 sees REVIEWING in GET /api/applications/my
  const seekerApps1 = await apiRequest("/applications/my", {
    headers: { Authorization: `Bearer ${tokenSeeker1}` },
  });
  const myApp1 = seekerApps1.data.data.applications.find((a) => a.id === app1.id);
  if (!myApp1 || myApp1.status !== "REVIEWING") {
    throw new Error(`Seeker application did not reflect REVIEWING status: ${myApp1?.status}`);
  }
  console.log("✓ Job Seeker portal confirmed status is REVIEWING.");

  // Step 2: REVIEWING -> INTERVIEW
  const updateToInterview = await apiRequest(`/applications/${app1.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: "INTERVIEW" }),
  });
  if (!updateToInterview.ok) throw new Error("Failed to update status to INTERVIEW");
  console.log("✓ Employer A advanced status: REVIEWING → INTERVIEW");

  // Verify Job Seeker 1 sees INTERVIEW
  const seekerApps2 = await apiRequest("/applications/my", {
    headers: { Authorization: `Bearer ${tokenSeeker1}` },
  });
  const myApp2 = seekerApps2.data.data.applications.find((a) => a.id === app1.id);
  if (!myApp2 || myApp2.status !== "INTERVIEW") {
    throw new Error(`Seeker application did not reflect INTERVIEW status: ${myApp2?.status}`);
  }
  console.log("✓ Job Seeker portal confirmed status is INTERVIEW.");

  // Step 3: INTERVIEW -> ACCEPTED
  const updateToAccepted = await apiRequest(`/applications/${app1.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: "ACCEPTED" }),
  });
  if (!updateToAccepted.ok) throw new Error("Failed to update status to ACCEPTED");
  console.log("✓ Employer A advanced status: INTERVIEW → ACCEPTED");

  // Verify Job Seeker 1 sees ACCEPTED
  const seekerApps3 = await apiRequest("/applications/my", {
    headers: { Authorization: `Bearer ${tokenSeeker1}` },
  });
  const myApp3 = seekerApps3.data.data.applications.find((a) => a.id === app1.id);
  if (!myApp3 || myApp3.status !== "ACCEPTED") {
    throw new Error(`Seeker application did not reflect ACCEPTED status: ${myApp3?.status}`);
  }
  console.log("✓ Job Seeker portal confirmed status is ACCEPTED.");

  // Step 4: Reject Candidate 2 (App 2)
  const updateToRejected = await apiRequest(`/applications/${app2.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: "REJECTED" }),
  });
  if (!updateToRejected.ok) throw new Error("Failed to update status to REJECTED");
  console.log("✓ Employer A updated Candidate 2 status: PENDING → REJECTED");

  // 11. CLOSE JOB & VERIFY DELISTING FROM MARKETPLACE
  console.log("\n--- 11. Closing Job & Delisting from Public Portal ---");
  const closeJobRes = await apiRequest(`/jobs/${jobA.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: "CLOSED" }),
  });
  if (!closeJobRes.ok) throw new Error("Failed to close job");
  console.log("✓ Employer A closed job successfully.");

  // Confirm closed job does NOT appear publicly
  const publicJobsAfterClose = await apiRequest("/jobs");
  const closedFoundInPublic = publicJobsAfterClose.data.data.jobs.some((j) => j.id === jobA.id);
  if (closedFoundInPublic) {
    throw new Error("CRITICAL BUG: CLOSED job is still visible in public GET /api/jobs listing!");
  }
  console.log("✓ CLOSED job confirmed completely delisted from public job marketplace.");

  // 12. EMPLOYER DASHBOARD APPLICANT METRICS VERIFICATION
  console.log("\n--- 12. Verifying Real Aggregation in Employer Dashboard Query ---");
  const employerJobsWithApps = await apiRequest("/jobs/my", {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const testJobInMy = employerJobsWithApps.data.data.jobs.find((j) => j.id === jobA.id);
  if (!testJobInMy || !testJobInMy.Applications || testJobInMy.Applications.length !== 2) {
    throw new Error("GET /api/jobs/my did not include applications aggregation array!");
  }
  const acceptedInJob = testJobInMy.Applications.filter((a) => a.status === "ACCEPTED").length;
  const rejectedInJob = testJobInMy.Applications.filter((a) => a.status === "REJECTED").length;
  if (acceptedInJob !== 1 || rejectedInJob !== 1) {
    throw new Error(`Metrics mismatch: expected 1 accepted & 1 rejected, got ${acceptedInJob} and ${rejectedInJob}`);
  }
  console.log("✓ Employer Dashboard data verified: Real applicant counts match exactly (1 ACCEPTED, 1 REJECTED).");

  console.log("\n==================================================");
  console.log("ALL E2E, SECURITY & RECRUITMENT TESTS PASSED 100%!");
  console.log("==================================================\n");

  process.exit(0);
}

runTests().catch((err) => {
  console.error("\n❌ TEST SUITE FAILED:", err.message);
  process.exit(1);
});
