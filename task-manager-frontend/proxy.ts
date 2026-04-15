// /proxy.ts
import { validateSlug } from "@/services/auth";
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const token = request.cookies.get('access_token')?.value ?? undefined

    const isPublic = PUBLIC_ROUTES.includes(pathname)

    // Usuario no autenticado en ruta protegida
    if (!token && !isPublic) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Usuario autenticado intentando ir a login
    if (token && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Usuario autenticado intentando ir a login
    if (token && pathname === '/register') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Validar slug real para rutas protegidas (ej: /workspace/:id)
    const domain = pathname.split('/')[1]

    const isValidatingSlug = await validateSlug(domain, token);

    if (!isValidatingSlug && !isPublic) {
        return NextResponse.redirect(new URL('/404', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Aplica a TODO excepto:
         * - API routes
         * - Archivos internos de Next (_next)
         * - Archivos estáticos (extensiones)
         * - Metadata
         */
        '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml|woff|woff2|ttf|otf|json)$).*)',
    ],
}