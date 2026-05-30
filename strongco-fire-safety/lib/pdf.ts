import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FserFormValues } from './schema';

function decodeBase64Image(dataUrl: string) {
  const matches = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) return null;
  return Buffer.from(matches[2], 'base64');
}

function safeText(text: string | undefined) {
  return text?.trim() || '—';
}

export async function generateFserPdf(data: FserFormValues) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  const brandColor = rgb(0.78, 0.06, 0.18);

  const logoPath = path.join(process.cwd(), 'public', 'strongco-logo.png');
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.5);
    page.drawImage(logoImage, {
      x: 40,
      y: height - 110,
      width: logoDims.width,
      height: logoDims.height,
    });
  }

  page.drawText('Strongco Fire Safety', {
    x: 40,
    y: height - 130,
    size: 18,
    font: boldFont,
    color: brandColor,
  });

  page.drawText(`Job reference: SCFS-${Date.now()}`, {
    x: 40,
    y: height - 155,
    size: 10,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Created: ${new Date().toLocaleString('en-GB')}`, {
    x: 40,
    y: height - 170,
    size: 10,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  const drawSection = (title: string, items: Array<[string, string]>, offsetY: number) => {
    page.drawText(title, {
      x: 40,
      y: offsetY,
      size: 12,
      font: boldFont,
      color: brandColor,
    });

    let y = offsetY - 18;
    items.forEach(([label, value]) => {
      page.drawText(`${label}: ${value}`, {
        x: 40,
        y,
        size: 10,
        font,
        color: rgb(0.12, 0.12, 0.12),
      });
      y -= 14;
    });

    return y - 10;
  };

  let cursor = height - 200;

  cursor = drawSection(
    'Client details',
    [
      ['Client', data.clientName],
      ['Contact', data.clientContact],
      ['Phone', data.clientPhone],
      ['Email', data.clientEmail],
      ['Reference', safeText(data.clientReference)],
    ],
    cursor,
  );

  cursor = drawSection(
    'Site & inspection',
    [
      ['Site name', data.siteName],
      ['Address', data.siteAddress],
      ['City', data.siteCity],
      ['Postcode', data.sitePostcode],
      ['Date', data.inspectionDate],
      ['Inspector', data.inspectorName],
      ['Type', data.inspectionType],
    ],
    cursor,
  );

  cursor = drawSection(
    'Equipment reviewed',
    [
      ['Fire doors', data.fireDoors ? 'Yes' : 'No'],
      ['Extinguishers', data.extinguishers ? 'Yes' : 'No'],
      ['Detection systems', data.detectionSystems ? 'Yes' : 'No'],
      ['Emergency lighting', data.emergencyLighting ? 'Yes' : 'No'],
      ['Signage', data.signage ? 'Yes' : 'No'],
    ],
    cursor,
  );

  cursor = drawSection(
    'Action summary',
    [
      ['Remedial actions', safeText(data.remediationActions)],
      ['Additional notes', safeText(data.notes)],
    ],
    cursor,
  );

  page.drawText('Signature', {
    x: 40,
    y: cursor,
    size: 12,
    font: boldFont,
    color: brandColor,
  });

  if (data.signature) {
    const signatureImageBytes = decodeBase64Image(data.signature);
    if (signatureImageBytes) {
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      const signatureDims = signatureImage.scale(0.35);
      page.drawImage(signatureImage, {
        x: 40,
        y: cursor - 130,
        width: signatureDims.width,
        height: signatureDims.height,
      });
    }
  }

  if (data.photos?.length) {
    for (const photo of data.photos) {
      const imageBytes = decodeBase64Image(photo);
      if (!imageBytes) continue;
      const image = await pdfDoc.embedPng(imageBytes);
      const pagePhoto = pdfDoc.addPage([595, 842]);
      const photoDims = image.scale(Math.min(500 / image.width, 500 / image.height));
      pagePhoto.drawImage(image, {
        x: 40,
        y: 842 - photoDims.height - 80,
        width: photoDims.width,
        height: photoDims.height,
      });
      pagePhoto.drawText('Photograph', {
        x: 40,
        y: 842 - photoDims.height - 100,
        size: 12,
        font: boldFont,
        color: brandColor,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
