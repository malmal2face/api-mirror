# Cricket Data API - Usage Guide

Complete guide for developers using the Cricket Data API.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)

## Quick Start

### Get Your API Key

1. Contact your administrator to create an API user account
2. Receive your unique API key (save it securely!)
3. Start making API requests

### Make Your First Request

```bash
curl -X GET "https://your-project.supabase.co/functions/v1/cricket-api/teams" \
  -H "X-API-Key: your_api_key_here"
```

## Authentication

All API requests require authentication using an API key.

### Request Header

Include your API key in every request:

```
X-API-Key: your_api_key_here
```

### Query Parameter (Alternative)

You can also pass the API key as a query parameter:

```
?api_key=your_api_key_here
```

**Note:** Header method is recommended for security.

## Endpoints

Base URL: `https://your-project.supabase.co/functions/v1/cricket-api`

### Available Endpoints

#### Continents

```
GET /continents
```

Get all cricket-playing continents.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Asia",
      "code": "AS",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Countries

```
GET /countries
```

Get all cricket-playing countries.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "continent_id": 1,
      "name": "India",
      "code": "IND",
      "image_path": "path/to/flag.png",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Leagues

```
GET /leagues
```

Get all cricket leagues and competitions.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "country_id": 1,
      "name": "Indian Premier League",
      "code": "IPL",
      "type": "domestic",
      "image_path": "path/to/logo.png",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Seasons

```
GET /seasons
```

Get all cricket seasons.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "league_id": 1,
      "name": "IPL 2024",
      "code": "IPL2024",
      "starting_at": "2024-03-22",
      "ending_at": "2024-05-26",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Fixtures

```
GET /fixtures
```

Get all match fixtures (scheduled and completed).

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "league_id": 1,
      "season_id": 1,
      "venue_id": 1,
      "localteam_id": 1,
      "visitorteam_id": 2,
      "starting_at": "2024-04-01T14:30:00Z",
      "type": "T20",
      "status": "Finished",
      "note": "Final",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Live Scores

```
GET /livescores
```

Get real-time match scores for ongoing games.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "fixture_id": 1,
      "league_id": 1,
      "status": "Live",
      "type": "T20",
      "note": "India batting",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Teams

```
GET /teams
```

Get all cricket teams.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "country_id": 1,
      "name": "India",
      "code": "IND",
      "image_path": "path/to/logo.png",
      "national_team": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Players

```
GET /players
```

Get all cricket players.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "country_id": 1,
      "firstname": "Virat",
      "lastname": "Kohli",
      "fullname": "Virat Kohli",
      "image_path": "path/to/photo.png",
      "dateofbirth": "1988-11-05",
      "battingstyle": "Right-hand bat",
      "bowlingstyle": "Right-arm medium",
      "position_name": "Batsman",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Officials

```
GET /officials
```

Get all match officials (umpires, referees).

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "country_id": 1,
      "firstname": "Kumar",
      "lastname": "Dharmasena",
      "fullname": "Kumar Dharmasena",
      "dateofbirth": "1971-04-24",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Venues

```
GET /venues
```

Get all cricket stadiums and venues.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "country_id": 1,
      "name": "Wankhede Stadium",
      "city": "Mumbai",
      "capacity": 33000,
      "image_path": "path/to/stadium.png",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Stages

```
GET /stages
```

Get tournament stages (Group, Knockout, etc.).

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "season_id": 1,
      "league_id": 1,
      "name": "Group Stage",
      "type": "round",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Positions

```
GET /positions
```

Get team standings and positions.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "season_id": 1,
      "team_id": 1,
      "position": 1,
      "played": 14,
      "won": 10,
      "lost": 4,
      "draw": 0,
      "points": 20,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

#### Scores

```
GET /scores
```

Get match scores and statistics.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "fixture_id": 1,
      "team_id": 1,
      "innings": "1st",
      "score": 180,
      "wickets": 5,
      "overs": 20.0,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 1 }
}
```

## Response Format

### Success Response

```json
{
  "data": [...],
  "meta": {
    "count": 100
  }
}
```

- `data`: Array of requested resources
- `meta.count`: Total number of records returned

### Error Response

```json
{
  "error": "Error message description"
}
```

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | Success | Request successful |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | API key inactive or expired |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error occurred |

### Common Errors

**Missing API Key:**
```json
{
  "error": "API key required. Provide X-API-Key header or api_key query parameter"
}
```

**Invalid API Key:**
```json
{
  "error": "Invalid API key"
}
```

**Rate Limit Exceeded:**
```json
{
  "error": "Rate limit exceeded",
  "limit": 60
}
```

## Rate Limiting

- Default: 60 requests per minute per API key
- Limits are configured per API key
- Exceeded limits return 429 status
- Contact administrator for limit increases

### Best Practices

1. Implement exponential backoff for retries
2. Cache responses when possible
3. Monitor your usage patterns
4. Request limit increase before hitting caps

## Code Examples

### JavaScript / TypeScript

```typescript
const BASE_URL = 'https://your-project.supabase.co/functions/v1/cricket-api';
const API_KEY = 'your_api_key_here';

async function getTeams() {
  try {
    const response = await fetch(`${BASE_URL}/teams`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
}

// Usage
getTeams()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### React Hook

```typescript
import { useState, useEffect } from 'react';

function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/${endpoint}`,
          {
            headers: {
              'X-API-Key': process.env.REACT_APP_API_KEY!
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}

// Usage in component
function Teams() {
  const { data, loading, error } = useApi('teams');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.data.map(team => (
        <li key={team.id}>{team.name}</li>
      ))}
    </ul>
  );
}
```

### Python

```python
import requests

BASE_URL = 'https://your-project.supabase.co/functions/v1/cricket-api'
API_KEY = 'your_api_key_here'

def get_teams():
    headers = {
        'X-API-Key': API_KEY
    }

    try:
        response = requests.get(f'{BASE_URL}/teams', headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error: {e}')
        raise

# Usage
teams = get_teams()
print(teams)
```

### Node.js with Axios

```javascript
const axios = require('axios');

const BASE_URL = 'https://your-project.supabase.co/functions/v1/cricket-api';
const API_KEY = 'your_api_key_here';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-API-Key': API_KEY
  }
});

async function getFixtures() {
  try {
    const response = await api.get('/fixtures');
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Usage
getFixtures()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### PHP

```php
<?php

$baseUrl = 'https://your-project.supabase.co/functions/v1/cricket-api';
$apiKey = 'your_api_key_here';

function getTeams($baseUrl, $apiKey) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/teams');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: ' . $apiKey
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception('API request failed with status: ' . $httpCode);
    }

    return json_decode($response, true);
}

// Usage
try {
    $teams = getTeams($baseUrl, $apiKey);
    print_r($teams);
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
?>
```

## Best Practices

### 1. Security

- **Never expose API keys in client-side code**
- Store keys in environment variables
- Use server-side proxy for browser requests
- Rotate keys periodically

### 2. Performance

- **Cache responses** when data doesn't change frequently
- **Batch requests** when possible
- **Use pagination** if available in future versions
- **Minimize request frequency**

### 3. Error Handling

- **Always handle errors gracefully**
- **Implement retry logic** with exponential backoff
- **Log errors** for debugging
- **Provide user feedback**

### 4. Rate Limiting

- **Monitor your usage**
- **Implement client-side throttling**
- **Cache responses**
- **Request limit increases** proactively

### 5. Data Freshness

- Data syncs every 60 seconds
- Don't request updates more frequently
- Consider caching for 1-2 minutes
- Use appropriate TTL for your use case

## Support

For API issues or questions:

1. Check this documentation
2. Contact your administrator
3. Review error messages and logs
4. Test with curl/Postman first

## Changelog

### Version 1.0.0 (Current)

- Initial release
- 13 endpoints available
- Rate limiting: 60 req/min
- Data sync: Every 60 seconds

## License

API usage is subject to your organization's terms of service.
