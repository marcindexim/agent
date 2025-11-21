/*
  # Add Scheduled Tasks for Automated Post Publishing

  1. New Tables
    - `scheduled_tasks`
      - `id` (uuid, primary key) - Unique identifier for the task
      - `user_id` (uuid, foreign key) - References auth.users
      - `task_name` (text) - Name of the scheduled task (e.g., "Daily Posts")
      - `source_type` (text) - Type of content source: 'manual', 'rss', 'api', 'wordpress'
      - `source_id` (text, nullable) - ID of the specific source item if applicable
      - `template_id` (uuid, foreign key) - References templates table
      - `cron_schedule` (text) - Cron expression for scheduling (e.g., "0 9 * * *")
      - `is_active` (boolean, default: true) - Whether the task is currently active
      - `last_run_at` (timestamptz, nullable) - When the task was last executed
      - `next_run_at` (timestamptz, nullable) - When the task will run next
      - `created_at` (timestamptz) - When the task was created
      - `updated_at` (timestamptz) - When the task was last updated

  2. Security
    - Enable RLS on `scheduled_tasks` table
    - Add policies for authenticated users to manage their own scheduled tasks

  3. Indexes
    - Add index on `user_id` for faster queries
    - Add index on `is_active` and `next_run_at` for task execution queries
*/

CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('manual', 'rss', 'api', 'wordpress')),
  source_id text,
  template_id uuid NOT NULL,
  cron_schedule text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_user_id ON scheduled_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_active_next_run ON scheduled_tasks(is_active, next_run_at) WHERE is_active = true;

ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled tasks"
  ON scheduled_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scheduled tasks"
  ON scheduled_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled tasks"
  ON scheduled_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled tasks"
  ON scheduled_tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);