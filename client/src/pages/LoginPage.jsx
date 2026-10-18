import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate(returnTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await demoLogin();
      navigate(returnTo);
    } catch (err) {
      setError('Failed to log in with demo account. Please ensure server is running.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-orbit-cream">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-orbit-border shadow-warm-lg">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orbit-primaryDark to-orbit-primary text-white shadow-warm mb-3">
            <span className="text-2xl font-black">O</span>
          </div>
          <h1 className="text-2xl font-black text-orbit-text tracking-tight">
            Welcome to Orbit
          </h1>
          <p className="text-xs sm:text-sm text-orbit-textMuted mt-1">
            Sign in to join the conversation and connect
          </p>
        </div>

        {/* Demo Account Quick Access Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-orange-100/50 to-orange-500/10 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orbit-deepAccent">
              <Sparkles className="w-4 h-4 text-orbit-primary" />
              <span>Recruiter & Demo Access</span>
            </div>
            <span className="text-[10px] bg-orange-200 text-orbit-deepAccent px-2 py-0.5 rounded-full font-bold">
              1-Click
            </span>
          </div>
          <p className="text-xs text-orbit-textMuted mb-3">
            Instant evaluation login with preloaded posts, followers, and chats.
          </p>
          <Button
            onClick={handleDemoLogin}
            loading={demoLoading}
            variant="secondary"
            size="sm"
            className="w-full font-bold shadow-sm"
          >
            ⚡️ Launch Demo Account (Alex Rivera)
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-orbit-text mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-orbit-textMuted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-orange-50/50 border border-orbit-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-orbit-text focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-orbit-text mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-orbit-textMuted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-orange-50/50 border border-orbit-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-orbit-text focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full mt-2"
            icon={ArrowRight}
          >
            Sign In
          </Button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-orbit-textMuted mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-orbit-primary hover:underline"
          >
            Create an Orbit account
          </Link>
        </p>
      </div>
    </div>
  );
};
