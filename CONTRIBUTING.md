# Como contribuir

Abra uma issue descrevendo o problema, o resultado esperado e as premissas de cálculo. Use dados sintéticos para reproduzir o caso. Não envie dados de clientes, fornecedores ou fábricas sem autorização.

1. Faça um fork e crie uma branch para a alteração.
2. Instale Node.js 22.9 ou superior. Não há dependências de produção.
3. Execute `npm ci` e `npm run check`.
4. Inclua testes quando alterar cálculos, validação, importação/exportação ou comportamento de componentes.
5. Confira manualmente o fluxo em `npm start` e descreva a validação no pull request.

Preserve a separação entre takt, cobertura, processamento e lead time observado. Não apresente CT abaixo do takt como prova de capacidade, cobertura como espera medida ou futuro proposto como resultado obtido. Não introduza OEE, PCE ou retorno financeiro sem definir e verificar os dados necessários.

Use português claro na interface, unidades explícitas, contraste legível e identificações de origem. Mantenha as fontes e a autoria dos materiais. Toda contribuição deve ser compatível com a licença MIT.

O aplicativo atual é estático e processa os dados no navegador. Alterações que transmitam dados a serviços externos devem ser explicitadas e discutidas antes da implementação.
