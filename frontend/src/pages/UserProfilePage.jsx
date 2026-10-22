import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  FolderGit2,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Trophy,
  Github,
  Linkedin,
  FileText,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/userApi';
import { postApi } from '../services/postApi';
import FollowButton from '../components/networking/FollowButton';
import ConnectionButton from '../components/networking/ConnectionButton';
import PostCard from '../components/networking/PostCard';
import Badge from '../components/common/Badge';

const UserProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'experience', 'projects', 'certifications', 'posts'
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await userApi.getUserById(id);
        if (res.success && res.data) {
          setProfileData(res.data);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'posts' && id) {
      const fetchPosts = async () => {
        try {
          setPostsLoading(true);
          const res = await postApi.getUserPosts(id);
          const list = Array.isArray(res.data) ? res.data : (res.data?.posts || []);
          setPosts(list);
        } catch (err) {
          console.error(err);
        } finally {
          setPostsLoading(false);
        }
      };
      fetchPosts();
    }
  }, [activeTab, id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-400 animate-pulse">
        Loading professional profile...
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm font-semibold text-rose-600">{error || 'User not found'}</p>
        <Link
          to="/network"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Network
        </Link>
      </div>
    );
  }

  const { user, profile } = profileData;
  const isOwnProfile = currentUser?._id === user._id;

  // Flatten education, experience, projects, certifications, achievements
  const experiences = profile?.experience || [];
  const education = profile?.education || [];
  const certifications = profile?.certifications || [];
  const projects = profile?.projects || [];
  const achievements = profile?.achievements || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Profile Card / Header */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile Content */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="relative">
              <img
                src={
                  user.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                }
                alt={user.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
              />
              {user.isVerified && (
                <div
                  className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-md text-emerald-500"
                  title="Verified Member"
                >
                  <CheckCircle2 className="w-5 h-5 fill-emerald-50" />
                </div>
              )}
            </div>

            {/* Actions for other users or edit link */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              {isOwnProfile ? (
                <Link
                  to="/profile"
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
                >
                  Edit Profile & Settings
                </Link>
              ) : (
                <>
                  <FollowButton
                    targetUserId={user._id}
                    initialIsFollowing={user.isFollowing}
                  />
                  <ConnectionButton
                    targetUserId={user._id}
                    initialStatus={user.connectionStatus}
                    connectionId={user.connectionId}
                  />
                  <Link
                    to="/messages"
                    className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    title="Send Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
                <Badge
                  variant={
                    user.role === 'admin'
                      ? 'purple'
                      : user.role === 'alumni'
                      ? 'success'
                      : 'primary'
                  }
                  size="sm"
                >
                  {user.role?.toUpperCase()}
                </Badge>
              </div>

              {/* Headline / Job Role / Department */}
              <p className="text-sm font-semibold text-slate-700 mt-1">
                {user.role === 'alumni' && profile?.jobTitle
                  ? `${profile.jobTitle} at ${profile.company || 'Tech Leader'}`
                  : `${user.department || 'Computer Science'} Student`}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                {user.department && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    {user.department}
                  </span>
                )}
                {user.graduationYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Class of {user.graduationYear}
                  </span>
                )}
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {user.location}
                  </span>
                )}
              </div>
            </div>

            {/* Networking Stats: Followers | Following | Connections */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-6 text-xs">
              <span className="text-slate-600">
                <strong className="text-slate-900 font-black text-sm">
                  {user.followersCount?.toLocaleString() || 0}
                </strong>{' '}
                Followers
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">
                <strong className="text-slate-900 font-black text-sm">
                  {user.followingCount?.toLocaleString() || 0}
                </strong>{' '}
                Following
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">
                <strong className="text-slate-900 font-black text-sm">
                  {user.connectionsCount?.toLocaleString() || 0}
                </strong>{' '}
                Connections
              </span>
            </div>

            {/* Social / External Links */}
            {(profile?.githubUrl || profile?.linkedinUrl || profile?.resumeUrl) && (
              <div className="flex items-center gap-2 pt-2">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {profile.resumeUrl && (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Resume</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Profile Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto scrollbar-none">
            {[
              { id: 'about', label: 'About & Skills' },
              { id: 'experience', label: `Experience (${experiences.length})` },
              { id: 'projects', label: `Projects (${projects.length})` },
              { id: 'certifications', label: `Certifications (${certifications.length})` },
              { id: 'achievements', label: `Achievements (${achievements.length})` },
              { id: 'posts', label: 'Posts' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab: About & Skills */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          {/* Bio */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">About</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {user.bio || 'No biography provided yet.'}
            </p>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Skills & Competencies</h3>
            {user.skills && user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-xl"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No skills listed yet.</p>
            )}
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Education</span>
            </h3>

            {education.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {education.map((edu, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0">
                    <h4 className="text-xs font-bold text-slate-900">{edu.degree}</h4>
                    <p className="text-xs text-slate-600">{edu.institution}</p>
                    {edu.year && <p className="text-[11px] text-slate-400">{edu.year}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                <p className="font-semibold text-slate-800">
                  {user.department || 'Undergraduate Degree'}
                </p>
                <p className="text-slate-400">Graduation: {user.graduationYear || 'N/A'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Experience */}
      {activeTab === 'experience' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Professional Experience & Internships</span>
          </h3>

          {experiences.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No professional experience listed.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {experiences.map((exp, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{exp.position}</h4>
                    <span className="text-[11px] font-medium text-slate-400">{exp.duration}</span>
                  </div>
                  <p className="text-xs text-indigo-600 font-semibold">{exp.company}</p>
                  {exp.description && (
                    <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
            <span>Featured Projects</span>
          </h3>

          {projects.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No projects listed.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{proj.name}</h4>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {proj.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Certifications */}
      {activeTab === 'certifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Certifications & Licenses</span>
          </h3>

          {certifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No certifications listed.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {certifications.map((cert, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{cert.name}</h4>
                    <p className="text-xs text-slate-500">
                      {cert.issuingOrganization} • {cert.date}
                    </p>
                  </div>
                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <span>Show Credential</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Achievements */}
      {activeTab === 'achievements' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Honors, Hackathons & Awards</span>
          </h3>

          {achievements.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No honors or achievements listed.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {achievements.map((ach, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{ach.title}</h4>
                    {ach.date && (
                      <span className="text-[11px] text-slate-400">{ach.date}</span>
                    )}
                  </div>
                  {ach.description && (
                    <p className="text-xs text-slate-500 mt-1">{ach.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Posts by {user.name} ({posts.length})
          </h3>

          {postsLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No professional posts published yet.
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
