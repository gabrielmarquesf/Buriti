'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { isCaixa, getEventoSelecionado } from '@/lib/db';

interface Venda {
    id: string;
    dataHora: string;
    valorTotal: number;
    formaPagamento: string;
    status: string;
    itens: {
        id: string;
        quantidade: number;
        precoUnitario: number;
        nomeProduto: string;
    }[];
}

interface Evento {
    id: string;
    nome: string;
}

export default function DetalhesVendaPage() {
    const params = useParams();
    const router = useRouter();
    const [venda, setVenda] = useState<Venda | null>(null);
    const [evento, setEvento] = useState<Evento | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        async function verificarModoECarregarDados() {
            try {
                const ehCaixa = await isCaixa();
                if (!ehCaixa) {
                    router.push('/eventos');
                    return;
                }

                const eventoId = await getEventoSelecionado();
                if (!eventoId) {
                    router.push('/eventos');
                    return;
                }

                await carregarEvento(eventoId);
                await carregarVenda(params.id as string);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao verificar modo e carregar dados:', error);
                setErro('Ocorreu um erro ao carregar os dados. Tente novamente.');
                setLoading(false);
            }
        }

        verificarModoECarregarDados();
    }, [router, params.id]);

    const carregarEvento = async (eventoId: string) => {
        try {
            const response = await fetch(`/api/eventos/${eventoId}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar evento');
            }
            const data = await response.json();
            setEvento({
                id: data.id,
                nome: data.nome
            });
        } catch (error) {
            console.error('Erro ao carregar evento:', error);
            setErro('Não foi possível carregar os dados do evento.');
        }
    };

    const carregarVenda = async (vendaId: string) => {
        try {
            const response = await fetch(`/api/vendas/${vendaId}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar venda');
            }
            const data = await response.json();
            setVenda(data);
        } catch (error) {
            console.error('Erro ao carregar venda:', error);
            setErro('Não foi possível carregar os detalhes da venda.');
        }
    };

    const formatarData = (dataString: string) => {
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatarMoeda = (valor: number) => {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const formatarFormaPagamento = (forma: string) => {
        const formatos: { [key: string]: string } = {
            dinheiro: 'Dinheiro',
            cartao: 'Cartão',
            pix: 'PIX'
        };
        return formatos[forma] || forma;
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </MainLayout>
        );
    }

    if (!venda) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">Venda não encontrada.</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/vendas"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Voltar para Vendas
                            </Link>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Detalhes da Venda</h1>
                            {evento && (
                                <p className="text-gray-500 mt-1">
                                    Evento: {evento.nome}
                                </p>
                            )}
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Link
                                href="/vendas"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Voltar para Vendas
                            </Link>
                        </div>
                    </div>

                    {erro && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{erro}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Data/Hora</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatarData(venda.dataHora)}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Valor Total</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatarMoeda(venda.valorTotal)}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Forma de Pagamento</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatarFormaPagamento(venda.formaPagamento)}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${venda.status === 'concluida'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {venda.status === 'concluida' ? 'Concluída' : 'Pendente'}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        <div className="border-t border-gray-200">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Itens da Venda</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Produto
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Quantidade
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Preço Unitário
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {venda.itens.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.nomeProduto}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.quantidade}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatarMoeda(item.precoUnitario)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatarMoeda(item.quantidade * item.precoUnitario)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 