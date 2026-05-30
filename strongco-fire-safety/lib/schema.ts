import { z } from 'zod';

export const stepLabels = ['Client details', 'Site & inspection', 'Equipment & actions', 'Review & submit'];

export const fserFormSchema = z.object({
  clientName: z.string().min(2, 'Client name is required.'),
  clientContact: z.string().min(2, 'Contact person is required.'),
  clientPhone: z.string().min(7, 'Phone number is required.'),
  clientEmail: z.string().email('Valid email required.'),
  clientReference: z.string().optional(),
  siteName: z.string().min(2, 'Site name is required.'),
  siteAddress: z.string().min(5, 'Site address is required.'),
  siteCity: z.string().min(2, 'City or town is required.'),
  sitePostcode: z.string().min(4, 'Postcode is required.'),
  inspectionDate: z.string().min(1, 'Inspection date is required.'),
  inspectorName: z.string().min(2, 'Inspector name is required.'),
  inspectionType: z.enum(['Routine', 'Reactive', 'Commissioning', 'Other']),
  fireDoors: z.boolean().optional(),
  extinguishers: z.boolean().optional(),
  detectionSystems: z.boolean().optional(),
  emergencyLighting: z.boolean().optional(),
  signage: z.boolean().optional(),
  remediationActions: z.string().max(2000).optional(),
  additionalEmails: z.string().optional(),
  notes: z.string().max(2000).optional(),
  signature: z.string().min(1, 'Engineer signature is required.'),
  photos: z.array(z.string()).optional(),
});

export type FserFormValues = z.infer<typeof fserFormSchema>;
