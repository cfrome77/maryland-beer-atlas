import { NextRequest, NextResponse } from 'next/server';
import { safeValidateBreweryReport } from '@/lib/validations/schemas';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const validation = safeValidateBreweryReport(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.formattedError,
          issues: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const report = validation.data;

    // Log feedback submission for audit / editorial review
    console.log('[Brewery Report Received]', {
      timestamp: new Date().toISOString(),
      breweryId: report.breweryId,
      brewerySlug: report.brewerySlug,
      breweryName: report.breweryName,
      reportType: report.reportType,
      details: report.details,
      reporterEmail: report.reporterEmail || null,
      reporterName: report.reporterName || null,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Your suggestion has been received and queued for editorial review.',
        reportId: `rpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Brewery Report Submission Error]', message);
    return NextResponse.json(
      { error: 'Failed to process feedback submission' },
      { status: 500 }
    );
  }
}
