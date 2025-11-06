# Cricket Data Hub

A comprehensive cricket data management application that aggregates data from SportMonks Cricket API and provides a mirrored API service with authentication, rate limiting, and real-time synchronization.

## Features

### Core Functionality
- **Automated Data Sync**: Fetches data from SportMonks Cricket API every 60 seconds
- **Data Storage**: Complete cricket data stored in Supabase PostgreSQL database
- **Mirrored API**: RESTful API endpoints matching SportMonks structure
- **Real-time Updates**: Automatic data refresh and synchronization
- **Data Versioning**: Track changes to cricket data over time

### Admin Dashboard
- **Overview**: Real-time statistics and data counts
- **Sync Status**: Monitor synchronization status for each endpoint
- **User Management**: Create and manage API users and their access keys
- **API Usage**: Track API requests, response times, and success rates
- **API Documentation**: Complete API reference with code examples

### Security Features
- **Admin Authentication**: Hardcoded admin login for dashboard access
- **API Key Authentication**: Secure API key-based authentication
- **Rate Limiting**: Configurable rate limits per API key (default: 60/min)
- **Row Level Security**: Database-level security policies
- **API Key Hashing**: Secure storage of API credentials

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase PostgreSQL
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

## Architecture

### Database Schema

The application uses 13+ tables to store cricket data:

- `continents` - Continental data
- `countries` - Country information
- `leagues` - Cricket leagues
- `seasons` - Season details
- `fixtures` - Match fixtures
- `livescores` - Real-time match scores
- `teams` - Team information
- `players` - Player profiles
- `officials` - Match officials
- `venues` - Stadium/venue data
- `stages` - Tournament stages
- `positions` - Team standings
- `scores` - Match scores

Plus system tables for authentication, API management, and logging:
- `admin_users`, `api_users`, `api_keys`
- `sync_status`, `api_logs`, `data_versions`

### Edge Functions

**1. sync-cricket-data**
- Fetches data from SportMonks API
- Updates database with new data
- Tracks sync status and errors
- Implements data versioning

**2. cricket-api**
- Provides mirrored API endpoints
- Validates API keys
- Enforces rate limiting
- Logs all requests

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cricket-data-hub
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SPORTMONKS_API_URL=https://cricket.sportmonks.com/api/v2.0
VITE_SPORTMONKS_API_TOKEN=BdX22sWKKmJHbLsvIQEQesYN7riNnmiAgTnCdWlgj5XwcmA5PucrUdNVCFXz
```

4. The database schema and Edge Functions are already deployed via the tools used during development.

### Running the Application

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm run preview
```

### Admin Login

Access the admin dashboard using these credentials:
- **Username**: `admin`
- **Password**: `admin123`

## API Usage

### Authentication

All API requests require an API key. Include it in the request header:

```
X-API-Key: your_api_key_here
```

### Base URL

```
{SUPABASE_URL}/functions/v1/cricket-api
```

### Available Endpoints

- `GET /continents` - Get all continents
- `GET /countries` - Get all countries
- `GET /leagues` - Get all leagues
- `GET /seasons` - Get all seasons
- `GET /fixtures` - Get match fixtures
- `GET /livescores` - Get live scores
- `GET /teams` - Get all teams
- `GET /players` - Get all players
- `GET /officials` - Get match officials
- `GET /venues` - Get venues
- `GET /stages` - Get tournament stages
- `GET /positions` - Get team standings
- `GET /scores` - Get match scores

### Example Request

```bash
curl -X GET "{SUPABASE_URL}/functions/v1/cricket-api/teams" \
  -H "X-API-Key: your_api_key_here"
```

```javascript
const response = await fetch('{SUPABASE_URL}/functions/v1/cricket-api/teams', {
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});

const data = await response.json();
```

### Response Format

```json
{
  "data": [
    {
      "id": 1,
      "name": "India",
      "code": "IND",
      "country_id": 4,
      "national_team": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "count": 1
  }
}
```

## API Management

### Creating API Users

1. Login to the admin dashboard
2. Navigate to "User Management"
3. Click "Add User"
4. Enter user details (name, email)
5. Click "Create User"

### Generating API Keys

1. In User Management, find the user
2. Click "Add Key"
3. Enter key name and rate limit
4. Click "Generate Key"
5. Copy the generated key (shown only once!)

### Monitoring API Usage

The "API Usage" tab shows:
- Total requests
- Success rate
- Average response time
- Recent request logs

## Data Synchronization

### Automatic Sync

The application automatically syncs data from SportMonks API every 60 seconds. This runs in the background when the admin dashboard is open.

### Manual Sync

To manually trigger a sync:
1. Click "Sync All" in the dashboard header
2. Or click "Sync" next to a specific endpoint in the Sync Status tab

### Sync Status

Monitor sync status in real-time:
- Last sync time
- Last successful sync
- Record counts
- Error messages (if any)

## Database Management

### Migrations

All database migrations are applied via the `mcp__supabase__apply_migration` tool during setup. The schema includes:

- Full cricket data tables with proper relationships
- User and API key management tables
- Sync status tracking
- API logging and monitoring
- Data versioning system

### Row Level Security

All tables have RLS enabled with appropriate policies:
- Admin users can manage everything
- API users can only read cricket data
- Public access denied by default

### Data Versioning

The system tracks changes to cricket data:
- Version numbers increment on updates
- Historical snapshots stored in `data_versions` table
- Useful for auditing and rollbacks

## Development

### Project Structure

```
src/
├── components/        # React components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── DataOverview.tsx
│   ├── SyncStatus.tsx
│   ├── UserManagement.tsx
│   ├── ApiUsage.tsx
│   └── ApiDocs.tsx
├── contexts/         # React contexts
│   └── AuthContext.tsx
├── lib/             # Library configurations
│   └── supabase.ts
├── types/           # TypeScript types
│   └── cricket.ts
├── utils/           # Utility functions
│   └── scheduler.ts
├── App.tsx          # Main app component
└── main.tsx         # Entry point

supabase/functions/
├── sync-cricket-data/  # Data sync function
└── cricket-api/        # Mirrored API function
```

### Adding New Endpoints

1. Add endpoint to `ENDPOINTS` array in `sync-cricket-data`
2. Create corresponding table in database migration
3. Add sync logic in `syncDataToTable` function
4. Update `VALID_ENDPOINTS` in `cricket-api`
5. Add to documentation in `ApiDocs.tsx`

## Monitoring

### Sync Status

Track synchronization health:
- Success/failure status
- Last sync timestamp
- Record counts
- Error messages

### API Logs

Monitor API usage:
- Request timestamps
- Endpoints accessed
- Response times
- Status codes
- API key usage

### Performance Metrics

Dashboard displays:
- Total API requests
- Average response time
- Success rate percentage
- Rate limit compliance

## Security Best Practices

1. **API Keys**: Never commit API keys to version control
2. **Rate Limiting**: Adjust limits based on usage patterns
3. **Monitoring**: Regularly review API logs for suspicious activity
4. **Database**: Keep RLS policies restrictive
5. **Updates**: Keep dependencies updated

## Troubleshooting

### Sync Issues

If data sync fails:
1. Check SportMonks API credentials
2. Verify Edge Function logs in Supabase dashboard
3. Review sync_status table for error messages
4. Ensure database tables exist and are accessible

### API Key Issues

If API authentication fails:
1. Verify API key is copied correctly
2. Check key is active and not expired
3. Review rate limit settings
4. Check API logs for specific error messages

### Performance Issues

If API is slow:
1. Check database indexes
2. Review rate limiting settings
3. Monitor Edge Function execution time
4. Consider caching strategies

## Support

For issues or questions:
1. Check the API Documentation tab in the dashboard
2. Review error logs in Sync Status
3. Check API logs in API Usage tab

## License

This project is for educational and demonstration purposes.

## Credits

- Cricket data provided by SportMonks Cricket API
- Built with Supabase, React, and TypeScript
