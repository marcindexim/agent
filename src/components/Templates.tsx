import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, FileText, Edit2 } from 'lucide-react';
import { Template } from '../types';
import { mockTemplates } from '../lib/mockData';

export function Templates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'twitter' | 'linkedin' | 'facebook' | 'instagram'>('twitter');
  const [contentTemplate, setContentTemplate] = useState('');
  const [hashtags, setHashtags] = useState('');

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setTemplates(data);
    } else {
      setTemplates(mockTemplates as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTemplate) {
      const { error } = await supabase
        .from('templates')
        .update({
          name,
          platform,
          content_template: contentTemplate,
          hashtags: hashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
        })
        .eq('id', editingTemplate.id);

      if (!error) {
        resetForm();
        fetchTemplates();
      }
    } else {
      const { error } = await supabase.from('templates').insert({
        user_id: user!.id,
        name,
        platform,
        content_template: contentTemplate,
        hashtags: hashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
      });

      if (!error) {
        resetForm();
        fetchTemplates();
      }
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setName(template.name);
    setPlatform(template.platform);
    setContentTemplate(template.content_template);
    setHashtags(template.hashtags?.join(', ') || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setName('');
    setContentTemplate('');
    setHashtags('');
    setShowForm(false);
    setEditingTemplate(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('templates').delete().eq('id', id);

    if (!error) {
      fetchTemplates();
    }
  };

  const platformColors = {
    twitter: 'bg-blue-50 text-blue-600',
    linkedin: 'bg-blue-50 text-blue-700',
    facebook: 'bg-blue-50 text-blue-800',
    instagram: 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Post Templates</h2>
          <p className="text-gray-600 mt-2">Create and manage templates for different platforms</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Template</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{editingTemplate ? 'Edit Template' : 'New Template'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Promotional Template"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Template
              </label>
              <textarea
                value={contentTemplate}
                onChange={(e) => setContentTemplate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Use variables: {title}, {content}, {url}"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Available variables: {'{title}'}, {'{content}'}, {'{url}'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hashtags (comma separated)
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="marketing, ai, content"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTemplate ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {templates.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Templates</h3>
            <p className="text-gray-600 mb-6">Create your first template to start generating posts</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Template
            </button>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800">{template.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${platformColors[template.platform]}`}>
                      {template.platform}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{template.content_template}</p>
                  {template.hashtags && template.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {template.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
