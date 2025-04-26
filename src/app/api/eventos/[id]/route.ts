import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// API para buscar um evento específico pelo ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Busca o evento no banco de dados
        const evento = await prisma.evento.findUnique({
            where: { id }
        });

        // Se o evento não for encontrado, retorna 404
        if (!evento) {
            return NextResponse.json(
                { error: 'Evento não encontrado' },
                { status: 404 }
            );
        }

        // Retorna o evento encontrado
        return NextResponse.json(evento);
    } catch (error) {
        console.error('Erro ao buscar evento:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar evento' },
            { status: 500 }
        );
    }
}

// API para atualizar um evento específico pelo ID
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();

        // Validação básica
        if (!body.nome || !body.dataInicio || !body.dataFim || !body.status) {
            return NextResponse.json(
                { error: 'Dados incompletos. Nome, datas e status são obrigatórios.' },
                { status: 400 }
            );
        }

        // Verifica se o evento existe
        const eventoExistente = await prisma.evento.findUnique({
            where: { id }
        });

        if (!eventoExistente) {
            return NextResponse.json(
                { error: 'Evento não encontrado' },
                { status: 404 }
            );
        }

        // Atualiza o evento no banco de dados
        const eventoAtualizado = await prisma.evento.update({
            where: { id },
            data: {
                nome: body.nome,
                dataInicio: new Date(body.dataInicio),
                dataFim: new Date(body.dataFim),
                descricao: body.descricao || null,
                status: body.status
            }
        });

        // Retorna o evento atualizado
        return NextResponse.json(eventoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar evento' },
            { status: 500 }
        );
    }
} 