const {
  Job,
  JobSkill,
  UserSkill,
} = require("../models");

const normalizeSkill = (skill) => {
  return skill
    .trim()
    .toLowerCase();
};

const calculateSkillMatch = (
  userSkills,
  jobSkills
) => {
  if (!jobSkills.length) {
    return 0;
  }

  const userSkillSet = new Set(
    userSkills.map((skill) =>
      normalizeSkill(skill.skill_name)
    )
  );

  const matchedSkills =
    jobSkills.filter((skill) =>
      userSkillSet.has(
        normalizeSkill(skill.skill_name)
      )
    );

  const percentage =
    (matchedSkills.length /
      jobSkills.length) *
    100;

  return Math.round(percentage);
};

const getRecommendedJobs = async (
  userId
) => {
  const userSkills =
    await UserSkill.findAll({
      where: {
        user_id: userId,
      },
    });

  const jobs =
    await Job.findAll({
      where: {
        status: "PUBLISHED",
      },

      include: [
        {
          model: JobSkill,
          as: "skills",
        },
      ],
    });

  const recommendations =
    jobs
      .map((job) => {
        const matchPercentage =
          calculateSkillMatch(
            userSkills,
            job.skills
          );

        return {
          job,
          match_percentage:
            matchPercentage,
        };
      })
      .filter(
        (item) =>
          item.match_percentage > 0
      )
      .sort(
        (a, b) =>
          b.match_percentage -
          a.match_percentage
      );

  return recommendations;
};

module.exports = {
  calculateSkillMatch,
  getRecommendedJobs,
};