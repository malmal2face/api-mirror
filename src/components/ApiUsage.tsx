import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ApiLog } from '../types/cricket';
import { Activity, Clock, TrendingUp } from 'lucide-react';

export function ApiUsage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    avgResponseTime: 0,
    successRate: 0,
  });

  useEffect(() => {
    loadLogs();
    loadStats();
    const interval = setInterval(() => {
      loadLogs();
      loadStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    const { data, error } = await supabase
      .from('api_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data && !error) {
      setLogs(data);
    }
  };

  const loadStats = async () => {
    const { data: allLogs } = await supabase
      .from('api_logs')
      .select('status_code, response_time_ms');

    if (allLogs) {
      const totalRequests = allLogs.length;
      const successfulRequests = allLogs.filter(log => log.status_code >= 200 && log.status_code < 300).length;
      const avgResponseTime = allLogs.reduce((sum, log) => sum + log.response_time_ms, 0) / totalRequests || 0;

      setStats({
        totalRequests,
        avgResponseTime: Math.round(avgResponseTime),
        successRate: totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 bg-green-100';
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">API Usage</h2>
        <p className="text-slate-600">Monitor API requests and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-600">Total Requests</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalRequests.toLocaleString()}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-500 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-600">Success Rate</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.successRate}%</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-600">Avg Response Time</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.avgResponseTime}ms</p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Recent Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Response Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No API requests yet
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      /{log.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {log.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status_code)}`}>
                        {log.status_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {log.response_time_ms}ms
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
