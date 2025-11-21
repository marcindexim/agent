export const mockDataSources = [
  {
    id: 'mock-1',
    name: 'TechCrunch RSS',
    type: 'rss' as const,
    url: 'https://techcrunch.com/feed/',
    is_active: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-2',
    name: 'Product Hunt API',
    type: 'api' as const,
    url: 'https://api.producthunt.com/v2/api/graphql',
    is_active: true,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-3',
    name: 'Marketing Blog',
    type: 'website' as const,
    url: 'https://example.com/blog',
    is_active: true,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockTemplates = [];

export const mockPosts = [
  {
    id: 'mock-p1',
    content: '📢 Introducing AI-Powered Content Automation\n\nTransform your content strategy with intelligent automation that saves time and boosts engagement.\n\n🔗 Read more: https://example.com/blog/ai-automation\n\n#tech #innovation #startup',
    platform: 'twitter' as const,
    status: 'published' as const,
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    template_id: 'mock-t1',
    scheduled_for: null,
  },
  {
    id: 'mock-p2',
    content: 'The Future of Marketing Automation\n\nDiscover how AI is revolutionizing content creation and distribution across multiple platforms simultaneously.\n\nLearn more at: https://example.com/marketing-guide\n\n#business #technology #productivity',
    platform: 'linkedin' as const,
    status: 'published' as const,
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    template_id: 'mock-t2',
    scheduled_for: null,
  },
  {
    id: 'mock-p3',
    content: '✨ 5 Ways to Boost Your Social Media Presence ✨\n\nLearn proven strategies to increase engagement and grow your audience organically.\n\n👉 https://example.com/social-tips\n\n#social #community',
    platform: 'facebook' as const,
    status: 'scheduled' as const,
    published_at: null,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    template_id: 'mock-t3',
    scheduled_for: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-p4',
    content: '📢 New Feature Alert!\n\nWe just launched multi-platform scheduling. Now you can plan your entire week in minutes.\n\n🔗 Read more: https://example.com/new-features\n\n#tech #innovation #startup',
    platform: 'twitter' as const,
    status: 'scheduled' as const,
    published_at: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    template_id: 'mock-t1',
    scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-p5',
    content: 'Content Marketing Best Practices for 2024\n\nStay ahead of the curve with these essential strategies for modern content creators.\n\nLearn more at: https://example.com/2024-guide\n\n#business #technology #productivity',
    platform: 'linkedin' as const,
    status: 'draft' as const,
    published_at: null,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    template_id: 'mock-t2',
    scheduled_for: null,
  },
];

export const mockStats = {
  totalPosts: 12,
  scheduledPosts: 3,
  publishedToday: 2,
  templates: 5,
};

export const mockRedditConnection = {
  client_id: 'demo_client_id',
  client_secret: 'demo_client_secret',
  username: 'demo_user',
  password: 'demo_password',
  user_agent: 'DemoApp/1.0',
};

export const mockDiscordWebhooks = [
  {
    id: 'mock-discord-1',
    name: 'Marketing Channel',
    webhook_url: 'https://discord.com/api/webhooks/demo/webhook1',
    connected: true,
  },
  {
    id: 'mock-discord-2',
    name: 'Community Updates',
    webhook_url: 'https://discord.com/api/webhooks/demo/webhook2',
    connected: true,
  },
];

export const mockTwitterConnection = {
  access_token: 'demo_twitter_token',
  access_token_secret: 'demo_twitter_secret',
  username: '@demo_user',
};

export const mockFacebookConnection = {
  page_id: 'demo_page_123',
  access_token: 'demo_fb_token',
  page_name: 'Demo Business Page',
};

export const mockWordPressConnection = {
  id: 'mock-wp-1',
  domain: 'https://demo-blog.com',
  username: 'demo_admin',
  application_password: 'demo_app_password',
  site_name: 'Demo Tech Blog',
  connected: true,
};

export const mockRSSFeeds = [
  {
    id: 1,
    title: 'Breaking: AI Startup Raises $50M in Series B',
    description: 'A leading artificial intelligence company announced today a successful $50 million Series B funding round, led by top venture capital firms. The funds will be used to expand their AI-powered content automation platform.',
    link: 'https://techcrunch.com/ai-startup-funding',
    pubDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
    source: 'TechCrunch'
  },
  {
    id: 2,
    title: 'The Rise of Remote Work: 2024 Statistics',
    description: 'New research shows that 70% of companies now offer remote work options. This comprehensive study explores the impact on productivity, employee satisfaction, and company culture in the modern workplace.',
    link: 'https://techcrunch.com/remote-work-stats',
    pubDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.pexels.com/photos/4226122/pexels-photo-4226122.jpeg?auto=compress&cs=tinysrgb&w=800',
    source: 'TechCrunch'
  },
  {
    id: 3,
    title: 'Top 10 Marketing Tools for Small Businesses',
    description: 'Discover the essential marketing automation tools that can help small businesses compete with larger enterprises. From email marketing to social media management, we cover the best options available.',
    link: 'https://techcrunch.com/marketing-tools',
    pubDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=800',
    source: 'TechCrunch'
  },
  {
    id: 4,
    title: 'Cybersecurity Trends to Watch in 2024',
    description: 'As cyber threats evolve, businesses must stay ahead of the curve. Learn about the latest cybersecurity trends, from zero-trust architecture to AI-powered threat detection systems.',
    link: 'https://techcrunch.com/cybersecurity-trends',
    pubDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
    source: 'TechCrunch'
  }
];

export const mockAPIContent = [
  {
    id: 1,
    title: 'Product Hunt Top Launch: AI Writing Assistant',
    description: '🚀 Trending #1 on Product Hunt today! An innovative AI writing assistant that helps creators generate engaging content in seconds. With over 1,000 upvotes and counting, this tool is revolutionizing content creation.',
    link: 'https://producthunt.com/posts/ai-writing-assistant',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg?auto=compress&cs=tinysrgb&w=800',
    source: 'Product Hunt API'
  },
  {
    id: 2,
    title: 'New SaaS Tool: Team Collaboration Platform',
    description: 'Introducing a powerful new team collaboration platform that integrates with all your favorite tools. Features include real-time collaboration, project management, and advanced analytics.',
    link: 'https://producthunt.com/posts/team-collab',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    source: 'Product Hunt API'
  },
  {
    id: 3,
    title: 'Developer Tool of the Week: Code Optimizer',
    description: 'This week\'s featured developer tool automatically optimizes your code for better performance. Supports multiple languages and integrates seamlessly with popular IDEs.',
    link: 'https://producthunt.com/posts/code-optimizer',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800',
    source: 'Product Hunt API'
  }
];

export const mockWordPressPosts = [
  {
    id: 1,
    title: { rendered: 'Getting Started with AI Content Automation' },
    excerpt: { rendered: '<p>Discover how artificial intelligence is revolutionizing content creation and distribution. Learn the best practices for implementing AI-powered workflows in your marketing strategy.</p>' },
    link: 'https://demo-blog.com/getting-started-with-ai',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    featured_media: 101,
    featured_image_url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
        alt_text: 'AI Technology'
      }]
    }
  },
  {
    id: 2,
    title: { rendered: '10 Social Media Strategies for 2024' },
    excerpt: { rendered: '<p>Stay ahead of the curve with these proven social media strategies. From content planning to engagement optimization, learn what works in today\'s digital landscape.</p>' },
    link: 'https://demo-blog.com/social-media-strategies-2024',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    featured_media: 102,
    featured_image_url: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800',
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800',
        alt_text: 'Social Media'
      }]
    }
  },
  {
    id: 3,
    title: { rendered: 'The Future of Content Marketing' },
    excerpt: { rendered: '<p>Explore emerging trends in content marketing and how to prepare your strategy for the future. From video content to interactive experiences, discover what\'s next.</p>' },
    link: 'https://demo-blog.com/future-of-content-marketing',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    featured_media: 103,
    featured_image_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
        alt_text: 'Marketing Strategy'
      }]
    }
  },
  {
    id: 4,
    title: { rendered: 'How to Automate Your Content Workflow' },
    excerpt: { rendered: '<p>Streamline your content creation process with automation tools. Learn how to save time while maintaining quality and consistency across all your channels.</p>' },
    link: 'https://demo-blog.com/automate-content-workflow',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    featured_media: 104,
    featured_image_url: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
        alt_text: 'Workflow Automation'
      }]
    }
  },
  {
    id: 5,
    title: { rendered: 'Building Your Brand on Multiple Platforms' },
    excerpt: { rendered: '<p>Learn the art of cross-platform brand building. Discover how to maintain consistency while adapting your message for different social media channels.</p>' },
    link: 'https://demo-blog.com/building-brand-multiple-platforms',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    featured_media: 105,
    featured_image_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
        alt_text: 'Brand Building'
      }]
    }
  },
  {
    id: 6,
    title: { rendered: 'Content Analytics: Measuring What Matters' },
    excerpt: { rendered: '<p>Understanding your content performance is crucial for growth. Learn which metrics to track and how to use data to improve your content strategy.</p>' },
    link: 'https://demo-blog.com/content-analytics-guide',
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    featured_media: 106,
    featured_image_url: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
        alt_text: 'Analytics Dashboard'
      }]
    }
  }
];
