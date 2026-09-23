// test_notification_flow.js
require("dotenv").config();
const assert = require("assert");

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

async function runNotificationTestSuite() {
  console.log("==================================================");
  console.log("STARTING IN-APP NOTIFICATIONS E2E & SECURITY SUITE");
  console.log("==================================================\n");

  const timestamp = Date.now();
  const {
    User,
    Role,
    UserRole,
    Company,
    Job,
    Application,
    Interview,
    EmploymentRecord,
    EmployeeProfile,
    LeaveType,
    LeaveRequest,
    Notification,
    CompanyUserRole,
  } = require("./src/models");
  const bcrypt = require("bcryptjs");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Sync Notification model safely
  await Notification.sync({ alter: true });
  console.log("✓ Notification model and database table verified.");

  // Roles
  const adminRole = await Role.findOne({ where: { name: "ADMIN" } });
  const employerRole = await Role.findOne({ where: { name: "EMPLOYER" } });
  const employeeRole = await Role.findOne({ where: { name: "EMPLOYEE" } });
  const jobSeekerRole = await Role.findOne({ where: { name: "JOB_SEEKER" } });
  const recruiterRole = await Role.findOne({ where: { name: "RECRUITER" } });
  const hrRole = await Role.findOne({ where: { name: "HR" } });

  // 1. SETUP TEST ACTORS
  console.log("\n--- 1. Setting up Test Actors ---");
  async function createActor(prefix, roleRecord) {
    const email = `${prefix}_${timestamp}@test.com`;
    const [user] = await User.findOrCreate({
      where: { email },
      defaults: {
        first_name: prefix.toUpperCase(),
        last_name: "Tester",
        email,
        password_hash: passwordHash,
      },
    });
    if (roleRecord) {
      await UserRole.findOrCreate({
        where: { user_id: user.id, role_id: roleRecord.id },
      });
    }

    const loginRes = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: "Password123!" }),
    });
    assert(loginRes.ok, `Login failed for ${email}`);
    return { user, token: loginRes.data.data.token, email };
  }

  const empA = await createActor("notif_emp_a", employerRole);
  const empB = await createActor("notif_emp_b", employerRole);
  const recruiterA = await createActor("notif_recruiter_a", employeeRole);
  const hrA = await createActor("notif_hr_a", employeeRole);
  const candidateA = await createActor("notif_candidate_a", jobSeekerRole);
  const employeeA = await createActor("notif_worker_a", employeeRole);

  console.log("✓ All 6 actors created and authenticated.");

  // 2. SETUP COMPANIES & ROLES
  console.log("\n--- 2. Setting up Companies, Roles & Employment ---");
  const compARes = await apiRequest("/companies", {
    method: "POST",
    headers: { Authorization: `Bearer ${empA.token}` },
    body: JSON.stringify({
      name: `Sakol Media ${timestamp}`,
      industry: "Technology",
      city: "Phnom Penh",
      country: "Cambodia",
    }),
  });
  assert(compARes.ok, "Company A created");
  const companyA = compARes.data.data.company;

  const compBRes = await apiRequest("/companies", {
    method: "POST",
    headers: { Authorization: `Bearer ${empB.token}` },
    body: JSON.stringify({
      name: `Delta Corp ${timestamp}`,
      industry: "Finance",
      city: "Siem Reap",
      country: "Cambodia",
    }),
  });
  assert(compBRes.ok, "Company B created");
  const companyB = compBRes.data.data.company;

  // Assign Recruiter A and HR A in Company A
  await CompanyUserRole.create({
    user_id: recruiterA.user.id,
    company_id: companyA.id,
    role_id: recruiterRole.id,
    created_by: empA.user.id,
  });
  await CompanyUserRole.create({
    user_id: hrA.user.id,
    company_id: companyA.id,
    role_id: hrRole.id,
    created_by: empA.user.id,
  });

  // Employee A active employment in Company A
  await EmploymentRecord.create({
    user_id: employeeA.user.id,
    company_id: companyA.id,
    status: "ACTIVE",
    start_date: new Date(),
  });

  console.log("✓ Companies, employment, and company-scoped roles configured.");

  // 3. EVENT 1: APPLICATION SUBMITTED
  console.log("\n--- 3. Testing Job Application Trigger (APPLICATION_RECEIVED) ---");
  const jobARes = await apiRequest("/jobs", {
    method: "POST",
    headers: { Authorization: `Bearer ${empA.token}` },
    body: JSON.stringify({
      company_id: companyA.id,
      title: "Senior Full Stack Architect",
      description: "High-scale distributed systems development for Cambodia.",
      location: "Phnom Penh",
      employment_type: "FULL_TIME",
      experience_level: "SENIOR",
    }),
  });
  assert(jobARes.ok, "Job A created");
  const jobA = jobARes.data.data.job;

  // Publish Job A
  await apiRequest(`/jobs/${jobA.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${empA.token}` },
    body: JSON.stringify({ status: "PUBLISHED" }),
  });

  // Candidate A applies to Job A
  const applyRes = await apiRequest(`/applications/jobs/${jobA.id}/apply`, {
    method: "POST",
    headers: { Authorization: `Bearer ${candidateA.token}` },
    body: JSON.stringify({ cover_letter: "Excited to apply!" }),
  });
  assert(applyRes.ok, "Candidate A applied to Job A");
  const applicationA = applyRes.data.data.application;

  // Check Employer A notifications
  const empANotifs = await apiRequest("/notifications", {
    headers: { Authorization: `Bearer ${empA.token}` },
  });
  assert(empANotifs.ok, "Employer A fetched notifications");
  const empAAppNotif = empANotifs.data.data.notifications.find(
    (n) => n.type === "APPLICATION_RECEIVED" && n.metadata?.job_id === jobA.id
  );
  assert(empAAppNotif, "PASS: Employer A received APPLICATION_RECEIVED notification");
  console.log("✓ Employer A received:", empAAppNotif.title, "-", empAAppNotif.message);

  // Check Recruiter A notifications
  const recruiterNotifs = await apiRequest("/notifications", {
    headers: { Authorization: `Bearer ${recruiterA.token}` },
  });
  const recruiterAppNotif = recruiterNotifs.data.data.notifications.find(
    (n) => n.type === "APPLICATION_RECEIVED" && n.metadata?.job_id === jobA.id
  );
  assert(recruiterAppNotif, "PASS: Recruiter A received APPLICATION_RECEIVED notification");
  console.log("✓ Recruiter A received:", recruiterAppNotif.title);

  // Check Employer B (outsider) notifications -> MUST NOT receive anything
  const empBNotifs = await apiRequest("/notifications", {
    headers: { Authorization: `Bearer ${empB.token}` },
  });
  const leakedAppNotif = empBNotifs.data.data.notifications.find(
    (n) => n.metadata?.job_id === jobA.id
  );
  assert(!leakedAppNotif, "SECURITY PASS: Employer B received NO notification for Company A application!");

  // 4. EVENT 2: APPLICATION STATUS CHANGE
  console.log("\n--- 4. Testing Application Status Progression Trigger ---");
  await apiRequest(`/applications/${applicationA.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${recruiterA.token}` },
    body: JSON.stringify({ status: "REVIEWING" }),
  });

  const candNotifsAfterReview = await apiRequest("/notifications", {
    headers: { Authorization: `Bearer ${candidateA.token}` },
  });
  const statusNotif = candNotifsAfterReview.data.data.notifications.find(
    (n) => n.type === "APPLICATION_STATUS_CHANGED" && n.metadata?.status === "REVIEWING"
  );
  assert(statusNotif, "PASS: Candidate A received APPLICATION_STATUS_CHANGED notification");
  console.log("✓ Candidate A received status update:", statusNotif.title, "-", statusNotif.message);

  // 5. EVENT 3: INTERVIEW TRIGGERS (SCHEDULE, RESCHEDULE, CANCEL)
  console.log("\n--- 5. Testing Interview Triggers (Scheduled, Rescheduled, Cancelled) ---");
  const schedDate = new Date(Date.now() + 86400000).toISOString();
  const scheduleRes = await apiRequest("/interviews", {
    method: "POST",
    headers: { Authorization: `Bearer ${recruiterA.token}` },
    body: JSON.stringify({
      application_id: applicationA.id,
      scheduled_at: schedDate,
      duration_minutes: 45,
      interview_type: "VIDEO",
      meeting_link: "https://meet.google.com/sakol-interview-room",
    }),
  });
  assert(scheduleRes.ok, "Interview scheduled");
  const interviewA = scheduleRes.data.data.interview;

  // Candidate receives INTERVIEW_SCHEDULED
  const candSchedNotifs = await apiRequest("/notifications", {
    headers: { Authorization: `Bearer ${candidateA.token}` },
  });
  const schedNotif = candSchedNotifs.data.data.notifications.find(
    (n) => n.type === "INTERVIEW_SCHEDULED" && n.metadata?.interview_id === interviewA.id
  );
  assert(schedNotif, "PASS: Candidate A received INTERVIEW_SCHEDULED notification");
  console.log("✓ Candidate A received:", schedNotif.title, "-", schedNotif.message);

  // Recruiter reschedules interview
  const reschedDate = new Date(Date.now() + 172800000).toISOString();
  await apiRequest(`/interviews/${interviewA.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${recruiterA.token}` },
    body: JSON.stringify({ scheduled_at: reschedDate }),
  });

  const candReschedNotifs = await apiRequest("/notifications", {
    headers: { Authorization: `Bearer ${candidateA.token}` },
  });
  const reschedNotif = candReschedNotifs.data.data.notifications.find(
    (n) => n.type === "INTERVIEW_RESCHEDULED" && n.metadata?.interview_id === interviewA.id
  );
  assert(reschedNotif, "PASS: Candidate A received INTERVIEW_RESCHEDULED notification");
  console.log("✓ Candidate A received:", reschedNotif.title);

  // Recruiter cancels interview
  await apiRequest(`/interviews/${interviewA.id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${recruiterA.token}` },
  });

  const candCancelNotifs = await apiRequest("/notifications", {
    headers: { Authorization: `Bearer ${candidateA.token}` },
  });
  const cancelNotif = candCancelNotifs.data.data.notifications.find(
    (n) => n.type === "INTERVIEW_CANCELLED" && n.metadata?.interview_id === interviewA.id
  );
  assert(cancelNotif, "PASS: Candidate A received INTERVIEW_CANCELLED notification");
  console.log("✓ Candidate A received:", cancelNotif.title);

  // 6. EVENT 4: CANDIDATE HIRING
  console.log("\n--- 6. Testing Hiring Conversion Trigger (CANDIDATE_HIRED) ---");
  // Update status to ACCEPTED
  await apiRequest(`/applications/${applicationA.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${empA.token}` },
    body: JSON.stringify({ status: "ACCEPTED" }),
  });

  // Execute hiring conversion
  const hireRes = await apiRequest(`/applications/${applicationA.id}/hire`, {
    method: "POST",
    headers: { Authorization: `Bearer ${empA.token}` },
    body: JSON.stringify({ department: "Engineering", job_title: "Staff Engineer" }),
  });
  assert(hireRes.ok, "Candidate A hired successfully");

  const candHiredNotifs = await apiRequest("/notifications", {
    headers: { Authorization: `Bearer ${candidateA.token}` },
  });
  const hiredNotif = candHiredNotifs.data.data.notifications.find(
    (n) => n.type === "CANDIDATE_HIRED" && n.metadata?.application_id === applicationA.id
  );
  assert(hiredNotif, "PASS: Candidate A received CANDIDATE_HIRED notification");
  assert(hiredNotif.link === "/employee/dashboard", "Notification link points to employee dashboard");
  console.log("✓ Candidate A received:", hiredNotif.title, "-", hiredNotif.message);

  // 7. EVENT 5: LEAVE MANAGEMENT TRIGGERS
  console.log("\n--- 7. Testing Leave Management Triggers ---");
  // Setup leave type
  const leaveTypeRes = await apiRequest("/leave/types", {
    method: "POST",
    headers: { Authorization: `Bearer ${empA.token}` },
    body: JSON.stringify({
      companyId: companyA.id,
      name: "Annual Paid Vacation",
      default_days: 18,
      is_paid: true,
    }),
  });
  assert(leaveTypeRes.ok, "Leave type created");
  const leaveTypeA = leaveTypeRes.data.data;

  // Employee A requests leave
  const leaveReqRes = await apiRequest("/leave/requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${employeeA.token}` },
    body: JSON.stringify({
      company_id: companyA.id,
      leave_type_id: leaveTypeA.id,
      start_date: "2026-12-20",
      end_date: "2026-12-25",
      reason: "Year-end vacation trip",
    }),
  });
  assert(leaveReqRes.ok, "Employee A submitted leave request");
  const leaveReqA = leaveReqRes.data.data;

  // Check HR A notifications -> LEAVE_REQUESTED
  const hrNotifs = await apiRequest("/notifications", {
    headers: { Authorization: `Bearer ${hrA.token}` },
  });
  const leaveReqNotif = hrNotifs.data.data.notifications.find(
    (n) => n.type === "LEAVE_REQUESTED" && n.metadata?.leave_request_id === leaveReqA.id
  );
  assert(leaveReqNotif, "PASS: HR A received LEAVE_REQUESTED notification");
  console.log("✓ HR A received:", leaveReqNotif.title, "-", leaveReqNotif.message);

  // HR A approves leave request
  const approveRes = await apiRequest(`/leave/requests/${leaveReqA.id}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${hrA.token}` },
    body: JSON.stringify({ companyId: companyA.id, review_note: "Enjoy your holiday!" }),
  });
  assert(approveRes.ok, "Leave request approved");

  // Employee A receives LEAVE_APPROVED
  const empALeaveNotifs = await apiRequest("/notifications", {
    headers: { Authorization: `Bearer ${employeeA.token}` },
  });
  const leaveApprovedNotif = empALeaveNotifs.data.data.notifications.find(
    (n) => n.type === "LEAVE_APPROVED" && n.metadata?.leave_request_id === leaveReqA.id
  );
  assert(leaveApprovedNotif, "PASS: Employee A received LEAVE_APPROVED notification");
  console.log("✓ Employee A received:", leaveApprovedNotif.title, "-", leaveApprovedNotif.message);

  // Employee A submits second request and cancels it
  const leaveReq2Res = await apiRequest("/leave/requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${employeeA.token}` },
    body: JSON.stringify({
      company_id: companyA.id,
      leave_type_id: leaveTypeA.id,
      start_date: "2026-11-10",
      end_date: "2026-11-12",
      reason: "Dental appointment",
    }),
  });
  assert(leaveReq2Res.ok, "Second leave request submitted");
  const leaveReq2 = leaveReq2Res.data.data;

  await apiRequest(`/leave/requests/${leaveReq2.id}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${employeeA.token}` },
  });

  // HR A receives LEAVE_CANCELLED
  const hrNotifsAfterCancel = await apiRequest("/notifications", {
    headers: { Authorization: `Bearer ${hrA.token}` },
  });
  const cancelLeaveNotif = hrNotifsAfterCancel.data.data.notifications.find(
    (n) => n.type === "LEAVE_CANCELLED" && n.metadata?.leave_request_id === leaveReq2.id
  );
  assert(cancelLeaveNotif, "PASS: HR A received LEAVE_CANCELLED notification");
  console.log("✓ HR A received:", cancelLeaveNotif.title);

  // 8. UNREAD COUNT, MARK READ, AND MARK ALL READ
  console.log("\n--- 8. Testing Notification APIs (Unread Count, Mark Read, Mark All) ---");
  const initialUnread = await apiRequest("/notifications/unread-count", {
    headers: { Authorization: `Bearer ${candidateA.token}` },
  });
  assert(initialUnread.ok && initialUnread.data.data.unreadCount > 0, "Candidate A has unread notifications");
  const countBefore = initialUnread.data.data.unreadCount;
  console.log("✓ Initial Candidate unread count:", countBefore);

  // Mark single notification as read
  const markRes = await apiRequest(`/notifications/${hiredNotif.id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${candidateA.token}` },
  });
  assert(markRes.ok && markRes.data.data.notification.is_read === true, "Notification marked read");

  const unreadAfterSingle = await apiRequest("/notifications/unread-count", {
    headers: { Authorization: `Bearer ${candidateA.token}` },
  });
  assert(unreadAfterSingle.data.data.unreadCount === countBefore - 1, "Unread count decremented by 1");
  console.log("✓ Unread count after single read:", unreadAfterSingle.data.data.unreadCount);

  // Mark all read
  const markAllRes = await apiRequest("/notifications/read-all", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${candidateA.token}` },
  });
  assert(markAllRes.ok, "Mark all read succeeded");

  const unreadAfterAll = await apiRequest("/notifications/unread-count", {
    headers: { Authorization: `Bearer ${candidateA.token}` },
  });
  assert(unreadAfterAll.data.data.unreadCount === 0, "PASS: All notifications marked as read (count: 0)");
  console.log("✓ Final unread count:", unreadAfterAll.data.data.unreadCount);

  // 9. SECURITY & USER ISOLATION
  console.log("\n--- 9. Direct API Security & User Isolation ---");
  // Candidate A attempts to mark HR A's notification as read -> 404
  const crossMarkRes = await apiRequest(`/notifications/${leaveReqNotif.id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${candidateA.token}` },
  });
  assert(crossMarkRes.status === 404, "SECURITY PASS: Cross-user notification manipulation blocked (404)");

  // Unauthenticated request -> 401
  const unauthRes = await apiRequest("/notifications");
  assert(unauthRes.status === 401, "SECURITY PASS: Unauthenticated access blocked (401)");

  // 10. IDEMPOTENCY & DUPLICATE PREVENTION
  console.log("\n--- 10. Testing Idempotency & Duplicate Prevention ---");
  // Repeating status update to REVIEWING again should not produce duplicate notification
  const preCount = (
    await apiRequest("/notifications", { headers: { Authorization: `Bearer ${candidateA.token}` } })
  ).data.data.notifications.length;

  await apiRequest(`/applications/${applicationA.id}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${recruiterA.token}` },
    body: JSON.stringify({ status: "ACCEPTED" }), // already ACCEPTED
  });

  const postCount = (
    await apiRequest("/notifications", { headers: { Authorization: `Bearer ${candidateA.token}` } })
  ).data.data.notifications.length;

  assert(preCount === postCount, "PASS: Duplicate notification prevented on identical state transition");
  console.log("✓ Idempotency verified: Notification count unchanged on repeated state.");

  console.log("\n==================================================");
  console.log("ALL IN-APP NOTIFICATIONS E2E & SECURITY TESTS PASSED!");
  console.log("==================================================");
}

runNotificationTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ TEST SUITE ABORTED DUE TO ERROR:", err);
    process.exit(1);
  });
