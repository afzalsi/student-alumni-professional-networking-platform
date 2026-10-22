import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Lock,
  UploadCloud,
  Save,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Award,
  FolderGit2,
  Trophy,
  Plus,
  Trash2,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/userApi';
import { authApi } from '../services/authApi';
import { networkApi } from '../services/networkApi';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useNotifications } from '../context/NotificationContext';

const ProfilePage = () => {
  const { user, profile, profileCompletion, updateProfileData } = useAuth();
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'experience', 'security'
  const [networkCounts, setNetworkCounts] = useState({ followers: 0, following: 0, connections: 0 });

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    graduationYear: user?.graduationYear || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: (user?.skills || []).join(', '),
    interests: (user?.interests || []).join(', '),
    careerGoals: user?.careerGoals || '',
    // Student specific
    preferredIndustry: profile?.preferredIndustry || '',
    preferredJobRole: profile?.preferredJobRole || '',
    resumeUrl: profile?.resumeUrl || '',
    linkedinUrl: profile?.linkedinUrl || '',
    githubUrl: profile?.githubUrl || '',
    // Alumni specific
    company: profile?.company || '',
    jobTitle: profile?.jobTitle || '',
    industry: profile?.industry || '',
    experienceYears: profile?.experienceYears || 0,
    expertise: (profile?.expertise || []).join(', '),
    mentorAvailable: profile?.mentorAvailable ?? true,
    availabilitySchedule: profile?.availabilitySchedule || ''
  });

  // Array states for Experience, Education, Certifications, Projects, Achievements
  const [experience, setExperience] = useState(profile?.experience || []);
  const [education, setEducation] = useState(profile?.education || []);
  const [certifications, setCertifications] = useState(profile?.certifications || []);
  const [projects, setProjects] = useState(profile?.projects || []);
  const [achievements, setAchievements] = useState(profile?.achievements || []);

  // Fetch network stats
  useEffect(() => {
    if (user?._id) {
      networkApi.getUserNetworkCounts(user._id).then((res) => {
        if (res.success && res.data) {
          setNetworkCounts(res.data);
        }
      }).catch(console.error);
    }
  }, [user?._id]);

  // Password state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append('avatar', file);
    setUploading(true);

    try {
      const res = await userApi.uploadFile(form);
      if (res.success && res.data) {
        await updateProfileData({ avatar: res.data.fileUrl });
        showToast('Avatar Updated', 'Your profile picture has been updated.', 'success');
      }
    } catch (err) {
      showToast('Upload Error', err.message, 'danger');
    } finally {
      setUploading(false);
    }
  };

  // Add / Remove helpers
  const addExperience = () => {
    setExperience([...experience, { company: '', position: '', duration: '', description: '' }]);
  };
  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, { degree: '', institution: '', year: '' }]);
  };
  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    setCertifications([...certifications, { name: '', issuingOrganization: '', date: '', link: '' }]);
  };
  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects([...projects, { name: '', description: '', technologies: [], link: '' }]);
  };
  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addAchievement = () => {
    setAchievements([...achievements, { title: '', description: '', date: '' }]);
  };
  const removeAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateProfileData({
        ...formData,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map((i) => i.trim()).filter(Boolean),
        expertise: formData.expertise.split(',').map((e) => e.trim()).filter(Boolean),
        graduationYear: formData.graduationYear ? Number(formData.graduationYear) : null,
        experienceYears: Number(formData.experienceYears),
        experience,
        education,
        certifications,
        projects,
        achievements
      });
      showToast('Profile Saved! ✨', 'Your changes have been saved successfully.', 'success');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setError('New passwords do not match');
    }

    setLoading(true);

    try {
      await authApi.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      showToast('Password Changed', 'Your password has been updated securely.', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Widget */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name}
                className="w-20 h-20 rounded-3xl object-cover border-4 border-indigo-50 shadow-md"
              />
              <label className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition text-white text-xs font-bold">
                <span>{uploading ? '...' : 'Change'}</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{user?.name}</h1>
                {user?.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" title="Verified" />
                )}
              </div>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={user?.role === 'admin' ? 'purple' : user?.role === 'alumni' ? 'success' : 'primary'} size="xs">
                  {user?.role?.toUpperCase()}
                </Badge>
                <span className="text-[11px] text-slate-400 self-center">
                  Profile Completion: <strong className="text-indigo-600">{profileCompletion}%</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to={`/users/${user?._id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public Profile</span>
            </Link>
          </div>
        </div>

        {/* Networking Bar: Followers | Following | Connections */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 text-xs">
            <Link to="/network" className="hover:text-indigo-600 transition">
              <strong className="text-slate-900 font-black text-sm">{networkCounts.followers}</strong>{' '}
              <span className="text-slate-500">Followers</span>
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/network" className="hover:text-indigo-600 transition">
              <strong className="text-slate-900 font-black text-sm">{networkCounts.following}</strong>{' '}
              <span className="text-slate-500">Following</span>
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/network" className="hover:text-indigo-600 transition">
              <strong className="text-slate-900 font-black text-sm">{networkCounts.connections}</strong>{' '}
              <span className="text-slate-500">Connections</span>
            </Link>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'profile' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'experience' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Career & Projects
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'security' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Security
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Tab 1: Profile Form Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Personal & Academic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Year</label>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio / About</label>
            <textarea
              rows={3}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell others about your background, career updates, and ambitions..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Skills (Comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Python, System Design, SQL"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Social Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile URL</label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Role specific inputs */}
          {user?.role === 'student' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-indigo-700">Student Career Preferences</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Industry</label>
                  <input
                    type="text"
                    name="preferredIndustry"
                    value={formData.preferredIndustry}
                    onChange={handleChange}
                    placeholder="e.g. Artificial Intelligence or Fintech"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Job Role</label>
                  <input
                    type="text"
                    name="preferredJobRole"
                    value={formData.preferredJobRole}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Software Engineer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resume Link (PDF URL)</label>
                <input
                  type="url"
                  name="resumeUrl"
                  value={formData.resumeUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {user?.role === 'alumni' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-emerald-700">Alumni Professional & Mentorship Profile</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Google, Microsoft"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g. Senior Staff Engineer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mentoring Expertise Areas</label>
                <input
                  type="text"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  placeholder="e.g. System Design, Resume Review, Mock Interviews"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">General Availability Schedule</label>
                <input
                  type="text"
                  name="availabilitySchedule"
                  value={formData.availabilitySchedule}
                  onChange={handleChange}
                  placeholder="e.g. Tuesdays and Thursdays 6:00 PM - 8:00 PM PST"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  name="mentorAvailable"
                  checked={formData.mentorAvailable}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
                <span>Enable "Available as Mentor" for students</span>
              </label>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" size="md" isLoading={loading}>
              <Save className="w-4 h-4" />
              <span>Save Basic Info</span>
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Career, Experience & Projects */}
      {activeTab === 'experience' && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Work Experience / Internships */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Work Experience & Internships</span>
              </h3>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Experience
              </button>
            </div>

            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No experience entries added.</p>
            ) : (
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Company / Org</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx].company = e.target.value;
                            setExperience(updated);
                          }}
                          placeholder="e.g. Google"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Position / Role</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx].position = e.target.value;
                            setExperience(updated);
                          }}
                          placeholder="e.g. Software Engineer Intern"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[idx].duration = e.target.value;
                            setExperience(updated);
                          }}
                          placeholder="e.g. June 2025 - Aug 2025"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].description = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="Key accomplishments, technologies, and responsibilities..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-600" />
                <span>Featured Projects</span>
              </h3>
              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Project
              </button>
            </div>

            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No projects added.</p>
            ) : (
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].name = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="e.g. Distributed Task Queue"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Project / GitHub Link</label>
                        <input
                          type="url"
                          value={proj.link}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].link = e.target.value;
                            setProjects(updated);
                          }}
                          placeholder="https://github.com/..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Technologies (Comma-separated)</label>
                      <input
                        type="text"
                        value={(proj.technologies || []).join(', ')}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].technologies = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                          setProjects(updated);
                        }}
                        placeholder="e.g. React, Node.js, Redis, Docker"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[idx].description = e.target.value;
                          setProjects(updated);
                        }}
                        placeholder="What problem does it solve and what was your architecture?"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Certifications & Licenses</span>
              </h3>
              <button
                type="button"
                onClick={addCertification}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Certification
              </button>
            </div>

            {certifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No certifications added.</p>
            ) : (
              <div className="space-y-4">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeCertification(idx)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[idx].name = e.target.value;
                            setCertifications(updated);
                          }}
                          placeholder="e.g. AWS Certified Solutions Architect"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Issuing Organization</label>
                        <input
                          type="text"
                          value={cert.issuingOrganization}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[idx].issuingOrganization = e.target.value;
                            setCertifications(updated);
                          }}
                          placeholder="e.g. Amazon Web Services"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Date</label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[idx].date = e.target.value;
                            setCertifications(updated);
                          }}
                          placeholder="e.g. October 2025"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Credential URL</label>
                        <input
                          type="url"
                          value={cert.link}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[idx].link = e.target.value;
                            setCertifications(updated);
                          }}
                          placeholder="https://..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Education Background</span>
              </h3>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Education
              </button>
            </div>

            {education.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No education entries added.</p>
            ) : (
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].degree = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="e.g. B.Tech Computer Science"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].institution = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="e.g. Stanford University"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Year</label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].year = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="e.g. 2022 - 2026"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Honors & Achievements</span>
              </h3>
              <button
                type="button"
                onClick={addAchievement}
                className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Achievement
              </button>
            </div>

            {achievements.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No achievements added.</p>
            ) : (
              <div className="space-y-4">
                {achievements.map((ach, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeAchievement(idx)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Award / Honor Title</label>
                        <input
                          type="text"
                          value={ach.title}
                          onChange={(e) => {
                            const updated = [...achievements];
                            updated[idx].title = e.target.value;
                            setAchievements(updated);
                          }}
                          placeholder="e.g. 1st Place National Hackathon"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Date</label>
                        <input
                          type="text"
                          value={ach.date}
                          onChange={(e) => {
                            const updated = [...achievements];
                            updated[idx].date = e.target.value;
                            setAchievements(updated);
                          }}
                          placeholder="e.g. November 2025"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                      <input
                        type="text"
                        value={ach.description}
                        onChange={(e) => {
                          const updated = [...achievements];
                          updated[idx].description = e.target.value;
                          setAchievements(updated);
                        }}
                        placeholder="Details about the competition or recognition..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="md" isLoading={loading}>
              <Save className="w-4 h-4" />
              <span>Save Career & Projects</span>
            </Button>
          </div>
        </form>
      )}

      {/* Tab 3: Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 max-w-lg">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Update Account Password
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" size="sm" isLoading={loading}>
              Update Password
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
