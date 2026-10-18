import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, AtSign, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const { register, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password
      });
      navigate(returnTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
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
      setError('Failed to log in with demo account.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-orbit-cream">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-orbit-border shadow-warm-lg">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orbit-primaryDark to-orbit-primary text-white shadow-warm mb-3">
            <span className="text-2xl font-black">O</span>
          </div>
          <h1 className="text-2xl font-black text-orbit-text tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-orbit-textMuted mt-1">
            Join Orbit to share, message, and explore
          </p>
        </div>

        {/* Quick Demo Access */}
        <div className="mb-6 p-3 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orbit-primary" />
            <span className="text-xs text-orbit-text font-medium">Just testing?</span>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="text-xs font-bold text-orbit-primary hover:text-orbit-primaryDark underline disabled:opacity-50"
          >
            {demoLoading ? 'Launching...' : '1-Click Demo Login'}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-orbit-text mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-orbit-textMuted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full bg-orange-50/50 border border-orbit-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-orbit-text focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-orbit-text mb-1">
              Username
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-orbit-textMuted" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="alexrivera"
                className="w-full bg-orange-50/50 border border-orbit-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-orbit-text focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-orbit-text mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-orbit-textMuted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-orange-50/50 border border-orbit-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-orbit-text focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-orbit-text mb-1">
              Password (min. 6 characters)
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
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-orbit-textMuted mt-5">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-orbit-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
