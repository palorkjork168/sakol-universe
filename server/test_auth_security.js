// test_auth_security.js
require("dotenv").config();
const BASE_URL = "http://127.0.0.1:5000/api";
const { User, Role, UserRole, Company } = require("./src/models");
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

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✓ ${message}`);
}

async function runAuthSecuritySuite() {
  console.log("==================================================");
  console.log("STARTING AUTH, VALIDATION & SECURITY QA SUITE");
  console.log("==================================================\n");

  const timestamp = Date.now();
  const passwordHash = await bcrypt.hash("Password123!", 10);

  try {
    // ----------------------------------------------------
    // 1. Health Probe & 404 Routing
    // ----------------------------------------------------
    console.log("--- 1. Testing Health Probe & JSON 404 Handling ---");
    const healthRes = await apiRequest("/health");
    assert(healthRes.status === 200, "GET /api/health returned 200 OK");
    assert(healthRes.data.status === "ok", "Health status is 'ok'");
    assert(healthRes.data.database === "connected", "Database probe is 'connected'");

    const notFoundRes = await apiRequest("/non-existent-api-endpoint-404");
    assert(notFoundRes.status === 404, "Unknown endpoint returns 404");
    assert(notFoundRes.data.success === false, "Unknown endpoint returns JSON success: false");
    assert(typeof notFoundRes.data.message === "string", "Unknown endpoint returns JSON error message");

    // ----------------------------------------------------
    // 2. Registration Validation & Constraints
    // ----------------------------------------------------
    console.log("\n--- 2. Testing Registration Hardening ---");
    const validEmail = `sec_user_${timestamp}@test.com`;

    // A. Valid Registration
    const regRes = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: "Security",
        last_name: "Tester",
        email: validEmail,
        password: "SecurePassword123!",
        role: "JOB_SEEKER",
      }),
    });
    assert(regRes.status === 201, `Valid registration succeeded (201 Created)`);
    assert(regRes.data.data.user.id, "User ID returned upon registration");
    assert(!regRes.data.data.user.password_hash, "SECURITY: password_hash is NEVER returned in response");

    // B. Duplicate Registration
    const dupRegRes = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: "Security",
        last_name: "Duplicate",
        email: validEmail,
        password: "SecurePassword123!",
      }),
    });
    assert(dupRegRes.status === 400 || dupRegRes.status === 409, "Duplicate email rejected (400/409)");

    // C. Malformed / Invalid Emails
    const invalidEmailRes = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: "Bad",
        last_name: "Email",
        email: "not-an-email",
        password: "SecurePassword123!",
      }),
    });
    assert(invalidEmailRes.status === 400, "Malformed email rejected with 400 Bad Request");

    // D. Missing Password
    const missingPassRes = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: "No",
        last_name: "Pass",
        email: `nopass_${timestamp}@test.com`,
      }),
    });
    assert(missingPassRes.status === 400, "Missing password rejected with 400 Bad Request");

    // ----------------------------------------------------
    // 3. Login Security & Credential Protection
    // ----------------------------------------------------
    console.log("\n--- 3. Testing Login Security ---");

    // A. Valid Login
    const loginRes = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: validEmail,
        password: "SecurePassword123!",
      }),
    });
    assert(loginRes.status === 200, "Valid login returned 200 OK");
    const userToken = loginRes.data.data.token;
    assert(!loginRes.data.data.user.password_hash, "SECURITY: password_hash never exposed on login");

    // B. Wrong Password
    const wrongPassRes = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: validEmail,
        password: "WrongPassword999!",
      }),
    });
    assert(wrongPassRes.status === 401 || wrongPassRes.status === 400, "Wrong password rejected (401/400)");

    // C. Non-existent Email
    const fakeUserRes = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: `ghost_${timestamp}@nonexistent.com`,
        password: "Password123!",
      }),
    });
    assert(fakeUserRes.status === 401 || fakeUserRes.status === 404 || fakeUserRes.status === 400, "Non-existent user rejected safely");

    // D. Suspended User Account
    const suspendedEmail = `suspended_${timestamp}@test.com`;
    const suspendedUser = await User.create({
      first_name: "Suspended",
      last_name: "Account",
      email: suspendedEmail,
      password_hash: passwordHash,
      status: "SUSPENDED",
    });
    const suspRole = await Role.findOne({ where: { name: "JOB_SEEKER" } });
    if (suspRole) await UserRole.create({ user_id: suspendedUser.id, role_id: suspRole.id });

    const suspLoginRes = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: suspendedEmail,
        password: "Password123!",
      }),
    });
    assert(suspLoginRes.status === 403 || suspLoginRes.status === 401, `Suspended user login blocked with status ${suspLoginRes.status}`);

    // ----------------------------------------------------
    // 4. JWT Token Verification & Edge Cases
    // ----------------------------------------------------
    console.log("\n--- 4. Testing JWT Verification & Bearer Header Edge Cases ---");

    // A. Valid Token -> /auth/me
    const meRes = await apiRequest("/auth/me", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(meRes.status === 200, "GET /api/auth/me returned 200 with valid token");
    assert(meRes.data.data.user.email === validEmail, "Authenticated user identity matches token");
    assert(Array.isArray(meRes.data.data.user.roles), "Roles returned as array");
    assert(Array.isArray(meRes.data.data.user.permissions), "Permissions returned as array");

    // B. Invalid / Forged JWT Token
    const forgedRes = await apiRequest("/auth/me", {
      headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.forged.token" },
    });
    assert(forgedRes.status === 401, "Forged JWT token rejected with 401 Unauthorized");

    // C. Malformed Authorization Header
    const malformedRes = await apiRequest("/auth/me", {
      headers: { Authorization: "NotABearerHeader" },
    });
    assert(malformedRes.status === 401, "Malformed Authorization header rejected with 401 Unauthorized");

    // D. No Token
    const noTokenRes = await apiRequest("/auth/me");
    assert(noTokenRes.status === 401, "Missing token rejected with 401 Unauthorized");

    // ----------------------------------------------------
    // 5. Mass-Assignment & Forbidden Field Injection
    // ----------------------------------------------------
    console.log("\n--- 5. Testing Mass-Assignment & Whitelist Protection ---");
    // Attempt to register with status: "SUSPENDED" or inject arbitrary columns
    const exploitEmail = `exploit_${timestamp}@test.com`;
    const exploitRes = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: "Hacker",
        last_name: "Exploit",
        email: exploitEmail,
        password: "Password123!",
        role: "ADMIN", // Attacker trying to register directly as ADMIN
        status: "SUSPENDED",
        is_admin: true,
      }),
    });

    if (exploitRes.ok) {
      const createdUser = await User.findOne({ where: { email: exploitEmail }, include: [Role] });
      const hasAdmin = createdUser.Roles.some((r) => r.name === "ADMIN");
      assert(!hasAdmin, "SECURITY PASS: Direct registration as ADMIN prevented by role assignment guard");
    } else {
      assert(true, "SECURITY PASS: Registration with invalid/privilege role rejected at validator");
    }

    // ----------------------------------------------------
    // 6. SQL Injection Resilience Smoke Test
    // ----------------------------------------------------
    console.log("\n--- 6. Testing SQL Injection Resilience on Search Endpoints ---");
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "admin'--",
      "1' UNION SELECT * FROM users--",
      "%27%20OR%201=1--",
    ];

    for (const sql of sqlPayloads) {
      const searchRes = await apiRequest(`/jobs?q=${encodeURIComponent(sql)}`);
      assert(searchRes.status === 200, `SQL injection probe safely handled without error: ${sql}`);
      assert(Array.isArray(searchRes.data.data?.jobs), "Search returned clean array of jobs");
    }

    // ----------------------------------------------------
    // 7. Cleanup
    // ----------------------------------------------------
    console.log("\n--- 7. Cleaning Up Test Artifacts ---");
    await User.destroy({ where: { email: [validEmail, suspendedEmail, exploitEmail] } });
    console.log("✓ Test users cleaned up successfully.");

    console.log("\n==================================================");
    console.log("ALL AUTH, VALIDATION & SECURITY QA TESTS PASSED!");
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ QA SUITE FAILED WITH ERROR:", error);
    process.exit(1);
  }
}

runAuthSecuritySuite();
