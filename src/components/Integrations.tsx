import { useState } from 'react';
import { Twitter, Linkedin, Facebook, Instagram, Link2, Zap } from 'lucide-react';
import { WordPressIntegration } from './WordPressIntegration';
import { RedditIntegration } from './RedditIntegration';
import { DiscordIntegration } from './DiscordIntegration';

export function Integrations() {
  const [connectedPlatforms] = useState<string[]>(['twitter', 'facebook', 'wordpress', 'reddit', 'discord']);

  const socialPlatforms = [
    {
      id: 'twitter',
      name: 'Twitter / X',
      icon: Twitter,
      color: 'bg-slate-50 text-slate-900',
      description: 'Publish tweets and build your presence on X',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-50 text-blue-700',
      description: 'Share professional content on LinkedIn',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-50 text-blue-800',
      description: 'Manage posts on Facebook',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-pink-50 text-pink-600',
      description: 'Publish posts on Instagram',
    },
  ];

  const handleConnect = (platformId: string) => {
    alert(`Integration configuration with ${platformId} - coming soon!`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Integrations</h2>
            <p className="text-gray-600 mt-1">Connect your platforms and automate content</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Content Marketing Platforms</h3>
          <div className="grid lg:grid-cols-2 gap-6">
            <WordPressIntegration />
            <RedditIntegration />
          </div>
          <div className="mt-6">
            <DiscordIntegration />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Social Media</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const isConnected = connectedPlatforms.includes(platform.id);

              return (
                <div
                  key={platform.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${platform.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{platform.name}</h3>
                        {isConnected && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Connected
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{platform.description}</p>

                      <button
                        onClick={() => handleConnect(platform.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isConnected
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <Link2 className="w-4 h-4" />
                        <span>{isConnected ? 'Manage' : 'Connect Account'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Why connect platforms?
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Time Savings</h4>
            <p className="text-sm text-gray-600">Publish to multiple platforms simultaneously</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Centralized Management</h4>
            <p className="text-sm text-gray-600">Manage content from one place</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Consistent Presence</h4>
            <p className="text-sm text-gray-600">Maintain engagement across all platforms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
