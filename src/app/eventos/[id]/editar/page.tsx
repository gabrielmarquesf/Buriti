'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface Produto {
    id: string;
    nome: string;
    descricao: string | null;
    categoriaId: string;
    categoria: {
        id: string;
        nome: string;
    };
}

export default function EditarEventoPage() {
    const params = useParams();
    const router = useRouter();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [produtos, setProdutos] = useState<ProdutoEvento[]>([]);
    const [produtosDisponiveis, setProdutosDisponiveis] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        dataInicio: '',
        dataFim: '',
        descricao: '',
        status: 'ativo'
    });
    const [produtosEditados, setProdutosEditados] = useState<{ [key: string]: { preco: number, estoque: number } }>({});
    const [salvandoProdutos, setSalvandoProdutos] = useState(false);
    const [erroProdutos, setErroProdutos] = useState<string | null>(null);
    const [novoProduto, setNovoProduto] = useState({
        produtoId: '',
        preco: 0,
        estoque: 0
    });
    const [adicionandoProduto, setAdicionandoProduto] = useState(false);
    const [erroAdicionarProduto, setErroAdicionarProduto] = useState<string | null>(null);
    const [mostrarFormAdicionarProduto, setMostrarFormAdicionarProduto] = useState(false);

    useEffect(() => {
        if (params.id) {
            carregarEvento(params.id as string);
            carregarProdutos(params.id as string);
            carregarProdutosDisponiveis();
        }
    }, [params.id]);

    const carregarEvento = async (eventoId: string) => {
        setLoading(true);
        setErro(null);
        try {
            const response = await fetch(`/api/eventos/${eventoId}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar evento');
            }
            const data = await response.json();

            // Formatar as datas para o formato esperado pelo input type="datetime-local"
            const dataInicio = new Date(data.dataInicio);
            const dataFim = new Date(data.dataFim);

            const formatarDataParaInput = (data: Date) => {
                return data.toISOString().slice(0, 16);
            };

            setEvento(data);
            setFormData({
                nome: data.nome,
                dataInicio: formatarDataParaInput(dataInicio),
                dataFim: formatarDataParaInput(dataFim),
                descricao: data.descricao || '',
                status: data.status
            });
            setLoading(false);
        } catch (error) {
            console.error('Erro ao carregar evento:', error);
            setErro('Erro ao carregar dados do evento');
            setLoading(false);
        }
    };

    const carregarProdutos = async (eventoId: string) => {
        try {
            const response = await fetch(`/api/eventos/${eventoId}/produtos`);
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos do evento');
            }
            const data = await response.json();
            setProdutos(data);

            // Inicializar o estado de produtos editados
            const produtosMap: { [key: string]: { preco: number, estoque: number } } = {};
            data.forEach((produto: ProdutoEvento) => {
                produtosMap[produto.id] = {
                    preco: produto.preco,
                    estoque: produto.estoque
                };
            });
            setProdutosEditados(produtosMap);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            setErroProdutos('Erro ao carregar produtos do evento');
        }
    };

    const carregarProdutosDisponiveis = async () => {
        try {
            const response = await fetch('/api/produtos');
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos disponíveis');
            }
            const data = await response.json();
            setProdutosDisponiveis(data);
        } catch (error) {
            console.error('Erro ao carregar produtos disponíveis:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProdutoChange = (produtoId: string, field: 'preco' | 'estoque', value: number) => {
        setProdutosEditados(prev => ({
            ...prev,
            [produtoId]: {
                ...prev[produtoId],
                [field]: value
            }
        }));
    };

    const handleNovoProdutoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNovoProduto(prev => ({
            ...prev,
            [name]: name === 'produtoId' ? value : parseFloat(value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvando(true);
        setErro(null);

        try {
            const response = await fetch(`/api/eventos/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao atualizar evento');
            }

            // Redirecionar para a página de detalhes do evento
            router.push(`/eventos/${params.id}`);
        } catch (error: any) {
            console.error('Erro ao salvar evento:', error);
            setErro(error.message || 'Erro ao atualizar evento');
            setSalvando(false);
        }
    };

    const salvarProdutos = async () => {
        setSalvandoProdutos(true);
        setErroProdutos(null);

        try {
            // Verificar quais produtos foram modificados
            const produtosModificados = Object.entries(produtosEditados).filter(([produtoId, dados]) => {
                const produtoOriginal = produtos.find(p => p.id === produtoId);
                return produtoOriginal && (
                    produtoOriginal.preco !== dados.preco ||
                    produtoOriginal.estoque !== dados.estoque
                );
            });

            if (produtosModificados.length === 0) {
                setSalvandoProdutos(false);
                return;
            }

            // Atualizar cada produto modificado
            const atualizacoes = produtosModificados.map(async ([produtoId, dados]) => {
                const response = await fetch(`/api/eventos/${params.id}/produtos/${produtoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        preco: dados.preco,
                        estoque: dados.estoque
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Erro ao atualizar produto ${produtoId}`);
                }

                return await response.json();
            });

            const resultados = await Promise.all(atualizacoes);

            // Atualizar a lista de produtos com os dados atualizados
            setProdutos(prev => {
                const novoProdutos = [...prev];
                resultados.forEach(resultado => {
                    const index = novoProdutos.findIndex(p => p.id === resultado.id);
                    if (index !== -1) {
                        novoProdutos[index] = resultado;
                    }
                });
                return novoProdutos;
            });

            setSalvandoProdutos(false);
            alert('Produtos atualizados com sucesso!');
        } catch (error: any) {
            console.error('Erro ao salvar produtos:', error);
            setErroProdutos(error.message || 'Erro ao atualizar produtos');
            setSalvandoProdutos(false);
        }
    };

    const formatarMoeda = (valor: number) => {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const adicionarProduto = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdicionandoProduto(true);
        setErroAdicionarProduto(null);

        try {
            if (!novoProduto.produtoId) {
                throw new Error('Selecione um produto');
            }

            if (novoProduto.preco <= 0) {
                throw new Error('O preço deve ser maior que zero');
            }

            // Verificar se o produto já está no evento
            const produtoJaAdicionado = produtos.some(p => p.produtoId === novoProduto.produtoId);
            if (produtoJaAdicionado) {
                throw new Error('Este produto já está adicionado ao evento');
            }

            const response = await fetch(`/api/eventos/${params.id}/produtos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novoProduto),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao adicionar produto ao evento');
            }

            const produtoAdicionado = await response.json();

            // Atualizar a lista de produtos
            setProdutos(prev => [...prev, produtoAdicionado]);

            // Limpar o formulário
            setNovoProduto({
                produtoId: '',
                preco: 0,
                estoque: 0
            });

            // Inicializar o estado de produtos editados para o novo produto
            setProdutosEditados(prev => ({
                ...prev,
                [produtoAdicionado.id]: {
                    preco: produtoAdicionado.preco,
                    estoque: produtoAdicionado.estoque
                }
            }));

            setMostrarFormAdicionarProduto(false);
        } catch (error: any) {
            console.error('Erro ao adicionar produto:', error);
            setErroAdicionarProduto(error.message || 'Erro ao adicionar produto ao evento');
        } finally {
            setAdicionandoProduto(false);
        }
    };

    const excluirProduto = async (produtoId: string) => {
        if (!confirm('Tem certeza que deseja remover este produto do evento?')) {
            return;
        }

        try {
            const response = await fetch(`/api/eventos/${params.id}/produtos/${produtoId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao remover produto do evento');
            }

            // Remover o produto da lista
            setProdutos(prev => prev.filter(p => p.id !== produtoId));

            // Remover do estado de produtos editados
            setProdutosEditados(prev => {
                const newState = { ...prev };
                delete newState[produtoId];
                return newState;
            });

            alert('Produto removido com sucesso!');
        } catch (error: any) {
            console.error('Erro ao excluir produto:', error);
            alert(error.message || 'Erro ao remover produto do evento');
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

    if (erro && !evento) {
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
                                        <p>{erro}</p>
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
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Editar Evento</h1>
                        <Link
                            href={`/eventos/${params.id}`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancelar
                        </Link>
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

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <form onSubmit={handleSubmit}>
                            <div className="px-4 py-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                                            Nome do Evento
                                        </label>
                                        <input
                                            type="text"
                                            name="nome"
                                            id="nome"
                                            value={formData.nome}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700">
                                            Data de Início
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="dataInicio"
                                            id="dataInicio"
                                            value={formData.dataInicio}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700">
                                            Data de Término
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="dataFim"
                                            id="dataFim"
                                            value={formData.dataFim}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                                            Descrição
                                        </label>
                                        <textarea
                                            name="descricao"
                                            id="descricao"
                                            rows={3}
                                            value={formData.descricao}
                                            onChange={handleChange}
                                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            id="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="ativo">Ativo</option>
                                            <option value="pendente">Pendente</option>
                                            <option value="finalizado">Finalizado</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                                <button
                                    type="submit"
                                    disabled={salvando}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                                >
                                    {salvando ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Seção de produtos */}
                    <div className="mt-10">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Produtos do Evento</h2>
                            <button
                                type="button"
                                onClick={() => setMostrarFormAdicionarProduto(!mostrarFormAdicionarProduto)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {mostrarFormAdicionarProduto ? 'Cancelar' : 'Adicionar Produto'}
                            </button>
                        </div>

                        {erroProdutos && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{erroProdutos}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Formulário para adicionar novo produto */}
                        {mostrarFormAdicionarProduto && (
                            <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Adicionar Novo Produto</h3>

                                {erroAdicionarProduto && (
                                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">{erroAdicionarProduto}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={adicionarProduto} className="grid grid-cols-1 gap-y-6 sm:grid-cols-4 sm:gap-x-4">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="produtoId" className="block text-sm font-medium text-gray-700">
                                            Produto
                                        </label>
                                        <select
                                            id="produtoId"
                                            name="produtoId"
                                            value={novoProduto.produtoId}
                                            onChange={handleNovoProdutoChange}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            required
                                        >
                                            <option value="">Selecione um produto</option>
                                            {produtosDisponiveis
                                                .filter(p => !produtos.some(pe => pe.produtoId === p.id))
                                                .map(produto => (
                                                    <option key={produto.id} value={produto.id}>
                                                        {produto.nome} - {produto.categoria.nome}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="preco" className="block text-sm font-medium text-gray-700">
                                            Preço (R$)
                                        </label>
                                        <input
                                            type="number"
                                            name="preco"
                                            id="preco"
                                            min="0.01"
                                            step="0.01"
                                            value={novoProduto.preco}
                                            onChange={handleNovoProdutoChange}
                                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="estoque" className="block text-sm font-medium text-gray-700">
                                            Estoque
                                        </label>
                                        <input
                                            type="number"
                                            name="estoque"
                                            id="estoque"
                                            min="0"
                                            step="1"
                                            value={novoProduto.estoque}
                                            onChange={handleNovoProdutoChange}
                                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div className="sm:col-span-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setMostrarFormAdicionarProduto(false)}
                                            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={adicionandoProduto}
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                                        >
                                            {adicionandoProduto ? 'Adicionando...' : 'Adicionar Produto'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Lista de produtos existentes */}
                        {produtos.length === 0 ? (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            Nenhum produto adicionado a este evento. Adicione produtos para que possam ser vendidos durante o evento.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
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
                                                Preço
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estoque
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {produtos.map((produto) => (
                                            <tr key={produto.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {produto.nomeProduto}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {produto.categoriaNome}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={produtosEditados[produto.id]?.preco || produto.preco}
                                                        onChange={(e) => handleProdutoChange(produto.id, 'preco', parseFloat(e.target.value))}
                                                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={produtosEditados[produto.id]?.estoque || produto.estoque}
                                                        onChange={(e) => handleProdutoChange(produto.id, 'estoque', parseInt(e.target.value))}
                                                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        type="button"
                                                        onClick={() => excluirProduto(produto.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Remover
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="px-6 py-4 bg-gray-50 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={salvarProdutos}
                                        disabled={salvandoProdutos}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                                    >
                                        {salvandoProdutos ? 'Salvando...' : 'Salvar Alterações nos Produtos'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}