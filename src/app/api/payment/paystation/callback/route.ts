import { NextRequest, NextResponse } from 'next/server';
import { verifyPayStationTransaction } from '@/app/actions/paystation';

export const dynamic = 'force-dynamic';

function getPublicOrigin(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
  }
  const host = request.headers.get('host');
  if (host && !host.includes('localhost:')) {
    const proto = request.url.startsWith('https') ? 'https' : 'http';
    return `${proto}://${host}`.replace(/\/$/, '');
  }
  return new URL(request.url).origin;
}

/**
 * Handles PayStation callback redirection (GET request from customer browser).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceNumber =
      searchParams.get('invoice_number') ||
      searchParams.get('invoice') ||
      searchParams.get('invoice_no') ||
      searchParams.get('invoiceNumber');

    const trxId =
      searchParams.get('trx_id') ||
      searchParams.get('trxId') ||
      searchParams.get('transaction_id') ||
      searchParams.get('transactionId');

    const statusParam = searchParams.get('status') || searchParams.get('trx_status') || '';

    const origin = getPublicOrigin(request);

    if (!invoiceNumber) {
      console.warn('[PayStation Callback] Missing invoice_number in GET callback');
      return NextResponse.redirect(
        new URL('/checkout/result?status=failed&message=Missing+invoice+reference', origin)
      );
    }

    console.log('[PayStation Callback GET] Invoice:', invoiceNumber, 'TrxID:', trxId, 'StatusParam:', statusParam);

    const statusLower = statusParam.toLowerCase();
    if (statusLower.includes('cancel')) {
      console.log('[PayStation Callback GET] User cancelled payment for invoice:', invoiceNumber);
      const redirectUrl = new URL('/checkout/result', origin);
      redirectUrl.searchParams.set('status', 'cancelled');
      redirectUrl.searchParams.set('invoice', invoiceNumber);
      return NextResponse.redirect(redirectUrl);
    }

    if (statusLower.includes('fail')) {
      console.log('[PayStation Callback GET] Payment failed for invoice:', invoiceNumber);
      const redirectUrl = new URL('/checkout/result', origin);
      redirectUrl.searchParams.set('status', 'failed');
      redirectUrl.searchParams.set('invoice', invoiceNumber);
      redirectUrl.searchParams.set('message', 'Payment was not completed or was declined.');
      return NextResponse.redirect(redirectUrl);
    }

    const verification = await verifyPayStationTransaction(invoiceNumber, trxId);

    if (verification.success && verification.status === 'Successful') {
      const redirectUrl = new URL('/checkout/result', origin);
      redirectUrl.searchParams.set('status', 'success');
      redirectUrl.searchParams.set('invoice', invoiceNumber);
      if (verification.trxId) redirectUrl.searchParams.set('trx_id', verification.trxId);
      if (verification.amount) redirectUrl.searchParams.set('amount', String(verification.amount));
      if (verification.transaction?.plan) redirectUrl.searchParams.set('plan', verification.transaction.plan);
      if (verification.transaction?.duration) redirectUrl.searchParams.set('duration', verification.transaction.duration);
      if (verification.transaction?.paymentCategory) redirectUrl.searchParams.set('method', verification.transaction.paymentCategory);
      if (verification.transaction?.customerEmail) redirectUrl.searchParams.set('email', verification.transaction.customerEmail);
      if (verification.transaction?.customerPhone) redirectUrl.searchParams.set('phone', verification.transaction.customerPhone);
      if (verification.transaction?.customerName) redirectUrl.searchParams.set('name', verification.transaction.customerName);

      return NextResponse.redirect(redirectUrl);
    }

    if (verification.status === 'Cancelled' || statusLower.includes('cancel')) {
      const redirectUrl = new URL('/checkout/result', origin);
      redirectUrl.searchParams.set('status', 'cancelled');
      redirectUrl.searchParams.set('invoice', invoiceNumber);
      return NextResponse.redirect(redirectUrl);
    }

    // Failed
    const redirectUrl = new URL('/checkout/result', origin);
    redirectUrl.searchParams.set('status', 'failed');
    redirectUrl.searchParams.set('invoice', invoiceNumber);
    redirectUrl.searchParams.set('message', verification.message || 'Payment was not confirmed.');
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('[PayStation Callback GET Error]', error);
    const origin = getPublicOrigin(request);
    return NextResponse.redirect(
      new URL('/checkout/result?status=failed&message=Server+error+verifying+transaction', origin)
    );
  }
}

/**
 * Handles PayStation callback redirection / IPN (POST request).
 */
export async function POST(request: NextRequest) {
  try {
    const origin = getPublicOrigin(request);
    let invoiceNumber: string | null = null;
    let trxId: string | null = null;
    let statusParam: string = '';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const body = await request.json();
        invoiceNumber = body.invoice_number || body.invoice || body.invoice_no || body.invoiceNumber;
        trxId = body.trx_id || body.trxId || body.transaction_id || body.transactionId;
        statusParam = body.status || body.trx_status || '';
      } catch (err) {
        console.error('[PayStation Callback POST] JSON parse error:', err);
      }
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData();
        invoiceNumber = (formData.get('invoice_number') || formData.get('invoice') || formData.get('invoice_no') || formData.get('invoiceNumber')) as string;
        trxId = (formData.get('trx_id') || formData.get('trxId') || formData.get('transaction_id')) as string;
        statusParam = (formData.get('status') || formData.get('trx_status') || '') as string;
      } catch (err) {
        console.error('[PayStation Callback POST] FormData error:', err);
      }
    }

    // Fallback to URL searchParams
    if (!invoiceNumber) {
      const searchParams = new URL(request.url).searchParams;
      invoiceNumber = searchParams.get('invoice_number') || searchParams.get('invoice');
      if (!trxId) trxId = searchParams.get('trx_id') || searchParams.get('trxId');
      if (!statusParam) statusParam = searchParams.get('status') || '';
    }

    if (!invoiceNumber) {
      console.warn('[PayStation Callback POST] Missing invoice_number');
      return NextResponse.redirect(
        new URL('/checkout/result?status=failed&message=Missing+invoice+reference', origin)
      );
    }

    console.log('[PayStation Callback POST] Invoice:', invoiceNumber, 'TrxID:', trxId, 'StatusParam:', statusParam);

    const statusLower = statusParam.toLowerCase();
    const acceptHeader = request.headers.get('accept') || '';
    const isBrowserRedirect = acceptHeader.includes('text/html') || !acceptHeader.includes('application/json');

    if (isBrowserRedirect && statusLower.includes('cancel')) {
      const redirectUrl = new URL('/checkout/result', origin);
      redirectUrl.searchParams.set('status', 'cancelled');
      redirectUrl.searchParams.set('invoice', invoiceNumber);
      return NextResponse.redirect(redirectUrl);
    }

    const verification = await verifyPayStationTransaction(invoiceNumber, trxId);

    // If request accepts HTML (browser redirect), redirect to result page
    if (isBrowserRedirect) {
      const redirectUrl = new URL('/checkout/result', origin);
      if (verification.success && verification.status === 'Successful') {
        redirectUrl.searchParams.set('status', 'success');
        redirectUrl.searchParams.set('invoice', invoiceNumber);
        if (verification.trxId) redirectUrl.searchParams.set('trx_id', verification.trxId);
        if (verification.amount) redirectUrl.searchParams.set('amount', String(verification.amount));
        if (verification.transaction?.plan) redirectUrl.searchParams.set('plan', verification.transaction.plan);
        if (verification.transaction?.duration) redirectUrl.searchParams.set('duration', verification.transaction.duration);
        if (verification.transaction?.paymentCategory) redirectUrl.searchParams.set('method', verification.transaction.paymentCategory);
        if (verification.transaction?.customerEmail) redirectUrl.searchParams.set('email', verification.transaction.customerEmail);
        if (verification.transaction?.customerPhone) redirectUrl.searchParams.set('phone', verification.transaction.customerPhone);
        if (verification.transaction?.customerName) redirectUrl.searchParams.set('name', verification.transaction.customerName);
      } else if (verification.status === 'Cancelled' || statusLower.includes('cancel')) {
        redirectUrl.searchParams.set('status', 'cancelled');
        redirectUrl.searchParams.set('invoice', invoiceNumber);
      } else {
        redirectUrl.searchParams.set('status', 'failed');
        redirectUrl.searchParams.set('invoice', invoiceNumber);
        redirectUrl.searchParams.set('message', verification.message || 'Payment failed.');
      }
      return NextResponse.redirect(redirectUrl);
    }

    // If pure API webhook/IPN
    return NextResponse.json({
      status: verification.status,
      success: verification.success,
      invoiceNumber,
      trxId: verification.trxId,
    });
  } catch (error: any) {
    console.error('[PayStation Callback POST Error]', error);
    const origin = getPublicOrigin(request);
    return NextResponse.redirect(
      new URL('/checkout/result?status=failed&message=Server+error+verifying+transaction', origin)
    );
  }
}
