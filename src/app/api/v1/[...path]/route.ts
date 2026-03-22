/**
 * Catch-all API proxy: forwards /api/v1/* to the FastAPI backend.
 * Runs server-side inside Next.js — no CORS issues from the browser.
 *
 * Environment:
 *   BACKEND_URL=http://backend:5001      (Docker production, set in docker-compose)
 *   BACKEND_URL=https://app.photocup.es  (local dev, set in .env.local)
 *
 * URL construction:
 *   Browser calls  GET /api/v1/users/
 *   Proxy forwards GET http://backend:5001/api/v1/users/
 *
 * We derive the backend path from req.url (the raw request URL), which preserves
 * trailing slashes exactly as the browser sent them — important because the
 * FastAPI backend has redirect_slashes=False and defines endpoints without
 * trailing slashes (e.g. /stats), so an incorrect slash would cause a 404.
 */

const BACKEND_ORIGIN = (process.env.BACKEND_URL ?? 'http://localhost:5001').replace(/\/$/, '');

// Next.js App Router route handler signature with async params (Next.js 15+)
export async function GET(req: Request)    { return proxy(req); }
export async function POST(req: Request)   { return proxy(req); }
export async function PUT(req: Request)    { return proxy(req); }
export async function DELETE(req: Request) { return proxy(req); }
export async function PATCH(req: Request)  { return proxy(req); }

async function proxy(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Strip the /api/v1/ prefix to obtain the backend-relative path.
    // The regex captures the trailing slash after "v1" optionally so that
    // the path segment after /api/v1/ is always clean (no leading slash).
    //   /api/v1/users/        →  "users/"
    //   /api/v1/photos/stats  →  "photos/stats"
    //   /api/v1/auth/login    →  "auth/login"
    const backendPath = url.pathname.replace(/^\/api\/v1\/?/, '');
    const target = `${BACKEND_ORIGIN}/api/v1/${backendPath}${url.search}`;

    // Build forwarded headers (whitelist to avoid leaking host/cookies)
    const headers = new Headers();
    for (const [key, value] of req.headers.entries()) {
        const k = key.toLowerCase();
        if (k === 'authorization' || k === 'accept') {
            headers.set(key, value);
        }
    }

    const init: RequestInit = { method: req.method, headers };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        const ct = req.headers.get('content-type') ?? '';
        headers.set('content-type', ct);   // forward content-type for all mutations

        if (ct.includes('multipart/form-data')) {
            // Forward raw bytes so the multipart boundary in content-type stays intact.
            init.body = await req.arrayBuffer();
        } else {
            init.body = await req.text();
        }
    }

    let upstream: Response;
    try {
        upstream = await fetch(target, init);
    } catch (err) {
        console.error('[proxy] fetch error →', target, err);
        return new Response(JSON.stringify({ detail: 'Backend unreachable' }), {
            status: 502,
            headers: { 'content-type': 'application/json' },
        });
    }

    const contentType = upstream.headers.get('content-type') ?? 'application/json';
    return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: { 'content-type': contentType },
    });
}
