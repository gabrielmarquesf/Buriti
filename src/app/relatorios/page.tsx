'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Evento {
    id: string;
    nome: string;
}

interface Venda {
    id: string;
    dataHora: string;
    valorTotal: number;
    formaPagamento: string;
    status: string;
}

interface ProdutoVendido {
    nome: string;
    quantidade: number;
    valorTotal: number;
}

interface DadosRelatorio {
    totalVendas: number;
    totalItens: number;
    vendasPorFormaPagamento: {
        [key: string]: number;
    };
    produtosVendidos: ProdutoVendido[];
    vendas: Venda[];
}

export default function RelatoriosPage() {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [eventoSelecionado, setEventoSelecionado] = useState<string>('');
    const [dadosRelatorio, setDadosRelatorio] = useState<DadosRelatorio | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        carregarEventos();
    }, []);

    useEffect(() => {
        if (eventoSelecionado) {
            carregarDadosRelatorio(eventoSelecionado);
        }
    }, [eventoSelecionado]);

    const carregarEventos = async () => {
        try {
            const response = await fetch('/api/eventos');
            if (!response.ok) throw new Error('Erro ao carregar eventos');
            const data = await response.json();
            setEventos(data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            setErro('Não foi possível carregar os eventos');
            setLoading(false);
        }
    };

    const carregarDadosRelatorio = async (eventoId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/eventos/${eventoId}/vendas`);
            if (!response.ok) throw new Error('Erro ao carregar dados do relatório');
            const data = await response.json();

            setDadosRelatorio({
                totalVendas: data.totalValor,
                totalItens: data.totalItens,
                vendasPorFormaPagamento: calcularVendasPorFormaPagamento(data.vendas),
                produtosVendidos: data.produtosVendidos,
                vendas: data.vendas
            });
        } catch (error) {
            console.error('Erro ao carregar dados do relatório:', error);
            setErro('Não foi possível carregar os dados do relatório');
        } finally {
            setLoading(false);
        }
    };

    const calcularVendasPorFormaPagamento = (vendas: Venda[]) => {
        return vendas.reduce((acc: { [key: string]: number }, venda) => {
            if (venda.status === 'concluida') {
                acc[venda.formaPagamento] = (acc[venda.formaPagamento] || 0) + venda.valorTotal;
            }
            return acc;
        }, {});
    };

    const formatarMoeda = (valor: number) => {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    const formatarData = (data: string) => {
        return new Date(data).toLocaleString('pt-BR');
    };

    const exportarParaExcel = () => {
        if (!dadosRelatorio) return;

        // Preparar dados das vendas
        const vendasData = dadosRelatorio.vendas.map(venda => ({
            ID: venda.id,
            'Data/Hora': formatarData(venda.dataHora),
            'Valor Total': formatarMoeda(venda.valorTotal),
            'Forma de Pagamento': venda.formaPagamento,
            Status: venda.status
        }));

        // Preparar dados dos produtos
        const produtosData = dadosRelatorio.produtosVendidos.map(produto => ({
            Produto: produto.nome,
            Quantidade: produto.quantidade,
            'Valor Total': formatarMoeda(produto.valorTotal)
        }));

        // Criar workbook com múltiplas planilhas
        const wb = XLSX.utils.book_new();

        // Adicionar planilha de vendas
        const wsVendas = XLSX.utils.json_to_sheet(vendasData);
        XLSX.utils.book_append_sheet(wb, wsVendas, 'Vendas');

        // Adicionar planilha de produtos
        const wsProdutos = XLSX.utils.json_to_sheet(produtosData);
        XLSX.utils.book_append_sheet(wb, wsProdutos, 'Produtos');

        // Salvar arquivo
        const eventoNome = eventos.find(e => e.id === eventoSelecionado)?.nome || 'relatorio';
        XLSX.writeFile(wb, `relatorio_${eventoNome}.xlsx`);
    };

    const dadosGraficoPagamentos = dadosRelatorio ? {
        labels: Object.keys(dadosRelatorio.vendasPorFormaPagamento).map(fp =>
            fp.charAt(0).toUpperCase() + fp.slice(1)
        ),
        datasets: [{
            data: Object.values(dadosRelatorio.vendasPorFormaPagamento),
            backgroundColor: [
                'rgba(54, 162, 235, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(255, 206, 86, 0.8)',
            ],
        }]
    } : null;

    const dadosGraficoProdutos = dadosRelatorio ? {
        labels: dadosRelatorio.produtosVendidos.map(p => p.nome),
        datasets: [{
            label: 'Valor Total de Vendas',
            data: dadosRelatorio.produtosVendidos.map(p => p.valorTotal),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
        }]
    } : null;

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
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Relatórios</h1>
                        <div className="flex items-center space-x-4">
                            <select
                                value={eventoSelecionado}
                                onChange={(e) => setEventoSelecionado(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Selecione um evento</option>
                                {eventos.map(evento => (
                                    <option key={evento.id} value={evento.id}>
                                        {evento.nome}
                                    </option>
                                ))}
                            </select>
                            {dadosRelatorio && (
                                <button
                                    onClick={exportarParaExcel}
                                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Exportar Excel
                                </button>
                            )}
                        </div>
                    </div>

                    {erro && (
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
                    )}

                    {dadosRelatorio && (
                        <div className="space-y-6">
                            {/* Cards de resumo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Total de Vendas</h3>
                                    <p className="text-3xl font-bold text-indigo-600">
                                        {formatarMoeda(dadosRelatorio.totalVendas)}
                                    </p>
                                </div>
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Itens Vendidos</h3>
                                    <p className="text-3xl font-bold text-indigo-600">
                                        {dadosRelatorio.totalItens}
                                    </p>
                                </div>
                            </div>

                            {/* Gráficos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas por Forma de Pagamento</h3>
                                    {dadosGraficoPagamentos && (
                                        <div className="h-64">
                                            <Pie data={dadosGraficoPagamentos} options={{ maintainAspectRatio: false }} />
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas por Produto</h3>
                                    {dadosGraficoProdutos && (
                                        <div className="h-64">
                                            <Bar
                                                data={dadosGraficoProdutos}
                                                options={{
                                                    maintainAspectRatio: false,
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tabela de vendas */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-lg font-medium text-gray-900">Vendas Realizadas</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
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
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {dadosRelatorio.vendas.map((venda) => (
                                                <tr key={venda.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatarData(venda.dataHora)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
} 