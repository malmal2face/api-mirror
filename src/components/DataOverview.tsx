import { CricketDataCounts } from '../types/cricket';
import { TrendingUp, Users, Trophy, Calendar, MapPin, Zap } from 'lucide-react';

interface DataOverviewProps {
  dataCounts: CricketDataCounts;
}

export function DataOverview({ dataCounts }: DataOverviewProps) {
  const stats = [
    { label: 'Continents', value: dataCounts.continents, icon: MapPin, color: 'bg-blue-500' },
    { label: 'Countries', value: dataCounts.countries, icon: MapPin, color: 'bg-green-500' },
    { label: 'Leagues', value: dataCounts.leagues, icon: Trophy, color: 'bg-yellow-500' },
    { label: 'Seasons', value: dataCounts.seasons, icon: Calendar, color: 'bg-red-500' },
    { label: 'Teams', value: dataCounts.teams, icon: Users, color: 'bg-indigo-500' },
    { label: 'Players', value: dataCounts.players, icon: Users, color: 'bg-pink-500' },
    { label: 'Fixtures', value: dataCounts.fixtures, icon: Calendar, color: 'bg-cyan-500' },
    { label: 'Live Scores', value: dataCounts.livescores, icon: Zap, color: 'bg-orange-500' },
    { label: 'Venues', value: dataCounts.venues, icon: MapPin, color: 'bg-teal-500' },
    { label: 'Officials', value: dataCounts.officials, icon: Users, color: 'bg-slate-500' },
    { label: 'Stages', value: dataCounts.stages, icon: TrendingUp, color: 'bg-lime-500' },
    { label: 'Positions', value: dataCounts.positions, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Scores', value: dataCounts.scores, icon: Trophy, color: 'bg-amber-500' },
  ];

  const totalRecords = Object.values(dataCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Overview</h2>
        <p className="text-slate-600">
          Total records stored: <span className="font-semibold text-slate-900">{totalRecords.toLocaleString()}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {stat.value.toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">API Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Base URL:</span>
            <code className="text-sm bg-white px-3 py-1 rounded border border-slate-200">
              {import.meta.env.VITE_SUPABASE_URL}/functions/v1/cricket-api
            </code>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Authentication:</span>
            <code className="text-sm bg-white px-3 py-1 rounded border border-slate-200">
              X-API-Key header
            </code>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Available Endpoints:</span>
            <span className="text-sm font-medium text-slate-900">13 endpoints</span>
          </div>
        </div>
      </div>
    </div>
  );
}
