import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // Busca todos os eventos no banco de dados
        const eventos = await prisma.evento.findMany({
            orderBy: {
                dataInicio: 'desc' // Ordena por data de início, mais recentes primeiro
            }
        });

        // Retorna os eventos como resposta
        return NextResponse.json(eventos);
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar eventos' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validação básica
        if (!body.nome || !body.dataInicio || !body.dataFim || !body.status) {
            return NextResponse.json(
                { error: 'Dados incompletos. Nome, datas e status são obrigatórios.' },
                { status: 400 }
            );
        }

        // Criar o evento no banco de dados
        const novoEvento = await prisma.evento.create({
            data: {
                nome: body.nome,
                dataInicio: new Date(body.dataInicio),
                dataFim: new Date(body.dataFim),
                descricao: body.descricao || null,
                status: body.status
            }
        });

        return NextResponse.json(novoEvento, { status: 201 });
    } catch (error) {
        console.error('Erro ao criar evento:', error);
        return NextResponse.json(
            { error: 'Erro ao criar evento' },
            { status: 500 }
        );
    }
} 