'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

// Interfaces para tipagem
interface Produto {
    id: string;
    nome: string;
    descricao: string | null;
    categoria: string;
}

interface ItemVenda {
    id: string;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
    produto: Produto;
}

interface Venda {
    id: string;
    dataHora: Date;
    valorTotal: number;
    formaPagamento: string;
    status: string;
    evento: {
        id: string;
        nome: string;
    };
    itens: ItemVenda[];
    createdAt: Date;
    updatedAt: Date;
}

export default function VendaDetalhesPage() {
    const params = useParams();
    const router = useRouter();
    const [venda, setVenda] = useState<Venda | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        if (params.id && params.vendaId) {
            carregarVenda(params.vendaId as string);
        }
    }, [params.id, params.vendaId]);

    // Função para carregar os detalhes da venda
    const carregarVenda = async (vendaId: string) => {
        try {
            setLoading(true);
            setErro(null);

            // Busca do banco de dados via API
            const response = await fetch(`/api/vendas/${vendaId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao buscar detalhes da venda');
            }

            const data = await response.json();

            // Formata as datas
            const vendaFormatada = {
                ...data,
                dataHora: new Date(data.dataHora),
                createdAt: new Date(data.createdAt),
                updatedAt: new Date(data.updatedAt)
            };

            setVenda(vendaFormatada);
        } catch (error) {
            console.error('Erro ao carregar venda:', error);
            setErro('Não foi possível carregar os detalhes da venda. Tente novamente mais tarde.');
            setVenda(null);
        } finally {
            setLoading(false);
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

    // Função para formatar valor monetário
    const formatarMoeda = (valor: number) => {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    // Função para traduzir o status da venda
    const traduzirStatus = (status: string) => {
        switch (status) {
            case 'concluida':
                return 'Concluída';
            case 'cancelada':
                return 'Cancelada';
            default:
                return status;
        }
    };

    // Função para traduzir a forma de pagamento
    const traduzirFormaPagamento = (formaPagamento: string) => {
        switch (formaPagamento) {
            case 'dinheiro':
                return 'Dinheiro';
            case 'cartao':
                return 'Cartão';
            case 'pix':
                return 'PIX';
            default:
                return formaPagamento;
        }
    };

    // Função para voltar à página anterior
    const voltarParaEvento = () => {
        router.push(`/eventos/${params.id}`);
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

    if (erro) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Erro</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{erro}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={voltarParaEvento}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Voltar para o Evento
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!venda) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">Venda não encontrada</h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>A venda solicitada não foi encontrada ou não está mais disponível.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={voltarParaEvento}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Voltar para o Evento
                        </button>
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
                            <p className="text-gray-500 mt-1">
                                Evento: {venda.evento.nome}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <button
                                onClick={voltarParaEvento}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                Voltar para o Evento
                            </button>
                        </div>
                    </div>

                    {/* Informações da Venda */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Informações da Venda
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Detalhes e status da venda.
                            </p>
                        </div>
                        <div className="border-t border-gray-200">
                            <dl>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Código da Venda
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {venda.id}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Data e Hora
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {formatarData(venda.dataHora)}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Valor Total
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-bold">
                                        {formatarMoeda(venda.valorTotal)}
                                    </dd>
                                </div>
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Forma de Pagamento
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {traduzirFormaPagamento(venda.formaPagamento)}
                                    </dd>
                                </div>
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Status
                                    </dt>
                                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${venda.status === 'concluida'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {traduzirStatus(venda.status)}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Itens da Venda */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Itens da Venda
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Produtos incluídos nesta venda.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Produto
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoria
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Preço Unit.
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Qtd
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {venda.itens.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                Nenhum item registrado para esta venda.
                                            </td>
                                        </tr>
                                    ) : (
                                        venda.itens.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {item.produto.nome}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.produto.categoria}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatarMoeda(item.precoUnitario)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.quantidade}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {formatarMoeda(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                            Total:
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {formatarMoeda(venda.valorTotal)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 