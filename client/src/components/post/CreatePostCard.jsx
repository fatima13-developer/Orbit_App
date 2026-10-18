import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X, Send, Smile } from 'lucide-react';
import { createPost } from '../../api/post.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { Button } from '../common/Button.jsx';

export const CreatePostCard = ({ onPostCreated, placeholder = "What's happening in your orbit?" }) => {
  const { user, requireAuth } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!user) {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-orbit-border shadow-warm-sm mb-6 flex items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orbit-soft flex items-center justify-center text-orbit-primary font-black shadow-sm flex-shrink-0">
            O
          </div>
          <div>
            <h4 className="text-sm font-bold text-orbit-text">What's happening in your orbit?</h4>
            <p className="text-xs text-orbit-textMuted">Sign in to publish posts, share photos, and interact with the community.</p>
          </div>
        </div>
        <Button
          onClick={() => requireAuth('create a post')}
          variant="primary"
          size="sm"
          className="flex-shrink-0 font-bold"
        >
          Post
        </Button>
      </div>
    );
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 4) {
      showToast('You can attach a maximum of 4 images per post', 'error');
      return;
    }

    // Check size limit: 5MB
    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`"${file.name}" exceeds the 5MB size limit.`, 'error');
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setImages((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...validPreviews]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      showToast('Please add some text or an image to your post', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (content.trim()) {
        formData.append('content', content.trim());
      }
      images.forEach((file) => {
        formData.append('images', file);
      });

      const res = await createPost(formData);
      setContent('');
      setImages([]);
      setPreviewUrls([]);
      showToast('Post published to your orbit!');

      if (onPostCreated) {
        onPostCreated(res.data.post);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-orbit-border shadow-warm-sm mb-6 transition-all">
      <div className="flex gap-3 sm:gap-4">
        <Avatar user={user} size="md" />

        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            maxLength={2000}
            className="w-full resize-none border-0 focus:ring-0 p-0 text-orbit-text placeholder:text-orbit-textMuted text-sm sm:text-base outline-none bg-transparent"
          />

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className={`grid gap-2 mb-3 mt-2 ${
              previewUrls.length === 1 ? 'grid-cols-1' : previewUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
            }`}>
              {previewUrls.map((url, index) => (
                <div key={index} className="relative rounded-xl overflow-hidden group aspect-video bg-orange-50 border border-orbit-border">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-orbit-border/70 mt-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 4}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-orbit-primary hover:bg-orange-50 transition-colors disabled:opacity-40"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Photo {images.length > 0 ? `(${images.length}/4)` : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => setContent((prev) => prev + ' 🚀')}
                className="p-1.5 rounded-xl text-orbit-textMuted hover:text-orbit-primary hover:bg-orange-50 transition-colors"
                title="Add rocket emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={(!content.trim() && images.length === 0) || submitting}
              size="sm"
              variant="primary"
              icon={Send}
            >
              Orbit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
