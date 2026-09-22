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

function HomePage() {
  const [settings, setSettings] = useState<any>(null);
  const [latestJobs, setLatestJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, jobsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/jobs/latest')
        ]);
        
        const settingsData = await settingsRes.json();
        const jobsData = await jobsRes.json();
        
        setSettings(settingsData);
        setLatestJobs(jobsData);
      } catch (error) {
        console.error("Failed to load homepage data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading || !settings) {
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
        {settings.show_hero && <Hero settings={settings} />}
        {settings.show_stats && <ProofStrip />}

        {/* Intro strip */}
        {settings.show_hero && (
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

        {settings.show_services && <ServicesBento settings={settings} />}
        {settings.show_standards && <Standards />}
        {settings.show_employer_flow && <EmployerSection />}
        {settings.show_jobs && <JobsSection recentJobs={latestJobs} />}
        {settings.show_story && <Story settings={settings} />}
        {settings.show_global_reach && <GlobalReach settings={settings} />}
        {settings.show_testimonials && <Testimonials settings={settings} />}
        {settings.show_contact && <ContactSection settings={settings} />}
      </main>
      <Footer settings={settings} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Commercial & Information Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/employers" element={<EmployersPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/executive-search-sri-lanka" element={<ExecutiveSearchPage />} />
        <Route path="/confidential-recruitment-sri-lanka" element={<ConfidentialRecruitmentPage />} />
        
        {/* Sector Specialized Pages */}
        <Route path="/ceo-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="ceo-recruitment-sri-lanka" />} />
        <Route path="/finance-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="finance-recruitment-sri-lanka" />} />
        <Route path="/internal-audit-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="internal-audit-recruitment-sri-lanka" />} />
        <Route path="/legal-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="legal-recruitment-sri-lanka" />} />
        <Route path="/hr-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="hr-recruitment-sri-lanka" />} />
        <Route path="/fmcg-recruitment-sri-lanka" element={<SectorRecruitmentPage sectorKey="fmcg-recruitment-sri-lanka" />} />

        {/* Jobs & Inquiries */}
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:slugWithId" element={<JobDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />

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
  );
}

export default App;
