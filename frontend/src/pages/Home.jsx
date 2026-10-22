import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Briefcase,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  Star
} from 'lucide-react';
import Button from '../components/common/Button';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-indigo-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              University Alumni–Student Career Ecosystem
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Connect. Learn. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">Grow.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Empowering students through verified alumni mentorship, rule-based job recommendations, 1-on-1 career coaching sessions, and exclusive university hiring networks.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link to="/mentors">
                <Button size="lg" className="w-full sm:w-auto shadow-md">
                  <Users className="w-4 h-4" />
                  <span>Find a Mentor</span>
                </Button>
              </Link>
              <Link to="/jobs">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Briefcase className="w-4 h-4" />
                  <span>Explore Jobs & Internships</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <span>Join Network</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-black text-indigo-600 mb-1">500+</div>
              <div className="text-xs font-bold text-slate-700">Verified Alumni</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Google, Microsoft, Stripe</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-black text-emerald-600 mb-1">94%</div>
              <div className="text-xs font-bold text-slate-700">Match Accuracy</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Multi-criteria scoring</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-black text-amber-500 mb-1">1,200+</div>
              <div className="text-xs font-bold text-slate-700">Mentorship Sessions</div>
              <div className="text-[11px] text-slate-400 mt-0.5">1-on-1 mock interviews</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="text-3xl font-black text-purple-600 mb-1">350+</div>
              <div className="text-xs font-bold text-slate-700">Job Placements</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Internships & full-time roles</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Workflow</h2>
            <p className="text-3xl font-black text-slate-900 tracking-tight">How AlumNet Works</p>
            <p className="text-sm text-slate-500 mt-2">
              From student discovery to interview success in four seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Build Profile</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your department, graduation year, core skills, target industries, and career ambitions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 font-black flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Get Matched</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our recommendation engine matches you with relevant alumni mentors and active hiring opportunities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 font-black flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Mentorship & Chat</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Request guidance, schedule video sessions, chat in real-time, and track career milestones.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 font-black flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1.5">Apply & Get Placed</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apply directly to alumni-posted jobs and internships with fast-tracked internal referrals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-indigo-50/60 border border-indigo-100">
              <Users className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">1-on-1 Mentorship</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect directly with industry leaders working at Google, Microsoft, and high-growth startups for resume critique and system design mock interviews.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-emerald-50/60 border border-emerald-100">
              <Briefcase className="w-8 h-8 text-emerald-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Job Referrals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Alumni post vetted internships and full-time roles exclusively for verified students, bypassing generic resume black holes.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-amber-50/60 border border-amber-100">
              <Calendar className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Live Tech Events & Resources</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attend alumni webinars, coding masterclasses, tech fairs, and download curated roadmaps for LeetCode, system design, and Docker.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Success Stories</h2>
            <p className="text-3xl font-black tracking-tight">Hear from Our Community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700">
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic mb-6">
                "Through AlumNet, I connected with David Miller (Google Senior Staff Engineer). He conducted 3 system design mock interviews with me, and I ended up landing my dream role at Google!"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="Student"
                  className="w-10 h-10 rounded-full object-cover border border-indigo-400"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">Alex Rivera</h4>
                  <p className="text-xs text-slate-400">Class of 2026 — Software Engineer at Google</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700">
              <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic mb-6">
                "Mentoring students on AlumNet is deeply rewarding. The platform makes slot scheduling, chat, and progress tracking effortless. We’ve already hired two amazing interns from here."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100"
                  alt="Alumni"
                  className="w-10 h-10 rounded-full object-cover border border-emerald-400"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">David Miller</h4>
                  <p className="text-xs text-slate-400">Google Senior Staff Engineer (Class of 2019)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 bg-gradient-to-tr from-indigo-700 to-indigo-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Ready to accelerate your career journey?
          </h2>
          <p className="text-sm sm:text-base text-indigo-200 max-w-xl mx-auto mb-8">
            Create your account in under 2 minutes. Connect with mentors, unlock exclusive job postings, and join upcoming tech webinars.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 font-bold px-8 shadow-xl">
              Get Started Now — It's Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
