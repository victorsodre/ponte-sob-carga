# Escopo — Ponte sob carga

## Pergunta e resultado esperado

O que muda numa ponte quando um veículo passa? O visitante deve conseguir explicar o mecanismo depois de explorar a cena e acionar seus controles.

Um único tipo estrutural, com apoios, tabuleiro e carga móvel. Deformações ampliadas são identificadas como ilustração e acompanhadas da forma original.

## Conjuntos da primeira versão

- Tabuleiro
- Vigas ou elementos da tipologia escolhida
- Apoios
- Pilares
- Juntas
- Veículo/carga cenográfica

Esses grupos são uma proposta semântica; validar sua correspondência com a geometria e as fontes antes de nomear peças como reais.

## Ações principais

| Controle | Comportamento planejado |
|---|---|
| Mover carga | Desloca o veículo ao longo do vão e atualiza a demonstração. |
| Destacar estrutura | Seleciona os elementos e sua função. |
| Comparar deformação | Alterna forma original e deformação ilustrativa com fator de ampliação visível. |

Base de exploração: órbita, zoom, seleção por lista ou clique, isolamento, reenquadrar e reset. Desmontagem e corte só se aplicam aos conjuntos para os quais forem úteis e tecnicamente coerentes. Som, malha e captura são complementos, posteriores à clareza do mecanismo.

## Estado do mecanismo

`loadPosition e loadLevel determinam uma configuração estável; reset restaura carga e forma; animation não altera hipóteses do modelo.`

## Critérios específicos de conclusão

- O tipo de apoio e a forma deformada são coerentes com a tipologia e hipóteses escolhidas.
- A ampliação visual aparece na interface e não pode ser confundida com deslocamento real.
- Não fornecer dimensionamento, capacidade segura ou diagnóstico de ponte existente.

- A pergunta inicial é respondida por uma interação observável, com texto curto e fontes acessíveis.
- O modelo funciona no desktop e no celular de referência, com reset e fallback conferidos.
- Nenhum botão visível é apenas decorativo ou promete função pendente.

## Fora da primeira versão

- Projeto estrutural, laudo de segurança e reprodução de colapsos reais.
- Várias tipologias e método de elementos finitos genérico na primeira versão.

Ampliações entram no backlog após o piloto, com evidência de uso e esforço. Não incluir funcionalidades só para repetir todas as opções do Fusquinha.
