import { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';

export function ApiDocs() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string>('');

  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cricket-api`;

  const endpoints = [
    { path: '/continents', description: 'Get all cricket continents' },
    { path: '/countries', description: 'Get all cricket countries' },
    { path: '/leagues', description: 'Get all cricket leagues' },
    { path: '/seasons', description: 'Get all seasons' },
    { path: '/fixtures', description: 'Get all match fixtures' },
    { path: '/livescores', description: 'Get real-time match scores' },
    { path: '/teams', description: 'Get all cricket teams' },
    { path: '/players', description: 'Get all cricket players' },
    { path: '/officials', description: 'Get all match officials' },
    { path: '/venues', description: 'Get all cricket venues' },
    { path: '/stages', description: 'Get all tournament stages' },
    { path: '/positions', description: 'Get team standings and positions' },
    { path: '/scores', description: 'Get match scores' },
  ];

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(''), 2000);
  };

  const exampleCurl = `curl -X GET "${baseUrl}/teams" \\
  -H "X-API-Key: your_api_key_here"`;

  const exampleJavaScript = `const response = await fetch('${baseUrl}/teams', {
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});

const data = await response.json();
console.log(data);`;

  const examplePython = `import requests

headers = {
    'X-API-Key': 'your_api_key_here'
}

response = requests.get('${baseUrl}/teams', headers=headers)
data = response.json()
print(data)`;

  const exampleResponse = {
    data: [
      {
        id: 1,
        name: "India",
        code: "IND",
        country_id: 4,
        national_team: true,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z"
      }
    ],
    meta: {
      count: 1
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">API Documentation</h2>
        <p className="text-slate-600">Complete guide to using the Cricket Data API</p>
      </div>

      <div className="space-y-8">
        <section className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Authentication</h3>
          <p className="text-slate-700 mb-4">
            All API requests require authentication using an API key. Include your API key in the request header:
          </p>
          <div className="bg-slate-900 rounded-lg p-4 text-white font-mono text-sm">
            X-API-Key: your_api_key_here
          </div>
          <p className="text-sm text-slate-600 mt-3">
            Get your API key from the User Management section.
          </p>
        </section>

        <section className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Base URL</h3>
          <div className="flex items-center space-x-2 bg-slate-50 rounded-lg p-4">
            <code className="text-sm text-slate-900 flex-1 break-all">{baseUrl}</code>
            <button
              onClick={() => copyToClipboard(baseUrl, 'base')}
              className="p-2 hover:bg-slate-200 rounded transition"
            >
              {copiedEndpoint === 'base' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </section>

        <section className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Available Endpoints</h3>
          <div className="space-y-3">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.path}
                className="flex items-center justify-between bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      GET
                    </span>
                    <code className="text-sm font-mono text-slate-900">{endpoint.path}</code>
                  </div>
                  <p className="text-sm text-slate-600">{endpoint.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`, endpoint.path)}
                  className="ml-4 p-2 hover:bg-slate-200 rounded transition"
                >
                  {copiedEndpoint === endpoint.path ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Rate Limiting</h3>
          <p className="text-slate-700 mb-4">
            API requests are rate-limited per API key. The default limit is 60 requests per minute.
            If you exceed the rate limit, you'll receive a 429 status code.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              Contact your administrator if you need a higher rate limit for your use case.
            </p>
          </div>
        </section>

        <section className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Code Examples</h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>cURL</span>
              </h4>
              <div className="relative">
                <pre className="bg-slate-900 rounded-lg p-4 text-white text-sm overflow-x-auto">
                  <code>{exampleCurl}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(exampleCurl, 'curl')}
                  className="absolute top-3 right-3 p-2 hover:bg-slate-800 rounded transition"
                >
                  {copiedEndpoint === 'curl' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>JavaScript / TypeScript</span>
              </h4>
              <div className="relative">
                <pre className="bg-slate-900 rounded-lg p-4 text-white text-sm overflow-x-auto">
                  <code>{exampleJavaScript}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(exampleJavaScript, 'js')}
                  className="absolute top-3 right-3 p-2 hover:bg-slate-800 rounded transition"
                >
                  {copiedEndpoint === 'js' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Python</span>
              </h4>
              <div className="relative">
                <pre className="bg-slate-900 rounded-lg p-4 text-white text-sm overflow-x-auto">
                  <code>{examplePython}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(examplePython, 'python')}
                  className="absolute top-3 right-3 p-2 hover:bg-slate-800 rounded transition"
                >
                  {copiedEndpoint === 'python' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Response Format</h3>
          <p className="text-slate-700 mb-4">
            All successful responses return a JSON object with a <code className="bg-slate-100 px-2 py-1 rounded text-sm">data</code> array and a <code className="bg-slate-100 px-2 py-1 rounded text-sm">meta</code> object:
          </p>
          <div className="relative">
            <pre className="bg-slate-900 rounded-lg p-4 text-white text-sm overflow-x-auto">
              <code>{JSON.stringify(exampleResponse, null, 2)}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(JSON.stringify(exampleResponse, null, 2), 'response')}
              className="absolute top-3 right-3 p-2 hover:bg-slate-800 rounded transition"
            >
              {copiedEndpoint === 'response' ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </section>

        <section className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Error Responses</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">401</span>
                <span className="text-sm font-medium text-slate-900">Unauthorized</span>
              </div>
              <p className="text-sm text-slate-600 ml-14">Missing or invalid API key</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">403</span>
                <span className="text-sm font-medium text-slate-900">Forbidden</span>
              </div>
              <p className="text-sm text-slate-600 ml-14">API key is inactive or expired</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">429</span>
                <span className="text-sm font-medium text-slate-900">Too Many Requests</span>
              </div>
              <p className="text-sm text-slate-600 ml-14">Rate limit exceeded</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">500</span>
                <span className="text-sm font-medium text-slate-900">Internal Server Error</span>
              </div>
              <p className="text-sm text-slate-600 ml-14">Server error occurred</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
