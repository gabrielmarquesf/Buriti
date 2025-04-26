'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { ModoOperacao, getModoOperacao, setEventoSelecionado, setModoOperacao } from '@/lib/db';

// Interfaces para tipagem
interface Evento {
    id: string;
    nome: string;
    dataInicio: Date;
    dataFim: Date;
    descricao: string | null;
    status: string;
}

interface ProdutoEvento {
    id: string;
    produtoId: string;
    eventoId: string;
    preco: number;
    estoque: number;
    nomeProduto?: string;
    descricaoProduto?: string;
    categoriaNome?: string;
}

interface Venda {
    id: string;
    dataHora: Date;
    valorTotal: number;
    formaPagamento: string;
    status: string;
}

interface ProdutoVendido {
    nome: string;
    quantidade: number;
    valorTotal: number;
}

export default function EventoDetalhesPage() {
    const params = useParams();
    const router = useRouter();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [produtos, setProdutos] = useState<ProdutoEvento[]>([]);
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [totalVendas, setTotalVendas] = useState(0);
    const [totalItensVendidos, setTotalItensVendidos] = useState(0);
    const [produtosVendidos, setProdutosVendidos] = useState<ProdutoVendido[]>([]);
    const [modoOperacao, setModoOperacaoState] = useState<ModoOperacao>(ModoOperacao.ADMIN);

    // Estados para controlar a visibilidade dos cards
    const [resumoVendasVisivel, setResumoVendasVisivel] = useState(false);
    const [produtosVisivel, setProdutosVisivel] = useState(false);
    const [vendasVisivel, setVendasVisivel] = useState(false);

    useEffect(() => {
        async function carregarDados() {
            try {
                // Verificar o modo de operação
                const modo = await getModoOperacao();
                setModoOperacaoState(modo);

                if (params.id) {
                    const eventoId = params.id as string;
                    await carregarEvento(eventoId);
                    await carregarProdutos(eventoId);
                    await carregarVendas(eventoId);
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setErro('Erro ao carregar dados do evento');
            } finally {
                setLoading(false);
            }
        }

        carregarDados();
    }, [params.id]);

    // Função para carregar os dados do evento
    const carregarEvento = async (eventoId: string) => {
        try {
            // Busca do banco de dados via API
            const response = await fetch(`/api/eventos/${eventoId}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar evento');
            }
            const data = await response.json();

            // Formata as datas
            const eventoFormatado = {
                ...data,
                dataInicio: new Date(data.dataInicio),
                dataFim: new Date(data.dataFim)
            };

            setEvento(eventoFormatado);
        } catch (error) {
            console.error('Erro ao carregar evento:', error);
            setErro('Erro ao carregar dados do evento');
            setEvento(null);
        }
    };

    // Função para carregar os produtos do evento
    const carregarProdutos = async (eventoId: string) => {
        try {
            // Busca do banco de dados via API
            const response = await fetch(`/api/eventos/${eventoId}/produtos`);
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos do evento');
            }
            const data = await response.json();
            setProdutos(data);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            setProdutos([]);
        }
    };

    // Função para carregar as vendas do evento
    const carregarVendas = async (eventoId: string) => {
        try {
            // Busca do banco de dados via API
            const response = await fetch(`/api/eventos/${eventoId}/vendas?limit=10`);
            if (!response.ok) {
                throw new Error('Erro ao buscar vendas do evento');
            }
            const data = await response.json();

            // Formata as datas
            const vendasFormatadas = data.vendas.map((venda: any) => ({
                ...venda,
                dataHora: new Date(venda.dataHora)
            }));

            setVendas(vendasFormatadas);
            setTotalVendas(data.totalValor || 0);
            setTotalItensVendidos(data.totalItens || 0);
            setProdutosVendidos(data.produtosVendidos || []);
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
            setVendas([]);
            setTotalVendas(0);
            setTotalItensVendidos(0);
            setProdutosVendidos([]);
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

    // Função para abrir o caixa do evento
    const abrirCaixa = async () => {
        if (!evento) return;

        try {
            // Definir o modo de operação como CAIXA
            await setModoOperacao(ModoOperacao.CAIXA, evento.id);

            // Definir o evento selecionado
            await setEventoSelecionado(evento.id);

            // Redirecionar para a página do caixa
            router.push('/caixa');
        } catch (error) {
            console.error('Erro ao abrir caixa:', error);
            alert('Erro ao abrir caixa. Tente novamente.');
        }
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

    if (erro || !evento) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Erro</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{erro || 'Evento não encontrado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/eventos"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Voltar para Eventos
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
                    {/* Cabeçalho */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{evento.nome}</h1>
                            <p className="text-gray-500 mt-1">
                                {formatarData(evento.dataInicio)} - {formatarData(evento.dataFim)}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-3">
                            <Link
                                href="/eventos"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Voltar
                            </Link>
                            {modoOperacao === ModoOperacao.ADMIN && (
                                <>
                                    <Link
                                        href={`/eventos/${evento.id}/editar`}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={abrirCaixa}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Abrir Caixa
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Descrição do Evento */}
                    {evento.descricao && (
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                            <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Descrição
                                </h3>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <p className="text-sm text-gray-500">
                                    {evento.descricao}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Resumo de Vendas */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center cursor-pointer" onClick={() => setResumoVendasVisivel(!resumoVendasVisivel)}>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Resumo de Vendas
                            </h3>
                            <button className="text-gray-400 hover:text-gray-600">
                                {resumoVendasVisivel ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {resumoVendasVisivel && (
                            <div className="border-t border-gray-200">
                                <dl>
                                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">
                                            Total de Vendas
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {formatarMoeda(totalVendas)}
                                        </dd>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">
                                            Quantidade de Itens Vendidos
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                            {totalItensVendidos}
                                        </dd>
                                    </div>
                                    <div className="bg-white px-4 py-5 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500 mb-4">
                                            Produtos Vendidos
                                        </dt>
                                        <dd className="mt-1">
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
                                                                Valor Total
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {produtosVendidos.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                                                    Nenhum produto vendido ainda.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            produtosVendidos.map((produto, index) => (
                                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {produto.nome}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {produto.quantidade}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {formatarMoeda(produto.valorTotal)}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        )}
                    </div>

                    {/* Produtos do Evento */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center cursor-pointer" onClick={() => setProdutosVisivel(!produtosVisivel)}>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Produtos
                            </h3>
                            <button className="text-gray-400 hover:text-gray-600">
                                {produtosVisivel ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {produtosVisivel && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nome
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Categoria
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Preço
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estoque
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {produtos.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    Nenhum produto cadastrado para este evento.
                                                </td>
                                            </tr>
                                        ) : (
                                            produtos.map((produto) => (
                                                <tr key={produto.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {produto.nomeProduto}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {produto.categoriaNome}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatarMoeda(produto.preco)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {produto.estoque}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Vendas do Evento */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center cursor-pointer" onClick={() => setVendasVisivel(!vendasVisivel)}>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Últimas Vendas
                            </h3>
                            <button className="text-gray-400 hover:text-gray-600">
                                {vendasVisivel ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {vendasVisivel && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Data/Hora
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Valor
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pagamento
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {vendas.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    Nenhuma venda registrada para este evento.
                                                </td>
                                            </tr>
                                        ) : (
                                            vendas.map((venda) => (
                                                <tr key={venda.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {venda.id.substring(0, 8)}...
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatarData(venda.dataHora)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatarMoeda(venda.valorTotal)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {venda.formaPagamento}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${venda.status === 'concluida'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {venda.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <Link
                                                            href={`/eventos/${evento.id}/vendas/${venda.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                        >
                                                            Detalhes
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 