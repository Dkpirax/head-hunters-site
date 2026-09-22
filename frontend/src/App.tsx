import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Layout & Home Components
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ProofStrip } from "./components/home/ProofStrip";
import { Standards } from "./components/home/Standards";
import { Story } from "./components/home/Story";
import { Testimonials } from "./components/home/Testimonials";
import { GlobalReach } from "./components/home/GlobalReach";
import { Hero } from "./components/home/Hero";
import { ServicesBento } from "./components/home/ServicesBento";
import { EmployerSection } from "./components/home/EmployerSection";
import { JobsSection } from "./components/home/JobsSection";
import { ContactSection } from "./components/home/ContactSection";
import { WorkforceAnimation } from "./components/home/WorkforceAnimation";

// Dedicated Pages
import { EmployersPage } from "./pages/EmployersPage";
import { CandidatesPage } from "./pages/CandidatesPage";
import { ExecutiveSearchPage } from "./pages/ExecutiveSearchPage";
import { ConfidentialRecruitmentPage } from "./pages/ConfidentialRecruitmentPage";
import { SectorRecruitmentPage } from "./pages/SectorRecruitmentPage";
import { JobsPage } from "./pages/JobsPage";
import { JobDetailPage } from "./pages/JobDetailPage";
import { ContactPage } from "./pages/ContactPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Admin & Auth Pages
import { LoginPage } from "./pages/Login";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminJobsPage } from "./pages/admin/Jobs";
import { AdminSettingsPage } from "./pages/admin/Settings";
import { AdminUsersPage } from "./pages/admin/Users";
import { AdminEnquiriesPage } from "./pages/admin/Enquiries";
import { AdminInsightsPage } from "./pages/admin/Insights";
import { AdminChatPage } from "./pages/admin/Chat";

const DEFAULT_SETTINGS = {
  site_name: "Head Hunters",
  hero_headline: "Hire Better. Grow Faster.",
  hero_subheadline: "Precision hiring for modern businesses across Sri Lanka.",
  hero_cta_primary: "Talk to a consultant",
  hero_cta_secondary: "Submit your CV",
  show_hero: true,
  show_stats: true,
  show_services: true,
  show_standards: true,
  show_employer_flow: true,
  show_jobs: true,
  show_story: true,
  show_global_reach: true,
  show_testimonials: true,
  show_contact: true,
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0B0C] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#161817] border border-white/10 p-8 rounded-2xl">
            <h1 className="text-2xl font-bold text-amber-400 mb-3">Notice</h1>
            <p className="text-white/70 text-sm mb-6">
              A temporary interface issue occurred. Please refresh the page to reload the platform.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-[#02695e] hover:bg-[#027d6f] text-white text-sm font-semibold transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function HomePage() {
  const [settings, setSettings] = useState<any>(null);
  const [latestJobs, setLatestJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, jobsRes] = await Promise.all([
          fetch('/api/settings').catch(() => null),
          fetch('/api/jobs/latest').catch(() => null)
        ]);
        
        let settingsData: any = null;
        if (settingsRes && settingsRes.ok) {
          try {
            settingsData = await settingsRes.json();
          } catch (_) {}
        }
        
        let jobsData: any = null;
        if (jobsRes && jobsRes.ok) {
          try {
            jobsData = await jobsRes.json();
          } catch (_) {}
        }
        
        setSettings(settingsData && !settingsData.error ? settingsData : DEFAULT_SETTINGS);
        setLatestJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch (error) {
        console.error("Failed to load homepage data:", error);
        setSettings(DEFAULT_SETTINGS);
        setLatestJobs([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const activeSettings = settings || DEFAULT_SETTINGS;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#04a891] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main>
        {activeSettings.show_hero && <Hero settings={activeSettings} />}
        {activeSettings.show_stats && <ProofStrip />}

        {/* Intro strip */}
        {activeSettings.show_hero && (
          <section className="bg-[#f2f3ef] py-20">
            <div className="max-w-[1200px] mx-auto px-5">
              <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-14 items-start">
                <div>
                  <p className="eyebrow-dark eyebrow mb-4">People. Precision. Progress.</p>
                  <h2 className="text-[clamp(30px,4.5vw,58px)] font-black text-[#111413] leading-[0.95] tracking-tight">
                    Not a job board. A complete workforce partner.
                  </h2>
                </div>
                <div>
                  <p className="text-[#111413]/60 text-[17px] leading-relaxed mt-2">
                    Head Hunters is designed for businesses that need a clearer hiring process, stronger shortlist quality and operational support that scales beyond one vacancy. The platform leads with service, trust and outcomes.
                  </p>
                  <WorkforceAnimation />
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSettings.show_services && <ServicesBento settings={activeSettings} />}
        {activeSettings.show_standards && <Standards />}
        {activeSettings.show_employer_flow && <EmployerSection />}
        {activeSettings.show_jobs && <JobsSection recentJobs={latestJobs} />}
        {activeSettings.show_story && <Story settings={activeSettings} />}
        {activeSettings.show_global_reach && <GlobalReach settings={activeSettings} />}
        {activeSettings.show_testimonials && <Testimonials settings={activeSettings} />}
        {activeSettings.show_contact && <ContactSection settings={activeSettings} />}
      </main>
      <Footer settings={activeSettings} />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Commercial & Information Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/employers" element={<EmployersPage />} />
          <Route path="/employers/" element={<EmployersPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/" element={<CandidatesPage />} />
          <Route path="/executive-search-sri-lanka" element={<ExecutiveSearchPage />} />
          <Route path="/executive-search-sri-lanka/" element={<ExecutiveSearchPage />} />
          <Route path="/confidential-recruitment-sri-lanka" element={<ConfidentialRecruitmentPage />} />
          <Route path="/confidential-recruitment-sri-lanka/" element={<ConfidentialRecruitmentPage />} />
          
          {/* Sector Specialized Pages */}
          <Route path="/ceo-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="ceo-recruitment-sri-lanka" />} />
          <Route path="/ceo-recruitment-sri-lanka/" element={<SectorRecruitmentPage sectorKey="ceo-recruitment-sri-lanka" />} />
          <Route path="/finance-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="finance-recruitment-sri-lanka" />} />
          <Route path="/finance-recruitment-sri-lanka/" element={<SectorRecruitmentPage sectorKey="finance-recruitment-sri-lanka" />} />
          <Route path="/internal-audit-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="internal-audit-recruitment-sri-lanka" />} />
          <Route path="/internal-audit-recruitment-sri-lanka/" element={<SectorRecruitmentPage sectorKey="internal-audit-recruitment-sri-lanka" />} />
          <Route path="/legal-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="legal-recruitment-sri-lanka" />} />
          <Route path="/legal-recruitment-sri-lanka/" element={<SectorRecruitmentPage sectorKey="legal-recruitment-sri-lanka" />} />
          <Route path="/hr-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="hr-recruitment-sri-lanka" />} />
          <Route path="/hr-recruitment-sri-lanka/" element={<SectorRecruitmentPage sectorKey="hr-recruitment-sri-lanka" />} />
          <Route path="/fmcg-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="fmcg-recruitment-sri-lanka" />} />
          <Route path="/fmcg-recruitment-sri-lanka/" element={<SectorRecruitmentPage sectorKey="fmcg-recruitment-sri-lanka" />} />

          {/* Jobs & Inquiries */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/" element={<JobsPage />} />
          <Route path="/jobs/:slugWithId" element={<JobDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact/" element={<ContactPage />} />

          {/* Auth & Admin */}
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={
              <div className="p-8 text-white">
                <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
                <p>Welcome to the Head Hunters admin portal.</p>
              </div>
            } />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
            <Route path="insights" element={<AdminInsightsPage />} />
            <Route path="chat" element={<AdminChatPage />} />
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
