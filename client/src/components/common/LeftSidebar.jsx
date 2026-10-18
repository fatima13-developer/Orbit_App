import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Bell,
  MessageSquare,
  User,
  LogOut,
  PenSquare,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { Avatar } from './Avatar.jsx';
import { Button } from './Button.jsx';

export const LeftSidebar = ({ onOpenCreatePost }) => {
  const { user, logout, requireAuth } = useAuth();
  const { unreadCount, isUserOnline } = useSocket();
  const navigate = useNavigate();

  const handleNavClick = (e, item) => {
    if (item.requiresAuth && !user) {
      e.preventDefault();
      requireAuth(item.authMessage, () => {
        navigate(item.path);
      });
    }
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home, requiresAuth: false },
    { label: 'Explore', path: '/explore', icon: Compass, requiresAuth: false },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: user ? unreadCount : 0,
      requiresAuth: true,
      authMessage: 'view your notifications'
    },
    {
      label: 'Messages',
      path: '/messages',
      icon: MessageSquare,
      requiresAuth: true,
      authMessage: 'chat with other users'
    },
    {
      label: 'Profile',
      path: user ? `/profile/${user.username}` : '/login',
      icon: User,
      requiresAuth: true,
      authMessage: 'view and manage your profile'
    }
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen sticky top-0 px-4 py-6 border-r border-orbit-border bg-white select-none">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 px-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orbit-primaryDark to-orbit-primary flex items-center justify-center text-white shadow-warm">
            <span className="text-xl font-black tracking-tight">O</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-orbit-text group-hover:text-orbit-primary transition-colors">
              Orbit
            </h1>
            <p className="text-[11px] font-semibold text-orbit-primary uppercase tracking-widest -mt-1">
              Social Pulse
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold transition-all duration-200 ${
                  isActive && (user || !item.requiresAuth)
                    ? 'bg-orbit-soft text-orbit-deepAccent shadow-sm'
                    : 'text-orbit-textMuted hover:text-orbit-text hover:bg-orange-50/70'
                }`
              }
            >
              <div className="flex items-center gap-4">
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-orbit-primary text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick Post Button */}
        {onOpenCreatePost && (
          <button
            onClick={onOpenCreatePost}
            className="w-full btn-orbit-gradient py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-warm text-white hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <PenSquare className="w-5 h-5" />
            <span>Create Post</span>
          </button>
        )}
      </div>

      {/* User Info / Logout OR Guest Quick Auth */}
      {user ? (
        <div className="pt-4 border-t border-orbit-border">
          <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-orange-50/70 transition-colors">
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center gap-3 overflow-hidden"
            >
              <Avatar
                user={user}
                size="md"
                isOnline={isUserOnline(user._id)}
              />
              <div className="truncate">
                <p className="text-sm font-bold text-orbit-text truncate">
                  {user.name}
                </p>
                <p className="text-xs text-orbit-textMuted truncate">
                  @{user.username}
                </p>
              </div>
            </Link>

            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-orbit-textMuted hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-orbit-border space-y-2">
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            size="sm"
            className="w-full font-bold"
            icon={LogIn}
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate('/register')}
            variant="primary"
            size="sm"
            className="w-full font-bold"
            icon={UserPlus}
          >
            Create Account
          </Button>
        </div>
      )}
    </aside>
  );
};
