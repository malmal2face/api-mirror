import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ApiUser, ApiKey } from '../types/cricket';
import { Plus, Trash2, Key as KeyIcon, Copy, Check } from 'lucide-react';
import { createHash } from 'crypto-js/sha256';

export function UserManagement() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddKey, setShowAddKey] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [newKey, setNewKey] = useState({ name: '', rateLimit: 60 });
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    loadUsers();
    loadApiKeys();
  }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('api_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setUsers(data);
    }
  };

  const loadApiKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setApiKeys(data);
    }
  };

  const createUser = async () => {
    const { error } = await supabase
      .from('api_users')
      .insert([newUser]);

    if (!error) {
      setNewUser({ name: '', email: '' });
      setShowAddUser(false);
      loadUsers();
    }
  };

  const deleteUser = async (userId: string) => {
    const confirmed = confirm('Are you sure you want to delete this user and all their API keys?');
    if (confirmed) {
      const { error } = await supabase
        .from('api_users')
        .delete()
        .eq('id', userId);

      if (!error) {
        loadUsers();
        loadApiKeys();
      }
    }
  };

  const generateApiKey = () => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const createApiKey = async () => {
    const apiKey = generateApiKey();
    const keyHash = createHash(apiKey).toString();
    const keyPrefix = apiKey.substring(0, 8);

    const { error } = await supabase
      .from('api_keys')
      .insert([{
        user_id: selectedUserId,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: newKey.name,
        rate_limit_per_minute: newKey.rateLimit,
      }]);

    if (!error) {
      setGeneratedKey(apiKey);
      setNewKey({ name: '', rateLimit: 60 });
      setShowAddKey(false);
      loadApiKeys();
    }
  };

  const deleteApiKey = async (keyId: string) => {
    const confirmed = confirm('Are you sure you want to delete this API key?');
    if (confirmed) {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (!error) {
        loadApiKeys();
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">User Management</h2>
            <p className="text-slate-600">Manage API users and their access keys</p>
          </div>
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>

        {showAddUser && (
          <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <h3 className="font-semibold text-slate-900 mb-4">Create New User</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={createUser}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                Create User
              </button>
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {users.map((user) => {
            const userKeys = apiKeys.filter(k => k.user_id === user.id);
            return (
              <div key={user.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {userKeys.length} API key{userKeys.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setShowAddKey(true);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition"
                    >
                      <KeyIcon className="w-4 h-4" />
                      <span>Add Key</span>
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {userKeys.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-200">
                    {userKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between bg-slate-50 p-3 rounded">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{key.name}</p>
                          <p className="text-xs text-slate-600 font-mono">{key.key_prefix}...</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Rate limit: {key.rate_limit_per_minute}/min
                          </p>
                        </div>
                        <button
                          onClick={() => deleteApiKey(key.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showAddKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Create API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Production Key"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rate Limit (per minute)
                </label>
                <input
                  type="number"
                  value={newKey.rateLimit}
                  onChange={(e) => setNewKey({ ...newKey, rateLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createApiKey}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                Generate Key
              </button>
              <button
                onClick={() => setShowAddKey(false)}
                className="flex-1 px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {generatedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">API Key Generated</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                Save this key now! You won't be able to see it again.
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <code className="text-white text-sm break-all">{generatedKey}</code>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => copyToClipboard(generatedKey)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
              <button
                onClick={() => setGeneratedKey('')}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
