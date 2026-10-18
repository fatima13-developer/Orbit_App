import React, { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { updateProfile, updateAvatar, updateCoverPhoto } from '../../api/user.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getAvatarUrl, getCoverUrl } from '../../utils/helpers.js';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';

export const EditProfileModal = ({ isOpen, onClose, userProfile, onProfileUpdated }) => {
  const { updateAuthUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(userProfile?.name || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [website, setWebsite] = useState(userProfile?.website || '');

  const [avatarPreview, setAvatarPreview] = useState(getAvatarUrl(userProfile));
  const [coverPreview, setCoverPreview] = useState(getCoverUrl(userProfile));

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Avatar image must be under 5MB', 'error');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Cover photo must be under 5MB', 'error');
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update text fields
      const res = await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim()
      });

      let updatedUser = res.data.user;

      // 2. Upload avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avRes = await updateAvatar(formData);
        updatedUser.avatar = avRes.data.avatar;
      }

      // 3. Upload cover photo if selected
      if (coverFile) {
        const formData = new FormData();
        formData.append('coverPhoto', coverFile);
        const cvRes = await updateCoverPhoto(formData);
        updatedUser.coverPhoto = cvRes.data.coverPhoto;
      }

      updateAuthUser(updatedUser);
      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }

      showToast('Profile updated successfully');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cover Photo Upload Preview */}
        <div className="relative h-32 sm:h-40 rounded-xl overflow-hidden bg-orange-100 border border-orbit-border group">
          <img
            src={coverPreview}
            alt="Cover preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium text-xs gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>Change Cover</span>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverSelect}
            className="hidden"
          />
        </div>

        {/* Avatar Upload Preview */}
        <div className="relative -mt-12 ml-4 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-warm group bg-orange-50">
          <img
            src={avatarPreview}
            alt="Avatar preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-orbit-text mb-1">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-orbit-border rounded-xl px-3.5 py-2 text-sm text-orbit-text focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary"
          />
        </div>

        {/* Bio */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-orbit-text">Bio</label>
            <span className="text-[11px] text-orbit-textMuted">{bio.length}/250</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={250}
            rows={3}
            placeholder="Tell the orbit community about yourself..."
            className="w-full border border-orbit-border rounded-xl px-3.5 py-2 text-sm text-orbit-text focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary resize-none"
          />
        </div>

        {/* Location & Website */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-orbit-text mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full border border-orbit-border rounded-xl px-3.5 py-2 text-sm text-orbit-text focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-orbit-text mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full border border-orbit-border rounded-xl px-3.5 py-2 text-sm text-orbit-text focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary"
            />
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-orbit-border">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
