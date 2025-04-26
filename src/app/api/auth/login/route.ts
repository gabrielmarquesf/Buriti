import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { validatePassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, senha } = await request.json();

        // Validação básica
        if (!email || !senha) {
            return NextResponse.json(
                { error: 'Email e senha são obrigatórios' },
                { status: 400 }
            );
        }

        // Buscar usuário
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 401 }
            );
        }

        // Validar senha
        const senhaValida = await validatePassword(senha, usuario.senha);
        if (!senhaValida) {
            return NextResponse.json(
                { error: 'Senha incorreta' },
                { status: 401 }
            );
        }

        // Criar payload do token
        const payload = {
            userId: usuario.id,
            email: usuario.email,
            papel: usuario.papel
        };

        // Codificar o payload em base64
        const token = Buffer.from(JSON.stringify(payload)).toString('base64');

        // Configurar cookie
        const response = NextResponse.json({
            papel: usuario.papel
        });

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 1 dia
        });

        return response;
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return NextResponse.json(
            { error: 'Erro ao fazer login' },
            { status: 500 }
        );
    }
} 