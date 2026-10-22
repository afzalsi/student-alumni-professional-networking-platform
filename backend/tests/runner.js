const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../src/config/env');
const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');
const AlumniProfile = require('../src/models/AlumniProfile');
const MentorshipRequest = require('../src/models/MentorshipRequest');
const Mentorship = require('../src/models/Mentorship');
const MentorshipSession = require('../src/models/MentorshipSession');
const Job = require('../src/models/Job');
const JobApplication = require('../src/models/JobApplication');
const Review = require('../src/models/Review');
const { calculateJobMatch, calculateMentorMatch } = require('../src/services/recommendationService');
const generateToken = require('../src/utils/generateToken');

let passedTests = 0;
let failedTests = 0;

const assert = (condition, testName) => {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedTests++;
  }
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING AUTOMATED BACKEND INTEGRATION & LOGIC TESTS');
  console.log('======================================================\n');

  try {
    await mongoose.connect(config.mongodbUri);
    console.log('📦 Connected to Test Database\n');

    // Test Suite 1: JWT & Token generation
    console.log('--- Suite 1: Authentication & Token Security ---');
    const dummyId = new mongoose.Types.ObjectId();
    const token = generateToken(dummyId, 'student');
    const decoded = jwt.verify(token, config.jwtSecret);
    assert(decoded.id === dummyId.toString(), 'JWT contains valid user ID');
    assert(decoded.role === 'student', 'JWT contains proper role payload');

    // Test Suite 2: Recommendation Matching Algorithm
    console.log('\n--- Suite 2: Multi-Criteria Recommendation Engine ---');
    const dummyStudent = {
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
      interests: ['Cloud Architecture', 'Web Development'],
      department: 'Computer Science'
    };
    const dummyStudentProfile = {
      preferredIndustry: 'Information Technology / SaaS',
      preferredJobRole: 'Full Stack Software Engineer'
    };

    const matchingJob = {
      title: 'Full Stack Software Engineer',
      company: 'Tech Corp',
      category: 'Information Technology / SaaS',
      skills: ['React', 'Node.js', 'MongoDB'],
      description: 'Building modern web development apps on cloud architecture'
    };

    const jobMatch = calculateJobMatch(dummyStudent, dummyStudentProfile, matchingJob);
    assert(jobMatch.score >= 80, `Job Match Score is high for aligned skills & role (${jobMatch.score}%)`);
    assert(jobMatch.reasons.length >= 3, 'Job Match provides explanatory reasons');

    const dummyAlumni = {
      skills: ['React', 'Node.js', 'System Design'],
      department: 'Computer Science'
    };
    const dummyAlumniProfile = {
      company: 'Google',
      jobTitle: 'Senior Software Engineer',
      industry: 'Information Technology / SaaS',
      expertise: ['Full Stack Architecture', 'System Design', 'React']
    };

    const mentorMatch = calculateMentorMatch(dummyStudent, dummyStudentProfile, dummyAlumni, dummyAlumniProfile);
    assert(mentorMatch.score >= 70, `Mentor Match Score is high for shared skills & department (${mentorMatch.score}%)`);
    assert(mentorMatch.reasons.some(r => r.includes('Computer Science')), 'Mentor Match detects departmental alumni affinity');

    // Test Suite 3: Double Booking Prevention Logic
    console.log('\n--- Suite 3: Mentorship Session Booking Rules ---');
    const mentorId = new mongoose.Types.ObjectId();
    const mentee1Id = new mongoose.Types.ObjectId();
    const mentee2Id = new mongoose.Types.ObjectId();
    const testDate = new Date('2026-10-15');

    // Clear test sessions
    await MentorshipSession.deleteMany({ mentorId });

    const session1 = await MentorshipSession.create({
      mentorId,
      menteeId: mentee1Id,
      date: testDate,
      startTime: '14:00',
      endTime: '15:00',
      topic: 'Code Review',
      status: 'CONFIRMED'
    });

    const isSlotOccupied = await MentorshipSession.findOne({
      mentorId,
      date: testDate,
      startTime: '14:00',
      status: { $in: ['REQUESTED', 'CONFIRMED'] }
    });

    assert(Boolean(isSlotOccupied), 'System detects existing conflicting session for mentor');

    // Clean up test session
    await MentorshipSession.deleteMany({ mentorId });

    // Test Suite 4: Duplicate Job Application Prevention
    console.log('\n--- Suite 4: Job Application Unique Constraint ---');
    const testJobId = new mongoose.Types.ObjectId();
    const testStudentId = new mongoose.Types.ObjectId();

    await JobApplication.deleteMany({ jobId: testJobId, studentId: testStudentId });

    await JobApplication.create({
      jobId: testJobId,
      studentId: testStudentId,
      resumeUrl: 'https://example.com/resume.pdf',
      status: 'APPLIED'
    });

    let duplicateThrew = false;
    try {
      await JobApplication.create({
        jobId: testJobId,
        studentId: testStudentId,
        resumeUrl: 'https://example.com/resume2.pdf',
        status: 'APPLIED'
      });
    } catch (err) {
      duplicateThrew = true;
    }

    assert(duplicateThrew, 'Duplicate application to same job is prevented by database index');
    await JobApplication.deleteMany({ jobId: testJobId });

    // Test Suite 5: Review Constraint Check
    console.log('\n--- Suite 5: Review & Rating Constraints ---');
    const testReviewMentorshipId = new mongoose.Types.ObjectId();
    const testReviewMentorId = new mongoose.Types.ObjectId();
    const testReviewStudentId = new mongoose.Types.ObjectId();

    await Review.deleteMany({ mentorshipId: testReviewMentorshipId });

    await Review.create({
      mentorId: testReviewMentorId,
      studentId: testReviewStudentId,
      mentorshipId: testReviewMentorshipId,
      rating: 5,
      comment: 'Super helpful mentor'
    });

    let duplicateReviewThrew = false;
    try {
      await Review.create({
        mentorId: testReviewMentorId,
        studentId: testReviewStudentId,
        mentorshipId: testReviewMentorshipId,
        rating: 4,
        comment: 'Second review attempt'
      });
    } catch (err) {
      duplicateReviewThrew = true;
    }

    assert(duplicateReviewThrew, 'Duplicate review per mentorship from same student is prevented');
    await Review.deleteMany({ mentorshipId: testReviewMentorshipId });

    console.log('\n======================================================');
    console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('======================================================\n');

    process.exit(failedTests === 0 ? 0 : 1);
  } catch (error) {
    console.error('Test Suite Error:', error);
    process.exit(1);
  }
};

runTests();
