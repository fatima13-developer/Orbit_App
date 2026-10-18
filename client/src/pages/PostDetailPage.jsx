import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getPostById } from '../api/post.api.js';
import { PostCard } from '../components/post/PostCard.jsx';
import { PostSkeleton } from '../components/common/Skeletons.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await getPostById(id);
        setPost(res.data.post);
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-orbit-textMuted hover:text-orbit-text hover:bg-orange-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-orbit-text tracking-tight">Post</h2>
      </div>

      {loading ? (
        <PostSkeleton />
      ) : !post ? (
        <EmptyState
          title="Post not found"
          description="This post may have been removed by its author or does not exist."
          actionLabel="Go to Feed"
          onAction={() => navigate('/')}
        />
      ) : (
        <PostCard
          post={post}
          onPostDeleted={() => navigate('/')}
          onPostUpdated={(updated) => setPost(updated)}
        />
      )}
    </div>
  );
};
