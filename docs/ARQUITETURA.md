# Arquitetura implementada

React 19.2.6, TypeScript 5.9.3, Three.js 0.187.0, Vite 8.3.6. Lockfile versionado, Node ≥22.18. Aplicação estática, `base: './'`; sem backend, LLM, analytics ou recursos remotos no carregamento.

## Responsabilidades

- `simulation/beam.ts`: estado de posição/intensidade, limites, relógio, reações e solução analítica da viga simplesmente apoiada. Equações/hipóteses em APURACAO.md.
- `scene/model.ts`: seis grupos, tabuleiro segmentado, duas vigas visuais, apoios articulado/móvel, pilares, juntas e caminhão autorais. Guarda posições originais dos vértices.
- `scene/rig.ts`: aplica deslocamentos a partir dos vértices originais, atualiza normais/limites, posição e inclinação do veículo, assentos e setas. Nunca acumula deformação.
- `scene/runtime.ts`: câmera, órbita, picking, isolamento, modo malha, renderização sob demanda, recuperação por recarga após perda de contexto.
- `scene/camera.ts`/`capture.ts`: enquadramento e PNG 1920×1080 ou 1080×1920 com marca e fator visual atual. Câmera restaurada após captura.
- `App.tsx`: relógio e UI, busca, tour, teclado, reset, movimento reduzido e modais. `content/`: catálogo e fontes. `ui/`: controles HTML e marca. `styles.css`: identidade e responsividade.

## Contratos

`BeamState = {loadPosition, loadLevel}`, ambos entre 0 e 1. Inicial: centro do vão, intensidade 0,75, comparação ×80, pausado. A travessia avança até 1 e para; novo início no fim retorna a 0. Não há loop automático. Passo temporal limitado a 100 ms; velocidade visual não participa da resposta quase estática.

`ShapeView = original | deformed | compare`; ampliação 1/40/80. Forma original zera somente deslocamento visual. Comparação acrescenta as duas bordas retas originais do tabuleiro. Fator visual não modifica reações ou hipóteses. Entrada HTML limitada e sanitização numérica nas funções públicas.

IDs estáveis: `deck`, `girders`, `bearings`, `piers`, `joints`, `vehicle`. Duas vigas desenhadas seguem uma curva equivalente; nenhuma distribuição transversal é inferida. Somente tabuleiro/vigas deformam; pilares e acessos ficam fixos. Apoios permanecem na cota de origem, assentos inclinam ilustrativamente. Veículo acompanha os pontos da superfície sob os eixos cenográficos, embora o cálculo use uma única força resultante.

## Desempenho e operação

DPR ≤1,5; sombra 1024²; atualização limitada a 30 Hz. Geometria autoral leve, estáticos agrupados, deformação determinística. Cena não renderiza continuamente em repouso e suspende em aba oculta. Limite de frequência não é garantia de FPS móvel. Medidas em VALIDACAO.md.

Fontes e licenças locais; créditos acessíveis mesmo sem WebGL. PNG guarda marca, legenda de forma/fator e modelo idealizado. Sem som. Publicação depende de autorização própria; nenhum deploy no push. Reuso de UI/câmera da coleção do usuário; site principal e Fusquinha preservados.
