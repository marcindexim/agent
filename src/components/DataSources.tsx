import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Globe, Rss, Code } from 'lucide-react';
import { DataSource } from '../types';
import { mockDataSources } from '../lib/mockData';

export function DataSources() {
  const { user } = useAuth();
  const [sources, setSources] = useState<DataSource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'rss' | 'website' | 'api'>('rss');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (user) {
      fetchSources();
    }
  }, [user]);

  const fetchSources = async () => {
    const { data, error } = await supabase
      .from('data_sources')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setSources(data);
    } else {
      setSources(mockDataSources as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('data_sources').insert({
      user_id: user!.id,
      name,
      type,
      url,
      is_active: true,
    });

    if (!error) {
      setName('');
      setUrl('');
      setShowForm(false);
      fetchSources();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('data_sources').delete().eq('id', id);

    if (!error) {
      fetchSources();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'rss':
        return <Rss className="w-5 h-5" />;
      case 'website':
        return <Globe className="w-5 h-5" />;
      case 'api':
        return <Code className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Data Sources</h2>
          <p className="text-gray-600 mt-2">Manage content sources for your automation</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Source</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">New Data Source</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="My RSS Blog"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rss">RSS Feed</option>
                <option value="website">Website</option>
                <option value="api">API</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/feed.xml"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {sources.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Sources</h3>
            <p className="text-gray-600 mb-6">Add your first source to start content automation</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Source
            </button>
          </div>
        ) : (
          sources.map((source) => (
            <div key={source.id} className="bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  {getIcon(source.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{source.name}</h3>
                  <p className="text-sm text-gray-600">{source.url}</p>
                  <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {source.type}
                  </span>
                </div>
              </div>
              {!source.id.startsWith('mock-') && (
                <button
                  onClick={() => handleDelete(source.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
