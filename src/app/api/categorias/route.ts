import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Listar todas as categorias
export async function GET() {
    try {
        const categorias = await prisma.categoriaProduto.findMany({
            orderBy: {
                nome: 'asc'
            }
        });

        return NextResponse.json(categorias);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar categorias' },
            { status: 500 }
        );
    }
}

// Criar uma nova categoria
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validação básica
        if (!body.nome) {
            return NextResponse.json(
                { error: 'Nome da categoria é obrigatório' },
                { status: 400 }
            );
        }

        // Criar a categoria no banco de dados
        const novaCategoria = await prisma.categoriaProduto.create({
            data: {
                nome: body.nome,
                descricao: body.descricao
            }
        });

        return NextResponse.json(novaCategoria, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        return NextResponse.json(
            { error: 'Erro ao criar categoria' },
            { status: 500 }
        );
    }
} 