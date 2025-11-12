/*
  Supabase Edge Function for Search Console Notifications
  
  This function notifies Google and Bing search consoles when new blog posts are published.
  It's triggered when posts are published or updated.
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface IndexingRequest {
  urls: string[];
  action: 'URL_UPDATED' | 'URL_DELETED';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { urls, action = 'URL_UPDATED' }: IndexingRequest = await req.json();

    // Get API credentials
    const { data: apiSettings } = await supabase
      .from('api_settings')
      .select('setting_name, setting_value, is_active')
      .in('setting_name', ['google_search_console_credentials', 'bing_webmaster_api_key'])
      .eq('is_active', true);

    const googleCredentials = apiSettings?.find(s => s.setting_name === 'google_search_console_credentials')?.setting_value;
    const bingApiKey = apiSettings?.find(s => s.setting_name === 'bing_webmaster_api_key')?.setting_value;

    const results = [];

    // Notify Google Search Console
    if (googleCredentials) {
      try {
        const credentials = JSON.parse(googleCredentials);
        
        for (const url of urls) {
          const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${credentials.access_token}` // This would need proper OAuth flow
            },
            body: JSON.stringify({
              url: url,
              type: action
            })
          });

          if (response.ok) {
            results.push({ url, provider: 'google', status: 'success' });
          } else {
            results.push({ url, provider: 'google', status: 'error', error: await response.text() });
          }
        }
      } catch (error) {
        results.push({ provider: 'google', status: 'error', error: 'Invalid credentials' });
      }
    }

    // Notify Bing Webmaster Tools
    if (bingApiKey) {
      try {
        for (const url of urls) {
          const response = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?apikey=${bingApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              siteUrl: 'https://veridaq.com',
              url: url
            })
          });

          if (response.ok) {
            results.push({ url, provider: 'bing', status: 'success' });
          } else {
            results.push({ url, provider: 'bing', status: 'error', error: await response.text() });
          }
        }
      } catch (error) {
        results.push({ provider: 'bing', status: 'error', error: 'API request failed' });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});