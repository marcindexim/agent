export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface DataSource {
  id: string;
  user_id: string;
  name: string;
  type: 'rss' | 'website' | 'api' | 'manual';
  url?: string;
  config?: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  content_template: string;
  hashtags?: string[];
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  template_id?: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_for?: string;
  published_at?: string;
  created_at: string;
}

export interface Integration {
  id: string;
  user_id: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  access_token: string;
  is_active: boolean;
  created_at: string;
}
