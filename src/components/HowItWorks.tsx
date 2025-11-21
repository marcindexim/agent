import { useState, useEffect } from 'react';
import {
  Sparkles, Database, FileText, Wand2, Calendar, Send,
  Globe, MessageCircle, Twitter, Linkedin, Facebook, Instagram,
  Zap, Clock, BarChart3, Shield, Users, Briefcase, PenTool,
  Store, Building, ChevronDown, ChevronUp, ArrowRight, CheckCircle, LogOut, Mail, Eye, UserPlus
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HowItWorksProps {
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
  onSignOut?: () => void;
  isAuthenticated?: boolean;
}

export function HowItWorks({ onNavigateToLogin, onNavigateToRegister, onSignOut, isAuthenticated }: HowItWorksProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [animationStep, setAnimationStep] = useState(0);
  const [onlineCount, setOnlineCount] = useState(12);
  const [recentSignup, setRecentSignup] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  const generateRandomEmail = () => {
    const names = ['john', 'sarah', 'mike', 'emma', 'alex', 'lisa', 'david', 'maria', 'james', 'anna', 'robert', 'kate', 'peter', 'julia', 'tom', 'olivia'];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const name = names[Math.floor(Math.random() * names.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}***@${domain}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onlineInterval = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * 23) + 8);
    }, 120000);
    return () => clearInterval(onlineInterval);
  }, []);

  useEffect(() => {
    const intervals = [30000, 50000];
    let currentIndex = 0;

    const scheduleNext = () => {
      const delay = intervals[currentIndex];
      currentIndex = (currentIndex + 1) % intervals.length;

      return setTimeout(() => {
        setRecentSignup(generateRandomEmail());
        setShowSignup(true);
        setTimeout(() => setShowSignup(false), 3000);
        timeoutId = scheduleNext();
      }, delay);
    };

    let timeoutId = scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('email_leads')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          setErrorMessage('This email is already registered for a trial.');
        } else {
          setErrorMessage('Something went wrong. Please try again.');
        }
        setSubmitStatus('error');
      } else {
        setSubmitStatus('success');
        setEmail('');
      }
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Create engaging content automatically using advanced AI technology',
      color: 'bg-blue-50 text-[#2C4FDC]',
    },
    {
      icon: Send,
      title: 'Multi-Platform Publishing',
      description: 'Distribute content across WordPress, Reddit, Discord, and social media',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: Clock,
      title: 'Automated Scheduling',
      description: 'Plan and schedule posts in advance with intelligent timing',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: BarChart3,
      title: 'Centralized Management',
      description: 'Control all your content from one powerful dashboard',
      color: 'bg-cyan-50 text-cyan-600',
    },
  ];

  const steps = [
    {
      number: 1,
      icon: Database,
      title: 'Connect Your Data Sources',
      description: 'Add RSS feeds, websites, or API endpoints as content sources to fuel your content creation.',
      details: 'Support for RSS feeds, web scraping, and custom API integrations',
    },
    {
      number: 2,
      icon: FileText,
      title: 'Create Templates',
      description: 'Design customized post templates for different platforms with variables and formatting.',
      details: 'Use {title}, {content}, and {url} variables with custom hashtags',
    },
    {
      number: 3,
      icon: Wand2,
      title: 'Generate with AI',
      description: 'Automatically generate engaging, platform-optimized content using AI technology.',
      details: 'Context-aware content generation tailored to each platform',
    },
    {
      number: 4,
      icon: Calendar,
      title: 'Publish & Schedule',
      description: 'Publish immediately or schedule across multiple platforms with smart timing.',
      details: 'Calendar-based scheduling with timezone support',
    },
  ];

  const platforms = [
    {
      icon: Globe,
      name: 'WordPress',
      description: 'Blog articles and posts',
      color: 'bg-slate-50 text-slate-700',
    },
    {
      icon: MessageCircle,
      name: 'Reddit',
      description: 'Subreddit posts',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: MessageCircle,
      name: 'Discord',
      description: 'Channel messages',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      icon: Twitter,
      name: 'Twitter / X',
      description: 'Tweets and threads',
      color: 'bg-slate-50 text-slate-900',
    },
    {
      icon: Linkedin,
      name: 'LinkedIn',
      description: 'Professional posts',
      color: 'bg-blue-50 text-[#2C4FDC]',
    },
    {
      icon: Facebook,
      name: 'Facebook',
      description: 'Social updates',
      color: 'bg-blue-50 text-[#2C4FDC]',
    },
    {
      icon: Instagram,
      name: 'Instagram',
      description: 'Visual content',
      color: 'bg-pink-50 text-pink-600',
    },
    {
      icon: UserPlus,
      name: 'Register',
      description: 'Get started today',
      color: 'bg-green-50 text-green-600',
      isRegister: true,
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI Content Generator',
      description: 'Smart content creation with context awareness and platform optimization',
    },
    {
      icon: FileText,
      title: 'Template System',
      description: 'Reusable formats with variable substitution and custom styling',
    },
    {
      icon: Zap,
      title: 'One-Click Distribution',
      description: 'Publish to multiple platforms simultaneously with a single click',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Calendar-based planning with timezone support and optimal timing',
    },
    {
      icon: BarChart3,
      title: 'Content History',
      description: 'Track all published content with detailed history and analytics',
    },
    {
      icon: Shield,
      title: 'Secure Integrations',
      description: 'Connect all your platforms with enterprise-grade security',
    },
  ];

  const useCases = [
    {
      icon: Users,
      title: 'Content Marketers',
      description: 'Streamline content distribution across multiple channels',
    },
    {
      icon: Send,
      title: 'Social Media Managers',
      description: 'Manage multiple accounts efficiently from one dashboard',
    },
    {
      icon: PenTool,
      title: 'Bloggers & Creators',
      description: 'Amplify your content reach without extra effort',
    },
    {
      icon: Store,
      title: 'Small Businesses',
      description: 'Professional content marketing without a full team',
    },
    {
      icon: Building,
      title: 'Marketing Agencies',
      description: 'Scale client content operations with automation',
    },
    {
      icon: Briefcase,
      title: 'Entrepreneurs',
      description: 'Maintain consistent online presence while focusing on growth',
    },
  ];

  const faqs = [
    {
      question: 'What is Content AI?',
      answer: 'Content AI is an intelligent platform that automates content creation and multi-platform publishing. It uses AI to generate engaging posts based on your templates and data sources, then distributes them across WordPress, Reddit, Discord, and social media platforms.',
    },
    {
      question: 'How does the AI content generation work?',
      answer: 'Our AI analyzes your content templates, data sources, and platform requirements to generate contextually relevant, engaging posts. You provide the template with variables like {title}, {content}, and {url}, and the AI fills them with appropriate content optimized for each platform.',
    },
    {
      question: 'Which platforms can I publish to?',
      answer: 'You can publish to WordPress blogs, Reddit communities, Discord channels, Twitter/X, LinkedIn, Facebook, and Instagram. Each platform integration is designed to respect the unique format and best practices of that platform.',
    },
    {
      question: 'Can I customize the content templates?',
      answer: 'Yes! You have full control over your templates. Create custom templates for each platform with your own formatting, tone, and style. Use variables to dynamically insert content, and add platform-specific elements like hashtags.',
    },
    {
      question: 'Is there a limit on how many posts I can create?',
      answer: 'No artificial limits on post creation. You can generate and schedule as many posts as you need to maintain your content marketing strategy. Our system is designed to scale with your needs.',
    },
    {
      question: 'How does scheduling work?',
      answer: 'Use our intuitive calendar interface to schedule posts in advance. Set specific dates and times, and our system will automatically publish your content at the right moment. You can schedule posts days, weeks, or months in advance.',
    },
    {
      question: 'Can I edit content before publishing?',
      answer: 'Absolutely! All generated content can be reviewed and edited before publishing. Save posts as drafts, make changes, and only publish when you\'re completely satisfied with the content.',
    },
    {
      question: 'Do I need separate accounts for each platform?',
      answer: 'Yes, you\'ll need to connect your existing accounts for each platform you want to publish to. Content AI integrates with your accounts securely to enable publishing on your behalf.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Security is our top priority. All data is encrypted, and we use enterprise-grade security practices. Your API keys and credentials are stored securely, and we never share your content or data with third parties.',
    },
    {
      question: 'What if I need help getting started?',
      answer: 'We provide comprehensive guides and examples within the platform. Once you sign up, you\'ll find a Quick Start guide in the Overview section that walks you through each step of the setup process.',
    },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: 'radial-gradient(179.97% 125.88% at 88.96% 4.58%, #F2EDE5 0%, #E8F0F7 53.37%, #F2EDE5 100%)' }}>
      <div className="fixed right-4 bottom-4 z-50">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-900">Live Activity</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Eye className="w-4 h-4" />
            <span className="text-lg font-bold">{onlineCount}</span>
            <span className="text-sm">users online</span>
          </div>
        </div>
      </div>

      {showSignup && recentSignup && (
        <div className="fixed left-4 bottom-4 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-xl border border-green-200 p-4 min-w-[250px]">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-green-900 mb-1">New signup!</p>
                <p className="text-xs text-green-700 break-all">{recentSignup}</p>
                <p className="text-xs text-green-600 mt-1">just started trial</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-[#2C4FDC]" />
            <h1 className="text-2xl font-bold text-gray-800">Content AI</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              onSignOut && (
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )
            ) : (
              <>
                {onNavigateToLogin && (
                  <button
                    onClick={onNavigateToLogin}
                    className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Sign In
                  </button>
                )}
                {onNavigateToRegister && (
                  <button
                    onClick={onNavigateToRegister}
                    className="bg-[#2C4FDC] text-white px-6 py-2 rounded-lg hover:bg-[#2440B8] transition-colors font-medium"
                  >
                    Get Started Free
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -left-32 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -right-32 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2C4FDC] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Intelligent Content Automation</span>
            </div>

            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Publish to every platform<br />in 30 seconds
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Stop wasting time on manual posting. Generate and publish to LinkedIn, X, Facebook, Discord, Reddit and WordPress instantly.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Start Your Free 10-Day Trial
                </h3>
                <p className="text-gray-600">
                  Get instant access to all features
                </p>
              </div>

              {submitStatus === 'success' ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Welcome to Content AI!
                  </h4>
                  <p className="text-gray-600 mb-6 text-sm">
                    Check your email for instructions to activate your trial.
                  </p>
                  {onNavigateToRegister && (
                    <button
                      onClick={onNavigateToRegister}
                      className="inline-flex items-center gap-2 bg-[#2C4FDC] text-white px-6 py-3 rounded-lg hover:bg-[#2440B8] transition-colors font-medium w-full justify-center"
                    >
                      Complete Registration
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit}>
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C4FDC] focus:border-transparent outline-none"
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#2C4FDC] text-white px-6 py-3 rounded-lg hover:bg-[#2440B8] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Starting Trial...' : 'See How It Works'}
                    </button>
                  </div>
                  {submitStatus === 'error' && (
                    <p className="text-red-600 text-sm mt-3 text-center">{errorMessage}</p>
                  )}
                </form>
              )}

              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span>10 days free</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <img 
              src="https://tw0qfum1oukimcpx.public.blob.vercel-storage.com/dashb1.png" 
              alt="Content AI Dashboard" 
              className="max-w-full h-auto rounded-xl"
            />
          </div>

        </div>
      </section>


      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              What is Content AI?
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              An intelligent platform that automates content creation and multi-platform publishing,
              helping you maintain a consistent online presence without the manual effort
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                  <div className={`w-12 h-12 ${benefit.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Simple 4-Step Process
            </h3>
            <p className="text-lg text-gray-600">
              Get started in minutes with our intuitive workflow
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              return (
                <div key={step.number}>
                  <div className="flex items-start gap-6">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-16 h-16 bg-[#2C4FDC] text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg">
                        {step.number}
                      </div>
                      {!isLast && (
                        <div className="w-1 h-16 bg-blue-200 mt-4"></div>
                      )}
                    </div>

                    <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-[#2C4FDC] rounded-lg">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h4>
                          <p className="text-gray-600 mb-3">{step.description}</p>
                          <p className="text-sm text-gray-500 italic">{step.details}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Publish Everywhere
            </h3>
            <p className="text-lg text-gray-600">
              Distribute your content across all major platforms from one dashboard
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const handleClick = platform.isRegister 
                ? () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                : undefined;
              
              return (
                <div 
                  key={platform.name} 
                  onClick={handleClick}
                  className={`bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all text-center ${platform.isRegister ? 'cursor-pointer' : ''}`}
                >
                  <div className={`w-16 h-16 ${platform.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{platform.name}</h4>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h3>
            <p className="text-lg text-gray-600">
              Everything you need for professional content management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 text-[#2C4FDC] rounded-lg flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Perfect For
            </h3>
            <p className="text-lg text-gray-600">
              Trusted by professionals across industries
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <div key={useCase.title} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-[#2C4FDC] text-white rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h4>
                  <p className="text-gray-600 text-sm">{useCase.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-lg text-gray-600">
              Everything you need to know about Content AI
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied content creators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform">
              <div className="w-20 h-20 rounded-full bg-pink-300 flex items-center justify-center mb-4 border-4 border-white shadow-md">
                <Users className="w-10 h-10 text-pink-600" />
              </div>
              <p className="text-gray-800 mb-3 font-medium">
                "This app saves me 10+ hours weekly. Posting to all platforms is now effortless!"
              </p>
              <p className="text-sm text-gray-600 font-semibold">- Sarah M.</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform lg:mt-12">
              <div className="w-20 h-20 rounded-full bg-yellow-300 flex items-center justify-center mb-4 border-4 border-white shadow-md">
                <Users className="w-10 h-10 text-yellow-600" />
              </div>
              <p className="text-gray-800 mb-3 font-medium">
                "Content AI transformed my workflow. I can focus on creating, not posting!"
              </p>
              <p className="text-sm text-gray-600 font-semibold">- Mike T.</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform">
              <div className="w-20 h-20 rounded-full bg-blue-300 flex items-center justify-center mb-4 border-4 border-white shadow-md">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-gray-800 mb-3 font-medium">
                "Best investment for my content strategy. Engagement up 300%!"
              </p>
              <p className="text-sm text-gray-600 font-semibold">- Emma K.</p>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform lg:mt-12">
              <div className="w-20 h-20 rounded-full bg-orange-300 flex items-center justify-center mb-4 border-4 border-white shadow-md">
                <Users className="w-10 h-10 text-orange-600" />
              </div>
              <p className="text-gray-800 mb-3 font-medium">
                "Game changer! My productivity skyrocketed. Highly recommend to everyone!"
              </p>
              <p className="text-sm text-gray-600 font-semibold">- Alex R.</p>
            </div>

            {/* Testimonial 5 */}
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform lg:mt-6">
              <div className="w-20 h-20 rounded-full bg-pink-300 flex items-center justify-center mb-4 border-4 border-white shadow-md">
                <Users className="w-10 h-10 text-pink-600" />
              </div>
              <p className="text-gray-800 mb-3 font-medium">
                "Finally, a tool that actually delivers. My reach doubled in just weeks!"
              </p>
              <p className="text-sm text-gray-600 font-semibold">- Lisa W.</p>
            </div>

            {/* Testimonial 6 */}
            <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform lg:mt-20">
              <div className="w-20 h-20 rounded-full bg-teal-300 flex items-center justify-center mb-4 border-4 border-white shadow-md">
                <Users className="w-10 h-10 text-teal-600" />
              </div>
              <p className="text-gray-800 mb-3 font-medium">
                "Simple, powerful, effective. Content AI is everything I needed and more!"
              </p>
              <p className="text-sm text-gray-600 font-semibold">- David P.</p>
            </div>

            {/* Testimonial 7 */}
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform lg:mt-6">
              <div className="w-20 h-20 rounded-full bg-orange-300 flex items-center justify-center mb-4 border-4 border-white shadow-md">
                <Users className="w-10 h-10 text-orange-600" />
              </div>
              <p className="text-gray-800 mb-3 font-medium">
                "Incredible ROI! This app paid for itself in the first week of use!"
              </p>
              <p className="text-sm text-gray-600 font-semibold">- Jessica L.</p>
            </div>

            {/* Testimonial 8 */}
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform lg:mt-16">
              <div className="w-20 h-20 rounded-full bg-yellow-300 flex items-center justify-center mb-4 border-4 border-white shadow-md">
                <Users className="w-10 h-10 text-yellow-600" />
              </div>
              <p className="text-gray-800 mb-3 font-medium">
                "A must-have tool! Makes content distribution seamless and stress-free."
              </p>
              <p className="text-sm text-gray-600 font-semibold">- Tom H.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
          <div className="absolute top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/3 w-[550px] h-[550px] bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Automate Your Content?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Stop spending hours on manual posting. Let Content AI handle the distribution while you focus on creating amazing content.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl font-bold text-white mb-2">7</div>
              <div className="text-gray-200 font-medium">Platforms</div>
              <div className="text-sm text-gray-400 mt-2">One click to publish everywhere</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl font-bold text-white mb-2">10hrs</div>
              <div className="text-gray-200 font-medium">Saved Weekly</div>
              <div className="text-sm text-gray-400 mt-2">Average time saved per user</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl font-bold text-white mb-2">3x</div>
              <div className="text-gray-200 font-medium">More Content</div>
              <div className="text-sm text-gray-400 mt-2">Publish more in less time</div>
            </div>
          </div>
          
          <div className="bg-white/1 rounded-3xl p-8 md:p-12 overflow-y-auto shadow-2xl max-w-2xl mx-auto border border-gray-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Zap className="w-4 h-4" />
                <span>Limited Time Offer</span>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-3xl font-bold line-through text-gray-200">$29/mo</span>
                  <span className="text-7xl font-bold text-green-600">$0</span>
                </div>
                <p className="text-gray-100 text-lg font-medium">Free for 10 days, then $9/month</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-100">Full Access to All Features</p>
                  <p className="text-sm text-gray-300">AI generation, scheduling, analytics, and more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-100">Unlimited Posts & Platforms</p>
                  <p className="text-sm text-gray-300">No restrictions on content or distribution</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-100">Priority Support</p>
                  <p className="text-sm text-gray-300">Get help when you need it</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-100">No Credit Card Required</p>
                  <p className="text-sm text-gray-300">Start free, upgrade when ready</p>
                </div>
              </div>
            </div>

            {onNavigateToRegister && (
              <button
                onClick={onNavigateToRegister}
                className="w-full bg-[#2C4FDC] text-white px-8 py-4 rounded-xl hover:bg-[#2440B8] transition-all text-lg font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                Start Free 10-Day Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-green-600" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-400 mt-8 text-sm">
            Join 1,000+ content creators already saving time with Content AI
          </p>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-[#2C4FDC]" />
            <span className="text-lg font-bold text-gray-800">Content AI</span>
          </div>
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Content AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
