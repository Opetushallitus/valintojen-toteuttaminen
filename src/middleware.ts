import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isLocalhost } from './app/lib/configuration';

export async function middleware(req: NextRequest) {
  const requestURL = new URL(req.url);
  const ticket = requestURL.searchParams.get('ticket') ?? '';

  if (ticket !== '') {
    requestURL.searchParams.delete('ticket');
    return NextResponse.redirect(requestURL);
  }

  if (!isLocalhost) {
    // If X-Forwarded-Host is not set, then don't bother with middleware.
    const forwardedHost = req.headers.get('X-Forwarded-Host');
    if (forwardedHost === null) {
      return NextResponse.next();
    }

    // Middleware starts here
    const requestedUrl = req.nextUrl.clone();
    const basePath = process.env.basePath ?? '';

    if (!requestedUrl.pathname.includes(basePath)) {
      requestedUrl.pathname = basePath + requestedUrl.pathname;
      console.log(
        `basePath not detected in request URL. Forwarding to ${requestedUrl.toString()}`,
      );
      return NextResponse.rewrite(requestedUrl);
    }
  }

  return NextResponse.next();
}
