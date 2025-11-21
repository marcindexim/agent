import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Wand2, Sparkles, Rss, Code2, Globe } from 'lucide-react';
import { Template } from '../types';
import { mockTemplates, mockRSSFeeds, mockAPIContent, mockWordPressPosts } from '../lib/mockData';

export function PostGenerator() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [contentSource, setContentSource] = useState<'manual' | 'rss' | 'api' | 'wordpress'>('manual');
  const [selectedSourceItem, setSelectedSourceItem] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [rssFeeds] = useState(mockRSSFeeds);
  const [apiContent] = useState(mockAPIContent);
  const [wordpressPosts] = useState(mockWordPressPosts);

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', user!.id);

    if (!error && data && data.length > 0) {
      setTemplates(data);
    } else {
      setTemplates(mockTemplates as any);
    }
  };

  const proceedToPreview = () => {
    if (!selectedTemplate || (contentSource !== 'manual' && !selectedSourceItem)) return;
    setStep(2);
    generatePost();
  };

  const generatePost = () => {
    setLoading(true);
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    let result = template.content_template
      .replace(/{title}/g, title)
      .replace(/{content}/g, content)
      .replace(/{url}/g, url);

    if (template.hashtags && template.hashtags.length > 0) {
      result += '\n\n' + template.hashtags.map(tag => `#${tag}`).join(' ');
    }

    setTimeout(() => {
      setGeneratedPost(result);
      setLoading(false);
    }, 500);
  };

  const handleSourceSelect = (item: any) => {
    setSelectedSourceItem(item);
    if (contentSource === 'rss') {
      setTitle(item.title);
      setContent(item.description);
      setUrl(item.link);
    } else if (contentSource === 'api') {
      setTitle(item.title);
      setContent(item.description);
      setUrl(item.link);
    } else if (contentSource === 'wordpress') {
      const stripHtml = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };
      const postTitle = stripHtml(item.title.rendered);
      const excerpt = stripHtml(item.excerpt.rendered);
      setTitle(postTitle);
      setContent(excerpt);
      setUrl(item.link);
    }
  };

  const resetGenerator = () => {
    setStep(1);
    setGeneratedPost('');
    setTitle('');
    setContent('');
    setUrl('');
    setSelectedSourceItem(null);
    setContentSource('manual');
    setSelectedTemplate('');
  };

  const savePost = async () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const { error } = await supabase.from('posts').insert({
      user_id: user!.id,
      template_id: selectedTemplate,
      platform: template.platform,
      content: generatedPost,
      status: 'draft',
    });

    if (!error) {
      alert('Post saved as draft!');
      setStep(3);
    }
  };

  const publishPost = async () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const { error } = await supabase.from('posts').insert({
      user_id: user!.id,
      template_id: selectedTemplate,
      platform: template.platform,
      content: generatedPost,
      status: 'published',
      published_at: new Date().toISOString(),
    });

    if (!error) {
      alert('Post published successfully!');
      setStep(3);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">AI Post Generator</h2>
        <p className="text-gray-600 mt-2">Generate posts using your templates and AI</p>
      </div>

      <div className="mb-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            1
          </div>
          <span className={`text-sm font-medium ${step >= 1 ? 'text-gray-800' : 'text-gray-400'}`}>Source & Template</span>
        </div>
        <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            2
          </div>
          <span className={`text-sm font-medium ${step >= 2 ? 'text-gray-800' : 'text-gray-400'}`}>Preview</span>
        </div>
        <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            3
          </div>
          <span className={`text-sm font-medium ${step >= 3 ? 'text-gray-800' : 'text-gray-400'}`}>Publish</span>
        </div>
      </div>

      {step === 1 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 1: Select Content Source</h3>

              <div className="grid grid-cols-2 gap-2 mb-6">
                <button
                  onClick={() => {
                    setContentSource('manual');
                    setSelectedSourceItem(null);
                    setTitle('');
                    setContent('');
                    setUrl('');
                  }}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    contentSource === 'manual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => {
                    setContentSource('rss');
                    setSelectedSourceItem(null);
                  }}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    contentSource === 'rss'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Rss className="w-4 h-4 inline mr-2" />
                  RSS
                </button>
                <button
                  onClick={() => {
                    setContentSource('api');
                    setSelectedSourceItem(null);
                  }}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    contentSource === 'api'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Code2 className="w-4 h-4 inline mr-2" />
                  API
                </button>
                <button
                  onClick={() => {
                    setContentSource('wordpress');
                    setSelectedSourceItem(null);
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
              </div>

              {contentSource === 'manual' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
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
                      rows={6}
                      placeholder="Enter content..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL (optional)
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ) : contentSource === 'rss' ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {rssFeeds.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => handleSourceSelect(item)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedSourceItem?.id === item.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt="RSS thumbnail"
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Rss className="w-3 h-3 text-orange-600" />
                            <span className="text-xs text-orange-600 font-medium">{item.source}</span>
                          </div>
                          <h4 className="font-medium text-gray-800 text-sm mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : contentSource === 'api' ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {apiContent.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => handleSourceSelect(item)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedSourceItem?.id === item.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt="API thumbnail"
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Code2 className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">{item.source}</span>
                          </div>
                          <h4 className="font-medium text-gray-800 text-sm mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {wordpressPosts.map((post: any) => (
                    <div
                      key={post.id}
                      onClick={() => handleSourceSelect(post)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedSourceItem?.id === post.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        {post.featured_image_url && (
                          <img
                            src={post.featured_image_url}
                            alt="Post thumbnail"
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-3 h-3 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">WordPress</span>
                          </div>
                          <h4 className="font-medium text-gray-800 text-sm mb-1">
                            {post.title.rendered.replace(/<[^>]*>/g, '')}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {post.excerpt.rendered.replace(/<[^>]*>/g, '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 2: Select Template</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.platform})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTemplate && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Template Preview:</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {templates.find(t => t.id === selectedTemplate)?.content_template}
                    </p>
                  </div>
                )}

                <button
                  onClick={proceedToPreview}
                  disabled={!selectedTemplate || (contentSource !== 'manual' && !selectedSourceItem)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Preview</span>
                </button>
              </div>
            </div>

            {templates.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> First create templates in the "Templates" tab
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Post Preview</h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Sparkles className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : generatedPost ? (
              <div className="space-y-4">
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px] whitespace-pre-wrap">
                  {generatedPost}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={savePost}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={publishPost}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Publish Now
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">Your post has been processed successfully.</p>
            <button
              onClick={resetGenerator}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Another Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
