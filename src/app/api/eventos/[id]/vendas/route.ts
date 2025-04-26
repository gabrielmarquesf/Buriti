import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// API para buscar vendas de um evento específico
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Usar params.id de forma segura
        const { id } = params;
        const eventoId = id;

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // Busca as vendas do evento no banco de dados, limitando pela quantidade solicitada
        const vendas = await prisma.venda.findMany({
            where: {
                eventoId,
                status: 'concluida' // Apenas vendas concluídas
            },
            orderBy: {
                dataHora: 'desc' // Mais recentes primeiro
            },
            take: limit
        });

        // Calcula o valor total de todas as vendas do evento
        const totalVendas = await prisma.venda.aggregate({
            where: {
                eventoId,
                status: 'concluida'
            },
            _sum: {
                valorTotal: true
            },
            _count: {
                id: true
            }
        });

        // Calcula o total de itens vendidos
        const totalItens = await prisma.vendaItem.aggregate({
            where: {
                venda: {
                    eventoId,
                    status: 'concluida'
                }
            },
            _sum: {
                quantidade: true
            }
        });

        // Busca o breakdown de produtos vendidos
        const produtosVendidos = await prisma.vendaItem.groupBy({
            by: ['produtoEventoId'],
            where: {
                venda: {
                    eventoId,
                    status: 'concluida'
                }
            },
            _sum: {
                quantidade: true,
                precoUnitario: true
            }
        });

        // Busca os detalhes dos produtos
        const produtosDetalhados = await Promise.all(
            produtosVendidos.map(async (item) => {
                const produtoEvento = await prisma.produtoEvento.findUnique({
                    where: { id: item.produtoEventoId },
                    include: {
                        produto: true
                    }
                });
                return {
                    nome: produtoEvento?.produto.nome || 'Produto não encontrado',
                    quantidade: item._sum.quantidade || 0,
                    valorTotal: (item._sum.quantidade || 0) * (item._sum.precoUnitario || 0)
                };
            })
        );

        // Ordena os produtos por valor total (do maior para o menor)
        produtosDetalhados.sort((a, b) => b.valorTotal - a.valorTotal);

        // Retorna as vendas e os totais
        return NextResponse.json({
            vendas,
            totalValor: totalVendas._sum.valorTotal || 0,
            totalVendas: totalVendas._count.id || 0,
            totalItens: totalItens._sum.quantidade || 0,
            produtosVendidos: produtosDetalhados
        });
    } catch (error) {
        console.error('Erro ao buscar vendas do evento:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar vendas do evento' },
            { status: 500 }
        );
    }
} 