'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

interface Evento {
    id: string;
    nome: string;
    dataInicio: Date;
    dataFim: Date;
    descricao: string | null;
    status: string;
}

export default function EventosPage() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [criandoEvento, setCriandoEvento] = useState(false);

    useEffect(() => {
        carregarEventos();
    }, []);

    async function carregarEventos() {
        setLoading(true);
        setErro(null);
        try {
            // Busca os eventos da API
            const response = await fetch('/api/eventos');

            if (!response.ok) {
                throw new Error('Erro ao buscar eventos');
            }

            const data = await response.json();

            // Formata as datas
            const eventosFormatados = data.map((evento: any) => ({
                ...evento,
                dataInicio: new Date(evento.dataInicio),
                dataFim: new Date(evento.dataFim)
            }));

            setEventos(eventosFormatados);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            setErro('Não foi possível carregar a lista de eventos. Tente novamente mais tarde.');
            setLoading(false);
        }
    }

    // Função para criar um evento de teste
    const criarEventoTeste = async () => {
        setCriandoEvento(true);
        try {
            const novoEvento = {
                nome: "Festa Junina Casa Buriti 2024",
                dataInicio: new Date('2024-06-15T18:00:00'),
                dataFim: new Date('2024-06-15T23:00:00'),
                descricao: "Festa junina anual da Casa Buriti com comidas típicas e brincadeiras.",
                status: "ativo"
            };

            const response = await fetch('/api/eventos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novoEvento),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar evento');
            }

            // Recarrega a lista de eventos
            await carregarEventos();
            setCriandoEvento(false);
        } catch (error) {
            console.error('Erro ao criar evento de teste:', error);
            setErro('Não foi possível criar o evento de teste. Tente novamente mais tarde.');
            setCriandoEvento(false);
        }
    };

    // Função para formatar data
    const formatarData = (data: Date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(data);
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
                        <div className="flex space-x-2">
                            <button
                                onClick={criarEventoTeste}
                                disabled={criandoEvento}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                            >
                                {criandoEvento ? 'Criando...' : 'Criar Evento Teste'}
                            </button>
                            <Link
                                href="/eventos/novo"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Novo Evento
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : erro ? (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{erro}</p>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => carregarEventos()}
                                            className="text-sm font-medium text-red-700 hover:text-red-600"
                                        >
                                            Tentar novamente
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : eventos.length === 0 ? (
                        <div className="bg-white shadow-md rounded-lg p-6 text-center">
                            <p className="text-gray-500 mb-4">Nenhum evento encontrado.</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={criarEventoTeste}
                                    disabled={criandoEvento}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                                >
                                    {criandoEvento ? 'Criando...' : 'Criar Evento Teste'}
                                </button>
                                <Link
                                    href="/eventos/novo"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Criar Novo Evento
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {eventos.map((evento) => (
                                    <li key={evento.id}>
                                        <Link href={`/eventos/${evento.id}`} className="block hover:bg-gray-50">
                                            <div className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <p className="text-lg font-medium text-indigo-600 truncate">
                                                            {evento.nome}
                                                        </p>
                                                        <div className="ml-2 flex-shrink-0 flex">
                                                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${evento.status === 'ativo'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : evento.status === 'finalizado'
                                                                        ? 'bg-gray-100 text-gray-800'
                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {evento.status === 'ativo'
                                                                    ? 'Ativo'
                                                                    : evento.status === 'finalizado'
                                                                        ? 'Finalizado'
                                                                        : 'Pendente'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="ml-2 flex-shrink-0 flex">
                                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="mt-2 sm:flex sm:justify-between">
                                                    <div className="sm:flex">
                                                        <p className="flex items-center text-sm text-gray-500">
                                                            {evento.descricao ? evento.descricao.substring(0, 100) + (evento.descricao.length > 100 ? '...' : '') : 'Sem descrição'}
                                                        </p>
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                        </svg>
                                                        <p>
                                                            {formatarData(evento.dataInicio)} - {formatarData(evento.dataFim)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
} 