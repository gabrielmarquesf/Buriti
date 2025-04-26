import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function GET() {
    try {
        // Limpar o banco de dados
        await limparBancoDados();

        // Criar usuários
        const usuarios = await criarUsuarios();

        // Criar categorias
        const categorias = await criarCategorias();

        // Criar produtos
        const produtos = await criarProdutos(categorias);

        // Criar evento
        const evento = await criarEvento();

        // Associar produtos ao evento
        const produtosEvento = await associarProdutosAoEvento(produtos, evento);

        // Criar algumas vendas
        const vendas = await criarVendas(evento, produtosEvento);

        return NextResponse.json({
            message: 'Banco de dados populado com sucesso',
            dados: {
                usuarios: usuarios.length,
                categorias: categorias.length,
                produtos: produtos.length,
                eventos: 1,
                produtosEvento: produtosEvento.length,
                vendas: vendas.length
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Erro ao popular banco de dados:', error);
        return NextResponse.json(
            { error: 'Erro ao popular banco de dados', details: String(error) },
            { status: 500 }
        );
    }
}

async function limparBancoDados() {
    // Excluir registros em ordem para evitar problemas de chave estrangeira
    await prisma.vendaItem.deleteMany({});
    await prisma.venda.deleteMany({});
    await prisma.produtoEvento.deleteMany({});
    await prisma.evento.deleteMany({});
    await prisma.produto.deleteMany({});
    await prisma.categoriaProduto.deleteMany({});
    await prisma.usuario.deleteMany({});
}

async function criarUsuarios() {
    const senhaAdmin = await hash('admin123', 10);
    const senhaCaixa = await hash('caixa123', 10);

    const usuarios = [
        {
            nome: 'Administrador',
            email: 'admin@casaburiti.com.br',
            senha: senhaAdmin,
            papel: 'admin'
        },
        {
            nome: 'Caixa',
            email: 'caixa@casaburiti.com.br',
            senha: senhaCaixa,
            papel: 'caixa'
        }
    ];

    return await Promise.all(
        usuarios.map(user =>
            prisma.usuario.create({
                data: user
            })
        )
    );
}

async function criarCategorias() {
    const categorias = [
        { nome: 'Comidas', descricao: 'Alimentos preparados' },
        { nome: 'Bebidas', descricao: 'Bebidas diversas' },
        { nome: 'Doces', descricao: 'Sobremesas e guloseimas' },
        { nome: 'Artesanato', descricao: 'Produtos artesanais' }
    ];

    return await Promise.all(
        categorias.map(cat =>
            prisma.categoriaProduto.create({
                data: {
                    nome: cat.nome,
                    descricao: cat.descricao
                }
            })
        )
    );
}

async function criarProdutos(categorias: any[]) {
    const categoriasMap = categorias.reduce((acc, cat) => {
        acc[cat.nome] = cat.id;
        return acc;
    }, {} as Record<string, string>);

    const produtos = [
        { nome: 'Caldo de Mandioca', descricao: 'Caldo quente de mandioca com carne', categoriaId: categoriasMap['Comidas'] },
        { nome: 'Cachorro Quente', descricao: 'Cachorro quente completo', categoriaId: categoriasMap['Comidas'] },
        { nome: 'Pipoca', descricao: 'Saco de pipoca fresca', categoriaId: categoriasMap['Comidas'] },
        { nome: 'Refrigerante Lata', descricao: 'Refrigerante em lata 350ml', categoriaId: categoriasMap['Bebidas'] },
        { nome: 'Água Mineral', descricao: 'Água mineral sem gás 500ml', categoriaId: categoriasMap['Bebidas'] },
        { nome: 'Suco Natural', descricao: 'Suco de frutas natural 300ml', categoriaId: categoriasMap['Bebidas'] },
        { nome: 'Bolo de Chocolate', descricao: 'Fatia de bolo de chocolate', categoriaId: categoriasMap['Doces'] },
        { nome: 'Brigadeiro', descricao: 'Brigadeiro caseiro', categoriaId: categoriasMap['Doces'] },
        { nome: 'Pulseira Artesanal', descricao: 'Pulseira feita pelos alunos', categoriaId: categoriasMap['Artesanato'] },
        { nome: 'Ímã de Geladeira', descricao: 'Ímã decorativo para geladeira', categoriaId: categoriasMap['Artesanato'] }
    ];

    return await Promise.all(
        produtos.map(prod =>
            prisma.produto.create({
                data: {
                    nome: prod.nome,
                    descricao: prod.descricao,
                    categoriaId: prod.categoriaId
                }
            })
        )
    );
}

async function criarEvento() {
    return await prisma.evento.create({
        data: {
            nome: 'Festa Junina Casa Buriti 2024',
            dataInicio: new Date('2024-06-15T18:00:00'),
            dataFim: new Date('2024-06-15T23:00:00'),
            descricao: 'Festa junina anual da Casa Buriti com comidas típicas e brincadeiras.',
            status: 'ativo'
        }
    });
}

async function associarProdutosAoEvento(produtos: any[], evento: any) {
    const precos = {
        'Caldo de Mandioca': 12.0,
        'Cachorro Quente': 8.0,
        'Pipoca': 5.0,
        'Refrigerante Lata': 6.0,
        'Água Mineral': 4.0,
        'Suco Natural': 7.0,
        'Bolo de Chocolate': 6.0,
        'Brigadeiro': 3.0,
        'Pulseira Artesanal': 15.0,
        'Ímã de Geladeira': 10.0
    };

    const estoques = {
        'Caldo de Mandioca': 50,
        'Cachorro Quente': 100,
        'Pipoca': 150,
        'Refrigerante Lata': 200,
        'Água Mineral': 200,
        'Suco Natural': 80,
        'Bolo de Chocolate': 60,
        'Brigadeiro': 120,
        'Pulseira Artesanal': 30,
        'Ímã de Geladeira': 40
    };

    return await Promise.all(
        produtos.map(prod =>
            prisma.produtoEvento.create({
                data: {
                    produtoId: prod.id,
                    eventoId: evento.id,
                    preco: precos[prod.nome as keyof typeof precos] || 10.0,
                    estoque: estoques[prod.nome as keyof typeof estoques] || 50
                }
            })
        )
    );
}

async function criarVendas(evento: any, produtosEvento: any[]) {
    // Criar 5 vendas aleatórias
    const formasPagamento = ['dinheiro', 'cartão', 'pix'];
    const vendas = [];

    for (let i = 0; i < 5; i++) {
        // Selecionar de 1 a 3 produtos aleatórios para a venda
        const numItens = Math.floor(Math.random() * 3) + 1;
        const itensSelecionados = [];
        let valorTotal = 0;

        // Embaralhar os produtos
        const produtosEmbaralhados = [...produtosEvento].sort(() => Math.random() - 0.5);

        for (let j = 0; j < numItens; j++) {
            if (j < produtosEmbaralhados.length) {
                const produtoEvento = produtosEmbaralhados[j];
                const quantidade = Math.floor(Math.random() * 3) + 1;
                const precoUnitario = produtoEvento.preco;

                itensSelecionados.push({
                    produtoEventoId: produtoEvento.id,
                    quantidade,
                    precoUnitario
                });

                valorTotal += quantidade * precoUnitario;
            }
        }

        // Criar a venda
        const venda = await prisma.venda.create({
            data: {
                eventoId: evento.id,
                dataHora: new Date(Date.now() - Math.floor(Math.random() * 86400000)), // Até 24h atrás
                valorTotal,
                formaPagamento: formasPagamento[Math.floor(Math.random() * formasPagamento.length)],
                status: 'concluida',
                itens: {
                    create: itensSelecionados.map(item => ({
                        produtoEventoId: item.produtoEventoId,
                        quantidade: item.quantidade,
                        precoUnitario: item.precoUnitario
                    }))
                }
            }
        });

        vendas.push(venda);
    }

    return vendas;
}