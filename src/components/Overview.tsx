import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Calendar, CheckCircle, TrendingUp } from 'lucide-react';
import { mockStats } from '../lib/mockData';

export function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    publishedToday: 0,
    templates: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [postsResult, scheduledResult, publishedResult, templatesResult] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('posts').select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'scheduled'),
        supabase.from('posts').select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'published')
          .gte('published_at', today.toISOString()),
        supabase.from('templates').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      const hasData = (postsResult.count || 0) > 0 || (templatesResult.count || 0) > 0;

      setStats({
        totalPosts: hasData ? (postsResult.count || 0) : mockStats.totalPosts,
        scheduledPosts: hasData ? (scheduledResult.count || 0) : mockStats.scheduledPosts,
        publishedToday: hasData ? (publishedResult.count || 0) : mockStats.publishedToday,
        templates: hasData ? (templatesResult.count || 0) : mockStats.templates,
      });
    };

    fetchStats();
  }, [user]);

  const statCards = [
    {
      label: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      color: 'blue',
    },
    {
      label: 'Scheduled',
      value: stats.scheduledPosts,
      icon: Calendar,
      color: 'orange',
    },
    {
      label: 'Published Today',
      value: stats.publishedToday,
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Templates',
      value: stats.templates,
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Overview</h2>
        <p className="text-gray-600 mt-2">Welcome back! Here's a summary of your activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Start</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Add Data Sources</h4>
              <p className="text-sm text-gray-600 mt-1">Configure RSS feeds, websites, or APIs as content sources</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Create Templates</h4>
              <p className="text-sm text-gray-600 mt-1">Define post styles for different platforms</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Generate Posts with AI</h4>
              <p className="text-sm text-gray-600 mt-1">Use the generator to create content automatically</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
              4
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Schedule Publication</h4>
              <p className="text-sm text-gray-600 mt-1">Set publication schedule across different platforms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
