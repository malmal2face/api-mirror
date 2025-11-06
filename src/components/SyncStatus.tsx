import { SyncStatus as SyncStatusType } from '../types/cricket';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface SyncStatusProps {
  statuses: SyncStatusType[];
  onSync: (endpoint: string) => void;
  isSyncing: boolean;
}

export function SyncStatus({ statuses, onSync, isSyncing }: SyncStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'syncing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      syncing: 'bg-blue-100 text-blue-800',
      pending: 'bg-slate-100 text-slate-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sync Status</h2>
        <p className="text-slate-600">Monitor data synchronization from SportMonks API</p>
      </div>

      <div className="space-y-3">
        {statuses.map((status) => (
          <div
            key={status.endpoint}
            className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {getStatusIcon(status.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-semibold text-slate-900 capitalize">
                      {status.endpoint}
                    </h3>
                    {getStatusBadge(status.status)}
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-slate-600">
                    <span>Records: {status.records_count}</span>
                    <span>Last sync: {formatDate(status.last_sync_at)}</span>
                    {status.last_success_at && (
                      <span>Last success: {formatDate(status.last_success_at)}</span>
                    )}
                  </div>
                  {status.last_error && (
                    <div className="mt-2 flex items-start space-x-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{status.last_error}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onSync(status.endpoint)}
                disabled={isSyncing}
                className="ml-4 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
