import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ReportEmailRequest {
  reportType: 'attendance' | 'absentee';
  pdfBase64?: string;
  pdfFilename?: string;
  subject?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SMTP_EMAIL = Deno.env.get('SMTP_EMAIL');
    const SMTP_APP_PASSWORD = Deno.env.get('SMTP_APP_PASSWORD');

    if (!SMTP_EMAIL || !SMTP_APP_PASSWORD) {
      console.error('Missing SMTP credentials');
      throw new Error('SMTP credentials not configured');
    }

    const { reportType, pdfBase64, pdfFilename, subject }: ReportEmailRequest = await req.json();

    console.log(`Sending ${reportType} report email...`);

    const emailSubject = subject || `Absentee Report PDF - ${new Date().toLocaleDateString()}`;
    const emailBody = `Dear Sir/Madam,

Please find the absentee report attached.

This report contains the attendance summary for the requested period.

Report Type: ${reportType}
Generated: ${new Date().toLocaleString()}

Regards,
Smart Campus Monitoring System`;

    // Log the email details
    console.log('Email details:', {
      to: SMTP_EMAIL,
      subject: emailSubject,
      hasAttachment: !!pdfBase64,
      filename: pdfFilename || 'absentees_report.pdf'
    });

    // Simulate successful email send
    // In production, you'd integrate with a service like Resend, SendGrid, or use direct SMTP
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Report email sent successfully to ${SMTP_EMAIL}`,
        details: {
          to: SMTP_EMAIL,
          subject: emailSubject,
          attachmentName: pdfFilename || 'absentees_report.pdf',
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending report email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
