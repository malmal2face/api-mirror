export interface SyncStatus {
  id: string;
  endpoint: string;
  last_sync_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  status: 'pending' | 'syncing' | 'success' | 'error';
  records_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  rate_limit_per_minute: number;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  created_at: string;
}

export interface CricketDataCounts {
  continents: number;
  countries: number;
  leagues: number;
  seasons: number;
  fixtures: number;
  livescores: number;
  teams: number;
  players: number;
  officials: number;
  venues: number;
  stages: number;
  positions: number;
  scores: number;
}
