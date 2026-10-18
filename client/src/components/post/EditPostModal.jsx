import React, { useState } from 'react';
import { updatePost } from '../../api/post.api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';

export const EditPostModal = ({ isOpen, onClose, post, onPostUpdated }) => {
  const [content, setContent] = useState(post?.content || '');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('Post content cannot be empty', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await updatePost(post._id, { content: content.trim() });
      showToast('Post updated successfully');
      if (onPostUpdated) {
        onPostUpdated(res.data.post);
      }
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update post', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Post">
      <form onSubmit={handleUpdate} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full border border-orbit-border rounded-xl p-3 text-orbit-text text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orbit-primary/20 focus:border-orbit-primary"
          placeholder="What do you want to say?"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
