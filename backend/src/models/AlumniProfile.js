const mongoose = require('mongoose');

const alumniProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    jobTitle: {
      type: String,
      trim: true,
      default: ''
    },
    industry: {
      type: String,
      trim: true,
      default: ''
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    expertise: {
      type: [String],
      default: []
    },
    mentorAvailable: {
      type: Boolean,
      default: true
    },
    maxMentees: {
      type: Number,
      default: 5
    },
    preferredTopics: {
      type: [String],
      default: []
    },
    availabilitySchedule: {
      type: String,
      default: 'Weekends / Evenings'
    },
    availableSlots: [
      {
        dayOfWeek: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        startTime: String, // e.g. "17:00"
        endTime: String    // e.g. "18:00"
      }
    ],
    mentorshipMode: {
      type: String,
      enum: ['online', 'in-person', 'hybrid'],
      default: 'online'
    },
    linkedinUrl: {
      type: String,
      default: ''
    },
    portfolioUrl: {
      type: String,
      default: ''
    },
    ratingAverage: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
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
    projects: [
      {
        title: String,
        description: String,
        link: String,
        technologies: [String]
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

alumniProfileSchema.index({ company: 1 });
alumniProfileSchema.index({ industry: 1 });
alumniProfileSchema.index({ mentorAvailable: 1 });

module.exports = mongoose.model('AlumniProfile', alumniProfileSchema);
