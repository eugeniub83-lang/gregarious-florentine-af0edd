import { fserFormSchema, FserFormValues } from '../../lib/schema';
import { generateFserPdf } from '../../lib/pdf';
import { sendFserEmail } from '../../lib/email';

export async function submitFserForm(values: FserFormValues) {
  'use server';

  const data = fserFormSchema.parse(values);
  const recipients = ['info.strongcompliance@gmail.com'];

  if (data.additionalEmails) {
    const extras = data.additionalEmails
      .split(/[,\n;]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    recipients.push(...extras);
  }

  const pdfBuffer = await generateFserPdf(data);

  await sendFserEmail(pdfBuffer, recipients);

  return {
    success: true,
    message: 'FSER form submitted successfully.',
  };
}
