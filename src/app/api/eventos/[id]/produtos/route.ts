import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// API para buscar produtos de um evento específico
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const eventoId = params.id;

        // Buscar produtos do evento
        const produtosEvento = await prisma.produtoEvento.findMany({
            where: {
                eventoId: eventoId
            },
            include: {
                produto: {
                    include: {
                        categoria: true
                    }
                }
            },
            orderBy: {
                produto: {
                    nome: 'asc'
                }
            }
        });

        // Formatar os dados para o frontend
        const produtosFormatados = produtosEvento.map(pe => ({
            id: pe.id,
            produtoId: pe.produtoId,
            eventoId: pe.eventoId,
            preco: pe.preco,
            estoque: pe.estoque,
            nomeProduto: pe.produto.nome,
            descricaoProduto: pe.produto.descricao,
            categoriaNome: pe.produto.categoria.nome
        }));

        return NextResponse.json(produtosFormatados);
    } catch (error) {
        console.error('Erro ao buscar produtos do evento:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar produtos do evento' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const eventoId = params.id;
        const body = await request.json();

        // Validação básica
        if (!body.produtoId || body.preco === undefined) {
            return NextResponse.json(
                { error: 'Dados incompletos. ID do produto e preço são obrigatórios.' },
                { status: 400 }
            );
        }

        // Verificar se o evento existe
        const evento = await prisma.evento.findUnique({
            where: { id: eventoId }
        });

        if (!evento) {
            return NextResponse.json(
                { error: 'Evento não encontrado' },
                { status: 404 }
            );
        }

        // Verificar se o produto existe
        const produto = await prisma.produto.findUnique({
            where: { id: body.produtoId }
        });

        if (!produto) {
            return NextResponse.json(
                { error: 'Produto não encontrado' },
                { status: 404 }
            );
        }

        // Verificar se o produto já está associado ao evento
        const produtoEventoExistente = await prisma.produtoEvento.findUnique({
            where: {
                produtoId_eventoId: {
                    produtoId: body.produtoId,
                    eventoId: eventoId
                }
            }
        });

        if (produtoEventoExistente) {
            // Atualizar o produto do evento existente
            const produtoEventoAtualizado = await prisma.produtoEvento.update({
                where: {
                    id: produtoEventoExistente.id
                },
                data: {
                    preco: body.preco,
                    estoque: body.estoque
                },
                include: {
                    produto: {
                        include: {
                            categoria: true
                        }
                    }
                }
            });

            return NextResponse.json({
                ...produtoEventoAtualizado,
                nomeProduto: produtoEventoAtualizado.produto.nome,
                descricaoProduto: produtoEventoAtualizado.produto.descricao,
                categoriaNome: produtoEventoAtualizado.produto.categoria.nome
            }, { status: 200 });
        }

        // Criar o produto no evento
        const produtoEvento = await prisma.produtoEvento.create({
            data: {
                produtoId: body.produtoId,
                eventoId: eventoId,
                preco: body.preco,
                estoque: body.estoque || 0
            },
            include: {
                produto: {
                    include: {
                        categoria: true
                    }
                }
            }
        });

        return NextResponse.json({
            ...produtoEvento,
            nomeProduto: produtoEvento.produto.nome,
            descricaoProduto: produtoEvento.produto.descricao,
            categoriaNome: produtoEvento.produto.categoria.nome
        }, { status: 201 });
    } catch (error) {
        console.error('Erro ao associar produto ao evento:', error);
        return NextResponse.json(
            { error: 'Erro ao associar produto ao evento' },
            { status: 500 }
        );
    }
} 