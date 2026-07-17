import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Components
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

import { LoginPage } from "./pages/Login";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout";

import { AdminJobsPage } from "./pages/admin/Jobs";
import { AdminSettingsPage } from "./pages/admin/Settings";
import { AdminDashboardPage } from "./pages/admin/Dashboard";
import { AdminChatPage } from "./pages/admin/Chat";
import { AdminInsightsPage } from "./pages/admin/Insights";
import { AdminUsersPage } from "./pages/admin/Users";
import { AdminEnquiriesPage } from "./pages/admin/Enquiries";
import { AdminNotFound } from "./pages/admin/NotFound";

import { SmoothScroll } from "./components/layout/SmoothScroll";
import { FloatingButtons } from "./components/layout/FloatingButtons";
import { JobsPage } from "./pages/Jobs";
import { InsightsPage } from "./pages/Insights";
import { InsightDetailPage } from "./pages/InsightDetail";

function App() {
  return (
    <SmoothScroll>
      <div className="grain" aria-hidden="true" />
      <div className="aurora" aria-hidden="true" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/insights/:slug" element={<InsightDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="insights" element={<AdminInsightsPage />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
            <Route path="chat" element={<AdminChatPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<AdminNotFound />} />
          </Route>
        </Routes>
        <FloatingButtons chatbotEnabled={true} />
      </BrowserRouter>
    </SmoothScroll>
  );
}

export default App;
