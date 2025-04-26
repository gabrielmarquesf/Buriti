import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Listar todos os produtos
export async function GET() {
    try {
        const produtos = await prisma.produto.findMany({
            include: {
                categoria: true
            },
            orderBy: {
                nome: 'asc'
            }
        });

        return NextResponse.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar produtos' },
            { status: 500 }
        );
    }
}

// Criar um novo produto
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validação básica
        if (!body.nome || !body.categoriaId) {
            return NextResponse.json(
                { error: 'Dados incompletos. Nome e categoria são obrigatórios.' },
                { status: 400 }
            );
        }

        // Criar o produto no banco de dados
        const novoProduto = await prisma.produto.create({
            data: {
                nome: body.nome,
                descricao: body.descricao,
                categoriaId: body.categoriaId
            },
            include: {
                categoria: true
            }
        });

        return NextResponse.json(novoProduto, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        return NextResponse.json(
            { error: 'Erro ao criar produto' },
            { status: 500 }
        );
    }
} 