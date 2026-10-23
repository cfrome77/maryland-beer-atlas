'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Flag, X, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { BreweryReport, ReportType } from '@/lib/types';
import { safeValidateBreweryReport } from '@/lib/validations/schemas';

interface SuggestEditModalProps {
  breweryId: string;
  brewerySlug: string;
  breweryName: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  buttonText?: string;
  className?: string;
}

const REPORT_TYPE_LABELS: Record<ReportType, { label: string; description: string }> = {
  hours_change: {
    label: 'Operating Hours Change',
    description: 'Updated daily schedules, temporary holiday hours, or special event closures',
  },
  closure_notice: {
    label: 'Closure / Temporary Suspension',
    description: 'Location temporarily closed, permanently closed, or relocating',
  },
  location_or_contact_update: {
    label: 'Address, Phone or Website',
    description: 'Updated street address, phone number, social links, or website URL',
  },
  amenity_or_beer_update: {
    label: 'Amenities, Food & Beer Offerings',
    description: 'Dog policy, food trucks, outdoor seating, or specialty beer styles',
  },
  other: {
    label: 'Other Details or Corrections',
    description: 'General info, typos, staff picks, or additional location context',
  },
};

export function SuggestEditModal({
  breweryId,
  brewerySlug,
  breweryName,
  variant = 'outline',
  size = 'md',
  buttonText = 'Suggest an Edit',
  className = '',
}: SuggestEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('hours_change');
  const [details, setDetails] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLSelectElement>(null);

  const resetForm = useCallback(() => {
    setReportType('hours_change');
    setDetails('');
    setReporterName('');
    setReporterEmail('');
    setErrorMsg(null);
    setIsSuccess(false);
    setIsSubmitting(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setTimeout(resetForm, 200);
  }, [resetForm]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  // Focus management on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => firstInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: BreweryReport = {
      breweryId,
      brewerySlug,
      breweryName,
      reportType,
      details,
      reporterName: reporterName.trim() || undefined,
      reporterEmail: reporterEmail.trim() || undefined,
    };

    const validation = safeValidateBreweryReport(payload);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0]?.message || 'Please check your form entry';
      setErrorMsg(firstIssue);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.details || 'Failed to submit report. Please try again.');
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting your suggestion.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Button styling variants
  const getButtonStyles = () => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-95 cursor-pointer';

    let sz = 'px-4 py-2 text-xs';
    if (size === 'sm') sz = 'px-3 py-1.5 text-xs';
    if (size === 'lg') sz = 'px-5 py-2.5 text-sm';

    let varStyle = 'bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-sm';
    if (variant === 'outline') {
      varStyle = 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800';
    } else if (variant === 'ghost') {
      varStyle = 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10';
    } else if (variant === 'secondary') {
      varStyle = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700';
    }

    return `${base} ${sz} ${varStyle} ${className}`;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={getButtonStyles()}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Flag className="w-4 h-4 text-amber-500 shrink-0" />
        <span>{buttonText}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-report-title"
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Flag className="w-5 h-5" />
                </span>
                <div>
                  <h3
                    id="modal-report-title"
                    className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50"
                  >
                    Suggest an Edit
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Reporting update for <strong className="text-zinc-700 dark:text-zinc-300">{breweryName}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 md:p-6">
              {isSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      Suggestion Received!
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                      Thank you for helping keep the Maryland Beer Atlas accurate! Our editors will review your update shortly.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-rose-900 dark:text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Report Category */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="report-type-select"
                      className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
                    >
                      Category of Update <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="report-type-select"
                      ref={firstInputRef}
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as ReportType)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      required
                    >
                      {Object.entries(REPORT_TYPE_LABELS).map(([key, { label }]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {REPORT_TYPE_LABELS[reportType]?.description}
                    </p>
                  </div>

                  {/* Details text */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="report-details"
                      className="block text-xs font-bold text-zinc-800 dark:text-zinc-200"
                    >
                      Details or Correct Information <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="report-details"
                      rows={4}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="e.g., Open 2 PM - 9 PM on Fridays starting June 1st. See official Instagram post."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                      required
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Minimum 5 characters</span>
                      <span>{details.length}/1000</span>
                    </div>
                  </div>

                  {/* Optional reporter info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label
                        htmlFor="reporter-name"
                        className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                      >
                        Your Name <span className="text-zinc-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="reporter-name"
                        type="text"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder="Hop Fan"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="reporter-email"
                        className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                      >
                        Your Email <span className="text-zinc-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="reporter-email"
                        type="email"
                        value={reporterEmail}
                        onChange={(e) => setReporterEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || details.trim().length < 5}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold transition-all disabled:opacity-50 disabled:hover:bg-amber-500"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Suggestion</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
