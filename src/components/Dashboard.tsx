import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SyncStatus as SyncStatusType, CricketDataCounts } from '../types/cricket';
import { LogOut, RefreshCw, Users, Activity, Database, BookOpen } from 'lucide-react';
import { SyncStatus } from './SyncStatus';
import { UserManagement } from './UserManagement';
import { ApiUsage } from './ApiUsage';
import { DataOverview } from './DataOverview';
import { ApiDocs } from './ApiDocs';
import { startAutoSync, stopAutoSync } from '../utils/scheduler';

type Tab = 'overview' | 'sync' | 'users' | 'usage' | 'docs';

export function Dashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [syncStatuses, setSyncStatuses] = useState<SyncStatusType[]>([]);
  const [dataCounts, setDataCounts] = useState<CricketDataCounts>({
    continents: 0,
    countries: 0,
    leagues: 0,
    seasons: 0,
    fixtures: 0,
    livescores: 0,
    teams: 0,
    players: 0,
    officials: 0,
    venues: 0,
    stages: 0,
    positions: 0,
    scores: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  useEffect(() => {
    loadSyncStatuses();
    loadDataCounts();
    const statusInterval = setInterval(() => {
      loadSyncStatuses();
      loadDataCounts();
    }, 5000);

    const autoSyncInterval = startAutoSync(1);

    return () => {
      clearInterval(statusInterval);
      stopAutoSync(autoSyncInterval);
    };
  }, []);

  const loadSyncStatuses = async () => {
    const { data, error } = await supabase
      .from('sync_status')
      .select('*')
      .order('endpoint');

    if (data && !error) {
      setSyncStatuses(data);
    }
  };

  const loadDataCounts = async () => {
    const tables = [
      'continents',
      'countries',
      'leagues',
      'seasons',
      'fixtures',
      'livescores',
      'teams',
      'players',
      'officials',
      'venues',
      'stages',
      'positions',
      'scores',
    ];

    const counts: any = {};
    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      counts[table] = count || 0;
    }
    setDataCounts(counts);
  };

  const triggerSync = async (endpoint?: string) => {
    setIsSyncing(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-cricket-data${
        endpoint ? `?endpoint=${endpoint}` : ''
      }`;

      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      setTimeout(() => {
        loadSyncStatuses();
        loadDataCounts();
      }, 2000);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: Database },
    { id: 'sync' as Tab, label: 'Sync Status', icon: RefreshCw },
    { id: 'users' as Tab, label: 'User Management', icon: Users },
    { id: 'usage' as Tab, label: 'API Usage', icon: Activity },
    { id: 'docs' as Tab, label: 'API Docs', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-slate-900" />
              <h1 className="text-xl font-bold text-slate-900">Cricket Data Hub</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => triggerSync()}
                disabled={isSyncing}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync All'}</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                      activeTab === tab.id
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'overview' && <DataOverview dataCounts={dataCounts} />}
          {activeTab === 'sync' && (
            <SyncStatus
              statuses={syncStatuses}
              onSync={triggerSync}
              isSyncing={isSyncing}
            />
          )}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'usage' && <ApiUsage />}
          {activeTab === 'docs' && <ApiDocs />}
        </div>
      </div>
    </div>
  );
}
