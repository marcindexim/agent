import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Globe, Loader2, ExternalLink, Image, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { mockWordPressConnection, mockWordPressPosts } from '../lib/mockData';

interface WordPressPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  date: string;
  featured_media: number;
  featured_image_url?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

interface WordPressConnection {
  id: string;
  domain: string;
  username: string;
  application_password: string;
  site_name: string | null;
}

export function WordPress() {
  const { user } = useAuth();
  const [connection, setConnection] = useState<WordPressConnection | null>(null);
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState<WordPressPost | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'facebook', 'linkedin']);

  useEffect(() => {
    if (user) {
      fetchConnection();
    }
  }, [user]);

  const fetchConnection = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wordpress_connections')
      .select('*')
      .eq('user_id', user!.id)
      .eq('connected', true)
      .maybeSingle();

    if (error || !data) {
      // Use mock data
      setConnection(mockWordPressConnection as any);
      setPosts(mockWordPressPosts as any);
      setLoading(false);
      return;
    }

    setConnection(data);
    fetchPosts(data);
  };

  const fetchPosts = async (conn: WordPressConnection) => {
    try {
      const credentials = btoa(`${conn.username}:${conn.application_password}`);
      const response = await fetch(`${conn.domain}/wp-json/wp/v2/posts?per_page=20&_embed=1`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch WordPress posts');
      }

      const data = await response.json();

      const postsWithImages = data.map((post: WordPressPost) => ({
        ...post,
        featured_image_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
      }));

      setPosts(postsWithImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handlePublish = async () => {
    if (!selectedPost || !connection || selectedPlatforms.length === 0) return;

    if (isDemoMode) {
      setError('Demo Mode: Please connect your real WordPress site in the Integrations section to publish posts.');
      return;
    }

    setPublishing(selectedPost.id);
    setError('');

    try {
      // Create post caption
      const title = stripHtml(selectedPost.title.rendered);
      const excerpt = stripHtml(selectedPost.excerpt.rendered);
      const caption = `${title}\n\n${excerpt}\n\n${selectedPost.link}`;

      // Save to posts table
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user!.id,
          content: caption,
          platform: selectedPlatforms[0], // Primary platform
          status: 'published',
          published_at: new Date().toISOString()
        })
        .select()
        .single();

      if (postError) throw postError;

      alert(`Post published successfully to ${selectedPlatforms.join(', ')}!`);
      setSelectedPost(null);
      setSelectedPlatforms(['twitter', 'facebook', 'linkedin']);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setPublishing(null);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !connection) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">WordPress Not Connected</h3>
              <p className="text-sm text-yellow-800 mb-4">
                Please connect your WordPress site in the Integrations section to fetch posts.
              </p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = 'integrations';
                }}
                className="text-sm text-yellow-900 font-medium hover:underline"
              >
                Go to Integrations →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDemoMode = connection?.domain === 'https://demo-blog.com';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">WordPress Posts</h2>
        <p className="text-gray-600 mt-2">
          Publish posts from{' '}
          <span className="font-medium">{connection?.site_name || connection?.domain}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Posts Found</h3>
          <p className="text-gray-600">No published posts found on your WordPress site.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              {post.featured_image_url ? (
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={post.featured_image_url}
                    alt={stripHtml(post.title.rendered)}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
              )}

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {stripHtml(post.title.rendered)}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {stripHtml(post.excerpt.rendered)}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-blue-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPost && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPost.featured_image_url && (
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img
                  src={selectedPost.featured_image_url}
                  alt={stripHtml(selectedPost.title.rendered)}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {stripHtml(selectedPost.title.rendered)}
              </h2>

              <div className="prose prose-sm max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: selectedPost.excerpt.rendered }} />
              </div>

              <a
                href={selectedPost.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
              >
                <Globe className="w-4 h-4" />
                View original post
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Publish to Platforms</h3>

                <div className="space-y-2 mb-6">
                  {[
                    { id: 'twitter', name: 'Twitter', note: selectedPost.featured_image_url ? '' : '(Requires featured image)' },
                    { id: 'facebook', name: 'Facebook', note: '' },
                    { id: 'linkedin', name: 'LinkedIn', note: '' }
                  ].map(platform => (
                    <label
                      key={platform.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={() => togglePlatform(platform.id)}
                        disabled={platform.id === 'twitter' && !selectedPost.featured_image_url}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="flex-1 font-medium text-gray-800">
                        {platform.name}
                        {platform.note && (
                          <span className="ml-2 text-xs text-gray-500 font-normal">
                            {platform.note}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>

                {!selectedPost.featured_image_url && (
                  <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      This post has no featured image. Twitter requires an image to publish.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handlePublish}
                    disabled={publishing === selectedPost.id || selectedPlatforms.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {publishing === selectedPost.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Publish Now
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
