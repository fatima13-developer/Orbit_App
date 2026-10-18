import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User as UserIcon, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { Avatar } from './Avatar.jsx';

export const Navbar = () => {
  const { user, logout, openLoginModal } = useAuth();
  const { unreadCount, isUserOnline } = useSocket();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-orbit-border px-4 py-2.5 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orbit-primaryDark to-orbit-primary flex items-center justify-center text-white shadow-warm">
          <span className="text-base font-black">O</span>
        </div>
        <span className="text-xl font-black tracking-tight text-orbit-text">Orbit</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/explore"
          className="p-2 text-orbit-textMuted hover:text-orbit-primary hover:bg-orange-50 rounded-xl transition-colors"
          title="Explore"
        >
          <Search className="w-5 h-5" />
        </Link>

        {/* Notifications: only shown if authenticated */}
        {user && (
          <Link
            to="/notifications"
            className="relative p-2 text-orbit-textMuted hover:text-orbit-primary hover:bg-orange-50 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orbit-primary rounded-full ring-2 ring-white" />
            )}
          </Link>
        )}

        {/* User profile dropdown or Guest Auth buttons */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 focus:outline-none"
            >
              <Avatar user={user} size="sm" isOnline={isUserOnline(user._id)} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-warm-lg border border-orbit-border py-1.5 z-40"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-orbit-border/50">
                  <p className="text-xs font-bold text-orbit-text truncate">{user.name}</p>
                  <p className="text-[11px] text-orbit-textMuted truncate">@{user.username}</p>
                </div>
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-orbit-text hover:bg-orange-50"
                >
                  <UserIcon className="w-4 h-4 text-orbit-textMuted" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link
              to="/login"
              className="text-xs font-semibold px-3 py-1.5 text-orbit-text border border-orbit-border rounded-xl hover:bg-orange-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-orbit-gradient text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
