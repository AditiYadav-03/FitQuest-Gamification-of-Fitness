import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  MessageSquare,
  Send,
  UserPlus,
  Check,
  X,
  Search,
  Sparkles,
  Zap,
  Activity as ActivityIcon,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Post, Friendship, Activity } from '../types';

interface SearchUser {
  id: number;
  username: string;
  full_name: string;
  avatar_url?: string;
  level: number;
  total_xp: number;
  current_streak: number;
  is_following: boolean;
  friendship_status?: string | null;
}

export const CommunityPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { showToast } = useNotification();

  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [myActivities, setMyActivities] = useState<Activity[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [isPosting, setIsPosting] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchFeed = async () => {
    try {
      const res = await apiClient.get<Post[]>('/social/feed');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load feed', err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await apiClient.get<Friendship[]>('/social/friends');
      setFriends(res.data);
    } catch (err) {
      console.error('Failed to load friends', err);
    }
  };

  const fetchMyActivities = async () => {
    try {
      const res = await apiClient.get<Activity[]>('/activities?limit=10');
      setMyActivities(res.data);
    } catch (err) {
      console.error('Failed to load user activities', err);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchFriends();
    fetchMyActivities();
  }, []);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await apiClient.get<SearchUser[]>(`/users/search?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      const res = await apiClient.post<Post>('/social/posts', {
        content: newPostContent,
        activity_id: selectedActivityId,
      });
      setPosts([res.data, ...posts]);
      setNewPostContent('');
      setSelectedActivityId(null);
      showToast('success', 'Post Shared', 'Your update is now live on the feed!');
    } catch (err) {
      showToast('error', 'Post Failed', 'Could not share post.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await apiClient.delete(`/social/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('info', 'Post Deleted', 'Post removed from feed.');
    } catch (err) {
      showToast('error', 'Error', 'Failed to delete post.');
    }
  };

  const handleToggleLike = async (postId: number) => {
    try {
      const res = await apiClient.post(`/social/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, is_liked: res.data.liked, likes_count: res.data.likes_count }
            : p
        )
      );
    } catch (err) {
      console.error('Like toggle failed', err);
    }
  };

  const handleAddComment = async (postId: number) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const res = await apiClient.post(`/social/posts/${postId}/comments`, { content: text });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments_count: p.comments_count + 1,
                comments: [...p.comments, res.data],
              }
            : p
        )
      );
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) {
      showToast('error', 'Comment Error', 'Could not add comment.');
    }
  };

  const handleSendFriendRequest = async (targetId: number) => {
    try {
      await apiClient.post('/social/friends/request', { target_user_id: targetId });
      showToast('success', 'Request Sent', 'Friend request delivered!');
      setSearchResults((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, friendship_status: 'pending' } : u))
      );
      fetchFriends();
    } catch (err: any) {
      showToast('error', 'Error', err.response?.data?.detail || 'Failed to send request.');
    }
  };

  const handleRespondFriendRequest = async (requestId: number, action: 'accept' | 'reject') => {
    try {
      await apiClient.post(`/social/friends/${requestId}/respond?action=${action}`);
      showToast(
        action === 'accept' ? 'success' : 'info',
        action === 'accept' ? 'Friend Connected!' : 'Request Declined',
        action === 'accept' ? 'You can now compare workout streaks in Friends League!' : ''
      );
      fetchFriends();
    } catch (err) {
      showToast('error', 'Error', 'Could not respond to request.');
    }
  };

  const handleToggleFollow = async (targetId: number) => {
    try {
      const res = await apiClient.post(`/social/follow/${targetId}`);
      setSearchResults((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, is_following: res.data.following } : u))
      );
      showToast('info', 'Follow Updated', res.data.message);
    } catch (err) {
      showToast('error', 'Error', 'Could not update follow.');
    }
  };

  const pendingRequests = friends.filter((f) => f.status === 'pending' && f.addressee_id === user?.id);
  const acceptedFriends = friends.filter((f) => f.status === 'accepted');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      {/* Left 2 Cols: Feed Stream */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-brand-primary" />
            FitQuest Community Feed
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Share training milestones, cheer on friends, and stay motivated together.
          </p>
        </div>

        {/* Create Post Box */}
        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70 space-y-4">
          <div className="flex items-start gap-3">
            <img
              src={
                profile?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border border-brand-primary/40 shrink-0"
            />
            <div className="flex-1">
              <textarea
                placeholder="Share your latest workout triumph, training thought, or encouragement..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
                className="w-full bg-brand-surface/60 border border-brand-border text-brand-text placeholder-brand-muted/60 text-xs rounded-xl p-3 focus:outline-none focus:border-brand-primary resize-none"
              />
            </div>
          </div>

          {/* Attach Recent Activity Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-brand-border/60">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-brand-muted shrink-0" />
              <select
                value={selectedActivityId || ''}
                onChange={(e) => setSelectedActivityId(e.target.value ? Number(e.target.value) : null)}
                className="bg-brand-surface/60 border border-brand-border text-brand-text text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-brand-primary max-w-[220px] truncate"
              >
                <option value="">Attach workout to post (Optional)</option>
                {myActivities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} ({act.activity_type}, {act.duration_minutes}m)
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              size="sm"
              isLoading={isPosting}
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Share Update
            </Button>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="py-12 text-center glass-panel rounded-2xl border border-brand-border p-6 text-xs text-brand-muted">
              No feed updates yet. Be the first to share your workout milestone!
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="glass-panel p-5 rounded-2xl border border-brand-border/70 space-y-4 transition-all"
              >
                {/* Author Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        post.avatar_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={post.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-brand-border"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{post.full_name}</span>
                        <span className="px-2 py-0.2 rounded-full bg-brand-surface border border-brand-primary/30 text-[10px] font-bold text-brand-primary">
                          Lvl {post.level}
                        </span>
                      </div>
                      <span className="text-[10px] text-brand-muted">
                        @{post.username} • {new Date(post.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {(post.user_id === user?.id || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-brand-muted hover:text-red-400 p-1"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="text-xs text-brand-text leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {/* Attached Activity Card */}
                {post.activity && (
                  <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-brand-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center text-lg">
                        {post.activity.activity_type === 'running' && '🏃‍♂️'}
                        {post.activity.activity_type === 'cycling' && '🚴‍♂️'}
                        {post.activity.activity_type === 'gym' && '🏋️‍♂️'}
                        {post.activity.activity_type === 'walking' && '🚶‍♂️'}
                        {post.activity.activity_type === 'swimming' && '🏊‍♂️'}
                        {post.activity.activity_type === 'yoga' && '🧘‍♀️'}
                        {!['running', 'cycling', 'gym', 'walking', 'swimming', 'yoga'].includes(post.activity.activity_type) && '🎯'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{post.activity.title}</div>
                        <div className="text-[10px] text-brand-muted">
                          {post.activity.duration_minutes}m {post.activity.distance_km > 0 && `• ${post.activity.distance_km}km`} • {post.activity.calories_burned} kcal
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-brand-primary">+{post.activity.xp_earned} XP</span>
                  </div>
                )}

                {/* Like & Comments Stats Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-brand-border/60 text-xs text-brand-muted">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      post.is_liked
                        ? 'text-red-400 bg-red-500/10 font-bold'
                        : 'hover:text-white hover:bg-brand-surface'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                    <span>{post.likes_count} Kudos</span>
                  </button>

                  <span className="flex items-center gap-1.5 text-[11px]">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments_count} Comments</span>
                  </span>
                </div>

                {/* Comments List */}
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-brand-border/40">
                    {post.comments.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-brand-surface/40 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{c.full_name}</span>
                          <span className="text-[10px] text-brand-muted">
                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-brand-muted">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Leave a word of encouragement..."
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddComment(post.id);
                    }}
                    className="flex-1 bg-brand-surface/60 border border-brand-border text-xs text-brand-text placeholder-brand-muted/60 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-primary"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="p-2 rounded-xl bg-brand-primary text-black hover:bg-brand-primaryHover font-bold transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Friends & Athlete Search */}
      <div className="space-y-6">
        {/* Pending Requests Banner */}
        {pendingRequests.length > 0 && (
          <div className="glass-panel p-4 rounded-2xl border border-brand-primary/40 bg-brand-primary/5 space-y-3">
            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" />
              Incoming Friend Requests ({pendingRequests.length})
            </h3>
            <div className="space-y-2">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-2.5 rounded-xl bg-brand-card flex items-center justify-between gap-2">
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{req.partner_full_name}</div>
                    <div className="text-[10px] text-brand-muted">Level {req.partner_level}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRespondFriendRequest(req.id, 'accept')}
                      className="p-1.5 rounded-lg bg-brand-primary text-black hover:bg-brand-primaryHover font-bold"
                      title="Accept"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRespondFriendRequest(req.id, 'reject')}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      title="Decline"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Find Athletes Search */}
        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-blue" />
              Find Athletes
            </h3>
            <p className="text-[11px] text-brand-muted mt-0.5">Search community members to connect and compete</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-brand-surface/60 border border-brand-border text-xs text-brand-text placeholder-brand-muted/60 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Search Results */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="text-center py-4 text-xs text-brand-muted">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((athlete) => (
                <div key={athlete.id} className="p-2.5 rounded-xl bg-brand-surface/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={athlete.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={athlete.full_name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{athlete.full_name}</div>
                      <div className="text-[10px] text-brand-muted">Lvl {athlete.level} • {athlete.total_xp} XP</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {athlete.friendship_status === 'accepted' ? (
                      <span className="text-[10px] font-bold text-brand-primary px-2 py-1 rounded bg-brand-primary/10">
                        Friends
                      </span>
                    ) : athlete.friendship_status === 'pending' ? (
                      <span className="text-[10px] font-semibold text-brand-muted px-2 py-1 rounded bg-brand-surface">
                        Pending
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendFriendRequest(athlete.id)}
                        className="px-2 py-1 rounded-lg bg-brand-primary text-black font-bold text-[10px] hover:bg-brand-primaryHover"
                      >
                        + Add
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleFollow(athlete.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        athlete.is_following
                          ? 'border-brand-blue text-brand-blue bg-brand-blue/10'
                          : 'border-brand-border text-brand-muted hover:text-white'
                      }`}
                    >
                      {athlete.is_following ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              ))
            ) : searchQuery.trim() ? (
              <div className="text-center py-4 text-xs text-brand-muted">No athletes match that name.</div>
            ) : null}
          </div>
        </div>

        {/* My Friends List */}
        <div className="glass-panel p-5 rounded-2xl border border-brand-border/70 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-primary" />
              Connected Friends ({acceptedFriends.length})
            </h3>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {acceptedFriends.length === 0 ? (
              <div className="text-center py-4 text-xs text-brand-muted">
                No friends connected yet. Search above to build your squad!
              </div>
            ) : (
              acceptedFriends.map((f) => (
                <div key={f.id} className="p-2.5 rounded-xl bg-brand-surface/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={f.partner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={f.partner_full_name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">{f.partner_full_name}</div>
                      <div className="text-[10px] text-brand-muted">@{f.partner_username}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold shrink-0">
                    Lvl {f.partner_level}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
