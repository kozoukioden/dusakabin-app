import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const role = request.cookies.get('role')?.value;
    const path = request.nextUrl.pathname;

    // Public paths
    if (path === '/login') {
        if (role) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Protected paths
    if (!role) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role based access
    if (role === 'usta') {
        // Usta can only access /production and /login (implicit)
        // Explicitly block admin/accounting/orders/inventory/history
        if (!path.startsWith('/production')) {
            return NextResponse.redirect(new URL('/production', request.url));
        }
    }

    if (path.startsWith('/admin') || path.startsWith('/accounting')) {
        if (role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
