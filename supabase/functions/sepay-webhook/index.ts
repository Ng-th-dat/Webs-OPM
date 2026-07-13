// Supabase Edge Function: receives SePay's transaction webhook for the linked MBBank
// account and auto-credits a pending phiếu top-up when the transfer content/amount
// match, via auto_approve_phieu_topup() (see supabase/migrations/0017_sepay_auto_topup.sql).
// Any transfer the webhook can't match stays 'pending' for the existing admin
// approve/reject fallback (admin/src/pages/TopupsPage.tsx / TopupDetailPage.tsx).
//
// SEPAY_WEBHOOK_API_KEY is a Supabase Edge Function secret (`supabase secrets set
// SEPAY_WEBHOOK_API_KEY=...`), matched against SePay's configured Authorization header
// — it never reaches the browser bundle. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are
// auto-injected into every Edge Function; the service-role client bypasses RLS, which
// is what lets this function call auto_approve_phieu_topup() (granted to `service_role`
// only) without any user session.
//
// Deploy with `supabase functions deploy sepay-webhook --no-verify-jwt` — SePay calls
// this server-to-server with no Supabase-issued JWT, unlike analyze-update-image which
// is invoked from the browser via supabase.functions.invoke(...).
import { createClient } from 'npm:@supabase/supabase-js@2';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const TRANSFER_CODE_PATTERN = /NAPPHIEU([0-9A-F]{8})/;

interface SepayWebhookPayload {
  id?: number | string;
  content?: string;
  transferType?: string;
  transferAmount?: number | string;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  const expectedKey = Deno.env.get('SEPAY_WEBHOOK_API_KEY');
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!expectedKey || !authHeader.includes(expectedKey)) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  let payload: SepayWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    console.error('sepay-webhook: invalid JSON body');
    return jsonResponse({ success: true });
  }

  if (payload.transferType !== 'in') {
    return jsonResponse({ success: true });
  }

  const content = String(payload.content ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const match = content.match(TRANSFER_CODE_PATTERN);
  if (!match) {
    console.log('sepay-webhook: no transfer code found in content', payload.content);
    return jsonResponse({ success: true });
  }

  const transferCode = match[1];
  const amountVnd = Math.trunc(Number(payload.transferAmount));
  const sepayTransactionId = String(payload.id ?? '');

  if (!sepayTransactionId || !Number.isFinite(amountVnd)) {
    console.error('sepay-webhook: missing id or invalid transferAmount', payload);
    return jsonResponse({ success: true });
  }

  const { data, error } = await supabase
    .rpc('auto_approve_phieu_topup', {
      p_sepay_transaction_id: sepayTransactionId,
      p_transfer_code: transferCode,
      p_amount_vnd: amountVnd,
    })
    .single();

  if (error) {
    console.error('sepay-webhook: auto_approve_phieu_topup failed', error);
    return jsonResponse({ success: true });
  }

  console.log('sepay-webhook: reconciliation result', data);
  return jsonResponse({ success: true });
});
