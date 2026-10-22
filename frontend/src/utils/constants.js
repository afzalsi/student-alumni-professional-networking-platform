export const ROLES = {
  STUDENT: 'student',
  ALUMNI: 'alumni',
  ADMIN: 'admin'
};

export const MENTORSHIP_REQUEST_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

export const SESSION_STATUS = {
  REQUESTED: 'REQUESTED',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW'
};

export const APPLICATION_STATUS = {
  APPLIED: 'APPLIED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  SELECTED: 'SELECTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
};

export const JOB_TYPES = [
  { value: '', label: 'All Job Types' },
  { value: 'full-time', label: 'Full Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' }
];

export const WORK_MODES = [
  { value: '', label: 'All Work Modes' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' }
];

export const INDUSTRIES = [
  'All Industries',
  'Information Technology / SaaS',
  'Software Engineering',
  'Artificial Intelligence',
  'Fintech / Cloud Infrastructure',
  'Consumer Tech / Media',
  'E-commerce & Analytics',
  'Quantitative Finance',
  'Mobile Apps',
  'Cybersecurity',
  'Healthcare & Analytics'
];
