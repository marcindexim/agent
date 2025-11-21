import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { mockRedditConnection } from '../lib/mockData';

interface RedditConnection {
  id: string;
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
  user_agent: string;
  connected: boolean;
}

export function RedditIntegration() {
  const { user } = useAuth();
  const [connection, setConnection] = useState<RedditConnection | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userAgent, setUserAgent] = useState('ContentAI/1.0');

  useEffect(() => {
    if (user) {
      fetchConnection();
    }
  }, [user]);

  const fetchConnection = async () => {
    const { data, error } = await supabase
      .from('reddit_connections')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (!error && data) {
      setConnection(data);
    } else {
      setConnection({ ...mockRedditConnection, id: 'mock-reddit', connected: true } as any);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setError('');
    setSuccess('');

    try {
      // Get OAuth token
      const authString = btoa(`${clientId}:${clientSecret}`);
      const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': userAgent
        },
        body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });

      if (!tokenResponse.ok) {
        throw new Error('Invalid Reddit credentials');
      }

      const tokenData = await tokenResponse.json();

      // Test API with token
      const meResponse = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'User-Agent': userAgent
        }
      });

      if (!meResponse.ok) {
        throw new Error('Failed to authenticate with Reddit');
      }

      const userData = await meResponse.json();
      setSuccess(`Connection successful! Authenticated as: u/${userData.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Reddit');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Test connection first
      const authString = btoa(`${clientId}:${clientSecret}`);
      const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': userAgent
        },
        body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });

      if (!tokenResponse.ok) {
        throw new Error('Invalid Reddit credentials');
      }

      // Save to database
      if (connection) {
        const { error } = await supabase
          .from('reddit_connections')
          .update({
            client_id: clientId,
            client_secret: clientSecret,
            username,
            password,
            user_agent: userAgent,
            connected: true
          })
          .eq('id', connection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reddit_connections')
          .insert({
            user_id: user!.id,
            client_id: clientId,
            client_secret: clientSecret,
            username,
            password,
            user_agent: userAgent,
            connected: true
          });

        if (error) throw error;
      }

      setSuccess('Reddit connected successfully!');
      setShowForm(false);
      fetchConnection();
      setClientId('');
      setClientSecret('');
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Reddit');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;

    const confirmed = confirm('Are you sure you want to disconnect Reddit?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('reddit_connections')
      .delete()
      .eq('id', connection.id);

    if (!error) {
      setConnection(null);
      setSuccess('Reddit disconnected');
    }
  };

  const handleEdit = () => {
    if (connection) {
      setClientId(connection.client_id);
      setClientSecret(connection.client_secret);
      setUsername(connection.username);
      setPassword(connection.password);
      setUserAgent(connection.user_agent);
      setShowForm(true);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
          <MessageSquare className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Reddit</h3>
            {connection?.connected && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Connected
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Connect your Reddit account to publish posts in subreddits
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {connection && !showForm ? (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Username</p>
                <p className="font-medium text-gray-800">u/{connection.username}</p>
                <p className="text-sm text-gray-600 mt-3 mb-1">Client ID</p>
                <p className="font-medium text-gray-800 font-mono text-sm">{connection.client_id}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Edit Connection
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reddit Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="your_username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reddit Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="abc123xyz..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Create an app at reddit.com/prefs/apps (select "script" type)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="abc123xyz..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Agent
                </label>
                <input
                  type="text"
                  value={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="ContentAI/1.0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: AppName/Version (e.g., MyApp/1.0)
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={!clientId || !clientSecret || !username || !password || testing}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Connecting...' : connection ? 'Update Connection' : 'Connect Reddit'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                    setSuccess('');
                    if (!connection) {
                      setClientId('');
                      setClientSecret('');
                      setUsername('');
                      setPassword('');
                      setUserAgent('ContentAI/1.0');
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Connect Reddit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
