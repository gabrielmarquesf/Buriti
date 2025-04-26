import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ModoOperacao } from '@/lib/db';

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login'];

// Rotas que só podem ser acessadas no modo admin
const adminRoutes = [
    '/eventos/novo',
    '/eventos/[id]/editar',
    '/produtos',
    '/produtos/novo',
    '/produtos/[id]/editar',
    '/categorias',
    '/categorias/novo',
    '/categorias/[id]/editar',
    '/relatorios'
];

// Rotas que só podem ser acessadas no modo caixa
const caixaRoutes = [
    '/caixa',
    '/vendas'
];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Verifica se é uma rota pública
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Obtém o token do cookie
    const token = request.cookies.get('token');

    // Se não houver token, redireciona para o login
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Decodifica o token (que está em base64)
        const payload = JSON.parse(Buffer.from(token.value, 'base64').toString());

        // Verifica o papel do usuário
        const papel = payload.papel;
        const modo = papel === 'admin' ? ModoOperacao.ADMIN : ModoOperacao.CAIXA;

        // Verifica se o usuário tem permissão para acessar a rota
        const isAdminRoute = adminRoutes.some(route => {
            if (route.includes('[id]')) {
                const pattern = route.replace('[id]', '[^/]+');
                return new RegExp(`^${pattern}$`).test(pathname);
            }
            return route === pathname;
        });

        const isCaixaRoute = caixaRoutes.some(route => pathname === route);

        if (modo === ModoOperacao.ADMIN) {
            // Admin pode acessar todas as rotas
            return NextResponse.next();
        } else if (modo === ModoOperacao.CAIXA) {
            // Caixa só pode acessar rotas do caixa
            if (isAdminRoute) {
                return NextResponse.redirect(new URL('/caixa', request.url));
            }
            return NextResponse.next();
        }

        // Se chegou aqui, algo está errado com o token
        return NextResponse.redirect(new URL('/login', request.url));
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

// Configuração do matcher para o middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}; 