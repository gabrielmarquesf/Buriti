import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// API para buscar detalhes de uma venda específica pelo ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const vendaId = params.id;

        // Buscar a venda com todos os detalhes
        const venda = await prisma.venda.findUnique({
            where: {
                id: vendaId
            },
            include: {
                evento: {
                    select: {
                        id: true,
                        nome: true
                    }
                },
                itens: {
                    include: {
                        produtoEvento: {
                            include: {
                                produto: {
                                    include: {
                                        categoria: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!venda) {
            return NextResponse.json(
                { error: 'Venda não encontrada' },
                { status: 404 }
            );
        }

        // Formatar os itens para facilitar o uso no frontend
        const itensFormatados = venda.itens.map(item => ({
            id: item.id,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            subtotal: item.quantidade * item.precoUnitario,
            produto: {
                id: item.produtoEvento.produto.id,
                nome: item.produtoEvento.produto.nome,
                descricao: item.produtoEvento.produto.descricao,
                categoria: item.produtoEvento.produto.categoria.nome
            }
        }));

        // Formatar a resposta
        const vendaFormatada = {
            id: venda.id,
            dataHora: venda.dataHora,
            valorTotal: venda.valorTotal,
            formaPagamento: venda.formaPagamento,
            status: venda.status,
            evento: {
                id: venda.evento.id,
                nome: venda.evento.nome
            },
            itens: itensFormatados,
            createdAt: venda.createdAt,
            updatedAt: venda.updatedAt
        };

        return NextResponse.json(vendaFormatada);
    } catch (error) {
        console.error('Erro ao buscar detalhes da venda:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar detalhes da venda' },
            { status: 500 }
        );
    }
} 