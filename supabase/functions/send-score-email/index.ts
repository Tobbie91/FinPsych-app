import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  to: string;
  applicantName: string;
  finpsychScore: number;
  riskBand: string;
}

const RISK_BAND_STYLES: Record<string, { label: string; color: string; bg: string; description: string }> = {
  LOW: {
    label: 'Low Risk',
    color: '#15803d',
    bg: '#dcfce7',
    description: 'Strong financial profile with excellent creditworthiness indicators.'
  },
  MODERATE: {
    label: 'Moderate Risk',
    color: '#b45309',
    bg: '#fef3c7',
    description: 'Good financial profile with some areas for improvement.'
  },
  HIGH: {
    label: 'Moderate-High Risk',
    color: '#c2410c',
    bg: '#ffedd5',
    description: 'Developing financial profile with areas for strengthening.'
  },
  VERY_HIGH: {
    label: 'High Risk',
    color: '#b91c1c',
    bg: '#fee2e2',
    description: 'Financial profile requires significant improvement.'
  },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { to, applicantName, finpsychScore, riskBand }: EmailPayload = await req.json();

    if (!to || !applicantName || finpsychScore == null || !riskBand) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, applicantName, finpsychScore, riskBand' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const risk = RISK_BAND_STYLES[riskBand] || RISK_BAND_STYLES.MODERATE;
    const score = Math.round(finpsychScore);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:32px;text-align:center;">
      <div style="display:inline-block;width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:8px;line-height:40px;color:#fff;font-weight:bold;font-size:14px;">FP</div>
      <h1 style="color:#ffffff;font-size:22px;margin:12px 0 0;">FINPSYCH</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <!-- Success Icon -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;width:60px;height:60px;background:#d1fae5;border-radius:50%;text-align:center;line-height:60px;font-size:30px;">✅</div>
      </div>

      <!-- Title -->
      <h2 style="color:#111827;font-size:24px;font-weight:bold;text-align:center;margin:0 0 12px;">Assessment Submitted! ✅</h2>

      <!-- Message -->
      <p style="color:#6b7280;font-size:15px;line-height:1.6;text-align:center;margin:0 0 24px;">
        Thank you for completing the FinPsych Assessment.<br>
        Your responses have been recorded and will be reviewed by our team.
      </p>

      <!-- Score Card -->
      <div style="background:${risk.bg};border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;border:2px solid ${risk.color};">
        <p style="color:#6b7280;font-size:13px;font-weight:500;margin:0 0 4px;">Your FinPsych Score</p>
        <p style="font-size:48px;font-weight:bold;color:#111827;margin:0 0 12px;">
          ${score}<span style="font-size:18px;color:#9ca3af;font-weight:normal;">/100</span>
        </p>
        <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 4px;">
          Risk Band: <span style="color:${risk.color};">${risk.label}</span>
        </p>
        <p style="color:#6b7280;font-size:14px;margin:8px 0 0;">${risk.description}</p>
      </div>

      <!-- What's Next -->
      <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="color:#111827;font-size:15px;font-weight:600;margin:0 0 12px;">What happens next?</p>
        <div style="margin-bottom:8px;">
          <span style="color:#0d9488;font-weight:600;">1.</span>
          <span style="color:#6b7280;font-size:14px;line-height:1.6;margin-left:8px;">Your FinPsych Score has been calculated and saved securely.</span>
        </div>
        <div style="margin-bottom:8px;">
          <span style="color:#0d9488;font-weight:600;">2.</span>
          <span style="color:#6b7280;font-size:14px;line-height:1.6;margin-left:8px;">We will review your assessment results along with your application.</span>
        </div>
        <div>
          <span style="color:#0d9488;font-weight:600;">3.</span>
          <span style="color:#6b7280;font-size:14px;line-height:1.6;margin-left:8px;">You'll hear back within 3-5 business days regarding your application status.</span>
        </div>
      </div>

      <!-- Contact Info -->
      <p style="color:#6b7280;font-size:14px;text-align:center;margin:0 0 24px;">
        If you have questions, please contact
        <a href="mailto:support@finpsych.app" style="color:#0d9488;text-decoration:none;font-weight:500;">support@finpsych.app</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #f3f4f6;padding:20px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Powered by FINPSYCH - Financial Psychology Assessment</p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'FinPsych <scores@finpsych.app>',
        to: [to],
        subject: `Your FinPsych Assessment Results - Score: ${score}/100`,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
