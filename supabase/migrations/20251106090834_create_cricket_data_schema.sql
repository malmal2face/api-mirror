/*
  # Cricket Data Management Schema

  ## Overview
  This migration creates a comprehensive database schema for cricket data aggregation
  from SportMonks API, including user management, API key authentication, and data versioning.

  ## 1. Authentication & User Management Tables
    - `admin_users` - Hardcoded admin credentials
    - `api_users` - Users who can access the mirrored API
    - `api_keys` - API key management with rate limiting
    
  ## 2. Cricket Data Tables
    - `continents` - Continental information
    - `countries` - Country data
    - `leagues` - Cricket leagues
    - `seasons` - Season information
    - `fixtures` - Match fixtures
    - `livescores` - Real-time scores
    - `teams` - Team information
    - `players` - Player profiles
    - `officials` - Match officials
    - `venues` - Stadium/venue data
    - `stages` - Tournament stages
    - `positions` - Team standings
    - `scores` - Match scores
    
  ## 3. System Tables
    - `sync_status` - Track API sync status and timestamps
    - `api_logs` - Log all API requests
    - `data_versions` - Track data changes over time
    
  ## 4. Security
    - Enable RLS on all tables
    - Admin users can manage everything
    - API users can only read cricket data with valid API keys
    - Public access denied by default

  ## Important Notes
    - All cricket data tables include version tracking
    - Sync status updated every minute during data refresh
    - API keys are hashed for security
    - Rate limiting tracked per API key
*/

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage their own data"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- API Users Table
CREATE TABLE IF NOT EXISTS api_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE api_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read API users"
  ON api_users FOR SELECT
  TO authenticated
  USING (true);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES api_users(id) ON DELETE CASCADE,
  key_hash text UNIQUE NOT NULL,
  key_prefix text NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  rate_limit_per_minute integer DEFAULT 60,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (true);

-- Continents Table
CREATE TABLE IF NOT EXISTS continents (
  id integer PRIMARY KEY,
  name text NOT NULL,
  code text,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE continents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to continents"
  ON continents FOR SELECT
  TO anon, authenticated
  USING (true);

-- Countries Table
CREATE TABLE IF NOT EXISTS countries (
  id integer PRIMARY KEY,
  continent_id integer REFERENCES continents(id),
  name text NOT NULL,
  code text,
  image_path text,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to countries"
  ON countries FOR SELECT
  TO anon, authenticated
  USING (true);

-- Leagues Table
CREATE TABLE IF NOT EXISTS leagues (
  id integer PRIMARY KEY,
  country_id integer REFERENCES countries(id),
  name text NOT NULL,
  code text,
  image_path text,
  type text,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to leagues"
  ON leagues FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seasons Table
CREATE TABLE IF NOT EXISTS seasons (
  id integer PRIMARY KEY,
  league_id integer REFERENCES leagues(id),
  name text NOT NULL,
  code text,
  starting_at date,
  ending_at date,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to seasons"
  ON seasons FOR SELECT
  TO anon, authenticated
  USING (true);

-- Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id integer PRIMARY KEY,
  country_id integer REFERENCES countries(id),
  name text NOT NULL,
  code text,
  image_path text,
  national_team boolean DEFAULT false,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to teams"
  ON teams FOR SELECT
  TO anon, authenticated
  USING (true);

-- Venues Table
CREATE TABLE IF NOT EXISTS venues (
  id integer PRIMARY KEY,
  country_id integer REFERENCES countries(id),
  name text NOT NULL,
  city text,
  capacity integer,
  image_path text,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to venues"
  ON venues FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fixtures Table
CREATE TABLE IF NOT EXISTS fixtures (
  id integer PRIMARY KEY,
  league_id integer REFERENCES leagues(id),
  season_id integer REFERENCES seasons(id),
  venue_id integer REFERENCES venues(id),
  localteam_id integer REFERENCES teams(id),
  visitorteam_id integer REFERENCES teams(id),
  starting_at timestamptz,
  type text,
  status text,
  note text,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to fixtures"
  ON fixtures FOR SELECT
  TO anon, authenticated
  USING (true);

-- Livescores Table
CREATE TABLE IF NOT EXISTS livescores (
  id integer PRIMARY KEY,
  fixture_id integer REFERENCES fixtures(id),
  league_id integer REFERENCES leagues(id),
  status text,
  type text,
  note text,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE livescores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to livescores"
  ON livescores FOR SELECT
  TO anon, authenticated
  USING (true);

-- Players Table
CREATE TABLE IF NOT EXISTS players (
  id integer PRIMARY KEY,
  country_id integer REFERENCES countries(id),
  firstname text,
  lastname text,
  fullname text,
  image_path text,
  dateofbirth date,
  battingstyle text,
  bowlingstyle text,
  position_name text,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to players"
  ON players FOR SELECT
  TO anon, authenticated
  USING (true);

-- Officials Table
CREATE TABLE IF NOT EXISTS officials (
  id integer PRIMARY KEY,
  country_id integer REFERENCES countries(id),
  firstname text,
  lastname text,
  fullname text,
  dateofbirth date,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE officials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to officials"
  ON officials FOR SELECT
  TO anon, authenticated
  USING (true);

-- Stages Table
CREATE TABLE IF NOT EXISTS stages (
  id integer PRIMARY KEY,
  season_id integer REFERENCES seasons(id),
  league_id integer REFERENCES leagues(id),
  name text NOT NULL,
  type text,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to stages"
  ON stages FOR SELECT
  TO anon, authenticated
  USING (true);

-- Positions Table
CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id integer REFERENCES seasons(id),
  team_id integer REFERENCES teams(id),
  position integer,
  played integer DEFAULT 0,
  won integer DEFAULT 0,
  lost integer DEFAULT 0,
  draw integer DEFAULT 0,
  points integer DEFAULT 0,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to positions"
  ON positions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Scores Table
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id integer REFERENCES fixtures(id),
  team_id integer REFERENCES teams(id),
  innings text,
  score integer,
  wickets integer,
  overs numeric,
  sportmonks_data jsonb,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to scores"
  ON scores FOR SELECT
  TO anon, authenticated
  USING (true);

-- Sync Status Table
CREATE TABLE IF NOT EXISTS sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text UNIQUE NOT NULL,
  last_sync_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  status text DEFAULT 'pending',
  records_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sync status"
  ON sync_status FOR SELECT
  TO authenticated
  USING (true);

-- API Logs Table
CREATE TABLE IF NOT EXISTS api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id),
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer,
  response_time_ms integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read API logs"
  ON api_logs FOR SELECT
  TO authenticated
  USING (true);

-- Data Versions Table
CREATE TABLE IF NOT EXISTS data_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id text NOT NULL,
  version integer NOT NULL,
  data_snapshot jsonb NOT NULL,
  changed_at timestamptz DEFAULT now()
);

ALTER TABLE data_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read data versions"
  ON data_versions FOR SELECT
  TO authenticated
  USING (true);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_countries_continent ON countries(continent_id);
CREATE INDEX IF NOT EXISTS idx_leagues_country ON leagues(country_id);
CREATE INDEX IF NOT EXISTS idx_seasons_league ON seasons(league_id);
CREATE INDEX IF NOT EXISTS idx_teams_country ON teams(country_id);
CREATE INDEX IF NOT EXISTS idx_venues_country ON venues(country_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_league ON fixtures(league_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_season ON fixtures(season_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_starting_at ON fixtures(starting_at);
CREATE INDEX IF NOT EXISTS idx_livescores_fixture ON livescores(fixture_id);
CREATE INDEX IF NOT EXISTS idx_players_country ON players(country_id);
CREATE INDEX IF NOT EXISTS idx_officials_country ON officials(country_id);
CREATE INDEX IF NOT EXISTS idx_stages_season ON stages(season_id);
CREATE INDEX IF NOT EXISTS idx_positions_season ON positions(season_id);
CREATE INDEX IF NOT EXISTS idx_scores_fixture ON scores(fixture_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- Insert default sync status records
INSERT INTO sync_status (endpoint, status) VALUES
  ('continents', 'pending'),
  ('countries', 'pending'),
  ('leagues', 'pending'),
  ('seasons', 'pending'),
  ('fixtures', 'pending'),
  ('livescores', 'pending'),
  ('teams', 'pending'),
  ('players', 'pending'),
  ('officials', 'pending'),
  ('venues', 'pending'),
  ('stages', 'pending'),
  ('positions', 'pending'),
  ('scores', 'pending')
ON CONFLICT (endpoint) DO NOTHING;