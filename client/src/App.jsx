import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

import { LeftSidebar } from './components/common/LeftSidebar.jsx';
import { RightSidebar } from './components/common/RightSidebar.jsx';
import { BottomNav } from './components/common/BottomNav.jsx';
import { Navbar } from './components/common/Navbar.jsx';
import { Modal } from './components/common/Modal.jsx';
import { LoginModal } from './components/common/LoginModal.jsx';
import { CreatePostCard } from './components/post/CreatePostCard.jsx';
import { EmptyState } from './components/common/EmptyState.jsx';
import { Bell, MessageSquare } from 'lucide-react';

import { HomePage } from './pages/HomePage.jsx';
import { ExplorePage } from './pages/ExplorePage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { MessagesPage } from './pages/MessagesPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { PostDetailPage } from './pages/PostDetailPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// Gated Page Guard: Displays an attractive prompt if a guest attempts to navigate to /notifications or /messages
const GatedPageGuard = ({ children, pageTitle, icon: Icon, description }) => {
  const { user, loading, openLoginModal } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orbit-primaryDark to-orbit-primary flex items-center justify-center text-white animate-pulse shadow-warm">
          <span className="text-lg font-black">O</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <EmptyState
          icon={Icon}
          title={pageTitle}
          description={description}
          actionLabel="Sign in to Orbit"
          onAction={() => openLoginModal(`Sign in to access ${pageTitle.toLowerCase()}`)}
        />
      </div>
    );
  }

  return children;
};

// Main Layout Container
const MainLayout = ({ children }) => {
  const location = useLocation();
  const { requireAuth } = useAuth();
  const [quickPostOpen, setQuickPostOpen] = useState(false);

  // Check if we are on messages page to adjust layout padding
  const isMessagesPage = location.pathname.startsWith('/messages');

  const handleOpenCreatePost = () => {
    requireAuth('create a post', () => {
      setQuickPostOpen(true);
    });
  };

  return (
    <div className="min-h-screen bg-orbit-cream flex justify-center">
      <div className="w-full max-w-[1400px] flex">
        {/* Left Navigation */}
        <LeftSidebar onOpenCreatePost={handleOpenCreatePost} />

        {/* Center Application Content */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>

        {/* Right Sidebar (Search & Suggested Users / Join Orbit card) */}
        {!isMessagesPage && <RightSidebar />}

        {/* Bottom Navigation for Mobile */}
        <BottomNav onOpenCreatePost={handleOpenCreatePost} />

        {/* Quick Create Post Modal */}
        {quickPostOpen && (
          <Modal
            isOpen={quickPostOpen}
            onClose={() => setQuickPostOpen(false)}
            title="Create Orbit Post"
          >
            <CreatePostCard
              onPostCreated={() => {
                setQuickPostOpen(false);
                if (location.pathname !== '/') {
                  window.location.href = '/';
                }
              }}
            />
          </Modal>
        )}

        {/* Global Login Required Modal */}
        <LoginModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Public Browsing Routes */}
              <Route
                path="/"
                element={
                  <MainLayout>
                    <HomePage />
                  </MainLayout>
                }
              />

              <Route
                path="/explore"
                element={
                  <MainLayout>
                    <ExplorePage />
                  </MainLayout>
                }
              />

              <Route
                path="/profile/:username"
                element={
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                }
              />

              <Route
                path="/post/:id"
                element={
                  <MainLayout>
                    <PostDetailPage />
                  </MainLayout>
                }
              />

              {/* Gated Feature Routes */}
              <Route
                path="/notifications"
                element={
                  <MainLayout>
                    <GatedPageGuard
                      pageTitle="Notifications"
                      icon={Bell}
                      description="Sign in to view real-time likes, replies, and follow alerts from people across Orbit."
                    >
                      <NotificationsPage />
                    </GatedPageGuard>
                  </MainLayout>
                }
              />

              <Route
                path="/messages"
                element={
                  <MainLayout>
                    <GatedPageGuard
                      pageTitle="Direct Messages"
                      icon={MessageSquare}
                      description="Sign in to chat in real-time, send photos, and connect one-on-one with other users."
                    >
                      <MessagesPage />
                    </GatedPageGuard>
                  </MainLayout>
                }
              />

              {/* 404 Catch All */}
              <Route
                path="*"
                element={
                  <MainLayout>
                    <NotFoundPage />
                  </MainLayout>
                }
              />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
