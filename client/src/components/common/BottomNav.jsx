import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Bell, MessageSquare, Plus, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

export const BottomNav = ({ onOpenCreatePost }) => {
  const { user, requireAuth } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();

  const handleGatedNav = (e, path, actionMsg) => {
    if (!user) {
      e.preventDefault();
      requireAuth(actionMsg, () => {
        navigate(path);
      });
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orbit-border px-3 py-2 flex items-center justify-around shadow-warm-lg">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center p-2 rounded-xl transition-colors ${
            isActive ? 'text-orbit-primary font-bold' : 'text-orbit-textMuted'
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `flex flex-col items-center p-2 rounded-xl transition-colors ${
            isActive ? 'text-orbit-primary font-bold' : 'text-orbit-textMuted'
          }`
        }
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Explore</span>
      </NavLink>

      {/* Floating Center Action Button */}
      {onOpenCreatePost && (
        <button
          onClick={onOpenCreatePost}
          className="w-11 h-11 -mt-5 rounded-full btn-orbit-gradient flex items-center justify-center text-white shadow-warm hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <NavLink
        to="/notifications"
        onClick={(e) => handleGatedNav(e, '/notifications', 'view your notifications')}
        className={({ isActive }) =>
          `relative flex flex-col items-center p-2 rounded-xl transition-colors ${
            isActive && user ? 'text-orbit-primary font-bold' : 'text-orbit-textMuted'
          }`
        }
      >
        <Bell className="w-5 h-5" />
        {user && unreadCount > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-orbit-primary rounded-full animate-ping" />
        )}
        <span className="text-[10px] mt-0.5">Alerts</span>
      </NavLink>

      <NavLink
        to="/messages"
        onClick={(e) => handleGatedNav(e, '/messages', 'access direct messages')}
        className={({ isActive }) =>
          `flex flex-col items-center p-2 rounded-xl transition-colors ${
            isActive && user ? 'text-orbit-primary font-bold' : 'text-orbit-textMuted'
          }`
        }
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Chat</span>
      </NavLink>

      <NavLink
        to={user ? `/profile/${user.username}` : '/login'}
        onClick={(e) => handleGatedNav(e, user ? `/profile/${user.username}` : '/login', 'view your profile')}
        className={({ isActive }) =>
          `flex flex-col items-center p-2 rounded-xl transition-colors ${
            isActive && user ? 'text-orbit-primary font-bold' : 'text-orbit-textMuted'
          }`
        }
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{user ? 'Me' : 'Sign in'}</span>
      </NavLink>
    </nav>
  );
};
