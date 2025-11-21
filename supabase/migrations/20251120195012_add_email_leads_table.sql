/*
  # Create Email Leads Table
  
  1. New Tables
    - `email_leads`
      - `id` (uuid, primary key) - Unique identifier for each lead
      - `email` (text, unique, not null) - Email address of the lead
      - `subscribed_at` (timestamptz) - Timestamp when user subscribed
      - `trial_ends_at` (timestamptz) - When the 10-day trial ends
      - `converted` (boolean) - Whether the lead converted to a registered user
      - `created_at` (timestamptz) - Record creation timestamp
  
  2. Security
    - Enable RLS on `email_leads` table
    - Add policy for service role to insert leads
    - Add policy for authenticated users to view their own lead data
  
  3. Notes
    - Email addresses are unique to prevent duplicate signups
    - Trial period is automatically calculated as 10 days from subscription
    - Converted flag tracks if the lead becomes a registered user
*/

CREATE TABLE IF NOT EXISTS email_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  trial_ends_at timestamptz DEFAULT (now() + interval '10 days'),
  converted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert their email (for the signup form)
CREATE POLICY "Anyone can sign up for trial"
  ON email_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view their own lead data
CREATE POLICY "Users can view their own lead data"
  ON email_leads
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS email_leads_email_idx ON email_leads(email);
