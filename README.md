# Sistema de Gerenciamento de Eventos

Sistema para gerenciamento de eventos, vendas e controle de estoque.

## Requisitos

- Node.js (versão 18 ou superior)
- npm (gerenciador de pacotes do Node.js)
- PostgreSQL (banco de dados)

## Instalação

1. **Instale o Node.js**
   - Acesse [nodejs.org](https://nodejs.org)
   - Baixe e instale a versão LTS (Long Term Support)

2. **Instale o PostgreSQL**
   - Acesse [postgresql.org](https://www.postgresql.org/download/)
   - Baixe e instale o PostgreSQL
   - Durante a instalação, anote a senha que você definir para o usuário 'postgres'

3. **Clone o repositório**
   ```bash
   git clone [URL_DO_REPOSITORIO]
   cd [NOME_DO_REPOSITORIO]
   ```

4. **Instale as dependências**
   ```bash
   npm install
   ```

5. **Configure o banco de dados**
   - Crie um arquivo `.env` na raiz do projeto
   - Copie o conteúdo do arquivo `.env.example` para o `.env`
   - Atualize as variáveis de ambiente com suas configurações:
     ```
     DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/buriti"
     ```

6. **Execute as migrações do banco de dados**
   ```bash
   npx prisma migrate dev
   ```

## Executando a aplicação

1. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

2. **Acesse a aplicação**
   - Abra seu navegador
   - Acesse [http://localhost:3000](http://localhost:3000)

## Funcionalidades

- Login com diferentes níveis de acesso (admin e caixa)
- Gerenciamento de eventos
- Controle de estoque
- Sistema de vendas
- Impressão de cupons fiscais

## Dicas

- O primeiro usuário criado será automaticamente um administrador
- Use o modo caixa para realizar vendas
- O modo admin permite gerenciar eventos e produtos
