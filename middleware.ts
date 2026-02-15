import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icon.svg, apple-icon.svg
     * - Static assets (svg, png, jpg, jpeg, gif, webp, ico)
     * - API webhook routes (need raw body, no session needed)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-icon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/stripe/webhooks).*)',
  ],
};
