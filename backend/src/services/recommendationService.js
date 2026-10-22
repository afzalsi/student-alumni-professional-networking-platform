const Job = require('../models/Job');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');

/**
 * Calculates match percentage and reasons between a student profile and a job
 */
const calculateJobMatch = (student, studentProfile, job) => {
  let score = 0;
  const reasons = [];

  const studentSkills = (student.skills || []).map((s) => s.toLowerCase().trim());
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase().trim());

  // 1. Skill Match (Max 50 points)
  if (jobSkills.length > 0 && studentSkills.length > 0) {
    const matchingSkills = studentSkills.filter((s) =>
      jobSkills.some((js) => js.includes(s) || s.includes(js))
    );
    const skillRatio = matchingSkills.length / jobSkills.length;
    const skillScore = Math.min(50, Math.round(skillRatio * 50));
    score += skillScore;

    if (matchingSkills.length > 0) {
      reasons.push(`Matched ${matchingSkills.length} required skill(s): ${matchingSkills.slice(0, 3).join(', ')}`);
    }
  }

  // 2. Industry / Category Match (Max 20 points)
  const preferredIndustry = (studentProfile?.preferredIndustry || '').toLowerCase();
  const jobCategory = (job.category || '').toLowerCase();
  if (preferredIndustry && jobCategory && (preferredIndustry.includes(jobCategory) || jobCategory.includes(preferredIndustry))) {
    score += 20;
    reasons.push(`Matches your preferred industry (${studentProfile.preferredIndustry})`);
  }

  // 3. Role / Title Match (Max 20 points)
  const preferredRole = (studentProfile?.preferredJobRole || '').toLowerCase();
  const jobTitle = (job.title || '').toLowerCase();
  const roleTokens = preferredRole.split(' ').filter((t) => t.length > 2);
  const titleTokens = jobTitle.split(' ').filter((t) => t.length > 2);
  const hasRoleOverlap = roleTokens.some((t) => titleTokens.includes(t));

  if (preferredRole && jobTitle && (jobTitle.includes(preferredRole) || preferredRole.includes(jobTitle) || hasRoleOverlap)) {
    score += 20;
    reasons.push(`Matches your target role (${studentProfile.preferredJobRole})`);
  }

  // 4. Interests / Career Goals match (Max 10 points)
  const studentInterests = (student.interests || []).map((i) => i.toLowerCase());
  const desc = (job.description || '').toLowerCase();
  const matchedInterests = studentInterests.filter((interest) => desc.includes(interest));
  if (matchedInterests.length > 0) {
    score += 10;
    reasons.push(`Aligns with your interests: ${matchedInterests.slice(0, 2).join(', ')}`);
  }

  if (score === 0) {
    score = 30;
    reasons.push('General career opportunity in tech & engineering');
  }

  return {
    score: Math.min(100, score),
    reasons
  };
};

/**
 * Calculates match percentage between a student and a mentor (Alumni)
 */
const calculateMentorMatch = (student, studentProfile, alumni, alumniProfile) => {
  let score = 0;
  const reasons = [];

  const studentSkills = (student.skills || []).map((s) => s.toLowerCase().trim());
  const mentorSkills = [...(alumni.skills || []), ...(alumniProfile?.expertise || [])].map((s) => s.toLowerCase().trim());

  // 1. Skill & Expertise Match (Max 45 points)
  if (mentorSkills.length > 0 && studentSkills.length > 0) {
    const matchingSkills = studentSkills.filter((s) =>
      mentorSkills.some((ms) => ms.includes(s) || s.includes(ms))
    );
    const skillRatio = matchingSkills.length / Math.max(1, studentSkills.length);
    const skillScore = Math.min(45, Math.round(skillRatio * 45));
    score += skillScore;
    if (matchingSkills.length > 0) {
      reasons.push(`Shares expertise in ${matchingSkills.slice(0, 3).join(', ')}`);
    }
  }

  // 2. Department / Alma Mater affinity (Max 20 points)
  if (student.department && alumni.department && student.department.toLowerCase() === alumni.department.toLowerCase()) {
    score += 20;
    reasons.push(`Fellow alumni from ${student.department}`);
  }

  // 3. Industry Match (Max 20 points)
  const preferredIndustry = (studentProfile?.preferredIndustry || '').toLowerCase();
  const mentorIndustry = (alumniProfile?.industry || '').toLowerCase();
  if (preferredIndustry && mentorIndustry && (preferredIndustry.includes(mentorIndustry) || mentorIndustry.includes(preferredIndustry))) {
    score += 20;
    reasons.push(`Works in your target industry (${alumniProfile.industry})`);
  }

  // 4. Role Match with token overlap (Max 15 points)
  const preferredRole = (studentProfile?.preferredJobRole || '').toLowerCase();
  const mentorTitle = (alumniProfile?.jobTitle || '').toLowerCase();
  const roleTokens = preferredRole.split(' ').filter((t) => t.length > 2);
  const mentorTokens = mentorTitle.split(' ').filter((t) => t.length > 2);
  const hasRoleOverlap = roleTokens.some((t) => mentorTokens.includes(t));

  if (preferredRole && mentorTitle && (mentorTitle.includes(preferredRole) || preferredRole.includes(mentorTitle) || hasRoleOverlap)) {
    score += 15;
    reasons.push(`Experienced as ${alumniProfile.jobTitle}`);
  }

  if (score === 0) {
    score = 40;
    reasons.push('Recommended mentor available for guidance');
  }

  return {
    score: Math.min(100, score),
    reasons
  };
};

module.exports = {
  calculateJobMatch,
  calculateMentorMatch
};
