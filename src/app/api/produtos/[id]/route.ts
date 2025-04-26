import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Buscar um produto específico
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Buscar o produto no banco de dados
        const produto = await prisma.produto.findUnique({
            where: { id },
            include: {
                categoria: true
            }
        });

        // Se o produto não for encontrado, retorna 404
        if (!produto) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            );
        }

        // Retorna o produto encontrado
        return NextResponse.json(produto);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar produto' },
            { status: 500 }
        );
    }
}

// Atualizar um produto
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();

        // Validação básica
        if (!body.nome || !body.categoriaId) {
            return NextResponse.json(
                { error: 'Dados incompletos. Nome e categoria são obrigatórios.' },
                { status: 400 }
            );
        }

        // Verificar se o produto existe
        const produtoExistente = await prisma.produto.findUnique({
            where: { id }
        });

        if (!produtoExistente) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            );
        }

        // Atualizar o produto no banco de dados
        const produtoAtualizado = await prisma.produto.update({
            where: { id },
            data: {
                nome: body.nome,
                descricao: body.descricao,
                categoriaId: body.categoriaId
            },
            include: {
                categoria: true
            }
        });

        // Retorna o produto atualizado
        return NextResponse.json(produtoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar produto' },
            { status: 500 }
        );
    }
}

// Excluir um produto
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Verificar se o produto existe
        const produtoExistente = await prisma.produto.findUnique({
            where: { id }
        });

        if (!produtoExistente) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            );
        }

        // Verificar se o produto está associado a algum evento
        const produtoEventoCount = await prisma.produtoEvento.count({
            where: {
                produtoId: id
            }
        });

        if (produtoEventoCount > 0) {
            return NextResponse.json(
                { error: 'Não é possível excluir um produto que está associado a eventos' },
                { status: 400 }
            );
        }

        // Excluir o produto do banco de dados
        await prisma.produto.delete({
            where: { id }
        });

        // Retorna sucesso
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        return NextResponse.json(
            { error: 'Erro ao excluir produto' },
            { status: 500 }
        );
    }
} 