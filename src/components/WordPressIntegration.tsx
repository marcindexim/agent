import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Globe, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WordPressConnection {
  id: string;
  domain: string;
  username: string;
  application_password: string;
  connected: boolean;
  site_name: string | null;
  site_description: string | null;
}

export function WordPressIntegration() {
  const { user } = useAuth();
  const [connection, setConnection] = useState<WordPressConnection | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [domain, setDomain] = useState('');
  const [username, setUsername] = useState('');
  const [applicationPassword, setApplicationPassword] = useState('');

  useEffect(() => {
    if (user) {
      fetchConnection();
    }
  }, [user]);

  const fetchConnection = async () => {
    const { data, error } = await supabase
      .from('wordpress_connections')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (!error && data) {
      setConnection(data);
    }
  };

  const normalizeDomain = (input: string) => {
    let normalized = input.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    normalized = normalized.replace(/\/$/, '');
    return normalized;
  };

  const testConnection = async () => {
    setTesting(true);
    setError('');
    setSuccess('');

    try {
      const normalizedDomain = normalizeDomain(domain);
      const credentials = btoa(`${username}:${applicationPassword}`);

      const response = await fetch(`${normalizedDomain}/wp-json/wp/v2/users/me`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid credentials or WordPress REST API not available');
      }

      const userData = await response.json();
      setSuccess(`Connection successful! Authenticated as: ${userData.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to WordPress');
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
      const normalizedDomain = normalizeDomain(domain);

      // Test connection first
      const credentials = btoa(`${username}:${applicationPassword}`);
      const [userResponse, siteResponse] = await Promise.all([
        fetch(`${normalizedDomain}/wp-json/wp/v2/users/me`, {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${normalizedDomain}/wp-json`, {
          headers: { 'Content-Type': 'application/json' }
        })
      ]);

      if (!userResponse.ok) {
        throw new Error('Invalid credentials');
      }

      const siteData = siteResponse.ok ? await siteResponse.json() : null;

      // Save to database
      if (connection) {
        const { error } = await supabase
          .from('wordpress_connections')
          .update({
            domain: normalizedDomain,
            username,
            application_password: applicationPassword,
            connected: true,
            site_name: siteData?.name || null,
            site_description: siteData?.description || null
          })
          .eq('id', connection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('wordpress_connections')
          .insert({
            user_id: user!.id,
            domain: normalizedDomain,
            username,
            application_password: applicationPassword,
            connected: true,
            site_name: siteData?.name || null,
            site_description: siteData?.description || null
          });

        if (error) throw error;
      }

      setSuccess('WordPress connected successfully!');
      setShowForm(false);
      fetchConnection();
      setDomain('');
      setUsername('');
      setApplicationPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect WordPress');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;

    const confirmed = confirm('Are you sure you want to disconnect WordPress?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('wordpress_connections')
      .delete()
      .eq('id', connection.id);

    if (!error) {
      setConnection(null);
      setSuccess('WordPress disconnected');
    }
  };

  const handleEdit = () => {
    if (connection) {
      setDomain(connection.domain);
      setUsername(connection.username);
      setApplicationPassword(connection.application_password);
      setShowForm(true);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
          <Globe className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">WordPress</h3>
            {connection?.connected && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Connected
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Connect your WordPress site to fetch and publish posts automatically
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
                <p className="text-sm text-gray-600 mb-1">Domain</p>
                <p className="font-medium text-gray-800">{connection.domain}</p>
                {connection.site_name && (
                  <>
                    <p className="text-sm text-gray-600 mt-3 mb-1">Site Name</p>
                    <p className="font-medium text-gray-800">{connection.site_name}</p>
                  </>
                )}
                <p className="text-sm text-gray-600 mt-3 mb-1">Username</p>
                <p className="font-medium text-gray-800">{connection.username}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  WordPress Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example.com or https://example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your WordPress site URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Password
                </label>
                <input
                  type="password"
                  value={applicationPassword}
                  onChange={(e) => setApplicationPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="xxxx xxxx xxxx xxxx"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Generate in WordPress: Users → Your Profile → Application Passwords
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={!domain || !username || !applicationPassword || testing}
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Connecting...' : connection ? 'Update Connection' : 'Connect WordPress'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                    setSuccess('');
                    if (!connection) {
                      setDomain('');
                      setUsername('');
                      setApplicationPassword('');
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect WordPress
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
