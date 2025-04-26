# Serviço de Impressão Casa Buriti

Este é um serviço local para impressão de cupons fiscais da Casa Buriti. Ele roda como um aplicativo desktop que se comunica com a impressora térmica.

## Requisitos

- Node.js 18 ou superior
- Impressora térmica compatível com ESC/POS
- Windows 10 ou superior

## Instalação

1. Clone este repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure sua impressora:
   - Abra o arquivo `src/main.js`
   - Localize a configuração da impressora
   - Altere o valor de `interface` para o nome da sua impressora
   ```javascript
   const printer = new ThermalPrinter({
     type: PrinterTypes.EPSON,
     interface: 'printer:SUA_IMPRESSORA', // Altere aqui
     // ...
   });
   ```

4. Execute o serviço:
```bash
npm start
```

5. Para criar um executável:
```bash
npm run build
```
O executável será criado na pasta `dist`.

## Uso

O serviço roda na porta 3001 e expõe um endpoint POST `/print` que aceita um objeto com os dados da venda:

```javascript
{
  "venda": {
    "evento": {
      "nome": "Nome do Evento"
    },
    "itens": [
      {
        "produto": {
          "nome": "Nome do Produto"
        },
        "quantidade": 2,
        "valor": 10.50
      }
    ],
    "valorTotal": 21.00,
    "formaPagamento": "Dinheiro"
  }
}
```

Para imprimir um cupom, envie uma requisição POST para `http://localhost:3001/print` com os dados da venda.

## Integração com o Sistema Principal

No sistema principal, após finalizar uma venda, faça uma requisição para o serviço de impressão:

```typescript
const imprimirCupom = async (venda: Venda) => {
  try {
    const response = await fetch('http://localhost:3001/print', {
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
    // Trate o erro adequadamente
  }
};
```

## Suporte

Para problemas com a impressão:
1. Verifique se o serviço está rodando (ícone na bandeja do sistema)
2. Verifique se a impressora está conectada e ligada
3. Verifique se o nome da impressora está configurado corretamente
4. Reinicie o serviço se necessário 