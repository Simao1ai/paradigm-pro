import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

const FROM_EMAIL = process.env.EMAIL_FROM || "Paradigm Pro <coach@paradigmpro.app>";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const client = getResendClient();

  if (!client) {
    console.log(`[EMAIL DISABLED] To: ${opts.to} | Subject: ${opts.subject}`);
    return { success: true };
  }

  try {
    const result = await client.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Email send error:", err);
    return { success: false, error: err.message };
  }
}
