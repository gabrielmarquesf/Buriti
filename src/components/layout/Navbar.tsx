'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getModoOperacao, setModoOperacao, ModoOperacao, getEventoSelecionado } from '@/lib/db';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [modoOperacao, setModoOperacaoState] = useState<ModoOperacao>(ModoOperacao.ADMIN);
    const [eventoId, setEventoId] = useState<string | undefined>(undefined);

    // Verifica o modo de operação ao carregar o componente
    useEffect(() => {
        const checkModoOperacao = async () => {
            try {
                const modo = await getModoOperacao();
                setModoOperacaoState(modo);

                if (modo === ModoOperacao.CAIXA) {
                    const eventoSelecionado = await getEventoSelecionado();
                    setEventoId(eventoSelecionado);
                }
            } catch (error) {
                console.error('Erro ao verificar modo de operação:', error);
            }
        };

        checkModoOperacao();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (response.ok) {
                // Limpa o localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('modoOperacao');
                    localStorage.removeItem('eventoSelecionado');
                }

                router.push('/login');
            }
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    // Define os itens de navegação com base no modo de operação
    const getNavItems = () => {
        if (modoOperacao === ModoOperacao.ADMIN) {
            return [
                { name: 'Eventos', href: '/eventos' },
                { name: 'Produtos', href: '/produtos' },
                { name: 'Categorias', href: '/categorias' },
                { name: 'Relatórios', href: '/relatorios' },
            ];
        } else {
            // Modo Caixa - menu simplificado
            return [
                { name: 'Caixa', href: '/caixa' },
                { name: 'Vendas', href: '/vendas' },
            ];
        }
    };

    const navItems = getNavItems();

    // Obtém o texto do modo de operação atual
    const getModoOperacaoText = () => {
        switch (modoOperacao) {
            case ModoOperacao.ADMIN:
                return 'Modo Admin';
            case ModoOperacao.CAIXA:
                return 'Modo Caixa';
            default:
                return 'Modo Desconhecido';
        }
    };

    // Obtém a cor do modo de operação atual
    const getModoOperacaoColor = () => {
        switch (modoOperacao) {
            case ModoOperacao.ADMIN:
                return 'bg-blue-500';
            case ModoOperacao.CAIXA:
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <nav className="bg-indigo-600 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/eventos" className="text-xl font-bold">
                                Casa Buriti
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 ${pathname === item.href
                                        ? 'border-white text-white'
                                        : 'border-transparent text-indigo-100 hover:border-indigo-300 hover:text-white'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <span className={`flex items-center px-3 py-1 rounded-md text-sm font-medium ${getModoOperacaoColor()}`}>
                                {getModoOperacaoText()}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-indigo-100 hover:text-white hover:bg-indigo-700"
                        >
                            Sair
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            <span className="sr-only">Abrir menu principal</span>
                            {isOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu móvel */}
            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === item.href
                                    ? 'bg-indigo-700 border-white text-white'
                                    : 'border-transparent text-indigo-100 hover:bg-indigo-700 hover:border-indigo-300 hover:text-white'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-indigo-100 hover:bg-indigo-700 hover:border-indigo-300 hover:text-white"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
} 