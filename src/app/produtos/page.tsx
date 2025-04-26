'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

interface Categoria {
    id: string;
    nome: string;
    descricao: string | null;
}

interface Produto {
    id: string;
    nome: string;
    descricao: string | null;
    categoriaId: string;
    categoria: Categoria;
}

export default function ProdutosPage() {
    const router = useRouter();
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [excluindo, setExcluindo] = useState<string | null>(null);

    useEffect(() => {
        carregarProdutos();
    }, []);

    async function carregarProdutos() {
        setLoading(true);
        setErro(null);
        try {
            // Busca os produtos da API
            const response = await fetch('/api/produtos');

            if (!response.ok) {
                throw new Error('Erro ao buscar produtos');
            }

            const data = await response.json();
            setProdutos(data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            setErro('Não foi possível carregar a lista de produtos. Tente novamente mais tarde.');
            setLoading(false);
        }
    }

    const excluirProduto = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) {
            return;
        }

        setExcluindo(id);
        try {
            const response = await fetch(`/api/produtos/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao excluir produto');
            }

            // Recarrega a lista de produtos
            await carregarProdutos();
            setExcluindo(null);
        } catch (error: any) {
            console.error('Erro ao excluir produto:', error);
            alert(error.message || 'Erro ao excluir produto');
            setExcluindo(null);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
                        <div className="flex space-x-3">
                            <Link
                                href="/produtos/novo"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Novo Produto
                            </Link>
                            <Link
                                href="/categorias"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Gerenciar Categorias
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
                                            onClick={() => carregarProdutos()}
                                            className="text-sm font-medium text-red-700 hover:text-red-600"
                                        >
                                            Tentar novamente
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : produtos.length === 0 ? (
                        <div className="bg-white shadow-md rounded-lg p-6 text-center">
                            <p className="text-gray-500 mb-4">Nenhum produto encontrado.</p>
                            <Link
                                href="/produtos/novo"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Criar Novo Produto
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
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
                                            Descrição
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {produtos.map((produto) => (
                                        <tr key={produto.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {produto.nome}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {produto.categoria.nome}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {produto.descricao || 'Sem descrição'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={`/produtos/${produto.id}/editar`}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => excluirProduto(produto.id)}
                                                    disabled={excluindo === produto.id}
                                                    className="text-red-600 hover:text-red-900 disabled:text-red-300 disabled:cursor-not-allowed"
                                                >
                                                    {excluindo === produto.id ? 'Excluindo...' : 'Excluir'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
} 