// /proxy.ts
import { validateSlug } from "@/services/auth";
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
const PUBLIC_ROUTES = [
    '/',
    '/register',
    '/verify-email',
    '/forgot-password',
]

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const token = request.cookies.get('access_token')?.value ?? undefined

    // Verificar si es ruta de login (/:subdominio/login)
    const pathSegments = pathname.split('/').filter(Boolean)
    const isLoginRoute = pathSegments.length === 2 && pathSegments[1] === 'login'
    const isForgotPasswordRoute = pathSegments.length === 2 && pathSegments[1] === 'forgot-password'
    const isResetPasswordRoute = pathSegments.length === 2 && pathSegments[1] === 'reset-password'

    const isPublic = PUBLIC_ROUTES.includes(pathname) || isLoginRoute || isForgotPasswordRoute || isResetPasswordRoute

    // Usuario no autenticado en ruta protegida
    if (!token && !isPublic) {
        return NextResponse.redirect(new URL(`/${pathSegments[0]}/login`, request.url))
    }

    // Usuario autenticado intentando ir a register
    if (token && pathname === '/register') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Usuario autenticado intentando ir a login de cualquier subdominio
    if (token && isLoginRoute) {
        const domain = pathSegments[0]
        return NextResponse.redirect(new URL(`/${domain}`, request.url))
    }

    // Validar slug real para rutas protegidas con subdominio
    const domain = pathSegments[0]

    if (domain && !isPublic) {
        const isValidatingSlug = await validateSlug(domain, token);

        if (!isValidatingSlug) {
            return NextResponse.redirect(new URL('/404', request.url))
        }
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