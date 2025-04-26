'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

interface Categoria {
    id: string;
    nome: string;
    descricao: string | null;
}

export default function CategoriasPage() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [excluindo, setExcluindo] = useState<string | null>(null);
    const [novaCategoria, setNovaCategoria] = useState({ nome: '', descricao: '' });
    const [salvando, setSalvando] = useState(false);
    const [erroForm, setErroForm] = useState<string | null>(null);

    useEffect(() => {
        carregarCategorias();
    }, []);

    const carregarCategorias = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/categorias');
            if (!response.ok) {
                throw new Error('Erro ao buscar categorias');
            }
            const data = await response.json();
            setCategorias(data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            setErro('Erro ao carregar categorias');
            setLoading(false);
        }
    };

    const excluirCategoria = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
            return;
        }

        setExcluindo(id);
        try {
            const response = await fetch(`/api/categorias/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao excluir categoria');
            }

            // Recarregar categorias após exclusão
            carregarCategorias();
        } catch (error: any) {
            console.error('Erro ao excluir categoria:', error);
            alert(error.message || 'Erro ao excluir categoria');
        } finally {
            setExcluindo(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNovaCategoria(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!novaCategoria.nome.trim()) {
            setErroForm('O nome da categoria é obrigatório');
            return;
        }

        setSalvando(true);
        setErroForm(null);

        try {
            const response = await fetch('/api/categorias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novaCategoria),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar categoria');
            }

            // Limpar formulário e recarregar categorias
            setNovaCategoria({ nome: '', descricao: '' });
            carregarCategorias();
        } catch (error: any) {
            console.error('Erro ao salvar categoria:', error);
            setErroForm(error.message || 'Erro ao criar categoria');
        } finally {
            setSalvando(false);
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

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Categorias de Produtos</h1>
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

                    {/* Formulário para adicionar nova categoria */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Nova Categoria</h3>

                            {erroForm && (
                                <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{erroForm}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                                <div>
                                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                                        Nome da Categoria
                                    </label>
                                    <input
                                        type="text"
                                        name="nome"
                                        id="nome"
                                        value={novaCategoria.nome}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                                        Descrição (opcional)
                                    </label>
                                    <textarea
                                        name="descricao"
                                        id="descricao"
                                        rows={2}
                                        value={novaCategoria.descricao}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={salvando}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                                    >
                                        {salvando ? 'Salvando...' : 'Adicionar Categoria'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Lista de categorias */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Categorias Existentes</h3>

                            {categorias.length === 0 ? (
                                <p className="text-gray-500">Nenhuma categoria encontrada.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Nome
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Descrição
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Ações
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {categorias.map((categoria) => (
                                                <tr key={categoria.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {categoria.nome}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {categoria.descricao || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => excluirCategoria(categoria.id)}
                                                            disabled={excluindo === categoria.id}
                                                            className="text-red-600 hover:text-red-900 ml-4 disabled:text-red-300"
                                                        >
                                                            {excluindo === categoria.id ? 'Excluindo...' : 'Excluir'}
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
                </div>
            </div>
        </MainLayout>
    );
} 