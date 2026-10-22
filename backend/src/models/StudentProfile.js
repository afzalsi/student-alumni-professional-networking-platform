const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    resumeUrl: {
      type: String,
      default: ''
    },
    portfolioUrl: {
      type: String,
      default: ''
    },
    githubUrl: {
      type: String,
      default: ''
    },
    linkedinUrl: {
      type: String,
      default: ''
    },
    preferredIndustry: {
      type: String,
      default: ''
    },
    preferredJobRole: {
      type: String,
      default: ''
    },
    careerGoals: {
      type: String,
      default: ''
    },
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
        grade: String
      }
    ],
    projects: [
      {
        title: String,
        description: String,
        link: String,
        technologies: [String]
      }
    ],
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        description: String
      }
    ],
    certifications: [
      {
        name: String,
        issuingOrganization: String,
        issueDate: String,
        credentialUrl: String,
        credentialId: String
      }
    ],
    achievements: [
      {
        title: String,
        description: String,
        date: String,
        awardUrl: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
