# Validação — 07/11/2026

Desenvolvimento concluído para o escopo local. **8 testes e 106 verificações de navegador aprovados.** Sem deploy público ou posts enviados.

## Ambiente e comandos

Mac de Victor, Node 26.7.0, npm 11.19.0; Chrome com Playwright isolado `ovl-dev`. `npm ci --offline --no-audit --no-fund`, `npm test`, `npm run check`, `npm run build`. Vite local e build estático servido em `/ponte-sob-carga/`, com recarga direta. Não usa a 5090 nem o pipeline de vídeos.

## Evidências

- 8 testes: equilíbrio de forças/momentos e extremos fixos; solução central conhecida, linearidade e simetria; continuidade de deslocamento/inclinação e relação momento/curvatura por diferenças finitas; ampliação apenas visual; estado/tempo/pausa/fim; geometria reversível sem deriva e referência original; veículo/superfície e pilares fixos; seis grupos e câmera em quatro proporções. São oito casos, agrupando essas afirmações.
- 73 checks de interação: posição, intensidade nula/parcial/máxima, três etapas, travessia/pausa/fim/recomeço; reações, três vistas, três fatores e suas legendas, reset; seleção/foco/isolamento/retorno dos seis grupos; busca/tour, malha, zoom, órbita/clique reais, PNG, fontes, movimento reduzido e larguras 360/390/844 px.
- 28 checks de produção: subpasta/recarga, visibilidade simulada/retomada, teclado/Escape/R, PNG, cinco licenças locais, recursos sem requisições externas, fallback WebGL/perda de contexto e ausência de erros JS/HTTP no fluxo.
- 5 checks finais: duas exportações após ajuste da referência tracejada, câmera restaurada, exportação original e ×40. Testes, TypeScript e build refeitos após essa mudança de geometria.
- Capturas reais inspecionadas: desktop, móvel, horizontal/vertical. Primeiro screenshot móvel foi capturado durante resize e ficou vazio; nova captura após a renderização mostrou a cena, com largura do documento/canvas conferidas. O roteiro passou a esperar a atualização antes da captura final.
- A referência de comparação foi alinhada às bordas originais do tabuleiro. Reações de 37,5% permanecem fracionárias, evitando soma visual de 76% para uma carga de 75%.

Logs e imagens em `output/`, ignorados pelo Git: `tests.log`, `check.log`, `build.log`, `browser-qa.log`, `production-qa.log`, `export-qa.log`, `desktop-final.png`, `mobile-final.png`, `final-landscape.png`, `final-portrait.png`, `original.png`, `factor40.png`. Scripts transitórios `/private/tmp/bridge-*-qa.js`; roteiro durável em MANUTENCAO.md.

## Medidas observadas

| Medida | Resultado |
|---|---|
| JavaScript final | 828.447 bytes, aproximadamente 224 kB gzip |
| CSS | 24.035 bytes |
| `dist/` inteiro | 1.091.674 bytes, incluindo fontes/licenças |
| Cena inicial final | 110 draw calls, 40.174 triângulos; contador inclui passes |
| Primeiro controle | 373 ms em observação local com cache; não é benchmark de rede |
| PNG | 1920×1080 e 1080×1920, marca e fator/forma atual |
| Repouso | Contador estabilizado; aba oculta suspende relógio/renderização |

Aviso Vite de chunk acima de 500 kB permanece: Three.js domina o pacote. Total abaixo da meta inicial de 10 MB. Limite de 30 Hz é limite de trabalho, não promessa de FPS em celulares.

## Limites do aceite

Celular emulado no Chrome do Mac; sem ensaio físico/Safari. Modelo educativo idealizado, uma viga equivalente/carga pontual, sem peso próprio, dinâmica, ruptura ou análise transversal. Não é ferramenta de dimensionamento, capacidade segura ou diagnóstico real. APURACAO.md documenta equação, parâmetro autoral e fontes. Nenhuma medição de uso público ou crescimento social.
