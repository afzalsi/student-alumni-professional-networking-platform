import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { jobApi } from '../../services/jobApi';
import { userApi } from '../../services/userApi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UploadCloud, FileText } from 'lucide-react';

const JobApplyModal = ({ isOpen, onClose, job, onSuccess }) => {
  const { profile } = useAuth();
  const [resumeUrl, setResumeUrl] = useState(profile?.resumeUrl || '');
  const [coverLetter, setCoverLetter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useNotifications();

  if (!job) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);

    try {
      const res = await userApi.uploadFile(formData);
      if (res.success && res.data) {
        setResumeUrl(res.data.fileUrl);
        showToast('Resume Uploaded', 'Your resume was successfully attached.', 'success');
      }
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resumeUrl) {
      return setError('Please provide or upload a resume');
    }

    setLoading(true);

    try {
      await jobApi.applyForJob(job._id, {
        resumeUrl,
        coverLetter
      });
      showToast('Application Submitted! 🎉', `You have successfully applied for ${job.title} at ${job.company}.`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply for ${job.title}`}>
      <div className="mb-4">
        <p className="text-xs text-slate-500 font-semibold">{job.company} • {job.location}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resume Attachment */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Resume / CV</label>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div className="text-xs">
                {resumeUrl ? (
                  <span className="font-semibold text-slate-800 truncate block max-w-xs">
                    Resume Attached ({resumeUrl.split('/').pop()})
                  </span>
                ) : (
                  <span className="text-slate-400">No resume attached</span>
                )}
              </div>
            </div>

            <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Upload PDF'}</span>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Cover Note / Introduction (Optional)</label>
          <textarea
            rows={4}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Introduce yourself, highlight relevant projects and why you are interested in this position..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={loading}>
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JobApplyModal;
