import React, { useState, useRef } from 'react';
import {
  Image,
  Award,
  Code,
  Briefcase,
  X,
  Plus,
  Sparkles,
  Loader2,
  FileText,
  Upload,
  Hash
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import postApi from '../../services/postApi';
import api from '../../services/api';

const CATEGORIES = [
  'General',
  'Qualifications',
  'Certifications',
  'Projects',
  'Internships',
  'Placements',
  'Hackathons',
  'Awards',
  'Achievements',
  'Courses',
  'Career updates',
  'Publications',
  'Other'
];

const CreatePostCard = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [mediaList, setMediaList] = useState([]);
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');

  const fileInputRef = useRef(null);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('General');
    setMediaList([]);
    setSkills([]);
    setCurrentSkill('');
    setHashtags([]);
    setCurrentTag('');
    setIsOpen(false);
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = currentSkill.trim().replace(/^,/, '');
      if (val && !skills.includes(val)) {
        setSkills([...skills, val]);
        setCurrentSkill('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      const val = currentTag.trim().replace(/^[#,\s]+/, '');
      if (val && !hashtags.includes(val.toLowerCase())) {
        setHashtags([...hashtags, val.toLowerCase()]);
        setCurrentTag('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setHashtags(hashtags.filter((t) => t !== tagToRemove));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/users/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.fileUrl) {
        const isDoc = file.type.includes('pdf') || file.type.includes('document');
        setMediaList([
          ...mediaList,
          {
            url: res.data.fileUrl,
            type: isDoc ? 'document' : 'image',
            name: file.name,
            size: file.size
          }
        ]);
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleRemoveMedia = (index) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaList.length === 0) return;

    setLoading(true);
    try {
      const res = await postApi.createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        media: mediaList,
        skills,
        hashtags
      });

      if (res.data && onPostCreated) {
        onPostCreated(res.data);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setLoading(false);
    }
  };

  const openWithCategory = (cat) => {
    setCategory(cat);
    setIsOpen(true);
  };

  if (!user) return null;

  return (
    <>
      {/* Feed Trigger Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={user.name}
            className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
          />
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 text-left px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs sm:text-sm font-medium transition duration-200"
          >
            Share an achievement, project, certification or career update...
          </button>
        </div>

        {/* Quick action buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between sm:justify-start gap-1 sm:gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => openWithCategory('Certifications')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition"
          >
            <Award className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Certification</span>
          </button>

          <button
            onClick={() => openWithCategory('Projects')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition"
          >
            <Code className="w-4 h-4 text-purple-500" />
            <span className="hidden sm:inline">Project</span>
          </button>

          <button
            onClick={() => openWithCategory('Placements')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition"
          >
            <Briefcase className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Placement</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => fileInputRef.current?.click(), 200);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition"
          >
            <Image className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Media</span>
          </button>
        </div>
      </div>

      {/* Rich Post Composer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500">Post to University Network</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                      Public
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Post Title (Optional) */}
              <div>
                <input
                  type="text"
                  placeholder="Post headline or title (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              {/* Main Content Area */}
              <div>
                <textarea
                  rows={5}
                  placeholder="What would you like to talk about? Share details about your journey, challenges, learnings, or recommendations..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none leading-relaxed"
                />
              </div>

              {/* Media Preview Area */}
              {mediaList.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700">Attached Media & Certifications</p>
                  <div className="grid grid-cols-2 gap-3">
                    {mediaList.map((media, index) => (
                      <div
                        key={index}
                        className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50"
                      >
                        {media.type === 'image' ? (
                          <img
                            src={media.url}
                            alt={media.name || 'Post attachment'}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 flex flex-col items-center justify-center p-3 text-center">
                            <FileText className="w-8 h-8 text-indigo-600 mb-1" />
                            <span className="text-xs font-semibold text-slate-700 truncate max-w-full">
                              {media.name || 'Document'}
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(index)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Tags Builder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Associated Skills (Press Enter to add)</span>
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-semibold"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={skills.length === 0 ? 'e.g. React, Python, Cloud Architecture...' : 'Add more...'}
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="flex-1 min-w-[140px] bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Hashtags Builder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-purple-500" />
                  <span>Hashtags</span>
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-semibold"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={hashtags.length === 0 ? 'Type tag and press space/enter...' : 'Add tag...'}
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 min-w-[140px] bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Modal Footer / Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                >
                  {uploadingMedia ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploadingMedia ? 'Uploading...' : 'Attach Image / Certificate'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (!content.trim() && mediaList.length === 0)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePostCard;
