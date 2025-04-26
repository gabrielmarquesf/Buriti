import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function withAuth(handler: Function) {
    return async (request: NextRequest) => {
        // Rotas públicas da API
        const publicRoutes = ['/api/auth/login'];
        if (publicRoutes.includes(request.nextUrl.pathname)) {
            return handler(request);
        }

        // Verificar token
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        // Validar token
        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: 'Token inválido' },
                { status: 401 }
            );
        }

        // Verificar permissões para rotas admin
        const adminRoutes = [
            '/api/eventos',
            '/api/produtos',
            '/api/categorias',
            '/api/relatorios'
        ];
        if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route)) && payload.papel !== 'admin') {
            return NextResponse.json(
                { error: 'Acesso negado' },
                { status: 403 }
            );
        }

        return handler(request);
    };
} 