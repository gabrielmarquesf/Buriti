import { PrismaClient } from '@prisma/client';

// Inicializa o cliente Prisma
export const prisma = new PrismaClient();

// Enum para os modos de operação
export enum ModoOperacao {
    ADMIN = 'admin',     // Acesso administrativo completo
    CAIXA = 'caixa'      // Acesso apenas ao caixa de um evento específico
}

// Verifica se o código está sendo executado no navegador
const isBrowser = typeof window !== 'undefined';

// Variável para armazenar o modo de operação atual
let modoOperacaoAtual: ModoOperacao | null = null;
let eventoSelecionadoAtual: string | null = null;

// Função para obter o modo de operação atual
export const getModoOperacao = async (): Promise<ModoOperacao> => {
    // Se estamos no navegador, tenta buscar do localStorage
    if (isBrowser) {
        const modo = localStorage.getItem('modoOperacao') as ModoOperacao;
        if (modo && (modo === ModoOperacao.ADMIN || modo === ModoOperacao.CAIXA)) {
            modoOperacaoAtual = modo;
            return modo;
        }
    }

    // Se não conseguiu do localStorage ou o valor é inválido, usa o valor padrão
    modoOperacaoAtual = ModoOperacao.ADMIN;
    if (isBrowser) {
        localStorage.setItem('modoOperacao', modoOperacaoAtual);
    }
    return modoOperacaoAtual;
};

// Função para verificar se está no modo caixa
export const isCaixa = async (): Promise<boolean> => {
    const modo = await getModoOperacao();
    return modo === ModoOperacao.CAIXA;
};

// Função para verificar se está no modo admin
export const isAdmin = async (): Promise<boolean> => {
    const modo = await getModoOperacao();
    return modo === ModoOperacao.ADMIN;
};

// Função para definir o modo de operação
export const setModoOperacao = async (modo: ModoOperacao, eventoId?: string): Promise<void> => {
    try {
        // Valida o modo de operação
        if (modo !== ModoOperacao.ADMIN && modo !== ModoOperacao.CAIXA) {
            throw new Error('Modo de operação inválido');
        }

        // Atualiza a variável em memória
        modoOperacaoAtual = modo;

        if (eventoId) {
            eventoSelecionadoAtual = eventoId;
        } else if (modo === ModoOperacao.ADMIN) {
            // Limpa o evento selecionado quando muda para modo admin
            eventoSelecionadoAtual = null;
            if (isBrowser) {
                localStorage.removeItem('eventoSelecionado');
            }
        }

        // Salva no localStorage
        if (isBrowser) {
            localStorage.setItem('modoOperacao', modo);
            if (eventoId) {
                localStorage.setItem('eventoSelecionado', eventoId);
            }
        }
    } catch (error) {
        console.error('Erro ao definir modo de operação:', error);
        throw error;
    }
};

// Função para obter o ID do evento selecionado no modo caixa
export const getEventoSelecionado = async (): Promise<string | undefined> => {
    try {
        // Se já temos o evento em memória, verifica se ele ainda existe
        if (eventoSelecionadoAtual) {
            const response = await fetch(`/api/eventos/${eventoSelecionadoAtual}`);
            if (response.ok) {
                return eventoSelecionadoAtual;
            }
            // Se o evento não existe mais, limpa a memória
            eventoSelecionadoAtual = null;
            if (isBrowser) {
                localStorage.removeItem('eventoSelecionado');
            }
        }

        // Tenta buscar do localStorage
        if (isBrowser) {
            const eventoId = localStorage.getItem('eventoSelecionado');
            if (eventoId) {
                // Verifica se o evento ainda existe
                const response = await fetch(`/api/eventos/${eventoId}`);
                if (response.ok) {
                    eventoSelecionadoAtual = eventoId;
                    return eventoId;
                }
                // Se o evento não existe mais, remove do localStorage
                localStorage.removeItem('eventoSelecionado');
            }
        }

        return undefined;
    } catch (error) {
        console.error('Erro ao obter evento selecionado:', error);
        return undefined;
    }
};

// Função para definir o evento selecionado no modo caixa
export const setEventoSelecionado = async (eventoId: string): Promise<void> => {
    try {
        // Atualiza a variável em memória
        eventoSelecionadoAtual = eventoId;

        // Salva no localStorage
        if (isBrowser) {
            localStorage.setItem('eventoSelecionado', eventoId);
        }
    } catch (error) {
        console.error('Erro ao definir evento selecionado:', error);
        throw error;
    }
}; 