import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { createHash } from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const VALID_ENDPOINTS = [
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const endpoint = pathParts[pathParts.length - 1];

    if (!VALID_ENDPOINTS.includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint', valid_endpoints: VALID_ENDPOINTS }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const apiKey = req.headers.get('X-API-Key') || url.searchParams.get('api_key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required. Provide X-API-Key header or api_key query parameter' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    
    const { data: apiKeyRecord, error: keyError } = await supabaseClient
      .from('api_keys')
      .select('id, user_id, is_active, rate_limit_per_minute, expires_at')
      .eq('key_hash', keyHash)
      .maybeSingle();

    if (keyError || !apiKeyRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!apiKeyRecord.is_active) {
      return new Response(
        JSON.stringify({ error: 'API key is inactive' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'API key has expired' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { count } = await supabaseClient
      .from('api_logs')
      .select('*', { count: 'exact', head: true })
      .eq('api_key_id', apiKeyRecord.id)
      .gte('created_at', oneMinuteAgo);

    if (count && count >= apiKeyRecord.rate_limit_per_minute) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', limit: apiKeyRecord.rate_limit_per_minute }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const startTime = Date.now();
    
    const { data, error } = await supabaseClient
      .from(endpoint)
      .select('*');

    const responseTime = Date.now() - startTime;

    if (error) {
      await supabaseClient
        .from('api_logs')
        .insert({
          api_key_id: apiKeyRecord.id,
          endpoint,
          method: req.method,
          status_code: 500,
          response_time_ms: responseTime,
        });

      return new Response(
        JSON.stringify({ error: 'Database error', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabaseClient
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyRecord.id);

    await supabaseClient
      .from('api_logs')
      .insert({
        api_key_id: apiKeyRecord.id,
        endpoint,
        method: req.method,
        status_code: 200,
        response_time_ms: responseTime,
      });

    return new Response(
      JSON.stringify({ data, meta: { count: data?.length || 0 } }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
