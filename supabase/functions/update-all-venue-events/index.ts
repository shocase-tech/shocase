import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting weekly venue events update...');

    // Fetch all active venues
    const { data: venues, error: fetchError } = await supabase
      .from('venues')
      .select('id, name, address, city, state, website_url, instagram_handle, facebook_url')
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching venues:', fetchError);
      throw fetchError;
    }

    if (!venues || venues.length === 0) {
      console.log('No active venues found');
      return new Response(
        JSON.stringify({ message: 'No active venues to update', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${venues.length} active venues to update`);

    let successCount = 0;
    let errorCount = 0;
    const batchSize = 10;
    const delayBetweenBatches = 5000; // 5 seconds

    // Process venues in batches to avoid rate limits
    for (let i = 0; i < venues.length; i += batchSize) {
      const batch = venues.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(venues.length / batchSize)}`);

      await Promise.all(
        batch.map(async (venue) => {
          try {
            console.log(`Fetching events for: ${venue.name}`);

            // Call the fetch-venue-events function
            const response = await fetch(
              `${supabaseUrl}/functions/v1/fetch-venue-events`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({ venue }),
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Failed to fetch events for ${venue.name}:`, errorText);
              errorCount++;
              return;
            }

            const { events } = await response.json();

            // Update the venue's weekly_events in the database
            const { error: updateError } = await supabase
              .from('venues')
              .update({
                weekly_events: events || [],
                events_last_updated: new Date().toISOString(),
              })
              .eq('id', venue.id);

            if (updateError) {
              console.error(`Error updating venue ${venue.name}:`, updateError);
              errorCount++;
            } else {
              console.log(`✓ Updated ${venue.name}: ${events?.length || 0} events`);
              successCount++;
            }
          } catch (error) {
            console.error(`Error processing venue ${venue.name}:`, error);
            errorCount++;
          }
        })
      );

      // Delay between batches (except for the last batch)
      if (i + batchSize < venues.length) {
        console.log(`Waiting ${delayBetweenBatches / 1000}s before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    const summary = {
      total: venues.length,
      successful: successCount,
      failed: errorCount,
      timestamp: new Date().toISOString(),
    };

    console.log('Update completed:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-all-venue-events:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        updated: 0
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
