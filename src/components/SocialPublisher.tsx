import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Send, Image as ImageIcon, Loader2, AlertCircle, CheckCircle, Twitter, Facebook, Globe, FileText, Rss, Code2 } from 'lucide-react';
import { mockRedditConnection, mockDiscordWebhooks, mockTwitterConnection, mockFacebookConnection, mockWordPressPosts, mockRSSFeeds, mockAPIContent } from '../lib/mockData';

interface RedditConnection {
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
  user_agent: string;
}

interface DiscordWebhook {
  id: string;
  name: string;
  webhook_url: string;
}

interface TwitterConnection {
  access_token: string;
  access_token_secret: string;
  username: string;
}

interface FacebookConnection {
  page_id: string;
  access_token: string;
  page_name: string;
}

export function SocialPublisher() {
  const { user } = useAuth();
  const [redditConnection, setRedditConnection] = useState<RedditConnection | null>(null);
  const [discordWebhooks, setDiscordWebhooks] = useState<DiscordWebhook[]>([]);
  const [twitterConnection, setTwitterConnection] = useState<TwitterConnection | null>(null);
  const [facebookConnection, setFacebookConnection] = useState<FacebookConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [selectedWebhooks, setSelectedWebhooks] = useState<string[]>([]);
  const [publishToReddit, setPublishToReddit] = useState(false);
  const [publishToTwitter, setPublishToTwitter] = useState(false);
  const [publishToFacebook, setPublishToFacebook] = useState(false);
  const [contentSource, setContentSource] = useState<'manual' | 'wordpress' | 'rss' | 'api'>('manual');
  const [wordpressPosts] = useState(mockWordPressPosts);
  const [rssFeeds] = useState(mockRSSFeeds);
  const [apiContent] = useState(mockAPIContent);
  const [selectedWordPressPost, setSelectedWordPressPost] = useState<any>(null);
  const [selectedRSSItem, setSelectedRSSItem] = useState<any>(null);
  const [selectedAPIItem, setSelectedAPIItem] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    const [redditRes, discordRes] = await Promise.all([
      supabase.from('reddit_connections').select('*').eq('user_id', user!.id).maybeSingle(),
      supabase.from('discord_webhooks').select('*').eq('user_id', user!.id).eq('connected', true)
    ]);

    if (redditRes.data) {
      setRedditConnection(redditRes.data);
    } else {
      setRedditConnection(mockRedditConnection as any);
    }

    if (discordRes.data && discordRes.data.length > 0) {
      setDiscordWebhooks(discordRes.data);
    } else {
      setDiscordWebhooks(mockDiscordWebhooks as any);
    }

    // Set mock Twitter and Facebook connections
    setTwitterConnection(mockTwitterConnection as any);
    setFacebookConnection(mockFacebookConnection as any);
  };

  const getRedditAccessToken = async (): Promise<string> => {
    if (!redditConnection) throw new Error('Reddit not connected');

    const authString = btoa(`${redditConnection.client_id}:${redditConnection.client_secret}`);
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': redditConnection.user_agent
      },
      body: `grant_type=password&username=${encodeURIComponent(redditConnection.username)}&password=${encodeURIComponent(redditConnection.password)}`
    });

    if (!response.ok) throw new Error('Failed to authenticate with Reddit');

    const data = await response.json();
    return data.access_token;
  };

  const publishToRedditAPI = async () => {
    if (!redditConnection || !subreddit) return { success: false, error: 'Missing Reddit configuration' };

    try {
      const accessToken = await getRedditAccessToken();

      // Determine post type
      const isImagePost = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));

      const postData: any = {
        sr: subreddit,
        kind: isImagePost ? 'link' : 'self',
        title: title || content.substring(0, 100),
      };

      if (isImagePost) {
        postData.url = imageUrl;
      } else {
        postData.text = content;
      }

      const response = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': redditConnection.user_agent
        },
        body: new URLSearchParams(postData).toString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post to Reddit');
      }

      const result = await response.json();
      return { success: true, url: result.json?.data?.url || 'Posted to Reddit' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to post to Reddit' };
    }
  };

  const publishToDiscordAPI = async (webhookUrl: string) => {
    try {
      const embedData: any = {
        embeds: [{
          title: title || undefined,
          description: content,
          color: 5814783,
          timestamp: new Date().toISOString()
        }]
      };

      if (imageUrl) {
        embedData.embeds[0].image = { url: imageUrl };
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(embedData)
      });

      if (!response.ok) {
        throw new Error('Failed to post to Discord');
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to post to Discord' };
    }
  };

  const handlePublish = async () => {
    if (!content && !title) {
      setError('Please enter content or title');
      return;
    }

    if (!publishToReddit && !publishToTwitter && !publishToFacebook && selectedWebhooks.length === 0) {
      setError('Please select at least one platform to publish to');
      return;
    }

    const isDemoMode = redditConnection?.client_id === 'demo_client_id' ||
                      twitterConnection?.access_token === 'demo_twitter_token' ||
                      facebookConnection?.access_token === 'demo_fb_token' ||
                      (discordWebhooks.length > 0 && discordWebhooks[0].id.startsWith('mock-'));

    if (isDemoMode) {
      setError('Demo Mode: Please connect real accounts in the Integrations section to publish content.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const results: string[] = [];
    const errors: string[] = [];

    try {
      // Publish to Reddit
      if (publishToReddit && redditConnection) {
        const redditResult = await publishToRedditAPI();
        if (redditResult.success) {
          results.push('Reddit');
        } else {
          errors.push(`Reddit: ${redditResult.error}`);
        }
      }

      // Publish to Discord webhooks
      for (const webhookId of selectedWebhooks) {
        const webhook = discordWebhooks.find(w => w.id === webhookId);
        if (webhook) {
          const discordResult = await publishToDiscordAPI(webhook.webhook_url);
          if (discordResult.success) {
            results.push(`Discord (${webhook.name})`);
          } else {
            errors.push(`Discord (${webhook.name}): ${discordResult.error}`);
          }
        }
      }

      // Save to posts table
      await supabase.from('posts').insert({
        user_id: user!.id,
        content: `${title ? title + '\n\n' : ''}${content}`,
        platform: publishToReddit ? 'reddit' : 'discord',
        status: errors.length === 0 ? 'published' : 'partial',
        published_at: new Date().toISOString()
      });

      if (results.length > 0) {
        setSuccess(`Successfully published to: ${results.join(', ')}`);
      }

      if (errors.length > 0) {
        setError(`Errors: ${errors.join('; ')}`);
      }

      if (errors.length === 0) {
        setContent('');
        setTitle('');
        setImageUrl('');
        setSubreddit('');
        setSelectedWebhooks([]);
        setPublishToReddit(false);
        setPublishToTwitter(false);
        setPublishToFacebook(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  const isDemoMode = redditConnection?.client_id === 'demo_client_id' ||
                    twitterConnection?.access_token === 'demo_twitter_token' ||
                    facebookConnection?.access_token === 'demo_fb_token' ||
                    (discordWebhooks.length > 0 && discordWebhooks[0].id.startsWith('mock-'));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Publish to Social Media</h2>
        <p className="text-gray-600 mt-2">Share your content on Reddit and Discord</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Source</h3>

            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => {
                  setContentSource('manual');
                  setSelectedWordPressPost(null);
                  setSelectedRSSItem(null);
                  setSelectedAPIItem(null);
                }}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  contentSource === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Manual
              </button>
              <button
                onClick={() => {
                  setContentSource('wordpress');
                  setSelectedRSSItem(null);
                  setSelectedAPIItem(null);
                }}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  contentSource === 'wordpress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                WordPress
              </button>
              <button
                onClick={() => {
                  setContentSource('rss');
                  setSelectedWordPressPost(null);
                  setSelectedAPIItem(null);
                }}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  contentSource === 'rss'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Rss className="w-4 h-4 inline mr-2" />
                RSS Feeds
              </button>
              <button
                onClick={() => {
                  setContentSource('api');
                  setSelectedWordPressPost(null);
                  setSelectedRSSItem(null);
                }}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  contentSource === 'api'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Code2 className="w-4 h-4 inline mr-2" />
                API Data
              </button>
            </div>

            {contentSource === 'wordpress' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">Select a WordPress post to publish:</p>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {wordpressPosts.map((post: any) => (
                    <div
                      key={post.id}
                      onClick={() => {
                        setSelectedWordPressPost(post);
                        const stripHtml = (html: string) => {
                          const tmp = document.createElement('div');
                          tmp.innerHTML = html;
                          return tmp.textContent || tmp.innerText || '';
                        };
                        const postTitle = stripHtml(post.title.rendered);
                        const excerpt = stripHtml(post.excerpt.rendered);
                        setTitle(postTitle);
                        setContent(`${postTitle}\n\n${excerpt}\n\n${post.link}`);
                        setImageUrl(post.featured_image_url || '');
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedWordPressPost?.id === post.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        {post.featured_image_url && (
                          <img
                            src={post.featured_image_url}
                            alt="Post thumbnail"
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1">
                            {post.title.rendered.replace(/<[^>]*>/g, '')}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {post.excerpt.rendered.replace(/<[^>]*>/g, '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : contentSource === 'rss' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">Select an RSS feed item to publish:</p>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {rssFeeds.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedRSSItem(item);
                        setTitle(item.title);
                        setContent(`${item.title}\n\n${item.description}\n\n${item.link}`);
                        setImageUrl(item.imageUrl || '');
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRSSItem?.id === item.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt="RSS thumbnail"
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Rss className="w-3 h-3 text-orange-600" />
                            <span className="text-xs text-orange-600 font-medium">{item.source}</span>
                          </div>
                          <h4 className="font-medium text-gray-800 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : contentSource === 'api' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">Select API content to publish:</p>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {apiContent.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedAPIItem(item);
                        setTitle(item.title);
                        setContent(`${item.title}\n\n${item.description}\n\n${item.link}`);
                        setImageUrl(item.imageUrl || '');
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAPIItem?.id === item.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt="API thumbnail"
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Code2 className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">{item.source}</span>
                          </div>
                          <h4 className="font-medium text-gray-800 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (optional for Discord, required for Reddit)
                  </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                  placeholder="Enter your content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {imageUrl && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img src={imageUrl} alt="Preview" className="max-w-full h-auto rounded" />
                </div>
              )}
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Platforms</h3>

            <div className="space-y-4">
              {redditConnection && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publishToReddit}
                      onChange={(e) => setPublishToReddit(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="font-medium text-gray-800">Reddit</span>
                  </label>

                  {publishToReddit && (
                    <input
                      type="text"
                      value={subreddit}
                      onChange={(e) => setSubreddit(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Subreddit (e.g., test)"
                    />
                  )}
                </div>
              )}

              {twitterConnection && (
                <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishToTwitter}
                    onChange={(e) => setPublishToTwitter(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <Twitter className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="font-medium text-gray-800">X (Twitter)</span>
                    <span className="text-xs text-gray-600 block">{twitterConnection.username}</span>
                  </div>
                </label>
              )}

              {facebookConnection && (
                <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishToFacebook}
                    onChange={(e) => setPublishToFacebook(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <Facebook className="w-5 h-5 text-blue-700" />
                  <div>
                    <span className="font-medium text-gray-800">Facebook</span>
                    <span className="text-xs text-gray-600 block">{facebookConnection.page_name}</span>
                  </div>
                </label>
              )}

              {discordWebhooks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Discord Webhooks</p>
                  {discordWebhooks.map(webhook => (
                    <label
                      key={webhook.id}
                      className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedWebhooks.includes(webhook.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWebhooks([...selectedWebhooks, webhook.id]);
                          } else {
                            setSelectedWebhooks(selectedWebhooks.filter(id => id !== webhook.id));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="font-medium text-gray-800">{webhook.name}</span>
                    </label>
                  ))}
                </div>
              )}

              {!redditConnection && !twitterConnection && !facebookConnection && discordWebhooks.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No platforms connected</p>
                  <p className="text-xs mt-1">Go to Integrations to connect</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={loading || (!publishToReddit && !publishToTwitter && !publishToFacebook && selectedWebhooks.length === 0)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Publish Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
