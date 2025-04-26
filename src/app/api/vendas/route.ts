import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Listar todas as vendas
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const eventoId = searchParams.get('eventoId');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

        // Filtros para a consulta
        const where: any = {};
        if (eventoId) {
            where.eventoId = eventoId;
        }

        // Buscar vendas com filtros
        const vendas = await prisma.venda.findMany({
            where,
            include: {
                evento: {
                    select: {
                        nome: true
                    }
                },
                itens: {
                    include: {
                        produtoEvento: {
                            include: {
                                produto: {
                                    select: {
                                        nome: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                dataHora: 'desc'
            },
            take: limit
        });

        return NextResponse.json(vendas);
    } catch (error) {
        console.error('Erro ao buscar vendas:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar vendas' },
            { status: 500 }
        );
    }
}

// Registrar uma nova venda
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validação básica
        if (!body.eventoId || !body.itens || !body.itens.length || !body.formaPagamento) {
            return NextResponse.json(
                { error: 'Dados incompletos. Evento, itens e forma de pagamento são obrigatórios.' },
                { status: 400 }
            );
        }

        // Verificar se o evento existe
        const evento = await prisma.evento.findUnique({
            where: { id: body.eventoId }
        });

        if (!evento) {
            return NextResponse.json(
                { error: 'Evento não encontrado' },
                { status: 404 }
            );
        }

        // Verificar se todos os produtos existem e têm estoque suficiente
        for (const item of body.itens) {
            const produtoEvento = await prisma.produtoEvento.findUnique({
                where: { id: item.produtoEventoId }
            });

            if (!produtoEvento) {
                return NextResponse.json(
                    { error: `Produto não encontrado: ${item.produtoEventoId}` },
                    { status: 404 }
                );
            }

            if (produtoEvento.estoque < item.quantidade) {
                return NextResponse.json(
                    { error: `Estoque insuficiente para o produto: ${item.produtoEventoId}` },
                    { status: 400 }
                );
            }
        }

        // Calcular o valor total da venda
        let valorTotal = 0;
        const itensComPreco = await Promise.all(body.itens.map(async (item: any) => {
            const produtoEvento = await prisma.produtoEvento.findUnique({
                where: { id: item.produtoEventoId }
            });

            const precoUnitario = produtoEvento!.preco;
            const subtotal = precoUnitario * item.quantidade;
            valorTotal += subtotal;

            return {
                ...item,
                precoUnitario
            };
        }));

        // Criar a venda no banco de dados usando uma transação
        const novaVenda = await prisma.$transaction(async (tx) => {
            // 1. Criar a venda
            const venda = await tx.venda.create({
                data: {
                    eventoId: body.eventoId,
                    valorTotal,
                    formaPagamento: body.formaPagamento,
                    status: 'concluida',
                    itens: {
                        create: itensComPreco.map((item: any) => ({
                            produtoEventoId: item.produtoEventoId,
                            quantidade: item.quantidade,
                            precoUnitario: item.precoUnitario
                        }))
                    }
                },
                include: {
                    itens: true
                }
            });

            // 2. Atualizar o estoque dos produtos
            for (const item of body.itens) {
                await tx.produtoEvento.update({
                    where: { id: item.produtoEventoId },
                    data: {
                        estoque: {
                            decrement: item.quantidade
                        }
                    }
                });
            }

            return venda;
        });

        return NextResponse.json(novaVenda, { status: 201 });
    } catch (error) {
        console.error('Erro ao registrar venda:', error);
        return NextResponse.json(
            { error: 'Erro ao registrar venda' },
            { status: 500 }
        );
    }
} 