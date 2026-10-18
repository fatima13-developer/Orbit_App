import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, UserPlus, LogIn, Lock } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const LoginModal = () => {
  const { loginModal, closeLoginModal, demoLogin } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!loginModal?.isOpen) return null;

  const handleDemoSignIn = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
      closeLoginModal(true); // pass true to trigger pending action
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleGoToLogin = () => {
    closeLoginModal(false);
    navigate('/login', { state: { returnTo: location.pathname } });
  };

  const handleGoToRegister = () => {
    closeLoginModal(false);
    navigate('/register', { state: { returnTo: location.pathname } });
  };

  return (
    <Modal
      isOpen={loginModal.isOpen}
      onClose={() => closeLoginModal(false)}
      title="Join the Conversation"
      maxWidth="max-w-md"
    >
      <div className="text-center py-2">
        {/* Orbit Brand Badge */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-orbit-primaryDark to-orbit-primary flex items-center justify-center text-white shadow-warm">
          <span className="text-2xl font-black">O</span>
        </div>

        <h3 className="text-lg font-black text-orbit-text">
          {loginModal.actionTitle || 'Sign in to Orbit'}
        </h3>
        <p className="text-xs sm:text-sm text-orbit-textMuted mt-1.5 mb-6 max-w-xs mx-auto">
          {loginModal.message || 'Connect with creators, share updates, and join live discussions.'}
        </p>

        {/* 1-Click Demo Shortcut */}
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-orange-100/50 to-orange-500/10 border border-orange-200 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-orbit-deepAccent flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orbit-primary" />
              1-Click Instant Access
            </span>
            <span className="text-[10px] bg-orange-200 text-orbit-deepAccent px-1.5 py-0.5 rounded font-bold">
              Demo
            </span>
          </div>
          <Button
            onClick={handleDemoSignIn}
            loading={demoLoading}
            variant="primary"
            size="sm"
            className="w-full font-bold shadow-sm mt-1"
          >
            ⚡️ Continue as Alex Rivera (Demo)
          </Button>
        </div>

        {/* Traditional Auth Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleGoToLogin}
            variant="outline"
            size="md"
            className="w-full font-bold text-orbit-text hover:border-orbit-primary"
            icon={LogIn}
          >
            Sign in to existing account
          </Button>

          <Button
            onClick={handleGoToRegister}
            variant="ghost"
            size="md"
            className="w-full font-semibold text-orbit-primary"
            icon={UserPlus}
          >
            Create new account
          </Button>
        </div>
      </div>
    </Modal>
  );
};
