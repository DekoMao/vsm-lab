# Instalação e execução

Requisitos: Git, Node.js 22.9 ou superior e npm. Não há dependências externas de produção.

```bash
git clone https://github.com/DekoMao/vsm-lab.git
cd vsm-lab
npm ci
npm test
npm start
```

Abra `http://127.0.0.1:4173/`. `npm start` gera `dist/` antes de iniciar o servidor. Não abra o HTML por `file://`: módulos JavaScript precisam ser servidos por HTTP.

## Configuração opcional

Copie `.env.example` para `.env` e ajuste `PORT`. Esse arquivo fica fora do Git. Nenhum token ou senha é necessário.

## Hospedagem estática

```bash
npm run build
```

Publique apenas o conteúdo de `dist/`. As referências relativas permitem hospedagem em subdiretórios. GitHub Pages é opcional e não é ativado por este projeto. O workflow executa testes e build, sem publicar.

## Conferência manual

1. Confira takt de 70 s/un., 720 un. nos estoques, cobertura de 2 dias e PT de 210 s/un.
2. Digite demanda zero: os cálculos devem ser suspensos. Restaure 360.
3. Crie o futuro proposto e reduza os estoques pela metade: cobertura de 1 dia no futuro e 2 dias no atual.
4. Exporte JSON, SVG e CSV. Importe o JSON e confira os dois cenários.
5. Salve no navegador e recarregue. A cópia local deve ser recuperada.

Salvar e exportar JSON exigem dados válidos nos dois cenários. SVG e CSV representam o cenário ativo. CSV não guarda todo o projeto. A cópia local não é backup em nuvem.

## Limites

Uma família, rota sequencial, 2–8 processos, uma unidade por ciclo e um recurso por processo. Cobertura não é espera medida e PT não é automaticamente valor agregado. Sem cálculo de OEE, PCE, ROI ou capacidade efetiva. Não libera produto.
