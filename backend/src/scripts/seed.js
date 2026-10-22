const mongoose = require('mongoose');
const config = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const MentorshipRequest = require('../models/MentorshipRequest');
const Mentorship = require('../models/Mentorship');
const MentorshipSession = require('../models/MentorshipSession');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const SavedJob = require('../models/SavedJob');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Resource = require('../models/Resource');
const Review = require('../models/Review');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const Connection = require('../models/Connection');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const SavedPost = require('../models/SavedPost');

const studentsData = require('./studentsData.json');
const alumniData = require('./alumniData.json');
const jobsData = require('./jobsData.json');

const seed = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
      console.log('[Seed] Connected.');
    } else {
      console.log('[Seed] Using active MongoDB connection.');
    }

    console.log('[Seed] Clearing all existing collections...');
    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      AlumniProfile.deleteMany({}),
      MentorshipRequest.deleteMany({}),
      Mentorship.deleteMany({}),
      MentorshipSession.deleteMany({}),
      Job.deleteMany({}),
      JobApplication.deleteMany({}),
      SavedJob.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      Event.deleteMany({}),
      EventRegistration.deleteMany({}),
      Resource.deleteMany({}),
      Review.deleteMany({}),
      Report.deleteMany({}),
      AuditLog.deleteMany({}),
      Post.deleteMany({}),
      Follow.deleteMany({}),
      Connection.deleteMany({}),
      Like.deleteMany({}),
      Comment.deleteMany({}),
      SavedPost.deleteMany({})
    ]);

    const defaultPassword = 'Password123!';

    // 1. Admin
    const admin = await User.create({
      name: 'Dr. Sarah Jenkins (Admin)',
      email: 'admin@example.com',
      password: defaultPassword,
      role: 'admin',
      department: 'University Career Services',
      location: 'San Francisco, CA',
      bio: 'Head of University Alumni Relations and Career Placement Office.',
      isVerified: true,
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    });

    // 2. Students
    const studentUsers = [];
    for (const s of studentsData) {
      const student = await User.create({
        name: s.name,
        email: s.email,
        password: defaultPassword,
        role: 'student',
        department: s.department,
        graduationYear: s.graduationYear,
        location: s.location,
        skills: s.skills,
        interests: s.interests,
        careerGoals: s.careerGoals,
        bio: s.bio,
        avatar: s.avatar,
        isVerified: true,
        isActive: true
      });
      studentUsers.push(student);

      await StudentProfile.create({
        userId: student._id,
        preferredIndustry: s.preferredIndustry,
        preferredJobRole: s.preferredJobRole,
        careerGoals: s.careerGoals,
        skills: s.skills,
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        portfolioUrl: 'https://github.com',
        githubUrl: 'https://github.com',
        linkedinUrl: 'https://linkedin.com'
      });
    }

    // 3. Alumni
    const alumniUsers = [];
    for (const a of alumniData) {
      const alumni = await User.create({
        name: a.name,
        email: a.email,
        password: defaultPassword,
        role: 'alumni',
        department: a.department,
        graduationYear: a.graduationYear,
        location: a.location,
        skills: a.skills,
        bio: a.bio,
        avatar: a.avatar,
        isVerified: true,
        isActive: true
      });
      alumniUsers.push(alumni);

      await AlumniProfile.create({
        userId: alumni._id,
        company: a.company,
        jobTitle: a.jobTitle,
        industry: a.industry,
        experienceYears: a.experienceYears,
        expertise: a.expertise,
        mentorAvailable: a.mentorAvailable,
        availabilitySchedule: a.availabilitySchedule,
        availableSlots: a.availableSlots || [],
        ratingAverage: a.ratingAverage,
        ratingCount: a.ratingCount,
        linkedinUrl: 'https://linkedin.com',
        portfolioUrl: 'https://example.com'
      });
    }

    const demoStudent = studentUsers[0];
    const demoAlumni = alumniUsers[0];
    const aiAlumni = alumniUsers[1];
    const devopsAlumni = alumniUsers[2];

    // 4. Mentorship Request & Active Mentorship
    const activeReq = await MentorshipRequest.create({
      studentId: demoStudent._id,
      alumniId: demoAlumni._id,
      message: 'Hi David, I would love your mentorship on System Design and Full Stack architecture!',
      goal: 'Land a top-tier Full Stack Software Engineer role and master System Design',
      topic: 'Full Stack Architecture & System Design',
      preferredMode: 'online',
      status: 'ACCEPTED'
    });

    const activeMentorship = await Mentorship.create({
      studentId: demoStudent._id,
      alumniId: demoAlumni._id,
      requestId: activeReq._id,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      goals: [
        { title: 'Complete React & Node.js portfolio project', isCompleted: true },
        { title: 'Practice 50 LeetCode Medium algorithms', isCompleted: true },
        { title: 'System Design Mock Interview', isCompleted: false },
        { title: 'Resume Review and Referral Applications', isCompleted: false }
      ],
      progressPercentage: 50,
      notes: 'Alex is making great progress on core projects and algorithm preparation.'
    });

    // Completed Mentorship for review testing
    const completedReq = await MentorshipRequest.create({
      studentId: demoStudent._id,
      alumniId: devopsAlumni._id,
      message: 'Hello Priya, looking to learn Docker, Kubernetes and CI/CD pipelines.',
      goal: 'Deploy full-stack apps with Docker & AWS',
      topic: 'Cloud Infrastructure & DevOps',
      status: 'ACCEPTED'
    });

    const completedMentorship = await Mentorship.create({
      studentId: demoStudent._id,
      alumniId: devopsAlumni._id,
      requestId: completedReq._id,
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'COMPLETED',
      goals: [
        { title: 'Containerize MERN stack with Docker Compose', isCompleted: true },
        { title: 'Set up GitHub Actions CI/CD pipeline', isCompleted: true }
      ],
      progressPercentage: 100
    });

    // Pending Mentorship Request
    await MentorshipRequest.create({
      studentId: studentUsers[1]._id,
      alumniId: demoAlumni._id,
      message: 'Hello David! Would love your advice on preparing for software engineering roles with ML emphasis.',
      goal: 'Learn scalable serving for ML models',
      topic: 'Software Architecture for AI',
      status: 'PENDING'
    });

    // 5. Mentorship Sessions
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await MentorshipSession.create({
      mentorshipId: activeMentorship._id,
      mentorId: demoAlumni._id,
      menteeId: demoStudent._id,
      date: tomorrow,
      startTime: '18:00',
      endTime: '19:00',
      topic: 'System Design Mock Interview: Design a Scalable URL Shortener',
      meetingLink: 'https://meet.google.com/alm-ment-demo',
      location: 'Google Meet',
      status: 'CONFIRMED',
      notes: 'Prepare high-level architecture diagram beforehand.'
    });

    await MentorshipSession.create({
      mentorshipId: activeMentorship._id,
      mentorId: demoAlumni._id,
      menteeId: demoStudent._id,
      date: nextWeek,
      startTime: '19:00',
      endTime: '20:00',
      topic: 'Resume Deep Dive & Referral Strategy',
      meetingLink: 'https://meet.google.com/alm-ment-demo',
      location: 'Google Meet',
      status: 'REQUESTED'
    });

    // 6. Review
    await Review.create({
      mentorId: devopsAlumni._id,
      studentId: demoStudent._id,
      mentorshipId: completedMentorship._id,
      rating: 5,
      comment: 'Priya was an exceptional mentor! Clear explanations on Docker and CI/CD pipelines.'
    });

    // 7. Conversation & Messages
    const conv = await Conversation.create({
      participants: [demoStudent._id, demoAlumni._id],
      mentorshipId: activeMentorship._id,
      lastMessage: {
        text: 'Looking forward to our System Design mock session tomorrow!',
        senderId: demoStudent._id,
        createdAt: new Date()
      }
    });

    await Message.create([
      {
        conversationId: conv._id,
        senderId: demoAlumni._id,
        receiverId: demoStudent._id,
        content: 'Hi Alex! Welcome aboard. Let us outline your targets for this semester.',
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        conversationId: conv._id,
        senderId: demoStudent._id,
        receiverId: demoAlumni._id,
        content: 'Thanks David! I updated my resume and project repos.',
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        conversationId: conv._id,
        senderId: demoAlumni._id,
        receiverId: demoStudent._id,
        content: 'Awesome work! Let us run a System Design mock interview tomorrow at 6:00 PM PST.',
        isRead: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        conversationId: conv._id,
        senderId: demoStudent._id,
        receiverId: demoAlumni._id,
        content: 'Looking forward to our System Design mock session tomorrow!',
        isRead: false,
        createdAt: new Date()
      }
    ]);

    // 8. Jobs
    const createdJobs = [];
    for (let i = 0; i < jobsData.length; i++) {
      const j = jobsData[i];
      const poster = alumniUsers[i % alumniUsers.length]._id;
      const job = await Job.create({
        ...j,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        postedBy: poster,
        status: j.status || 'ACTIVE'
      });
      createdJobs.push(job);
    }

    // 9. Saved Jobs & Applications
    await SavedJob.create([
      { studentId: demoStudent._id, jobId: createdJobs[0]._id },
      { studentId: demoStudent._id, jobId: createdJobs[1]._id },
      { studentId: demoStudent._id, jobId: createdJobs[4]._id }
    ]);

    await JobApplication.create([
      {
        jobId: createdJobs[0]._id,
        studentId: demoStudent._id,
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        coverLetter: 'Excited to apply for Full Stack Engineer at Google.',
        status: 'SHORTLISTED',
        interviewDetails: {
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          time: '14:00 PST',
          link: 'https://meet.google.com/interview-goog-demo',
          notes: 'Technical screen: Coding & System Design fundamentals'
        }
      },
      {
        jobId: createdJobs[1]._id,
        studentId: demoStudent._id,
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        status: 'UNDER_REVIEW'
      },
      {
        jobId: createdJobs[4]._id,
        studentId: studentUsers[2]._id,
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        status: 'INTERVIEW'
      },
      {
        jobId: createdJobs[2]._id,
        studentId: studentUsers[1]._id,
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        status: 'SELECTED'
      }
    ]);

    // 10. Events
    const events = [
      {
        title: 'Alumni Tech Talk: Cracking the System Design Interview',
        description: 'Join Google Senior Staff Engineer David Miller as he deconstructs distributed system design questions.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        time: '6:00 PM - 7:30 PM PST',
        location: 'Virtual Webinar',
        mode: 'online',
        meetingLink: 'https://meet.google.com/tech-talk-demo',
        organizer: demoAlumni._id,
        capacity: 250,
        registeredCount: 42,
        tags: ['System Design', 'Tech Interview', 'Google']
      },
      {
        title: 'Annual Fall Tech & Career Fair 2026',
        description: 'Connect with over 40+ alumni recruiters from Google, Microsoft, Stripe, and top startups.',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        time: '10:00 AM - 4:00 PM PST',
        location: 'Main Campus Center & Virtual Booths',
        mode: 'hybrid',
        meetingLink: 'https://meet.google.com/career-fair-2026',
        organizer: admin._id,
        capacity: 1000,
        registeredCount: 156,
        tags: ['Career Fair', 'Networking', 'Internships']
      },
      {
        title: 'AI & Generative Models Workshop',
        description: 'Live workshop by Microsoft Principal AI Scientist Rachel Adams on LLM fine-tuning and RAG.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: '5:00 PM - 7:00 PM PST',
        location: 'Online Live Stream',
        mode: 'online',
        meetingLink: 'https://meet.google.com/ai-workshop-demo',
        organizer: aiAlumni._id,
        capacity: 300,
        registeredCount: 88,
        tags: ['AI', 'LLM', 'Machine Learning', 'Workshop']
      }
    ];

    for (const e of events) {
      const createdEvent = await Event.create(e);
      await EventRegistration.create({
        eventId: createdEvent._id,
        userId: demoStudent._id
      });
    }

    // 11. Resources
    const resources = [
      {
        title: 'Ultimate Software Engineer Resume & Portfolio Guide (2026 Edition)',
        description: 'Step-by-step breakdown of how to structure your resume and build standout portfolio projects.',
        type: 'guide',
        url: 'https://github.com',
        category: 'Career & Resume',
        tags: ['Resume', 'Portfolio', 'Job Search'],
        uploadedBy: demoAlumni._id,
        bookmarksCount: 65
      },
      {
        title: 'System Design Primer & Cheat Sheet',
        description: 'Comprehensive repository of distributed system concepts: caching, sharding, CAP theorem.',
        type: 'article',
        url: 'https://github.com/donnemartin/system-design-primer',
        category: 'Technical Interview',
        tags: ['System Design', 'Backend', 'Architecture'],
        uploadedBy: demoAlumni._id,
        bookmarksCount: 120
      },
      {
        title: 'LeetCode Patterns: Top 75 Problem Patterns',
        description: 'Curated roadmap of essential two-pointers, trees, and dynamic programming problems.',
        type: 'code',
        url: 'https://leetcode.com',
        category: 'Coding Preparation',
        tags: ['Algorithms', 'Data Structures'],
        uploadedBy: demoAlumni._id,
        bookmarksCount: 94
      },
      {
        title: 'Deploying Modern MERN Applications with Docker & CI/CD',
        description: 'Complete hands-on video tutorial covering Docker builds and automated GitHub Actions.',
        type: 'video',
        url: 'https://youtube.com',
        category: 'DevOps & Cloud',
        tags: ['Docker', 'CI/CD', 'MERN'],
        uploadedBy: devopsAlumni._id,
        bookmarksCount: 45
      }
    ];

    for (const r of resources) {
      await Resource.create(r);
    }

    // 12. Notifications
    await Notification.create([
      {
        recipientId: demoStudent._id,
        type: 'MENTORSHIP_ACCEPTED',
        title: 'Mentorship Request Accepted! 🎉',
        message: 'David Miller accepted your mentorship request. You can now chat and schedule sessions.',
        link: '/student/mentorships',
        isRead: false
      },
      {
        recipientId: demoStudent._id,
        type: 'JOB_STATUS_CHANGE',
        title: 'Application Shortlisted: Google',
        message: 'Your application for Full Stack Software Engineer at Google has been SHORTLISTED for technical interview.',
        link: '/student/applications',
        isRead: false
      },
      {
        recipientId: demoStudent._id,
        type: 'SESSION_CONFIRMED',
        title: 'Session Confirmed with David Miller',
        message: 'Your mentoring session "System Design Mock Interview" is confirmed for tomorrow at 6:00 PM PST.',
        link: '/student/sessions',
        isRead: true
      },
      {
        recipientId: demoAlumni._id,
        type: 'MENTORSHIP_REQUEST',
        title: 'New Mentorship Request',
        message: 'Emily Zhang sent you a mentorship request for Software Architecture for AI.',
        link: '/alumni/requests',
        isRead: false
      }
    ]);

    // 13. Networking: Follows
    console.log('[Seed] Generating Professional Follow Relationships...');

    // Follow relationships
    const followPairs = [
      { followerId: demoStudent._id, followingId: demoAlumni._id },
      { followerId: demoStudent._id, followingId: alumniUsers[1]._id },
      { followerId: demoStudent._id, followingId: studentUsers[1]._id },
      { followerId: demoAlumni._id, followingId: demoStudent._id },
      { followerId: alumniUsers[1]._id, followingId: demoStudent._id },
      { followerId: studentUsers[1]._id, followingId: demoStudent._id },
      { followerId: studentUsers[2]._id, followingId: demoStudent._id },
      { followerId: studentUsers[3]._id, followingId: demoStudent._id },
      { followerId: alumniUsers[2]._id, followingId: demoStudent._id },
      { followerId: alumniUsers[3]._id, followingId: demoStudent._id },
      { followerId: demoStudent._id, followingId: alumniUsers[2]._id }
    ];

    for (const pair of followPairs) {
      await Follow.findOneAndUpdate(pair, pair, { upsert: true });
    }

    // 14. Networking: Connections (Accepted & Pending)
    console.log('[Seed] Generating Professional Connections & Requests...');
    const conn1 = await Connection.create({
      senderId: demoStudent._id,
      receiverId: demoAlumni._id,
      status: 'accepted'
    });

    const conn2 = await Connection.create({
      senderId: studentUsers[1]._id,
      receiverId: demoStudent._id,
      status: 'accepted'
    });

    const conn3 = await Connection.create({
      senderId: alumniUsers[1]._id,
      receiverId: demoStudent._id,
      status: 'pending' // Received invitation
    });

    const conn4 = await Connection.create({
      senderId: demoStudent._id,
      receiverId: alumniUsers[2]._id,
      status: 'pending' // Sent invitation
    });

    const conn5 = await Connection.create({
      senderId: studentUsers[2]._id,
      receiverId: demoStudent._id,
      status: 'pending' // Received invitation
    });

    // 15. Networking: Professional Posts
    console.log('[Seed] Generating Professional Networking Posts...');
    const post1 = await Post.create({
      authorId: demoAlumni._id,
      title: 'Achieved AWS Solutions Architect Professional Certification!',
      content: 'Thrilled to share that after months of deep-dive preparation, I have officially cleared the AWS Certified Solutions Architect - Professional examination! 🚀\n\nDesigning highly resilient, multi-region distributed architectures in the cloud has been one of the most rewarding journeys of my career at Google. Special thanks to our university alumni network for keeping technical discussions alive.\n\nHappy to mentor any students or fellow alumni aspiring to take cloud architecture certifications this quarter!',
      category: 'Certifications',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
          type: 'image',
          name: 'AWS-Certified-Architect.jpg'
        }
      ],
      skills: ['AWS', 'Cloud Architecture', 'Distributed Systems', 'DevOps'],
      hashtags: ['aws', 'cloudcomputing', 'certification', 'systemdesign'],
      likesCount: 24,
      commentsCount: 3,
      sharesCount: 5
    });

    const post2 = await Post.create({
      authorId: demoStudent._id,
      title: 'Excited to announce my Summer 2026 Internship at Meta!',
      content: 'I am overjoyed to share that I have joined Meta as a Software Engineering Intern for Summer 2026! 🎉\n\nI will be collaborating with the Infrastructure & Distributed Core team in Menlo Park. A heartfelt shoutout to my alumni mentor, Marcus Vance, who conducted mock system design interviews with me and guided my roadmap throughout the recruitment cycle.\n\nRemember to stay curious and keep building!',
      category: 'Placements',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
          type: 'image',
          name: 'meta-offer-celebration.jpg'
        }
      ],
      skills: ['React', 'Data Structures', 'System Design', 'Algorithms'],
      hashtags: ['internship', 'meta', 'careerjourney', 'mentorshipmatters'],
      likesCount: 42,
      commentsCount: 4,
      sharesCount: 7
    });

    const post3 = await Post.create({
      authorId: alumniUsers[1]._id,
      title: 'Open-Sourced NexusMQ: Microsecond Event Bus for AI Pipelines',
      content: 'Over the weekend, I released "NexusMQ" — a lightweight, zero-copy pub/sub message broker tailored for real-time LLM inference pipelines.\n\nKey highlights:\n• Written in Node.js & C++ native addons with Rust worker threads\n• Sub-millisecond latency under 50,000 req/sec stress test\n• Native Prometheus telemetry integration\n\nCheck out the GitHub repo and let me know your thoughts or PR contributions!',
      category: 'Projects',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
          type: 'image',
          name: 'nexusmq-benchmark.jpg'
        }
      ],
      skills: ['Node.js', 'System Design', 'Redis', 'Microservices'],
      hashtags: ['opensource', 'nodejs', 'distributedcomputing', 'ai'],
      likesCount: 31,
      commentsCount: 2,
      sharesCount: 3
    });

    const post4 = await Post.create({
      authorId: studentUsers[1]._id,
      title: '1st Place Winner at National Collegiate AI Hackathon 2026! 🏆',
      content: 'Proud to announce that our team took 1st Place out of 120+ university teams at HackNation 2026! 🥇\n\nWe built "MedScan AI" — an offline-capable mobile computer vision assistant that detects early signs of diabetic retinopathy using edge inference on smartphone cameras.\n\nHuge appreciation to the organizers and judges for the invaluable feedback.',
      category: 'Hackathons',
      media: [
        {
          url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
          type: 'image',
          name: 'hackathon-trophy.jpg'
        }
      ],
      skills: ['Computer Vision', 'PyTorch', 'React Native', 'FastAPI'],
      hashtags: ['hackathon', 'ai', 'computervision', 'healthcaretech'],
      likesCount: 56,
      commentsCount: 5,
      sharesCount: 9
    });

    const post5 = await Post.create({
      authorId: alumniUsers[2]._id,
      title: 'Lessons from 6 Years in Engineering Leadership at Stripe',
      content: 'Scaling an engineering team from 10 to 80+ engineers taught me that technical excellence is only half the battle. The other half is clear communication, psychological safety, and fostering autonomous ownership.\n\nHere are 3 core principles I share with all my mentees:\n1. Optimize for fast feedback loops over premature perfection.\n2. Write RFCs before writing complex code.\n3. Celebrate unglamorous maintenance work as much as product launches.',
      category: 'Career updates',
      media: [],
      skills: ['Engineering Management', 'Team Leadership', 'Mentorship'],
      hashtags: ['leadership', 'careeradvice', 'softwareengineering'],
      likesCount: 68,
      commentsCount: 6,
      sharesCount: 12
    });

    // 16. Post Interactions: Likes, Comments, Saved Posts
    console.log('[Seed] Generating Likes, Comments & Bookmarks...');
    await Like.create([
      { userId: demoStudent._id, postId: post1._id },
      { userId: demoStudent._id, postId: post3._id },
      { userId: demoAlumni._id, postId: post2._id },
      { userId: alumniUsers[1]._id, postId: post2._id },
      { userId: studentUsers[1]._id, postId: post1._id }
    ]);

    await SavedPost.create([
      { userId: demoStudent._id, postId: post1._id },
      { userId: demoStudent._id, postId: post5._id }
    ]);

    // Top-level comments and replies
    const comment1 = await Comment.create({
      userId: demoStudent._id,
      postId: post1._id,
      content: 'Massive congratulations Marcus! Your advice on VPC peering and IAM policies was instrumental when I was studying for cloud foundations.'
    });

    await Comment.create({
      userId: demoAlumni._id,
      postId: post1._id,
      content: 'Thank you Alex! Always happy to support. Let us schedule a follow-up session soon to review your upcoming roadmap.',
      parentCommentId: comment1._id
    });

    const comment2 = await Comment.create({
      userId: demoAlumni._id,
      postId: post2._id,
      content: 'Incredible achievement Alex! So proud to have mentored you through the preparation. Meta is getting an exceptional engineer.'
    });

    await Comment.create({
      userId: studentUsers[1]._id,
      postId: post2._id,
      content: 'Way to go Alex! Truly well deserved, see you on campus tomorrow!'
    });

    // 17. Seed Networking Notifications for demoStudent
    await Notification.create([
      {
        recipientId: demoStudent._id,
        senderId: alumniUsers[1]._id,
        type: 'CONNECTION_REQUEST',
        title: 'Connection Request',
        message: 'Elena Rostova sent you a connection request.',
        link: '/network',
        isRead: false
      },
      {
        recipientId: demoStudent._id,
        senderId: demoAlumni._id,
        type: 'CONNECTION_ACCEPTED',
        title: 'Connection Accepted',
        message: 'Marcus Vance accepted your connection request.',
        link: `/profile/${demoAlumni._id}`,
        isRead: false
      },
      {
        recipientId: demoStudent._id,
        senderId: demoAlumni._id,
        type: 'POST_LIKE',
        title: 'New Like',
        message: 'Marcus Vance liked your post.',
        link: `/posts/${post2._id}`,
        isRead: false
      },
      {
        recipientId: demoStudent._id,
        senderId: demoAlumni._id,
        type: 'POST_COMMENT',
        title: 'New Comment',
        message: 'Marcus Vance commented on your post: "Incredible achievement Alex!..."',
        link: `/posts/${post2._id}`,
        isRead: false
      },
      {
        recipientId: demoStudent._id,
        senderId: studentUsers[2]._id,
        type: 'FOLLOW',
        title: 'New Follower',
        message: 'Emily Zhang started following you.',
        link: `/profile/${studentUsers[2]._id}`,
        isRead: true
      }
    ]);

    // 13. Audit Log
    await AuditLog.create({
      actorId: admin._id,
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'System',
      metadata: { description: 'Initial seed data successfully populated' }
    });

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('------------------------------------------------------');
    console.log('🔑 DEMO ACCOUNTS FOR LOGIN:');
    console.log('   👑 Admin:   admin@example.com   | Password123!');
    console.log('   🎓 Student: student@example.com | Password123!');
    console.log('   💼 Alumni:  alumni@example.com  | Password123!');
    console.log('======================================================\n');

    if (require.main === module) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('[Seed Error]:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
