import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { History, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Post } from '../types';
import { mockPosts } from '../lib/mockData';

export function PostHistory() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'failed'>('all');

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setPosts(data);
    } else {
      setPosts(mockPosts as any);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      scheduled: 'Scheduled',
      published: 'Published',
      failed: 'Failed',
    };
    return labels[status] || status;
  };

  const platformColors = {
    twitter: 'bg-blue-100 text-blue-700',
    linkedin: 'bg-blue-100 text-blue-800',
    facebook: 'bg-blue-100 text-blue-900',
    instagram: 'bg-pink-100 text-pink-700',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Post History</h2>
        <p className="text-gray-600 mt-2">Browse all your posts</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <History className="w-5 h-5 text-gray-600" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Failed
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No posts to display</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(post.status)}</div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${platformColors[post.platform]}`}>
                        {post.platform}
                      </span>
                      <span className="text-xs text-gray-600">
                        {getStatusLabel(post.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('en-US')}
                      </span>
                    </div>

                    <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">
                      {post.content}
                    </p>

                    {post.scheduled_for && (
                      <p className="text-xs text-gray-500 mt-2">
                        Scheduled for: {new Date(post.scheduled_for).toLocaleString('en-US')}
                      </p>
                    )}

                    {post.published_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Published: {new Date(post.published_at).toLocaleString('en-US')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
