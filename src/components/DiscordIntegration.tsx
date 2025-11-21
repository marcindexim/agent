import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageCircle, CheckCircle, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { mockDiscordWebhooks } from '../lib/mockData';

interface DiscordWebhook {
  id: string;
  name: string;
  webhook_url: string;
  connected: boolean;
}

export function DiscordIntegration() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<DiscordWebhook[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWebhooks();
    }
  }, [user]);

  const fetchWebhooks = async () => {
    const { data, error } = await supabase
      .from('discord_webhooks')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setWebhooks(data);
    } else {
      setWebhooks(mockDiscordWebhooks as any);
    }
  };

  const testWebhook = async (url: string) => {
    setTesting(url);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: '✅ Test message from Content AI - Your Discord webhook is working correctly!'
        })
      });

      if (!response.ok) {
        throw new Error('Invalid Discord webhook URL');
      }

      setSuccess('Test message sent successfully! Check your Discord channel.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test message');
    } finally {
      setTesting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate webhook URL format
      if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') &&
          !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
        throw new Error('Invalid Discord webhook URL format');
      }

      // Test webhook first
      const testResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: '✅ Discord webhook connected successfully!'
        })
      });

      if (!testResponse.ok) {
        throw new Error('Invalid Discord webhook URL');
      }

      // Save to database
      if (editingId) {
        const { error } = await supabase
          .from('discord_webhooks')
          .update({
            name,
            webhook_url: webhookUrl,
            connected: true
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('discord_webhooks')
          .insert({
            user_id: user!.id,
            name,
            webhook_url: webhookUrl,
            connected: true
          });

        if (error) throw error;
      }

      setSuccess('Discord webhook saved successfully!');
      setShowForm(false);
      setEditingId(null);
      fetchWebhooks();
      setName('');
      setWebhookUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this webhook?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('discord_webhooks')
      .delete()
      .eq('id', id);

    if (!error) {
      setSuccess('Webhook deleted');
      fetchWebhooks();
    }
  };

  const handleEdit = (webhook: DiscordWebhook) => {
    setName(webhook.name);
    setWebhookUrl(webhook.webhook_url);
    setEditingId(webhook.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
          <MessageCircle className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Discord Webhooks</h3>
            {webhooks.length > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Add Discord webhooks to publish embed messages with images
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

          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="My Discord Channel"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://discord.com/api/webhooks/..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get webhook URL from: Discord Server Settings → Integrations → Webhooks
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => webhookUrl && testWebhook(webhookUrl)}
                  disabled={!webhookUrl || testing === webhookUrl}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing === webhookUrl ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Webhook'
                  )}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Webhook' : 'Add Webhook'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setError('');
                    setSuccess('');
                    setName('');
                    setWebhookUrl('');
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
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mb-4"
            >
              <Plus className="w-4 h-4" />
              Add Webhook
            </button>
          )}

          {webhooks.length > 0 && (
            <div className="space-y-2">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{webhook.name}</p>
                    <p className="text-xs text-gray-600 font-mono truncate mt-1">
                      {webhook.webhook_url}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => testWebhook(webhook.webhook_url)}
                      disabled={testing === webhook.webhook_url}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {testing === webhook.webhook_url ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(webhook)}
                      className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {webhooks.length === 0 && !showForm && (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No webhooks configured yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
