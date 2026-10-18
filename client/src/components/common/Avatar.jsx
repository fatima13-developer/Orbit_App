import React from 'react';
import { getAvatarUrl } from '../../utils/helpers.js';

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-24 h-24 text-xl',
  '2xl': 'w-32 h-32 text-2xl'
};

const badgeSizeClasses = {
  xs: 'w-1.5 h-1.5 ring-1',
  sm: 'w-2 h-2 ring-1.5',
  md: 'w-2.5 h-2.5 ring-2',
  lg: 'w-3.5 h-3.5 ring-2',
  xl: 'w-5 h-5 ring-4',
  '2xl': 'w-6 h-6 ring-4'
};

export const Avatar = ({
  user,
  size = 'md',
  isOnline = false,
  className = '',
  onClick
}) => {
  const avatarUrl = getAvatarUrl(user);
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const badgeClass = badgeSizeClasses[size] || badgeSizeClasses.md;

  return (
    <div
      onClick={onClick}
      className={`relative inline-block flex-shrink-0 ${className} ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      }`}
    >
      <img
        src={avatarUrl}
        alt={user?.name || 'User avatar'}
        className={`${sizeClass} rounded-full object-cover border border-orbit-border bg-orange-50`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user?.name || 'User'
          )}&background=F97316&color=fff&bold=true`;
        }}
      />
      {isOnline && (
        <span
          title="Online now"
          className={`absolute bottom-0 right-0 ${badgeClass} bg-green-500 ring-white rounded-full`}
        />
      )}
    </div>
  );
};
