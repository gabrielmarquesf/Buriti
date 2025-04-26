'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { ModoOperacao, getModoOperacao, getEventoSelecionado, isCaixa, setEventoSelecionado } from '@/lib/db';

interface Evento {
    id: string;
    nome: string;
    dataInicio: Date;
    dataFim: Date;
    status: string;
}

interface Produto {
    id: string;
    nome: string;
    preco: number;
    estoque: number;
}

interface ItemCarrinho {
    id: string;
    produtoId: string;
    nome: string;
    preco: number;
    quantidade: number;
}

export default function CaixaPage() {
    const router = useRouter();

    const [eventos, setEventos] = useState<Evento[]>([]);
    const [evento, setEvento] = useState<Evento | null>(null);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
    const [formaPagamento, setFormaPagamento] = useState<string>('dinheiro');
    const [loading, setLoading] = useState(true);
    const [processando, setProcessando] = useState(false);
    const [busca, setBusca] = useState('');
    const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro', texto: string } | null>(null);
    const [selecionandoEvento, setSelecionandoEvento] = useState(false);

    useEffect(() => {
        async function verificarModoECarregarEvento() {
            try {
                const ehCaixa = await isCaixa();
                if (!ehCaixa) {
                    router.push('/eventos');
                    return;
                }

                const eventoId = await getEventoSelecionado();
                if (!eventoId) {
                    setSelecionandoEvento(true);
                    await carregarEventos();
                    setLoading(false);
                    return;
                }

                await carregarEvento(eventoId);
                await carregarProdutos(eventoId);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao verificar modo e carregar evento:', error);
                setMensagem({
                    tipo: 'erro',
                    texto: 'Ocorreu um erro ao carregar o caixa. Tente novamente.'
                });
                setLoading(false);
            }
        }

        verificarModoECarregarEvento();
    }, [router]);

    const carregarEventos = async () => {
        try {
            const response = await fetch('/api/eventos');
            if (!response.ok) {
                throw new Error('Erro ao buscar eventos');
            }
            const data = await response.json();
            setEventos(data);
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            setMensagem({
                tipo: 'erro',
                texto: 'Não foi possível carregar a lista de eventos. Tente novamente mais tarde.'
            });
        }
    };

    const carregarEvento = async (eventoId: string) => {
        try {
            const response = await fetch(`/api/eventos/${eventoId}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar evento');
            }
            const data = await response.json();
            setEvento({
                id: data.id,
                nome: data.nome,
                dataInicio: new Date(data.dataInicio),
                dataFim: new Date(data.dataFim),
                status: data.status
            });
        } catch (error) {
            console.error('Erro ao carregar evento:', error);
            setMensagem({
                tipo: 'erro',
                texto: 'Não foi possível carregar os dados do evento. Tente novamente mais tarde.'
            });
            setEvento(null);
        }
    };

    const carregarProdutos = async (eventoId: string) => {
        try {
            const response = await fetch(`/api/eventos/${eventoId}/produtos`);
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos do evento');
            }
            const data = await response.json();

            const produtosFormatados = data.map((p: any) => ({
                id: p.id,
                nome: p.nomeProduto,
                preco: p.preco,
                estoque: p.estoque
            }));

            setProdutos(produtosFormatados);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            setMensagem({
                tipo: 'erro',
                texto: 'Não foi possível carregar os produtos. Tente novamente mais tarde.'
            });
            setProdutos([]);
        }
    };

    const selecionarEvento = async (eventoId: string) => {
        try {
            await setEventoSelecionado(eventoId);
            await carregarEvento(eventoId);
            await carregarProdutos(eventoId);
            setSelecionandoEvento(false);
        } catch (error) {
            console.error('Erro ao selecionar evento:', error);
            setMensagem({
                tipo: 'erro',
                texto: 'Não foi possível selecionar o evento. Tente novamente.'
            });
        }
    };

    const adicionarAoCarrinho = (produto: Produto) => {
        if (produto.estoque <= 0) return;

        const itemExistente = carrinho.find(item => item.produtoId === produto.id);

        if (itemExistente) {
            atualizarQuantidade(itemExistente.id, itemExistente.quantidade + 1);
        } else {
            const novoItem: ItemCarrinho = {
                id: crypto.randomUUID(),
                produtoId: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: 1
            };
            setCarrinho([...carrinho, novoItem]);
        }
    };

    const removerDoCarrinho = (id: string) => {
        setCarrinho(carrinho.filter(item => item.id !== id));
    };

    const atualizarQuantidade = (id: string, quantidade: number) => {
        if (quantidade <= 0) {
            removerDoCarrinho(id);
            return;
        }

        setCarrinho(carrinho.map(item => {
            if (item.id === id) {
                const produto = produtos.find(p => p.id === item.produtoId);
                if (produto && quantidade > produto.estoque) {
                    setMensagem({
                        tipo: 'erro',
                        texto: `Estoque disponível: ${produto.estoque} unidades`
                    });
                    setTimeout(() => {
                        setMensagem(null);
                    }, 3000);
                    return { ...item, quantidade: produto.estoque };
                }
                return { ...item, quantidade };
            }
            return item;
        }));
    };

    const calcularTotal = () => {
        return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    };

    const imprimirCupom = async (venda: any) => {
        try {
            const response = await fetch('http://localhost:8338/print', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ venda }),
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Erro ao imprimir cupom:', error);
            setMensagem({ tipo: 'erro', texto: 'Erro ao imprimir cupom. Verifique se o serviço de impressão está rodando.' });
        }
    };

    const finalizarVenda = async () => {
        if (processando) return;
        if (!formaPagamento) {
            setMensagem({ tipo: 'erro', texto: 'Selecione uma forma de pagamento' });
            return;
        }
        if (carrinho.length === 0) {
            setMensagem({ tipo: 'erro', texto: 'Adicione produtos ao carrinho' });
            return;
        }

        setProcessando(true);
        try {
            const response = await fetch('/api/vendas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventoId: evento?.id,
                    formaPagamento,
                    itens: carrinho.map(item => ({
                        produtoEventoId: item.produtoId,
                        quantidade: item.quantidade
                    }))
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao finalizar venda');
            }

            const vendaFinalizada = await response.json();

            // Imprimir cupom
            await imprimirCupom({
                evento: {
                    nome: evento?.nome
                },
                itens: carrinho.map(item => ({
                    produto: {
                        nome: item.nome
                    },
                    quantidade: item.quantidade,
                    valor: item.preco
                })),
                valorTotal: calcularTotal(),
                formaPagamento
            });

            // Recarregar produtos para atualizar o estoque
            if (evento) {
                await carregarProdutos(evento.id);
            }

            setCarrinho([]);
            setFormaPagamento('dinheiro');
            setMensagem({ tipo: 'sucesso', texto: 'Venda finalizada com sucesso!' });
        } catch (error) {
            console.error('Erro:', error);
            setMensagem({ tipo: 'erro', texto: error instanceof Error ? error.message : 'Erro ao finalizar venda' });
        } finally {
            setProcessando(false);
        }
    };

    const produtosFiltrados = busca.trim() === ''
        ? produtos
        : produtos.filter(produto =>
            produto.nome.toLowerCase().includes(busca.toLowerCase())
        );

    const formatarMoeda = (valor: number) => {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
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

    if (selecionandoEvento) {
        return (
            <MainLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Selecione o Evento
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Escolha o evento para o qual deseja realizar vendas
                            </p>
                        </div>
                        <div className="border-t border-gray-200">
                            <ul className="divide-y divide-gray-200">
                                {eventos.map((evento) => (
                                    <li key={evento.id}>
                                        <button
                                            onClick={() => selecionarEvento(evento.id)}
                                            className="block w-full px-4 py-4 hover:bg-gray-50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <p className="text-lg font-medium text-indigo-600 truncate">
                                                        {evento.nome}
                                                    </p>
                                                </div>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {evento.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        Início: {new Date(evento.dataInicio).toLocaleString()}
                                                    </p>
                                                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                        Fim: {new Date(evento.dataFim).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
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
                            <h1 className="text-2xl font-bold text-gray-900">Caixa</h1>
                            {evento && (
                                <p className="text-gray-500 mt-1">
                                    Evento: {evento.nome}
                                </p>
                            )}
                        </div>
                    </div>

                    {mensagem && (
                        <div className={`mb-4 p-4 rounded-md ${mensagem.tipo === 'sucesso' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {mensagem.texto}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lista de produtos */}
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-medium text-gray-900">Produtos</h2>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={busca}
                                                onChange={(e) => setBusca(e.target.value)}
                                                placeholder="Buscar produto..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    {produtosFiltrados.length === 0 ? (
                                        <div className="col-span-full text-center py-4 text-gray-500">
                                            Nenhum produto encontrado.
                                        </div>
                                    ) : (
                                        produtosFiltrados.map((produto) => (
                                            <div
                                                key={produto.id}
                                                className={`${produto.estoque <= 0
                                                    ? 'bg-red-50 opacity-75 cursor-not-allowed'
                                                    : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                                                    } rounded-lg p-4 relative`}
                                                onClick={() => adicionarAoCarrinho(produto)}
                                            >
                                                <h3 className="text-md font-medium text-gray-900">{produto.nome}</h3>
                                                <p className={`text-sm ${produto.estoque <= 0 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                                    {produto.estoque <= 0 ? 'Sem estoque' : `Estoque: ${produto.estoque}`}
                                                </p>
                                                <p className="text-indigo-600 font-bold mt-2">{formatarMoeda(produto.preco)}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Carrinho */}
                        <div>
                            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h2 className="text-lg font-medium text-gray-900">Carrinho</h2>
                                </div>
                                <div className="p-4">
                                    {carrinho.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">
                                            Carrinho vazio.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {carrinho.map(item => (
                                                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-900">{item.nome}</h3>
                                                        <p className="text-gray-500 text-xs">{formatarMoeda(item.preco)} x {item.quantidade}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-gray-700">{item.quantidade}</span>
                                                        <button
                                                            onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            onClick={() => removerDoCarrinho(item.id)}
                                                            className="ml-2 text-red-500 hover:text-red-700"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <div className="flex justify-between items-center font-bold text-lg mb-4">
                                            <span>Total:</span>
                                            <span>{formatarMoeda(calcularTotal())}</span>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Forma de Pagamento
                                            </label>
                                            <select
                                                value={formaPagamento}
                                                onChange={(e) => setFormaPagamento(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="dinheiro">Dinheiro</option>
                                                <option value="cartao">Cartão</option>
                                                <option value="pix">PIX</option>
                                            </select>
                                        </div>

                                        <button
                                            onClick={finalizarVenda}
                                            disabled={processando || carrinho.length === 0}
                                            className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                        >
                                            {processando ? 'Processando...' : 'Finalizar Venda'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}