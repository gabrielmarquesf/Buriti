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

export default function NovoProdutoPage() {
    const router = useRouter();
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        categoriaId: ''
    });

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvando(true);
        setErro(null);

        try {
            const response = await fetch('/api/produtos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar produto');
            }

            // Redirecionar para a página de produtos
            router.push('/produtos');
        } catch (error: any) {
            console.error('Erro ao salvar produto:', error);
            setErro(error.message || 'Erro ao criar produto');
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
                        <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
                        <Link
                            href="/produtos"
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

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="px-4 py-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                                            Nome do Produto
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
                                        <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700">
                                            Categoria
                                        </label>
                                        <select
                                            name="categoriaId"
                                            id="categoriaId"
                                            value={formData.categoriaId}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Selecione uma categoria</option>
                                            {categorias.map((categoria) => (
                                                <option key={categoria.id} value={categoria.id}>
                                                    {categoria.nome}
                                                </option>
                                            ))}
                                        </select>
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
                </div>
            </div>
        </MainLayout>
    );
} 