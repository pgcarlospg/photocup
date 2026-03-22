/**
 * Catch-all API proxy: forwards /api/v1/* to the FastAPI backend at localhost:5001.
 * Runs server-side inside Next.js — no CORS issues from the browser.
 */

// In Docker: BACKEND_URL=http://backend:5001 (set by docker-compose environment)
// In local dev: BACKEND_URL=http://137.116.202.64:5001 (set by .env.local)
const BACKEND = `${process.env.BACKEND_URL ?? 'http://localhost:5001'}/api/v1`;

async function proxy(req: Request): Promise<Response> {
    const url = new URL(req.url);
    // Extract the path after /api/v1/
    const path = url.pathname.replace(/^\/api\/v1\/?/, '');
    const target = `${BACKEND}/${path}${url.search}`;

    const headers = new Headers();
    // Forward relevant headers
    for (const [key, value] of req.headers.entries()) {
        if (['authorization', 'content-type', 'accept'].includes(key.toLowerCase())) {
            headers.set(key, value);
        }
    }

    const init: RequestInit = {
        method: req.method,
        headers,
    };

    // Forward body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        const ct = req.headers.get('content-type') ?? '';
        if (ct.includes('multipart/form-data') || ct.includes('application/x-www-form-urlencoded')) {
            // Stream the raw body for form data
            init.body = await req.arrayBuffer();
        } else {
            init.body = await req.text();
        }
    }

    const upstream = await fetch(target, init);

    // Return the upstream response as-is
    return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: {
            'content-type': upstream.headers.get('content-type') ?? 'application/json',
        },
    });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
