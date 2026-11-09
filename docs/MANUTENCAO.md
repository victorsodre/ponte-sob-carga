# Manutenção e validação

## Antes de cada entrega

1. Ler DECISOES.md, APURACAO.md e VALIDACAO.md. Atualizar fontes antes de mudar fatos/equações.
2. Executar `npm ci`, `npm test`, `npm run check`, `npm run build`; revisar diff e créditos.
3. Em desktop e móvel: posição nos dois apoios e no centro, intensidade 0/50/100%, vistas original/deformada/comparação, fatores 1/40/80, pausa/fim/reset. Aba Temperatura: −15/0/+15 °C, ciclo do dia, pausa, “Ver a junta de perto”; pentes sem colisão. Girar, redimensionar e entrar em tela cheia sem perder a órbita; tocar no modelo durante a travessia não a pausa; a página rola por cima do canvas no celular.
4. Conferir equilíbrio: reações somam a intensidade relativa; carga no centro distribui igualmente. Ampliar a imagem não muda reações. No zero, deformação e setas de força somem.
5. Selecionar/isolar/reaproximar/retornar os seis grupos, buscar com acentos, completar tour, usar clique e teclado. Verificar movimento reduzido.
6. Conferir cena/capturas reais em 1440×900, 390×844, 360×800 e horizontal. Registrar aparelho/navegador; emulação não substitui teste físico.
7. Exportar PNG horizontal e vertical em original e comparação; validar marca, fator atual, objeto inteiro e restauração da câmera.
8. Servir `dist/` em subpasta; testar recarga, recursos/fontes/licenças locais, fallback sem WebGL, perda de contexto e pausa em aba oculta.

## Invariantes de regressão

- Apoios sem deslocamento vertical; rotação livre na idealização. Acessos/encontros não deformam. Apoio fixo à esquerda não desliza; a dilatação parte dele.
- Fórmula contínua na carga e simétrica quando carga é espelhada; solução central `-β/48`, linearidade e relação momento/curvatura conferidas em testes.
- Deformação parte dos vértices de origem, sem deriva. Referência tracejada permanece na forma original.
- Caminhão é cenográfico; não apresentar resultado como cálculo de duas cargas de eixo, tonelagem real ou capacidade segura.
- Não inserir ruptura, impacto, mapa de tensão ou tipologia diferente sem nova apuração e mudança explícita do escopo.

## Dependências, publicação e reversão

Ao atualizar Three/Vite/React: repetir testes/build e fluxos críticos, comparar imagens e orçamento. Atualização de marca começa no guia e nos tokens oficiais. Logs e capturas ficam em `output/`, ignorado pelo Git; resumo durável em VALIDACAO.md.

Publicação autorizada em 08/11/2026, com workflow de testes/build e deploy no GitHub Pages. Procedimento, URL e reversão em [PUBLICACAO.md](PUBLICACAO.md). Não publicar POSTAGENS-X.md automaticamente.

Medição pública, se solicitada, pode observar primeira interação, uso da comparação e clique no vídeo; views históricas não medem uso do aplicativo. Não coletar dados pessoais sem necessidade.
