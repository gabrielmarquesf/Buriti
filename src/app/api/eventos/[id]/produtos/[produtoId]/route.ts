import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Buscar um produto específico de um evento
export async function GET(
    request: Request,
    { params }: { params: { id: string, produtoId: string } }
) {
    try {
        const eventoId = params.id;
        const produtoEventoId = params.produtoId;

        // Buscar o produto do evento
        const produtoEvento = await prisma.produtoEvento.findUnique({
            where: {
                id: produtoEventoId,
                eventoId: eventoId
            },
            include: {
                produto: {
                    include: {
                        categoria: true
                    }
                }
            }
        });

        if (!produtoEvento) {
            return NextResponse.json(
                { error: 'Produto não encontrado no evento' },
                { status: 404 }
            );
        }

        // Formatar os dados para o frontend
        const produtoFormatado = {
            id: produtoEvento.id,
            produtoId: produtoEvento.produtoId,
            eventoId: produtoEvento.eventoId,
            preco: produtoEvento.preco,
            estoque: produtoEvento.estoque,
            nomeProduto: produtoEvento.produto.nome,
            descricaoProduto: produtoEvento.produto.descricao,
            categoriaNome: produtoEvento.produto.categoria.nome
        };

        return NextResponse.json(produtoFormatado);
    } catch (error) {
        console.error('Erro ao buscar produto do evento:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar produto do evento' },
            { status: 500 }
        );
    }
}

// PUT - Atualizar um produto de um evento
export async function PUT(
    request: Request,
    { params }: { params: { id: string, produtoId: string } }
) {
    try {
        const eventoId = params.id;
        const produtoEventoId = params.produtoId;
        const body = await request.json();
        const { preco, estoque } = body;

        // Validação básica
        if (preco === undefined && estoque === undefined) {
            return NextResponse.json(
                { error: 'Dados incompletos. Preço ou estoque são obrigatórios.' },
                { status: 400 }
            );
        }

        // Verificar se o produto do evento existe
        const produtoEventoExistente = await prisma.produtoEvento.findUnique({
            where: {
                id: produtoEventoId,
                eventoId: eventoId
            }
        });

        if (!produtoEventoExistente) {
            return NextResponse.json(
                { error: 'Produto não encontrado no evento' },
                { status: 404 }
            );
        }

        // Atualizar o produto do evento
        const produtoEventoAtualizado = await prisma.produtoEvento.update({
            where: {
                id: produtoEventoId
            },
            data: {
                preco: preco !== undefined ? preco : produtoEventoExistente.preco,
                estoque: estoque !== undefined ? estoque : produtoEventoExistente.estoque
            },
            include: {
                produto: {
                    include: {
                        categoria: true
                    }
                }
            }
        });

        // Formatar os dados para o frontend
        const produtoFormatado = {
            id: produtoEventoAtualizado.id,
            produtoId: produtoEventoAtualizado.produtoId,
            eventoId: produtoEventoAtualizado.eventoId,
            preco: produtoEventoAtualizado.preco,
            estoque: produtoEventoAtualizado.estoque,
            nomeProduto: produtoEventoAtualizado.produto.nome,
            descricaoProduto: produtoEventoAtualizado.produto.descricao,
            categoriaNome: produtoEventoAtualizado.produto.categoria.nome
        };

        return NextResponse.json(produtoFormatado);
    } catch (error) {
        console.error('Erro ao atualizar produto do evento:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar produto do evento' },
            { status: 500 }
        );
    }
}

// DELETE - Remover um produto de um evento
export async function DELETE(
    request: Request,
    { params }: { params: { id: string, produtoId: string } }
) {
    try {
        const eventoId = params.id;
        const produtoEventoId = params.produtoId;

        // Verificar se o produto do evento existe
        const produtoEventoExistente = await prisma.produtoEvento.findUnique({
            where: {
                id: produtoEventoId,
                eventoId: eventoId
            }
        });

        if (!produtoEventoExistente) {
            return NextResponse.json(
                { error: 'Produto não encontrado no evento' },
                { status: 404 }
            );
        }

        // Verificar se existem vendas associadas a este produto no evento
        const vendasProduto = await prisma.vendaItem.findMany({
            where: {
                produtoEventoId: produtoEventoId
            }
        });

        if (vendasProduto.length > 0) {
            return NextResponse.json(
                { error: 'Não é possível remover um produto que já possui vendas registradas' },
                { status: 400 }
            );
        }

        // Remover o produto do evento
        await prisma.produtoEvento.delete({
            where: {
                id: produtoEventoId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao remover produto do evento:', error);
        return NextResponse.json(
            { error: 'Erro ao remover produto do evento' },
            { status: 500 }
        );
    }
} 