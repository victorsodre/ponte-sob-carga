# Apuração — ponte sob carga

Consulta em 07/11/2026. Ponte genérica de vigas, um vão, interpretada como **uma viga equivalente Euler–Bernoulli**, simplesmente apoiada, rigidez EI constante, pequenas deformações e elasticidade linear. Uma carga pontual móvel; o caminhão é sua representação cenográfica. Não representa uma ponte real.

## Fontes e limites

- [MIT OpenCourseWare, Louis Bucciarelli, Solid Mechanics, capítulo 10](https://live.ocw.mit.edu/courses/1-050-solid-mechanics-fall-2004/f9a4d5764b9b0f51ffaacbdf69f7aed8_emech10_04.pdf): relação momento/curvatura, pp. 263–264; carga concentrada, p. 269; expressão para carga fora do centro, p. 304 (página 42 do PDF). As páginas 269 e 304 foram conferidas visualmente. A implementação usa a solução analítica adimensional abaixo.
- [FHWA, LTBP, capítulo 4, Bearings](https://www.fhwa.dot.gov/publications/research/infrastructure/structures/ltbp/14052/004.cfm): apoios podem permitir rotação e movimento longitudinal. O desenho usa símbolos didáticos de articulação/rolete; não especifica um aparelho de apoio comercial. Juntas ilustram a separação entre tabuleiro e acesso.
- [WisDOT Bridge Manual, capítulo 28, Expansion Devices](https://wisconsindot.gov/dtsdManuals/strct/manuals/bridge/ch28.pdf), julho de 2025, Tabela 28.1-1: aço 0,0000065 por °F (≈ 0,0117 mm por metro por °C). Também 28.1.2: a estrutura dilata a partir dos pontos fixos em direção às juntas. Consultado em 09/11/2026.
- [DNIT 010/2024-PRO, Inspeções em pontes e viadutos](https://www.gov.br/dnit/pt-br/assuntos/planejamento-e-pesquisa/ipr/coletanea-de-normas/coletanea-de-normas/procedimento-pro/dnit_010_2024_pro.pdf): itens 5.1.4 (encontros e fundações; paredes dos encontros sob pressão dos aterros de acesso), 5.1.5 (apoios intermediários: pilares), 5.1.2 (lajes de transição e juntas entre acessos e ponte), 5.1.6 (aparelhos elastoméricos) e 5.1.9 (juntas de dilatação livres de detritos). Base do nome **Encontros e fundações**. Consultado em 09/11/2026.
- Roteiro do EP231 (b05–b09, b12): coeficiente arredondado de 0,01 mm/m/°C, conta da Rio–Niterói (848 m, 30 °C, ~30 cm, marcada como conta), pentes que se aproximam no calor e apoio de borracha com chapas de aço.

## Equação implementada

Posição normalizada da carga `a ∈ [0,1]`; ponto da viga `s=x/L`; intensidade `u ∈ [0,1]`. Adota-se **β = PL²/EI = 0,024u**, escolhido pelo autor para demonstrar uma resposta pequena, sem unidade física ou calibração de ponte existente.

Deflexão para baixo, como fração do vão:

- Para `s≤a`: `d/L = -β(1-a)s[1-(1-a)²-s²]/6`.
- Para `s>a`: usar simetria, trocando `s→1-s` e `a→1-a` na expressão anterior.
- Carga central: `d(L/2)/L = -β/48`.
- Reações normalizadas: `R_A/P_ref = u(1-a)` e `R_B/P_ref = ua`. Obtidas por equilíbrio estático.

O desenho tem vão de 16 unidades de cena. A visualização multiplica apenas a deflexão por **1, 40 ou 80**. Em intensidade máxima central, a deflexão base é 0,008 unidade; a ampliada ×80 é 0,64. Isso não é medida real. Comparação conserva a referência original. Reações e posição não mudam ao ampliar.

## Flecha perto do apoio

Flecha máxima para carga em `a`, como fração da flecha com a carga no centro: `48·b·(1−b²)^{3/2} / (9√3)`, com `b = min(a, 1−a)`. Em 5% do vão dá ~15%. Motivo mostrado na tela: a carga perto do apoio desce quase toda para ele (reação 95%) e o momento sob a carga, `a(1−a)`, é pequeno. O perfil no painel usa escala fixa (carga máxima no centro = altura cheia) e a curva tracejada da carga no centro como referência, para a diferença ficar legível em qualquer ampliação. Além de cada apoio, a saliência de 0,35 unidade segue a reta tangente à ponta, sem carga própria.

## Dilatação e junta

`ΔL = α·L·ΔT` com α = 0,0000117/°C, a partir do apoio fixo (esquerdo): `u(x) = (x + L/2)·α·ΔT·fator`. O fator visual é o mesmo da deformação (1/40/80). Faixa de ΔT: ±15 °C em torno da referência, os 30 °C de madrugada fria a tarde de sol da conta do vídeo; não é a faixa de projeto do WisDOT (−30 a 120 °F para aço). Junta do lado do rolete: abertura de referência 0,42 unidade; pentes com raiz recuada 0,22 e dentes de 0,6, sem colisão nem perda de sobreposição em toda a faixa (teste). O rolete anda metade do deslocamento do assento. Ciclo do dia: ΔT = −15·cos(2πt/12 s), ilustrativo. Texto da tela: mm a cada 100 m de aço (conta direta) e os ~30 cm da Rio–Niterói citados como conta do vídeo. Sem retração, fluência, atrito de apoio ou clima real.

## O que não está simulado

Peso próprio, duas cargas de eixo, inércia, vibração, velocidade dinâmica, vento, temperatura real ou gradiente térmico, fadiga, plastificação, ruptura, deformação por cisalhamento, distribuição transversal ou dimensionamento dos pilares. Duas vigas visuais seguem a mesma curva equivalente; isso não é análise de grelha. Apoios permanecem na cota original, com rotação ilustrada nos assentos. Não há mapa de tensão, capacidade segura ou diagnóstico de estrutura real. Nenhum PDF/imagem de referência é distribuído no app.
