import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Database, FileText, Wand2, Calendar, History, Link2, Globe, Send, HelpCircle } from 'lucide-react';
import { HowItWorks } from './HowItWorks';
import { Overview } from './Overview';
import { DataSources } from './DataSources';
import { Templates } from './Templates';
import { PostGenerator } from './PostGenerator';
import { Schedule } from './Schedule';
import { PostHistory } from './PostHistory';
import { Integrations } from './Integrations';
import { WordPress } from './WordPress';
import { SocialPublisher } from './SocialPublisher';

type View = 'overview' | 'sources' | 'templates' | 'generator' | 'schedule' | 'history' | 'integrations' | 'wordpress' | 'social' | 'how-it-works';

export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('overview');
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 'overview' as View, label: 'Overview', icon: Home },
    { id: 'wordpress' as View, label: 'WordPress', icon: Globe },
    { id: 'social' as View, label: 'Social Media', icon: Send },
    { id: 'sources' as View, label: 'Data Sources', icon: Database },
    { id: 'templates' as View, label: 'Templates', icon: FileText },
    { id: 'generator' as View, label: 'Generator', icon: Wand2 },
    { id: 'schedule' as View, label: 'Schedule', icon: Calendar },
    { id: 'history' as View, label: 'History', icon: History },
    { id: 'integrations' as View, label: 'Integrations', icon: Link2 },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <Overview />;
      case 'wordpress':
        return <WordPress />;
      case 'social':
        return <SocialPublisher />;
      case 'sources':
        return <DataSources />;
      case 'templates':
        return <Templates />;
      case 'generator':
        return <PostGenerator />;
      case 'schedule':
        return <Schedule />;
      case 'history':
        return <PostHistory />;
      case 'integrations':
        return <Integrations />;
      case 'how-it-works':
        return <HowItWorks />;
      default:
        return <Overview />;
    }
  };

  if (currentView === 'how-it-works') {
    return <HowItWorks onSignOut={signOut} isAuthenticated={true} />;
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'radial-gradient(179.97% 125.88% at 88.96% 4.58%, #F2EDE5 0%, #E8F0F7 53.37%, #F2EDE5 100%)' }}>
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Content AI</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="relative">
          {currentView === 'overview' && (
            <button
              onClick={() => setCurrentView('how-it-works')}
              className="fixed top-6 right-6 z-10 flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-md border border-gray-200"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How It Works</span>
            </button>
          )}
          {renderView()}
        </div>
      </main>
    </div>
  );
}
