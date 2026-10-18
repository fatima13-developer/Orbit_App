export const getAvatarUrl = (user) => {
  if (user?.avatar?.url) {
    // If it's a relative path to uploads/
    if (user.avatar.url.startsWith('/uploads')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return `${apiUrl}${user.avatar.url}`;
    }
    return user.avatar.url;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || 'User'
  )}&background=F97316&color=fff&bold=true`;
};

export const getCoverUrl = (user) => {
  if (user?.coverPhoto?.url) {
    if (user.coverPhoto.url.startsWith('/uploads')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return `${apiUrl}${user.coverPhoto.url}`;
    }
    return user.coverPhoto.url;
  }
  return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
};

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiUrl}${url}`;
  }
  return url;
};

export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
};
