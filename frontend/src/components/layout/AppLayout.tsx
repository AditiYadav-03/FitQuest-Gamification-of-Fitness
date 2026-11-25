import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';
import { Footer } from '../common/Footer';
import { ToastContainer } from '../common/ToastContainer';
import { AchievementModal } from '../gamification/AchievementModal';
import { ActivityFormModal } from '../activities/ActivityFormModal';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col text-brand-text">
      {/* Toast notifications container */}
      <ToastContainer />

      {/* Global Achievement Celebration Modal */}
      <AchievementModal />

      {/* Quick Activity Entry Modal */}
      <ActivityFormModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
      />

      {/* Top Navbar */}
      <Navbar
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onOpenActivityModal={() => setActivityModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar */}
        <Sidebar
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenActivityModal={() => setActivityModalOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          <Outlet context={{ openActivityModal: () => setActivityModalOpen(true) }} />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
