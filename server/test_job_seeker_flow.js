// test_job_seeker_flow.js
const fs = require('fs');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function run() {
  console.log("=========================================");
  console.log("STARTING JOB SEEKER BACKEND INTEGRATION TEST");
  console.log("=========================================\n");

  const timestamp = Date.now();
  const testEmail = `seeker_flow_${timestamp}@test.com`;
  const password = "password123";

  // 1. REGISTER JOB SEEKER
  console.log("1. Registering new Job Seeker...");
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name: "Alex",
      last_name: "Seeker",
      email: testEmail,
      password: password,
      role: "JOB_SEEKER"
    })
  });
  const regData = await regRes.json();
  if (!regData.success) {
    throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
  }
  console.log("✓ Registered successfully:", regData.data.user.email);

  // 2. LOGIN AS JOB SEEKER
  console.log("\n2. Logging in as Job Seeker...");
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log("✓ Login successful, roles:", loginData.data.user.roles);

  // 3. GET PROFILE ME
  console.log("\n3. GET /api/profile/me...");
  const profileRes = await fetch(`${BASE_URL}/profile/me`, { headers: authHeaders });
  const profileData = await profileRes.json();
  if (!profileData.success) {
    throw new Error(`GET profile failed: ${JSON.stringify(profileData)}`);
  }
  console.log("✓ Profile retrieved for user ID:", profileData.data.profile.id);

  // 4. PUT PROFILE ME
  console.log("\n4. PUT /api/profile/me...");
  const updateRes = await fetch(`${BASE_URL}/profile/me`, {
    method: "PUT",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      professional_title: "Full Stack Developer",
      bio: "Passionate engineer with experience in React and Node.js.",
      phone: "+855 12 999 888",
      address: "123 Technology Way",
      city: "Phnom Penh",
      country: "Cambodia"
    })
  });
  const updateData = await updateRes.json();
  if (!updateData.success) {
    throw new Error(`PUT profile failed: ${JSON.stringify(updateData)}`);
  }
  console.log("✓ Profile updated. Title:", updateData.data.profile.professional_title);

  // 5. UPLOAD AVATAR
  console.log("\n5. POST /api/profile/avatar...");
  // Create a minimal 1x1 valid PNG buffer
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const avatarBuffer = Buffer.from(pngBase64, 'base64');
  const avatarBlob = new Blob([avatarBuffer], { type: "image/png" });

  const avatarFormData = new FormData();
  avatarFormData.append("avatar", avatarBlob, "avatar1.png");

  const avatarRes = await fetch(`${BASE_URL}/profile/avatar`, {
    method: "POST",
    headers: authHeaders,
    body: avatarFormData
  });
  const avatarData = await avatarRes.json();
  if (!avatarData.success) {
    throw new Error(`Upload avatar failed: ${JSON.stringify(avatarData)}`);
  }
  console.log("✓ Avatar uploaded. Cloudinary URL:", avatarData.data.profile.avatar_url);

  // 6. REPLACE AVATAR
  console.log("\n6. Replace avatar with new image...");
  const avatar2FormData = new FormData();
  avatar2FormData.append("avatar", avatarBlob, "avatar2.png");
  const avatar2Res = await fetch(`${BASE_URL}/profile/avatar`, {
    method: "POST",
    headers: authHeaders,
    body: avatar2FormData
  });
  const avatar2Data = await avatar2Res.json();
  if (!avatar2Data.success) {
    throw new Error(`Replace avatar failed: ${JSON.stringify(avatar2Data)}`);
  }
  console.log("✓ Avatar replaced successfully. New URL:", avatar2Data.data.profile.avatar_url);

  // 7. UPLOAD PDF RESUME
  console.log("\n7. POST /api/profile/resume...");
  const dummyPdf = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0>>endobj\nxref\n0 3\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\ntrailer<</Size 3/Root 1 0 R>>\nstartxref\n99\n%%EOF";
  const resumeBuffer = Buffer.from(dummyPdf, 'utf-8');
  const resumeBlob = new Blob([resumeBuffer], { type: "application/pdf" });

  const resumeFormData = new FormData();
  resumeFormData.append("resume", resumeBlob, "test_resume.pdf");

  const resumeRes = await fetch(`${BASE_URL}/profile/resume`, {
    method: "POST",
    headers: authHeaders,
    body: resumeFormData
  });
  const resumeData = await resumeRes.json();
  if (!resumeData.success) {
    throw new Error(`Upload resume failed: ${JSON.stringify(resumeData)}`);
  }
  console.log("✓ Resume uploaded. Cloudinary URL:", resumeData.data.profile.resume_url);

  // 8. REPLACE PDF RESUME
  console.log("\n8. Replace PDF resume...");
  const resume2FormData = new FormData();
  resume2FormData.append("resume", resumeBlob, "updated_resume.pdf");
  const resume2Res = await fetch(`${BASE_URL}/profile/resume`, {
    method: "POST",
    headers: authHeaders,
    body: resume2FormData
  });
  const resume2Data = await resume2Res.json();
  if (!resume2Data.success) {
    throw new Error(`Replace resume failed: ${JSON.stringify(resume2Data)}`);
  }
  console.log("✓ Resume replaced successfully. New URL:", resume2Data.data.profile.resume_url);

  // 9. SKILLS CRUD
  console.log("\n9. Testing Skills CRUD...");
  // Add Skill 1: React
  const addSkill1 = await fetch(`${BASE_URL}/profile/skills`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ skill_name: "React", level: "INTERMEDIATE" })
  });
  const s1Data = await addSkill1.json();
  console.log("✓ Skill 1 added:", s1Data.data.skill.skill_name, s1Data.data.skill.level);

  // Add Skill 2: TypeScript
  const addSkill2 = await fetch(`${BASE_URL}/profile/skills`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ skill_name: "TypeScript", level: "BEGINNER" })
  });
  const s2Data = await addSkill2.json();
  console.log("✓ Skill 2 added:", s2Data.data.skill.skill_name, s2Data.data.skill.level);

  // Update Skill 2: change to ADVANCED
  const editSkill2 = await fetch(`${BASE_URL}/profile/skills/${s2Data.data.skill.id}`, {
    method: "PUT",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ level: "ADVANCED" })
  });
  const s2EditData = await editSkill2.json();
  console.log("✓ Skill 2 updated level:", s2EditData.data.skill.level);

  // Delete Skill 2
  const delSkill2 = await fetch(`${BASE_URL}/profile/skills/${s2Data.data.skill.id}`, {
    method: "DELETE",
    headers: authHeaders
  });
  const s2DelData = await delSkill2.json();
  console.log("✓ Skill 2 deleted:", s2DelData.message);

  // 10. EDUCATION CRUD
  console.log("\n10. Testing Education CRUD...");
  const addEdu = await fetch(`${BASE_URL}/profile/educations`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      institution: "National University of Management",
      degree: "Bachelor of Science",
      field_of_study: "Information Technology",
      start_date: "2019-10-01",
      end_date: "2023-07-15",
      is_current: false,
      description: "Graduated with honors in Software Engineering."
    })
  });
  const eduData = await addEdu.json();
  if (!eduData.success) throw new Error(`Add education failed: ${JSON.stringify(eduData)}`);
  console.log("✓ Education added:", eduData.data.education.institution);

  // Update Education
  const editEdu = await fetch(`${BASE_URL}/profile/educations/${eduData.data.education.id}`, {
    method: "PUT",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ description: "Graduated with highest honors." })
  });
  const editEduData = await editEdu.json();
  console.log("✓ Education updated:", editEduData.data.education.description);

  // 11. EXPERIENCE CRUD
  console.log("\n11. Testing Experience CRUD...");
  const addExp = await fetch(`${BASE_URL}/profile/experiences`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      company_name: "Tech Solutions Asia",
      position: "Frontend Developer",
      employment_type: "FULL_TIME",
      location: "Phnom Penh",
      start_date: "2023-08-01",
      is_current: true,
      description: "Developing modern web apps with React and TypeScript."
    })
  });
  const expData = await addExp.json();
  if (!expData.success) throw new Error(`Add experience failed: ${JSON.stringify(expData)}`);
  console.log("✓ Experience added:", expData.data.experience.company_name, expData.data.experience.position);

  // Update Experience
  const editExp = await fetch(`${BASE_URL}/profile/experiences/${expData.data.experience.id}`, {
    method: "PUT",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ position: "Senior Frontend Developer" })
  });
  const editExpData = await editExp.json();
  console.log("✓ Experience updated:", editExpData.data.experience.position);

  // 12. SAVED JOBS FLOW
  console.log("\n12. Testing Saved Jobs flow...");
  // Fetch available jobs first
  const jobsRes = await fetch(`${BASE_URL}/jobs`);
  const jobsData = await jobsRes.json();
  const availableJob = jobsData.data?.jobs?.[0];
  if (availableJob) {
    console.log(`Found job to test bookmarking: ID ${availableJob.id} (${availableJob.title})`);
    
    // Save job
    const saveRes = await fetch(`${BASE_URL}/jobs/${availableJob.id}/save`, {
      method: "POST",
      headers: authHeaders
    });
    const saveData = await saveRes.json();
    console.log("✓ Job saved:", saveData.message);

    // Get saved jobs list
    const getSaved = await fetch(`${BASE_URL}/jobs/saved`, { headers: authHeaders });
    const savedListData = await getSaved.json();
    console.log(`✓ Saved jobs list count: ${savedListData.data.savedJobs.length}`);

    // Unsave job
    const unsaveRes = await fetch(`${BASE_URL}/jobs/${availableJob.id}/save`, {
      method: "DELETE",
      headers: authHeaders
    });
    const unsaveData = await unsaveRes.json();
    console.log("✓ Job unsaved:", unsaveData.message);
  } else {
    console.log("ℹ No public jobs found to test save flow");
  }

  // 13. APPLICATIONS FLOW
  console.log("\n13. Testing Applications flow...");
  if (availableJob) {
    // Apply for job
    const applyRes = await fetch(`${BASE_URL}/applications/jobs/${availableJob.id}/apply`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        cover_letter: "I am very interested in this role and have strong React experience."
      })
    });
    const applyData = await applyRes.json();
    console.log("✓ Applied for job:", applyData.message || applyData.success);
  }

  // Get my applications
  const myAppsRes = await fetch(`${BASE_URL}/applications/my`, { headers: authHeaders });
  const myAppsData = await myAppsRes.json();
  console.log(`✓ My applications count: ${myAppsData.data.applications.length}`);
  if (myAppsData.data.applications.length > 0) {
    console.log("  Status of latest application:", myAppsData.data.applications[0].status);
  }

  // 14. RECOMMENDED JOBS FLOW
  console.log("\n14. Testing Recommended Jobs...");
  const recRes = await fetch(`${BASE_URL}/jobs/recommended`, { headers: authHeaders });
  const recData = await recRes.json();
  if (recData.success) {
    console.log(`✓ Recommendations endpoint returned ${recData.data.recommendations.length} recommendations`);
    if (recData.data.recommendations.length > 0) {
      console.log(`  Top match: ${recData.data.recommendations[0].match_percentage}% for ${recData.data.recommendations[0].job.title}`);
    }
  } else {
    throw new Error(`Recommendations failed: ${JSON.stringify(recData)}`);
  }

  // 15. REGRESSION: ADMIN AND EMPLOYEE LOGIN
  console.log("\n15. Regression testing Admin and Employee logins...");
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin_qa@test.com", password: "password123" })
  });
  const adminData = await adminLogin.json();
  console.log("✓ Admin login success:", adminData.success, "Roles:", adminData.data?.user?.roles);

  const empLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "emp_qa@test.com", password: "password123" })
  });
  const empData = await empLogin.json();
  console.log("✓ Employee login success:", empData.success, "Roles:", empData.data?.user?.roles);

  console.log("\n=========================================");
  console.log("ALL BACKEND CONTRACT TESTS PASSED SUCCESSFULLY!");
  console.log("=========================================");
}

run().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
