import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Plus, Trash2, Power, Rss, Code2, Globe, FileText } from 'lucide-react';
import { Post, Template } from '../types';
import { mockPosts, mockTemplates, mockDataSources } from '../lib/mockData';

interface ScheduledTask {
  id: string;
  task_name: string;
  source_type: 'manual' | 'rss' | 'api' | 'wordpress';
  source_id?: string;
  template_id: string;
  cron_schedule: string;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
}

export function Schedule() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [dataSources] = useState(mockDataSources);

  const [newTask, setNewTask] = useState({
    task_name: '',
    source_type: 'rss' as 'manual' | 'rss' | 'api' | 'wordpress',
    source_id: '',
    template_id: '',
    cron_schedule: '0 9 * * *',
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchTasks();
      fetchTemplates();
    }
  }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user!.id)
      .in('status', ['draft', 'scheduled'])
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setPosts(data);
    } else {
      const filteredMockPosts = mockPosts.filter(p => p.status === 'draft' || p.status === 'scheduled');
      setPosts(filteredMockPosts as any);
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('scheduled_tasks')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data);
    }
  };

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

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

    const { error } = await supabase
      .from('posts')
      .update({
        status: 'scheduled',
        scheduled_for: scheduledFor,
      })
      .eq('id', selectedPost);

    if (!error) {
      alert('Post scheduled!');
      setSelectedPost('');
      setScheduledDate('');
      setScheduledTime('');
      fetchPosts();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('scheduled_tasks').insert({
      user_id: user!.id,
      task_name: newTask.task_name,
      source_type: newTask.source_type,
      source_id: newTask.source_id || null,
      template_id: newTask.template_id,
      cron_schedule: newTask.cron_schedule,
      is_active: newTask.is_active,
    });

    if (!error) {
      alert('Scheduled task created!');
      setShowTaskModal(false);
      setNewTask({
        task_name: '',
        source_type: 'rss',
        source_id: '',
        template_id: '',
        cron_schedule: '0 9 * * *',
        is_active: true,
      });
      fetchTasks();
    }
  };

  const toggleTaskActive = async (taskId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('scheduled_tasks')
      .update({ is_active: !currentStatus })
      .eq('id', taskId);

    if (!error) {
      fetchTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const { error } = await supabase
      .from('scheduled_tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      fetchTasks();
    }
  };

  const draftPosts = posts.filter(p => p.status === 'draft');
  const scheduledPosts = posts.filter(p => p.status === 'scheduled');

  const platformColors = {
    twitter: 'bg-blue-100 text-blue-700',
    linkedin: 'bg-blue-100 text-blue-800',
    facebook: 'bg-blue-100 text-blue-900',
    instagram: 'bg-pink-100 text-pink-700',
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'rss': return <Rss className="w-4 h-4" />;
      case 'api': return <Code2 className="w-4 h-4" />;
      case 'wordpress': return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Publication Schedule</h2>
          <p className="text-gray-600 mt-2">Plan your post publications and automated tasks</p>
        </div>
        <button
          onClick={() => setShowTaskModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Automated Task
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Single Post
          </h3>

          <form onSubmit={handleSchedule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Post
              </label>
              <select
                value={selectedPost}
                onChange={(e) => setSelectedPost(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select post...</option>
                {draftPosts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.content.substring(0, 50)}... ({post.platform})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule Publication
            </button>
          </form>

          {draftPosts.length === 0 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                No drafts to schedule. Create posts in the generator.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Scheduled Posts
          </h3>

          <div className="space-y-3">
            {scheduledPosts.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No scheduled posts</p>
              </div>
            ) : (
              scheduledPosts.map((post) => (
                <div key={post.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${platformColors[post.platform]}`}>
                      {post.platform}
                    </span>
                    <span className="text-xs text-gray-600">
                      {post.scheduled_for && new Date(post.scheduled_for).toLocaleString('en-US')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Automated Tasks
        </h3>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No automated tasks configured</p>
            <button
              onClick={() => setShowTaskModal(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first automated task
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-800">{task.task_name}</h4>
                      {task.is_active ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Active</span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Inactive</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {getSourceIcon(task.source_type)}
                        <span className="capitalize">{task.source_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{task.cron_schedule}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTaskActive(task.id, task.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        task.is_active
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={task.is_active ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div style={{ backgroundColor: '#ffffff' }} className="rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create Automated Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  value={newTask.task_name}
                  onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Daily Posts"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Source
                </label>
                <select
                  value={newTask.source_type}
                  onChange={(e) => setNewTask({ ...newTask, source_type: e.target.value as any, source_id: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="rss">RSS Feed</option>
                  <option value="api">API Data</option>
                  <option value="wordpress">WordPress</option>
                </select>
              </div>

              {newTask.source_type !== 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Item (optional)
                  </label>
                  <select
                    value={newTask.source_id}
                    onChange={(e) => setNewTask({ ...newTask, source_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any from source</option>
                    {dataSources
                      .filter(ds => ds.type === newTask.source_type)
                      .map(ds => (
                        <option key={ds.id} value={ds.id}>{ds.name}</option>
                      ))
                    }
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template
                </label>
                <select
                  value={newTask.template_id}
                  onChange={(e) => setNewTask({ ...newTask, template_id: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule
                </label>
                <select
                  value={newTask.cron_schedule}
                  onChange={(e) => setNewTask({ ...newTask, cron_schedule: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="0 9 * * *">Daily at 9:00 AM</option>
                  <option value="0 12 * * *">Daily at 12:00 PM (noon)</option>
                  <option value="0 15 * * *">Daily at 3:00 PM</option>
                  <option value="0 18 * * *">Daily at 6:00 PM</option>
                  <option value="0 */3 * * *">Every 3 hours</option>
                  <option value="0 */6 * * *">Every 6 hours</option>
                  <option value="0 */12 * * *">Every 12 hours</option>
                  <option value="0 9 * * 1-5">Monday-Friday at 9:00 AM</option>
                  <option value="0 9 * * 1,3,5">Mon, Wed, Fri at 9:00 AM</option>
                  <option value="0 9 * * 0">Sunday at 9:00 AM</option>
                  <option value="0 9 1 * *">First day of month at 9:00 AM</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select when the automated task should run
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newTask.is_active}
                  onChange={(e) => setNewTask({ ...newTask, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Activate task immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
