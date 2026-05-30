import nodemailer from 'nodemailer';

export async function sendFserEmail(pdfBytes: Uint8Array, recipients: string[]) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP configuration is missing. Please set SMTP_USER, SMTP_PASS, SMTP_HOST, and SMTP_PORT.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const message = {
    from: `Strongco Fire Safety <${user}>`,
    to: recipients,
    subject: 'Strongco Fire Safety – Completed FSER Form',
    text: 'A new FSER form has been submitted. PDF attached.',
    html: `<p>A new FSER form has been submitted. PDF attached.</p><p><strong>Recipients:</strong> ${recipients.join(', ')}</p>`,
    attachments: [
      {
        filename: 'strongco-fser.pdf',
        content: Buffer.from(pdfBytes),
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(message);
}
