# Arquitetura implementada

React 19.2.6, TypeScript 5.9.3, Three.js 0.187.0, Vite 8.3.6. Lockfile versionado, Node ≥22.18. Aplicação estática, `base: './'`; sem backend, LLM, analytics ou recursos remotos no carregamento.

## Responsabilidades

- `simulation/beam.ts`: estado de posição/intensidade/temperatura, limites, relógio da travessia e do ciclo do dia, reações, solução analítica da viga simplesmente apoiada, razão da flecha máxima e dilatação térmica. Equações/hipóteses em APURACAO.md.
- `scene/model.ts`: seis grupos, tabuleiro segmentado com saliência além dos apoios, duas vigas visuais, apoios articulado/móvel, encontros com cortina, alas e aterro, juntas de pente (uma metade presa ao tabuleiro) e caminhão autorais; margens, leito e rio em corte fora do catálogo. Guarda posições originais dos vértices.
- `scene/rig.ts`: aplica deslocamentos a partir dos vértices originais, atualiza normais/limites, posição e inclinação do veículo, assentos, pente móvel, rolete (metade do deslocamento) e setas sólidas. Nunca acumula deformação.
- `scene/runtime.ts`: câmera (enquadramento próprio para retrato), órbita, picking só por toque curto, rótulos das reações sobre a cena, isolamento, modo malha, renderização sob demanda, recuperação por recarga após perda de contexto. Resize, tela cheia, isolar e aproximar preservam a direção da órbita; só Reenquadrar volta à vista padrão. Rodinha rola a página (Ctrl/⌘ + rodinha aproxima) e o canvas usa `touch-action: pan-y`.
- `scene/camera.ts`/`capture.ts`: enquadramento e PNG 1920×1080 ou 1080×1920 com marca e fator visual atual. Câmera restaurada após captura.
- `App.tsx`: relógio e UI, busca, tour, teclado, reset, movimento reduzido e modais. `content/`: catálogo e fontes. `ui/`: abas Carga/Temperatura (`BridgeControls`), perfil da flecha em escala fixa (`DeflectionProfile`) e fontes; marca e coleção vêm de `src/kit/` (cópia gerada do lab-kit, não editar). `styles.css`: identidade e responsividade.

## Contratos

`BeamState = {loadPosition, loadLevel, temperature}`: posição e intensidade entre 0 e 1; ΔT do aço entre −15 e +15 °C. Inicial: centro do vão, intensidade 0,75, comparação ×80, pausado. A travessia avança até 1 e para; novo início no fim retorna a 0. Não há loop automático. Passo temporal limitado a 100 ms; velocidade visual não participa da resposta quase estática.

`ShapeView = original | deformed | compare`; ampliação 1/40/80. Forma original zera somente deslocamento visual. Comparação acrescenta as duas bordas retas originais do tabuleiro. Fator visual não modifica reações ou hipóteses. Entrada HTML limitada e sanitização numérica nas funções públicas.

IDs estáveis: `deck`, `girders`, `bearings`, `abutments` (antes `piers`), `joints`, `vehicle`. Duas vigas desenhadas seguem uma curva equivalente; nenhuma distribuição transversal é inferida. Somente tabuleiro/vigas deformam e dilatam; encontros e acessos ficam fixos. Apoios permanecem na cota de origem, assentos inclinam ilustrativamente. Veículo acompanha os pontos da superfície sob os eixos cenográficos, embora o cálculo use uma única força resultante.

## Desempenho e operação

DPR ≤1,5; sombra 1024²; atualização limitada a 30 Hz. Geometria autoral leve, estáticos agrupados, deformação determinística. Cena não renderiza continuamente em repouso e suspende em aba oculta. Limite de frequência não é garantia de FPS móvel. Medidas em VALIDACAO.md.

Fontes e licenças locais; créditos acessíveis mesmo sem WebGL. PNG guarda marca, legenda de forma/fator e modelo idealizado. Sem som. Publicação depende de autorização própria; nenhum deploy no push. Reuso de UI/câmera da coleção do usuário; site principal e Fusquinha preservados.
