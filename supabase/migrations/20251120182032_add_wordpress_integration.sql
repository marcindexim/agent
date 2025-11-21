/*
  # WordPress Integration Schema

  1. New Tables
    - `wordpress_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `domain` (text) - WordPress site domain
      - `username` (text) - WordPress username
      - `application_password` (text) - WordPress application password (encrypted)
      - `connected` (boolean) - Connection status
      - `site_name` (text) - WordPress site name
      - `site_description` (text) - WordPress site description
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `wordpress_connections` table
    - Add policies for authenticated users to manage their own connections

  3. Notes
    - Application password is stored for API authentication
    - Users can only access their own WordPress connections
    - Connection data includes site metadata for display
*/

CREATE TABLE IF NOT EXISTS wordpress_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  username text NOT NULL,
  application_password text NOT NULL,
  connected boolean DEFAULT true,
  site_name text,
  site_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, domain)
);

ALTER TABLE wordpress_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own WordPress connections"
  ON wordpress_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own WordPress connections"
  ON wordpress_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own WordPress connections"
  ON wordpress_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own WordPress connections"
  ON wordpress_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_wordpress_connections_updated_at'
  ) THEN
    CREATE TRIGGER update_wordpress_connections_updated_at
      BEFORE UPDATE ON wordpress_connections
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;