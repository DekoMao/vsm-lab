# Arquitetura e verificação

Aplicação estática em HTML, CSS e módulos JavaScript, sem dependências de produção, login ou banco de dados.

| Parte | Responsabilidade |
|---|---|
| `src/domain/vsm.js` | Exemplo, validação, cálculos e exportação SVG/CSV |
| `src/index.js` | Interface, cenários, importação/exportação e armazenamento local |
| `src/components/botao.js` | Botão com texto seguro, nome acessível e evento de clique |
| `src/styles/estilo.css` | Visual industrial, responsividade e impressão |
| `scripts/build.js` | Empacotamento estático em `dist/` |
| `scripts/serve.js` | Servidor local em `127.0.0.1` |

## Cálculos

- Takt (s/un.) = tempo líquido (min/dia) × 60 ÷ demanda (un./dia).
- Estoque (un.) = estoques anteriores de cada processo + estoque final.
- Cobertura (dias equivalentes de demanda) = estoque ÷ demanda diária.
- Processamento (s/un.) = soma de PT da rota sequencial.
- Lead time observado (minutos decorridos) é informado separadamente.

CT acima do takt é uma comparação sob as premissas do modelo. Setup e disponibilidade são contexto. Não há cálculo automático de capacidade. O futuro é independente do atual e não é melhoria comprovada.

## Dados

O JSON v1 contém `current`, `future` e `active`. A importação valida os dois cenários. SVG escapa textos; CSV protege entradas com prefixos de fórmula. Esses controles não equivalem a uma auditoria de segurança.

O projeto é salvo em `localStorage` somente por comando do usuário. Os campos são processados no navegador, sem envio pelo aplicativo a serviços externos. A hospedagem pode manter registros de acesso HTTP próprios.

## Verificação

Testes automatizados verificam exemplo, limites, dados ausentes/inválidos, independência dos cenários, importação e escapes. Os testes do botão usam documento simulado e não substituem navegação real.

O site original foi conferido em navegador desktop para edição, inclusão/remoção de processo, exportação e salvamento. A reorganização precisa também da conferência manual descrita no guia. Não há teste automatizado de ponta a ponta nem validação em dispositivo móvel incluídos.
