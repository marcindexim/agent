/*
  # Reddit and Discord Integration Schema

  1. New Tables
    - `reddit_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `client_id` (text) - Reddit app client ID
      - `client_secret` (text) - Reddit app client secret
      - `username` (text) - Reddit username
      - `password` (text) - Reddit password
      - `user_agent` (text) - User agent for API requests
      - `connected` (boolean) - Connection status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `discord_webhooks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - Webhook name/description
      - `webhook_url` (text) - Discord webhook URL
      - `connected` (boolean) - Webhook status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own connections

  3. Notes
    - Reddit API credentials are stored for OAuth authentication
    - Discord webhooks are stored as full URLs
    - Users can have one Reddit connection but multiple Discord webhooks
*/

-- Reddit Connections Table
CREATE TABLE IF NOT EXISTS reddit_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id text NOT NULL,
  client_secret text NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  user_agent text NOT NULL DEFAULT 'ContentAI/1.0',
  connected boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE reddit_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own Reddit connections"
  ON reddit_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Reddit connections"
  ON reddit_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Reddit connections"
  ON reddit_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own Reddit connections"
  ON reddit_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Discord Webhooks Table
CREATE TABLE IF NOT EXISTS discord_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  webhook_url text NOT NULL,
  connected boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE discord_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own Discord webhooks"
  ON discord_webhooks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Discord webhooks"
  ON discord_webhooks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Discord webhooks"
  ON discord_webhooks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own Discord webhooks"
  ON discord_webhooks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_reddit_connections_updated_at'
  ) THEN
    CREATE TRIGGER update_reddit_connections_updated_at
      BEFORE UPDATE ON reddit_connections
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_discord_webhooks_updated_at'
  ) THEN
    CREATE TRIGGER update_discord_webhooks_updated_at
      BEFORE UPDATE ON discord_webhooks
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;