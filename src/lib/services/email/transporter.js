import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "[Email] Missing SMTP configuration. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env"
    );
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail({ to, subject, html, cc }) {
  const transport = getTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || "Quotation";
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  const info = await transport.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    cc: cc || undefined,
    subject,
    html,
  });

  return info;
}
