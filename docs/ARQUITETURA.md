# Arquitetura proposta

Documento de planejamento. Nenhum comando de build ou teste existe ainda neste repositório.

## Base

React + TypeScript + Three.js + Vite, como referência do Fusquinha. Fixar versões e lockfile no início da implementação, após verificar compatibilidade atual e licença do código reaproveitado. Não adotar a versão antiga do Three apenas por cópia automática.

Aplicação estática executada no navegador do visitante. O MVP não requer LLM, backend nem GPU de produção permanentemente alocada. Modelagem e processamento de assets são tarefas separadas e delimitadas.

## Organização sugerida

```text
src/
  app/              composição da tela e estados de carregamento
  scene/            cena, câmera, iluminação e renderização
  interactions/     seleção, isolamento, corte e desmontagem
  simulation/       estado determinístico do mecanismo educativo
  content/          catálogo, explicações, vídeos e fontes
  ui/               controles HTML acessíveis
  styles/           tokens do ovictorlab e layout
public/
  models/           somente arquivos com entrega web autorizada
  audio/            sons licenciados, carregados sob demanda
  fonts/            fontes locais e respectivas licenças
```

Criar só o que o piloto utilizar. Começar independente; extrair um pacote compartilhado depois que o segundo projeto comprovar reutilização concreta.

## Contratos

- Peça: `id`, `label`, `groupId`, nós do modelo, pose de origem, descrição e referências. IDs estáveis entre atualizações.
- Seleção: um catálogo determina o que pode ser selecionado; elementos auxiliares não capturam clique por acidente.
- Desmontagem: transformação deriva de pose de origem e progresso 0–1; nunca acumula deslocamento a cada frame. Corte e desmontagem são modos distintos.
- Mecanismo: estado serializável, limites explícitos, pausa e reset. Tempo de animação não depende de quantidade de frames.
- Fontes: título, instituição/autor, URL, data de consulta, afirmação suportada e limite. Texto da interface aponta para esse catálogo.
- Áudio: inicia após gesto, tem volume/mute e para com cena oculta ou mecanismo desligado.

## O que avaliar no Fusquinha

`src/VehicleScene.tsx`: renderização/câmera/seleção. `src/catalog.ts`: agrupamento. `src/layout.ts`: posições e enquadramento. `src/vehicle-rig.ts`: pivôs e articulação. `src/vehicle-sounds.ts`: áudio. `src/engine-motion.ts`: movimento e pausa. Esses arquivos são referências de implementação, não garantem uma biblioteca pronta para outros objetos.

Antes de copiar, conferir responsabilidades, licenças e dependências. Motor, material, cenário e GLB do Fusquinha não pertencem automaticamente ao novo projeto.

## Orçamento inicial de desempenho

Metas propostas a validar no primeiro protótipo, não resultados já medidos:

- Cena em aproximadamente 30 fps durante interação no dispositivo móvel de referência registrado.
- Renderização sob demanda quando parada; suspender trabalho em aba oculta.
- Começar com DPR limitado a 1,5 no celular, texturas de 1K quando suficientes e cena progressiva. Ajustar por medição visual e de memória.
- Buscar até 10 MB comprimidos para a primeira cena útil; qualquer exceção precisa de comparação antes/depois e carregamento progressivo.
- Medir modelo, texturas, draw calls e tempo até o primeiro controle utilizável. Evitar simulação física genérica quando uma cinemática determinística explica o fenômeno.

## Entrega futura

Build estático com caminhos relativos ou base configurável; testar recarga direta e hospedagem em subpasta. Integração com ovictorlab.com pode usar rota ou link, a decidir quando houver aplicação pronta. Não alterar o site principal durante o desenvolvimento inicial.

Captura PNG é uma possibilidade herdada do Fusquinha. Presets de câmera 16:9 e 9:16 e tour guiado são extensões planejadas; não estão implementados. Gravar vídeo exige validar o método de captura e sincronização do som.

## Implementação específica

Geometria: Modelo procedural de uma tipologia simples; forma indeformada e forma de comparação separadas, com nomes estáveis dos elementos.

Estado proposto: `loadPosition e loadLevel determinam uma configuração estável; reset restaura carga e forma; animation não altera hipóteses do modelo.`

Invariantes que devem orientar código e testes:

- O tipo de apoio e a forma deformada são coerentes com a tipologia e hipóteses escolhidas.
- A ampliação visual aparece na interface e não pode ser confundida com deslocamento real.
- Não fornecer dimensionamento, capacidade segura ou diagnóstico de ponte existente.
