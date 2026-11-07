# Apuração — ponte sob carga

Consulta em 07/11/2026. Ponte genérica de vigas, um vão, interpretada como **uma viga equivalente Euler–Bernoulli**, simplesmente apoiada, rigidez EI constante, pequenas deformações e elasticidade linear. Uma carga pontual móvel; o caminhão é sua representação cenográfica. Não representa uma ponte real.

## Fontes e limites

- [MIT OpenCourseWare, Louis Bucciarelli, Solid Mechanics, capítulo 10](https://live.ocw.mit.edu/courses/1-050-solid-mechanics-fall-2004/f9a4d5764b9b0f51ffaacbdf69f7aed8_emech10_04.pdf): relação momento/curvatura, pp. 263–264; carga concentrada, p. 269; expressão para carga fora do centro, p. 304 (página 42 do PDF). As páginas 269 e 304 foram conferidas visualmente. A implementação usa a solução analítica adimensional abaixo.
- [FHWA, LTBP, capítulo 4, Bearings](https://www.fhwa.dot.gov/publications/research/infrastructure/structures/ltbp/14052/004.cfm): apoios podem permitir rotação e movimento longitudinal. O desenho usa símbolos didáticos de articulação/rolete; não especifica um aparelho de apoio comercial. Juntas ilustram a separação entre tabuleiro e acesso, sem simulação térmica.

## Equação implementada

Posição normalizada da carga `a ∈ [0,1]`; ponto da viga `s=x/L`; intensidade `u ∈ [0,1]`. Adota-se **β = PL²/EI = 0,024u**, escolhido pelo autor para demonstrar uma resposta pequena, sem unidade física ou calibração de ponte existente.

Deflexão para baixo, como fração do vão:

- Para `s≤a`: `d/L = -β(1-a)s[1-(1-a)²-s²]/6`.
- Para `s>a`: usar simetria, trocando `s→1-s` e `a→1-a` na expressão anterior.
- Carga central: `d(L/2)/L = -β/48`.
- Reações normalizadas: `R_A/P_ref = u(1-a)` e `R_B/P_ref = ua`. Obtidas por equilíbrio estático.

O desenho tem vão de 16 unidades de cena. A visualização multiplica apenas a deflexão por **1, 40 ou 80**. Em intensidade máxima central, a deflexão base é 0,008 unidade; a ampliada ×80 é 0,64. Isso não é medida real. Comparação conserva a referência original. Reações e posição não mudam ao ampliar.

## O que não está simulado

Peso próprio, duas cargas de eixo, inércia, vibração, velocidade dinâmica, vento, temperatura, fadiga, plastificação, ruptura, deformação por cisalhamento, distribuição transversal ou dimensionamento dos pilares. Duas vigas visuais seguem a mesma curva equivalente; isso não é análise de grelha. Apoios permanecem na cota original, com rotação ilustrada nos assentos. Não há mapa de tensão, capacidade segura ou diagnóstico de estrutura real. Nenhum PDF/imagem de referência é distribuído no app.
