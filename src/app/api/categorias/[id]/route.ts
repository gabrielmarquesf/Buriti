import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar uma categoria específica
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const categoria = await prisma.categoriaProduto.findUnique({
            where: {
                id: params.id
            }
        });

        if (!categoria) {
            return NextResponse.json(
                { error: 'Categoria não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(categoria);
    } catch (error) {
        console.error('Erro ao buscar categoria:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar categoria' },
            { status: 500 }
        );
    }
}

// PUT - Atualizar uma categoria
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { nome, descricao } = body;

        if (!nome) {
            return NextResponse.json(
                { error: 'Nome da categoria é obrigatório' },
                { status: 400 }
            );
        }

        // Verificar se a categoria existe
        const categoriaExistente = await prisma.categoriaProduto.findUnique({
            where: {
                id: params.id
            }
        });

        if (!categoriaExistente) {
            return NextResponse.json(
                { error: 'Categoria não encontrada' },
                { status: 404 }
            );
        }

        // Atualizar a categoria
        const categoriaAtualizada = await prisma.categoriaProduto.update({
            where: {
                id: params.id
            },
            data: {
                nome,
                descricao
            }
        });

        return NextResponse.json(categoriaAtualizada);
    } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar categoria' },
            { status: 500 }
        );
    }
}

// DELETE - Excluir uma categoria
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Verificar se a categoria existe
        const categoria = await prisma.categoriaProduto.findUnique({
            where: {
                id: params.id
            },
            include: {
                produtos: true
            }
        });

        if (!categoria) {
            return NextResponse.json(
                { error: 'Categoria não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se existem produtos associados a esta categoria
        if (categoria.produtos.length > 0) {
            return NextResponse.json(
                { error: 'Não é possível excluir uma categoria que possui produtos associados' },
                { status: 400 }
            );
        }

        // Excluir a categoria
        await prisma.categoriaProduto.delete({
            where: {
                id: params.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        return NextResponse.json(
            { error: 'Erro ao excluir categoria' },
            { status: 500 }
        );
    }
} 