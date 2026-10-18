import React from 'react';

export const PostSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-orbit-border shadow-warm-sm animate-pulse mb-4">
    {/* Author Header */}
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-orange-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-orange-100 rounded" />
        <div className="h-3 w-20 bg-orange-50 rounded" />
      </div>
    </div>
    {/* Content lines */}
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-orange-100 rounded w-full" />
      <div className="h-4 bg-orange-100 rounded w-5/6" />
      <div className="h-4 bg-orange-50 rounded w-3/4" />
    </div>
    {/* Image placeholder */}
    <div className="h-56 bg-orange-100 rounded-xl mb-4" />
    {/* Actions */}
    <div className="flex items-center gap-6 pt-2 border-t border-orbit-border">
      <div className="h-5 w-12 bg-orange-100 rounded" />
      <div className="h-5 w-12 bg-orange-100 rounded" />
      <div className="h-5 w-12 bg-orange-100 rounded" />
    </div>
  </div>
);

export const FeedSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <PostSkeleton key={i} />
    ))}
  </div>
);

export const UserRowSkeleton = () => (
  <div className="flex items-center justify-between p-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-orange-100" />
      <div className="space-y-1.5">
        <div className="h-3.5 w-24 bg-orange-100 rounded" />
        <div className="h-3 w-16 bg-orange-50 rounded" />
      </div>
    </div>
    <div className="h-8 w-20 bg-orange-100 rounded-xl" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="bg-white rounded-2xl border border-orbit-border shadow-warm-sm overflow-hidden animate-pulse">
    <div className="h-44 sm:h-60 bg-orange-100" />
    <div className="px-6 pb-6 relative">
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-orange-200 border-4 border-white -mt-12 sm:-mt-16 mb-4" />
      <div className="space-y-3">
        <div className="h-6 w-48 bg-orange-100 rounded" />
        <div className="h-4 w-28 bg-orange-50 rounded" />
        <div className="h-4 w-full bg-orange-100 rounded" />
        <div className="h-4 w-3/4 bg-orange-50 rounded" />
      </div>
    </div>
  </div>
);
