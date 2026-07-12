// Supabase Edge Function: analyzes a game-update banner image with Claude vision and
// returns structured fields (title/description/category/server/date/events) for the
// admin to review before publishing. Called from admin/src/lib/aiAnalyze.ts.
//
// ANTHROPIC_API_KEY is read from a Supabase Edge Function secret (set via
// `supabase secrets set ANTHROPIC_API_KEY=...`) — it never reaches the browser bundle.
import Anthropic from 'npm:@anthropic-ai/sdk';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// Forced tool use (tool_choice pins the model to this exact tool) + strict mode gives a
// guaranteed-valid-JSON response in `tool_use.input` — no text parsing required.
const EXTRACT_UPDATE_INFO_TOOL: Anthropic.Tool = {
  name: 'extract_update_info',
  description:
    'Extract structured game-update information from a One Punch Man mobile game announcement/event banner image.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Short Vietnamese title for this update/announcement, based on the text visible in the banner.',
      },
      description: {
        type: 'string',
        description: '1-3 sentence Vietnamese summary of what this update or event is about.',
      },
      category: {
        type: 'string',
        enum: ['Update', 'Event', 'CnNews', 'Maintenance'],
        description:
          'Update = balance/patch notes, Event = in-game event or summon banner, CnNews = news specific to the CN server, Maintenance = server maintenance notice.',
      },
      server: {
        type: 'string',
        enum: ['SEA', 'CN', 'Global', 'Unknown'],
        description:
          'Which server this applies to, based on any server label visible in the image. Use "Unknown" if not indicated.',
      },
      date: {
        type: 'string',
        description:
          'The primary date (or start date) shown in the banner, formatted as YYYY-MM-DD. Empty string if no date is visible anywhere in the image.',
      },
      events: {
        type: 'array',
        description:
          'If the banner shows a schedule/list of sub-events with date ranges, list each one here. Empty array if not applicable.',
        items: {
          type: 'object',
          properties: {
            dateRange: { type: 'string', description: 'The date range text exactly as shown, e.g. "1/7 - 4/7".' },
            title: { type: 'string', description: "The sub-event's title." },
            note: { type: 'string', description: 'Any extra detail/reward text shown alongside it. Empty string if none.' },
          },
          required: ['dateRange', 'title', 'note'],
          additionalProperties: false,
        },
      },
    },
    required: ['title', 'description', 'category', 'server', 'date', 'events'],
    additionalProperties: false,
  },
};

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let imageUrl: unknown;
  try {
    ({ imageUrl } = await req.json());
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (typeof imageUrl !== 'string' || !imageUrl) {
    return jsonResponse({ error: 'imageUrl is required' }, 400);
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      tools: [EXTRACT_UPDATE_INFO_TOOL],
      tool_choice: { type: 'tool', name: 'extract_update_info' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'url', url: imageUrl } },
            {
              type: 'text',
              text:
                'This is a banner image announcing an update or event for a One Punch Man mobile game. ' +
                'Read all text in the image (Vietnamese, Chinese, or English) and extract the fields via the ' +
                `extract_update_info tool. Today's date is ${today} — use it to resolve any date shown without a year.`,
            },
          ],
        },
      ],
    });

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );
    if (!toolUse) {
      return jsonResponse({ error: 'Model did not return structured output' }, 502);
    }

    return jsonResponse({ result: toolUse.input });
  } catch (err) {
    console.error('analyze-update-image failed:', err);
    return jsonResponse({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});
