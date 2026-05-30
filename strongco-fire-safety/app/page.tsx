'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft, FileText, ImagePlus } from 'lucide-react';
import { FserFormValues, fserFormSchema, stepLabels } from '../lib/schema';
import { submitFserForm } from './actions/submitFser';
import SignaturePad from '../components/SignaturePad';

const DRAFT_KEY = 'strongco-fser-draft';

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [signatureData, setSignatureData] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, reset, setValue, formState } = useForm<FserFormValues>({
    resolver: zodResolver(fserFormSchema),
    defaultValues: {
      clientName: '',
      clientContact: '',
      clientPhone: '',
      clientEmail: '',
      clientReference: '',
      siteName: '',
      siteAddress: '',
      siteCity: '',
      sitePostcode: '',
      inspectionDate: '',
      inspectorName: '',
      inspectionType: 'Routine',
      fireDoors: false,
      extinguishers: false,
      detectionSystems: false,
      emergencyLighting: false,
      signage: false,
      remediationActions: '',
      additionalEmails: '',
      notes: '',
      signature: '',
      photos: [],
    },
  });

  const formValues = watch();

  useEffect(() => {
    const saved = window.localStorage.getItem(DRAFT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      reset(parsed);
      if (parsed.photos) setPhotoPreviews(parsed.photos);
      if (parsed.signature) setSignatureData(parsed.signature);
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((values) => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const encoded = await Promise.all(
      Array.from(files).map((file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }),
      ),
    );

    setPhotoPreviews(encoded);
    setValue('photos', encoded);
  };

  const handleSignatureChange = (dataUrl: string) => {
    setSignatureData(dataUrl);
    setValue('signature', dataUrl);
  };

  const currentStepLabel = stepLabels[activeStep];

  const isLastStep = activeStep === stepLabels.length - 1;

  const stepContent = useMemo(() => {
    switch (activeStep) {
      case 0:
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <label className="label">
              Client name
              <input type="text" {...register('clientName')} placeholder="Company or client" />
            </label>
            <label className="label">
              Contact person
              <input type="text" {...register('clientContact')} placeholder="Inspector or site contact" />
            </label>
            <label className="label">
              Phone number
              <input type="tel" {...register('clientPhone')} placeholder="+44 7700 900900" />
            </label>
            <label className="label">
              Email address
              <input type="email" {...register('clientEmail')} placeholder="contact@example.com" />
            </label>
            <label className="label md:col-span-2">
              Client reference
              <input type="text" {...register('clientReference')} placeholder="Project or contract reference" />
            </label>
          </div>
        );
      case 1:
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <label className="label">
              Site name
              <input type="text" {...register('siteName')} placeholder="Site or building name" />
            </label>
            <label className="label">
              Site address
              <input type="text" {...register('siteAddress')} placeholder="Street address" />
            </label>
            <label className="label">
              City / town
              <input type="text" {...register('siteCity')} placeholder="Town or city" />
            </label>
            <label className="label">
              Postcode
              <input type="text" {...register('sitePostcode')} placeholder="Postcode" />
            </label>
            <label className="label">
              Inspection date
              <input type="date" {...register('inspectionDate')} />
            </label>
            <label className="label">
              Inspector name
              <input type="text" {...register('inspectorName')} placeholder="Engineer name" />
            </label>
            <label className="label md:col-span-2">
              Inspection type
              <select {...register('inspectionType')}>
                <option>Routine</option>
                <option>Reactive</option>
                <option>Commissioning</option>
                <option>Other</option>
              </select>
            </label>
          </div>
        );
      case 2:
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="fieldset md:col-span-2">
              <p className="section-heading">Fire safety equipment reviewed</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['fireDoors', 'Fire doors'],
                  ['extinguishers', 'Extinguishers'],
                  ['detectionSystems', 'Detection systems'],
                  ['emergencyLighting', 'Emergency lighting'],
                  ['signage', 'Signage'],
                ].map(([field, label]) => (
                  <label key={field} className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <input type="checkbox" {...register(field as any)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="label md:col-span-2">
              Observations & remedial actions
              <textarea rows={5} {...register('remediationActions')} placeholder="Details of defects, actions required or completed." />
            </label>
            <label className="label md:col-span-2">
              Additional notes
              <textarea rows={4} {...register('notes')} placeholder="Any further comments or recommendations." />
            </label>
          </div>
        );
      case 3:
        return (
          <div className="grid gap-6">
            <label className="label">
              Upload photographs
              <input type="file" accept="image/*" multiple onChange={onFileChange} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {photoPreviews.map((src, index) => (
                <img key={index} src={src} alt={`Uploaded photo ${index + 1}`} className="h-44 w-full rounded-3xl object-cover border border-slate-200" />
              ))}
            </div>
            <div className="fieldset">
              <p className="section-heading">Engineer signature</p>
              <SignaturePad value={signatureData} onChange={handleSignatureChange} />
            </div>
            <label className="label">
              Additional email recipients
              <textarea rows={3} {...register('additionalEmails')} placeholder="Separate emails with commas or new lines." />
            </label>
          </div>
        );
      default:
        return null;
    }
  }, [activeStep, handleSubmit, onFileChange, photoPreviews, register, signatureData, setValue]);

  const onSubmit = async (values: FserFormValues) => {
    setSubmitting(true);
    setStatusType('info');
    setStatusMessage('Preparing your FSER submission...');

    try {
      const result = await submitFserForm(values);

      if (result?.success) {
        setStatusType('success');
        setStatusMessage('Submission complete. PDF generated and emailed to Strongco Fire Safety.');
        window.localStorage.removeItem(DRAFT_KEY);
        reset();
        setPhotoPreviews([]);
        setSignatureData('');
        setActiveStep(0);
      } else {
        throw new Error(result?.message || 'Submission failed.');
      }
    } catch (error) {
      setStatusType('error');
      setStatusMessage('There was a problem sending the form. Please check your data and try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const onNext = () => {
    if (activeStep < stepLabels.length - 1) {
      setActiveStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onBack = () => {
    if (activeStep > 0) setActiveStep((current) => current - 1);
  };

  return (
    <main className="bg-slate-50 pb-20 pt-8">
      <div className="container">
        <header className="mb-12 rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-strongco-red">Strongco Fire Safety</p>
              <h1 className="mt-4 text-4xl font-black text-strongco-grey sm:text-5xl">Fire Safety Equipment Report</h1>
              <p className="mt-4 max-w-2xl text-slate-600">Complete a professional FSER form, generate a branded PDF, and email it automatically to Strongco Fire Safety.</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-strongco-red/5 p-6 text-strongco-grey shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-strongco-red">Ready to submit</p>
              <p className="mt-4 text-3xl font-bold">{stepLabels.length - activeStep} steps left</p>
            </div>
          </div>
        </header>

        <section className="mb-10 rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="step-indicator">
            <span className="step-pill">Step {activeStep + 1} of {stepLabels.length}</span>
            <span className="text-sm text-slate-500">{currentStepLabel}</span>
          </div>
          <div className="grid gap-8">
            <div className="fieldset">
              <p className="section-heading">Form details</p>
              {stepContent}
            </div>

            {statusMessage ? (
              <div className={`alert ${statusType === 'success' ? 'alert-success' : statusType === 'error' ? 'alert-error' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                {statusMessage}
              </div>
            ) : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={onBack} disabled={activeStep === 0} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                <ArrowLeft size={18} /> Back
              </button>
              <div className="flex flex-col gap-3 sm:flex-row">
                {!isLastStep ? (
                  <button type="button" onClick={onNext} className="inline-flex items-center gap-2 rounded-xl bg-strongco-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a10e24]">
                    Continue <ArrowRight size={18} />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit(onSubmit)} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-strongco-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a10e24] disabled:cursor-not-allowed disabled:opacity-60">
                    {submitting ? 'Sending...' : 'Submit FSER'}
                    <FileText size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-8 shadow-soft">
            <h2 className="mb-4 text-xl font-semibold text-strongco-grey">What this form does</h2>
            <p className="text-slate-600">This form gathers the key FSER information, renders a branded PDF report, and delivers it to the Strongco Fire Safety inbox with optional extra recipients.</p>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-soft">
            <h2 className="mb-4 text-xl font-semibold text-strongco-grey">Draft saving</h2>
            <p className="text-slate-600">Your progress is saved automatically in the browser, so you can return later and continue the report.</p>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-soft">
            <h2 className="mb-4 text-xl font-semibold text-strongco-grey">PDF + email</h2>
            <p className="text-slate-600">The final submission generates a clean PDF and emails it to <strong>info.strongcompliance@gmail.com</strong> plus any extra recipients.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
