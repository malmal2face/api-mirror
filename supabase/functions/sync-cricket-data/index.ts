import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const SPORTMONKS_API_URL = 'https://cricket.sportmonks.com/api/v2.0';
const SPORTMONKS_API_TOKEN = 'BdX22sWKKmJHbLsvIQEQesYN7riNnmiAgTnCdWlgj5XwcmA5PucrUdNVCFXz';

const ENDPOINTS = [
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
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');

    if (endpoint && !ENDPOINTS.includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const endpointsToSync = endpoint ? [endpoint] : ENDPOINTS;
    const results = [];

    for (const ep of endpointsToSync) {
      try {
        await supabaseClient
          .from('sync_status')
          .update({ status: 'syncing', updated_at: new Date().toISOString() })
          .eq('endpoint', ep);

        const response = await fetch(
          `${SPORTMONKS_API_URL}/${ep}?api_token=${SPORTMONKS_API_TOKEN}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const records = data.data || [];

        if (records.length > 0) {
          await syncDataToTable(supabaseClient, ep, records);
        }

        await supabaseClient
          .from('sync_status')
          .update({
            status: 'success',
            last_sync_at: new Date().toISOString(),
            last_success_at: new Date().toISOString(),
            records_count: records.length,
            last_error: null,
            updated_at: new Date().toISOString(),
          })
          .eq('endpoint', ep);

        results.push({ endpoint: ep, status: 'success', count: records.length });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        await supabaseClient
          .from('sync_status')
          .update({
            status: 'error',
            last_sync_at: new Date().toISOString(),
            last_error: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq('endpoint', ep);

        results.push({ endpoint: ep, status: 'error', error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
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

async function syncDataToTable(supabaseClient: any, endpoint: string, records: any[]) {
  const tableName = endpoint === 'livescores' ? 'livescores' : endpoint;
  
  for (const record of records) {
    const { data: existing } = await supabaseClient
      .from(tableName)
      .select('id, version')
      .eq('id', record.id)
      .maybeSingle();

    const dataToInsert = {
      id: record.id,
      sportmonks_data: record,
      version: existing ? existing.version + 1 : 1,
      updated_at: new Date().toISOString(),
    };

    switch (endpoint) {
      case 'continents':
        Object.assign(dataToInsert, {
          name: record.name,
          code: record.code,
        });
        break;
      case 'countries':
        Object.assign(dataToInsert, {
          continent_id: record.continent_id,
          name: record.name,
          code: record.code,
          image_path: record.image_path,
        });
        break;
      case 'leagues':
        Object.assign(dataToInsert, {
          country_id: record.country_id,
          name: record.name,
          code: record.code,
          image_path: record.image_path,
          type: record.type,
        });
        break;
      case 'seasons':
        Object.assign(dataToInsert, {
          league_id: record.league_id,
          name: record.name,
          code: record.code,
          starting_at: record.starting_at,
          ending_at: record.ending_at,
        });
        break;
      case 'teams':
        Object.assign(dataToInsert, {
          country_id: record.country_id,
          name: record.name,
          code: record.code,
          image_path: record.image_path,
          national_team: record.national_team || false,
        });
        break;
      case 'venues':
        Object.assign(dataToInsert, {
          country_id: record.country_id,
          name: record.name,
          city: record.city,
          capacity: record.capacity,
          image_path: record.image_path,
        });
        break;
      case 'fixtures':
        Object.assign(dataToInsert, {
          league_id: record.league_id,
          season_id: record.season_id,
          venue_id: record.venue_id,
          localteam_id: record.localteam_id,
          visitorteam_id: record.visitorteam_id,
          starting_at: record.starting_at,
          type: record.type,
          status: record.status,
          note: record.note,
        });
        break;
      case 'livescores':
        Object.assign(dataToInsert, {
          fixture_id: record.fixture_id,
          league_id: record.league_id,
          status: record.status,
          type: record.type,
          note: record.note,
        });
        break;
      case 'players':
        Object.assign(dataToInsert, {
          country_id: record.country_id,
          firstname: record.firstname,
          lastname: record.lastname,
          fullname: record.fullname,
          image_path: record.image_path,
          dateofbirth: record.dateofbirth,
          battingstyle: record.battingstyle,
          bowlingstyle: record.bowlingstyle,
          position_name: record.position?.name,
        });
        break;
      case 'officials':
        Object.assign(dataToInsert, {
          country_id: record.country_id,
          firstname: record.firstname,
          lastname: record.lastname,
          fullname: record.fullname,
          dateofbirth: record.dateofbirth,
        });
        break;
      case 'stages':
        Object.assign(dataToInsert, {
          season_id: record.season_id,
          league_id: record.league_id,
          name: record.name,
          type: record.type,
        });
        break;
    }

    await supabaseClient
      .from(tableName)
      .upsert(dataToInsert, { onConflict: 'id' });

    if (existing) {
      await supabaseClient
        .from('data_versions')
        .insert({
          table_name: tableName,
          record_id: record.id.toString(),
          version: dataToInsert.version,
          data_snapshot: record,
        });
    }
  }
}
