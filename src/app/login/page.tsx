'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModoOperacao, setModoOperacao } from '@/lib/db';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                // Define o modo de operação com base no papel do usuário
                const modo = data.papel === 'admin' ? ModoOperacao.ADMIN : ModoOperacao.CAIXA;
                await setModoOperacao(modo);

                // Redirecionar com base no papel do usuário
                if (data.papel === 'admin') {
                    router.replace('/eventos');
                } else {
                    router.replace('/caixa');
                }
            } else {
                setErro(data.error || 'Erro ao fazer login');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setErro('Erro ao conectar ao servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h1 className="text-center text-3xl font-bold text-indigo-600">Casa Buriti</h1>
                    <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                        Faça login na sua conta
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="senha" className="sr-only">Senha</label>
                            <input
                                id="senha"
                                name="senha"
                                type="password"
                                required
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Senha"
                            />
                        </div>
                    </div>

                    {erro && (
                        <div className="text-red-600 text-sm text-center">
                            {erro}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 